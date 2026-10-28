const VALID_TAG=/^(P-\d{4}[A-Z]?|B[1-9]\d{0,3})$/;
export const savedSurveyKey=tag=>'vocatus-survey-local-v1:'+tag;
function checkTag(tag){if(!VALID_TAG.test(tag))throw new Error('TAG inválido para guardar el levantamiento.');}
export function readSavedSurvey(tag,storage=globalThis.localStorage){
 checkTag(tag);const raw=storage.getItem(savedSurveyKey(tag));if(!raw)return null;const record=JSON.parse(raw);
 if(record.version!==1||record.tag!==tag||record.data?.tag!==tag)throw new Error('El cambio local no corresponde a este equipo.');return record;
}
export function writeSavedSurvey(data,storage=globalThis.localStorage){
 checkTag(data.tag);const record={version:1,tag:data.tag,data,updated:new Date().toISOString(),pending:true};const text=JSON.stringify(record);storage.setItem(savedSurveyKey(data.tag),text);if(storage.getItem(savedSurveyKey(data.tag))!==text)throw new Error('El navegador no confirmó el guardado local.');return record;
}
let connection;
function open(){
 if(!connection)connection=new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(new Error('Este navegador no permite conservar fotos.'));return;}
  const request=indexedDB.open('vocatus-survey-drafts',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('photos');
  request.onerror=()=>{connection=null;reject(request.error||new Error('No se pudo abrir el archivo local de fotos.'));};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=null;};resolve(db);};
 });
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('No se pudieron abrir las fotos. Cerrá otras pestañas y reintentá.')),5000);connection.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
}
async function transaction(mode,operation){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('photos',mode),request=operation(tx.objectStore('photos'));tx.oncomplete=()=>resolve(request.result);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('No se confirmó el guardado de las fotos.'));});}
export async function writeSurveyPhotos(tag,photos){checkTag(tag);const value=photos.map(({name,base64})=>({name,base64}));await transaction('readwrite',store=>store.put(value,tag));}
export async function readSurveyPhotos(tag,storage=globalThis.localStorage){
 checkTag(tag);const saved=await transaction('readonly',store=>store.get(tag));if(saved!==undefined)return saved;
 const raw=storage.getItem('vocatus-fotos-'+tag);if(!raw)return [];
 const legacy=JSON.parse(raw);if(!Array.isArray(legacy)||legacy.some(photo=>typeof photo.name!=='string'||typeof photo.base64!=='string'))throw new Error('El respaldo antiguo de fotos no se pudo leer; se conserva intacto.');
 return updateSurveyPhotos(tag,(current,exists)=>exists?current:legacy); // Conserva la copia antigua: solo se retira tras envío confirmado a Obsidian.
}

// La lectura y escritura comparten transacción: otra pestaña no puede intercalarse.
export async function updateSurveyPhotos(tag,transform){
 checkTag(tag);const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('photos','readwrite'),store=tx.objectStore('photos'),request=store.get(tag);let output,reason;
  request.onsuccess=()=>{try{output=transform(request.result||[],request.result!==undefined).map(({name,base64})=>({name,base64}));store.put(output,tag);}catch(error){reason=error;tx.abort();}};
  tx.oncomplete=()=>resolve(output);tx.onerror=tx.onabort=()=>reject(reason||tx.error||new Error('No se confirmó la actualización de fotos.'));
 });
}
