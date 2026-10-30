import path from 'node:path';
import {readFile,writeFile,mkdir,rename,realpath} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {cloudPhotoConfig} from '../../visor-bombas/public/cloud-photos-config.js';

const root=fileURLToPath(new URL('../../',import.meta.url));
const project='gtfqhljbxyanfyrarykw';
const expectedChecks=['archivos_actuales','archivos_sin_referencia','archivos_versiones','bucket_privado','funciones_publicas_protegidas','historial_actual','metadatos_archivos','miembro_confirmado','realtime_fotos','rls_tablas','sin_escritura_directa','sin_lectura_anonima'];
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=async file=>JSON.parse(await readFile(file,'utf8'));
const save=async(file,data)=>writeFile(file,JSON.stringify(data,null,2)+'\n',{mode:0o600,flag:'wx'});
const stamp=()=>new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8);

export function optionsOf(args){
 const [mode,...rest]=args;if(!['audit','backup','verify','--help'].includes(mode))throw Error('Usa audit, backup, verify o --help.');
 const options={mode};
 for(let i=0;i<rest.length;i++){
  const name=rest[i];if(!['--out','--input'].includes(name)||!rest[i+1]||rest[i+1].startsWith('--')||options[name.slice(2)])throw Error('Usa --out CARPETA y/o --input ARCHIVO, sin repetir opciones.');
  options[name.slice(2)]=rest[++i];
 }
 if(mode==='verify'&&(!options.input||options.out))throw Error('verify requiere --input manifest.json y no acepta --out.');
 return options;
}
export function validateAudit(data){
 if(data?.version!==1||!Array.isArray(data.checks)||!data.counts||!Number.isFinite(Date.parse(data.captured_at)))throw Error('Informe de auditoria incompleto.');
 for(const id of expectedChecks)if(!data.checks.some(c=>c.id===id))throw Error('Falta control: '+id);
 if(new Set(data.checks.map(c=>c.id)).size!==data.checks.length)throw Error('Controles duplicados.');
 for(const c of data.checks)if(typeof c.ok!=='boolean'||c.severity!==(c.id==='archivos_sin_referencia'?'warning':'error'))throw Error('Resultado de control invalido.');
 return {errors:data.checks.filter(c=>!c.ok&&c.severity==='error').length,warnings:data.checks.filter(c=>!c.ok&&c.severity==='warning').length};
}
export function safeObjectPath(base,bucket,name){
 if(bucket!=='vocatus-photos'||typeof name!=='string'||name.includes('\\')||name.includes(':')||name.split('/').some(p=>!p||p==='.'||p==='..'||/[\x00-\x1f]/.test(p)))throw Error('Ruta de Storage invalida.');
 const target=path.resolve(base,bucket,...name.split('/')),relative=path.relative(path.resolve(base),target);
 if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Archivo fuera del respaldo.');
 return target;
}
export function validateSnapshot(data){
 if(data?.project!==project||!Number.isFinite(Date.parse(data.exported_at)))throw Error('Exportacion de proyecto invalida.');
 for(const name of ['vocatus_photos','vocatus_photo_versions','storage_objects','storage_buckets','members'])if(!Array.isArray(data[name]))throw Error('Falta tabla: '+name);
 const objects=new Map();
 for(const object of data.storage_objects){
  safeObjectPath(root,object.bucket_id,object.name);
  if(!Number.isSafeInteger(object.metadata?.size)||object.metadata.size<=0||object.metadata.size>8388608)throw Error('Tamano de objeto invalido.');
  if(objects.has(object.name))throw Error('Archivo duplicado en el catalogo.');
  objects.set(object.name,object);
 }
 for(const row of [...data.vocatus_photos,...data.vocatus_photo_versions]){
  const object=objects.get(row.object_path);if(!object||object.metadata.size!==row.bytes||object.metadata.mimetype!==row.mime)throw Error('Foto sin archivo o con metadatos inconsistentes.');
 }
 return data;
}
export async function fetchRead(url,init={},fetcher=fetch){
 for(let attempt=0;attempt<3;attempt++){
  let response;
  try{response=await fetcher(url,{...init,redirect:'error',signal:AbortSignal.timeout(60000)});}
  catch{if(attempt===2)throw Error('Fallo de red o tiempo de espera al consultar Supabase.');}
  if(response?.ok)return response;
  if(response&&!([429,500,502,503,504].includes(response.status)))throw Error('Supabase respondio HTTP '+response.status+'. Revisa permisos y credenciales.');
  if(attempt===2)throw Error('Supabase no disponible tras tres intentos.');
  await new Promise(resolve=>setTimeout(resolve,500*2**attempt));
 }
}
async function queryFile(filename,field,env){
 if(!env.SUPABASE_ACCESS_TOKEN)throw Error('Falta SUPABASE_ACCESS_TOKEN. La conexion MCP no entrega su token a los scripts.');
 const query=await readFile(new URL(filename,import.meta.url),'utf8');
 const response=await fetchRead('https://api.supabase.com/v1/projects/'+project+'/database/query',{
  method:'POST',headers:{Authorization:'Bearer '+env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},
  body:JSON.stringify({query,read_only:true})
 });
 const rows=await response.json();
 if(!Array.isArray(rows)||rows.length!==1||!rows[0]?.[field])throw Error('Respuesta SQL inesperada; no se genera un resultado exitoso.');
 return rows[0][field];
}
export async function downloadObject(object,base,headers,fetcher=fetch){
 const file=safeObjectPath(base,object.bucket_id,object.name);
 const encoded=[object.bucket_id,...object.name.split('/')].map(encodeURIComponent).join('/');
 const response=await fetchRead(cloudPhotoConfig.url+'/storage/v1/object/authenticated/'+encoded,{headers},fetcher);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length!==object.metadata.size)throw Error('Descarga incompleta: el tamano no coincide con el catalogo.');
 await mkdir(path.dirname(file),{recursive:true});
 const temporary=file+'.part';await writeFile(temporary,bytes,{mode:0o600,flag:'wx'});await rename(temporary,file);
 return {path:path.relative(base,file).split(path.sep).join('/'),bytes:bytes.length,sha256:sha256(bytes)};
}
export async function audit(options,env=process.env){
 const data=options.input?await json(options.input):await queryFile('auditar-supabase.sql','audit',env);
 const summary=validateAudit(data);
 const out=path.resolve(options.out||path.join(root,'informes-auditoria','supabase',stamp()));
 await mkdir(out,{recursive:true});
 await save(path.join(out,'auditoria.json'),{...data,source:options.input?'captura-local':'supabase-en-linea',summary,generated_at:new Date().toISOString()});
 const lines=['# Auditoria Supabase','',options.input?'Analisis de una captura; no es una consulta actual.':'Consulta de solo lectura al proyecto.',
  '','Datos medidos: '+data.captured_at,'',summary.errors+' errores; '+summary.warnings+' avisos.','',
  '| Control | Resultado | Filas afectadas |','| --- | --- | --- |',
  ...data.checks.map(c=>'| '+c.id+' | '+(c.ok?'OK':c.severity)+' | '+(c.affected??'—')+' |'),'',
  '## Limites','',...(data.limits||[]).map(x=>'- '+x),''];
 await writeFile(path.join(out,'auditoria.md'),lines.join('\n'),{flag:'wx'});
 return {out,...summary};
}
export async function backup(options,env=process.env){
 const data=validateSnapshot(options.input?await json(options.input):await queryFile('exportar-supabase.sql','backup',env));
 if(options.input&&!data.structure){
  try{const legacy=await json(path.join(path.dirname(path.resolve(options.input)),'estructura.json'));data.structure=legacy;data.project_info=legacy.project_info;}catch{}
 }
 const parent=path.resolve(options.out||path.join(root,'..','Respaldos-supabase'));
 await mkdir(parent,{recursive:true});
 const actual=await realpath(parent),actualRoot=await realpath(root),relative=path.relative(actualRoot,actual);
 if(relative!=='..'&&!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative))throw Error('Guarda los datos privados fuera del repositorio Git.');
 const out=path.join(actual,stamp());await mkdir(out);
 await save(path.join(out,'datos.json'),data);
 const files=[{path:'datos.json',bytes:(await readFile(path.join(out,'datos.json'))).length,sha256:sha256(await readFile(path.join(out,'datos.json')))}];
 const headers=env.SUPABASE_STORAGE_TOKEN?{apikey:cloudPhotoConfig.key,Authorization:'Bearer '+env.SUPABASE_STORAGE_TOKEN}:env.SUPABASE_SECRET_KEY?{apikey:env.SUPABASE_SECRET_KEY}:null;
 let downloaded=0,failed=0;
 if(headers){
  for(const object of data.storage_objects){
   try{files.push(await downloadObject(object,out,headers));downloaded++;}
   catch{failed++;} // No guardar cuerpos de error ni tokens en el respaldo.
  }
 }
 const metadataComplete=!!data.structure&&Array.isArray(data.project_info);
 const complete=metadataComplete&&downloaded===data.storage_objects.length;
 const manifest={version:1,project,data_captured_at:data.exported_at,finished_at:new Date().toISOString(),
  format:'JSON de aplicacion y archivos; no sustituye pg_dump ni una restauracion probada.',
  complete,metadata_complete:metadataComplete,expected:data.storage_objects.length,downloaded,failed,
  pending:[...(!metadataComplete?['Falta la estructura y/o project_info; genera una exportacion nueva.']:[]),...(downloaded<data.storage_objects.length?[headers?'Hay descargas fallidas; consulta verify.':'Falta SUPABASE_STORAGE_TOKEN (sesion autorizada) o SUPABASE_SECRET_KEY (solo servidor).']:[])],
  files};
 await save(path.join(out,'manifest.json'),manifest);
 return {out,...manifest};
}
export async function verify(file){
 const manifest=await json(file),base=await realpath(path.dirname(path.resolve(file))),failures=[];
 if(manifest?.version!==1||manifest.project!==project||!Array.isArray(manifest.files))throw Error('Manifiesto invalido.');
 const listed=new Set();
 for(const entry of manifest.files){
  try{
   if(typeof entry.path!=='string'||listed.has(entry.path)||entry.path.includes('\\'))throw Error();
   listed.add(entry.path);
   if(entry.path!=='datos.json')safeObjectPath(base,...[entry.path.split('/')[0],entry.path.split('/').slice(1).join('/')]);
   const target=path.resolve(base,entry.path),resolved=await realpath(target),relative=path.relative(base,resolved);
   if(relative.startsWith('..')||path.isAbsolute(relative))throw Error();
   const bytes=await readFile(resolved);
   if(bytes.length!==entry.bytes||sha256(bytes)!==entry.sha256)throw Error();
  }catch{failures.push('Archivo ausente, alterado o ruta invalida.');}
 }
 let expected;
 try{
  const data=validateSnapshot(await json(path.join(base,'datos.json')));expected=data.storage_objects.length;
  if(!data.structure||!Array.isArray(data.project_info))failures.push('Falta estructura de la aplicacion.');
  for(const object of data.storage_objects){
   const rel=path.relative(base,safeObjectPath(base,object.bucket_id,object.name)).split(path.sep).join('/');
   if(!listed.has(rel))failures.push('Falta un archivo de Storage.');
  }
 }catch{failures.push('Exportacion de datos ausente o invalida.');}
 if(!listed.has('datos.json')||manifest.expected!==expected||manifest.downloaded!==expected||!manifest.complete)failures.push('El respaldo esta incompleto.');
 return {ok:failures.length===0,checked:manifest.files.length,failures};
}
async function main(){
 const options=optionsOf(process.argv.slice(2));
 if(options.mode==='--help'){console.log('audit [--input captura.json] [--out CARPETA]\nbackup [--input datos.json] [--out CARPETA_FUERA_DE_GIT]\nverify --input manifest.json\nCredenciales solo por variables de entorno. No modifica Supabase.');return;}
 if(options.mode==='verify'){const result=await verify(options.input);console.log(JSON.stringify(result,null,2));process.exitCode=result.ok?0:1;return;}
 const result=options.mode==='audit'?await audit(options):await backup(options);
 console.log(JSON.stringify(options.mode==='audit'?result:{out:result.out,complete:result.complete,expected:result.expected,downloaded:result.downloaded,failed:result.failed,pending:result.pending},null,2));
 process.exitCode=options.mode==='audit'?(result.errors?1:0):(result.complete?0:1);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=2;});
