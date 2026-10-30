import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {optionsOf,validateAudit,validateSnapshot,safeObjectPath,downloadObject,backup,verify,fetchRead} from '../00-Proyecto/scripts/supabase-operaciones.mjs';

const capture={
 version:1,captured_at:'2026-10-30T15:00:00Z',counts:{current:1,versions:1,objects:1},
 checks:['archivos_actuales','archivos_sin_referencia','archivos_versiones','bucket_privado','funciones_publicas_protegidas','historial_actual','metadatos_archivos','miembro_confirmado','realtime_fotos','rls_tablas','sin_escritura_directa','sin_lectura_anonima'].map(id=>({id,ok:true,severity:id==='archivos_sin_referencia'?'warning':'error'}))
};
const snapshot=()=>({
 project:'gtfqhljbxyanfyrarykw',exported_at:capture.captured_at,members:[],project_info:[],structure:{columns:[]},
 storage_buckets:[{id:'vocatus-photos',public:false}],
 storage_objects:[{bucket_id:'vocatus-photos',name:'vocatus/test/photo.jpg',metadata:{size:3,mimetype:'image/jpeg'}}],
 vocatus_photos:[{object_path:'vocatus/test/photo.jpg',bytes:3,mime:'image/jpeg'}],vocatus_photo_versions:[]
});
async function temp(t){
 const folder=await mkdtemp(path.join(os.tmpdir(),'vocatus-supabase-test-'));
 t.after(async()=>{
  const relative=path.relative(path.resolve(os.tmpdir()),path.resolve(folder));
  if(!relative.startsWith('..')&&!path.isAbsolute(relative)&&path.basename(folder).startsWith('vocatus-supabase-test-'))await rm(folder,{recursive:true,force:true});
 });
 return folder;
}
test('auditoria no aprueba capturas vacias ni controles rebajados',()=>{
 assert.throws(()=>validateAudit({version:1,checks:[],counts:{},captured_at:capture.captured_at}),/Falta control/);
 assert.deepEqual(validateAudit(capture),{errors:0,warnings:0});
 const data=structuredClone(capture);data.checks[0].ok=false;
 assert.equal(validateAudit(data).errors,1);
 data.checks[0].severity='warning';assert.throws(()=>validateAudit(data),/invalido/);
});
test('rutas de Storage no pueden escapar del respaldo ni usar rutas Windows',()=>{
 for(const name of ['../secreto','vocatus/../../fuera','C:/secreto','vocatus\\fuera','/absoluta','vocatus//foto','vocatus/./foto','vocatus/a\0b'])assert.throws(()=>safeObjectPath(os.tmpdir(),'vocatus-photos',name));
 assert.throws(()=>safeObjectPath(os.tmpdir(),'otro-bucket','a.jpg'));
});
test('rechaza otro proyecto y fotos sin archivo',()=>{
 assert.equal(validateSnapshot(snapshot()).storage_objects.length,1);
 const data=snapshot();data.project='otro';assert.throws(()=>validateSnapshot(data));
 const missing=snapshot();missing.storage_objects=[];assert.throws(()=>validateSnapshot(missing),/Foto sin archivo/);
});
test('descarga truncada no se guarda como una imagen correcta',async t=>{
 const folder=await temp(t);
 await assert.rejects(downloadObject(snapshot().storage_objects[0],folder,{},async()=>new Response('xx')),/tamano no coincide/);
});
test('descarga correcta guarda bytes y checksum verificables',async t=>{
 const folder=await temp(t);
 const result=await downloadObject(snapshot().storage_objects[0],folder,{},async(url,init)=>{
  assert.match(url,/\/object\/authenticated\/vocatus-photos\/vocatus\/test\/photo.jpg$/);
  assert.equal(init.redirect,'error');return new Response('abc');
 });
 assert.equal(await readFile(path.join(folder,result.path),'utf8'),'abc');
 assert.equal(result.sha256,createHash('sha256').update('abc').digest('hex'));
});
test('401 no se reintenta ni expone el token o el cuerpo del servidor',async()=>{
 let calls=0;
 await assert.rejects(fetchRead('https://example.invalid',{headers:{Authorization:'Bearer secreto'}},async()=>{
  calls++;return new Response('secreto',{status:401});
 }),error=>/HTTP 401/.test(error.message)&&!error.message.includes('secreto'));
 assert.equal(calls,1);
});
test('sin acceso a Storage el respaldo queda incompleto y verify lo rechaza',async t=>{
 const folder=await temp(t),input=path.join(folder,'entrada.json');await writeFile(input,JSON.stringify(snapshot()));
 const result=await backup({input,out:path.join(folder,'respaldos')},{});
 assert.equal(result.complete,false);assert.equal(result.downloaded,0);
 const verification=await verify(path.join(result.out,'manifest.json'));
 assert.equal(verification.ok,false);assert.ok(verification.failures.some(f=>f.includes('Storage')));
});
test('verify detecta alteracion aunque el manifiesto afirme exito',async t=>{
 const folder=await temp(t),input=path.join(folder,'entrada.json');await writeFile(input,JSON.stringify(snapshot()));
 const result=await backup({input,out:path.join(folder,'respaldos')},{});
 const object=await downloadObject(snapshot().storage_objects[0],result.out,{},async()=>new Response('abc'));
 const manifestFile=path.join(result.out,'manifest.json'),manifest=JSON.parse(await readFile(manifestFile));
 manifest.complete=true;manifest.downloaded=1;manifest.files.push(object);await writeFile(manifestFile,JSON.stringify(manifest));
 assert.equal((await verify(manifestFile)).ok,true);
 await writeFile(path.join(result.out,object.path),'abd');assert.equal((await verify(manifestFile)).ok,false);
});
test('no acepta tokens como argumentos ni opciones repetidas',()=>{
 assert.throws(()=>optionsOf(['audit','--token','secreto']));
 assert.throws(()=>optionsOf(['audit','--out','a','--out','b']));
 assert.throws(()=>optionsOf(['verify']));
 assert.equal(optionsOf(['audit','--input','captura.json']).input,'captura.json');
});
