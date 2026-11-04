// Sin red ni base real: almacenamiento y cliente simulados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createPumpNames} from './public/pump-names.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v)};};
function fake({rows=[],saveError=null}={}){const sent=[];return {sent,client:{from:()=>({upsert:async row=>{sent.push(row);if(!saveError){const i=rows.findIndex(r=>r.reference_key===row.reference_key);if(i>=0)rows[i]={...rows[i],name:row.name};else rows.push({reference_key:row.reference_key,name:row.name});}return {error:saveError};},select:async()=>({data:rows,error:null})})},userId:'u1',writable:true};}
const make=(connection,storage=memory(),on=true)=>createPumpNames({storage,connect:async()=>connection,notify(){},online:()=>on});

test('guardar comparte el nombre y conserva los demás datos locales',async()=>{
 const storage=memory();storage.setItem('k',JSON.stringify({marca:'X'}));const c=fake(),names=make(c,storage);
 assert.equal(await names.save('k','  B14 Alambique '),'done');
 assert.equal(names.nameOf('k'),'B14 Alambique');assert.equal(JSON.parse(storage.getItem('k')).marca,'X');
 assert.equal(c.sent[0].name,'B14 Alambique');assert.equal(c.sent[0].updated_by,'u1');
});
test('otro celular recibe el nombre y se puede volver a editar',async()=>{
 const rows=[{reference_key:'k',name:'B1'}],a=make(fake({rows}));
 await a.sync();assert.equal(a.nameOf('k'),'B1');
 await a.save('k','B2');assert.equal(rows[0].name,'B2');assert.equal(a.nameOf('k'),'B2');
});
test('sin señal queda en el celular y se envía después',async()=>{
 const storage=memory(),c=fake(),off=make(c,storage,false);
 assert.equal(await off.save('k','B9'),'offline');assert.equal(c.sent.length,0);assert.equal(off.nameOf('k'),'B9');
 assert.equal(await make(c,storage).sync(),'done');assert.equal(c.sent[0].name,'B9');
});
test('si la base falla no se pierde el nombre ni lo pisa la nube',async()=>{
 const storage=memory(),rows=[{reference_key:'k',name:'viejo'}],c=fake({rows,saveError:{message:'no'}}),names=make(c,storage);
 assert.equal(await names.save('k','nuevo'),'error');assert.equal(names.nameOf('k'),'nuevo');
 assert.ok(JSON.parse(storage.getItem('vocatus-nombres-pendientes')).k);
});
test('la tabla exige cuenta aprobada y no permite borrar',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261104150000_vocatus_pump_names.sql',import.meta.url),'utf8');
 assert.doesNotMatch(sql,/grant[^;]*delete/i);assert.match(sql,/as restrictive for update[\s\S]*vocatus_access\.allowed\(true\)/);
});
