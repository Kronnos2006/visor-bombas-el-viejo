import {normalizeEvidence} from './evidence-core.js';
// En local se guardan en Obsidian. En Vercel se conserva el almacenamiento IndexedDB.
// Los reportes anteriores del navegador se importan explícitamente, sin borrar antes de guardar.
import {measurementInput} from './measurements.js';
import {importFieldReports} from './field-report-core.js';
const DB='vocatus-reportes',STORE='reportes',MAX_PDF=10*1024*1024;
let storage={writable:false,token:'',cloud:false};
async function remoteTransport(){return (await import('./cloud-workflow.js')).cloudWorkflow();}
export async function reportsInCloud(){return storage.cloud&&!!(await (await remoteTransport()).connection());}
export function configureReports(options){storage={writable:options.writable,token:options.token,cloud:options.cloud??(!options.writable&&typeof location!=='undefined'&&location.protocol==='https:')};}
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
 return (await request({tag:rec.tag,date:rec.date,title:rec.title,author:rec.author||'Autor no registrado (importado del navegador)',details:rec.text,parts:rec.parts||'',symptoms:rec.symptoms||'',operativo:rec.operativo,...(rec.workOrderId?{workOrderId:rec.workOrderId}:{}),sourceId:rec.id,attachment:upload,measurements:rec.mediciones||null,...(rec.evidence?.length?{evidence:normalizeEvidence(rec.evidence)}:{})})).report;
}
let dbp=null,openBlocked=false;
const blockedMessage='Cerrá las otras pestañas del visor y tocá Reintentar para recuperar el historial y las fotos. Tus reportes no se borran.';
function open(){
 if(!dbp){dbp=new Promise((ok,fail)=>{
  if(!window.indexedDB){fail(new Error('Este navegador no permite guardar reportes locales.'));return;}
  const r=indexedDB.open(DB,2);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE)){const s=r.result.createObjectStore(STORE,{keyPath:'id'});s.createIndex('tag','tag');}if(!r.result.objectStoreNames.contains('evidence-drafts'))r.result.createObjectStore('evidence-drafts');};
  // Conservar una sola solicitud pendiente: abrir otra quedaría en cola detrás de la bloqueada.
  r.onblocked=()=>{openBlocked=true;};
  r.onsuccess=()=>{openBlocked=false;r.result.onversionchange=()=>{r.result.close();dbp=null;};ok(r.result);globalThis.document?.dispatchEvent(new Event('vocatus:storage-ready'));};
  r.onerror=()=>{openBlocked=false;dbp=null;fail(r.error||new Error('No se pudo abrir el almacenamiento local.'));};
 });}
 if(openBlocked)return Promise.reject(new Error(blockedMessage));
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(openBlocked?blockedMessage:'El almacenamiento está tardando. Si tenés otras pestañas del visor abiertas, cerralas y reintentá. Tus reportes se conservan.')),4000);dbp.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});
}
const tx=async(mode,fn,storeName=STORE)=>{const db=await open();return new Promise((ok,fail)=>{const t=db.transaction(storeName,mode),out=fn(t.objectStore(storeName));t.oncomplete=()=>ok(out?.result);t.onerror=()=>fail(t.error);t.onabort=()=>fail(t.error);});};
export const readEvidenceDraft=async tag=>normalizeEvidence((await tx('readonly',s=>s.get(tag||'__sin_tag__'),'evidence-drafts'))||[]);
export const writeEvidenceDraft=async(tag,images)=>{const value=normalizeEvidence(images);return tx('readwrite',s=>value.length?s.put(value,tag||'__sin_tag__'):s.delete(tag||'__sin_tag__'),'evidence-drafts');};
const browserReports=async tag=>(await tx('readonly',s=>s.index('tag').getAll(tag))||[]).filter(r=>!r.cloudArchived).map(r=>({...r,source:'browser'}));
export const listReports=async tag=>{
 let all=[];
 if(storage.writable){
  const res=await fetch('/api/reports?tag='+encodeURIComponent(tag));const data=await res.json();
  if(!res.ok)throw new Error(data.error||'No se pudieron leer los informes de Obsidian.');all=data.reports;
  try{const local=await browserReports(tag);const imported=new Set(all.map(r=>r.sourceId).filter(Boolean));all.push(...local.filter(r=>!imported.has(r.id)));}catch{}
 }else{all=await browserReports(tag);if(await reportsInCloud()){const shared=await(await remoteTransport()).reports(tag),ids=new Set(shared.map(r=>r.id));all=[...shared,...all.filter(r=>!ids.has(r.id))];}}
 return all.sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.created-a.created);
};
let sharingPrevious=null;
export async function sharePreviousReports(){
 if(!await reportsInCloud())return {shared:0,failed:0};
 if(sharingPrevious)return sharingPrevious;
 sharingPrevious=(async()=>{const transport=await remoteTransport(),connection=await transport.connection();if(!connection?.writable)return {shared:0,failed:0};const records=await tx('readonly',s=>s.getAll());let shared=0,failed=0;
  for(const record of records){if(record.cloudArchived||record.cloudSharedWith===connection.userId)continue;
   try{await transport.saveReport({...record,author:record.author||'Responsable no registrado (importado del navegador)'});await tx('readwrite',s=>s.put({...record,cloudSharedWith:connection.userId}));shared++;}catch{failed++;}
  }
  return {shared,failed};
 })();try{return await sharingPrevious;}finally{sharingPrevious=null;}
}
export async function importReports(tag){
 if(!storage.writable){if(!await reportsInCloud())throw Error('Conectá tu cuenta para compartir los reportes.');const records=await browserReports(tag);for(const record of records)await(await remoteTransport()).saveReport({...record,author:record.author||'Responsable no registrado (importado del navegador)'});return records.length;}
 const records=await browserReports(tag);let count=0;
 for(const record of records){
  if(record.fieldReport)await importFieldReports([record],async(path,body)=>{
   const res=await fetch(path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json','X-Local-Token':storage.token},...(body?{body:JSON.stringify(body)}:{})});const data=await res.json();if(!res.ok)throw new Error(data.error||'No se pudo importar el reporte.');return data;
  });else await saveInObsidian(record);
  await tx('readwrite',s=>s.delete(record.id));count++;
 }
 return count;
}
export async function addReport({tag,date,title,text,file,author,pressure,flow,id,parts='',symptoms='',operativo,retirado=false,fieldReport=false,evidence=[],workOrderId='' }){
  const mediciones=measurementInput(pressure,flow);
  if(!title?.trim())throw new Error('Escribí un título.');
  if(!text?.trim()&&!file&&mediciones.presion_bar===null&&mediciones.caudal_m3h===null)throw new Error('Escribí el reporte, anotá una medición o adjuntá un PDF.');
  if(file){
    if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw new Error('El archivo debe ser PDF.');
    if(file.size>MAX_PDF)throw new Error('El PDF supera 10 MB.');
  }
  if(storage.writable&&!author?.trim())throw new Error('Indicá el responsable de la intervención.');
  const rec={id:(id||(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random())),tag,date,title:title.trim(),author:(author||'').trim(),text:(text||'').trim(),created:Date.now(),
    parts,symptoms,operativo,retirado,fieldReport,...(workOrderId?{workOrderId}:{}),evidence:normalizeEvidence(evidence),mediciones,pdf:file?{name:file.name,size:file.size,blob:file}:null};
  if(storage.writable)return saveInObsidian(rec);
  if(await reportsInCloud())return(await remoteTransport()).saveReport(rec);
  await tx('readwrite',s=>fieldReport?s.put(rec):s.add(rec));return {...rec,source:'browser'};
}
export const deleteReport=async record=>{if(record.source==='supabase'){await(await remoteTransport()).archiveReport(record);const local=(await browserReports(record.tag)).find(r=>r.id===record.id);if(local)await tx('readwrite',s=>s.put({...local,cloudArchived:true}));return;}return record.source==='obsidian'?request({tag:record.tag,id:record.id},'DELETE'):tx('readwrite',s=>s.delete(record.id));};
