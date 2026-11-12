// Lista de bombas con número: las con ficha, las del 3D con número asignado y las de la lista de asignación.
// Ordenada de menor a mayor (B1, B2…). No depende de que el 3D ya esté cargado.
// Bombas que están en la planta según la lista de asignación (no depende de que el 3D ya esté cargado).
export function tagsDeAsignacion(asig){
 if(!asig)return [];const nombre=t=>asig.excel?.[t]?.nombre||'';
 return [...(asig.A||[]),...(asig.N||[])].map(x=>x?.tag).filter(t=>/^B\d+$/.test(t||'')).map(t=>[t,nombre(t)]);
}
let asignacion=null;
export const asignacionCargada=()=>asignacion;
export async function cargarAsignacion(){if(asignacion)return asignacion;try{asignacion=await(await fetch('/modelos/asignacion-bombas.json')).json();}catch{asignacion={};}return asignacion;}
export function tagsDisponibles(pumps=[],references=[],extra=[]){
 const tags=new Map();
 for(const p of pumps)if(/^B\d+$/.test(p.tag||''))tags.set(p.tag,p.nombre||p.servicio||'');
 for(const r of references)if(/^B\d+$/.test(r.tagAsignado||'')&&!tags.has(r.tagAsignado))tags.set(r.tagAsignado,r.excel?.nombre||r.nombre||'');
 for(const [t,n] of extra)if(!tags.has(t))tags.set(t,n||'');
 return [...tags].sort((a,b)=>parseInt(a[0].slice(1))-parseInt(b[0].slice(1)));
}
