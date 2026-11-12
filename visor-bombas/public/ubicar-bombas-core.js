// Borrador del plano; no escribe en el modelo, las fichas ni las fotos.
export const CACHE='vocatus-plano-bombas-v1',WIDTH=2800,HEIGHT=2504;
const text=(v,n=100)=>typeof v==='string'?v.trim().slice(0,n):'';
export const validTag=t=>/^B[1-9]\d{0,3}$/.test(t);
export const clamp=(v,max)=>Math.max(0,Math.min(max,v));
export function initialState(data,map){
 const byId=new Map((map?.A||[]).map(a=>[a.id,a]));
 const s={points:data.P.map(p=>({...p,tag:byId.has(p.id)?byId.get(p.id).tag||null:p.tag||null,name:byId.get(p.id)?.nombre||'',removed:(map?.Q||[]).includes(p.id)})),catalog:data.T.map(t=>({...t}))};
 // Sin calibración de la imagen no se convierten los x/z del mapa a píxeles.
 return s;
}
export function validateState(raw,data){
 if(!raw||!Array.isArray(raw.points)||!Array.isArray(raw.catalog)||raw.points.length>2000||raw.catalog.length>2000)throw Error('El respaldo no es un plano de bombas válido.');
 const catalog=raw.catalog.map(t=>{const tag=typeof t?.tag==='string'?t.tag.trim():'',nombre=text(t?.nombre),area=text(t?.area);if(!validTag(tag)||!nombre||!area)throw Error('Hay una bomba sin TAG, nombre o área válidos.');return {tag,nombre,area};});
 const tags=new Set(catalog.map(t=>t.tag));if(tags.size!==catalog.length)throw Error('Hay TAG repetidos en el catálogo.');
 for(const t of data.T)if(!tags.has(t.tag))throw Error('El respaldo no contiene el catálogo original.');
 const ids=new Set(),placed=new Set(),baseIds=new Set(data.P.map(p=>p.id));
 const points=raw.points.map(p=>{
  if(!p||typeof p.id!=='string'||(!baseIds.has(p.id)&&!/^nuevo:[\w-]{1,80}$/.test(p.id))||ids.has(p.id))throw Error('Hay identificadores de punto inválidos o repetidos.');ids.add(p.id);
  if(!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>WIDTH||p.y<0||p.y>HEIGHT)throw Error('Hay posiciones fuera del plano.');
  const tag=p.tag||null;if(tag&&!tags.has(tag))throw Error('Un punto usa un TAG que no está en el catálogo.');
  if(tag&&!p.removed){if(placed.has(tag))throw Error('Una bomba tiene más de una posición.');placed.add(tag);}
  return {id:p.id,x:p.x,y:p.y,sec:Object.hasOwn(data.SEC,p.sec)?p.sec:'toda',num:text(String(p.num),12),n:text(p.n),tag,name:text(p.name,60),removed:!!p.removed,nuevo:!baseIds.has(p.id)};
 });
 if([...baseIds].some(id=>!ids.has(id)))throw Error('Faltan puntos originales en el respaldo.');
 return {catalog,points};
}
export function assign(s,id,tag){
 if(!s.points.some(p=>p.id===id&&!p.removed))throw Error('El punto ya no existe.');
 if(tag&&!s.catalog.some(t=>t.tag===tag))throw Error('Selecciona un TAG del catálogo.');
 // Reubicar un TAG libera su sitio anterior; no intercambia otra bomba por sorpresa.
 for(const p of s.points)if(p.id===id||tag&&p.tag===tag)p.tag=p.id===id?tag:null;
}
export function addPump(s,{tag,nombre,area}){
 tag=typeof tag==='string'?tag.trim().toUpperCase():'';nombre=text(nombre);area=text(area);
 if(!validTag(tag)||!nombre||!area)throw Error('Indica un TAG B1–B9999, nombre y área.');
 if(s.catalog.some(t=>t.tag===tag))throw Error(tag+' ya está en el catálogo. Selecciónala en la lista para ubicarla.');
 s.catalog.push({tag,nombre,area});return tag;
}
export function changes(s,base){
 const lines=[],old=new Map(base.points.map(p=>[p.id,p]));
 for(const t of s.catalog)if(!base.catalog.some(b=>b.tag===t.tag))lines.push(`CATÁLOGO ${t.tag} · ${t.nombre} · ${t.area}`);
 for(const p of s.points){const b=old.get(p.id),label=`${p.tag||'Sin TAG'}${p.name?' · '+p.name:''}`;
  if(p.removed){if(b&&!b.removed)lines.push(`QUITAR [${p.id}]`);continue;}
  if(!b||p.x!==b.x||p.y!==b.y||p.tag!==b.tag||p.name!==b.name||p.removed!==b.removed)lines.push(`${b?'UBICAR':'AGREGAR'} ${label} · px ${Math.round(p.x)},${Math.round(p.y)} [${p.id}]`);
 }
 return ['Borrador de ubicaciones · imagen 2800 × 2504 px (no son coordenadas 3D)',...lines.length?lines:['Sin cambios respecto al mapa de referencia.']].join('\n');
}
