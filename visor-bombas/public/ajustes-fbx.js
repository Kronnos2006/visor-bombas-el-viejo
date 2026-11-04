// Diferencias confirmadas por el usuario entre el FBX general (nov-2026) y los modelos ya publicados.
// Los modelos y bombas-individuales.json no se regeneran: se ajustan al cargar.
export const CONJUNTO_REEMPLAZADO='Conjunto compartido de bombas verticales de calderas';
export const TORRE_PEQUENA='REF Torre pequena',DESPLAZAMIENTO_TORRE_Z=-2.06;
export function gruposConCampo(base,campo){
 // Las cinco bombas verticales del FBX sustituyen al conjunto aproximado de tres.
 return campo.length?[...base.filter(g=>g.nombre!==CONJUNTO_REEMPLAZADO),...campo]:[...base];
}
// En el FBX todo el sector de la torre pequeña está 2,06 m más al sur.
export function moverTorrePequena(escena,info,grupos,dz=DESPLAZAMIENTO_TORRE_Z){
 escena.traverse(o=>{if(o.isMesh&&o.userData.sector===TORRE_PEQUENA)o.position.z+=dz;});
 const s=info.sectores?.[TORRE_PEQUENA];if(s){s.min[2]+=dz;s.max[2]+=dz;}
 for(const g of grupos)if(g.sector===TORRE_PEQUENA&&!g.nota?.includes('FBX general'))for(const b of g.bombas){b.min[2]+=dz;b.max[2]+=dz;}
}
