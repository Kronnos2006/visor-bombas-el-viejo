// Sin red ni base real: almacenamiento y cliente simulados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPumpData,limpiarDatos} from './public/pump-data.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v)};};
function fake({rows=[],saveError=null,writable=true}={}){const sent=[];return {sent,client:{from:()=>({upsert:async row=>{sent.push(row);if(!saveError){const i=rows.findIndex(r=>r.reference_key===row.reference_key);if(i>=0)rows[i]={...rows[i],data:row.data};else rows.push({reference_key:row.reference_key,data:row.data});}return {error:saveError};},select:async()=>({data:rows,error:null})})},userId:'u1',writable};}
const make=(connection,storage=memory(),on=true,onNotify=()=>{})=>createPumpData({storage,connect:async()=>connection,notify:onNotify,online:()=>on});

test('guardar comparte los datos y conserva el nombre local',async()=>{
 const storage=memory();storage.setItem('k',JSON.stringify({nombre:'B14'}));const c=fake(),d=make(c,storage);
 assert.equal(await d.save('k',{marca:' Hidromac ',modelo:'2196',caudal:''}),'done');
 assert.deepEqual(c.sent[0].data,{marca:'Hidromac',modelo:'2196'});assert.equal(c.sent[0].updated_by,'u1');
 const local=JSON.parse(storage.getItem('k'));assert.equal(local.nombre,'B14');assert.equal(local.marca,'Hidromac');
});
test('otro celular recibe los datos y avisa para repintar',async()=>{
 let avisos=0;const storage=memory();storage.setItem('k',JSON.stringify({nombre:'B2'}));
 const d=make(fake({rows:[{reference_key:'k',data:{marca:'Titan'}}]}),storage,true,()=>avisos++);
 await d.sync();assert.equal(d.dataOf('k').marca,'Titan');assert.equal(JSON.parse(storage.getItem('k')).nombre,'B2');assert.equal(avisos,1);
 await d.sync();assert.equal(avisos,1);
});
test('sin señal queda en el celular y se envía después',async()=>{
 const storage=memory(),c=fake(),off=make(c,storage,false);
 assert.equal(await off.save('k',{rpm:'3500'}),'offline');assert.equal(c.sent.length,0);
 assert.equal(await make(c,storage).sync(),'done');assert.equal(c.sent[0].data.rpm,'3500');
 assert.deepEqual(JSON.parse(storage.getItem('vocatus-datos-pendientes')),{});
});
test('si la base falla no se pierde ni lo pisa la nube',async()=>{
 const storage=memory(),c=fake({rows:[{reference_key:'k',data:{rpm:'1750'}}],saveError:{message:'no'}}),d=make(c,storage);
 assert.equal(await d.save('k',{rpm:'3500'}),'error');assert.equal(d.dataOf('k').rpm,'3500');
 assert.ok(JSON.parse(storage.getItem('vocatus-datos-pendientes')).k);
});
test('cuenta de solo consulta no envía nada',async()=>{
 const c=fake({writable:false});assert.equal(await make(c).save('k',{rpm:'1'}),'read-only');assert.equal(c.sent.length,0);
});
test('limpia campos raros, el nombre y textos largos',()=>{
 assert.deepEqual(limpiarDatos({nombre:'x','<b>':'1',marca:'a'.repeat(600)}),{marca:'a'.repeat(500)});
});
test('la tabla exige cuenta aprobada, no permite borrar y activa tiempo real',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261111120000_vocatus_pump_data.sql',import.meta.url),'utf8');
 assert.doesNotMatch(sql,/grant[^;]*delete/i);assert.match(sql,/as restrictive for update[\s\S]*vocatus_access\.allowed\(true\)/);
 assert.match(sql,/supabase_realtime/);
});
