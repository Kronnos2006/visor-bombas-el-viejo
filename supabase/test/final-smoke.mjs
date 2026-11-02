// Comprobación posterior de límites de buckets y última revisión del servidor.
// Solo proyecto temporal; nunca carga datos ni claves del proyecto compartido.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
const projectRef='rbiuaucawhmiqvqomqec';
if(!process.env.VOCATUS_QA_CREDENTIALS||!process.env.VOCATUS_QA_REPORT)throw Error('Faltan rutas privadas.');
const f=JSON.parse(await readFile(process.env.VOCATUS_QA_CREDENTIALS,'utf8'));
assert.equal(f.projectRef,projectRef);
const url=`https://${projectRef}.supabase.co`,driver=f.qaDriver;
const checks=[];
for(const [name,role]of [['editor','usuario'],[driver,'admin']]){
 const response=await fetch(url+'/functions/v1/vocatus-isolated-account-qa',{
  method:'POST',headers:{apikey:f.publicKey,Authorization:'Bearer '+f.sessions[driver].access_token,'Content-Type':'application/json'},
  body:JSON.stringify({route:'login',body:{identifier:f.users[name].email,password:f.users[name].password}}),
 });
 assert.equal(response.status,200);
 const result=await response.json();assert.equal(result.status,200);
 assert.equal(result.data.user.role,role);assert.equal(result.data.user.status,'approved');
 checks.push({name:'entrada servidor actual '+role,passed:true});
}
const c=createClient(url,f.publicKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:'Bearer '+f.sessions.editor.access_token}}});
const run=randomUUID(),path=`vocatus/${f.users.editor.id}/${run}.png`;
const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');
const ok=r=>{assert.equal(r.error,null,r.error?.message);return r.data;};
ok(await c.storage.from('vocatus-photos').upload(path,bytes,{contentType:'image/png',upsert:false}));
assert.equal(ok(await c.rpc('vocatus_publish_photo',{p_entity:'QA-FINAL-'+run,p_slot:'bomba',p_expected:0,p_path:path}))[0].revision,1);
const downloaded=Buffer.from(await ok(await c.storage.from('vocatus-photos').download(path)).arrayBuffer());
assert.equal(createHash('sha256').update(downloaded).digest('hex'),createHash('sha256').update(bytes).digest('hex'));
checks.push({name:'subir, publicar y descargar con límites actuales del bucket',passed:true});
await writeFile(process.env.VOCATUS_QA_REPORT,JSON.stringify({projectRef,syntheticDataOnly:true,checks,passed:checks.length,failed:0},null,2)+'\n');
console.log('PASS '+checks.length+' comprobaciones finales aisladas');
