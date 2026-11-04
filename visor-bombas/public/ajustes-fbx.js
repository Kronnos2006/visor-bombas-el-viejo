// Diferencias confirmadas por el usuario entre el FBX general (nov-2026) y los modelos ya publicados.
// Los modelos y bombas-individuales.json no se regeneran: se ajustan al cargar.
export const CONJUNTO_REEMPLAZADO='Conjunto compartido de bombas verticales de calderas';
// Confirmado por el usuario: en ese sitio solo va la bomba auxiliar del FBX.
export const ADICIONALES_RETIRADAS='Bombas adicionales de tanques de agua';
export const TORRE_PEQUENA='REF Torre pequena',DESPLAZAMIENTO_TORRE_Z=-2.06;
export function gruposConCampo(base,campo){
 // Las cinco bombas verticales del FBX sustituyen al conjunto aproximado de tres.
 return campo.length?[...base.filter(g=>g.nombre!==CONJUNTO_REEMPLAZADO&&g.nombre!==ADICIONALES_RETIRADAS),...campo,...TORRE_SIN_FICHA.map(g=>structuredClone(g))]:[...base];
}
// En el FBX todo el sector de la torre pequeña está 2,06 m más al sur.
export function moverTorrePequena(escena,info,grupos,dz=DESPLAZAMIENTO_TORRE_Z){
 escena.traverse(o=>{if(o.isMesh&&o.userData.sector===TORRE_PEQUENA)o.position.z+=dz;});
 const s=info.sectores?.[TORRE_PEQUENA];if(s){s.min[2]+=dz;s.max[2]+=dz;}
 for(const g of grupos)if(g.sector===TORRE_PEQUENA&&!g.nota?.includes('FBX general'))for(const b of g.bombas){b.min[2]+=dz;b.max[2]+=dz;}
}

// Torre DUSA en la planta integrada, según el FBX. Solo cambia esta vista; las fichas y la vista propia de la torre no cambian.
// TAG unido por el servicio que indica el nombre en el FBX y en la ficha.
export const TORRE_FBX={
 B2:{x:-38.591,z:3.048,piezas:/DUSA - (Bomba 1 - envolvente|Cubierta roja de bomba 1)/},
 B3:{x:-35.766,z:3.048,piezas:/DUSA - (Bomba 2 columna Aldeh|Cubierta bomba 2 Aldeh|Conexiones segunda bomba Aldeh)/},
 B9:{x:-32.092,z:3.805,piezas:/DUSA - (Bomba 1 columna Rectificadora|Cubierta bomba 1 columna Rectificadora|Conexiones visuales bomba Rectificadora)/},
 B10:{x:-31.192,z:3.805,piezas:/DUSA - (Bomba 2 columna Rectificadora|Cubierta bomba 2 columna Rectificadora|Conexiones bomba 2 columna Rectificadora)/},
 B11:{x:-28.819,z:3.884,piezas:/DUSA - (Bomba 1 columna Vinaza|Cubierta bomba 1 columna Vinaza|Conexiones visuales bomba Vinaza)/},
 B12:{x:-27.919,z:3.884,piezas:/DUSA - (Bomba 2 columna Vinaza|Cubierta bomba 2 columna Vinaza|Conexiones bomba 2 columna Vinaza)/}
};
// Fichas sin bomba en el FBX ni en el DWFX: no se dibujan en la planta para que la torre quede igual a esos modelos.
// Se siguen abriendo desde la lista de bombas.
export const TORRE_SIN_UBICACION=new Set(['B4','B5','B6','B7','B8','B17','B18','B19','B20','B21']);
export const TORRE_SIN_FICHA=[{"nombre": "Bomba 2 - envolvente fotográfica", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-38.061, 0.6, 2.398], "max": [-37.221, 1.806, 3.698]}]},
 {"nombre": "Bomba 3 - envolvente fotográfica", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-37.086, 0.6, 2.398], "max": [-36.246, 1.806, 3.698]}]},
 {"nombre": "Bomba columna Bach fotos 141932", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-30.502, 0.6, 3.215], "max": [-29.662, 1.806, 4.515]}]}];
export const ubicacionTorreFBX=tag=>TORRE_FBX[tag]||null;
// La bomba del FBX pasa a ser la de la ficha: conserva su forma y posición y abre esa ficha.
export function vincularBombaFBX(T,cuerpo,escena,tag){
 const datos=TORRE_FBX[tag];if(!datos)return false;
 const partes=[];escena.traverse(o=>{if(o.isMesh&&datos.piezas.test(String(o.userData.original_name||o.name).replace(/_/g,' ')))partes.push(o);});
 if(!partes.length)return false;
 const caja=new T.Box3();for(const p of partes)caja.union(new T.Box3().setFromObject(p));
 const centro=caja.getCenter(new T.Vector3());centro.y=caja.min.y;
 for(const hijo of [...cuerpo.children])cuerpo.remove(hijo);
 cuerpo.rotation.set(0,0,0);cuerpo.scale.set(1,1,1);
 if(cuerpo.parent)cuerpo.parent.worldToLocal(centro);
 cuerpo.position.copy(centro);cuerpo.updateWorldMatrix(true,false);
 for(const p of partes)cuerpo.attach(p);
 return true;
}
