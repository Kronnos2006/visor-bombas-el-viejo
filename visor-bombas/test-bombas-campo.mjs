import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {SECTORES_INT,sectorDe} from './public/planta-integrada.js';
const json=async f=>JSON.parse(await readFile(new URL(f,import.meta.url),'utf8'));
test('bombas nuevas del FBX: separadas del modelo y sin chocar con las existentes',async()=>{
 const nuevas=await json('./public/modelos/bombas-campo.json'),base=await json('./public/modelos/bombas-individuales.json');
 assert.equal(nuevas.length,9);assert.equal(base.reduce((n,g)=>n+g.bombas.length,0),42,'la identificación anterior no cambia');
 const {gruposConCampo,moverTorrePequena,CONJUNTO_REEMPLAZADO}=await import('./public/ajustes-fbx.js');
 const vigentes=gruposConCampo(base,[]).filter(g=>g.nombre!==CONJUNTO_REEMPLAZADO);moverTorrePequena({traverse(){}},{},vigentes);
 const nombres=new Set(base.map(g=>g.nombre));
 for(const g of nuevas){
  assert.ok(!nombres.has(g.nombre),g.nombre);assert.ok(SECTORES_INT.some(s=>s.id===sectorDe(g.sector)),g.sector);assert.equal(g.bombas.length,1);
  const a=g.bombas[0];for(const h of vigentes)for(const b of h.bombas){
   const toca=a.min[0]<b.max[0]&&a.max[0]>b.min[0]&&a.min[2]<b.max[2]&&a.max[2]>b.min[2];assert.ok(!toca,`${g.nombre} choca con ${h.nombre}`);}
 }
 const glb=await readFile(new URL('./public/modelos/bombas-campo.glb',import.meta.url)),n=glb.readUInt32LE(12),d=JSON.parse(glb.subarray(20,20+n));
 assert.deepEqual([...new Set(d.nodes.map(x=>x.extras.bomba).filter(Boolean))].sort(),nuevas.map(g=>g.nombre).sort());
 for(const x of d.nodes)if(x.extras.bomba)assert.equal(x.extras.sector,nuevas.find(g=>g.nombre===x.extras.bomba).sector);
});
test('ajustes del FBX: 5 verticales reemplazan a 3 y la torre pequeña baja 2,06 m',async()=>{
 const {gruposConCampo,moverTorrePequena,CONJUNTO_REEMPLAZADO:C,TORRE_PEQUENA:P}=await import('./public/ajustes-fbx.js');
 const v=[{nombre:'n',sector:'x',nota:'FBX general',bombas:[]}];assert.deepEqual(gruposConCampo([{nombre:C,bombas:[]}],v).slice(0,1),v);assert.equal(gruposConCampo([{nombre:C,bombas:[]}],[]).length,1,'sin archivo nuevo queda lo anterior');
 const m={isMesh:true,userData:{sector:P},position:{z:1}},otro={isMesh:true,userData:{sector:'x'},position:{z:1}},info={sectores:{[P]:{min:[0,0,5],max:[0,0,6]}}},g=[{sector:P,bombas:[{min:[0,0,5],max:[0,0,6]}]}];
 moverTorrePequena({traverse:f=>[m,otro].forEach(f)},info,g);
 assert.ok(Math.abs(m.position.z+1.06)<1e-9);assert.equal(otro.position.z,1);assert.ok(Math.abs(info.sectores[P].min[2]-2.94)<1e-9);assert.ok(Math.abs(g[0].bombas[0].max[2]-3.94)<1e-9);
});
test('torre según FBX: nueve bombas del modelo y ninguna ficha encimada',async()=>{
 const {TORRE_FBX,TORRE_SIN_UBICACION,TORRE_SIN_FICHA}=await import('./public/ajustes-fbx.js');
 assert.deepEqual(Object.keys(TORRE_FBX).sort(),['B10','B11','B12','B2','B3','B9'].sort());assert.equal(TORRE_SIN_FICHA.length,3);
 assert.equal(Object.keys(TORRE_FBX).length+TORRE_SIN_FICHA.length,9);
 for(const tag of TORRE_SIN_UBICACION)assert.ok(!TORRE_FBX[tag],tag);
 assert.equal(TORRE_SIN_UBICACION.size+Object.keys(TORRE_FBX).length,16,'las 16 fichas siguen existiendo');
});
test('tanques de agua: solo queda la bomba auxiliar del FBX',async()=>{
 const {gruposConCampo,ADICIONALES_RETIRADAS:R}=await import('./public/ajustes-fbx.js');
 const aux={nombre:'Bomba auxiliar exterior de tanques de agua - motor y guarda ventilada',bombas:[]};
 const r=gruposConCampo([{nombre:R,bombas:[]},aux],[{nombre:'n',bombas:[]}]);
 assert.ok(!r.some(g=>g.nombre===R));assert.ok(r.includes(aux));
});
