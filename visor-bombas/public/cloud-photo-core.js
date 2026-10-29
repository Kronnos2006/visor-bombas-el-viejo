// Coordinación por revisión. No contiene almacenamiento, red ni credenciales.
import {PHOTO_SLOTS} from './photo-slots.js';
export async function loadSharedPhotoRows({rows,download,isCurrent,strict=false}){
 const photos={},warnings=[];
 const check=()=>{if(!isCurrent())throw Error('La cuenta cambió. Volvé a abrir las fotos.');};
 check();
 for(const row of rows){
  check();
  try{const photo=await download(row);check();photos[row.slot]=photo;}
  catch(error){check();const name=PHOTO_SLOTS.find(([slot])=>slot===row.slot)?.[1]||row.slot;warnings.push(name+': '+(error.message||'No se pudo descargar la foto.'));}
 }
 check();
 if(warnings.length){
  const warning='No se pudieron descargar algunas fotos en línea. '+warnings.join(' ');
  if(strict)throw Error(warning+' Reintentá antes de descargar el respaldo.');
  Object.defineProperty(photos,'warning',{value:warning,enumerable:false});
 }
 return photos;
}
export function photoBaseRevision(snapshot,previous){return snapshot??previous?.cloudRevision??0;}
export async function loadPhotoView({loadLocal,loadShared,enabled}){
 let local={},localError;
 try{local=await loadLocal();}catch(error){localError=error;}
 if(!enabled){if(localError)throw localError;return local;}
 const warnings=[];if(localError)warnings.push(localError.message+' Se muestran las fotos disponibles en línea.');
 let shared={};try{shared=await loadShared();}catch(error){warnings.push('No se pudieron consultar las fotos en línea: '+error.message);}
 if(shared.warning)warnings.push(shared.warning);
 const photos={...local,...shared};
 for(const[slot,photo]of Object.entries(local)){
  if(photo.cloudPending===true||(!photo.cloudRevision&&photo.cloudPending!==false))photos[slot]={...photo,online:shared[slot]};
  if(photo.cloudPending===true)warnings.push(photo.cloudError||'Hay una foto guardada en este dispositivo, pendiente de confirmar en línea.');
 }
 if(warnings.length)Object.defineProperty(photos,'warning',{value:[...new Set(warnings)].join(' '),enumerable:false});
 return photos;
}
export async function syncPhoto({entity,slot,entry,transport,updateLocal,isCurrent,uuid}) {
 if(!entry?.blob||!entry.pending)return {skipped:true};
 if(!await isCurrent(entry.revision))return {superseded:true};
 const prefix=`vocatus/${transport.userId}/`;
 const path=entry.cloudUploadPath?.startsWith(prefix)?entry.cloudUploadPath:`${prefix}${uuid()}.jpg`;
 if(!await updateLocal(entry.revision,{cloudUploadPath:path}))return {superseded:true};
 let published;
 try {
  await transport.upload(path,entry.blob);
  if(!await isCurrent(entry.revision))return {superseded:true};
  published=await transport.publish(entity,slot,entry.cloudBase??0,path);
 } catch(error) {
  // Respuesta perdida después de confirmar: recuperar por identidad de archivo,
  // sin publicar otra revisión ni reemplazar la foto elegida en otro dispositivo.
  let remote;try{remote=await transport.readOne(entity,slot);}catch{}
  if(remote?.object_path===path)published=remote;
  else {
   const conflict=error.code==='40001'||String(error.message).includes('PHOTO_CONFLICT');
   await updateLocal(entry.revision,{cloudError:conflict?'Hay otra foto en línea. Revisá ambas antes de reemplazarla.':error.message,cloudConflict:conflict});
   return {pending:true,conflict,error:error.message};
  }
 }
 if(!published?.revision||published.object_path!==path)throw Error('El servidor no confirmó la foto correcta.');
 const marked=await updateLocal(entry.revision,{pending:false,cloudRevision:published.revision,cloudError:'',cloudConflict:false});
 return {published,marked};
}
