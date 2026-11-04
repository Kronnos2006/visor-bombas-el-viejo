// Nombre o código editable de cada bomba del 3D. Se guarda aquí y se comparte en Supabase.
import {surveyConnection} from './cloud-surveys.js';
const TABLE='vocatus_pump_names',PENDING='vocatus-nombres-pendientes';

export function createPumpNames({storage=globalThis.localStorage,connect=surveyConnection,notify=()=>document.dispatchEvent(new Event('vocatus:nombres')),online=()=>globalThis.navigator?.onLine!==false}={}){
 const read=(key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback;}catch{return fallback;}};
 const setLocal=(key,name)=>storage.setItem(key,JSON.stringify({...read(key,{}),nombre:name}));
 const nameOf=key=>String(read(key,{}).nombre||'').trim();
 async function flush(connection){
  const pending=read(PENDING,{});
  for(const [key,name] of Object.entries(pending)){
   const saved=await connection.client.from(TABLE).upsert({reference_key:key,name,updated_at:new Date().toISOString(),updated_by:connection.userId},{onConflict:'reference_key'});
   if(saved.error)throw saved.error;
   const latest=read(PENDING,{});if(latest[key]===name){delete latest[key];storage.setItem(PENDING,JSON.stringify(latest));}
  }
 }
 // Primero envía lo pendiente; lo que aún no se pudo enviar no se pisa con lo de la nube.
 async function sync(){
  if(!online())return 'offline';
  const connection=await connect();if(!connection)return 'signed-out';
  let status='done';
  if(connection.writable)try{await flush(connection);}catch{status='error';}else if(Object.keys(read(PENDING,{})).length)status='read-only';
  const result=await connection.client.from(TABLE).select('reference_key,name');if(result.error)throw result.error;
  const pending=read(PENDING,{});let changed=false;
  for(const row of result.data||[])if(!(row.reference_key in pending)&&nameOf(row.reference_key)!==row.name){setLocal(row.reference_key,row.name);changed=true;}
  if(changed)notify();
  return status;
 }
 async function save(key,raw){
  const name=String(raw||'').trim().slice(0,120);
  setLocal(key,name);storage.setItem(PENDING,JSON.stringify({...read(PENDING,{}),[key]:name}));notify();
  try{return await sync();}catch{return 'error';}
 }
 return {nameOf,save,sync};
}
export const pumpNames=createPumpNames();
export function startPumpNames(){
 const run=()=>pumpNames.sync().catch(()=>{});
 run();addEventListener('online',run);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')run();});
 setInterval(()=>{if(document.visibilityState==='visible')run();},60000);
}
