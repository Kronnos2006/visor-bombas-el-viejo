// Administración de bombas · mover arrastrando (solo administrador).
// Se mueven juntos: el cuerpo de la bomba (o sus piezas del modelo), la etiqueta y la zona para tocarla.
// Las posiciones se guardan en Supabase (vocatus_pump_positions) y se aplican a todos al abrir y en tiempo real.
import {surveyConnection} from './cloud-surveys.js';
import {clavePendiente} from './ficha-pendiente.js?v=20261111-fotos-v2';

const $=s=>document.querySelector(s);
const TABLA='vocatus_pump_positions';
const V=()=>window.vocatus;

// ---------- Cálculos sin pantalla (se prueban) ----------
// Gira el punto (x,z) alrededor de (cx,cz) un ángulo en grados (sentido del eje Y de three.js).
export function girarPunto(x,z,cx,cz,grados){
 const a=grados*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=x-cx,dz=z-cz;
 return [cx+dx*c+dz*s,cz-dx*s+dz*c];
}
export function limpiarPosicion(fila){
 const n=v=>Number.isFinite(Number(v))?Math.round(Number(v)*1000)/1000:null;
 const key=String(fila?.key||'').slice(0,300),x=n(fila?.x),z=n(fila?.z),giro=n(fila?.giro)??0;
 if(!key||x==null||z==null||Math.abs(x)>5000||Math.abs(z)>5000)return null;
 return {key,x,z,giro:((giro%360)+540)%360-180};
}
// Una pieza del modelo pertenece a la bomba si su centro cae dentro de la caja y no es mucho más grande que ella.
export function piezaDentro(cajaBomba,cajaPieza,margen=.15){
 const c=[0,1,2].map(i=>(cajaPieza.min[i]+cajaPieza.max[i])/2);
 const dentro=[0,1,2].every(i=>c[i]>=cajaBomba.min[i]-margen&&c[i]<=cajaBomba.max[i]+margen);
 const grande=[0,2].some(i=>(cajaPieza.max[i]-cajaPieza.min[i])>(cajaBomba.max[i]-cajaBomba.min[i])*1.3+margen);
 return dentro&&!grande;
}

// ---------- Escena ----------
let api=null,lugares=new Map(),guardadas=new Map(),aplicadas=new Map(),cambios=new Map(),deshacer=[],activo=false,elegido=null,conexion=null,reclamadas=new WeakSet();

function lugarDeObjeto(o){
 for(let x=o;x;x=x.parent){
  if(x.userData?.pending)return lugarDeRef(x.userData.pending);
  if(x.userData?.tag){const ref=api.refs.find(r=>r.fichaTag===x.userData.tag);if(ref)return lugarDeRef(ref);const cuerpo=api.cuerpos[x.userData.tag];if(cuerpo&&!cuerpo.userData.hitProxy)return lugarDeCuerpo(x.userData.tag,cuerpo);}
 }
 return null;
}
function lugarDeRef(s){
 const key=clavePendiente(s);if(lugares.has(key))return lugares.get(key);
 const l={key,tipo:'ref',s,nombre:s.fichaTag||s.tagAsignado||s.nombre||'Bomba',piezas:null};lugares.set(key,l);return l;
}
function lugarDeCuerpo(tag,cuerpo){
 const key='cuerpo:'+tag;if(lugares.has(key))return lugares.get(key);
 const l={key,tipo:'cuerpo',cuerpo,nombre:tag};lugares.set(key,l);return l;
}
const T=()=>api.THREE;
function cajaMundoDeRef(s){const {THREE,g}=api;g.updateMatrixWorld(true);return new THREE.Box3(new THREE.Vector3(...s.min),new THREE.Vector3(...s.max)).applyMatrix4(g.matrixWorld);}
function centroMundo(l){
 const THREE=T();
 if(l.tipo==='cuerpo'){l.cuerpo.updateMatrixWorld(true);return new THREE.Box3().setFromObject(l.cuerpo).getCenter(new THREE.Vector3());}
 return cajaMundoDeRef(l.s).getCenter(new THREE.Vector3());
}
// Piezas visibles de una bomba sin ficha completa: las del modelo y de las bombas de campo dentro de su caja.
// Las cajas de todas las piezas se calculan una sola vez (el modelo es grande).
let indicePiezas=null;
function piezasDelModelo(){
 if(indicePiezas)return indicePiezas;
 const THREE=T(),raices=[api.g,api.escena,api.campo].filter(Boolean).filter((r,i,arr)=>!arr.some((o,j)=>j<i&&isAncestor(o,r)));
 indicePiezas=[];for(const raiz of raices)raiz.updateMatrixWorld(true);
 for(const raiz of raices)raiz.traverse(o=>{
  if(!o.isMesh||o.userData.hitProxy)return;
  const k=new THREE.Box3().setFromObject(o);if(!k.isEmpty())indicePiezas.push({o,caja:{min:k.min.toArray(),max:k.max.toArray()}});
 });
 return indicePiezas;
}
function piezasDeRef(l){
 if(l.piezas)return l.piezas;
 const caja=cajaMundoDeRef(l.s),cb={min:caja.min.toArray(),max:caja.max.toArray()},out=[];
 for(const {o,caja:k} of piezasDelModelo())if(!reclamadas.has(o)&&piezaDentro(cb,k)){out.push(o);reclamadas.add(o);}
 // Si una pieza y su padre entran los dos, se mueve solo el padre.
 l.piezas=out.filter(o=>!out.some(p=>p!==o&&isAncestor(p,o)));return l.piezas;
}
function isAncestor(a,b){for(let x=b.parent;x;x=x.parent)if(x===a)return true;return false;}
// Mueve un objeto en el mundo aunque su padre tenga otra posición o escala.
function moverMundo(o,dx,dz){
 const THREE=T(),p=o.getWorldPosition(new THREE.Vector3());p.x+=dx;p.z+=dz;o.parent.updateMatrixWorld(true);o.position.copy(o.parent.worldToLocal(p));o.updateMatrixWorld(true);
}
function girarMundo(o,cx,cz,grados){
 const THREE=T(),p=o.getWorldPosition(new THREE.Vector3()),[x,z]=girarPunto(p.x,p.z,cx,cz,grados);p.x=x;p.z=z;
 const q=o.getWorldQuaternion(new THREE.Quaternion()),r=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),grados*Math.PI/180);
 const qp=o.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 o.parent.updateMatrixWorld(true);o.position.copy(o.parent.worldToLocal(p));o.quaternion.copy(qp.multiply(r.multiply(q)));o.updateMatrixWorld(true);
}
function moverLugar(l,dx,dz){
 if(!dx&&!dz)return;
 if(l.tipo==='cuerpo'){moverMundo(l.cuerpo,dx,dz);return;}
 const {THREE,g}=api,s=l.s;
 for(const o of piezasDeRef(l))moverMundo(o,dx,dz);
 if(s.hit)moverMundo(s.hit,dx,dz);if(s.anclaEtiqueta)moverMundo(s.anclaEtiqueta,dx,dz);
 // La caja (s.min/max) está en coordenadas del grupo del modelo.
 g.updateMatrixWorld(true);const c=centroMundo(l),a=g.worldToLocal(c.clone()),b=g.worldToLocal(c.clone().add(new THREE.Vector3(dx,0,dz)));
 const ddx=b.x-a.x,ddz=b.z-a.z;s.min=[s.min[0]+ddx,s.min[1],s.min[2]+ddz];s.max=[s.max[0]+ddx,s.max[1],s.max[2]+ddz];
}
function girarLugar(l,grados){
 if(!grados)return;const c=centroMundo(l);
 if(l.tipo==='cuerpo'){girarMundo(l.cuerpo,c.x,c.z,grados);return;}
 for(const o of piezasDeRef(l))girarMundo(o,c.x,c.z,grados);
}
// Lleva un lugar a la posición guardada (centro x,z en el mundo y giro respecto del original).
function aplicarGuardada(pos){
 const l=buscarLugar(pos.key);if(!l)return;
 const antes=aplicadas.get(pos.key)?.giro||0;girarLugar(l,pos.giro-antes);
 const c=centroMundo(l);moverLugar(l,pos.x-c.x,pos.z-c.z);aplicadas.set(pos.key,{giro:pos.giro});
}
function buscarLugar(key){
 if(lugares.has(key))return lugares.get(key);
 if(key.startsWith('cuerpo:')){const tag=key.slice(7),c=api.cuerpos[tag];if(c&&!c.userData.hitProxy)return lugarDeCuerpo(tag,c);const ref=api.refs.find(r=>r.fichaTag===tag);return ref?lugarDeRef(ref):null;}
 const ref=api.refs.find(r=>clavePendiente(r)===key);return ref?lugarDeRef(ref):null;
}

// ---------- Arrastrar ----------
let arrastre=null;
function rayoAlPiso(e,y){
 const {THREE,camera,renderer,raycaster}=api,r=renderer.domElement.getBoundingClientRect();
 raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
 return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-y),new THREE.Vector3());
}
function alPresionar(e){
 if(!activo||e.button>0)return;
 const {THREE,camera,renderer,raycaster,pickables}=api,r=renderer.domElement.getBoundingClientRect();
 raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
 const hit=raycaster.intersectObjects(pickables,true).find(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});
 const l=hit&&lugarDeObjeto(hit.object);if(!l)return;
 e.stopImmediatePropagation();e.preventDefault();
 const piso=hit.point.y,inicio=rayoAlPiso(e,piso);if(!inicio)return;
 elegir(l);arrastre={l,piso,ultimo:inicio,total:[0,0],id:e.pointerId};api.controls.enabled=false;
 try{renderer.domElement.setPointerCapture(e.pointerId);}catch{}
}
function alMover(e){
 if(!arrastre||e.pointerId!==arrastre.id)return;
 e.stopImmediatePropagation();const p=rayoAlPiso(e,arrastre.piso);if(!p)return;
 const dx=p.x-arrastre.ultimo.x,dz=p.z-arrastre.ultimo.z;moverLugar(arrastre.l,dx,dz);arrastre.total[0]+=dx;arrastre.total[1]+=dz;arrastre.ultimo=p;
}
function alSoltar(e){
 if(!arrastre||e.pointerId!==arrastre.id)return;
 e.stopImmediatePropagation();const {l,total}=arrastre;arrastre=null;api.controls.enabled=true;
 if(Math.hypot(...total)>.01){deshacer.push({l,dx:total[0],dz:total[1],giro:0});anotar(l);}
}
function elegir(l){elegido=l;pintarBarra();}
function anotar(l){const c=centroMundo(l);cambios.set(l.key,{key:l.key,x:c.x,z:c.z,giro:(aplicadas.get(l.key)?.giro||0)});pintarBarra();}
function girarElegido(grados){
 if(!elegido)return;girarLugar(elegido,grados);const giro=(aplicadas.get(elegido.key)?.giro||0)+grados;aplicadas.set(elegido.key,{giro});
 deshacer.push({l:elegido,dx:0,dz:0,giro:grados});anotar(elegido);
}
function deshacerUltimo(){
 const u=deshacer.pop();if(!u)return;
 if(u.giro){girarLugar(u.l,-u.giro);aplicadas.set(u.l.key,{giro:(aplicadas.get(u.l.key)?.giro||0)-u.giro});}
 moverLugar(u.l,-u.dx,-u.dz);
 if(!deshacer.some(d=>d.l===u.l))cambios.delete(u.l.key);else anotar(u.l);
 pintarBarra();
}
async function guardar(){
 const filas=[...cambios.values()].map(limpiarPosicion).filter(Boolean);if(!filas.length)return;
 const boton=$('#mover-guardar');boton.disabled=true;
 try{
  conexion=conexion||await surveyConnection();if(!conexion)throw Error('Entrá con tu cuenta para guardar.');
  const r=await conexion.client.from(TABLA).upsert(filas.map(f=>({...f,updated_at:new Date().toISOString(),updated_by:conexion.userId})),{onConflict:'key'});
  if(r.error)throw r.error;
  for(const f of filas)guardadas.set(f.key,f);cambios.clear();deshacer=[];aviso(`Posiciones guardadas (${filas.length}). Todos las ven al abrir el visor.`);
 }catch(e){aviso(/vocatus_pump_positions|PGRST20[25]|does not exist/i.test(e?.message||'')?'Falta preparar la base: corré el SQL «posiciones de bombas».':/row-level|42501|permission/i.test(e?.message||'')?'Solo un administrador puede mover bombas.':e.message||'No se pudo guardar.');}
 finally{boton.disabled=false;pintarBarra();}
}
function aviso(t){const el=$('#mejora-aviso');if(el){el.textContent=t;el.hidden=false;clearTimeout(aviso.t);aviso.t=setTimeout(()=>el.hidden=true,6500);}}

// ---------- Botones ----------
function pintarBarra(){
 const b=$('#mover-barra');if(!b)return;b.hidden=!activo;
 $('#mover-nombre').textContent=elegido?elegido.nombre:'Tocá y arrastrá una bomba';
 $('#mover-izq').disabled=$('#mover-der').disabled=!elegido;$('#mover-deshacer').disabled=!deshacer.length;
 $('#mover-guardar').textContent=cambios.size?`Guardar (${cambios.size})`:'Guardar';$('#mover-guardar').disabled=!cambios.size;
}
function salir(){
 if(cambios.size&&!confirm('Hay cambios sin guardar. ¿Salir igual? Se van a deshacer.'))return;
 while(deshacer.length)deshacerUltimo();activo=false;elegido=null;document.body.classList.remove('moviendo-bombas');pintarBarra();$('#mover-activar')?.setAttribute('aria-pressed','false');
}
function montarBotones(){
 if($('#mover-activar')||!$('#tel-herramientas'))return!!$('#mover-activar');
 const b=document.createElement('button');b.type='button';b.id='mover-activar';b.className='paleta-boton mover-activar';b.textContent='✥ Mover bombas (administrador)';b.setAttribute('aria-pressed','false');
 b.onclick=()=>{if(activo){salir();return;}if(!V()?.mover3D){aviso('Esperá a que cargue el 3D.');return;}activo=true;document.body.classList.add('moviendo-bombas');b.setAttribute('aria-pressed','true');pintarBarra();aviso('Modo mover: tocá una bomba y arrastrala. Usá ⟲ ⟳ para girarla.');};
 $('#tel-herramientas').prepend(b);
 document.body.insertAdjacentHTML('beforeend',`<div id="mover-barra" class="mover-barra" hidden><span id="mover-nombre"></span>
 <button type="button" class="mini-boton" id="mover-izq" title="Girar a la izquierda 15°">⟲</button><button type="button" class="mini-boton" id="mover-der" title="Girar a la derecha 15°">⟳</button>
 <button type="button" class="mini-boton" id="mover-deshacer">Deshacer</button><button type="button" class="mini-boton mover-guardar" id="mover-guardar">Guardar</button><button type="button" class="mini-boton" id="mover-salir">Salir</button></div>`);
 $('#mover-izq').onclick=()=>girarElegido(15);$('#mover-der').onclick=()=>girarElegido(-15);
 $('#mover-deshacer').onclick=deshacerUltimo;$('#mover-guardar').onclick=guardar;$('#mover-salir').onclick=salir;
 return true;
}

// ---------- Inicio ----------
async function cargarGuardadas(){
 try{conexion=await surveyConnection();if(!conexion)return;
  const r=await conexion.client.from(TABLA).select('key,x,z,giro');if(r.error)return;
  for(const f of r.data||[]){const p=limpiarPosicion(f);if(p)guardadas.set(p.key,p);}
  const canal=conexion.client.channel?.('vocatus-posiciones');
  canal?.on('postgres_changes',{event:'*',schema:'public',table:TABLA},p=>{const pos=limpiarPosicion(p.new);if(!pos||cambios.has(pos.key))return;guardadas.set(pos.key,pos);if(api)aplicarGuardada(pos);}).subscribe();
 }catch{}
}
let aplicado=false;
function aplicarTodas(){
 api=V()?.mover3D;if(!api||aplicado)return;aplicado=true;
 for(const pos of guardadas.values())try{aplicarGuardada(pos);}catch(e){console.warn('Posición',pos.key,e);}
}
export function iniciarMoverBombas({admin=false}={}){
 if(typeof document==='undefined')return;
 const listo=Promise.all([cargarGuardadas(),new Promise(r=>{const ok=()=>r();document.addEventListener('vocatus:campo-listo',()=>{indicePiezas=null;ok();},{once:true});document.addEventListener('vocatus:referencias',()=>setTimeout(ok,8000),{once:true});})]);
 listo.then(aplicarTodas);
 if(!admin)return;
 const enganchar=()=>{if(!montarBotones())return false;const c=V()?.mover3D?.renderer?.domElement;if(!c)return false;
  c.addEventListener('pointerdown',alPresionar,true);c.addEventListener('pointermove',alMover,true);c.addEventListener('pointerup',alSoltar,true);c.addEventListener('pointercancel',alSoltar,true);return true;};
 if(!enganchar()){const t=setInterval(()=>{if(enganchar())clearInterval(t);},1500);}
}
