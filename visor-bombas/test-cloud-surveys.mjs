// Sin red ni base real: cola y cliente simulados.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {queueMessage,surveyConnection,syncOutbox,uploadSurvey} from './public/cloud-surveys.js';
const record=(id='a',tag='B14')=>({id,tag,data:{id,tag,author:'Ensayo',fields:{marca:'X'},photos:[{name:'p.jpg',base64:'YWJj'}]}});
function memoryBox(items){const map=new Map(items.map(i=>[i.id,i]));return {map,list:async()=>[...map.values()],remove:async id=>{map.delete(id);}};}
function fakeClient({uploadError=null,saveError=null}={}){
 const calls={uploads:[],rows:[]};
 return {calls,storage:{from:()=>({upload:async(path)=>{calls.uploads.push(path);return {error:uploadError};}})},from:()=>({upsert:async(row,options)=>{calls.rows.push({row,options});return {error:saveError};}})};
}
const conn=client=>async()=>({client,userId:'u1',writable:true});

test('al confirmarse sale de la cola y la base recibe rutas, no fotos en base64',async()=>{
 const box=memoryBox([record()]),client=fakeClient(),out=await syncOutbox(box,conn(client),{online:true});
 assert.deepEqual(out,{status:'done',sent:1,pending:0});assert.equal(box.map.size,0);
 const {row,options}=client.calls.rows[0];
 assert.equal(options.ignoreDuplicates,true);assert.equal(row.data.id,row.id);
 assert.match(row.data.photos[0].path,/^reports\/u1\/[0-9a-f]{64}\/[0-9a-f]{64}\.jpg$/);
 assert.equal(row.data.photos[0].base64,undefined);
});
test('sin señal, sin cuenta o solo consulta no se pierde nada',async()=>{
 const box=memoryBox([record()]);
 assert.equal((await syncOutbox(box,conn(fakeClient()),{online:false})).status,'offline');
 assert.equal((await syncOutbox(box,async()=>null,{online:true})).status,'signed-out');
 assert.equal((await syncOutbox(box,async()=>({client:fakeClient(),userId:'u',writable:false}),{online:true})).status,'read-only');
 assert.equal(box.map.size,1);
});
test('si falla, conserva lo pendiente y explica el motivo',async()=>{
 const box=memoryBox([record('a'),record('b')]);
 const out=await syncOutbox(box,conn(fakeClient({saveError:{code:'PGRST205',message:'not found'}})),{online:true});
 assert.equal(out.status,'error');assert.equal(out.pending,2);assert.equal(box.map.size,2);
 assert.match(out.message,/base todavía no/);assert.match(queueMessage(out),/2 levantamientos/);
});
test('reintentar es seguro: la foto repetida no bloquea y conserva la misma ruta',async()=>{
 const a=fakeClient({uploadError:{statusCode:'409',message:'The resource already exists'}}),b=fakeClient();
 await uploadSurvey({client:a,userId:'u1'},record());await uploadSurvey({client:b,userId:'u1'},record());
 assert.deepEqual(a.calls.uploads,b.calls.uploads);assert.equal(a.calls.rows.length,1);
});
test('un error real de subida de foto no registra el levantamiento',async()=>{
 const client=fakeClient({uploadError:{statusCode:'500',message:'boom'}});
 await assert.rejects(uploadSurvey({client,userId:'u1'},record()));assert.equal(client.calls.rows.length,0);
});
test('la tabla no permite editar ni borrar desde el navegador y exige cuenta aprobada',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261104140000_vocatus_field_surveys.sql',import.meta.url),'utf8');
 assert.match(sql,/grant select,insert on public\.vocatus_field_surveys to authenticated/);
 assert.doesNotMatch(sql,/grant[^;]*(update|delete)/i);
 assert.match(sql,/as restrictive for insert[\s\S]*vocatus_access\.allowed\(true\)/);
});
test('la conexión reintenta si la sesión se renueva, pero no oculta otros errores',async()=>{
 let tries=0;const wait=async()=>{};
 assert.equal(await surveyConnection({wait,connect:async()=>{if(++tries<2)throw Error('La cuenta cambió.');return 'ok';}}),'ok');
 await assert.rejects(surveyConnection({wait,connect:async()=>{throw Error('otro');}}),/otro/);
});
