import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadSharedPhotoRows} from './public/cloud-photo-core.js';

const source=(await readFile(new URL('./public/cloud-photos.js',import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const account=id=>({user:{id,email:id+'@example.invalid'}});
const allowed={data:{read:true,write:true}};
function deferred(){let resolve,reject;const promise=new Promise((ok,no)=>{resolve=ok;reject=no;});return {promise,resolve,reject};}

async function fixture(){
 let authChanged,time=1000,calls=0,queries=0,respond=async()=>allowed;
 const fakeSupabase={
  auth:{getSession:async()=>({data:{session:account('user-a')}}),onAuthStateChange(callback){authChanged=callback;}},
  async rpc(name){assert.equal(name,'vocatus_photo_permissions');calls++;return respond(calls);},
  channel(){return {on(){return this;},subscribe(){}};},
  from(){return {select(){return this;},async eq(){queries++;return {data:[]};}};}
 };
 const dependencies={cloudPhotoConfig:{enabled:true},loadSharedPhotoRows,fakeSupabase,Date:{now:()=>time},
  document:{addEventListener(){},dispatchEvent(){}},window:{addEventListener(){}},
  URL:{revokeObjectURL(){}},setTimeout(){},setInterval(){}
 };
 const api=new Function(...Object.keys(dependencies),source+'\nclientPromise=Promise.resolve(fakeSupabase);return {startCloudPhotos,cloudSession,sharedPhotos,cloudTransport};')(...Object.values(dependencies));
 await api.startCloudPhotos();
 return {...api,get calls(){return calls;},get queries(){return queries;},respond(fn){respond=fn;},advance(ms){time+=ms;},emit(event,next){authChanged(event,next);}};
}

test('diez lecturas simultáneas comparten una consulta de permisos y conservan sus lecturas de datos',async()=>{
 const f=await fixture();
 await Promise.all(Array.from({length:10},()=>f.sharedPhotos('B30')));
 assert.equal(f.calls,1);assert.equal(f.queries,10);
 await f.sharedPhotos('B31');assert.equal(f.calls,1);assert.equal(f.queries,11);
});

test('caché de permisos expira a los treinta segundos y deduplica la renovación',async()=>{
 const f=await fixture();await f.sharedPhotos('B30');
 f.advance(29999);await f.sharedPhotos('B30');assert.equal(f.calls,1);
 f.advance(1);await Promise.all([f.sharedPhotos('B30'),f.sharedPhotos('B31')]);assert.equal(f.calls,2);
});

test('cerrar sesión evita lecturas y entrar con otra cuenta no hereda la caché anterior',async()=>{
 const f=await fixture();await f.sharedPhotos('B30');
 f.emit('SIGNED_OUT',null);
 assert.equal(await f.cloudSession(),null);
 const empty=await f.sharedPhotos('B30');assert.equal(Object.keys(empty).length,0);assert.match(empty.warning,/Conectá/);
 assert.equal(f.queries,1);assert.equal(f.calls,1);
 f.emit('SIGNED_IN',account('user-b'));
 assert.equal((await f.cloudSession()).user.id,'user-b');assert.equal(f.calls,2);
});

test('TOKEN_REFRESHED invalida los permisos aun cuando conserva el mismo usuario',async()=>{
 const f=await fixture();await f.cloudSession();
 f.emit('TOKEN_REFRESHED',account('user-a'));await f.cloudSession();assert.equal(f.calls,2);
});

test('error de red no se guarda y la siguiente lectura vuelve a consultar permisos',async()=>{
 const f=await fixture();f.respond(async call=>call===1?{error:Error('red temporal')}:allowed);
 await assert.rejects(f.sharedPhotos('B30'),/red temporal/);assert.equal(f.queries,0);
 await f.sharedPhotos('B30');assert.equal(f.calls,2);assert.equal(f.queries,1);
});

test('rechazo de transporte tampoco deja una promesa fallida persistente',async()=>{
 const f=await fixture();f.respond(async call=>{if(call===1)throw Error('transporte rechazado');return allowed;});
 await assert.rejects(f.cloudSession(),/transporte rechazado/);
 assert.equal((await f.cloudSession()).user.id,'user-a');assert.equal(f.calls,2);
});

test('permisos denegados no autorizan lectura ni se reutilizan como autorización válida',async()=>{
 const f=await fixture();f.respond(async call=>call===1?{data:{read:false,write:false}}:allowed);
 await assert.rejects(f.sharedPhotos('B30'),/no está autorizada/);assert.equal(f.queries,0);
 await f.sharedPhotos('B30');assert.equal(f.calls,2);assert.equal(f.queries,1);
});

test('respuesta anterior a un cambio de cuenta no modifica los permisos de la nueva sesión',async()=>{
 const f=await fixture(),old=deferred(),started=deferred();
 f.respond(async call=>{if(call===1){started.resolve();return old.promise;}return {data:{read:true,write:false}};});
 const previous=f.cloudSession();const rejected=assert.rejects(previous,/cuenta cambió/);await started.promise;
 f.emit('SIGNED_IN',account('user-b'));
 assert.equal((await f.cloudSession()).user.id,'user-b');assert.equal(f.calls,2);
 old.resolve(allowed);await rejected;
 await assert.rejects(f.cloudTransport(),/permiso de consulta/);assert.equal(f.calls,2);
});

test('respuesta anterior a renovar token no restaura permisos de una generación vencida',async()=>{
 const f=await fixture(),old=deferred(),started=deferred();
 f.respond(async call=>{if(call===1){started.resolve();return old.promise;}return {data:{read:true,write:false}};});
 const rejected=assert.rejects(f.cloudSession(),/cuenta cambió/);await started.promise;
 f.emit('TOKEN_REFRESHED',account('user-a'));await f.cloudSession();
 old.resolve(allowed);await rejected;
 await assert.rejects(f.cloudTransport(),/permiso de consulta/);assert.equal(f.calls,2);
});
