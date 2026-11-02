// Pruebas remotas REALES, exclusivamente proyecto temporal y cuentas sintéticas.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const TEST_REF='rbiuaucawhmiqvqomqec',SHARED_REF='gtfqhljbxyanfyrarykw';
if(!process.env.VOCATUS_QA_CREDENTIALS||!process.env.VOCATUS_QA_REPORT)throw Error('Faltan rutas privadas de fixtures/reporte.');
const fixtures=JSON.parse(await readFile(process.env.VOCATUS_QA_CREDENTIALS,'utf8'));
assert.equal(fixtures.projectRef,TEST_REF);assert.notEqual(fixtures.projectRef,SHARED_REF);
const url=`https://${TEST_REF}.supabase.co`,run=randomUUID(),checks=[];
const options={auth:{persistSession:false,autoRefreshToken:false}};
let driver=fixtures.qaDriver||'adminA',photoPath,entity,order,report,publishedPhoto=false;
const client=name=>createClient(url,fixtures.publicKey,{...options,global:{headers:{Authorization:'Bearer '+fixtures.sessions[name].access_token}}});
const ok=r=>{if(r.error)throw Error(r.error.message);return r.data;};
async function call(name,route,body={},method='POST',outer=driver){
 const response=await fetch(`${url}/functions/v1/vocatus-isolated-account-qa`,{method:'POST',headers:{apikey:fixtures.publicKey,Authorization:'Bearer '+fixtures.sessions[outer].access_token,'Content-Type':'application/json'},body:JSON.stringify({route,method,body,token:fixtures.sessions[name].access_token})});
 if(!response.ok){if([401,403].includes(response.status))return {status:response.status,data:{error:'QA authorization denied'},transport:'edge'};throw Error('Coordinador aislado HTTP '+response.status);}
 return response.json();
}
async function login(name,password=fixtures.users[name].password){
 const c=createClient(url,fixtures.publicKey,options);const result=await c.auth.signInWithPassword({email:fixtures.users[name].email,password});ok(result);fixtures.sessions[name]=result.data.session;
 return result.data.session;
}
async function check(name,fn){try{await fn();checks.push({name,passed:true});console.log('PASS '+name);}catch(e){const error=String(e.message).replace(/eyJ[A-Za-z0-9_.-]+/g,'[TOKEN]');checks.push({name,passed:false,error});console.log('FAIL '+name+': '+error);}}

// No iniciar pruebas destructivas de estado si una preparación anterior no terminó.
for(const name of ['adminA','adminB']){const a=ok(await client(name).rpc('vocatus_account'));if(a?.role!=='admin'||!a.active||a.status!=='approved')throw Error('Fixtures no preparados: faltan dos administradores activos.');}
if(ok(await client('newMember').rpc('vocatus_account'))!==null)throw Error('Fixtures no preparados: el miembro nuevo ya tiene perfil.');
for(const name of ['pending','rejected','disabled']){const a=ok(await client(name).rpc('vocatus_account'));if(a&&a.status!=='pending')throw Error('Fixtures no preparados: estado inicial incorrecto.');}

await check('sesión real posterior a la revocación dentro del mismo segundo',async()=>{
 assert.equal(ok(await client('editor').rpc('vocatus_account')).sessionValid,true);
});
await check('miembro activo sin perfil conserva permisos y obtiene perfil aprobado',async()=>{
 const c=client('newMember');assert.equal(ok(await c.rpc('vocatus_account')),null);
 const account=ok(await c.rpc('vocatus_request_access',{p_username:'existing-'+run.slice(0,8),p_name:'Miembro sintético existente'}));
 assert.equal(account.status,'approved');assert.equal(account.role,'usuario');assert.equal(account.active,true);
});
await check('solicitudes de cuentas no miembros quedan pendientes',async()=>{
 for(const name of ['pending','rejected','disabled']){
  const a=ok(await client(name).rpc('vocatus_request_access',{p_username:name+'-'+run.slice(0,8),p_name:'Cuenta sintética '+name}));
  assert.equal(a.status,'pending');assert.equal(a.role,'usuario');
 }
});
await check('autoaprobación, cambio de rol propio y acceso directo a gestión bloqueados',async()=>{
 for(const [action,body]of [['approve',{}],['update',{role:'usuario'}],['update',{active:false}]]){
  const r=await call('adminA','users/'+fixtures.users.adminA.id+(action==='approve'?'/approve':''),body);
  assert.notEqual(r.status,200);
 }
 const direct=await client('pending').rpc('vocatus_manage_account',{p_actor:fixtures.users.pending.id,p_target:fixtures.users.pending.id,p_action:'approve',p_input:{}});
 assert.ok(direct.error);assert.equal(ok(await client('pending').rpc('vocatus_account')).status,'pending');
});
await check('administrador aprueba y rechaza solicitudes reales',async()=>{
 assert.equal((await call('adminA','users/'+fixtures.users.rejected.id+'/reject')).status,200);
 assert.equal((await call('adminA','users/'+fixtures.users.disabled.id+'/approve')).status,200);
 assert.equal(ok(await client('rejected').rpc('vocatus_account')).status,'rejected');
 assert.equal(ok(await client('disabled').rpc('vocatus_account')).status,'approved');
});
await check('miembro previo lee, sube imagen sintética y ejecuta publish_photo con su sesión previa',async()=>{
 const c=client('editor'),bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
 photoPath=`vocatus/${fixtures.users.editor.id}/${run}.png`;entity='qa:B30:'+run;
 ok(await c.storage.from('vocatus-photos').upload(photoPath,bytes,{contentType:'image/png',upsert:false}));
 const published=ok(await c.rpc('vocatus_publish_photo',{p_entity:entity,p_slot:'bomba',p_expected:0,p_path:photoPath}));assert.equal(published[0].revision,1);publishedPhoto=true;
 assert.equal(ok(await c.from('vocatus_photos').select('*').eq('entity_key',entity)).length,1);
 assert.equal(ok(await c.from('vocatus_photo_versions').select('*').eq('entity_key',entity)).length,1);
 const blob=ok(await c.storage.from('vocatus-photos').download(photoPath));assert.equal(createHash('sha256').update(Buffer.from(await blob.arrayBuffer())).digest('hex'),createHash('sha256').update(bytes).digest('hex'));
});
await check('pendiente y rechazado no leen ni suben ni publican fotos',async()=>{
 assert.ok(photoPath&&publishedPhoto,'Falta el control positivo de publicación');
 for(const name of ['pending','rejected']){
  const c=client(name);assert.equal(ok(await c.from('vocatus_photos').select('*').eq('entity_key',entity)).length,0);
  assert.ok((await c.storage.from('vocatus-photos').download(photoPath)).error);
  assert.ok((await c.storage.from('vocatus-photos').upload(`vocatus/${fixtures.users[name].id}/${run}.png`,new Uint8Array([1,2,3]),{contentType:'image/png'})).error);
  assert.ok((await c.rpc('vocatus_publish_photo',{p_entity:entity,p_slot:'bomba',p_expected:1,p_path:photoPath})).error);
 }
});
await check('desactivar cierra acceso de sesión abierta y renovar no la reabre, ni tras reactivar',async()=>{
 assert.ok(publishedPhoto,'Falta el control positivo de publicación');
 const old=fixtures.sessions.disabled;
 const ownedPath=`vocatus/${fixtures.users.disabled.id}/${run}-owned.png`,ownedEntity='qa:disabled:'+run;
 const sample=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
 ok(await client('disabled').storage.from('vocatus-photos').upload(ownedPath,sample,{contentType:'image/png',upsert:false}));
 ok(await client('disabled').rpc('vocatus_publish_photo',{p_entity:ownedEntity,p_slot:'bomba',p_expected:0,p_path:ownedPath}));
 assert.equal((await call('adminA','users/'+fixtures.users.disabled.id,{active:false})).status,200);
 assert.equal(ok(await client('disabled').from('vocatus_photos').select('*').eq('entity_key',entity)).length,0);
 assert.ok((await client('disabled').storage.from('vocatus-photos').download(ownedPath)).error);
 assert.ok((await client('disabled').storage.from('vocatus-photos').upload(ownedPath+'-denied.png',sample,{contentType:'image/png'})).error);
 const blockedPublish=await client('disabled').rpc('vocatus_publish_photo',{p_entity:ownedEntity,p_slot:'bomba',p_expected:1,p_path:ownedPath});
 assert.ok(blockedPublish.error);assert.match(blockedPublish.error.message,/ACCOUNT_ACCESS_DENIED/);
 const renewed=await createClient(url,fixtures.publicKey,options).auth.refreshSession({refresh_token:old.refresh_token});
 if(!renewed.error){fixtures.sessions.disabled=renewed.data.session;assert.equal(ok(await client('disabled').rpc('vocatus_account')).sessionValid,false);}
 assert.equal((await call('adminA','users/'+fixtures.users.disabled.id,{active:true})).status,200);
 assert.equal(ok(await client('disabled').rpc('vocatus_account')).sessionValid,false);
 await login('disabled');assert.equal(ok(await client('disabled').rpc('vocatus_account')).sessionValid,true);
 assert.equal(ok(await client('disabled').rpc('vocatus_publish_photo',{p_entity:ownedEntity,p_slot:'bomba',p_expected:1,p_path:ownedPath}))[0].revision,2);
});
await check('usuario crea orden y la cierra con un informe real',async()=>{
 const c=client('editor');order=ok(await c.rpc('vocatus_save_work_order',{p_input:{tag:'B30',title:'Inspección sintética '+run,assignee:'QA aislado',due:'2026-11-03',priority:'media',type:'inspeccion',status:'pendiente'}}));
 assert.equal(order.status,'pendiente');
 report=ok(await c.rpc('vocatus_save_work_report',{p_input:{id:run,tag:'B30',date:'2026-11-02',title:'Informe sintético',author:'QA aislado',text:'Sin datos reales',operativo:'si',workOrderId:order.id,evidence:[]}}));
 assert.equal(report.workOrderId,order.id);
 assert.equal(ok(await c.from('vocatus_work_orders').select('data').eq('id',order.id))[0].data.status,'completada');
});
await check('solo administrador archiva informe y queda bitácora',async()=>{
 assert.ok(report);const c=client('editor');const denied=await c.from('vocatus_work_reports').update({archived_at:new Date().toISOString()}).eq('tag','B30').eq('source_id',run);assert.ok(denied.error);
 ok(await client('adminA').from('vocatus_work_reports').update({archived_at:new Date().toISOString()}).eq('tag','B30').eq('source_id',run));
 const audit=await call('adminA','audit',{},'GET');assert.equal(audit.status,200);assert.ok(audit.data.entries.some(x=>x.action==='report_archive'));
});
await check('restablecer, cambiar contraseña y volver a entrar inmediatamente sin espera artificial',async()=>{
 const r=await call('adminA','users/'+fixtures.users.disabled.id+'/reset');assert.equal(r.status,200);assert.ok(r.data.password);
 const signed=await call('disabled','login',{identifier:fixtures.users.disabled.email,password:r.data.password});assert.equal(signed.status,200);assert.equal(signed.data.user.mustChange,true);fixtures.sessions.disabled=signed.data.session;
 const password='QAtest-'+randomUUID();const changed=await call('disabled','change-password',{current:r.data.password,next:password});assert.equal(changed.status,200);assert.equal(changed.data.user.mustChange,false);assert.equal(changed.data.user.sessionValid,true);
 fixtures.users.disabled.password=password;fixtures.sessions.disabled=changed.data.session;
 await login('disabled');assert.equal(ok(await client('disabled').rpc('vocatus_account')).sessionValid,true);
});
await check('dos administradores no pueden degradarse/desactivarse mutuamente dejando cero administradores',async()=>{
 const outcomes=await Promise.all([
  call('adminA','users/'+fixtures.users.adminB.id,{role:'usuario'},'POST','adminA'),
  call('adminB','users/'+fixtures.users.adminA.id,{active:false},'POST','adminB'),
 ]);
 assert.equal(outcomes.filter(x=>x.status===200).length,1);
 const [a,b]=await Promise.all(['adminA','adminB'].map(async name=>({name,account:ok(await client(name).rpc('vocatus_account'))})));
 const remaining=[a,b].filter(x=>x.account.role==='admin'&&x.account.active&&x.account.status==='approved');assert.equal(remaining.length,1);driver=remaining[0].name;fixtures.qaDriver=driver;
});

await writeFile(process.env.VOCATUS_QA_CREDENTIALS,JSON.stringify(fixtures,null,2));
const result={projectRef:TEST_REF,syntheticDataOnly:true,run,checks,passed:checks.filter(x=>x.passed).length,failed:checks.filter(x=>!x.passed).length};
await writeFile(process.env.VOCATUS_QA_REPORT,JSON.stringify(result,null,2));
console.log(`RESULT ${result.passed}/${checks.length} passed; ${result.failed} failed`);
if(result.failed)process.exitCode=1;
