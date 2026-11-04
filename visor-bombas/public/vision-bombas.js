// Mejoras de visión de la planta. No mueve bombas ni cambia sus nombres o datos.
const PARTE_NO_BOMBA=/(tuber|conexi|colector|soporte|canaleta|piso|ramal|cubierta)/i;
export const esMallaBomba=o=>{
 if(o.userData.tag||o.userData.bomba)return true;
 const nombre=String(o.userData.original_name||o.name||'').replace(/^.*? - /,'');
 return /\bbombas?\b/i.test(nombre)&&!PARTE_NO_BOMBA.test(nombre);
};
// Etiquetas: gana la más cercana a la cámara; la que choca se oculta hasta acercarse.
export function elegirEtiquetas(items,margen=4){
 const puestos=[],ocultas=[];
 for(const it of [...items].sort((a,b)=>Number(!!b.prioridad)-Number(!!a.prioridad)||a.z-b.z)){
  const cruza=p=>Math.abs(p.x-it.x)<(p.w+it.w)/2+margen&&Math.abs(p.y-it.y)<(p.h+it.h)/2+margen;
  if(puestos.some(cruza))ocultas.push(it);else puestos.push(it);
 }
 return ocultas;
}
// Las bombas brillan apenas con su propio color para separarse de tanques y tuberías.
// Se clona el material para no aclarar otros equipos que lo compartan.
export function realzarBombas(raiz,intensidad=.22){
 let n=0;
 raiz.traverse(o=>{
  if(!o.isMesh||o.userData.hitProxy||o.userData.realzada||!esMallaBomba(o))return;
  const lista=Array.isArray(o.material)?o.material:[o.material];if(!lista.every(m=>m?.emissive&&m.color))return;
  const copia=lista.map(m=>{const c=m.clone();c.emissive.copy(c.color).multiplyScalar(intensidad);c.emissiveIntensity=1;return c;});
  o.material=Array.isArray(o.material)?copia:copia[0];o.userData.realzada=true;n++;
 });
 return n;
}
