import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {indexarAsignacion,tituloTag,sectorDePosicion,bloqueExcel} from './public/asignacion-bombas.js';
const data=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url),'utf8'));
test('asignación: un TAG por lugar y 83 bombas de la lista',()=>{
 const as=indexarAsignacion(data),tags=[...data.A.map(a=>a.tag).filter(Boolean),...data.N.map(n=>n.tag)];
 assert.equal(new Set(tags).size,tags.length);assert.equal(Object.keys(data.excel).length,83);assert.equal(tituloTag(as,'B76'),'B76 · Búnker diario #2');
 assert.match(bloqueExcel(as,'B26'),/Lavados de aceite/);assert.equal(sectorDePosicion(-30,12),'DUSA');
});
