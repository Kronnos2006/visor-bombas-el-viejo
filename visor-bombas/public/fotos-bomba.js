// «Actualizar fotos» del expediente: dos placas, la bomba y su posición.
// En la computadora (Obsidian) se guardan en la bóveda; en Vercel quedan en este navegador.
import {PHOTO_SLOTS} from './photo-slots.js';
import {makePhotoPackage,readPhotoPackage,makeReferencePhotoPackage,readReferencePhotoPackage,storagePhotoIdentity,isPhotoReference,MAX_PACKAGE_BYTES} from './photo-package-core.js';
export const RANURAS=PHOTO_SLOTS;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let connection=null;
function db(){
 if(!connection)connection=new Promise((ok,ko)=>{
  if(!globalThis.indexedDB){ko(new Error('Este navegador no permite leer las fotos guardadas.'));return;}
  const r=indexedDB.open('vocatus-fotos',1);
  r.onupgradeneeded=()=>r.result.createObjectStore('fotos');
  r.onsuccess=()=>{r.result.onversionchange=()=>{r.result.close();connection=null;};ok(r.result);};
  r.onerror=()=>{connection=null;ko(r.error||new Error('No se pudieron leer las fotos.'));};
 });
 return new Promise((ok,ko)=>{const timer=setTimeout(()=>ko(new Error('Las fotos están tardando en abrirse. Cerrá otras pestañas del visor y reintentá. No borres los datos del navegador.')),8000);connection.then(v=>{clearTimeout(timer);ok(v);},e=>{clearTimeout(timer);ko(e);});});
}
async function idb(mode,fn){const d=await db();return new Promise((ok,ko)=>{const t=d.transaction('fotos',mode),r=fn(t.objectStore('fotos'));t.oncomplete=()=>ok(r?.result);t.onerror=()=>ko(t.error);t.onabort=()=>ko(t.error||new Error('No se guardaron las fotos.'));});}
const urls=new Map();
async function locales(tag){
 const out={};
 for(const [slot] of RANURAS){const v=await idb('readonly',s=>s.get(`${tag}:${slot}`));if(v?.blob){const key=`${tag}:${slot}:${v.fecha}:${v.blob.size}:${v.revision||''}`;if(!urls.has(key))urls.set(key,URL.createObjectURL(v.blob));const u=urls.get(key);out[slot]={url:u,fecha:v.fecha,local:true,pending:v.pending!==false};}}
 return out;
}
// Reduce la foto en el navegador (lado mayor 1800 px, JPEG) antes de guardarla.
async function reducir(file){
 if(!file||file.size>30*1024*1024)throw new Error('La foto supera 30 MB. Elegí una de menor tamaño.');
 let img,objectURL;
 try{
  try{img=await createImageBitmap(file,{imageOrientation:'from-image'});}
  catch{
   // Algunos navegadores Android no implementan createImageBitmap para fotos de cámara.
   objectURL=URL.createObjectURL(file);
   img=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('No se pudo abrir la foto. Usá JPG, PNG o WebP.'));el.src=objectURL;});
  }
  const width=img.width||img.naturalWidth,height=img.height||img.naturalHeight;
  if(!width||!height||width*height>60000000)throw new Error('La imagen es demasiado grande o está dañada.');
  const k=Math.min(1,1800/Math.max(width,height)),c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(width*k));c.height=Math.max(1,Math.round(height*k));
  const context=c.getContext('2d');if(!context)throw new Error('El teléfono no pudo preparar la foto.');
  context.drawImage(img,0,0,c.width,c.height);
  const blob=await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.82));
  if(!blob)throw new Error('No se pudo convertir la foto a JPG.');
  return blob;
 }finally{img?.close?.();if(objectURL)URL.revokeObjectURL(objectURL);}
}
const b64=blob=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=()=>ko(new Error('No se pudo leer la foto para descargarla.'));r.readAsDataURL(blob);});

function withWarning(photos,message){if(message)Object.defineProperty(photos,'warning',{value:message,enumerable:false});return photos;}
export async function fotosActualizadas(tag,{writable}){
 let loc={},localError;try{loc=await locales(tag);}catch(error){localError=error;}
 if(!writable){if(localError)throw localError;return loc;}
 try{const r=await fetch('/api/pump-photos?tag='+encodeURIComponent(tag),{cache:'no-store'});if(!r.ok)throw new Error('No se pudieron consultar las fotos de Obsidian.');const {fotos}=await r.json();return withWarning({...loc,...fotos,...Object.fromEntries(Object.entries(loc).filter(([,v])=>v.pending))},localError?.message);}catch(error){if(localError)throw localError;return withWarning(loc,error.message);}
}
const photoQueues=new Map();
export function guardarFoto(tag,slot,file,options){
 if(!RANURAS.some(([name])=>name===slot))return Promise.reject(new Error('Categoría de foto desconocida.'));
 const key=tag+':'+slot,previous=photoQueues.get(key)||Promise.resolve();
 const task=previous.catch(()=>{}).then(()=>savePhoto(tag,slot,file,options)).catch(error=>{
  if(error?.name==='QuotaExceededError')throw new Error('No hay espacio para guardar la foto. La anterior se conserva. Descargá un respaldo y liberá espacio antes de reintentar.');
  throw error;
 });
 photoQueues.set(key,task);task.then(()=>{if(photoQueues.get(key)===task)photoQueues.delete(key);},()=>{if(photoQueues.get(key)===task)photoQueues.delete(key);});return task;
}
async function savePhoto(tag,slot,file,{writable,token}){
 const blob=await reducir(file),fecha=new Date().toISOString();if(!blob)throw new Error('No se pudo preparar la foto.');
 if(writable){
  const r=await fetch('/api/pump-photo',{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':token},body:JSON.stringify({tag,slot,base64:await b64(blob)})});
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'No se pudo guardar la foto.');
  await idb('readwrite',s=>s.delete(`${tag}:${slot}`)).catch(()=>{});return data.foto;
 }
 await idb('readwrite',s=>{const result=s.get(`${tag}:${slot}`);result.onsuccess=()=>{if(result.result?.blob)s.put(result.result,`history:${tag}:${slot}:${Date.now()}:${crypto.randomUUID()}`);s.put({blob,fecha,pending:true,revision:crypto.randomUUID()},`${tag}:${slot}`);};return result;});return (await locales(tag))[slot];
}
// Fotos originales del expediente (Excel / PDF) para cada ranura.
export function originales(p,exp){
 const placas=exp?.placas||[],placa1=placas.find(x=>/-placa\.jpg$/.test(x.src))||null,placa2=placas.find(x=>/-placa2\.jpg$/.test(x.src))||null;
 return {placa1,placa2,bomba:(exp?.fotos||[])[0]||null,posicion:p.photo?{src:p.photo,t:'Referencia de la posición',ref:p.ubicacionCroquis||'Foto del lado (PDF)'}:null};
}
export function htmlFotos(p,orig,act,{writable}){
 const fecha=f=>new Date(f).toLocaleDateString('es-CR',{day:'2-digit',month:'short',year:'numeric'});
 return `<div class="block exp-block" id="fotos-actualizar"><h3>Actualizar fotos</h3><p class="muted">${writable?'La foto nueva sustituye a la anterior en el expediente y se guarda en la bóveda (00-Proyecto/fotos-campo/'+esc(p.tag)+'/expediente). La anterior queda en el historial.':'Guardadas solo en este navegador: no aparecen automáticamente en otro teléfono o PC. Descargá las fotos aquí y cargá ese archivo en el otro equipo. No borres los datos del sitio.'}</p>${photoTransferHTML(p.photoKey||p.tag,{writable,reference:!!p.photoKey,displayName:p.tag})}<div class="foto-grid">${RANURAS.map(([slot,nombre])=>{const a=act[slot],o=orig[slot],src=a?.url||o?.src||'';
  return `<figure class="foto-slot"><div class="foto-img">${src?`<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(nombre)} de ${esc(p.tag)}" loading="lazy"></a>`:'<span>Sin foto</span>'}</div><figcaption><strong>${esc(nombre)}</strong><small>${a?`Actualizada ${fecha(a.fecha)}${a.local?' · solo en este navegador':''}`:o?esc(o.ref||'Original'):'Pendiente'}</small></figcaption><label class="foto-btn">📷 Tomar foto<input class="foto-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" aria-label="Tomar foto de ${esc(nombre)} de ${esc(p.tag)}" data-slot="${slot}"></label><label class="foto-btn">Galería<input class="foto-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Elegir ${esc(nombre)} de galería" data-slot="${slot}"></label></figure>`;}).join('')}</div><p class="form-error" id="fotos-error"></p></div>`;
}


export function photoTransferHTML(tag,{writable,reference=false,displayName=tag}){
 return `<section class="photo-transfer" data-photo-tag="${esc(tag)}" aria-label="Pasar fotos entre equipos"><strong>Fotos entre teléfono y PC</strong><p>El archivo conserva ${reference?'la referencia del modelo (sin asignar TAG)':'el TAG'} y la categoría. Cargarlo no reemplaza fotos que ya existan.</p><button type="button" class="wide" data-photo-download="tag">Descargar fotos de ${esc(displayName)}</button><button type="button" class="wide" data-photo-download="all">Descargar todas las fotos ${reference?'de referencias sin TAG':'con TAG'} locales</button><label class="foto-btn">Cargar archivo de fotos<input class="foto-file" type="file" accept=".json,application/json" aria-label="Cargar archivo de fotos para ${esc(displayName)}" data-photo-import></label>${writable?'<button type="button" class="wide" data-photo-sync>Guardar fotos locales de '+esc(tag)+' en Obsidian</button>':''}<p data-photo-status role="status" aria-live="polite"></p></section>`;
}
async function localEntries(){
 const pairs=await idb('readonly',store=>{const out={keys:null,values:null};const k=store.getAllKeys(),v=store.getAll();k.onsuccess=()=>out.keys=k.result;v.onsuccess=()=>out.values=v.result;return{get result(){return out;}};});
 return pairs.keys.flatMap((key,i)=>{const identity=storagePhotoIdentity(String(key));return identity&&pairs.values[i]?.blob?[{...pairs.values[i],...identity}]:[];});
}
export async function exportPhotoPackage(tag,{writable,tagOnly=false,reference=false}={}){
 const entries=(await localEntries()).filter(p=>reference?!!p.reference&&(!tagOnly||p.reference===tag):!!p.tag&&(!tagOnly||p.tag===tag)),byKey=new Map(),pendingKeys=new Set(entries.filter(p=>p.pending!==false).map(p=>p.tag+':'+p.slot));
 for(const entry of entries){const identity=entry.reference?{reference:entry.reference}:{tag:entry.tag};byKey.set((entry.reference||entry.tag)+':'+entry.slot,{...identity,slot:entry.slot,fecha:entry.fecha,base64:await b64(entry.blob)});}
 if(writable&&!reference){const r=await fetch('/api/pump-photos?tag='+encodeURIComponent(tag));if(!r.ok)throw new Error('No se pudieron leer las fotos de Obsidian.');const{fotos}=await r.json();for(const[slot,photo]of Object.entries(fotos)){if(pendingKeys.has(tag+':'+slot))continue;const response=await fetch(photo.url);if(!response.ok)throw new Error('No se pudo descargar la foto '+slot);byKey.set(tag+':'+slot,{tag,slot,fecha:photo.fecha,base64:await b64(await response.blob())});}}
 if(!byKey.size)throw new Error('No hay fotos actualizadas guardadas en este navegador ni en este equipo de Obsidian. Abrí el navegador del teléfono donde las guardaste para descargarlas.');
 return reference?makeReferencePhotoPackage([...byKey.values()]):makePhotoPackage([...byKey.values()]);
}
export async function importPhotoPackage(data){
 if(typeof data==='string'){if(data.length>MAX_PACKAGE_BYTES||new TextEncoder().encode(data).byteLength>MAX_PACKAGE_BYTES)throw new Error('El paquete supera 50 MB.');try{data=JSON.parse(data);}catch{throw new Error('El archivo no contiene JSON válido.');}}
 const photos=(data?.formato==='vocatus-reference-photos'?readReferencePhotoPackage(data):readPhotoPackage(data)).map(p=>{const bytes=Uint8Array.from(atob(p.base64),c=>c.charCodeAt(0));return{...p,blob:new Blob([bytes],{type:bytes[0]===255?'image/jpeg':'image/png'})};});
 for(const photo of photos){let image;try{image=await createImageBitmap(photo.blob);}catch{throw new Error('No se pudo decodificar la foto de '+(photo.reference||photo.tag)+' · '+photo.slot+'. No se incorporó ninguna foto del archivo.');}image.close?.();}
 return idb('readwrite',store=>{const result={added:0,preserved:0,addedKeys:[]};for(const photo of photos){const key=(photo.reference||photo.tag)+':'+photo.slot,r=store.get(key);r.onsuccess=()=>{if(r.result?.blob)result.preserved++;else{store.put({blob:photo.blob,fecha:photo.fecha,pending:true,revision:crypto.randomUUID()},key);result.added++;result.addedKeys.push(key);}};}return{get result(){return result;}};});
}
export function bindPhotoTransfers(root,tag,options,onChange){
 const box=root.querySelector('.photo-transfer');if(!box)return;
 const status=box.querySelector('[data-photo-status]');
 const message=text=>{const target=currentStatus();if(target)target.textContent=text;};
 const currentStatus=()=>root.isConnected?root.querySelector('[data-photo-status]'):document.querySelector('.photo-transfer[data-photo-tag="'+CSS.escape(tag)+'"] [data-photo-status]');
 box.querySelectorAll('[data-photo-download]').forEach(button=>button.onclick=async e=>{e.currentTarget.disabled=true;try{const pkg=await exportPhotoPackage(tag,{...options,writable:options.writable&&button.dataset.photoDownload==='tag',tagOnly:button.dataset.photoDownload==='tag'}),blob=new Blob([JSON.stringify(pkg)],{type:'application/json'}),url=URL.createObjectURL(blob),a=Object.assign(document.createElement('a'),{href:url,download:'fotos-vocatus-'+new Date().toISOString().slice(0,10)+'.json'});a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);message(pkg.photos.length+' fotos descargadas. Cargá el archivo en el otro equipo.');}catch(error){message(error.message);}finally{button.disabled=false;}});
 box.querySelector('[data-photo-import]').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;e.target.disabled=true;try{if(file.size>MAX_PACKAGE_BYTES)throw new Error('El archivo de fotos es demasiado grande.');const result=await importPhotoPackage(await file.text());if(root.isConnected)await onChange?.();const target=currentStatus();if(target)target.textContent=result.added+' fotos incorporadas; '+result.preserved+' casillas existentes conservadas sin reemplazar. Las fotos cargadas quedan en este navegador.';}catch(error){message(error.message);}finally{e.target.value='';e.target.disabled=false;}};
 const sync=box.querySelector('[data-photo-sync]');if(sync)sync.onclick=async()=>{sync.disabled=true;try{const result=await saveLocalPhotos(tag,options);if(root.isConnected)await onChange?.();const target=currentStatus();if(target)target.textContent=result.added+' fotos guardadas en Obsidian. '+result.preserved+' casillas con foto anterior conservadas; comparalas antes de actualizar. El respaldo del navegador se conserva.';}catch(error){const target=currentStatus();if(target)target.textContent=error.message;}finally{sync.disabled=false;}};
}
export async function saveLocalPhotos(tag,options){
 if(!options.writable||isPhotoReference(tag))throw new Error('Abrí el visor local conectado a Obsidian para guardar allí las fotos.');
 let added=0,preserved=0;
 try{const r=await fetch('/api/pump-photos?tag='+encodeURIComponent(tag));if(!r.ok)throw new Error('No se pudo comprobar el expediente.');const {fotos}=await r.json();for(const photo of(await localEntries()).filter(p=>p.tag===tag&&p.pending!==false&&(!options.allowKeys||options.allowKeys.includes(p.tag+':'+p.slot)))){if(fotos[photo.slot]){preserved++;continue;}const response=await fetch('/api/pump-photo',{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':options.token},body:JSON.stringify({tag,slot:photo.slot,base64:await b64(photo.blob)})});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo guardar la foto en Obsidian.');await idb('readwrite',store=>{const key=tag+':'+photo.slot,r=store.get(key);r.onsuccess=()=>{const current=r.result;if(current?.revision===photo.revision&&current?.fecha===photo.fecha&&current.blob?.size===photo.blob.size)store.put({...current,pending:false},key);};return r;});added++;}return{added,preserved};}catch(error){throw new Error(added+' fotos guardadas antes del error: '+error.message+' El resto sigue en este navegador.');}
}
