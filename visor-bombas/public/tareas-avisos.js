// Tareas y avisos: el administrador asigna órdenes a cuentas activas; cualquier cuenta avisa problemas de planta;
// la campana muestra los avisos de cada persona en tiempo real. La base de datos decide los permisos.
import {surveyConnection} from './cloud-surveys.js';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const V=()=>window.vocatus;
const FALTA_SQL=/vocatus_(incidents|notifications|team)|PGRST20[25]|does not exist|schema cache/i;
const ESTADO={abierto:'Abierto',visto:'Revisado',resuelto:'Resuelto'};
const fecha=t=>{try{return new Date(t).toLocaleString('es-CR',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});}catch{return '';}};

let conexion=null,yo={id:null,nombre:'',admin:false},equipo=[],avisos=[],reportes=[],filtroReportes='abiertos',sinSql=false,incidenteParaOrden=null;

// ---------- Utilidades sin pantalla (también se prueban) ----------
export function tagsDisponibles(pumps=[],references=[]){
 const tags=new Map();
 for(const p of pumps)if(/^B\d+$/.test(p.tag||''))tags.set(p.tag,p.nombre||p.servicio||'');
 for(const r of references)if(/^B\d+$/.test(r.tagAsignado||'')&&!tags.has(r.tagAsignado))tags.set(r.tagAsignado,r.excel?.nombre||r.nombre||'');
 return [...tags].sort((a,b)=>parseInt(a[0].slice(1))-parseInt(b[0].slice(1)));
}
export function limpiarReporte(raw={}){
 const t=String(raw.tag||'').trim(),titulo=String(raw.title||'').trim().slice(0,200);
 if(titulo.length<3)throw Error('Escribí qué pasó (al menos 3 letras).');
 const tag=/^B[1-9]\d{0,3}$/.test(t)?t:null,place=tag?'':String(raw.place||'').trim().slice(0,120);
 if(!tag&&!place)throw Error('Elegí el equipo o escribí el lugar.');
 return {tag,place,title:titulo,details:String(raw.details||'').trim().slice(0,3000),severity:['alta','media','baja'].includes(raw.severity)?raw.severity:'media'};
}

// ---------- Conexión y rol (automáticos, con la sesión ya iniciada) ----------
async function conectar(){
 try{conexion=await surveyConnection();}catch{conexion=null;}
 document.body.classList.toggle('vocatus-conectado',!!conexion);
 if(!conexion)return false;
 yo.id=conexion.userId;
 try{const me=await(await fetch('/api/auth/me',{credentials:'same-origin'})).json();yo.admin=me?.user?.role==='admin';yo.nombre=me?.user?.name||me?.user?.username||'';}catch{}
 try{const r=await conexion.client.rpc('vocatus_account');if(!r.error&&r.data){yo.admin=r.data.role==='admin';yo.nombre=r.data.name||yo.nombre;}}catch{}
 document.body.classList.toggle('vocatus-admin',yo.admin);document.body.classList.toggle('vocatus-no-admin',!yo.admin);
 try{const r=await conexion.client.rpc('vocatus_team');if(r.error)throw r.error;equipo=Array.isArray(r.data)?r.data:[];}catch(e){equipo=[];if(FALTA_SQL.test(e?.message||''))sinSql=true;}
 return true;
}

// ---------- Campana de avisos ----------
function montarCampana(){
 if($('#avisos-campana'))return;
 const b=document.createElement('button');b.id='avisos-campana';b.type='button';b.className='avisos-campana';b.title='Avisos';b.setAttribute('aria-label','Avisos');
 b.innerHTML='<span aria-hidden="true">🔔</span><b id="avisos-cuenta" hidden>0</b>';
 const tema=$('#tema-toggle');(tema?.parentElement||$('header'))?.insertBefore(b,tema||null);
 document.body.insertAdjacentHTML('beforeend',`<dialog id="avisos-panel" class="mejora-dialog avisos-panel"><div class="avisos-cabeza"><h2>Avisos</h2><button type="button" id="avisos-cerrar" class="mini-boton" aria-label="Cerrar">✕</button></div>
 <div class="avisos-acciones"><button type="button" id="avisos-leidos" class="mini-boton">Marcar todo como leído</button><button type="button" id="avisos-permiso" class="mini-boton" hidden>Avisarme también con el navegador</button></div>
 <div id="avisos-lista" class="avisos-lista"></div></dialog>`);
 b.onclick=()=>{pintarAvisos();$('#avisos-panel').showModal();$('#avisos-permiso').hidden=!('Notification' in window)||Notification.permission!=='default';};
 $('#avisos-cerrar').onclick=()=>$('#avisos-panel').close();
 $('#avisos-leidos').onclick=marcarTodo;
 $('#avisos-permiso').onclick=async()=>{try{await Notification.requestPermission();}catch{}$('#avisos-permiso').hidden=Notification.permission!=='default';};
}
async function cargarAvisos(){
 if(!conexion||sinSql)return;
 const r=await conexion.client.from('vocatus_notifications').select('id,kind,title,body,ref_id,tag,created_at,read_at').order('created_at',{ascending:false}).limit(40);
 if(r.error){if(FALTA_SQL.test(r.error.message||''))sinSql=true;return;}
 avisos=r.data||[];pintarAvisos();
}
function pintarAvisos(){
 const sinLeer=avisos.filter(a=>!a.read_at).length,cuenta=$('#avisos-cuenta');
 if(cuenta){cuenta.hidden=!sinLeer;cuenta.textContent=sinLeer>9?'9+':String(sinLeer);}
 const lista=$('#avisos-lista');if(!lista)return;
 lista.innerHTML=avisos.length?avisos.map(a=>`<button type="button" class="aviso ${a.read_at?'':'sin-leer'}" data-aviso="${esc(a.id)}" data-kind="${esc(a.kind)}"><b>${esc(a.title)}</b>${a.body?`<span>${esc(a.body)}</span>`:''}<small>${esc(fecha(a.created_at))}</small></button>`).join('')
  :'<p class="tel-nota">Todavía no tenés avisos.</p>';
 lista.querySelectorAll('[data-aviso]').forEach(b=>b.onclick=async()=>{await marcar([b.dataset.aviso]);$('#avisos-panel').close();irAPendientes(b.dataset.kind.startsWith('reporte')?'#reportes-planta':'#ordenes-trabajo');});
}
async function marcar(ids){
 const faltan=ids.filter(id=>avisos.find(a=>a.id===id&&!a.read_at));if(!faltan.length||!conexion)return;
 const ahora=new Date().toISOString();await conexion.client.from('vocatus_notifications').update({read_at:ahora}).in('id',faltan);
 avisos.forEach(a=>{if(faltan.includes(a.id))a.read_at=ahora;});pintarAvisos();
}
const marcarTodo=()=>marcar(avisos.filter(a=>!a.read_at).map(a=>a.id));
function irAPendientes(destino){
 $('#tel-barra [data-s="pendientes"]')?.click();
 setTimeout(()=>$(destino)?.scrollIntoView({behavior:'smooth',block:'start'}),300);
}
function avisoDelNavegador(a){
 if(!('Notification' in window)||Notification.permission!=='granted'||document.visibilityState==='visible')return;
 try{const n=new Notification(a.title,{body:a.body||'',tag:'vocatus-'+a.id,icon:'/marca/vocatus.png'});n.onclick=()=>{focus();n.close();};}catch{}
}

// ---------- Reportes de planta ----------
function montarReportes(){
 const ordenes=$('#ordenes-trabajo');if(!ordenes||$('#reportes-planta'))return!!$('#reportes-planta');
 const s=document.createElement('section');s.id='reportes-planta';s.className='reportes-planta';
 s.innerHTML=`<div class="orden-heading"><div><span class="orden-kicker">AVISOS DE PLANTA</span><h2>Reportes de problemas</h2></div><button type="button" class="orden-primary" id="reporte-nuevo">⚠ Avisar un problema</button></div>
 <p id="reportes-nota" class="tel-nota" role="status"></p>
 <div class="orden-filtros" id="reportes-filtros"><button type="button" data-rf="abiertos">Sin resolver</button><button type="button" data-rf="todos">Todos</button></div>
 <div id="reportes-lista"></div>`;
 ordenes.before(s);
 document.body.insertAdjacentHTML('beforeend',`<dialog id="reporte-dialog" class="mejora-dialog"><form id="reporte-form"><p class="orden-kicker">AVISO A LOS ADMINISTRADORES</p><h2>Avisar un problema</h2>
 <label>Equipo<select name="tag"><option value="">Otro lugar (no es una bomba)</option></select></label>
 <label id="reporte-lugar">Lugar<input name="place" maxlength="120" placeholder="Ej. cuarto de calderas"></label>
 <label>¿Qué pasó?<input name="title" required maxlength="200" placeholder="Ej. la bomba hace ruido y gotea"></label>
 <label>Detalles (opcional)<textarea name="details" maxlength="3000" rows="4" placeholder="Desde cuándo, qué se ve o se escucha…"></textarea></label>
 <label>Gravedad<select name="severity"><option value="alta">Alta: hay que pararla o es peligroso</option><option value="media" selected>Media: hay que revisarla pronto</option><option value="baja">Baja: se puede programar</option></select></label>
 <p id="reporte-error" class="tel-nota orden-error" role="alert"></p>
 <div class="orden-form-acciones"><button type="button" id="reporte-cancelar">Cancelar</button><button type="submit" class="orden-primary">Enviar aviso</button></div></form></dialog>`);
 const form=$('#reporte-form');
 form.elements.tag.onchange=()=>{$('#reporte-lugar').hidden=!!form.elements.tag.value;};
 $('#reporte-nuevo').onclick=()=>{
  form.reset();$('#reporte-error').textContent='';
  form.elements.tag.innerHTML='<option value="">Otro lugar (no es una bomba)</option>'+tagsDisponibles(V()?.pumps||[],V()?.references||[]).map(([t,n])=>`<option value="${esc(t)}">${esc(t)}${n?' · '+esc(n):''}</option>`).join('');
  const actual=V()?.pump?.tag||V()?.pump?.pending?.tagAsignado;if(actual&&[...form.elements.tag.options].some(o=>o.value===actual))form.elements.tag.value=actual;
  $('#reporte-lugar').hidden=!!form.elements.tag.value;$('#reporte-dialog').showModal();
 };
 $('#reporte-cancelar').onclick=()=>$('#reporte-dialog').close();
 form.onsubmit=async e=>{
  e.preventDefault();const boton=form.querySelector('[type=submit]');boton.disabled=true;$('#reporte-error').textContent='';
  try{
   if(!conexion)throw Error('Entrá con tu cuenta para enviar avisos.');
   const fila=limpiarReporte(Object.fromEntries(new FormData(form)));
   const r=await conexion.client.from('vocatus_incidents').insert(fila);
   if(r.error)throw r.error;
   $('#reporte-dialog').close();aviso('Aviso enviado a los administradores.');await cargarReportes();
  }catch(err){$('#reporte-error').textContent=FALTA_SQL.test(err?.message||'')?'Falta preparar la base: hay que correr el SQL de tareas y avisos.':/row-level|42501|permission/i.test(err?.message||'')?'Tu cuenta solo permite consultar.':err.message||'No se pudo enviar.';}
  finally{boton.disabled=false;}
 };
 $('#reportes-filtros').querySelectorAll('[data-rf]').forEach(b=>b.onclick=()=>{filtroReportes=b.dataset.rf;pintarReportes();});
 return true;
}
async function cargarReportes(){
 if(!conexion){pintarReportes();return;}
 const r=await conexion.client.from('vocatus_incidents').select('*').order('created_at',{ascending:false}).limit(200);
 if(r.error){if(FALTA_SQL.test(r.error.message||''))sinSql=true;pintarReportes();return;}
 reportes=r.data||[];pintarReportes();
}
function pintarReportes(){
 const lista=$('#reportes-lista'),nota=$('#reportes-nota');if(!lista)return;
 $('#reportes-filtros').querySelectorAll('[data-rf]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.rf===filtroReportes)));
 $('#reporte-nuevo').disabled=!conexion||sinSql;
 if(!conexion){nota.textContent='Entrá con tu cuenta para avisar problemas.';lista.innerHTML='';return;}
 if(sinSql){nota.textContent=yo.admin?'Falta preparar la base: corré en Supabase el SQL «tareas y avisos».':'Los avisos todavía no están activos. Pedile al administrador que los active.';lista.innerHTML='';return;}
 nota.textContent=yo.admin?'Ves los avisos de todo el equipo. Al revisarlos, la persona que avisó recibe una notificación.':'Ves los avisos que enviaste y si ya los revisaron.';
 const visibles=reportes.filter(r=>filtroReportes==='todos'||r.status!=='resuelto');
 lista.innerHTML=visibles.length?visibles.map(r=>`<article class="orden-card reporte-card" data-reporte="${esc(r.id)}"><div class="orden-meta"><span>${esc(r.tag||r.place||'Sin lugar')} · ${esc(fecha(r.created_at))}</span><span class="orden-prioridad ${esc(r.severity)}">${esc(r.severity)}</span></div>
  <h3>${esc(r.title)}</h3>${r.details?`<p>${esc(r.details)}</p>`:''}<dl><div><dt>Avisó</dt><dd>${esc(r.created_by_name||'—')}</dd></div><div><dt>Estado</dt><dd>${esc(ESTADO[r.status]||r.status)}</dd></div></dl>
  ${yo.admin&&r.status!=='resuelto'?`<div class="orden-acciones">${r.status==='abierto'?'<button type="button" data-ra="visto">Marcar revisado</button>':''}${r.tag?'<button type="button" data-ra="orden">Crear orden</button>':''}<button type="button" data-ra="resuelto">Resuelto</button></div>`:''}</article>`).join('')
  :`<p class="tel-nota">${filtroReportes==='todos'?'Todavía no hay avisos.':'No hay problemas sin resolver.'}</p>`;
 lista.querySelectorAll('[data-ra]').forEach(b=>b.onclick=async()=>{
  const r=reportes.find(x=>x.id===b.closest('[data-reporte]').dataset.reporte);if(!r)return;b.disabled=true;
  try{if(b.dataset.ra==='orden')crearOrdenDesde(r);else await cambiarReporte(r,b.dataset.ra);}finally{b.disabled=false;}
 });
}
async function cambiarReporte(r,estado,extra={}){
 const res=await conexion.client.from('vocatus_incidents').update({status:estado,...extra}).eq('id',r.id).select('id');
 if(res.error||!res.data?.length){aviso('No se pudo actualizar el aviso.');return;}
 await cargarReportes();
}
// «Crear orden» abre el formulario normal con los datos del aviso; al guardarse, el aviso queda revisado.
function crearOrdenDesde(r){
 const nueva=$('#orden-nueva');if(!nueva||nueva.disabled){aviso('Solo un administrador puede crear órdenes.');return;}
 nueva.click();const form=$('#orden-form');if(!form)return;
 if([...form.elements.tag.options].some(o=>o.value===r.tag))form.elements.tag.value=r.tag;
 form.elements.title.value=r.title.slice(0,200);form.elements.details.value=`Aviso de ${r.created_by_name||'planta'}: ${r.details||r.title}`.slice(0,3000);
 form.elements.priority.value=r.severity;form.elements.type.value='correctivo';incidenteParaOrden=r;
}

// ---------- Responsable elegido de la lista de cuentas activas ----------
function mejorarFormularioOrden(){
 const form=$('#orden-form');if(!form||form.dataset.equipo)return;form.dataset.equipo='1';
 const texto=form.elements.assignee,etiqueta=texto.closest('label');
 const elegir=document.createElement('select');elegir.name='assigneeId';elegir.id='orden-responsable';
 const ayuda=document.createElement('small');ayuda.className='tel-nota';
 etiqueta.append(elegir,ayuda);
 const pintar=()=>{
  if(!equipo.length){elegir.hidden=true;elegir.required=false;texto.hidden=false;texto.required=true;ayuda.textContent='';return;}
  elegir.innerHTML='<option value="">Elegí quién la hace…</option>'+equipo.map(p=>`<option value="${esc(p.id)}">${esc(p.name)}${p.role==='admin'?' (administrador)':''} · ${esc(p.username)}</option>`).join('');
  elegir.hidden=false;texto.hidden=true;texto.required=false;elegir.required=true;
  const igual=equipo.find(p=>p.name===texto.value);elegir.value=igual?.id||'';
  ayuda.textContent='Le llega un aviso a esa persona al guardar.';
 };
 elegir.onchange=()=>{const p=equipo.find(x=>x.id===elegir.value);texto.value=p?p.name:'';};
 // Cada vez que se abre el diálogo, se sincroniza con el responsable actual.
 new MutationObserver(()=>{if($('#orden-dialog').open)setTimeout(pintar,0);}).observe($('#orden-dialog'),{attributes:true,attributeFilter:['open']});
 let enviado=false;form.addEventListener('submit',()=>{enviado=true;},true);
 $('#orden-dialog').addEventListener('close',()=>{
  const r=incidenteParaOrden;incidenteParaOrden=null;
  if(r&&enviado&&!$('#orden-error')?.textContent)cambiarReporte(r,'visto');enviado=false;
 });
}
// Marca en la lista las órdenes asignadas a la persona que usa el visor.
function marcarMias(){
 if(!yo.nombre)return;
 document.querySelectorAll('#ordenes-lista .orden-card').forEach(card=>{
  const dd=[...card.querySelectorAll('dt')].find(dt=>dt.textContent==='Responsable')?.nextElementSibling;
  const mia=dd&&dd.textContent.trim()===yo.nombre;card.classList.toggle('orden-mia',!!mia);
  if(mia&&!card.querySelector('.orden-mia-sello')){const s=document.createElement('span');s.className='orden-mia-sello';s.textContent='Asignada a vos';card.querySelector('.orden-meta')?.append(s);}
 });
}

// ---------- Avisos breves en pantalla ----------
function aviso(t){const el=$('#mejora-aviso');if(el){el.textContent=t;el.hidden=false;clearTimeout(aviso.t);aviso.t=setTimeout(()=>el.hidden=true,6500);}}

// ---------- Inicio ----------
let iniciado=false;
async function iniciar(){
 if(iniciado)return;iniciado=true;
 montarCampana();
 const conectado=await conectar();
 // La sección de órdenes la arma otro módulo cuando cargan las bombas: se espera a que aparezca una sola vez.
 const enganchar=()=>{
  if(!$('#reportes-planta')&&$('#ordenes-trabajo')){montarReportes();mejorarFormularioOrden();pintarReportes();if(conexion)cargarReportes();}
  const lista=$('#ordenes-lista');if(lista&&!lista.dataset.mias){lista.dataset.mias='1';new MutationObserver(marcarMias).observe(lista,{childList:true});marcarMias();}
  return !!$('#reportes-planta')&&!!$('#ordenes-lista')?.dataset.mias;
 };
 if(!enganchar()){const esperar=new MutationObserver(()=>{if(enganchar())esperar.disconnect();});esperar.observe(document.body,{childList:true,subtree:true});}
 if(!conectado){$('#avisos-campana').hidden=true;pintarReportes();return;}
 await Promise.all([cargarAvisos(),cargarReportes()]);
 if(sinSql)$('#avisos-campana').hidden=!yo.admin;
 const canal=conexion.client.channel?.('vocatus-avisos-'+yo.id);
 if(canal){
  canal.on('postgres_changes',{event:'INSERT',schema:'public',table:'vocatus_notifications',filter:`user_id=eq.${yo.id}`},p=>{avisos.unshift(p.new);avisos=avisos.slice(0,40);pintarAvisos();avisoDelNavegador(p.new);aviso(p.new.title);})
   .on('postgres_changes',{event:'*',schema:'public',table:'vocatus_incidents'},()=>cargarReportes())
   .on('postgres_changes',{event:'*',schema:'public',table:'vocatus_work_orders'},()=>{if(!$('#orden-dialog')?.open)$('#ordenes-actualizar')?.click();})
   .subscribe();
 }
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){cargarAvisos();cargarReportes();}});
}
if(typeof document!=='undefined'){
 const go=()=>iniciar().catch(()=>{});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
}
