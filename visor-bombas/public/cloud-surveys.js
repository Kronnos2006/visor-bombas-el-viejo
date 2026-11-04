// Levantamientos de campo: primero se guardan en el celular y luego se suben a Supabase.
// Un registro solo sale de la cola cuando la base confirma el guardado.
const BUCKET='vocatus-maintenance',TABLE='vocatus_field_surveys';

export function createOutbox(idb=globalThis.indexedDB){
 let connection;
 const open=()=>connection||(connection=new Promise((resolve,reject)=>{
  if(!idb){reject(new Error('Este navegador no permite guardar levantamientos.'));return;}
  const request=idb.open('vocatus-survey-outbox',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('pending',{keyPath:'id'});
  request.onerror=()=>{connection=null;reject(request.error||new Error('No se pudo abrir la cola del celular.'));};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
 }));
 async function run(mode,operation){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('pending',mode),request=operation(tx.objectStore('pending'));tx.oncomplete=()=>resolve(request.result);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('El celular no confirmó el guardado.'));});}
 return {
  put:record=>run('readwrite',store=>store.put(record)),
  list:()=>run('readonly',store=>store.getAll()),
  remove:id=>run('readwrite',store=>store.delete(id)),
 };
}

const bytesOf=base64=>Uint8Array.from(atob(base64),char=>char.charCodeAt(0));
const hex=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
const isDuplicate=error=>String(error?.statusCode)==='409'||/already exists|duplicate/i.test(error?.message||'');

// Reintentar es seguro: cada foto se nombra por su contenido y el registro por su id.
export async function uploadSurvey(connection,record){
 const {photos=[],...data}=record.data,folder=await hex(new TextEncoder().encode(record.tag+':'+record.id)),refs=[];
 for(const photo of photos){
  const bytes=bytesOf(photo.base64),path=`reports/${connection.userId}/${folder}/${await hex(bytes)}.jpg`;
  const sent=await connection.client.storage.from(BUCKET).upload(path,bytes,{contentType:'image/jpeg',upsert:false});
  if(sent.error&&!isDuplicate(sent.error))throw sent.error;
  refs.push({name:photo.name,path,mime:'image/jpeg',bytes:bytes.length});
 }
 const saved=await connection.client.from(TABLE).upsert({id:record.id,tag:record.tag,data:{...data,id:record.id,tag:record.tag,photos:refs}},{onConflict:'id',ignoreDuplicates:true});
 if(saved.error)throw saved.error;
}

export function explainSyncError(error,fallback='No se pudo subir todavía.'){
 const text=String(error?.message||error||'');
 if(/PGRST205|vocatus_field_surveys|does not exist/i.test(text+' '+(error?.code||'')))return 'La base todavía no está preparada para recibir levantamientos.';
 if(/row-level security|permission denied|42501/i.test(text+' '+(error?.code||'')))return 'Tu cuenta no tiene permiso para enviar levantamientos.';
 return fallback;
}

// Nunca borra sin confirmación y se detiene en el primer fallo para reintentar después.
export async function syncOutbox(outbox,getConnection,{online=globalThis.navigator?.onLine!==false}={}){
 let pending=await outbox.list();
 if(!pending.length)return {status:'empty',sent:0,pending:0};
 if(!online)return {status:'offline',sent:0,pending:pending.length};
 let connection;
 try{connection=await getConnection();}catch(error){return {status:'error',sent:0,pending:pending.length,message:explainSyncError(error)};}
 if(!connection)return {status:'signed-out',sent:0,pending:pending.length};
 if(!connection.writable)return {status:'read-only',sent:0,pending:pending.length};
 let sent=0;
 for(const record of pending){
  try{await uploadSurvey(connection,record);await outbox.remove(record.id);sent++;}
  catch(error){return {status:'error',sent,pending:pending.length-sent,message:explainSyncError(error)};}
 }
 return {status:'done',sent,pending:0};
}

export function queueMessage(result){
 const pendientes=result.pending===1?'1 levantamiento espera':result.pending+' levantamientos esperan';
 switch(result.status){
  case 'offline':return pendientes+' en este celular. Se suben solos cuando vuelva la señal.';
  case 'signed-out':return pendientes+' en este celular. Entrá con tu cuenta para subirlos.';
  case 'read-only':return pendientes+' en este celular. Tu cuenta solo permite consultar.';
  case 'error':return pendientes+' en este celular. '+result.message;
  default:return '';
 }
}

// Al cargar la página la sesión puede renovarse a mitad de la comprobación de permisos.
export async function surveyConnection({wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),connect}={}){
 const open=connect||(async()=>(await import('./cloud-photos.js')).workflowConnection());
 for(let attempt=0;;attempt++){
  try{return await open();}
  catch(error){if(attempt>=2||!/cuenta cambió/i.test(error?.message||''))throw error;await wait(400);}
 }
}

export async function listCloudSurveys(connection){
 const rows=[];
 for(let offset=0;;offset+=200){
  const result=await connection.client.from(TABLE).select('*').order('created_at',{ascending:false}).range(offset,offset+199);
  if(result.error)throw result.error;
  rows.push(...result.data);if(result.data.length<200)return rows;
 }
}

// Mismo paquete que ya importa el visor de la computadora para pasarlo a Obsidian.
export async function surveyPackage(connection,row){
 const photos=[];
 for(const photo of row.data.photos||[]){
  const file=await connection.client.storage.from(BUCKET).download(photo.path);
  if(file.error)throw file.error;
  const bytes=new Uint8Array(await file.data.arrayBuffer());let binary='';
  for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
  photos.push({name:photo.name,base64:btoa(binary)});
 }
 return {...row.data,photos};
}
