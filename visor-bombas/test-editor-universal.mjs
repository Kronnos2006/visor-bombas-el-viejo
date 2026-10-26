import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Readable} from 'node:stream';
import {surveyStore,splitNote,FIELDS} from './survey.mjs';
import {pumpPhotoStore,SLOTS} from './pump-photos.mjs';
import {PHOTO_SLOTS} from './public/photo-slots.js';
import {equipmentStore} from './equipment.mjs';

const vault=await mkdtemp(path.join(os.tmpdir(),'editor-universal-'));
process.env.OBSIDIAN_VAULT=vault;delete process.env.VOCATUS_DEMO;delete process.env.VOCATUS_CLOUD_DEV;delete process.env.VERCEL;delete process.env.CODESPACES;
await mkdir(path.join(vault,'00-Proyecto/equipos'),{recursive:true});await mkdir(path.join(vault,'00-Proyecto/bombas'),{recursive:true});
const note=(tag,extra='')=>'---\n'+(tag.startsWith('B')?'id: ':'tag: ')+tag+'\nmarca: Hidromac\nmodelo: 2196\nmotor_hp: 2\norings: []\n'+extra+'---\n# '+tag+'\n';
for(const tag of ['B32','B50','B51','B52','B53','B54','B55','P-1401'])await writeFile(path.join(vault,'00-Proyecto',tag.startsWith('B')?'equipos':'bombas',tag+'.md'),note(tag));
const {handler}=await import('./server.mjs');
async function request(url,body,token){
 const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);req.method=body?'POST':'GET';req.url=url;req.headers={host:'127.0.0.1:8766','x-local-token':token||''};
 const res={writeHead(status){this.status=status;},end(raw){this.raw=raw;}};await handler(req,res);try{res.data=JSON.parse(res.raw);}catch{}return res;
}
const input=fields=>({author:'PRUEBA',date:'2026-10-26',fields});
test.after(()=>rm(vault,{recursive:true,force:true}));

test('catálogo de edición incluye fichas B fuera del mapa y las P, sin crear geometría',async()=>{
 const catalog=await request('/api/survey-catalog');assert.equal(catalog.status,200);assert.ok(catalog.data.rows.some(r=>r.tag==='B50'));assert.ok(catalog.data.rows.some(r=>r.tag==='P-1401'));
 const p=await request('/api/pump?tag=B50');assert.equal(p.status,200);assert.equal(p.data.data.tag,'B50');assert.equal(p.data.data.x,undefined);
 const result=await request('/api/survey',{tag:'B50',...input({modelo:'Modelo actualizado',sello_codigo:'SM-50'})},catalog.data.token);assert.equal(result.status,201);assert.ok(result.data.backup);assert.equal((await request('/api/pump?tag=B50')).data.data.seal.codigo,'SM-50');
 assert.equal((await request('/api/pump?tag=B999')).status,409);
});
test('cada tipo de ficha admite datos generales, motor y componentes con sus unidades',async()=>{
 for(const kind of ['B','P'])for(const id of ['nombre','servicio','caudal','altura','motor_marca','motor_modelo','motor_serie','motor_hp','motor_kw','motor_rpm','sello_codigo','rodamiento_delantero','rodamiento_trasero','acople'])assert.ok(FIELDS.find(f=>f.id===id)?.[kind],kind+': '+id);
 const store=surveyStore(vault);await store.save('B51',input({nombre:'Ubicación actualizada',servicio:'Agua',caudal:'12,5',altura:'20',motor_marca:'WEG',motor_modelo:'MODELO-A',motor_serie:'M-51',motor_kw:'1,5',motor_rpm:'1750',rodamiento_delantero:'6205-2RS',rodamiento_trasero:'6204-2RS',acople:'AC-51',sello_codigo:'SELLO-51'}));
 const b=(await request('/api/pump?tag=B51')).data.data;assert.equal(b.nombre,'Ubicación actualizada');assert.equal(b.motor.potencia,'1.5 kW');assert.equal(b.documental.motor_hp,'');assert.equal(b.documental.caudal_gpm,12.5);assert.equal(b.rodamientos.delantero,'6205-2RS');assert.equal(b.acople,'AC-51');
 await store.save('P-1401',input({motor_kw:'2,2',motor_modelo:'P-MOTOR',caudal:'15',sello_diametro:'35',rodamiento_delantero:'6305',acople:'AC-P'}));
 const p=(await request('/api/pump?tag=P-1401')).data.data;assert.equal(p.potencia_kw,2.2);assert.equal(p.caudal_m3h,15);assert.equal(p.sello_diametro_mm,35);assert.equal(p.rodamiento_delantero,'6305');
 await assert.rejects(store.save('B51',input({motor_hp:'2',motor_kw:'1.5'})),/no ambas/);
});
test('editar o-rings corrige y elimina, conserva metadatos y permite vaciar con respaldo',async()=>{
 const file=path.join(vault,'00-Proyecto/equipos/B52.md');const base=[{medida:'10 x 2 mm',material:'EPDM',cantidad:2,fuente:'Placa de repuesto'},{medida:'20 x 3 mm',codigo:'OR-2'}];
 await writeFile(file,note('B52').replace('orings: []','orings: '+JSON.stringify(base)));
 const store=surveyStore(vault);await store.save('B52',{...input({}),replaceOrings:true,baseOrings:base,orings:[{existingIndex:0,medida:'10 x 2 mm',material:'FKM',cantidad:'3'}]});
 let data=splitNote(await readFile(file,'utf8')).data;assert.equal(data.orings.length,1);assert.equal(data.orings[0].material,'FKM');assert.equal(data.orings[0].cantidad,3);assert.equal(data.orings[0].fuente,'Placa de repuesto');
 const before=await readFile(file,'utf8');const result=await store.save('B52',{...input({}),replaceOrings:true,baseOrings:data.orings,orings:[]});assert.deepEqual(splitNote(await readFile(file,'utf8')).data.orings,[]);assert.equal(await readFile(path.join(vault,result.backup),'utf8'),before);
});
test('lista de o-rings desactualizada no sobreescribe cambios de otra edición',async()=>{
 const file=path.join(vault,'00-Proyecto/equipos/B53.md'),store=surveyStore(vault);await store.save('B53',{...input({}),orings:[{medida:'10 x 2 mm'}]});const before=await readFile(file,'utf8');
 await assert.rejects(store.save('B53',{...input({}),replaceOrings:true,baseOrings:[],orings:[]}),/cambió/);assert.equal(await readFile(file,'utf8'),before);
});
test('todas las fotos de componentes se guardan por TAG y conservan la anterior',async()=>{
 const photos=pumpPhotoStore(vault);assert.deepEqual(Object.keys(SLOTS),PHOTO_SLOTS.map(([slot])=>slot));
 for(const tag of ['B54','P-1401'])for(const [slot] of PHOTO_SLOTS){
  const a=Buffer.from([255,216,255,224,1]),b=Buffer.from([255,216,255,224,2]);await photos.save(tag,slot,a.toString('base64'));await photos.save(tag,slot,b.toString('base64'));assert.deepEqual((await photos.read(tag,slot)).bytes,b);
 }
 assert.equal(await photos.historial('B54'),10);assert.equal(await photos.historial('P-1401'),10);assert.deepEqual(await photos.list('B55'),{});await assert.rejects(photos.save('B54','__proto__','/9j/4AE='),/desconocida/);
});
test('API permite fotos de sello en B fuera del mapa y P, con token y rechazo de imagen inválida',async()=>{
 const {data:{token}}=await request('/api/survey-catalog');for(const tag of ['B50','P-1401']){
  const body={tag,slot:'sello',base64:Buffer.from([255,216,255,224,3]).toString('base64')};assert.equal((await request('/api/pump-photo',body)).status,403);assert.equal((await request('/api/pump-photo',body,token)).status,201);assert.ok((await request('/api/pump-photos?tag='+tag)).data.fotos.sello);assert.equal((await request('/api/pump-photo',{...body,base64:'PHN2Zz4='},token)).status,400);
 }
});
test('reemplazar una bomba archiva fotos de sus componentes y conserva la foto de posición',async()=>{
 const photos=pumpPhotoStore(vault);for(const [slot] of PHOTO_SLOTS)await photos.save('B55',slot,Buffer.from([255,216,255,224,4]).toString('base64'));
 const store=equipmentStore(vault,[{tag:'B55',x:0,z:0,rotation:0,areaId:'tanques'}]);await store.replace('B55',{date:'2026-10-26',author:'PRUEBA',fields:{marca:'Nueva marca',modelo:'Nuevo modelo'}});
 assert.deepEqual(Object.keys(await photos.list('B55')),['posicion']);assert.equal(await photos.historial('B55'),9);
});
