// Diferencias confirmadas por el usuario entre el FBX general (nov-2026) y los modelos ya publicados.
// Los modelos y bombas-individuales.json no se regeneran: se ajustan al cargar.
export const CONJUNTO_REEMPLAZADO='Conjunto compartido de bombas verticales de calderas';
// Confirmado por el usuario: en ese sitio solo va la bomba auxiliar del FBX.
export const ADICIONALES_RETIRADAS='Bombas adicionales de tanques de agua';
export const TORRE_PEQUENA='REF Torre pequena',DESPLAZAMIENTO_TORRE_Z=-2.06;
// Confirmado por el usuario: las tres bombas de este grupo que están frente a semilleros pertenecen a Semilleros.
export const GRUPO_SEMILLEROS='Dos bombas frontales y tres frente a semilleros',SECTOR_FERMENTACION='REF Fermentacion',SECTOR_SEMILLEROS='REF Semilleros y pies de cuba',X_SEMILLEROS=28;
export function separarSemilleros(grupos){
 const i=grupos.findIndex(g=>g.nombre===GRUPO_SEMILLEROS&&g.sector===SECTOR_FERMENTACION);if(i<0)return grupos;
 const g=grupos[i],frente=g.bombas.filter(b=>b.min[0]<X_SEMILLEROS),semilleros=g.bombas.filter(b=>b.min[0]>=X_SEMILLEROS);
 if(!semilleros.length)return grupos;
 // Conservan su clave y numeración anteriores para no perder nombres, fotos ni datos ya guardados.
 const r=[...grupos];r.splice(i,1,{...g,bombas:frente},{...g,sector:SECTOR_SEMILLEROS,sectorClave:SECTOR_FERMENTACION,indiceBase:frente.length,bombas:semilleros});
 return r;
}
// Parte también la malla, para que se vean al aislar Semilleros. dx: desplazamiento del modelo publicado.
export function moverMallasSemilleros(T,escena,dx=0){
 const limite=X_SEMILLEROS+dx,nuevas=[];
 escena.traverse(o=>{
  if(!o.isMesh||o.userData.sector!==SECTOR_FERMENTACION)return;
  if(!/Dos bombas frontales y tres frente|Conexiones dos bombas y tres semilleros/.test(String(o.userData.original_name||o.userData.bomba||o.name).replace(/_/g,' ')))return;
  o.updateMatrix();const g=o.geometry,p=g.attributes.position,idx=g.index,n=idx?idx.count:p.count,v=new T.Vector3(),aqui=[],alla=[];
  for(let i=0;i+2<n;i+=3){let x=0;const t=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);for(const q of t)x+=v.fromBufferAttribute(p,q).applyMatrix4(o.matrix).x;(x/3>=limite?alla:aqui).push(...t);}
  if(!alla.length||!aqui.length){if(alla.length)o.userData.sector=SECTOR_SEMILLEROS;return;}
  const copia=o.clone();copia.geometry=g.clone();copia.geometry.setIndex(alla);copia.userData={...o.userData,sector:SECTOR_SEMILLEROS};
  const propia=g.clone();propia.setIndex(aqui);o.geometry=propia;nuevas.push([o.parent,copia]);
 });
 for(const [padre,copia] of nuevas)padre.add(copia);
}
// Bomba señalada por el usuario en el sector de tanques, entre B22 y B30. Sin ficha ni TAG.
export const FRENTE_TANQUES='Bombas faltantes del frente de tanques';
export function agregarBombaFrente(grupos){
 return grupos.map(g=>{
  if(g.nombre!==FRENTE_TANQUES||!g.entre)return g;
  return {...g,entre:[...g.entre,['B22','B30']],fracciones:[...(g.fracciones||g.entre.map(()=>.5)),.5],bombas:[...g.bombas,{min:[0,0,0],max:[.1,.1,.1]}]};
 });
}
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
// El usuario pidió sacar estas cinco del 3D de la planta. Sus fichas siguen en la lista de bombas.
export const TORRE_SIN_DIBUJO=new Set(['B4','B5','B6','B7','B8']);
export const TORRE_FILA_LIBRE={B19:{x:-27.7,z:7.8}};
export const TORRE_SIN_FICHA=[{"nombre": "Bomba 2 - envolvente fotográfica", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-38.061, 0.6, 2.398], "max": [-37.221, 1.806, 3.698]}]},
 {"nombre": "Bomba 3 - envolvente fotográfica", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-37.086, 0.6, 2.398], "max": [-36.246, 1.806, 3.698]}]},
 {"nombre": "Bomba columna Bach fotos 141932", "sector": "DUSA", "nota": "Bomba del FBX en la fila de la torre. Falta confirmar su TAG en planta.", "bombas": [{"min": [-30.502, 0.6, 3.215], "max": [-29.662, 1.806, 4.515]}]}];
export const ubicacionTorreFBX=tag=>TORRE_FBX[tag]||TORRE_FILA_LIBRE[tag]||null;
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
