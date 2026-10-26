import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {surveyStore,splitNote,progressOf} from './survey.mjs';
import {verificationOf,verificationText,validCalendarDate} from './public/verification-core.js';
import {normalizeNumeric} from './public/survey-validation.js';
import {joinDetails,cleanLegacyCart} from './public/request-core.js';
import {normalizeRequest} from './parts-request.mjs';
import {inventorySummary} from './inventory.mjs';

const sample='---\nid: B32\nmarca: HIDROMAC\nmodelo: 2196\nplaca_serie: ""\nrpm: 1750\norings: []\nverificado_por: Registro histórico\nfecha_verificacion: 2026-10-06\n---\n# B32\n';
const input=extra=>({date:'2026-10-26',author:'Persona de prueba',...extra});
async function fixture(t,options){
 const vault=await mkdtemp(path.join(os.tmpdir(),'auditoria-vocatus-'));t.after(()=>rm(vault,{recursive:true,force:true}));
 const file=path.join(vault,'00-Proyecto/equipos/B32.md');await mkdir(path.dirname(file),{recursive:true});await writeFile(file,sample);
 return {vault,file,store:surveyStore(vault,options),note:async()=>splitNote(await readFile(file,'utf8')).data};
}
test('observación sola conserva el registro histórico pero no verifica ningún alcance',async t=>{
 const f=await fixture(t);const r=await f.store.save('B32',input({observations:'Solo observación'})),d=await f.note();
 assert.equal(d.verificado_por,'Registro histórico');assert.equal(d.levantado_por,'Persona de prueba');assert.equal(verificationOf(d).count,0);assert.equal(r.progress.checks.verificado,false);assert.match(verificationText(verificationOf(d)),/antiguo/);
 assert.equal(await readFile(path.join(f.vault,r.backup),'utf8'),sample);
});
test('cada alcance exige evidencia y puede verificarse sin editar otros datos',async t=>{
 const f=await fixture(t);await assert.rejects(f.store.save('B32',input({verification:{scopes:['identidad']}})),/evidencia/);assert.equal(await readFile(f.file,'utf8'),sample);
 await f.store.save('B32',input({verification:{scopes:['identidad'],evidence:'TAG y ubicación contrastados con equipo físico'}}));
 let d=await f.note(),v=verificationOf(d);assert.equal(v.partial,true);assert.equal(v.scopes.identidad.verified,true);assert.equal(v.scopes.placa.verified,false);assert.equal(v.verified,false);
 await f.store.save('B32',input({verification:{scopes:['placa','repuestos'],evidence:'Placa legible y piezas instaladas comprobadas'}}));
 v=verificationOf(await f.note());assert.equal(v.verified,true);assert.equal(v.count,3);assert.equal(progressOf('B32',await f.note()).checks.verificado,true);
});
test('cambiar un repuesto invalida solo su verificación y conserva la evidencia anterior',async t=>{
 const f=await fixture(t);await f.store.save('B32',input({verification:{scopes:['identidad','placa','repuestos'],evidence:'Evidencia inicial'}}));
 await f.store.save('B32',input({fields:{sello_codigo:'SM-35'}}));let d=await f.note(),v=verificationOf(d);assert.equal(v.scopes.repuestos.verified,false);assert.equal(v.scopes.placa.verified,true);assert.equal(v.scopes.identidad.verified,true);assert.equal(d.verificaciones_campo.repuestos.evidence,'Evidencia inicial');
 await f.store.save('B32',input({fields:{serie:'NUEVA-1'}}));v=verificationOf(await f.note());assert.equal(v.count,0);assert.equal((await f.note()).asociacion_placa,'candidata');
});
test('serie transcrita no confirma identidad física automáticamente',async t=>{
 const f=await fixture(t);await f.store.save('B32',input({fields:{serie:'S-123'}}));assert.equal((await f.note()).asociacion_placa,'candidata');assert.equal(verificationOf(await f.note()).verified,false);
});
test('fecha imposible, RPM y cantidades inválidas no modifican ficha ni generan fotos',async t=>{
 const f=await fixture(t);
 for(const extra of [{date:'2026-02-31',observations:'x'},{fields:{rpm:'-500'}},{fields:{rpm:'0'}},{fields:{rpm:'1.5'}},{fields:{empaque_anillos:'0'}},{fields:{sello_diametro:'0'}},{fields:{empaque_seccion:'texto'}},{orings:[{medida:'10 x 2',cantidad:'-1'}]},{orings:[{medida:'10 x 2',cantidad:'1.5'}]},{verification:{scopes:['todo'],evidence:'x'}}]){
  await assert.rejects(f.store.save('B32',input(extra)));assert.equal(await readFile(f.file,'utf8'),sample);
 }
 const dirs=await readdir(path.join(f.vault,'00-Proyecto'));assert.deepEqual(dirs,['equipos']);
});
test('normaliza coma decimal y fracciones de placa sin aceptar unidades ambiguas',()=>{
 assert.equal(normalizeNumeric('sello_diametro','1.3/8'),'1.375');assert.equal(normalizeNumeric('sello_diametro','1 3/8'),'1.375');assert.equal(normalizeNumeric('empaque_seccion','6,35'),'6.35');assert.throws(()=>normalizeNumeric('sello_diametro','3/0'));assert.throws(()=>normalizeNumeric('rpm','1750 rpm'));assert.equal(validCalendarDate('2024-02-29'),true);assert.equal(validCalendarDate('2026-02-29'),false);
});
test('fallo del respaldo bloquea escritura de ficha y de fotos',async t=>{
 const f=await fixture(t,{backup:async()=>{throw Error('Disco de respaldo no disponible')}});
 const base64=Buffer.from([255,216,255,224,1,2,3]).toString('base64');await assert.rejects(f.store.save('B32',input({observations:'x',photos:[{base64}]})),/respaldo/);assert.equal(await readFile(f.file,'utf8'),sample);assert.deepEqual(await readdir(path.join(f.vault,'00-Proyecto')),['equipos']);
});
test('cada guardado conserva una copia exacta y distinta del estado anterior',async t=>{
 const f=await fixture(t);const a=await f.store.save('B32',input({observations:'Primero'}));const before=await readFile(f.file,'utf8');const b=await f.store.save('B32',input({observations:'Segundo'}));assert.notEqual(a.backup,b.backup);assert.equal(await readFile(path.join(f.vault,a.backup),'utf8'),sample);assert.equal(await readFile(path.join(f.vault,b.backup),'utf8'),before);
});
test('pedido omite booleanos y sanea carrito anterior sin cortar códigos ni cambiar cantidades',()=>{
 assert.equal(joinDetails('6205-2RS',false,'código 6205-2RS'),'6205-2RS · código 6205-2RS');
 const original=[{codigo:'6205-2RS',detalle:'6205-2RS · false · código 6205-2RS',cantidad:2},{detalle:'false alarm',cantidad:1}];const clean=cleanLegacyCart(original);assert.equal(clean.changed,1);assert.equal(clean.items[0].detalle,'6205-2RS · código 6205-2RS');assert.equal(clean.items[0].codigo,original[0].codigo);assert.equal(clean.items[0].cantidad,2);assert.equal(clean.items[1].detalle,'false alarm');assert.match(original[0].detalle,/false/);assert.equal(cleanLegacyCart(clean.items).changed,0);
 const request=normalizeRequest({solicitante:'Prueba',fecha:'2026-10-26',items:[{pieza:'Rodamiento',detalle:original[0].detalle,cantidad:2}]});assert.doesNotMatch(request.items[0].detalle,/false/);
});
test('PDF rechaza fecha imposible y cantidad fraccionaria sin truncar',()=>{
 const base={solicitante:'Prueba',items:[{pieza:'Rodamiento',cantidad:1}]};assert.throws(()=>normalizeRequest({...base,fecha:'2026-02-31'}),/fecha/);assert.throws(()=>normalizeRequest({...base,items:[{pieza:'Rodamiento',cantidad:'1.9'}]}),/cantidad/);assert.equal(normalizeRequest(base).items[0].cantidad,1);
});
test('conteos separan fichas B, P, referencias sin TAG y fichas faltantes',()=>{
 const rows=[...Array.from({length:28},(_,i)=>({kind:'B',tag:'B'+(i+1)})),...Array.from({length:15},(_,i)=>({kind:'P',tag:'P-'+i}))],tags=rows.filter(r=>r.kind==='B').map(r=>r.tag);
 const result=inventorySummary(rows,tags,34,77);assert.equal(result.progressTotal,43);assert.equal(result.viewerTotal,62);assert.equal(result.unmappedB,49);assert.deepEqual(result.missingB,[]);
 const missing=inventorySummary(rows.filter(r=>r.tag!=='B2'),tags,34,77);assert.deepEqual(missing.missingB,['B2']);assert.equal(missing.progressTotal,42);
});
test('cambiar la potencia conserva el valor anterior y su unidad como antecedente',async t=>{
 const vault=await mkdtemp(path.join(os.tmpdir(),'auditoria-vocatus-'));t.after(()=>rm(vault,{recursive:true,force:true}));
 const file=path.join(vault,'00-Proyecto/equipos/B32.md');await mkdir(path.dirname(file),{recursive:true});
 await writeFile(file,'---\nid: B32\nmarca: HIDROMAC\nmodelo: 2196\nmotor_kw: 1.5\norings: []\n---\n# B32\n');
 const store=surveyStore(vault),note=async()=>splitNote(await readFile(file,'utf8')).data;
 await store.save('B32',input({fields:{motor_hp:'2'}}));
 let d=await note();
 assert.equal(d.motor_hp,2);assert.equal(d.motor_kw,'');assert.equal(d.motor_potencia_vigente,'HP');
 assert.deepEqual(d.motor_potencia_antecedentes,[{valor:'1.5',unidad:'kW',vigente_hasta:'2026-10-26',reemplazado_por:'Persona de prueba'}]);
 assert.match(await readFile(file,'utf8'),/Potencia anterior conservada como antecedente: 1\.5 kW/);
 await store.save('B32',input({fields:{motor_hp:'3'}}));
 d=await note();
 assert.equal(d.motor_hp,3);assert.equal(d.motor_potencia_antecedentes.length,2);assert.deepEqual(d.motor_potencia_antecedentes.map(a=>a.valor+' '+a.unidad),['1.5 kW','2 HP']);
});
