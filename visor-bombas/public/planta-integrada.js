// Modelo integrado de Revit (20-oct-2026): sectores para aislar y ubicación de las bombas con ficha.
// Los nombres de sector salen de los elementos del FBX (ver tools/fbx-planta-a-glb.mjs y planta-integrada.json).
export const INFO_URL='/modelos/planta-integrada.json';
export const SECTORES_INT=[
 {id:'tanques',nombre:'Sector de tanques',sectores:['Sector de tanques']},
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

// Conserva la relación con la torre en el plano existente. La separación final es de
// presentación: desplaza el sector hacia el frente solo lo necesario para no invadir
// los edificios del conjunto. No son coordenadas de levantamiento.
export function ubicarTanques(info,area,torre,local){
 const dx=area.pos[0]-torre.pos[0],dz=area.pos[1]-torre.pos[1],c=Math.cos(torre.giro),s=Math.sin(torre.giro);
 const [x,,z]=torreAIntegrado(info.torre,c*dx-s*dz,0,s*dx+c*dz);
 const giro=info.torre.giro+area.giro-torre.giro,cg=Math.cos(giro),sg=Math.sin(giro);
 const corners=[];for(const a of [local.min[0],local.max[0]])for(const b of [local.min[2],local.max[2]])corners.push([cg*a+sg*b,-sg*a+cg*b]);
 const minX=x+Math.min(...corners.map(p=>p[0])),maxX=x+Math.max(...corners.map(p=>p[0]));
 const minZ=z+Math.min(...corners.map(p=>p[1])),maxZ=z+Math.max(...corners.map(p=>p[1]));
 let desplazar=0;
 const obstacle=Object.entries(info.sectores).filter(([name])=>!SIEMPRE.includes(name)&&name!==CUBIERTA&&name!=='Sector de tanques').map(([,b])=>b);
 let changed=true;while(changed){changed=false;for(const b of obstacle){if(minX<b.max[0]+1&&maxX>b.min[0]-1&&minZ+desplazar<b.max[2]+1-1e-6&&maxZ+desplazar>b.min[2]-1+1e-6){desplazar=b.max[2]+1-minZ;changed=true;}}}
 return {x,y:(info.sectores['Suelo VOCATUS']?.max[1]||0)-local.min[1],z:z+desplazar,giro,desplazamiento:desplazar};
}
