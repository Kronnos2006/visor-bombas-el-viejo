// Descargas GET exclusivamente. La credencial se recibe por entorno y nunca se guarda.
import path from 'node:path';
import {readFile,writeFile,realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {backup,verify,fetchRead} from './supabase-operaciones.mjs';
import {cloudPhotoConfig} from '../../visor-bombas/public/cloud-photos-config.js';
if(!process.env.SUPABASE_SECRET_KEY&&!process.env.SUPABASE_STORAGE_TOKEN)throw Error('Se requiere credencial local de descarga.');
const parent=path.join(process.env.LOCALAPPDATA,'VocatusBackups','Supabase');
const resolved=await realpath(parent);
if(path.resolve(resolved).toLowerCase()!==path.resolve(parent).toLowerCase())throw Error('La carpeta privada no debe ser una redirección.');
for(const value of [process.env.OneDrive,process.env.OneDriveConsumer,process.env.OneDriveCommercial].filter(Boolean)){
 const relative=path.relative(path.resolve(value),resolved);
 if(!relative.startsWith('..')&&!path.isAbsolute(relative))throw Error('El respaldo no puede estar en OneDrive.');
}
const source=path.join(parent,'captura-previa.json');
const snapshot=JSON.parse(await readFile(source,'utf8'));
if(snapshot.project!=='gtfqhljbxyanfyrarykw'||snapshot.storage_objects.length!==119)throw Error('Revisar captura antes de continuar.');
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
