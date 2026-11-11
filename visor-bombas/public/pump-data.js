// Datos de máquina que escriben los usuarios en la ficha. Se guardan en el celular y se comparten en Supabase.
// Lo pendiente (sin señal o con error) nunca lo pisa la nube; se reintenta solo.
import {surveyConnection} from './cloud-surveys.js';
import {pumpNames} from './pump-names.js';
const TABLE='vocatus_pump_data',PENDING='vocatus-datos-pendientes',MAX=500;

// Solo texto corto por campo; el nombre va aparte (tabla de nombres).
export function limpiarDatos(raw={}){
 const out={};
 for(const [k,v] of Object.entries(raw||{})){
  if(k==='nombre'||!/^[a-z_]{1,40}$/.test(k))continue;
  const text=String(v??'').trim().slice(0,MAX);if(text)out[k]=text;
 }
 return out;
}

export function createPumpData({storage=globalThis.localStorage,connect=surveyConnection,notify=()=>document.dispatchEvent(new Event('vocatus:datos')),online=()=>globalThis.navigator?.onLine!==false}={}){
 const read=(key,fallback)=>{try{return JSON.parse(storage.getItem(key))||fallback;}catch{return fallback;}};
 // Conserva el nombre guardado en la misma clave.
 const setLocal=(key,data)=>{const prev=read(key,{});storage.setItem(key,JSON.stringify({...(prev.nombre?{nombre:prev.nombre}:{}),...data}));};
 const dataOf=key=>limpiarDatos(read(key,{}));
 const same=(a,b)=>JSON.stringify(Object.entries(a).sort())===JSON.stringify(Object.entries(b).sort());
 async function flush(connection){
  const pending=read(PENDING,{});
  for(const [key,data] of Object.entries(pending)){
   const saved=await connection.client.from(TABLE).upsert({reference_key:key,data,updated_at:new Date().toISOString(),updated_by:connection.userId},{onConflict:'reference_key'});
   if(saved.error)throw saved.error;
   const latest=read(PENDING,{});if(same(latest[key]||{},data)&&key in latest){delete latest[key];storage.setItem(PENDING,JSON.stringify(latest));}
  }
 }
 async function sync(){
  if(!online())return 'offline';
  const connection=await connect();if(!connection)return 'signed-out';
  let status='done';
  if(connection.writable)try{await flush(connection);}catch{status='error';}else if(Object.keys(read(PENDING,{})).length)status='read-only';
  const result=await connection.client.from(TABLE).select('reference_key,data');if(result.error)throw result.error;
  const pending=read(PENDING,{});let changed=false;
  for(const row of result.data||[]){
   if(row.reference_key in pending)continue;
   const cloud=limpiarDatos(row.data);if(!same(dataOf(row.reference_key),cloud)){setLocal(row.reference_key,cloud);changed=true;}
  }
  if(changed)notify();
  return status;
 }
 async function save(key,raw){
  const data=limpiarDatos(raw);
  setLocal(key,data);storage.setItem(PENDING,JSON.stringify({...read(PENDING,{}),[key]:data}));notify();
  try{return await sync();}catch{return 'error';}
 }
 return {dataOf,save,sync};
}
export const pumpData=createPumpData();

// Mensaje sencillo para el usuario según cómo terminó el guardado.
export const MENSAJE_GUARDADO={done:'Datos guardados para todo el equipo.',offline:'Guardado en este celular. Se comparte cuando vuelva la señal.','signed-out':'Guardado en este navegador. Entrá con tu cuenta para compartirlo.','read-only':'Guardado en este navegador. Tu cuenta solo permite consultar.'};

// Sincroniza al abrir, al volver la señal, al volver a la pestaña, cada minuto
// y al instante cuando otra persona guarda (Supabase Realtime).
let started=false;
export function startPumpData({connect=surveyConnection}={}){
 if(started)return;started=true;
 const run=()=>{pumpData.sync().catch(()=>{});pumpNames.sync().catch(()=>{});};
 run();addEventListener('online',run);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')run();});
 setInterval(()=>{if(document.visibilityState==='visible')run();},60000);
 let timer;const soon=()=>{clearTimeout(timer);timer=setTimeout(run,400);};
 connect().then(connection=>{
  const client=connection?.client;if(!client?.channel)return;
  client.channel('vocatus-datos-bombas')
   .on('postgres_changes',{event:'*',schema:'public',table:TABLE},soon)
   .on('postgres_changes',{event:'*',schema:'public',table:'vocatus_pump_names'},soon)
   .subscribe();
 }).catch(()=>{});
}
