import test from 'node:test';
import assert from 'node:assert/strict';
import {accountIdentity,authorizeAccount,createCloudIdentityVerifier,CLOUD_ADMIN_PAGES} from './cloud-identity.mjs';

const user={id:'verified-id',email:'test@example.invalid',email_confirmed_at:'2026-11-02T00:00:00Z',user_metadata:{role:'admin'}};
const account={id:user.id,username:'operario',name:'Cuenta de prueba',active:true,role:'usuario',mustChange:false};

test('la identidad exige Auth verificado, cuenta activa y UUID coincidente; ignora metadata editable',()=>{
 assert.equal(accountIdentity(user,account).role,'usuario');
 for(const value of [null,{...account,id:'other'},{...account,active:false},{...account,role:'owner'}])assert.equal(accountIdentity(user,value),null);
 assert.equal(accountIdentity({...user,email_confirmed_at:null},account),null);
});

test('una sesión rechazada por Auth no llega a consultar perfiles',async()=>{
 let read=false;
 const verify=createCloudIdentityVerifier({auth:{getUser:async()=>({error:new Error('expired')})},readAccount:async()=>{read=true;return account;}});
 assert.equal(await verify('expired'),null);assert.equal(read,false);
});

test('cada petición vuelve a leer roles y estado: JWT anterior no conserva administrador',async()=>{
 let current={...account,role:'admin'};
 const verify=createCloudIdentityVerifier({auth:{getUser:async()=>({data:{user}})},readAccount:async()=>current});
 assert.equal((await verify('valid')).role,'admin');
 current={...current,role:'usuario'};assert.equal((await verify('valid')).role,'usuario');
 current={...current,active:false};assert.equal(await verify('valid'),null);
});

test('la indisponibilidad del almacén falla cerrada, sin inventar una cuenta local',async()=>{
 const verify=createCloudIdentityVerifier({auth:{getUser:async()=>({data:{user}})},readAccount:async()=>{throw Error('database unavailable');}});
 await assert.rejects(verify('valid'),/database unavailable/);
});

test('las acciones delicadas y páginas administrativas requieren admin también sin interfaz',()=>{
 const normal=accountIdentity(user,account),admin={...normal,role:'admin'};
 const paths=[...CLOUD_ADMIN_PAGES].map(pathname=>({pathname}));
 const actions=[
  {pathname:'/api/config',body:{apiKey:'not-a-real-key'}},
  {pathname:'/api/temperature-range',body:{tag:'B30'}},
  {method:'DELETE',pathname:'/api/maintenance',body:{tag:'B30'}},
  ...['move','swap','replace'].map(action=>({pathname:'/api/equipment',body:{action,tag:'B30'}})),
  {pathname:'/api/survey',body:{tag:'B30',clearFields:{modelo:true}}},
 ];
 for(const request of [...paths,...actions]){
  assert.throws(()=>authorizeAccount(normal,request),e=>e.status===403&&e.code==='ADMIN_ONLY');
  assert.equal(authorizeAccount(admin,request).user,admin);
 }
});

test('el trabajo normal sigue permitido, pero una contraseña temporal bloquea operaciones',()=>{
 const normal=accountIdentity(user,account);
 for(const pathname of ['/api/survey','/api/maintenance','/api/work-orders','/api/pump-photo','/api/equipment'])
  assert.equal(authorizeAccount(normal,{method:'POST',pathname,body:{action:'repair'}}).user,normal);
 assert.throws(()=>authorizeAccount(null,{pathname:'/api/bootstrap'}),e=>e.status===401);
 assert.throws(()=>authorizeAccount({...normal,mustChange:true},{pathname:'/api/survey'}),e=>e.code==='PASSWORD_CHANGE');
});
