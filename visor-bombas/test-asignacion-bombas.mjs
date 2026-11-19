import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {indexarAsignacion,tituloTag,sectorDePosicion,bloqueExcel} from './public/asignacion-bombas.js';
const data=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url),'utf8'));
test('asignación: un TAG por lugar y 90 bombas de la lista',()=>{
 const as=indexarAsignacion(data),tags=[...data.A.map(a=>a.tag).filter(Boolean),...data.N.map(n=>n.tag)];
 assert.equal(new Set(tags).size,tags.length);assert.equal(Object.keys(data.excel).length,90);assert.equal(tituloTag(as,'B76'),'B76 · Búnker diario #2');
 assert.match(bloqueExcel(as,'B26'),/Lavados de aceite/);assert.equal(sectorDePosicion(-30,12),'DUSA');
});
test('fotos: siguen a la posición aunque cambie el TAG',async()=>{
 const {ligarFotosAPosicion,entidadDeFotos}=await import('./public/fotos-bomba.js');
 ligarFotosAPosicion({B3:'B2'});assert.equal(entidadDeFotos('B3'),'B2');assert.equal(entidadDeFotos('B11'),'B11');ligarFotosAPosicion({});
});

test('las 90 bombas tienen ficha completa (las que no tienen ficha propia usan el Excel)',async()=>{
 const {fichaDeExcel,tagsExcel}=await import('./fichas-excel.mjs');
 assert.equal(tagsExcel().length,90);
 const f=fichaDeExcel('B44');assert.equal(f.tag,'B44');assert.equal(f.servicio,'Agua');assert.match(f.marca,/HIDROMAC/);assert.ok(f.soloExcel);
 assert.equal(fichaDeExcel('B90').nombre,'Tanque Millonario 2');assert.equal(fichaDeExcel('B999'),null);
});
