// Bodega en línea: pedidos de repuestos guardados en Supabase (tabla vocatus_parts_requests).
// Quien pide ve sus pedidos; los administradores ven todos y los marcan listos o entregados. Se avisa con la campana.
import {surveyConnection} from './cloud-surveys.js';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const ESTADO={pendiente:'Pendiente',preparado:'Listo para retirar',entregado:'Entregado',cancelado:'Cancelado'};
const FALTA_SQL=/vocatus_parts_requests|PGRST20[25]|does not exist|schema cache/i;
const fecha=t=>{try{return new Date(t).toLocaleString('es-CR',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}catch{return '';}};
const conocido=v=>v&&!/por confirmar|^-+$|^n\/?a$/i.test(String(v).trim());

// ---------- Sin pantalla (se prueba) ----------
// Repuestos de una bomba sin ficha completa, sacados del Excel de la asignación.
export function repuestosDeExcel(tag,asig){
 const e=asig?.excel?.[tag];if(!e)return [];
 const out=[];
 if(conocido(e.sello))out.push({pieza:'Sello mecánico',detalle:e.sello});
 if(conocido(e.rodDel))out.push({pieza:'Rodamiento delantero',detalle:e.rodDel});
 if(conocido(e.rodTra))out.push({pieza:'Rodamiento trasero',detalle:e.rodTra});
 if(conocido(e.acople))out.push({pieza:'Elemento de acople',detalle:e.acople});
 return out.map(r=>({...r,tag,codigo:'',cantidad:1}));
}
export function limpiarPedido(items=[],note=''){
 const lista=(Array.isArray(items)?items:[]).map(i=>({
  tag:/^B[1-9]\d{0,3}$/.test(String(i.tag||''))?String(i.tag):'',
  pieza:String(i.pieza||'').trim().slice(0,80),detalle:String(i.detalle||'').trim().slice(0,200),
  codigo:String(i.codigo||'').trim().slice(0,60),cantidad:Math.min(99,Math.max(1,Math.round(Number(i.cantidad)||1)))
 })).filter(i=>i.pieza);
 if(!lista.length)throw Error('Agregá al menos un repuesto.');
 if(lista.length>40)throw Error('Máximo 40 repuestos por pedido.');
 return {items:lista,note:String(note||'').trim().slice(0,1000)};
}

// ---------- Pantalla ----------
let ctx=null,conexion=null,admin=false,pedidos=[],verTodos=false,sinSql=false;
async function conectar(){
 try{conexion=await surveyConnection();}catch{conexion=null;}
 if(!conexion)return;
 try{const r=await conexion.client.rpc('vocatus_account');admin=!r.error&&r.data?.role==='admin';}catch{}
}
async function cargarPedidos(){
 if(!conexion){pintarPedidos();return;}
 const r=await conexion.client.from('vocatus_parts_requests').select('*').order('created_at',{ascending:false}).limit(100);
 if(r.error){sinSql=FALTA_SQL.test(r.error.message||'');pintarPedidos();return;}
 sinSql=false;pedidos=r.data||[];pintarPedidos();
}
function pintarPedidos(){
 const caja=$('#bod-pedidos');if(!caja)return;
 if(!conexion){caja.innerHTML='<p class="tel-vacio">Entrá con tu cuenta para enviar y ver pedidos.</p>';return;}
 if(sinSql){caja.innerHTML=`<p class="tel-vacio">${admin?'Falta preparar la base: corré en Supabase el SQL «pedidos de repuestos».':'Los pedidos todavía no están activos.'}</p>`;return;}
 const visibles=pedidos.filter(p=>verTodos||['pendiente','preparado'].includes(p.status));
 caja.innerHTML=`<p class="tel-nota">${admin?'Ves los pedidos de todo el equipo. Al marcarlos, la persona recibe un aviso.':'Ves tus pedidos y si ya están listos.'}</p>
 <div class="orden-filtros"><button type="button" data-bp="activos" aria-pressed="${!verTodos}">En curso</button><button type="button" data-bp="todos" aria-pressed="${verTodos}">Todos</button></div>
 ${visibles.length?visibles.map(p=>`<article class="orden-card pedido-card" data-pedido="${esc(p.id)}"><div class="orden-meta"><span>${esc(fecha(p.created_at))} · ${esc(p.created_by_name||'—')}</span><span class="pedido-estado ${esc(p.status)}">${esc(ESTADO[p.status]||p.status)}</span></div>
  <ul class="pedido-items">${(p.items||[]).map(i=>`<li><b>${esc(i.cantidad||1)} ×</b> ${esc(i.pieza)}${i.tag?` · <span>${esc(i.tag)}</span>`:''}${i.detalle||i.codigo?`<small>${esc([i.codigo,i.detalle].filter(Boolean).join(' · '))}</small>`:''}</li>`).join('')}</ul>
  ${p.note?`<p>${esc(p.note)}</p>`:''}
  <div class="orden-acciones">${admin&&p.status==='pendiente'?'<button type="button" data-pa="preparado">Listo para retirar</button>':''}${admin&&['pendiente','preparado'].includes(p.status)?'<button type="button" data-pa="entregado">Entregado</button>':''}${p.status==='pendiente'&&(admin||p.created_by===conexion.userId)?'<button type="button" data-pa="cancelado">Cancelar pedido</button>':''}</div></article>`).join('')
  :`<p class="tel-vacio">${verTodos?'Todavía no hay pedidos.':'No hay pedidos en curso.'}</p>`}`;
 caja.querySelectorAll('[data-bp]').forEach(b=>b.onclick=()=>{verTodos=b.dataset.bp==='todos';pintarPedidos();});
 caja.querySelectorAll('[data-pa]').forEach(b=>b.onclick=async()=>{
  const id=b.closest('[data-pedido]').dataset.pedido,estado=b.dataset.pa;
  if(estado==='cancelado'&&!confirm('¿Cancelar este pedido?'))return;
  b.disabled=true;const r=await conexion.client.from('vocatus_parts_requests').update({status:estado}).eq('id',id).select('id');
  if(r.error||!r.data?.length){ctx.aviso('No se pudo actualizar el pedido.');b.disabled=false;return;}
  cargarPedidos();
 });
}
function montarDialogos(){
 if($('#bod-dialog'))return;
 document.body.insertAdjacentHTML('beforeend',`<dialog id="bod-dialog" class="mejora-dialog"><form id="bod-form"><p class="orden-kicker">BODEGA</p><h2>Enviar pedido</h2>
 <div id="bod-revision" class="pedido-revision"></div>
 <label>Nota para bodega (opcional)<textarea name="note" rows="3" maxlength="1000" placeholder="Ej. lo necesito para mañana a las 7"></textarea></label>
 <p id="bod-error" class="tel-nota orden-error" role="alert"></p>
 <div class="orden-form-acciones"><button type="button" id="bod-cancelar">Seguir agregando</button><button type="submit" class="orden-primary">Enviar a bodega</button></div></form></dialog>
 <dialog id="bod-manual-dialog" class="mejora-dialog"><form id="bod-manual-form"><p class="orden-kicker">BODEGA</p><h2>Otro repuesto</h2>
 <label>Repuesto<input name="pieza" required maxlength="80" placeholder="Ej. sello mecánico"></label>
 <label>Código o medida (opcional)<input name="codigo" maxlength="60" placeholder="Ej. 6308-2RS"></label>
 <label>Cantidad<input name="cantidad" type="number" min="1" max="99" value="1"></label>
 <div class="orden-form-acciones"><button type="button" id="bod-manual-cancelar">Cancelar</button><button type="submit" class="orden-primary">Agregar al pedido</button></div></form></dialog>`);
 $('#bod-cancelar').onclick=()=>$('#bod-dialog').close();
 $('#bod-manual-cancelar').onclick=()=>$('#bod-manual-dialog').close();
 $('#bod-manual-form').onsubmit=e=>{
  e.preventDefault();const f=e.target,tag=$('#bod-bomba')?.value||'';
  ctx.carrito.guardar([...ctx.carrito.leer(),{tag,pieza:f.elements.pieza.value.trim(),codigo:f.elements.codigo.value.trim(),detalle:'',cantidad:Number(f.elements.cantidad.value)||1,id:crypto.randomUUID?.()||String(Date.now()+Math.random())}]);
  f.reset();$('#bod-manual-dialog').close();ctx.pintarBodega();ctx.aviso('Repuesto agregado al pedido.');
 };
 $('#bod-form').onsubmit=async e=>{
  e.preventDefault();const boton=e.target.querySelector('[type=submit]');boton.disabled=true;$('#bod-error').textContent='';
  try{
   if(!conexion)throw Error('Entrá con tu cuenta para enviar el pedido.');
   const {items,note}=limpiarPedido(ctx.carrito.leer(),e.target.elements.note.value);
   const orden=$('#bod-orden')?.value||null;
   const r=await conexion.client.from('vocatus_parts_requests').insert({items,note,order_id:orden||null});
   if(r.error)throw r.error;
   ctx.carrito.guardar([]);e.target.reset();$('#bod-dialog').close();ctx.pintarBodega();ctx.aviso('Pedido enviado a bodega. Te avisamos cuando esté listo.');cargarPedidos();
  }catch(err){$('#bod-error').textContent=FALTA_SQL.test(err?.message||'')?'Falta preparar la base: corré el SQL «pedidos de repuestos».':/row-level|42501|permission/i.test(err?.message||'')?'Tu cuenta solo permite consultar.':err.message||'No se pudo enviar.';}
  finally{boton.disabled=false;}
 };
}
// Revisión del pedido antes de enviar: se puede cambiar la cantidad o quitar repuestos.
function abrirEnvio(){
 const items=ctx.carrito.leer();
 if(!items.length){ctx.aviso('El pedido está vacío: agregá repuestos de la ficha o «Otro repuesto».');return;}
 const pintar=()=>{
  const lista=ctx.carrito.leer();
  $('#bod-revision').innerHTML=lista.length?`<ul class="pedido-items editable">${lista.map((i,n)=>`<li><span>${esc(i.pieza)}${i.tag?' · '+esc(i.tag):''}<small>${esc([i.codigo,i.detalle].filter(Boolean).join(' · '))}</small></span><input type="number" min="1" max="99" value="${esc(i.cantidad||1)}" data-cant="${n}" aria-label="Cantidad de ${esc(i.pieza)}"><button type="button" class="mini-boton" data-quitar-item="${n}" aria-label="Quitar ${esc(i.pieza)}">✕</button></li>`).join('')}</ul>`:'<p class="tel-vacio">El pedido quedó vacío.</p>';
  $('#bod-revision').querySelectorAll('[data-cant]').forEach(inp=>inp.onchange=()=>{const l=ctx.carrito.leer();l[Number(inp.dataset.cant)].cantidad=Math.min(99,Math.max(1,Number(inp.value)||1));ctx.carrito.guardar(l);ctx.pintarBodega();});
  $('#bod-revision').querySelectorAll('[data-quitar-item]').forEach(b=>b.onclick=()=>{const l=ctx.carrito.leer();l.splice(Number(b.dataset.quitarItem),1);ctx.carrito.guardar(l);ctx.pintarBodega();pintar();});
 };
 pintar();$('#bod-error').textContent='';$('#bod-dialog').showModal();
}

export async function iniciarBodega(opciones){
 ctx=opciones;montarDialogos();
 $('#bod-ir').onclick=e=>{e.preventDefault();abrirEnvio();};
 $('#bod-manual').onclick=e=>{e.preventDefault();$('#bod-manual-dialog').showModal();};
 await conectar();await cargarPedidos();
 const canal=conexion?.client.channel?.('vocatus-bodega-'+conexion.userId);
 if(canal){let espera=0;canal.on('postgres_changes',{event:'*',schema:'public',table:'vocatus_parts_requests'},()=>{clearTimeout(espera);espera=setTimeout(cargarPedidos,800);}).subscribe();}
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')cargarPedidos();});
}
