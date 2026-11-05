import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {indexarAsignacion,tituloTag,sectorDePosicion,bloqueExcel} from './public/asignacion-bombas.js';
const data=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url),'utf8'));
test('asignación: un TAG por lugar y 83 bombas de la lista',()=>{
 const as=indexarAsignacion(data),tags=[...data.A.map(a=>a.tag).filter(Boolean),...data.N.map(n=>n.tag)];
 assert.equal(new Set(tags).size,tags.length);assert.equal(Object.keys(data.excel).length,83);assert.equal(tituloTag(as,'B76'),'B76 · Búnker diario #2');
 assert.match(bloqueExcel(as,'B26'),/Lavados de aceite/);assert.equal(sectorDePosicion(-30,12),'DUSA');
});
test('fotos: la numeración vigente lee la anterior sin cruzar bombas',async()=>{
 const {entidadFotos:f}=await import('./public/asignacion-bombas.js');
 assert.equal(f('B26'),'B26');assert.equal(f('B57'),'B56');assert.equal(f('B59'),'B57');assert.equal(f('B61'),'B59');assert.equal(f('B63'),'B60');assert.equal(f('B76'),'B73');assert.equal(f('B80'),'B77');
 for(const t of ['B56','B58','B62','B81'])assert.equal(f(t),null);
});
