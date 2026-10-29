// Coordinación por revisión. No contiene almacenamiento, red ni credenciales.
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
