// En local se guardan en Obsidian. En Vercel se conserva el almacenamiento IndexedDB.
// Los reportes anteriores del navegador se importan explícitamente, sin borrar antes de guardar.
import {measurementInput} from './measurements.js';
const DB='vocatus-reportes',STORE='reportes',MAX_PDF=10*1024*1024;
let storage={writable:false,token:''};
export function configureReports(options){storage={writable:options.writable,token:options.token};}
export const reportsInObsidian=()=>storage.writable;
async function request(body,method='POST'){
 const res=await fetch('/api/maintenance',{method,headers:{'Content-Type':'application/json','X-Local-Token':storage.token},body:JSON.stringify(body)});
 const result=await res.json();if(!res.ok)throw new Error(result.error||'No se pudo guardar en Obsidian.');return result;
}
async function attachment(file){
 if(!file)return null;
 const data=new Uint8Array(await file.arrayBuffer());
 let binary='';for(let i=0;i<data.length;i+=32768)binary+=String.fromCharCode(...data.subarray(i,i+32768));
 return {name:file.name||'documento.pdf',base64:btoa(binary)};
}
async function saveInObsidian(rec){
 const upload=rec.pdf?.blob?await attachment(rec.pdf.blob):null;
 if(upload)upload.name=rec.pdf.name;
 return (await request({tag:rec.tag,date:rec.date,title:rec.title,author:rec.author||'Autor no registrado (importado del navegador)',details:rec.text,parts:rec.parts||'',symptoms:rec.symptoms||'',sourceId:rec.id,attachment:upload,measurements:rec.mediciones||null})).report;
}
let dbp=null;
function open(){
  if(dbp)return dbp;
  dbp=new Promise((ok,fail)=>{
    if(!window.indexedDB){fail(new Error('Este navegador no permite guardar reportes locales.'));return;}
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{const s=r.result.createObjectStore(STORE,{keyPath:'id'});s.createIndex('tag','tag');};
    r.onsuccess=()=>ok(r.result);r.onerror=()=>fail(r.error||new Error('No se pudo abrir el almacenamiento local.'));
  });
  return dbp;
}
const tx=async(mode,fn)=>{const db=await open();return new Promise((ok,fail)=>{const t=db.transaction(STORE,mode),out=fn(t.objectStore(STORE));t.oncomplete=()=>ok(out?.result);t.onerror=()=>fail(t.error);t.onabort=()=>fail(t.error);});};
const browserReports=async tag=>(await tx('readonly',s=>s.index('tag').getAll(tag))||[]).map(r=>({...r,source:'browser'}));
export const listReports=async tag=>{
 let all=[];
 if(storage.writable){
  const res=await fetch('/api/reports?tag='+encodeURIComponent(tag));const data=await res.json();
  if(!res.ok)throw new Error(data.error||'No se pudieron leer los informes de Obsidian.');all=data.reports;
  try{const local=await browserReports(tag);const imported=new Set(all.map(r=>r.sourceId).filter(Boolean));all.push(...local.filter(r=>!imported.has(r.id)));}catch{}
 }else all=await browserReports(tag);
 return all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created);
};
export async function importReports(tag){
 if(!storage.writable)throw new Error('La importación requiere el visor local conectado a Obsidian.');
 const records=await browserReports(tag);let count=0;
 for(const record of records){await saveInObsidian(record);await tx('readwrite',s=>s.delete(record.id));count++;}
 return count;
}
export async function addReport({tag,date,title,text,file,author,pressure,flow}){
  const mediciones=measurementInput(pressure,flow);
  if(!title?.trim())throw new Error('Escribí un título.');
  if(!text?.trim()&&!file&&mediciones.presion_bar===null&&mediciones.caudal_m3h===null)throw new Error('Escribí el reporte, anotá una medición o adjuntá un PDF.');
  if(file){
    if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw new Error('El archivo debe ser PDF.');
    if(file.size>MAX_PDF)throw new Error('El PDF supera 10 MB.');
  }
  if(storage.writable&&!author?.trim())throw new Error('Indicá el responsable de la intervención.');
  const rec={id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()),tag,date,title:title.trim(),author:(author||'').trim(),text:(text||'').trim(),created:Date.now(),
    mediciones,pdf:file?{name:file.name,size:file.size,blob:file}:null};
  if(storage.writable)return saveInObsidian(rec);
  await tx('readwrite',s=>s.add(rec));return {...rec,source:'browser'};
}
export const deleteReport=record=>record.source==='obsidian'?request({tag:record.tag,id:record.id},'DELETE'):tx('readwrite',s=>s.delete(record.id));
