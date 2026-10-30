// Usa la misma cuenta y autorización que las fotografías existentes.
import {normalizeEvidence} from './evidence-core.js';
export function createWorkflowTransport(provider){
 const bucket='vocatus-maintenance';
 const requireConnection=async(write=false)=>{const c=await provider();if(!c)throw Error('Conectá tu cuenta de Vocatus para compartir trabajos.');if(write&&!c.writable)throw Error('Tu cuenta solo tiene permiso de consulta.');return c;};
 async function rpc(name,input){const c=await requireConnection(true),r=await c.client.rpc(name,{p_input:input});if(r.error)throw r.error;return r.data;}
 async function pages(table,configure){const c=await requireConnection(),all=[];for(let offset=0;;offset+=200){const r=await configure(c.client.from(table).select('*')).range(offset,offset+199);if(r.error)throw r.error;all.push(...r.data);if(r.data.length<200)break;}if((await requireConnection()).userId!==c.userId)throw Error('La cuenta cambió durante la lectura.');return all;}
 const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
 const base64=bytes=>{let result='';for(let i=0;i<bytes.length;i+=32768)result+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(result);};
 async function upload(c,id,bytes,mime,name){const digest=await hash(bytes),ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','application/pdf':'pdf'})[mime];const file=`reports/${c.userId}/${await hash(new TextEncoder().encode(id))}/${digest}.${ext}`;const r=await c.client.storage.from(bucket).upload(file,bytes,{contentType:mime,upsert:false});if(r.error){if(String(r.error.statusCode)!=='409')throw r.error;const prior=await c.client.storage.from(bucket).download(file);if(prior.error)throw prior.error;if(await hash(await prior.data.arrayBuffer())!==digest)throw Error('El archivo existente tiene otro contenido. Se conservó sin reemplazarlo.');}return {path:file,name,mime,size:bytes.byteLength};}
 async function read(row){const c=await requireConnection(),data={...row.data,source:'supabase',sourceId:row.source_id,created:new Date(row.created_at).valueOf()};data.evidence=await Promise.all((data.evidence||[]).map(async photo=>{const r=await c.client.storage.from(bucket).download(photo.path);if(r.error)throw r.error;return normalizeEvidence([{name:photo.name,mime:photo.mime,base64:base64(new Uint8Array(await r.data.arrayBuffer()))}])[0];}));if(data.pdf?.path){const r=await c.client.storage.from(bucket).download(data.pdf.path);if(r.error)throw r.error;data.pdf={...data.pdf,blob:r.data};}if((await requireConnection()).userId!==c.userId)throw Error('La cuenta cambió.');return data;}
 return {
  connection:()=>provider(),
  async orders(){const c=await provider();if(!c)return {orders:[],writable:false,cloud:true,connected:false};return {orders:(await pages('vocatus_work_orders',q=>q.order('id'))).map(r=>r.data),writable:c.writable,cloud:true,connected:true};},
  saveOrder:input=>rpc('vocatus_save_work_order',input),
  async reports(tag){return Promise.all((await pages('vocatus_work_reports',q=>q.eq('tag',tag).is('archived_at',null).order('created_at').order('source_id'))).map(read));},
  async saveReport(rec){const c=await requireConnection(true),evidence=[];for(const photo of normalizeEvidence(rec.evidence||[])){const bytes=Uint8Array.from(atob(photo.base64),x=>x.charCodeAt(0));evidence.push(await upload(c,rec.tag+':'+rec.id,bytes,photo.mime,photo.name));}let pdf=null;if(rec.pdf?.blob)pdf=await upload(c,rec.tag+':'+rec.id,await rec.pdf.blob.arrayBuffer(),'application/pdf',rec.pdf.name);const data=await rpc('vocatus_save_work_report',{...rec,evidence,pdf});return {...data,evidence:rec.evidence||[],pdf:rec.pdf||null,source:'supabase'};},
  async archiveReport(record){const c=await requireConnection(true),r=await c.client.from('vocatus_work_reports').update({archived_at:new Date().toISOString()}).eq('tag',record.tag).eq('source_id',record.id).select('source_id');if(r.error)throw r.error;if(!r.data.length)throw Error('No se pudo archivar el informe.');}
 };
}
let transport;
export const cloudWorkflow=()=>transport||(transport=createWorkflowTransport(async()=>{const {workflowConnection}=await import('./cloud-photos.js');return workflowConnection();}));
