// Mover bombas (administrador): cálculos y reglas de la base, sin 3D ni base real.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const m=new Map();globalThis.localStorage={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};
const {girarPunto,limpiarPosicion,piezaDentro}=await import('./public/mover-bombas.js');

test('girar un punto alrededor del centro de la bomba',()=>{
 const [x,z]=girarPunto(2,0,0,0,90);assert.ok(Math.abs(x)<1e-9);assert.ok(Math.abs(z+2)<1e-9);
 assert.deepEqual(girarPunto(5,5,5,5,37),[5,5]);
});
test('las posiciones se validan antes de guardar',()=>{
 assert.deepEqual(limpiarPosicion({key:'tag:B2',x:'1.23456',z:-4,giro:370}),{key:'tag:B2',x:1.235,z:-4,giro:10});
 assert.equal(limpiarPosicion({key:'',x:1,z:1}),null);
 assert.equal(limpiarPosicion({key:'a',x:'nada',z:1}),null);
 assert.equal(limpiarPosicion({key:'a',x:9000,z:1}),null);
});
test('solo se mueven las piezas que caen dentro de la bomba y no son más grandes que ella',()=>{
 const bomba={min:[0,0,0],max:[2,2,1]};
 assert.ok(piezaDentro(bomba,{min:[.5,.2,.2],max:[1.5,1,.8]}));
 assert.ok(!piezaDentro(bomba,{min:[5,0,0],max:[6,1,1]}),'pieza de otra bomba');
 assert.ok(!piezaDentro(bomba,{min:[-20,0,0],max:[22,.1,1]}),'piso o tubería larga');
});
test('la base: todos leen las posiciones, solo el administrador las guarda, con tiempo real',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261112190000_vocatus_posiciones_bombas.sql',import.meta.url),'utf8');
 assert.match(sql,/pump_positions_insert[\s\S]*current_is_admin/);assert.match(sql,/pump_positions_update[\s\S]*current_is_admin/);
 assert.doesNotMatch(sql,/grant[^;]*\bdelete\s*(,|on)/i);assert.match(sql,/supabase_realtime/);
});
test('el botón de mover solo se arma para el administrador',async()=>{
 const js=await readFile(new URL('./public/tareas-avisos.js',import.meta.url),'utf8');
 assert.match(js,/iniciarMoverBombas\(\{admin:conectado&&yo\.admin\}\)/);
 const mv=await readFile(new URL('./public/mover-bombas.js',import.meta.url),'utf8');
 assert.match(mv,/if\(!admin\)return;/);
});
