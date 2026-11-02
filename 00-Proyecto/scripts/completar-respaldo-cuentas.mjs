// Descargas GET exclusivamente. La credencial se recibe por entorno y nunca se guarda.
import path from 'node:path';
import {readFile,writeFile,realpath,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseArgs} from 'node:util';
import {homedir} from 'node:os';
import {backup,verify,fetchRead,validateSnapshot} from './supabase-operaciones.mjs';
import {cloudPhotoConfig} from '../../visor-bombas/public/cloud-photos-config.js';
const {values}=parseArgs({options:{'check-only':{type:'boolean',default:false},'backup-dir':{type:'string'}}});
const parent=path.resolve(values['backup-dir']||path.join(homedir(),'VocatusBackups','Supabase'));
let resolved;
try{resolved=await realpath(parent);}catch{throw Error('No existe la carpeta privada: '+parent+'. Preparar captura-previa.json antes de continuar.');}
if(path.resolve(resolved).toLowerCase()!==path.resolve(parent).toLowerCase())throw Error('La carpeta privada no debe ser una redirección.');
for(let ancestor=resolved;;ancestor=path.dirname(ancestor)){
 let isGit=false;try{await access(path.join(ancestor,'.git'));isGit=true;}catch{}
 if(isGit)throw Error('La carpeta privada no puede estar dentro de un repositorio Git.');
 if(path.dirname(ancestor)===ancestor)break;
}
if(parent.split(path.sep).some(part=>/^onedrive(?:$| - )/i.test(part)))throw Error('El respaldo no puede estar en OneDrive.');
for(const value of [process.env.OneDrive,process.env.OneDriveConsumer,process.env.OneDriveCommercial].filter(Boolean)){
 const relative=path.relative(path.resolve(value),resolved);
 if(!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('El respaldo no puede estar en OneDrive.');
}
const source=path.join(parent,'captura-previa.json');
let sourceBytes;
try{sourceBytes=await readFile(source);}catch{throw Error('No existe o no se puede leer la captura privada: '+source);}
const sourceSha256=createHash('sha256').update(sourceBytes).digest('hex');
if(sourceSha256!=='d986aab764543a7a60c7e930d7199769b77aed34eda13d8aa7cb55006ac32c38')throw Error('La captura no coincide con su SHA-256 verificado. Revisar antes de descargar.');
const snapshot=validateSnapshot(JSON.parse(sourceBytes.toString('utf8')));
if(snapshot.project!=='gtfqhljbxyanfyrarykw'||snapshot.storage_objects.length!==119)throw Error('Revisar captura antes de continuar.');
if(values['check-only']){
 console.log(JSON.stringify({checkOnly:true,source,backupDirectory:resolved,bytes:sourceBytes.length,sha256:sourceSha256,objects:snapshot.storage_objects.length,credentialsUsed:false,downloads:0},null,2));
 process.exit(0);
}
if(!process.env.SUPABASE_SECRET_KEY&&!process.env.SUPABASE_STORAGE_TOKEN)throw Error('Se requiere credencial local de descarga.');
try{
 const result=await backup({input:source,out:parent});
 if(!result.complete)throw Error('No se descargaron todos los objetos. Conservar respaldo parcial y revisar permisos.');
 const checked=await verify(path.join(result.out,'manifest.json'));
 if(checked.failures?.length||checked.ok===false)throw Error('Falló la verificación local.');
 const headers=process.env.SUPABASE_STORAGE_TOKEN?{apikey:cloudPhotoConfig.key,Authorization:'Bearer '+process.env.SUPABASE_STORAGE_TOKEN}:{apikey:process.env.SUPABASE_SECRET_KEY};
 let independentlyVerified=0;
 for(const object of snapshot.storage_objects){
  const encoded=[object.bucket_id,...object.name.split('/')].map(encodeURIComponent).join('/');
  const response=await fetchRead('https://gtfqhljbxyanfyrarykw.supabase.co/storage/v1/object/authenticated/'+encoded,{headers});
  const bytes=Buffer.from(await response.arrayBuffer());
  const entry=result.files.find(x=>x.path===object.bucket_id+'/'+object.name);
  if(!entry||bytes.length!==entry.bytes||createHash('sha256').update(bytes).digest('hex')!==entry.sha256)throw Error('Cambió un archivo entre descargas: no aprobar el respaldo.');
  independentlyVerified++;
 }
 const verification={at:new Date().toISOString(),project:snapshot.project,out:result.out,expected:119,downloaded:result.downloaded,localVerification:checked,independentSecondDownloadSha256Matches:independentlyVerified,complete:independentlyVerified===119};
 await writeFile(path.join(result.out,'verificacion-independiente.json'),JSON.stringify(verification,null,2)+'\n',{flag:'wx'});
 await writeFile(path.join(parent,'ultimo-respaldo-verificado.json'),JSON.stringify(verification,null,2)+'\n');
 console.log('Respaldo completo verificado: '+result.out);
}finally{
 delete process.env.SUPABASE_SECRET_KEY;delete process.env.SUPABASE_STORAGE_TOKEN;
}
