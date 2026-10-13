import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {torrePumps,torreSinTag} from './public/equipos-torre.js';
import {photoPumps,plantPumps} from './public/sector-fotos.js';
import {buildTorre,aplicarSeccion,SECCIONES,EJES_X,EJES_Z,seccionDe} from './public/torre-model.js';
import {AREAS,pxAMundo} from './public/planta-general.js';
import {simParams,createPumpModel} from './public/pump-sim.js';
import {readPump,handler} from './server.mjs';
import {Readable} from 'node:stream';

test('la torre tiene las 16 bombas (B9 sin uso) anotadas en el croquis, sin repetir TAG del sector',()=>{
 assert.deepEqual(torrePumps.map(p=>p.tag),['B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12','B17','B18','B19','B20','B21']);
 assert.equal(plantPumps.length,photoPumps.length+16);
 assert.equal(torrePumps.find(p=>p.tag==='B9').enUso,false);
 assert.ok(torrePumps.filter(p=>p.tag!=='B9').every(p=>p.enUso));
 assert.equal(new Set(plantPumps.map(p=>p.tag)).size,plantPumps.length);
 for(const p of torrePumps){
  assert.equal(p.areaId,'torre');assert.equal(p.source,`00-Proyecto/equipos/${p.tag}.md`);
  assert.ok(p.x>EJES_X[1]&&p.x<EJES_X[5]&&p.z>EJES_Z.A&&p.z<EJES_Z.E,`${p.tag} dentro de la planta de la torre`);
  assert.match(p.photo,/^\/referencias\/torre\//);
 }
 assert.equal(torreSinTag.length,1);
});
test('datos de las fichas: B11 Vinaza 2X3-8 MTO, B17 Durco, B20 agua',()=>{
 const t=tag=>torrePumps.find(p=>p.tag===tag);
 assert.equal(t('B11').size,'2X3-8 MTO');assert.equal(t('B11').variant,'mto');assert.equal(t('B17').marca,'DURCO');assert.equal(t('B20').servicio,'Agua');
});
test('el modelo se aísla por piso y solo el Nivel 1 tiene bombas',()=>{
 const {objetos}=buildTorre(THREE);
 for(const s of SECCIONES)assert.ok(objetos.some(o=>o.userData.section===s.id),`objetos en ${s.id}`);
 assert.equal(seccionDe(.3),'n1');assert.equal(seccionDe(5.3),'n21');assert.equal(seccionDe(20.3),'n5');assert.equal(seccionDe(35.3),'techo');
 aplicarSeccion(objetos,'n4');
 assert.ok(objetos.every(o=>o.visible===(o.userData.section==='n4')),'solo el piso elegido queda visible');
 aplicarSeccion(objetos,null);assert.ok(objetos.every(o=>o.visible));
 assert.ok(torrePumps.every(p=>seccionDe(p.y)==='n1'));
});
test('áreas sobre el plano de sitio: torre en el área 2, junto al sector de tanques',()=>{
 const torre=AREAS.find(a=>a.id==='torre'),tanques=AREAS.find(a=>a.id==='tanques');
 const [x2,z2]=pxAMundo(150,310);
 assert.ok(Math.hypot(torre.pos[0]-x2,torre.pos[1]-z2)<25);
 const d=Math.hypot(torre.pos[0]-tanques.pos[0],torre.pos[1]-tanques.pos[1]);assert.ok(d>35&&d<60,"áreas separadas pero cercanas: "+d);
});
test('el simulador funciona con las bombas de la torre',()=>{
 for(const p of torrePumps){const P=simParams(p);assert.ok(P,p.tag);const M=createPumpModel(P);let s=M.initialState(),i={...M.defaults(),running:true};for(let k=0;k<3000;k++)s=M.step(s,i,.1);assert.ok(Number.isFinite(M.derive(s,i).q));}
});
test('el servidor entrega y lee las bombas de la torre',async()=>{
 const p=await readPump('B11');assert.equal(p.data.areaId,'torre');assert.equal(p.data.servicio,'Mosto - Vinaza');
 const req=Readable.from([]);req.url='/api/bootstrap';req.method='GET';req.headers={host:'127.0.0.1:8766'};
 const res={writeHead(st){this.status=st;},end(raw){this.raw=raw;}};await handler(req,res);
 const boot=JSON.parse(res.raw);assert.equal(boot.sectorPumps.length,28);assert.equal(boot.sectorPumps.filter(p=>p.areaId==='torre').length,16);
});
test('fotos del expediente: guarda, sustituye y conserva la anterior en el historial',async()=>{
 const {mkdtemp}=await import('node:fs/promises');const os=await import('node:os');const path=await import('node:path');
 const {pumpPhotoStore}=await import('./pump-photos.mjs');
 const dir=await mkdtemp(path.join(os.tmpdir(),'vocatus-fotos-'));const store=pumpPhotoStore(dir);
 const jpg=Buffer.from([0xFF,0xD8,0xFF,0xE0,1,2,3]).toString('base64');
 await store.save('B11','placa1',jpg);await store.save('B11','placa1',jpg);
 const list=await store.list('B11');assert.ok(list.placa1.url.includes('slot=placa1'));assert.equal(await store.historial('B11'),1);
 await assert.rejects(store.save('B11','otra',jpg));await assert.rejects(store.save('../x','placa1',jpg));
 await assert.rejects(store.save('B11','bomba',Buffer.from('hola').toString('base64')));
});
test('el expediente de la torre trae las fotos del Excel Libro1.bombas_3',async()=>{
 const {expediente}=await import('./public/expediente.js');
 for(const t of ['B3','B5','B11','B17','B21'])assert.ok(expediente[t].fotos.length&&expediente[t].placas.length,t);
});
