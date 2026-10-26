import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {surveyStore,splitNote,FIELDS} from './survey.mjs';
const input=extra=>({date:'2026-10-26',author:'Revisión de prueba',clearReason:'Valor contrastado: estaba asociado a otro equipo',...extra});
async function fixture(t,extra='',tag='B32',options={}){
 const vault=await mkdtemp(path.join(os.tmpdir(),'vocatus-quitar-'));t.after(()=>rm(vault,{recursive:true,force:true}));
 const file=path.join(vault,'00-Proyecto',tag[0]==='B'?'equipos':'bombas',tag+'.md');await mkdir(path.dirname(file),{recursive:true});
 let base='marca: HIDROMAC\nrpm: 1750\norings: []\n';for(const match of extra.matchAll(/^(\w+):/gm))base=base.replace(new RegExp('^'+match[1]+':.*\\n','m'),'');
 const raw=`---\nid: ${tag}\n${base}${extra}---\n# ${tag}\n`;
 await writeFile(file,raw);return {vault,file,raw,store:surveyStore(vault,options),data:async()=>splitNote(await readFile(file,'utf8')).data};
}
test('quitar un dato conserva respaldo exacto, autor, fecha, motivo y valor anterior',async t=>{
 const f=await fixture(t);const out=await f.store.save('B32',input({clearFields:{marca:'HIDROMAC'}}));
 assert.equal((await f.data()).marca,'');assert.equal((await f.data()).rpm,1750);
 assert.equal(await readFile(path.join(f.vault,out.backup),'utf8'),f.raw);
 const text=await readFile(f.file,'utf8');for(const value of ['HIDROMAC','Revisión de prueba','2026-10-26','asociado a otro equipo'])assert.ok(text.includes(value));
});
test('eliminar datos invalida sus alcances sin afectar verificaciones ajenas',async t=>{
 const f=await fixture(t);await f.store.save('B32',input({verification:{scopes:['identidad','placa','repuestos'],evidence:'Prueba inicial'}}));
 await f.store.save('B32',input({clearFields:{rpm:'1750'}}));const records=(await f.data()).verificaciones_campo;
 assert.equal(records.placa.vigente,false);assert.equal(records.identidad.vigente,true);assert.equal(records.repuestos.vigente,true);
});
test('todos los campos editables B y P admiten retirada explícita sin tocar identidad interna',async t=>{
 for(const tag of ['B32','P-1401'])for(const field of FIELDS){const key=field[tag[0]==='B'?'B':'P'];if(!key)continue;
  const f=await fixture(t,`${key}: VALOR-ERRONEO\n`,tag);await f.store.save(tag,input({clearFields:{[field.id]:'VALOR-ERRONEO'}}));
  const d=await f.data();assert.equal(d[key],'',tag+' '+field.id);assert.equal(d.id,tag);
 }
});
test('un campo vacío sigue conservando el dato; retirar exige motivo y no permite sobrescribir a la vez',async t=>{
 const f=await fixture(t);await f.store.save('B32',input({fields:{marca:''},observations:'Sin cambios'}));assert.equal((await f.data()).marca,'HIDROMAC');
 const before=await readFile(f.file,'utf8');
 for(const extra of [{clearReason:'',clearFields:{marca:'HIDROMAC'}},{clearFields:{marca:'HIDROMAC'},fields:{marca:'OTRA'}},{clearFields:['marca']},{clearFields:{id:'B32'}},{clearFields:{marca:'HIDROMAC'},verification:{scopes:['identidad'],evidence:'No debe revalidar'}}]){
  await assert.rejects(f.store.save('B32',input(extra)));assert.equal(await readFile(f.file,'utf8'),before);
 }
});
test('si el dato cambió desde que se abrió la ficha, la retirada se rechaza',async t=>{
 const f=await fixture(t);await f.store.save('B32',input({fields:{marca:'OTRA'}}));const before=await readFile(f.file,'utf8');
 await assert.rejects(f.store.save('B32',input({clearFields:{marca:'HIDROMAC'}})),/cambió/);assert.equal(await readFile(f.file,'utf8'),before);
});
test('un respaldo fallido impide quitar datos',async t=>{
 const f=await fixture(t,'','B32',{backup:async()=>{throw Error('Fallo de respaldo')}});
 await assert.rejects(f.store.save('B32',input({clearFields:{marca:'HIDROMAC'}})),/respaldo/);assert.equal(await readFile(f.file,'utf8'),f.raw);
});
test('quitar potencia no crea otra unidad vigente y conserva el valor retirado en historial',async t=>{
 const f=await fixture(t,'motor_hp: 2\nmotor_potencia_vigente: HP\n');await f.store.save('B32',input({clearFields:{motor_hp:'2'}}));
 const d=await f.data();assert.equal(d.motor_hp,'');assert.equal(d.motor_potencia_vigente,'');assert.match(await readFile(f.file,'utf8'),/Potencia del motor en HP.*2/);
});
