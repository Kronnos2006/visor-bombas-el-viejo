import test from 'node:test';
import assert from 'node:assert/strict';
import {cloudPageAccess} from './cloud-edge-access.js';
import {createCloudAccess,cloudConfiguration} from './cloud-access.mjs';

const id='11111111-1111-4111-8111-111111111111';
const identity={id,email:'test@example.invalid',email_confirmed_at:'2026-11-02T00:00:00Z'};
const approved={id,username:'operario',name:'Operario',role:'usuario',active:true,status:'approved',mustChange:false,sessionValid:true};
const config={url:'https://example.supabase.co',key:'public-test',secret:'server-test'};
const request=(path,cookie=true)=>new Request('https://preview.example'+path,{headers:cookie?{cookie:'vocatus_cloud_access=verified-token'}:{}});
const provider=(account=approved)=>async url=>new Response(JSON.stringify(url.endsWith('/auth/v1/user')?identity:account),{status:200});

test('sin cookie no se obtiene ninguna página, API ni archivo protegido',async()=>{
 let calls=0;
 for(const path of ['/','/levantamiento.html','/avance.html','/api/bootstrap','/api/pump?tag=B30','/app.js','/modelos/planta.glb','/expediente/B30-placa.jpg']){
  const r=await cloudPageAccess(request(path,false),{...config,fetcher:async()=>{calls++;throw Error('No debe consultar');}});
  assert.ok([302,401].includes(r.status),path);
 }
 assert.equal(calls,0);
});
test('cuenta pendiente, rechazada, inactiva y JWT revocado no obtienen datos mediante URLs directas',async()=>{
 for(const account of [{...approved,status:'pending'},{...approved,status:'rejected'},{...approved,active:false},{...approved,sessionValid:false}]){
  for(const path of ['/','/api/bootstrap','/expediente/B30-placa.jpg']){
   assert.equal((await cloudPageAccess(request(path),{...config,fetcher:provider(account)})).status,403);
  }
 }
});
test('ni JWT inventado ni identidad de otro usuario ni indisponibilidad abren el visor',async()=>{
 assert.equal((await cloudPageAccess(request('/api/bootstrap'),{...config,fetcher:async()=>new Response('{}',{status:401})})).status,401);
 assert.equal((await cloudPageAccess(request('/api/bootstrap'),{...config,fetcher:provider({...approved,id:'other'})})).status,403);
 assert.equal((await cloudPageAccess(request('/api/bootstrap'),{...config,fetcher:async()=>{throw Error('offline');}})).status,503);
});
test('usuario aprobado consulta pero no obtiene páginas administrativas; admin sí',async()=>{
 assert.equal(await cloudPageAccess(request('/api/bootstrap'),{...config,fetcher:provider()}),null);
 for(const path of ['/usuarios.html','/usuarios.js','/equipo.html','/equipo.js']){
  assert.equal((await cloudPageAccess(request(path),{...config,fetcher:provider()})).status,403);
  assert.equal(await cloudPageAccess(request(path),{...config,fetcher:provider({...approved,role:'admin'})}),null);
 }
});
test('el acceso y sus recursos mínimos son públicos; la carpeta de imágenes y los modelos no',async()=>{
 assert.equal(await cloudPageAccess(request('/login.html',false),config),null);
 assert.equal(await cloudPageAccess(request('/acceso.css',false),config),null);
 assert.equal((await cloudPageAccess(request('/marca/otro.png',false),config)).status,401);
});

function backend(account=approved){
 const privileged=[];
 const factory=(_url,key)=>({
  auth:{getUser:async()=>({data:{user:identity}})},
  rpc:async(name,input)=>{if(key==='server-test')privileged.push({name,input});return {data:name==='vocatus_account'?account:[]};},
 });
 return {access:createCloudAccess({config,factory}),privileged};
}
async function route(access,path,{method='POST',origin='https://preview.example',body={}}={}){
 const headers={'x-original-host':'preview.example',cookie:'vocatus_cloud_access=verified-token',origin,'content-type':'application/json'};
 let result;const res={setHeader(){}};
 await access.route({req:{headers,method},res,url:new URL('https://preview.example/api/auth/'+path),payload:async()=>body,send:(_res,status,data)=>{result={status,data};}});
 return result;
}
test('administración por API rechaza usuario, pendiente y temporal antes de usar la clave privada',async()=>{
 for(const account of [approved,{...approved,role:'admin',status:'pending'},{...approved,role:'admin',mustChange:true}]){
  const {access,privileged}=backend(account);
  for(const path of ['users','audit','users/'+id+'/approve','users/'+id+'/reset']){
   assert.equal((await route(access,path,{method:path==='audit'?'GET':'POST'})).status,403);
  }
  assert.equal(privileged.length,0);
 }
});
test('administración usa el UUID verificado como actor, nunca el enviado por el navegador',async()=>{
 const {access,privileged}=backend({...approved,role:'admin'});
 const target='22222222-2222-4222-8222-222222222222';
 assert.equal((await route(access,'users/'+target+'/approve',{body:{actor:'inventado',role:'admin'}})).status,200);
 assert.equal(privileged[0].input.p_actor,id);
 assert.equal(privileged[0].input.p_target,target);
});
test('CSRF y origen ausente fallan antes de operaciones privilegiadas',async()=>{
 const {access,privileged}=backend({...approved,role:'admin'});
 assert.equal((await route(access,'users/'+id+'/reset',{origin:'https://otro.example'})).status,403);
 assert.equal((await route(access,'users/'+id+'/reset',{origin:''})).status,403);
 assert.equal(privileged.length,0);
});
test('sin configuración privada el servidor no cae al almacén local',()=>{
 assert.throws(()=>cloudConfiguration({}),e=>e.status===503);
});
