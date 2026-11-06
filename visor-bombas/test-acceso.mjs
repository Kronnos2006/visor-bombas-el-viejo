import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {authStore,delicateAction} from './auth.mjs';
import {handler,useAccess} from './server.mjs';

async function server(t){
 const dir=await mkdtemp(path.join(os.tmpdir(),'vocatus-acceso-'));useAccess(authStore(dir));
 const srv=http.createServer(handler);await new Promise(ok=>srv.listen(0,'127.0.0.1',ok));
 t.after(async()=>{useAccess(null);srv.close();await rm(dir,{recursive:true,force:true});});
 const base=`http://127.0.0.1:${srv.address().port}`;
 const client=()=>{let cookie='';return async(url,body,method,extra={})=>{const r=await fetch(base+url,{redirect:'manual',method:method||(body?'POST':'GET'),headers:{...(cookie?{cookie}:{}),...(body?{'Content-Type':'application/json',Origin:base}:{}),...extra},body:body?JSON.stringify(body):undefined});const set=r.headers.get('set-cookie');if(set)cookie=set.split(';')[0];const type=r.headers.get('content-type')||'';return {status:r.status,location:r.headers.get('location'),data:type.includes('json')?await r.json():await r.text()};};};
 return {dir,client};
}
const admin={name:'Ana Admin',username:'ana',password:'clave-segura-1'};

test('sin sesión no se abre nada, salvo la pantalla de entrada',async t=>{
 const {client}=await server(t),c=client();
 const page=await c('/');assert.equal(page.status,302);assert.match(page.location,/^\/login\.html/);
 assert.equal((await c('/api/bootstrap')).status,401);
 assert.equal((await c('/app.js')).status,401);
 assert.equal((await c('/login.html')).status,200);
});
test('primer administrador, entrada por usuario o correo y sesión cerrada',async t=>{
 const {client}=await server(t),c=client();
 assert.equal((await c('/api/auth/state')).data.setupAllowed,true);
 assert.equal((await c('/api/auth/setup',{...admin,email:'ana@ejemplo.cr'})).status,201);
 assert.equal((await client()('/api/auth/setup',{...admin,username:'otra'})).status,409,'no se puede crear otro primer administrador');
 const home=await c('/');assert.equal(home.status,200);assert.match(home.data,/sesion\.js/);
 assert.equal((await c('/api/auth/logout',{})).status,200);assert.equal((await c('/api/bootstrap')).status,401);
 for(const identifier of ['ana','ANA@ejemplo.cr']){const n=client();assert.equal((await n('/api/auth/login',{identifier,password:admin.password})).status,200,identifier);assert.equal((await n('/api/bootstrap')).status,200);}
 const wrong=await client()('/api/auth/login',{identifier:'ana',password:'mala-clave'});assert.equal(wrong.status,401);assert.doesNotMatch(JSON.stringify(wrong.data),/hash|salt/);
});
test('un usuario nuevo cambia su contraseña temporal y no abre lo de administrador',async t=>{
 const {client,dir}=await server(t),a=client();await a('/api/auth/setup',admin);
 const made=await a('/api/auth/users',{name:'Beto',username:'beto',role:'usuario'});assert.equal(made.status,201);
 const u=client();assert.equal((await u('/api/auth/login',{identifier:'beto',password:made.data.password})).status,200);
 assert.equal((await u('/api/bootstrap')).data.code,'PASSWORD_CHANGE');
 assert.match((await u('/')).location,/cambiar=1/);
 const same=await u('/api/auth/change-password',{current:'incorrecta',next:'nueva-clave-2'});assert.equal(same.status,401);
 assert.equal((await u('/api/auth/me')).status,200,'un error al cambiar no cierra la sesión');
 assert.equal((await u('/api/auth/change-password',{current:made.data.password,next:'nueva-clave-2'})).status,200);
 assert.equal((await u('/api/bootstrap')).status,200);
 assert.equal((await u('/api/auth/users')).status,403);
 assert.equal((await u('/api/auth/users',{name:'X',username:'xxx',role:'admin'})).status,403);
 assert.match((await u('/usuarios.html')).location,/sinpermiso/);
 assert.match((await u('/equipo.html')).location,/sinpermiso/);
 const raw=await readFile(path.join(dir,'usuarios.json'),'utf8');assert.ok(!raw.includes('nueva-clave-2'));assert.ok(!raw.includes(admin.password));
});
test('las acciones delicadas se reconocen y el trabajo normal sigue libre',()=>{
 for(const [m,p,b] of [['POST','/api/config',{}],['POST','/api/temperature-range',{tag:'B1'}],['DELETE','/api/maintenance',{tag:'B1'}],['POST','/api/equipment',{action:'move',tag:'B1'}],['POST','/api/equipment',{action:'swap',tag:'B1',other:'B2'}],['POST','/api/equipment',{action:'replace',tag:'B1'}],['POST','/api/survey',{tag:'B1',clearFields:{marca:'X'}}]])assert.ok(delicateAction(m,p,b),p);
 for(const [m,p,b] of [['POST','/api/survey',{tag:'B1',fields:{marca:'X'}}],['POST','/api/maintenance',{tag:'B1'}],['POST','/api/equipment',{action:'repair',tag:'B1'}],['POST','/api/equipment',{action:'repair-return',tag:'B1'}],['POST','/api/pump-photo',{}],['POST','/api/ask',{}]])assert.equal(delicateAction(m,p,b),'',p);
});
test('el servidor rechaza a un usuario normal una acción delicada aunque tenga la sesión local',async t=>{
 const {client}=await server(t),a=client();await a('/api/auth/setup',admin);
 const made=await a('/api/auth/users',{name:'Beto',username:'beto',role:'usuario'}),u=client();
 await u('/api/auth/login',{identifier:'beto',password:made.data.password});await u('/api/auth/change-password',{current:made.data.password,next:'nueva-clave-2'});
 const local=(await u('/api/bootstrap')).data.token;assert.ok(local,'el visor entrega su token local');
 const denied=await u('/api/config',{apiKey:''},'POST',{'X-Local-Token':local});assert.equal(denied.status,403);assert.equal(denied.data.code,'ADMIN_ONLY');
 const moved=await u('/api/equipment',{action:'move',tag:'B1'},'POST',{'X-Local-Token':local});assert.equal(moved.status,403);
 const allowed=await a('/api/config',{apiKey:''},'POST',{'X-Local-Token':local});assert.equal(allowed.status,200);
 await new Promise(ok=>setTimeout(ok,50));assert.ok((await a('/api/auth/audit')).data.entries.some(e=>e.actor==='ana'&&/Gemini/.test(e.action)));
});
test('siempre queda un administrador; desactivar y restablecer cierran la sesión',async t=>{
 const {client}=await server(t),a=client();await a('/api/auth/setup',admin);
 const me=(await a('/api/auth/me')).data.user;
 assert.equal((await a(`/api/auth/users/${me.id}`,{active:false})).status,409);
 assert.equal((await a(`/api/auth/users/${me.id}`,{role:'usuario'})).status,409);
 const made=await a('/api/auth/users',{name:'Beto',username:'beto',role:'usuario'}),u=client();
 await u('/api/auth/login',{identifier:'beto',password:made.data.password});assert.equal((await u('/api/auth/me')).status,200);
 const reset=await a(`/api/auth/users/${made.data.user.id}/reset`,{});assert.notEqual(reset.data.password,made.data.password);assert.equal((await u('/api/auth/me')).status,401);
 await u('/api/auth/login',{identifier:'beto',password:reset.data.password});
 await a(`/api/auth/users/${made.data.user.id}`,{active:false});assert.equal((await u('/api/auth/me')).status,401);
 assert.equal((await client()('/api/auth/login',{identifier:'beto',password:reset.data.password})).status,401);
 const log=(await a('/api/auth/audit')).data.entries.map(e=>e.action);assert.ok(log.includes('Restableció una contraseña'));
});
test('cinco intentos fallidos bloquean la cuenta y otro origen no puede entrar',async t=>{
 const {client}=await server(t),a=client();await a('/api/auth/setup',admin);
 for(let i=0;i<5;i++)assert.equal((await client()('/api/auth/login',{identifier:'ana',password:'mala-clave'})).status,401);
 assert.equal((await client()('/api/auth/login',{identifier:'ana',password:admin.password})).status,429);
 assert.equal((await client()('/api/auth/login',{identifier:'ana',password:admin.password},'POST',{Origin:'https://sitio-ajeno.example'})).status,403);
});
