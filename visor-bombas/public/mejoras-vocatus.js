import {cloudWorkflow} from './cloud-workflow.js';
import {connectCloudPhotos} from './cloud-photos.js';
import {expediente,enlaces,linksBomba} from './expediente.js';
import {listReports,sharePreviousReports} from './reportes.js';
const $=s=>document.querySelector(s),V=()=>window.vocatus,A=()=>window.vocatusApp;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const label={pendiente:'Programada','en-curso':'En curso',completada:'Completada'},eventName={creada:'Orden programada',editada:'Programación actualizada',iniciada:'Trabajo iniciado',completada:'Informe de cierre registrado'};
let orders=[],writable=false,cloudMode=false,cloudConnected=false,filter='abiertas',query='',loadTicket=0,timelineTicket=0,bodegaOrder='',initialized=false,refreshTimer;
const notify=message=>{const el=$('#mejora-aviso');el.textContent=message;el.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.hidden=true,6500);};
async function migratePrevious(){try{const result=await sharePreviousReports();if(result.shared||result.failed)$('#ordenes-migracion').textContent=result.shared+' informes anteriores compartidos. Las copias locales se conservan.'+(result.failed?' '+result.failed+' requieren revisión; siguen guardados en este navegador.':'');}catch{$('#ordenes-migracion').textContent='Los informes anteriores siguen en este navegador. Podés reintentar compartirlos desde Historial.';}}
async function load(){const ticket=++loadTicket;try{const result=V().writable?await V().api('/api/work-orders'):await cloudWorkflow().orders();cloudMode=!!result.cloud;cloudConnected=!!result.connected;if(ticket!==loadTicket)return;orders=result.orders;writable=result.writable;paintOrders();if(cloudMode&&cloudConnected)migratePrevious();paintOrderOptions();enhancePanel();const timeline=$('#equipo-linea-tiempo');if(timeline&&V()?.pump?.tag)paintTimeline(V().pump.tag,timeline);}catch(error){if(ticket===loadTicket){$('#ordenes-lista').textContent=error.message;$('#ordenes-storage').textContent='No se pudo consultar la programación. Reintentá con Actualizar.';}}}
async function saveOrder(data){return V().writable?V().api('/api/work-orders',data):cloudWorkflow().saveOrder(data);}
function optionList(tag,includeClosed=false){return orders.filter(o=>(!tag||o.tag===tag)&&(includeClosed||o.status!=='completada'));}
function paintOrderOptions(){
 const select=$('#bod-orden');if(select){const previous=select.value||bodegaOrder,tag=$('#bod-bomba')?.value;select.innerHTML='<option value="">Sin orden vinculada</option>'+optionList(tag).map(o=>`<option value="${esc(o.id)}">${esc(o.code)} · ${esc(o.title)}</option>`).join('');select.value=optionList(tag).some(o=>o.id===previous)?previous:'';bodegaOrder=select.value;updateBodegaLinks();}
 const selectPump=$('#ordenes-equipo');if(selectPump){const current=selectPump.value;selectPump.innerHTML='<option value="">Todas las bombas</option>'+(V()?.pumps||[]).map(p=>`<option value="${esc(p.tag)}">${esc(p.tag)} · ${esc(p.nombre||p.servicio)}</option>`).join('');selectPump.value=current;}
}
function paintOrders(){
 const mount=$('#ordenes-lista');if(!mount)return;
 const tag=$('#ordenes-equipo').value,now=today(),open=orders.filter(o=>o.status!=='completada'),late=open.filter(o=>o.due<now);
 $('#ordenes-resumen').innerHTML=`<span><strong>${open.length}</strong> abiertas</span><span><strong>${late.length}</strong> vencidas</span><span><strong>${orders.filter(o=>o.status==='completada').length}</strong> completadas</span>`;
 $('#ordenes-storage').textContent=writable?(cloudMode?'Programación compartida con tu cuenta de Vocatus.':'Programación guardada en esta copia local de Vocatus.'):(cloudMode&&!cloudConnected?'Conectá tu cuenta autorizada para consultar y programar trabajos.':'Tu cuenta permite consultar la programación.');
 $('#orden-nueva').disabled=!writable;$('#ordenes-conectar').hidden=!cloudMode;$('#ordenes-filtros').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.orderFilter===filter)));
 const visible=orders.filter(o=>(!tag||o.tag===tag)&&(!query||`${o.code} ${o.tag} ${o.title} ${o.assignee}`.toLowerCase().includes(query.toLowerCase()))&&(filter==='todas'||filter==='abiertas'&&o.status!=='completada'||filter==='vencidas'&&o.status!=='completada'&&o.due<now||filter==='completadas'&&o.status==='completada')).sort((a,b)=>a.due.localeCompare(b.due));
 mount.innerHTML=visible.length?visible.map(o=>`<article class="orden-card" data-order="${esc(o.id)}"><div class="orden-meta"><span>${esc(o.code)} · ${esc(o.tag)}</span><span class="orden-prioridad ${esc(o.priority)}">${esc(o.priority)}</span></div><h3>${esc(o.title)}</h3><p>${esc(o.details||'Sin instrucciones adicionales.')}</p>${o.component?`<p class="orden-componente">Componente: ${esc(o.component)}</p>`:''}<dl><div><dt>Responsable</dt><dd>${esc(o.assignee)}</dd></div><div><dt>Fecha programada</dt><dd class="${o.due<now&&o.status!=='completada'?'orden-vencida':''}">${esc(o.due)}${o.due<now&&o.status!=='completada'?' · Vencida':''}</dd></div></dl><span class="orden-estado">${label[o.status]}</span><div class="orden-acciones"><button type="button" data-order-action="locate">Ubicar equipo</button>${o.status!=='completada'?`<button type="button" data-order-action="edit" ${writable?'':'disabled'}>Editar orden</button><button type="button" data-order-action="parts">Pedir repuestos</button>${o.status==='pendiente'?`<button type="button" data-order-action="start" ${writable?'':'disabled'}>Iniciar trabajo</button>`:''}<button type="button" class="orden-primary" data-order-action="report" ${writable?'':'disabled'}>Registrar trabajo y cerrar</button>`:'<button type="button" data-order-action="history">Ver informe e historial</button>'}</div></article>`).join(''):'<div class="orden-empty"><strong>No hay órdenes en esta vista.</strong><p>Los trabajos programados aparecerán aquí, separados del estado operativo de las bombas.</p></div>';
 mount.querySelectorAll('[data-order-action]').forEach(button=>button.onclick=async()=>{
  const order=orders.find(o=>o.id===button.closest('[data-order]').dataset.order);if(!order)return;
  try{
   switch(button.dataset.orderAction){
    case 'edit':openOrder(order);break;
    case 'locate':A().show('areas');A().openEquipment(order.tag);V().locate();break;
    case 'history':A().show('historial');A().openEquipment(order.tag,'historial');break;
    case 'parts':bodegaOrder=order.id;A().bodegaOrder(order);paintOrderOptions();break;
    case 'report':await A().reportOrder(order);paintReportLink();notify('Completá lo realizado, el estado del equipo y la evidencia. La orden se cerrará al guardar el informe.');break;
    case 'start':button.disabled=true;await saveOrder({id:order.id,tag:order.tag,version:order.version,status:'en-curso'});await load();break;
   }
  }catch(error){notify(error.message);button.disabled=false;}
 });
}
function openOrder(existing=null){
 const form=$('#orden-form');form.reset();form.elements.id.value=existing?.id||'';form.elements.version.value=existing?.version||'';
 const pumps=V().pumps.filter(p=>!p.inactive&&p.enUso!==false);form.elements.tag.innerHTML='<option value="">Elegí el equipo…</option>'+pumps.map(p=>`<option value="${esc(p.tag)}">${esc(p.tag)} · ${esc(p.nombre||p.servicio)}</option>`).join('');
 form.elements.tag.value=existing?.tag||V()?.pump?.tag||$('#ordenes-equipo').value||'';form.elements.tag.disabled=!!existing;
 form.elements.due.value=today();if(existing)for(const key of ['title','assignee','due','priority','type','details','component'])form.elements[key].value=existing[key]||'';
 $('#orden-form-title').textContent=existing?'Editar programación':'Programar trabajo';$('#orden-error').textContent='';$('#orden-dialog').showModal();
}
function updateBodegaLinks(){
 const order=orders.find(o=>o.id===bodegaOrder&&o.tag===$('#bod-bomba')?.value);
 for(const id of ['bod-ir','bod-manual']){const link=$('#'+id);if(!link)continue;const url=new URL(link.href,location.origin);if(order){url.searchParams.set('orden',order.code);url.searchParams.set('motivo',order.title.slice(0,300));url.searchParams.set('tag',order.tag);}else{url.searchParams.delete('orden');url.searchParams.delete('motivo');}link.href=url.pathname+url.search;}
 $('#bod-orden-ayuda').textContent=order?'La solicitud PDF incluirá '+order.code+'. Elegí los repuestos documentados o agregalos manualmente.':'Podés preparar una solicitud con o sin orden de trabajo.';
}
function paintReportLink(){
 const form=$('#tel-mant'),id=form?.dataset.workOrderId,tag=$('#mant-bomba')?.value,order=orders.find(o=>o.id===id&&o.tag===tag);let note=$('#informe-orden');
 if(!note){note=document.createElement('div');note.id='informe-orden';note.className='mejora-contexto';$('#mant-draft-status').after(note);}
 note.hidden=!order;if(order)note.innerHTML=`<strong>${esc(order.code)} · ${esc(order.title)}</strong><p>Al guardar este informe se cerrará esta orden de ${esc(tag)}. El estado operativo será el que indiques en el formulario.</p><button type="button" id="orden-desvincular">Continuar sin cerrar la orden</button>`;
 $('#orden-desvincular')?.addEventListener('click',()=>{form.dataset.workOrderId='';form.dispatchEvent(new Event('input',{bubbles:true}));paintReportLink();});
}
function enhancePanel(){
 const p=V()?.pump;if(!p?.tag||p.pending)return;
 const secondary=$('#pump-links .secondary-actions');if(secondary&&!$('#equipo-documentos')){const b=document.createElement('button');b.type='button';b.id='equipo-documentos';b.textContent='Documentos y planos';b.onclick=()=>showDocuments();secondary.append(b);const create=document.createElement('button');create.type='button';create.id='equipo-programar';create.textContent='Programar trabajo';create.disabled=!writable;create.onclick=()=>openOrder();secondary.append(create);}
 const history=$('#history-equipment');if(history&&!$('#equipo-linea-tiempo')){
  const section=document.createElement('section');section.id='equipo-linea-tiempo';section.className='mejora-timeline';section.innerHTML='<h3>Actividad del equipo</h3><button type="button" class="wide" data-ver-registros>Ver informes y sus fotos ↓</button><div data-timeline role="status">Leyendo actividad…</div>';history.after(section);section.querySelector('[data-ver-registros]').onclick=()=>$('#rep-list')?.scrollIntoView({block:'start',behavior:'auto'});paintTimeline(p.tag,section);
 }
}
async function paintTimeline(tag,section){const ticket=++timelineTicket;try{
 const reports=await listReports(tag);if(ticket!==timelineTicket||!section.isConnected||V()?.pump?.tag!==tag)return;
 const activity=[...orders.filter(o=>o.tag===tag).flatMap(o=>o.events.map(e=>({date:e.at,title:eventName[e.type]+' · '+o.code,text:o.title+' · '+e.by,kind:'orden',order:o}))),...reports.map(r=>({date:r.date+'T12:00:00',title:r.title,text:r.author||'Responsable no registrado',kind:'informe',record:r}))].sort((a,b)=>b.date.localeCompare(a.date));
 section.querySelector('[data-timeline]').innerHTML=activity.length?'<ol>'+activity.map(item=>`<li><time>${esc(item.date.slice(0,10))}</time><strong>${esc(item.title)}</strong><p>${esc(item.text)}</p>${item.record?.evidence?.length?`<small>${item.record.evidence.length} foto(s) de evidencia · disponibles en Registros</small>`:''}</li>`).join('')+'</ol>':'<p class="tel-nota">Todavía no hay órdenes ni informes registrados para este equipo.</p>';
 }catch(error){if(section.isConnected)section.querySelector('[data-timeline]').textContent=error.message;}}
function showDocuments(){
 const p=V()?.pump?.data,tag=V()?.pump?.tag;if(!p||!tag)return;const exp=expediente[tag]||{},direct=linksBomba(p);
 const list=[...(direct?[direct.manual,direct.planos]:[]),...(exp.fab||[]).flatMap(key=>key==='weg'&&p.motor?.catalogo!=='00218XT3E145T'?[enlaces.weg[0]]:enlaces[key]||[]),...(exp.rod||[]).map(k=>enlaces.skf[k]).filter(Boolean)].filter(Boolean);
 const docs=list.filter((l,i)=>list.findIndex(other=>other.u===l.u)===i);
 $('#documentos-title').textContent='Documentos · '+tag;
 $('#documentos-lista').innerHTML=docs.map(l=>`<a class="mejora-doc" href="${esc(l.u)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span><span><strong>${esc(l.t)}</strong><small>${esc(l.nota||l.k||'Referencia del fabricante')}</small></span></a>`).join('')||'<p>Este equipo todavía no tiene documentación del fabricante asociada.</p>';
 $('#documentos-lista').insertAdjacentHTML('beforeend','<p class="tel-nota">Los manuales de familia requieren comprobar la variante instalada. Las fotos y los enlaces originales continúan en la ficha.</p>');$('#documentos-dialog').showModal();
}
function createResizer(){
 const separator=document.createElement('div');separator.id='panel-ajuste';separator.tabIndex=0;separator.setAttribute('role','separator');separator.setAttribute('aria-label','Ajustar ancho de la ficha');separator.setAttribute('aria-orientation','vertical');separator.title='Arrastrá para ampliar la ficha · flechas para ajustar';document.body.append(separator);
 let requested=null;try{requested=Number(localStorage.getItem('vocatus-ancho-panel'))||null;}catch{}
 function setWidth(width){const min=Math.min(330,innerWidth-440),max=Math.max(min,innerWidth-440);const w=Math.max(min,Math.min(max,width));document.body.style.setProperty('--panel',w+'px');separator.setAttribute('aria-valuemin',String(min));separator.setAttribute('aria-valuemax',String(max));separator.setAttribute('aria-valuenow',String(Math.round(w)));return w;}
 function adapt(){if(innerWidth<=900){document.body.style.removeProperty('--panel');return;}if(requested)setWidth(requested);else{separator.setAttribute('aria-valuenow',String(Math.round($('#tel-contenido').getBoundingClientRect().width)));separator.setAttribute('aria-valuemin','330');separator.setAttribute('aria-valuemax',String(Math.max(330,innerWidth-440)));}}
 separator.onpointerdown=e=>{separator.setPointerCapture(e.pointerId);document.body.classList.add('ajustando-panel');};
 separator.onpointermove=e=>{if(separator.hasPointerCapture(e.pointerId)){requested=setWidth(innerWidth-e.clientX);window.dispatchEvent(new Event('resize'));}};
 const finish=()=>{document.body.classList.remove('ajustando-panel');if(requested)try{localStorage.setItem('vocatus-ancho-panel',String(requested));}catch{}};separator.onpointerup=finish;separator.onlostpointercapture=finish;
 separator.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();requested=setWidth(e.key==='Home'?420:$('#tel-contenido').getBoundingClientRect().width+(e.key==='ArrowLeft'?24:-24));finish();window.dispatchEvent(new Event('resize'));}};
 window.addEventListener('resize',adapt);adapt();
}
function init(){
 if(initialized||!V()?.pumps?.length||!A())return;initialized=true;
 const pending=$('.tel-panel[data-s=pendientes]'),section=document.createElement('section');section.id='ordenes-trabajo';section.innerHTML=`<div class="orden-heading"><div><span class="orden-kicker">PLANIFICACIÓN</span><h2>Trabajos programados</h2></div><button type="button" class="orden-primary" id="orden-nueva" disabled>＋ Nueva orden</button></div><p id="ordenes-storage" class="tel-nota" role="status">Consultando programación…</p><p id="ordenes-migracion" class="tel-nota" role="status"></p><button type="button" id="ordenes-conectar" hidden>Conectar o cambiar mi cuenta</button><div id="ordenes-resumen" class="orden-resumen"></div><div class="orden-busqueda"><label>Equipo<select id="ordenes-equipo"><option value="">Todas las bombas</option></select></label><label>Buscar<input id="ordenes-buscar" type="search" placeholder="Trabajo o responsable"></label></div><div id="ordenes-filtros" class="orden-filtros" aria-label="Filtrar trabajos">${[['abiertas','Abiertas'],['vencidas','Vencidas'],['completadas','Completadas'],['todas','Todas']].map(([key,text])=>`<button type="button" data-order-filter="${key}" aria-pressed="${key===filter}">${text}</button>`).join('')}<button type="button" id="ordenes-actualizar">↻ Actualizar</button></div><div id="ordenes-lista" aria-live="polite"></div>`;
 pending.querySelector('.tel-section-head').after(section);
 document.body.insertAdjacentHTML('beforeend',`<dialog id="orden-dialog" class="mejora-dialog"><form id="orden-form"><p class="orden-kicker">MANTENIMIENTO · EQUIPO VINCULADO</p><h2 id="orden-form-title">Programar trabajo</h2><input name="id" type="hidden"><input name="version" type="hidden"><label>Equipo<select name="tag" required></select></label><label>Trabajo a realizar<input name="title" required maxlength="200" placeholder="Ej. inspeccionar el sello"></label><div class="orden-form-grid"><label>Tipo<select name="type"><option value="inspeccion">Inspección</option><option value="preventivo">Preventivo</option><option value="correctivo">Correctivo</option></select></label><label>Prioridad<select name="priority"><option value="media">Media</option><option value="alta">Alta</option><option value="baja">Baja</option></select></label></div><label>Componente (opcional)<input name="component" maxlength="100" placeholder="Ej. sello mecánico"></label><label>Responsable<input name="assignee" required maxlength="100"></label><label>Fecha programada<input name="due" type="date" required></label><label>Alcance e instrucciones<textarea name="details" maxlength="3000" rows="3"></textarea></label><p id="orden-error" class="error" role="alert"></p><div class="orden-form-actions"><button type="button" id="orden-cancelar">Cancelar</button><button class="orden-primary">Guardar orden</button></div></form></dialog><dialog id="documentos-dialog" class="mejora-dialog"><div class="orden-heading"><h2 id="documentos-title">Documentos</h2><button type="button" id="documentos-cerrar">Cerrar</button></div><div id="documentos-lista"></div></dialog><div id="mejora-aviso" role="status" hidden></div>`);
 $('#orden-nueva').onclick=()=>openOrder();$('#ordenes-conectar').onclick=connectCloudPhotos;document.addEventListener('vocatus:cloud-auth',()=>{if(!V().writable)load();});$('#orden-cancelar').onclick=()=>$('#orden-dialog').close();$('#documentos-cerrar').onclick=()=>$('#documentos-dialog').close();$('#ordenes-actualizar').onclick=load;
 $('#ordenes-equipo').onchange=paintOrders;$('#ordenes-buscar').oninput=e=>{query=e.target.value;paintOrders();};$('#ordenes-filtros').querySelectorAll('[data-order-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.orderFilter;paintOrders();});
 $('#orden-form').onsubmit=async e=>{e.preventDefault();const form=e.target,button=form.querySelector('.orden-primary');button.disabled=true;try{const data=Object.fromEntries(new FormData(form));data.tag=form.elements.tag.value;if(!data.id){delete data.id;delete data.version;}else data.version=Number(data.version);await saveOrder(data);$('#orden-dialog').close();filter='abiertas';await load();notify('Orden guardada.');}catch(error){$('#orden-error').textContent=error.message;}finally{button.disabled=false;}};
 const box=document.createElement('div');box.className='mejora-bodega';box.innerHTML='<label for="bod-orden">Orden de trabajo (opcional)</label><select id="bod-orden"><option value="">Sin orden vinculada</option></select><p id="bod-orden-ayuda" class="tel-nota"></p>';$('#bod-bomba').closest('.tel-campo').after(box);$('#bod-orden').onchange=e=>{bodegaOrder=e.target.value;updateBodegaLinks();};$('#bod-bomba').addEventListener('change',()=>{bodegaOrder='';paintOrderOptions();});
 document.addEventListener('vocatus:informe-guardado',()=>{setTimeout(()=>{paintReportLink();load();},0);});
 const reportObserver=new MutationObserver(paintReportLink);reportObserver.observe($('#tel-mant'),{attributes:true,attributeFilter:['data-work-order-id']});
 const panelObserver=new MutationObserver(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(enhancePanel,80);});panelObserver.observe($('#panel'),{childList:true});panelObserver.observe($('#pump-links')||$('.inspector-heading'),{childList:true,subtree:true});
 const bodegaObserver=new MutationObserver(updateBodegaLinks);bodegaObserver.observe($('#bod-lista'),{childList:true});
 document.addEventListener('vocatus:listo',()=>{paintOrderOptions();load();});document.addEventListener('vocatus:bomba',()=>setTimeout(enhancePanel,100));
 const modelAccess=document.createElement('nav');modelAccess.className='mejora-model-access';modelAccess.setAttribute('aria-label','Modelo 3D de la bomba');
 modelAccess.innerHTML='<button type="button" data-model-mode="assembled" aria-pressed="false" disabled>◈ Ver bomba en 3D</button><button type="button" data-model-mode="exploded" aria-pressed="false" disabled>↔ Vista explosionada</button><p data-model-status role="status" hidden></p>';
 $('.tel-ficha .tel-volver').after(modelAccess);
 let modelTicket=0,modelTag='';
 async function openPumpModel(exploded){
  const tag=V()?.pump?.tag,pump=V()?.pump?.data;if(!tag||V().pump.pending)return;
  if(exploded&&(pump.inactive||pump.enUso===false)){notify('Este equipo está sin uso; su despiece no está identificado.');return;}
  const ticket=++modelTicket;modelTag=tag;document.body.classList.add('hist-model-open','mejora-model-open');
  const status=modelAccess.querySelector('[data-model-status]');status.hidden=false;status.textContent='Preparando el modelo de '+tag+'…';
  window.dispatchEvent(new Event('resize'));V()?.ensure3D?.();
  for(let n=0;n<300;n++){
   if(ticket!==modelTicket||V()?.pump?.tag!==tag||!document.body.classList.contains('tel-con-ficha'))return;
   if(V().listo){
    await new Promise(resolve=>setTimeout(resolve,350));
    if(ticket!==modelTicket||V()?.pump?.tag!==tag||!document.body.classList.contains('tel-con-ficha'))return;
    V().explode(exploded?100:0);V().vista('tres');
    modelAccess.querySelectorAll('[data-model-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.modelMode===(exploded?'exploded':'assembled'))));
    const pieces=$('#tel-vistas [data-piezas] span');if(pieces)pieces.textContent=exploded?'Juntar piezas':'Separar piezas';
    status.textContent=exploded?'Piezas separadas · tocá una pieza para consultarla.':'Bomba completa · arrastrá para girar y acercá con dos dedos.';
    const original=$('#history-model');if(original)original.textContent='Volver a la ficha';window.dispatchEvent(new Event('resize'));return;
   }
   await new Promise(resolve=>setTimeout(resolve,150));
  }
  status.textContent='El modelo sigue cargando. Podés volver a pulsar cuando termine.';
 }
 modelAccess.querySelectorAll('[data-model-mode]').forEach(button=>button.onclick=()=>openPumpModel(button.dataset.modelMode==='exploded'));
 const enableModelAccess=()=>{const p=V()?.pump;modelAccess.querySelectorAll('[data-model-mode]').forEach(button=>button.disabled=!p?.tag||!!p.pending||(button.dataset.modelMode==='exploded'&&(p.data?.inactive||p.data?.enUso===false)));};document.addEventListener('vocatus:bomba',enableModelAccess);document.addEventListener('vocatus:referencia',enableModelAccess);enableModelAccess();
 document.addEventListener('vocatus:bomba',event=>{if(event.detail!==modelTag){++modelTicket;document.body.classList.remove('mejora-model-open');modelAccess.querySelector('[data-model-status]').hidden=true;modelAccess.querySelectorAll('[data-model-mode]').forEach(button=>button.setAttribute('aria-pressed','false'));}});
 document.addEventListener('click',event=>{if(event.target.closest('#history-model'))setTimeout(()=>{if(!document.body.classList.contains('hist-model-open')){++modelTicket;document.body.classList.remove('mejora-model-open');modelAccess.querySelector('[data-model-status]').hidden=true;modelAccess.querySelectorAll('[data-model-mode]').forEach(button=>button.setAttribute('aria-pressed','false'));window.dispatchEvent(new Event('resize'));}},0);});
 createResizer();load();paintReportLink();
}
for(const event of ['vocatus:listo','vocatus:app-lista'])document.addEventListener(event,init);init();
