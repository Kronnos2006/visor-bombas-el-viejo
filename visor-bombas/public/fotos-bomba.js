// «Actualizar fotos» del expediente: dos placas, la bomba y su posición.
// En la computadora (Obsidian) se guardan en la bóveda; en Vercel quedan en este navegador.
export const RANURAS=[['placa1','Placa de la bomba'],['placa2','Segunda placa (motor)'],['bomba','Foto de la bomba'],['posicion','Foto de la posición']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function db(){return new Promise((ok,ko)=>{const r=indexedDB.open('vocatus-fotos',1);r.onupgradeneeded=()=>r.result.createObjectStore('fotos');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error);});}
async function idb(mode,fn){const d=await db();return new Promise((ok,ko)=>{const t=d.transaction('fotos',mode),s=t.objectStore('fotos'),r=fn(s);t.oncomplete=()=>ok(r?.result);t.onerror=()=>ko(t.error);});}
const urls=new Map();
async function locales(tag){
 const out={};
 for(const [slot] of RANURAS){const v=await idb('readonly',s=>s.get(`${tag}:${slot}`)).catch(()=>null);if(v?.blob){urls.has(`${tag}:${slot}`)&&URL.revokeObjectURL(urls.get(`${tag}:${slot}`));const u=URL.createObjectURL(v.blob);urls.set(`${tag}:${slot}`,u);out[slot]={url:u,fecha:v.fecha,local:true};}}
 return out;
}
// Reduce la foto en el navegador (lado mayor 1800 px, JPEG) antes de guardarla.
async function reducir(file){
 const img=await createImageBitmap(file),k=Math.min(1,1800/Math.max(img.width,img.height)),c=document.createElement('canvas');
 c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
 return new Promise(ok=>c.toBlob(ok,'image/jpeg',.85));
}
const b64=blob=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.readAsDataURL(blob);});

export async function fotosActualizadas(tag,{writable}){
 const loc=await locales(tag);
 if(!writable)return loc;
 try{const r=await fetch('/api/pump-photos?tag='+encodeURIComponent(tag));if(!r.ok)return loc;const {fotos}=await r.json();return {...loc,...fotos};}catch{return loc;}
}
export async function guardarFoto(tag,slot,file,{writable,token}){
 const blob=await reducir(file),fecha=new Date().toISOString();
 if(writable){
  const r=await fetch('/api/pump-photo',{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':token},body:JSON.stringify({tag,slot,base64:await b64(blob)})});
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'No se pudo guardar la foto.');
  await idb('readwrite',s=>s.delete(`${tag}:${slot}`)).catch(()=>{});return data.foto;
 }
 await idb('readwrite',s=>s.put({blob,fecha},`${tag}:${slot}`));return (await locales(tag))[slot];
}
// Fotos originales del expediente (Excel / PDF) para cada ranura.
export function originales(p,exp){
 const placas=exp?.placas||[],placa1=placas.find(x=>/-placa\.jpg$/.test(x.src))||null,placa2=placas.find(x=>/-placa2\.jpg$/.test(x.src))||null;
 return {placa1,placa2,bomba:(exp?.fotos||[])[0]||null,posicion:p.photo?{src:p.photo,t:'Referencia de la posición',ref:p.ubicacionCroquis||'Foto del lado (PDF)'}:null};
}
export function htmlFotos(p,orig,act,{writable}){
 const fecha=f=>new Date(f).toLocaleDateString('es-CR',{day:'2-digit',month:'short',year:'numeric'});
 return `<div class="block exp-block" id="fotos-actualizar"><h3>Actualizar fotos</h3><p class="muted">${writable?'La foto nueva sustituye a la anterior en el expediente y se guarda en la bóveda (00-Proyecto/fotos-campo/'+esc(p.tag)+'/expediente). La anterior queda en el historial.':'En este alojamiento las fotos nuevas se guardan solo en este navegador. Para guardarlas en Obsidian, usá el visor de la computadora.'}</p><div class="foto-grid">${RANURAS.map(([slot,nombre])=>{const a=act[slot],o=orig[slot],src=a?.url||o?.src||'';
  return `<figure class="foto-slot"><div class="foto-img">${src?`<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(nombre)} de ${esc(p.tag)}" loading="lazy"></a>`:'<span>Sin foto</span>'}</div><figcaption><strong>${esc(nombre)}</strong><small>${a?`Actualizada ${fecha(a.fecha)}${a.local?' · solo en este navegador':''}`:o?esc(o.ref||'Original'):'Pendiente'}</small></figcaption><label class="foto-btn">📷 ${src?'Actualizar foto':'Agregar foto'}<input type="file" accept="image/*" capture="environment" data-slot="${slot}" hidden></label></figure>`;}).join('')}</div><p class="form-error" id="fotos-error"></p></div>`;
}
