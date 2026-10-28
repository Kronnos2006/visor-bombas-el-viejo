// App de cinco secciones — Áreas, Pendientes, Historial, Bodega y Reportar (mantenimiento) — según
// los bocetos del 27-10-2026 y la propuesta «App Vocatus · teléfono». Teléfono: 3D arriba, sección abajo. Computadora: secciones a la izquierda, 3D al
// centro y la sección a la derecha. Reutiliza el visor (window.vocatus): no duplica la lógica de
// selección, 3D, ficha ni guardado. Con ?vista=clasica se usa el visor anterior.
import {completeness, verificationOf} from './interfaz-core.js';
import {partsOf,createRequestGate} from './request-core.js';
import {createDraftStore,normalizeFieldReport,fieldReportPackage,parseFieldReportPackage,importFieldReports} from './field-report-core.js';
import {addReport,listReports} from './reportes.js';
import {filtrarHistorial} from './historial-core.js';
import {crearFlujoCabecera} from './cabecera-flujo.js';
const movil = matchMedia('(max-width:900px)');
const SECCIONES = [
 {id: 'areas', nombre: 'Áreas', icono: '<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>'},
 {id: 'pendientes', nombre: 'Pendientes', icono: '<path d="M9 3h6v3H9z"/><path d="M9 4.5H6V21h12V4.5h-3"/><path d="M9 12.5l2 2 4-4"/>'},
 {id: 'historial', nombre: 'Historial', icono: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8.5"/>'},
 {id: 'bodega', nombre: 'Bodega', icono: '<path d="M3 8l9-5 9 5v10l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v10"/>'},
 {id: 'mantenimiento', nombre: 'Reportar', icono: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>'},
];
// Dibujos simples para pantallas vacías (línea dorada, sin texto).
const ILUS = {
 bomba: '<svg class="ilus" viewBox="0 0 120 80" aria-hidden="true"><path d="M8 62h104"/><rect x="22" y="56" width="70" height="6" rx="2"/><circle cx="44" cy="40" r="15"/><circle cx="44" cy="40" r="5"/><path d="M59 33h26v14H59M88 30v20M64 33v14M70 33v14M76 33v14M29 40H10"/><path d="M44 25V12h20"/></svg>',
 listo: '<svg class="ilus" viewBox="0 0 120 80" aria-hidden="true"><circle cx="60" cy="38" r="26"/><path d="M47 39l9 9 18-20"/><path d="M20 70h80"/></svg>',
 buscar: '<svg class="ilus" viewBox="0 0 120 80" aria-hidden="true"><circle cx="54" cy="36" r="20"/><path d="M69 51l18 18"/><path d="M46 36h16"/></svg>',
 caja: '<svg class="ilus" viewBox="0 0 120 80" aria-hidden="true"><path d="M30 26l30-14 30 14v32L60 72 30 58z"/><path d="M30 26l30 14 30-14M60 40v32"/></svg>'
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const hoy = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const leer = k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const icono = (paths, tam = 22) => `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const clasica = new URLSearchParams(location.search).get('vista') === 'clasica';
if (!clasica) iniciar();
// Cambiar de distribución conserva el formulario y sus borradores.
if (!clasica) movil.addEventListener('change', () => {
 document.body.classList.toggle('app-movil',movil.matches);document.body.classList.toggle('app-pc',!movil.matches);window.dispatchEvent(new Event('resize'));
});

function iniciar() {
 document.body.classList.add('app-tel', movil.matches ? 'app-movil' : 'app-pc');
 const $ = s => document.querySelector(s);
 const V = () => window.vocatus;
 let seccion = new URLSearchParams(location.search).get('s') || 'areas';
 if (seccion === 'reparacion') seccion = 'pendientes';
 if (!SECCIONES.some(s => s.id === seccion)) seccion = 'areas';
 let eligiendo = null; // campo que espera una bomba tocada en el 3D o en la franja
 let viendoFicha = false;
 let enReparacion = new Map(); // tag → {desde, motivo}
 let pendientes = {repairs: [], sinFuncionar: [], writable: false, available: false, loading: true};
 const pendingGate=createRequestGate();
 const leerPendientes = async () => {
  const current=pendingGate.begin();
  try{const response=await fetch('/api/pending');if(!response.ok)throw new Error('No se pudo consultar el estado de planta.');const data=await response.json();if(!current())return;
   pendientes={...data,available:data.writable===true&&Array.isArray(data.repairs)&&Array.isArray(data.sinFuncionar),loading:false};
  }catch(error){if(!current())return;pendientes={repairs:[],sinFuncionar:[],writable:false,available:false,loading:false,error:error.message};}
  pintarGlobo();enReparacion=new Map((pendientes.available?pendientes.repairs:[]).map(x=>[x.tag,x]));pintarFranja();pintarRegreso();if(seccion==='pendientes')pintarPendientes();
 };
 let reportTag='',applyingDraft=false,reportBusy=false,storageReady=false,draftRestored=false;
 const nextReportId=()=>globalThis.crypto?.randomUUID?.()||'reporte-'+Date.now()+'-'+Math.random().toString(36).slice(2);let reportId=nextReportId();
 const draftStore=createDraftStore(localStorage);

 // ---------- Estructura ----------
 const cabecera=crearFlujoCabecera($('header'),{onPause:p=>guardar('vocatus-cab-pausa',p?'1':'')});
 cabecera.setPaused(leer('vocatus-cab-pausa')==='1');
 const titulo=document.createElement('div');titulo.id='tel-titulo';$('header')?.append(titulo);
 const franja = document.createElement('nav'); franja.id = 'tel-franja'; franja.setAttribute('aria-label', 'Bombas por código');
 $('#viewport')?.append(franja);
 const ampliar=document.createElement('button');ampliar.type='button';ampliar.id='tel-ampliar';
 const mostrarMapaAmplio=active=>{document.body.classList.toggle('tel-mapa-amplio',active);ampliar.setAttribute('aria-expanded',String(active));ampliar.innerHTML=icono('<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',18)+'<span>'+(active?'Mostrar lista':'Ampliar planta')+'</span>';window.dispatchEvent(new Event('resize'));};
 ampliar.onclick=()=>mostrarMapaAmplio(!document.body.classList.contains('tel-mapa-amplio'));$('#viewport')?.append(ampliar);mostrarMapaAmplio(false);
 // Controles de la vista explosionada (ficha abierta): juntar o separar piezas y vistas de la bomba.
 // Una sola botonera con dos diseños (CSS): fila compacta en teléfono, panel con grupos en computadora.
 const vistas = document.createElement('div'); vistas.id = 'tel-vistas'; vistas.setAttribute('role', 'toolbar'); vistas.setAttribute('aria-label', 'Vista de la bomba');
 const ic = d => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
 vistas.innerHTML = `<div class="tv-grupo"><span class="tv-titulo">Piezas</span>
   <button type="button" data-piezas>${ic('<path d="M4 12h4M16 12h4M12 4v4M12 16v4"/><rect x="9" y="9" width="6" height="6" rx="1"/>')}<span>Juntar piezas</span></button></div>
  <div class="tv-grupo"><span class="tv-titulo">Ver por dentro</span>
   <button type="button" data-corte aria-pressed="false">${ic('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9" stroke-dasharray="2 2"/><path d="M12 3v9l-8-4.5"/>')}<span>Corte 1/4</span></button>
   <button type="button" data-transparente aria-pressed="false">${ic('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>')}<span>Transparente</span></button></div>
  <div class="tv-grupo"><span class="tv-titulo">Cámara</span>
   <button type="button" data-vista="tres">${ic('<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>')}<span>3/4</span></button>
   <button type="button" data-vista="frente">${ic('<rect x="5" y="5" width="14" height="14" rx="1.5"/>')}<span>Frente</span></button>
   <button type="button" data-vista="arriba">${ic('<rect x="5" y="5" width="14" height="14" rx="1.5"/><path d="M12 9v6M9.5 11.5L12 9l2.5 2.5"/>')}<span>Arriba</span></button></div>`;
 $('#viewport')?.append(vistas);
 const pintarPiezas = () => {
  vistas.querySelector('[data-piezas] span').textContent = (V()?.explosion || 0) > 30 ? 'Juntar piezas' : 'Separar piezas';
  const a = V()?.anatomia || {};
  vistas.querySelector('[data-corte]').setAttribute('aria-pressed', String(!!a.cutaway));
  vistas.querySelector('[data-corte] span').textContent = a.cutaway ? 'Reponer 1/4' : 'Corte 1/4';
  vistas.querySelector('[data-transparente]').setAttribute('aria-pressed', String(!!a.transparent));
 };
 vistas.querySelector('[data-piezas]').onclick = () => { V()?.explode((V()?.explosion || 0) > 30 ? 0 : 100); setTimeout(pintarPiezas, 50); };
 vistas.querySelector('[data-corte]').onclick = () => { V()?.corte(); setTimeout(pintarPiezas, 50); };
 vistas.querySelector('[data-transparente]').onclick = () => { V()?.transparente(); setTimeout(pintarPiezas, 50); };
 vistas.querySelectorAll('[data-vista]').forEach(b => b.onclick = () => V()?.vista(b.dataset.vista));
 const contenido = document.createElement('section'); contenido.id = 'tel-contenido';
 document.body.append(contenido);
 const barra = document.createElement('nav'); barra.id = 'tel-barra'; barra.setAttribute('aria-label', 'Secciones');
 barra.innerHTML = SECCIONES.map(s => `<button type="button" data-s="${s.id}"><span class="tel-pill">${icono(s.icono)}</span><span>${s.nombre}</span>${s.id === 'pendientes' ? '<b class="tel-globo" hidden></b>' : ''}</button>`).join('');
 document.body.append(barra);
 const paneles = Object.fromEntries(SECCIONES.map(s => { const el = document.createElement('div'); el.className = 'tel-panel'; el.dataset.s = s.id; contenido.append(el); return [s.id, el]; }));
 const ficha = document.createElement('div'); ficha.className = 'tel-ficha'; ficha.hidden = true;
 ficha.innerHTML = '<button type="button" class="tel-volver"></button>';
 contenido.append(ficha);
 const inspector = $('.inspector'); if (inspector) ficha.append(inspector);
 const detalleVacio = document.createElement('div'); detalleVacio.className = 'tel-detalle-vacio tel-vacio-ilus';
 detalleVacio.innerHTML = `${ILUS.bomba}<p>Elegí una bomba de la lista para ver su ficha aquí.</p>`; contenido.append(detalleVacio);
 const resumen = document.createElement('aside'); resumen.className = 'tel-resumen'; resumen.setAttribute('aria-label', 'Bomba elegida'); contenido.append(resumen);
 const fab = document.createElement('button'); fab.type = 'button'; fab.className = 'tel-fab';
 fab.innerHTML = icono('<path d="M12 5v14M5 12h14"/>', 22) + '<span>Reportar</span>'; fab.setAttribute('aria-label', 'Reportar un mantenimiento de esta bomba');
 fab.hidden = true; document.body.append(fab);
 fab.onclick = () => { const tag = V()?.pump?.tag; V()?.explode(0); V()?.back(); mostrar('mantenimiento'); if (tag) setReportTag(tag); };

 // ---------- Áreas ----------
 paneles.areas.innerHTML = `<label class="tel-buscar">${icono('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', 20)}<input id="tel-buscar" type="search" placeholder="Buscar bomba (ej. B14)" autocomplete="off"></label>
  <div class="tel-dos"><div class="tel-campo"><label for="tel-fluido">Fluido</label><select id="tel-fluido"><option value="">Todos</option><option value="alcohol">Alcohol</option><option value="agua">Agua</option><option value="mosto">Mosto / vinaza</option><option value="sin-uso">Sin uso</option></select></div>
  <div class="tel-campo"><label for="tel-marca">Marca</label><select id="tel-marca"><option value="">Todas</option></select></div></div>
  <p id="tel-cuenta" class="tel-cuenta" aria-live="polite"></p>
  <h2 class="tel-sub">Áreas de la planta</h2><div id="tel-areas"></div>
  <h2 class="tel-sub">Herramientas</h2><div id="tel-herramientas"></div>`;
 const areaMenu = $('#area-menu'), camara = $('#camera-tools');
 if (areaMenu) $('#tel-areas').append(areaMenu);
 if (camara) $('#tel-herramientas').append(camara);
 $('#tel-buscar').oninput = pintarFranja;
 $('#tel-fluido').onchange = pintarFranja; $('#tel-marca').onchange = pintarFranja;
 document.addEventListener('vocatus:lista', pintarFranja);
 function pintarMarcas() {
  const sel = $('#tel-marca'), actual = sel.value;
  const marcas = [...new Set(bombas().map(p => String(p.marca || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  sel.innerHTML = '<option value="">Todas</option>' + marcas.map(m => `<option>${esc(m)}</option>`).join('');
  sel.value = marcas.includes(actual) ? actual : '';
 }

 function bombas() { return (V()?.pumps || []).filter(p => p.tag); }
 // Franja: con «Toda la planta» se ven todas las bombas; con un área, solo las de esa área.
 function pintarFranja() {
  const q = ($('#tel-buscar')?.value || '').toUpperCase().replace(/[\s-]/g, '');
  const fluido = $('#tel-fluido')?.value || '', marca = $('#tel-marca')?.value || '';
  const area = V()?.area || 'planta';
  const enArea = bombas().filter(p => area === 'planta' || V()?.areaDe(p) === area);
  const lista = enArea.filter(p => (!q || (p.tag + (p.nombre || '') + (p.marca || '')).toUpperCase().replace(/[\s-]/g, '').includes(q))
   && (!fluido || (V()?.tipos(p) || []).includes(fluido)) && (!marca || String(p.marca || '').trim() === marca));
  const actual = V()?.pump?.tag;
  franja.innerHTML = lista.map(p => `<button type="button" data-tag="${esc(p.tag)}" aria-pressed="${p.tag === actual}" class="${enReparacion.has(p.tag) ? 'en-rep' : ''}" title="${esc(p.nombre || '')}${enReparacion.has(p.tag) ? ' · En reparación' : ''}">${esc(p.tag)}</button>`).join('');
  franja.querySelectorAll('[data-tag]').forEach(b => b.onclick = () => elegirBomba(b.dataset.tag));
  document.body.classList.toggle('franja-vacia', !lista.length);
  const cuenta = $('#tel-cuenta'); if (!cuenta) return;
  const nombreArea = area === 'planta' ? 'toda la planta' : (V()?.areaNombre(area) || area);
  const filtrando = q || fluido || marca;
  cuenta.textContent = !enArea.length ? `${nombreArea}: todavía no hay bombas con TAG y ficha. Las que se ven en el 3D están pendientes de identificar.`
   : !lista.length ? 'Ninguna bomba coincide con los filtros.'
   : `${lista.length} ${lista.length === 1 ? 'bomba' : 'bombas'}${filtrando ? ` de ${enArea.length}` : ''} en ${nombreArea}.`;
 }
 function opciones(sel = '') {
  return '<option value="">Elegí la bomba…</option>' + bombas().map(p => `<option value="${esc(p.tag)}" ${p.tag === sel ? 'selected' : ''}>${esc(p.tag)} · ${esc(p.nombre || p.ubicacion || '')}</option>`).join('');
 }

 // ---------- Formulario de Mantenimiento (incluye si se llevan la bomba) ----------
 const campoBomba = id => `<div class="tel-campo"><label for="${id}">Equipo</label>
  <div class="tel-elegida" id="${id}-elegida" hidden></div>
  <div class="tel-fila" id="${id}-fila"><select id="${id}" required></select></div>
  <div class="tel-fila"><button type="button" class="tel-sec" data-elegir="${id}">${icono('<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="5"/>', 18)} Elegir en el 3D</button>
  <button type="button" class="tel-sec" data-localizar="${id}">${icono('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 18)} Localizar</button></div></div>`;
 const pie = id => `<div class="tel-dos"><div class="tel-campo"><label for="${id}-autor">Responsable</label><input id="${id}-autor" required maxlength="100" autocomplete="name"></div>
  <div class="tel-campo"><label for="${id}-fecha">Fecha</label><input id="${id}-fecha" type="date" required></div></div>`;

 paneles.mantenimiento.innerHTML = `<p id="mant-storage" class="tel-storage-note" role="status">Consultando dónde se puede guardar…</p><p id="mant-draft-status" class="tel-draft-status" aria-live="polite"></p><form id="tel-mant" novalidate>${campoBomba('mant-bomba')}
  <div class="tel-campo"><label for="mant-problema">Problema</label><textarea id="mant-problema" rows="2" maxlength="600" placeholder="Qué falla o qué se hizo"></textarea></div>
  <div class="tel-campo"><span class="tel-etiqueta">Repuestos usados</span><div id="mant-repuestos"></div>
   <button type="button" class="tel-sec" id="mant-agregar">${icono('<path d="M12 5v14M5 12h14"/>', 18)} Agregar repuesto</button></div>
  <div class="tel-campo"><label for="mant-comentario">Comentario</label><textarea id="mant-comentario" rows="3" maxlength="3000"></textarea></div>
  <fieldset class="tel-campo tel-sino"><legend>¿El equipo quedó funcionando?</legend>
   <label><input type="radio" name="mant-funcional" value="si"> Sí</label><label><input type="radio" name="mant-funcional" value="no"> No</label></fieldset>
  <fieldset class="tel-campo tel-sino"><legend>¿Se la llevan de su lugar?</legend>
   <label><input type="radio" name="mant-retiro" value="si"> Sí</label><label><input type="radio" name="mant-retiro" value="no" checked> No</label>
   <p class="tel-nota">Si se la llevan, la ficha queda «En reparación» hasta que se registre que volvió.</p></fieldset>
  ${pie('mant')}</form>
  <div class="tel-accion"><p class="tel-aviso" role="status" id="mant-aviso"></p>
   <div class="tel-accion-fila"><span id="mant-resumen"></span><button class="tel-primario" type="submit" form="tel-mant" disabled>Consultando…</button></div></div>
  <button type="button" class="tel-sec" id="mant-export">Descargar este reporte para la computadora de planta</button>
  <section id="mant-local" aria-label="Reportes guardados en este dispositivo"></section>
  <section id="mant-import" hidden><h2 class="tel-sub">Importar reportes del teléfono</h2><p class="tel-nota">Elegí el paquete descargado en el teléfono. Revisá los equipos y fechas antes de importarlo a Obsidian.</p>
   <input id="mant-package" type="file" accept="application/json,.json" aria-label="Paquete de reportes de Vocatus"><div id="mant-import-preview"></div><button type="button" class="tel-sec" id="mant-import-confirm" disabled>Importar los reportes revisados</button></section>`;

 paneles.pendientes.innerHTML = `<div id="pend-lista"><p class="tel-vacio">Cargando…</p></div>`;

 paneles.historial.innerHTML = `<label class="tel-buscar">${icono('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', 20)}<input id="hist-buscar" type="search" placeholder="TAG, marca, modelo o serie" aria-label="Buscar bomba en Historial" autocomplete="off"></label>
  <div class="tel-filtros"><div class="tel-campo tf-area"><label for="hist-area">Área</label><select id="hist-area"></select></div><div class="tel-campo"><label for="hist-fluido">Fluido</label><select id="hist-fluido"><option value="">Todos</option><option value="alcohol">Alcohol</option><option value="agua">Agua</option><option value="mosto">Mosto / vinaza</option><option value="sin-uso">Sin uso</option></select></div>
  <div class="tel-campo"><label for="hist-marca">Marca</label><select id="hist-marca"><option value="">Todas</option></select></div></div>
  <p id="hist-cuenta" class="tel-cuenta" aria-live="polite"></p>
  <div id="hist-tarjetas" class="tel-tarjetas"></div>`;
 for (const id of ['hist-buscar', 'hist-fluido', 'hist-marca']) $('#' + id).addEventListener(id === 'hist-buscar' ? 'input' : 'change', () => pintarHistorial());
 $('#hist-area').onchange = e => { filtroHist = e.target.value; if (filtroHist) V()?.chooseArea(filtroHist); pintarHistorial(); };

 paneles.bodega.innerHTML = `<div class="tel-campo"><label for="bod-bomba">Bomba</label><select id="bod-bomba"></select></div>
  <h2 class="tel-sub">Repuestos de la ficha</h2><div id="bod-lista"><p class="tel-vacio">Elegí una bomba para ver sus repuestos.</p></div>
  <a class="tel-sec tel-manual" id="bod-manual" href="/solicitud.html">+ Otro repuesto a mano</a>
  <h2 class="tel-sub">Otras herramientas</h2>
  <div class="tel-atajos"><a href="/levantamiento.html">Actualizar datos</a><a href="/avance.html">Avance</a><a href="/equipo.html">Mover o cambiar</a></div>
  <div class="tel-accion"><div class="tel-accion-fila"><span id="bod-cuenta"></span><a class="tel-primario" id="bod-ir" href="/solicitud.html">Completar solicitud</a></div></div>`;
 // Carrito compartido con /solicitud.html (misma clave y formato).
 const carrito = { leer() { try { return JSON.parse(localStorage.getItem('vocatus-solicitud')) || []; } catch { return []; } }, guardar(c) { try { localStorage.setItem('vocatus-solicitud', JSON.stringify(c)); } catch {} } };
 const mismo = (a, b) => a.tag === b.tag && a.pieza === b.pieza && (a.codigo || '') === (b.codigo || '') && (a.detalle || '') === (b.detalle || '');
 let repuestosFicha = [];const bodegaGate=createRequestGate();
 function pintarBodega() {
  pintarResumen();
  const tag = $('#bod-bomba').value, c = carrito.leer();
  $('#bod-cuenta').textContent = c.length ? `${c.length} ${c.length === 1 ? 'repuesto' : 'repuestos'} en la solicitud` : 'La solicitud está vacía';
  const q = tag ? '?tag=' + encodeURIComponent(tag) : '';
  $('#bod-ir').href = '/solicitud.html' + q; $('#bod-manual').href = '/solicitud.html' + q;
  const lista = $('#bod-lista');
  if (!tag) { lista.innerHTML = `<div class="tel-vacio-ilus">${ILUS.caja}<p>Elegí una bomba para ver sus repuestos.</p></div>`; return; }
  if (!repuestosFicha.length) { lista.innerHTML = `<p class="tel-vacio">La ficha de ${esc(tag)} todavía no tiene sello, rodamientos ni o-rings registrados.</p>`; return; }
  lista.innerHTML = '<div class="tel-repuestos">' + repuestosFicha.map((r, i) => { const en = c.some(x => mismo(x, r));
   return `<div class="tel-rep-fila"><span><strong>${esc(r.tag)} · ${esc(r.pieza)}${r.cantidad > 1 ? ' ×' + r.cantidad : ''}</strong><small>${esc(r.codigo || r.detalle || 'sin código en la ficha')}</small></span>${en ? `<button type="button" class="tel-en" data-quitar="${i}" aria-label="Quitar ${esc(r.pieza)} de la solicitud">✓ En la solicitud</button>` : `<button type="button" class="tel-sec" data-agregar="${i}">+ Agregar</button>`}</div>`; }).join('') + '</div>';
  lista.querySelectorAll('[data-agregar]').forEach(b => b.onclick = () => { const r = repuestosFicha[Number(b.dataset.agregar)]; if(!r||r.tag!==$('#bod-bomba').value){aviso('mant','La ficha cambió; volvé a seleccionar la bomba.','error');return;}carrito.guardar([...carrito.leer(), {...r, id: crypto.randomUUID?.() || String(Date.now() + Math.random())}]); pintarBodega(); });
  lista.querySelectorAll('[data-quitar]').forEach(b => b.onclick = () => { const r = repuestosFicha[Number(b.dataset.quitar)]; carrito.guardar(carrito.leer().filter(x => !mismo(x, r))); pintarBodega(); });
 }
 async function elegirBodega() {
  const tag=$('#bod-bomba').value,current=bodegaGate.begin();repuestosFicha=[];
  if(!tag){pintarBodega();return;}
  $('#bod-lista').innerHTML='<p class="tel-vacio">Leyendo ficha…</p>';
  try{const pump=await V().api('/api/pump?tag='+encodeURIComponent(tag));if(!current()||tag!==$('#bod-bomba').value)return;
   if(pump.tag!==tag)throw new Error('La respuesta pertenece a otro equipo.');repuestosFicha=partsOf(pump);pintarBodega();
  }catch(error){if(current()&&tag===$('#bod-bomba').value)$('#bod-lista').innerHTML=`<p class="tel-vacio">${esc(error.message)}</p>`;}
 }
 $('#bod-bomba').onchange = elegirBodega;

 for (const id of ['mant']) { $(`#${id}-autor`).value = leer('vocatus-responsable'); $(`#${id}-fecha`).value = hoy(); $(`#${id}-autor`).onchange = e => guardar('vocatus-responsable', e.target.value.trim()); }
 const repuestoFila = (value={}) => { const d = document.createElement('div'); d.className = 'tel-repuesto'; d.innerHTML = '<input placeholder="Código de bodega" maxlength="60" aria-label="Código de bodega"><input placeholder="Nombre del repuesto" maxlength="120" aria-label="Nombre del repuesto"><button type="button" aria-label="Quitar este repuesto">×</button>'; const inputs=d.querySelectorAll('input');inputs[0].value=value.code||'';inputs[1].value=value.name||'';d.querySelector('button').onclick=()=>{d.remove();saveReportDraft();};$('#mant-repuestos').append(d); };
 $('#mant-agregar').onclick=()=>{if(document.querySelectorAll('.tel-repuesto').length>=50)return aviso('mant','Máximo 50 líneas de repuestos.','error');repuestoFila();saveReportDraft();};repuestoFila();

 contenido.addEventListener('click', e => {
  const elegir = e.target.closest('[data-elegir]'), localizar = e.target.closest('[data-localizar]');
  if (elegir) { V()?.ensure3D?.();eligiendo = elegir.dataset.elegir; aviso('mant', 'Tocá la bomba en el 3D o en la franja de códigos.'); document.body.classList.add('tel-eligiendo'); }
  if (localizar) { const tag = $('#' + localizar.dataset.localizar).value; if (tag) { document.body.classList.add('tel-3d');V()?.ensure3D?.();V()?.select(tag); setTimeout(() => V()?.locate(), 600); } else aviso('mant', 'Elegí primero la bomba.', 'error'); }
 });
 function pintarResumen() {
  const tag = seccion === 'bodega' ? $('#bod-bomba')?.value : $('#mant-bomba')?.value, p = bombas().find(x => x.tag === tag);
  if (!p) { resumen.innerHTML = `<div class="tel-vacio-ilus">${ILUS.bomba}<p>Elegí una bomba para ver su resumen aquí.</p></div>`; return; }
  const c = completeness(p), v = verificationOf(p), pct = c.total ? Math.round(c.done / c.total * 100) : 0, area = V()?.areaDe(p);
  resumen.innerHTML = `<p class="tel-sub">Bomba elegida</p><p class="tr-tag">${esc(p.tag)}</p>
   <p class="tr-nombre">${esc([p.marca, p.modelo].filter(x => x && !/por confirmar/i.test(x)).join(' ') || 'Marca por confirmar')}</p>
   <p class="tr-linea">${esc(p.nombre || p.servicio || '')}${area ? ' · ' + esc(V()?.areaNombre(area) || area) : ''}</p>
   ${enReparacion.has(p.tag) ? '<p class="tr-alerta">En reparación</p>' : ''}
   <span class="tt-medidor"><i style="width:${pct}%"></i></span><p class="tr-linea">Ficha ${c.done}/${c.total} · ${v.verified ? 'verificada' : 'sin verificar en campo'}</p>
   <div class="tr-acciones"><button type="button" class="tel-sec" data-ver>Ver ficha</button><button type="button" class="tel-sec" data-ubicar>Ver en el 3D</button></div>`;
  resumen.querySelector('[data-ver]').onclick = () => abrirFicha(p.tag, 'ficha');
  resumen.querySelector('[data-ubicar]').onclick = () => { document.body.classList.add('tel-3d'); V()?.select(p.tag); setTimeout(() => V()?.locate(), 600); };
 }
 function pintarElegida(id) {
  const sel = $('#' + id), card = $('#' + id + '-elegida'), fila = $('#' + id + '-fila'), tag = sel.value;
  const p = bombas().find(x => x.tag === tag);
  card.hidden = !tag; fila.hidden = !!tag;
  pintarResumen();
  if (tag) { card.innerHTML = `<strong>${esc(tag)}</strong><span>${esc([p?.marca, p?.modelo].filter(Boolean).join(' ') || '')}${p?.nombre ? ' · ' + esc(p.nombre) : ''}</span><button type="button" class="tel-cambiar">Cambiar</button>`; card.querySelector('button').onclick = () => { card.hidden = true; fila.hidden = false; sel.focus(); }; }
 }
 const resumenMant = () => { const a = $('#mant-autor').value.trim(), f = $('#mant-fecha').value; $('#mant-resumen').textContent = (a || 'Sin responsable') + ' · ' + (f === hoy() ? 'hoy' : f || 'sin fecha'); };
 $('#mant-bomba').onchange=()=>setReportTag($('#mant-bomba').value);
 $('#mant-autor').addEventListener('input', resumenMant); $('#mant-fecha').addEventListener('input', resumenMant); resumenMant();
 function aviso(form, texto, tipo = '') { const el = $(`#${form}-aviso`); el.textContent = texto; el.dataset.tipo = tipo; }

 function snapshotReport(){return {id:reportId,problema:$('#mant-problema').value,comentario:$('#mant-comentario').value,author:$('#mant-autor').value,date:$('#mant-fecha').value,operativo:document.querySelector('[name=mant-funcional]:checked')?.value||'',retiro:document.querySelector('[name=mant-retiro]:checked')?.value||'no',parts:[...document.querySelectorAll('.tel-repuesto')].map(r=>({code:r.querySelectorAll('input')[0].value,name:r.querySelectorAll('input')[1].value}))};}
 function saveReportDraft(){
  if(applyingDraft)return;try{draftStore.write(reportTag,snapshotReport());const label=reportTag?'Borrador de '+reportTag:'Borrador sin equipo';const el=$('#mant-draft-status');if(el.textContent!==label+' guardado en este dispositivo.')el.textContent=label+' guardado en este dispositivo.';}
  catch(error){$('#mant-draft-status').textContent='No se pudo conservar el borrador en este navegador. Descargá el reporte antes de salir.';}
 }
 function setReportTag(tag,force=false){
  if(tag===reportTag&&!force){$('#mant-bomba').value=tag;pintarElegida('mant-bomba');return;}
  if(!force)saveReportDraft();reportTag=tag;let draft=null;
  try{draft=draftStore.read(tag);}catch(error){aviso('mant','No se pudo recuperar el borrador de '+(tag||'este equipo')+'. '+error.message,'error');}
  applyingDraft=true;reportId=draft?.id||nextReportId();$('#mant-bomba').value=tag;
  $('#mant-problema').value=draft?.problema||'';$('#mant-comentario').value=draft?.comentario||'';$('#mant-autor').value=draft?.author??leer('vocatus-responsable');$('#mant-fecha').value=draft?.date??hoy();
  document.querySelectorAll('[name=mant-funcional]').forEach(r=>r.checked=r.value===(draft?.operativo||''));document.querySelectorAll('[name=mant-retiro]').forEach(r=>r.checked=r.value===(draft?.retiro||'no'));
  $('#mant-repuestos').innerHTML='';for(const row of draft?.parts?.length?draft.parts:[{}])repuestoFila(row);
  applyingDraft=false;pintarElegida('mant-bomba');resumenMant();guardar('vocatus-reporte-tag',tag);saveReportDraft();paintLocalReports();
 }
 $('#tel-mant').addEventListener('input',saveReportDraft);$('#tel-mant').addEventListener('change',saveReportDraft);window.addEventListener('pagehide',saveReportDraft);
 function reportInput(){
  const d=snapshotReport(),tag=$('#mant-bomba').value;
  if(tag!==reportTag)throw new Error('El equipo cambió. Volvé a seleccionarlo antes de guardar.');
  return normalizeFieldReport({id:reportId,tag,date:d.date,author:d.author,title:'Mantenimiento: '+d.problema.split('\n')[0].slice(0,80),symptoms:d.problema,text:d.comentario||d.problema,parts:d.parts.filter(r=>r.code.trim()||r.name.trim()).map(r=>[r.code.trim()&&'Código '+r.code.trim(),r.name.trim()].filter(Boolean).join(' · ')).join('\n'),operativo:d.operativo,retirado:d.retiro==='si'});
 }
 function downloadReports(records){const pkg=fieldReportPackage(records),blob=new Blob([JSON.stringify(pkg,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Reportes_Vocatus_'+records[0].tag+'_'+hoy()+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);}
 $('#mant-export').onclick=()=>{try{downloadReports([reportInput()]);aviso('mant','Paquete descargado. Importalo desde el visor de la computadora de planta.','ok');}catch(error){aviso('mant',error.message,'error');}};
 let localPaint=0;
 async function paintLocalReports(){
  const ticket=++localPaint,tag=reportTag;try{const records=tag?(await listReports(tag)).filter(r=>r.source==='browser'&&r.fieldReport):[];if(ticket!==localPaint||tag!==reportTag)return;
   $('#mant-local').innerHTML=records.length?'<h2 class="tel-sub">Pendientes de llevar a planta · '+esc(tag)+'</h2>'+records.map((r,i)=>`<div class="tel-local-report"><span>${esc(r.date)} · ${esc(r.title)}<small>Solo en este dispositivo · sin importar a Obsidian</small></span><button type="button" class="tel-sec" data-package="${i}">Descargar paquete</button></div>`).join(''):'';
   $('#mant-local').querySelectorAll('[data-package]').forEach(b=>b.onclick=()=>{try{downloadReports([records[Number(b.dataset.package)]]);}catch(error){aviso('mant',error.message,'error');}});
  }catch(error){if(ticket===localPaint)$('#mant-local').textContent='No se pudieron leer los reportes de este dispositivo.';}
 }
 function storageMode(){storageReady=true;const connected=V()?.writable===true,button=document.querySelector('button[form=tel-mant]');
  $('#mant-storage').textContent=connected?'Los reportes se guardan en Obsidian en la computadora de planta. El borrador se conserva en este dispositivo.':'Guardado en este dispositivo: no hay sincronización con Obsidian. Podés guardar el reporte aquí y descargar un paquete para importarlo en la computadora de planta.';
  button.textContent=connected?'Enviar reporte a Obsidian':'Guardar en este dispositivo';button.disabled=false;$('#mant-import').hidden=!connected;paintLocalReports();
 }
 let packageRecords=[];
 $('#mant-package').onchange=async e=>{packageRecords=[];$('#mant-import-confirm').disabled=true;$('#mant-import-preview').textContent='';try{const file=e.target.files?.[0];if(!file)return;if(file.size>5*1024*1024)throw new Error('Máximo 5 MB.');packageRecords=parseFieldReportPackage(await file.text());$('#mant-import-preview').innerHTML='<p>Revisá estos reportes:</p><ul>'+packageRecords.map(r=>`<li><strong>${esc(r.tag)}</strong> · ${esc(r.date)} · ${esc(r.author)} · ${esc(r.title)}${r.retirado?' · Retirado de su lugar':''}</li>`).join('')+'</ul>';$('#mant-import-confirm').disabled=!V()?.writable;}catch(error){$('#mant-import-preview').textContent=error.message;}};
 $('#mant-import-confirm').onclick=async()=>{const button=$('#mant-import-confirm');button.disabled=true;try{const n=await importFieldReports(packageRecords,(path,body)=>V().api(path,body));$('#mant-import-preview').textContent=n+' reportes importados a Obsidian. El archivo original se conserva.';packageRecords=[];$('#mant-package').value='';leerPendientes();}catch(error){$('#mant-import-preview').textContent=error.message+' Podés reintentar: los reportes ya importados no se duplican.';button.disabled=!V()?.writable;}};
 $('#tel-mant').onsubmit=async e=>{
  e.preventDefault();if(reportBusy||!storageReady)return;let record;try{record=reportInput();}catch(error){return aviso('mant',error.message,'error');}
  saveReportDraft();const tag=record.tag,button=document.querySelector('button[form=tel-mant]');reportBusy=true;button.disabled=true;
  try{
   if(!V()?.writable){await addReport({...record,fieldReport:true});aviso('mant','Reporte de '+tag+' guardado en este dispositivo. Todavía no está en Obsidian: descargá su paquete para llevarlo a planta.','ok');}
   else{
    await importFieldReports([record],(path,body)=>V().api(path,body));aviso('mant','Reporte de '+tag+' guardado en Obsidian.','ok');leerPendientes();
   }
   draftStore.remove(tag);
   if(reportTag===tag){applyingDraft=true;reportId=nextReportId();$('#mant-problema').value='';$('#mant-comentario').value='';$('#mant-repuestos').innerHTML='';repuestoFila();document.querySelectorAll('[name=mant-funcional]').forEach(r=>r.checked=false);document.querySelector('[name=mant-retiro][value=no]').checked=true;applyingDraft=false;}
   await paintLocalReports();
  }catch(error){aviso('mant',error.message+' El borrador se conserva para reintentar.','error');}
  finally{reportBusy=false;button.disabled=false;saveReportDraft();}
 };

 // ---------- Pendientes ----------
 function pintarGlobo() {
  const n = pendientes.available ? (pendientes.repairs || []).length + (pendientes.sinFuncionar || []).length : 0, g = barra.querySelector('.tel-globo');
  if (g) { g.hidden = !n; g.textContent = n > 99 ? '99+' : String(n); g.setAttribute('aria-label', n + ' pendientes'); }
 }
 function pintarPendientes() {
  const lista = $('#pend-lista'); if (!lista) return;
  if (pendientes.loading || !bombas().length) { lista.innerHTML = '<div class="tel-contadores"><span class="tel-silueta"></span><span class="tel-silueta"></span><span class="tel-silueta"></span></div><span class="tel-silueta fila"></span><span class="tel-silueta fila"></span>'; return; }
  const nombre = tag => esc(bombas().find(p => p.tag === tag)?.nombre || '');
  const flecha = icono('<path d="M9 6l6 6-6 6"/>', 20);
  const fila = (tag, linea, tipo, tab = 'ficha') => `<button type="button" class="tel-pend" data-tag="${esc(tag)}" data-tab="${tab}"><i class="tel-punto ${tipo}" aria-hidden="true"></i><span><strong>${esc(tag)}</strong><small>${linea}</small></span>${flecha}</button>`;
  const grupo = (titulo, items, vacio) => `<details class="tel-grupo"><summary><span>${titulo}</span><b>${items.length}</b></summary>${items.length ? `<div class="tel-pends">${items.join('')}</div>` : `<p class="tel-vacio">${vacio}</p>`}</details>`;
  const repairs = pendientes.repairs || [], sinFun = pendientes.sinFuncionar || [];
  const incompletas = bombas().map(p => [p, completeness(p)]).filter(([, c]) => c.done < c.total).sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total);
  const sinVer = bombas().filter(p => !verificationOf(p).verified);
  const atencion = [...repairs.map(r => fila(r.tag, `En reparación desde ${esc(r.desde || '—')} · ${esc(r.motivo)}`, 'rojo')),
   ...sinFun.map(r => fila(r.tag, `Último mantenimiento ${esc(r.date)}: no quedó funcionando`, 'ambar', 'historial'))];
  lista.innerHTML = `<div class="tel-contadores">
    <div class="tel-contador rojo"><b>${pendientes.available?repairs.length:'—'}</b><span>Fuera de su lugar</span></div>
    <div class="tel-contador ambar"><b>${pendientes.available?sinFun.length:'—'}</b><span>Quedó sin funcionar</span></div>
    <div class="tel-contador"><b>${incompletas.length}</b><span>Fichas por completar</span></div></div>`
   + (pendientes.available?'':`<p class="tel-storage-note">${pendientes.loading?'Consultando el estado de planta…':pendientes.error?'No se pudo consultar el estado de planta. Reintentá cuando vuelva la conexión.':'Estado de planta no disponible: este alojamiento no está sincronizado con Obsidian.'}</p>`)
   + `<h2 class="tel-sub">Atención ahora</h2>` + (!pendientes.available?'<p class="tel-vacio">No se puede confirmar si hay equipos fuera de su lugar o sin funcionar.</p>':atencion.length?`<div class="tel-pends">${atencion.join('')}</div>`:`<div class="tel-vacio-ilus">${ILUS.listo}<p>Sin equipos fuera de su lugar o sin funcionar en la última consulta a Obsidian.</p></div>`)
   + `<h2 class="tel-sub">Revisión de fichas</h2>`
   + grupo('Fichas incompletas', incompletas.map(([p, c]) => fila(p.tag, `${nombre(p.tag)} · Completa ${c.done}/${c.total}`, 'gris')), 'Todas las fichas están completas.')
   + grupo('Sin verificar en campo', sinVer.map(p => { const v = verificationOf(p); return fila(p.tag, `${nombre(p.tag)} · ${v.legacy ? 'Registro antiguo' : v.partial ? 'Verificación parcial' : 'Sin verificar'}`, 'gris'); }), 'Todas las fichas están verificadas.');
  lista.querySelectorAll('.tel-pend').forEach(b => b.onclick = () => abrirFicha(b.dataset.tag, b.dataset.tab));
 }

 // Regreso de una bomba en reparación: se registra desde su ficha.
 const regreso = document.createElement('div'); regreso.className = 'tel-regreso'; regreso.hidden = true;
 ficha.querySelector('.tel-volver').after(regreso);
 function pintarRegreso() {
  const tag = V()?.pump?.tag, r = tag && enReparacion.get(tag);
  if (!r || !viendoFicha) { regreso.hidden = true; return; }
  regreso.hidden = false;
  regreso.innerHTML = `<p><strong>En reparación</strong> desde ${esc(r.desde || '—')} · ${esc(r.motivo)}</p>
   <details><summary>Volvió a su lugar</summary>
   <div class="tel-dos"><div class="tel-campo"><label for="reg-fecha">Fecha de regreso</label><input id="reg-fecha" type="date" value="${hoy()}"></div>
   <div class="tel-campo"><label for="reg-autor">Responsable</label><input id="reg-autor" maxlength="100" value="${esc(leer('vocatus-responsable'))}"></div></div>
   <div class="tel-campo"><label for="reg-nota">Nota (opcional)</label><input id="reg-nota" maxlength="300"></div>
   <button type="button" class="tel-primario">Registrar regreso</button><p class="tel-aviso" role="status"></p></details>`;
  regreso.querySelector('.tel-primario').onclick = async () => {
   const out = regreso.querySelector('.tel-aviso'), author = $('#reg-autor').value.trim();
   if (!author) { out.textContent = 'Escribí el responsable.'; out.dataset.tipo = 'error'; return; }
   try {
    guardar('vocatus-responsable', author);
    await V().api('/api/equipment', {action: 'repair-return', tag, date: $('#reg-fecha').value, reason: $('#reg-nota').value.trim(), author});
    enReparacion.delete(tag); regreso.hidden = true; leerPendientes(); V()?.select(tag);
   } catch (err) { out.textContent = err.message; out.dataset.tipo = 'error'; }
  };
 }

 // ---------- Historial ----------
 let filtroHist = '';
 // Áreas del visor (las mismas de la sección Áreas): [id del menú, nombre].
 const areasMenu = () => [...document.querySelectorAll('#area-menu [data-area]')].map(b => [b.dataset.area, [...b.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() || b.textContent.trim()]);
 const areaDeMenu = id => !id || id === 'integrado' || id === 'planta' ? '' : id.replace(/^sector:/, '');
 function pintarHistorial() {
  const areas = areasMenu(), marcaSel = $('#hist-marca'), actual = marcaSel.value;
  const marcas = [...new Set(bombas().map(p => String(p.marca || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
  marcaSel.innerHTML = '<option value="">Todas</option>' + marcas.map(m => `<option>${esc(m)}</option>`).join(''); marcaSel.value = marcas.includes(actual) ? actual : '';
  const cuantas = id => bombas().filter(p => !areaDeMenu(id) || V()?.areaDe(p) === areaDeMenu(id)).length; // conteo por área (idea de Codex)
  $('#hist-area').innerHTML = (areas.length ? areas : [['', 'Toda la planta']]).map(([id, n]) => `<option value="${esc(id)}"${areaDeMenu(id) === areaDeMenu(filtroHist) ? ' selected' : ''}>${esc(n)} (${cuantas(id)})</option>`).join('');
  const q = $('#hist-buscar').value.toUpperCase().replace(/[\s-]/g, ''), fluido = $('#hist-fluido').value, marca = marcaSel.value, area = areaDeMenu(filtroHist);
  const enArea = bombas().filter(p => !area || V()?.areaDe(p) === area);
  // Búsqueda de Codex (TAG, marca, modelo o serie) + filtros de fluido y marca.
  const lista = filtrarHistorial(enArea, {query: $('#hist-buscar').value}, p => V()?.areaDe(p)).filter(p => (!fluido || (V()?.tipos(p) || []).includes(fluido)) && (!marca || String(p.marca || '').trim() === marca));
  const nombreArea = areas.find(([id]) => id === filtroHist)?.[1] || 'toda la planta';
  $('#hist-cuenta').textContent = !enArea.length ? `${nombreArea}: todavía no hay bombas con TAG y ficha.` : !lista.length ? 'Ninguna bomba coincide con los filtros.' : `${lista.length} ${lista.length === 1 ? 'bomba' : 'bombas'}${lista.length < enArea.length ? ` de ${enArea.length}` : ''} en ${nombreArea === 'toda la planta' ? nombreArea : nombreArea}.`;
  if (!bombas().length) { $('#hist-tarjetas').innerHTML = '<span class="tel-silueta"></span>'.repeat(6); return; }
  if (!lista.length) { $('#hist-tarjetas').innerHTML = `<div class="tel-vacio-ilus tt-ancho">${ILUS.buscar}<p>${enArea.length ? 'Ninguna bomba coincide con los filtros.' : 'Esta área todavía no tiene bombas con ficha.'}</p></div>`; return; }
  $('#hist-tarjetas').innerHTML = lista.map(p => { const c = completeness(p), pct = c.total ? Math.round(c.done / c.total * 100) : 0, marcaP = String(p.marca || '').trim();
   return `<button type="button" class="tel-tarjeta" data-tag="${esc(p.tag)}"><span class="tt-cab"><strong>${esc(p.tag)}</strong>${marcaP && !/por confirmar/i.test(marcaP) ? `<em>${esc(marcaP)}</em>` : ''}</span><span>${esc(p.nombre || p.ubicacion || '')}</span>
    <span class="tt-medidor" title="Ficha completa ${c.done} de ${c.total}"><i style="width:${pct}%"></i></span><small>Ficha ${c.done}/${c.total}</small></button>`; }).join('');
  $('#hist-tarjetas').querySelectorAll('[data-tag]').forEach(b => b.onclick = () => abrirFicha(b.dataset.tag, 'historial'));
 }

 // ---------- Ficha dentro de la app ----------
 function abrirFicha(tag, pestana = 'ficha') {
  mostrarMapaAmplio(false);
  viendoFicha = true; ficha.dataset.origen = seccion; ficha.hidden = false; document.body.classList.add('tel-con-ficha'); fab.hidden = false;
  // En computadora, Pendientes es «lista y detalle»: la lista queda a la izquierda y la ficha a la derecha.
  const ladoALado = !movil.matches && seccion === 'pendientes';
  Object.entries(paneles).forEach(([k, p]) => p.hidden = !(ladoALado && k === 'pendientes'));
  ficha.querySelector('.tel-volver').textContent = '← ' + SECCIONES.find(s => s.id === seccion).nombre;
  if (V()?.pump?.tag !== tag) V()?.select(tag);
  const aplicar = () => { V()?.tab(pestana); if (pestana === 'historial') V()?.explode(100); pintarRegreso(); pintarPiezas(); };
  // Espera a que el visor termine de cargar esa bomba (con el 3D real puede tardar varios segundos);
  // si se aplica antes, al terminar la carga el visor vuelve a juntar las piezas.
  const inicio = Date.now();
  (function esperar() {
   if (!viendoFicha) return;
   if (V()?.pump?.tag === tag && V()?.listo) { setTimeout(aplicar, 250); return; }
   if (Date.now() - inicio < 12000) setTimeout(esperar, 150); else aplicar();
  })();
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 ficha.querySelector('.tel-volver').onclick = () => { V()?.explode(0); V()?.back(); cerrarFicha(); };
 function cerrarFicha() { viendoFicha = false; ficha.hidden = true; fab.hidden = true; document.body.classList.remove('tel-con-ficha'); mostrar(seccion); }

 function elegirBomba(tag) {
  if (eligiendo) {
   const sel=$('#'+eligiendo);if(eligiendo==='mant-bomba')setReportTag(tag);else{sel.value=tag;pintarElegida(eligiendo);} aviso('mant', `Equipo elegido: ${tag}.`, 'ok');
   eligiendo = null; document.body.classList.remove('tel-eligiendo'); V()?.select(tag); return;
  }
  if (seccion === 'areas') abrirFicha(tag); else V()?.select(tag);
 }
 // Una bomba tocada en el 3D llega por este aviso del visor.
 document.addEventListener('vocatus:bomba', e => {
  pintarFranja();
  if (eligiendo) { const tag = e.detail, campo = eligiendo; eligiendo = null; document.body.classList.remove('tel-eligiendo'); if(campo==='mant-bomba')setReportTag(tag);else{$('#'+campo).value=tag;pintarElegida(campo);} aviso('mant', `Equipo elegido: ${tag}.`, 'ok'); return; }
  if (seccion === 'areas' && !viendoFicha) abrirFicha(e.detail);
  pintarRegreso();
  if(!$('#mant-bomba').value)setReportTag(e.detail);
  if (!$('#bod-bomba').value) { $('#bod-bomba').value = e.detail; elegirBodega(); }
 });

 // ---------- Navegación ----------
 function mostrar(id) {
  mostrarMapaAmplio(false);
  seccion = id; viendoFicha = false; ficha.hidden = true; fab.hidden = true;
  eligiendo = null; document.body.classList.remove('tel-con-ficha', 'tel-eligiendo', 'tel-3d');
  for (const [k, p] of Object.entries(paneles)) p.hidden = k !== id;
  barra.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', b.dataset.s === id ? 'page' : 'false'));
  titulo.textContent=SECCIONES.find(s=>s.id===id).nombre;cabecera.setSection(titulo.textContent);
  document.body.dataset.telSeccion = id;
  history.replaceState(null, '', '?s=' + id + location.hash);
  if (id === 'pendientes') { pintarPendientes(); leerPendientes(); }
  if (id === 'bodega') pintarBodega();
  if (id === 'mantenimiento' || id === 'bodega') pintarResumen();
  if(id==='mantenimiento'){resumenMant();paintLocalReports();}
  if(['areas','historial'].includes(id))V()?.ensure3D?.();
  if (id === 'historial') pintarHistorial();
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 const transicion = cambio => { if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(cambio); else cambio(); };
 barra.querySelectorAll('button').forEach(b => b.onclick = () => { if (b.dataset.s === seccion && !viendoFicha) return; if (viendoFicha) { V()?.explode(0); V()?.back(); } transicion(() => mostrar(b.dataset.s)); });

 function alCargar() {
  if(!V()?.pumps?.length)return;
  pintarMarcas(); pintarFranja(); leerPendientes();
  const sel=V()?.pump?.tag||'',previous=reportTag||leer('vocatus-reporte-tag')||sel;
  const bodega=$('#bod-bomba').value;$('#mant-bomba').innerHTML=opciones(previous);$('#bod-bomba').innerHTML=opciones(bodega||sel);
  if(!draftRestored){setReportTag($('#mant-bomba').value,true);draftRestored=true;}else if(previous!==reportTag)setReportTag($('#mant-bomba').value);else pintarElegida('mant-bomba');
  if($('#bod-bomba').value)elegirBodega();storageMode();
  if (seccion === 'historial') pintarHistorial();
  if (seccion === 'pendientes') pintarPendientes();
 }
 document.addEventListener('vocatus:listo', alCargar);
 // El visor puede terminar de cargar antes o después que este módulo: se espera a tener bombas.
 (function esperar(intentos = 0) { if (window.vocatus?.pumps?.length) alCargar(); else if (intentos < 80) setTimeout(() => esperar(intentos + 1), 250); })();
 mostrar(seccion);
}
