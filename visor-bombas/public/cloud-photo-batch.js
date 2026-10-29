// Coordina dependencias suministradas por el visor; no guarda fotos ni credenciales.
const unconfirmed=photo=>photo.cloudPending===true||(photo.cloudPending===undefined&&!photo.cloudRevision);
const message=error=>error?.message||String(error||'Error desconocido.');

export async function synchronizeAllPhotos({localEntries,syncEntity,loadShared,onProgress=()=>{}}){
 const errors=[];
 let local=[];
 try{local=await localEntries();}
 catch(error){errors.push('No se pudieron leer las fotos locales: '+message(error));}
 const entities=[...new Set(local.filter(photo=>photo.blob&&unconfirmed(photo)&&!photo.cloudConflict).map(photo=>photo.reference||photo.tag).filter(entity=>typeof entity==='string'&&entity.length))];
 onProgress({phase:'sharing',done:0,total:entities.length});
 for(const [index,entity] of entities.entries()){
  try{await syncEntity(entity);}
  catch(error){errors.push(entity+': '+message(error));}
  onProgress({phase:'sharing',done:index+1,total:entities.length});
 }
 // Un error de autenticación o red debe llegar al llamador: nunca simular éxito.
 const remote=await loadShared({onProgress});
 let pending=null,conflicts=null;
 try{
  const current=await localEntries();
  pending=current.filter(unconfirmed).length;
  conflicts=current.filter(photo=>photo.cloudConflict).length;
 }catch(error){errors.push('No se pudo comprobar qué fotos locales siguen pendientes: '+message(error));}
 return {...remote,pending,conflicts,errors};
}
