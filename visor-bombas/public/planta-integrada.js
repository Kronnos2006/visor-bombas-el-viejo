// Modelo integrado de Revit (20-oct-2026): sectores para aislar y ubicación de las bombas con ficha.
// Los nombres de sector salen de los elementos del FBX (ver tools/fbx-planta-a-glb.mjs y planta-integrada.json).
export const INFO_URL='/modelos/planta-integrada.json';
export const SECTORES_INT=[
 {id:'torre',nombre:'Torre de destilación',sectores:['DUSA','DUSA planta','VOCATUS Enlace destilacion']},
 {id:'fermentacion',nombre:'Fermentación',sectores:['REF Fermentacion','REF Fermentacion ampliacion']},
 {id:'semilleros',nombre:'Semilleros',sectores:['REF Semilleros y pies de cuba']},
 {id:'almacenamiento',nombre:'Almacenamiento de alcohol',sectores:['REF Almacenamiento alcohol','REF Sector completo sur']},
 {id:'cuatro',nombre:'Cuatro tanques',sectores:['REF Cuatro tanques','REF Cuatro tanques detalle']},
 {id:'agua',nombre:'Agua y enfriamiento',sectores:['REF Agua y enfriamiento','REF Torre pequena','REF Pasillo']},
 {id:'calderas',nombre:'Calderas y nave',sectores:['REF Detalle','REF Detras ADMIN','REF Exterior','REF Fotos','REF Plano ampliacion']},
 {id:'edificios',nombre:'Edificios',sectores:['FBX Administracion','FBX Banos','FBX Bodega pequena','FBX Bodega quimicos','FBX Cuarto electrico']}
];
// Pisos: siempre visibles como referencia. La cubierta común se oculta al aislar un sector para ver adentro.
export const SIEMPRE=['Suelo VOCATUS','REF Sector'];
export const CUBIERTA='REF Cubierta comun';
export const sectorDe=nombre=>SECTORES_INT.find(s=>s.sectores.includes(nombre))?.id||null;
// ¿Se ve este sector del FBX con el filtro elegido (null = toda la planta)?
export function visibleCon(nombre,filtro){
 if(!filtro)return true;
 if(SIEMPRE.includes(nombre))return true;
 if(nombre===CUBIERTA)return false;
 return sectorDe(nombre)===filtro;
}
// Coordenadas locales de la torre del visor → coordenadas del modelo integrado (giro en planta + traslado).
export function torreAIntegrado(t,x,y,z){
 const c=Math.cos(-t.giro),s=Math.sin(-t.giro);
 return [c*x-s*z+t.x,y+t.y,s*x+c*z+t.z];
}
// Caja (min/max) de un sector amigable, uniendo las cajas de sus sectores del FBX.
export function cajaSector(info,id){
 const s=SECTORES_INT.find(x=>x.id===id);if(!s)return null;
 let min=null,max=null;
 for(const k of s.sectores){const b=info.sectores[k];if(!b)continue;
  min=min?min.map((v,i)=>Math.min(v,b.min[i])):[...b.min];max=max?max.map((v,i)=>Math.max(v,b.max[i])):[...b.max];}
 return min?{min,max}:null;
}
