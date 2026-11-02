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
 const privileged=[],signouts=[];let closed=false;
 const factory=(_url,key)=>({
  auth:{getUser:async()=>({data:{user:identity}}),admin:{signOut:async(token,scope)=>{signouts.push({key,token,scope});closed=true;return {data:null};}}},
  rpc:async(name,input)=>{if(key==='server-test')privileged.push({name,input});return {data:name==='vocatus_account'?(account?{...account,sessionValid:account.sessionValid&&!closed}:null):[]};},
 });
 return {access:createCloudAccess({config,factory}),privileged,signouts};
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

test('logout del servidor revoca Supabase y un JWT antiguo ya no autoriza aunque Auth devuelva el usuario',async()=>{
 const {access,signouts}=backend();
 assert.equal((await route(access,'logout')).status,200);
 assert.deepEqual(signouts,[{key:'server-test',token:'verified-token',scope:'global'}]);
 await assert.rejects(access.authorize({headers:{cookie:'vocatus_cloud_access=verified-token'},method:'GET'},new URL('https://preview.example/api/bootstrap')),e=>e.status===401);
});
test('sync rechaza una sesión revocada y no permite regenerar su cookie',async()=>{
 const {access}=backend({...approved,sessionValid:false});
 assert.equal((await route(access,'sync',{body:{access_token:'old-token'}})).status,401);
});

function profileBackend({conflict=false,existingMember=false,viewer=false}={}){
 let account=null;const calls=[];
 const session={access_token:'verified-token',refresh_token:'refresh-test',expires_in:3600};
 const factory=(_url,key)=>({
  auth:{getUser:async()=>({data:{user:identity}}),
   signInWithPassword:async()=>({data:{user:identity,session}}),
   signUp:async()=>({data:{user:identity,session}})},
  rpc:async(name,input)=>{
   calls.push({key,name,input});
   if(name==='vocatus_account')return {data:account};
   if(name==='vocatus_request_access'){
    if(conflict)return {error:{code:'23505'}};
    if(viewer)return {error:{message:'Tu membresía de consulta sigue vigente. Pedí a un administrador que revise tu perfil antes de solicitar permisos de escritura.'}};
    account={...approved,status:existingMember?'approved':'pending',username:input.p_username,name:input.p_name};
    return {data:account};
   }
   throw Error('No se permite usar administración durante una solicitud');
  },
 });
 return {access:createCloudAccess({config,factory}),calls};
}
test('una identidad Auth existente sin perfil completa solicitud sin crear otra cuenta ni inventar usuario',async()=>{
 const {access,calls}=profileBackend();
 const login=await route(access,'login',{body:{identifier:identity.email,password:'correct-test-password'}});
 assert.equal(login.status,200);assert.equal(login.data.needsProfile,true);assert.equal(login.data.user,null);
 assert.equal(calls.some(x=>x.name==='vocatus_request_access'),false);
 const result=await route(access,'request-profile',{body:{username:'solicitante',name:'Solicitante',role:'admin',status:'approved',active:true}});
 assert.equal(result.status,201);assert.equal(result.data.user.status,'pending');assert.equal(result.data.user.role,'usuario');
 assert.deepEqual(calls.find(x=>x.name==='vocatus_request_access').input,{p_username:'solicitante',p_name:'Solicitante'});
 assert.equal(calls.some(x=>x.key==='server-test'),false);
 assert.equal((await route(access,'request-profile',{body:{username:'otra',name:'Otra'}})).status,403);
});
test('un nombre ocupado después de signup conserva la identidad y ofrece completar la solicitud',async()=>{
 const {access}=profileBackend({conflict:true});
 const result=await route(access,'request',{body:{username:'ocupado',name:'Solicitante',email:identity.email,password:'test-password-123'}});
 assert.equal(result.status,200);assert.equal(result.data.needsProfile,true);
 assert.equal(result.data.session.access_token,'verified-token');
});

test('completar perfil de miembro aprobado no devuelve un estado pendiente',async()=>{
 const {access}=profileBackend({existingMember:true});
 const result=await route(access,'request-profile',{body:{username:'miembro',name:'Miembro'}});
 assert.equal(result.status,201);assert.equal(result.data.pending,false);
 assert.equal(result.data.user.status,'approved');assert.equal(result.data.user.role,'usuario');
});

test('miembro de consulta recibe un error claro y conserva su membresía sin crear perfil pendiente',async()=>{
 const {access,calls}=profileBackend({viewer:true});
 const result=await route(access,'request-profile',{body:{username:'lector',name:'Lector'}});
 assert.equal(result.status,409);assert.match(result.data.error,/acceso de consulta sigue vigente/);
 assert.equal(calls.some(x=>x.key==='server-test'),false);
});
