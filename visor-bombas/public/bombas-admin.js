// Ocultar o quitar bombas: lo decide un administrador y lo aplica la base de datos (RLS).
// No borra fichas, fotos ni informes; restaurar la deja como estaba.
import {surveyConnection} from './cloud-surveys.js';
const TABLE='vocatus_pump_visibility',CACHE='vocatus-visibilidad-bombas';
export const esAdmin=()=>document.documentElement.dataset.rol==='admin';
export const claveTag=tag=>'tag:'+tag;
export function createPumpVisibility({storage=globalThis.localStorage,connect=surveyConnection,notify=()=>document.dispatchEvent(new Event('vocatus:visibilidad'))}={}){
 let estados={};try{estados=JSON.parse(storage.getItem(CACHE))||{};}catch{}
 const guardar=()=>{try{storage.setItem(CACHE,JSON.stringify(estados));}catch{}notify();};
 const stateOf=key=>estados[key]||null;
 async function sync(){
  const connection=await connect();if(!connection)return false;
  const result=await connection.client.from(TABLE).select('reference_key,state');if(result.error)throw result.error;
  const nuevo=Object.fromEntries((result.data||[]).map(r=>[r.reference_key,r.state]));
  if(JSON.stringify(nuevo)!==JSON.stringify(estados)){estados=nuevo;guardar();}
  return true;
 }
 async function set(key,state){
  const connection=await connect();
  if(connection){
   const saved=state
    ?await connection.client.from(TABLE).upsert({reference_key:key,state,updated_at:new Date().toISOString(),updated_by:connection.userId},{onConflict:'reference_key'})
    :await connection.client.from(TABLE).delete().eq('reference_key',key);
   if(saved.error)throw saved.error;
  }
  if(state)estados={...estados,[key]:state};else{estados={...estados};delete estados[key];}
  guardar();return connection?'shared':'local';
 }
 return {stateOf,sync,set,all:()=>({...estados})};
}
export const pumpVisibility=createPumpVisibility();
export const explicarErrorVisibilidad=e=>/PGRST205|vocatus_pump_visibility|does not exist/i.test(`${e?.message||''} ${e?.code||''}`)
 ?'La base todavía no está preparada: falta ejecutar el SQL de bombas.'
 :/row-level security|42501|permission/i.test(`${e?.message||''} ${e?.code||''}`)?'Solo un administrador puede hacer esto.':'No se pudo guardar. Revisá la conexión.';
// Bloque de administrador en la ficha. Solo es comodidad: quien decide es la base de datos.
export function bloqueAdmin(key){
 const actual=pumpVisibility.stateOf(key),texto={oculta:'Oculta en el 3D',quitada:'Quitada de la planta y de la lista'}[actual]||'Visible';
 const boton=(accion,label)=>`<button type="button" data-visibilidad="${accion}"${(actual||'visible')===accion?' disabled':''}>${label}</button>`;
 return `<section class="block admin-bomba" data-clave="${key.replace(/[&<>"']/g,'')}"><h3>Administrador</h3><p>Estado: <strong>${texto}</strong>. No se borran datos y se puede restaurar.</p><div class="anatomy-actions">${boton('visible','Mostrar')}${boton('oculta','Ocultar del 3D')}${boton('quitada','Quitar')}</div><p class="admin-bomba-estado" role="status"></p></section>`;
}
// Quita del dibujo los triángulos dentro de las cajas; guarda la geometría original para restaurar.
export function recortarCajas(T,raiz,cajas,esPieza){
 raiz.updateWorldMatrix(true,true);
 const inversa=new T.Matrix4().copy(raiz.matrixWorld).invert(),c=new T.Vector3(),v=new T.Vector3(),m=new T.Matrix4();
 const boxes=cajas.map(b=>new T.Box3(new T.Vector3(...b.min),new T.Vector3(...b.max)).expandByScalar(.05));
 raiz.traverse(o=>{
  if(!o.isMesh||o.userData.hitProxy||!esPieza(o))return;
  if(o.userData.geometriaOriginal){o.geometry.dispose();o.geometry=o.userData.geometriaOriginal;delete o.userData.geometriaOriginal;}
  if(!boxes.length)return;
  m.multiplyMatrices(inversa,o.matrixWorld);
  const g=o.geometry,p=g.attributes.position,idx=g.index,n=idx?idx.count:p.count,kept=[];
  for(let i=0;i+2<n;i+=3){
   c.set(0,0,0);for(let k=0;k<3;k++)c.add(v.fromBufferAttribute(p,idx?idx.getX(i+k):i+k));c.multiplyScalar(1/3).applyMatrix4(m);
   if(!boxes.some(b=>b.containsPoint(c)))for(let k=0;k<3;k++)kept.push(idx?idx.getX(i+k):i+k);
  }
  if(kept.length===n)return;
  const copia=g.clone();copia.setIndex(kept);o.userData.geometriaOriginal=g;o.geometry=copia;
 });
}
