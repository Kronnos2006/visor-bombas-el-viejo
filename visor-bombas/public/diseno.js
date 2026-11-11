// Aplica en el visor el diseño guardado por el administrador y lo actualiza al instante si cambia.
import {aplicarDiseno,limpiarDiseno} from './diseno-core.js';
import {surveyConnection} from './cloud-surveys.js';
export const TABLA='vocatus_site_design',FILA='principal',CACHE='vocatus-diseno';

export async function leerDiseno(connection){
 const r=await connection.client.from(TABLA).select('data,updated_at').eq('id',FILA).maybeSingle();
 if(r.error)throw r.error;return {data:limpiarDiseno(r.data?.data||{}),updated_at:r.data?.updated_at||null};
}
export async function guardarDiseno(connection,raw){
 const data=limpiarDiseno(raw);
 const r=await connection.client.from(TABLA).upsert({id:FILA,data,updated_at:new Date().toISOString(),updated_by:connection.userId},{onConflict:'id'});
 if(r.error)throw r.error;return data;
}

function iniciar(){
 // Vista previa = esta página está dentro del editor (la dirección la reescribe el visor, por eso no sirve el ?diseno=vista).
 const vista=(()=>{try{return parent!==window&&parent.location.origin===location.origin&&parent.location.pathname==='/diseno.html';}catch{return false;}})();
 // El visor arma la barra y los paneles después de cargar y los redibuja al navegar:
 // se vuelve a aplicar (con pausa) cada vez que cambia la página. Se desconecta mientras aplica para no repetirse.
 let actual={},espera=0;
 const observador=new MutationObserver(()=>{clearTimeout(espera);espera=setTimeout(()=>poner(actual),200);});
 const poner=cfg=>{actual=cfg;observador.disconnect();try{aplicarDiseno(document,cfg);}catch{}observador.observe(document.body,{childList:true,subtree:true});};
 try{poner(JSON.parse(localStorage.getItem(CACHE)||'{}'));}catch{}
 // Vista previa del editor: recibe el borrador sin guardar nada.
 if(vista){addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.tipo==='vocatus-diseno')poner(e.data.diseno);});parent.postMessage({tipo:'vocatus-diseno-lista'},location.origin);return;}
 const traer=async connection=>{try{const {data}=await leerDiseno(connection);localStorage.setItem(CACHE,JSON.stringify(data));poner(data);}catch{}};
 surveyConnection().then(connection=>{
  if(!connection)return;traer(connection);
  connection.client.channel?.('vocatus-diseno').on('postgres_changes',{event:'*',schema:'public',table:TABLA},()=>traer(connection)).subscribe();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')traer(connection);});
 }).catch(()=>{});
}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();}
