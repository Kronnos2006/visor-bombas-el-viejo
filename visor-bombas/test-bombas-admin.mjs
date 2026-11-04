import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
globalThis.document??={documentElement:{dataset:{}},dispatchEvent(){}};globalThis.Event??=class{};
const memoria=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};};
const {createPumpVisibility,explicarErrorVisibilidad}=await import('./public/bombas-admin.js');
const cliente=(filas=[],error=null)=>({from:()=>({select:async()=>({data:filas,error}),upsert:async f=>{if(!error)filas.push(f);return {error};},delete:()=>({eq:async k=>{return {error};}})})});
test('visibilidad: ocultar y restaurar sin borrar datos',async()=>{
 const v=createPumpVisibility({storage:memoria(),connect:async()=>({client:cliente(),userId:'u'}),notify(){}});
 assert.equal(await v.set('tag:B2','oculta'),'shared');assert.equal(v.stateOf('tag:B2'),'oculta');
 await v.set('tag:B2',null);assert.equal(v.stateOf('tag:B2'),null);
});
test('visibilidad: si la base rechaza, no cambia nada',async()=>{
 const v=createPumpVisibility({storage:memoria(),connect:async()=>({client:cliente([],{code:'42501',message:'row-level security'}),userId:'u'}),notify(){}});
 await assert.rejects(v.set('tag:B2','quitada'));assert.equal(v.stateOf('tag:B2'),null);
 assert.match(explicarErrorVisibilidad({code:'42501'}),/administrador/);assert.match(explicarErrorVisibilidad({code:'PGRST205'}),/SQL/);
});
test('SQL: solo un administrador escribe y no borra otras tablas',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261104193000_vocatus_pump_visibility.sql',import.meta.url),'utf8');
 for(const p of ['pump_visibility_insert','pump_visibility_update','pump_visibility_delete'])assert.match(sql,new RegExp(p+'[\\s\\S]{0,160}current_is_admin'));
 assert.doesNotMatch(sql,/drop table|truncate|delete from/i);
 const repaso=await readFile(new URL('../supabase/review/preparar-bombas.sql',import.meta.url),'utf8');assert.doesNotMatch(repaso,/drop table|truncate|delete from/i);assert.equal((repaso.match(/create policy/g)||[]).length,14);
});
