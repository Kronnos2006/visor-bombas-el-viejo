// App de cinco secciones — Áreas, Pendientes, Historial, Bodega y Mantenimiento — según los bocetos
// del 27-10-2026. Teléfono: 3D arriba, sección abajo. Computadora: secciones a la izquierda, 3D al
// centro y la sección a la derecha. Reutiliza el visor (window.vocatus): no duplica la lógica de
// selección, 3D, ficha ni guardado. Con ?vista=clasica se usa el visor anterior.
import {completeness, verificationOf} from './interfaz-core.js';
const movil = matchMedia('(max-width:900px)');
const SECCIONES = [
 {id: 'areas', nombre: 'Áreas', icono: '<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>'},
 {id: 'pendientes', nombre: 'Pendientes', icono: '<path d="M9 3h6v3H9z"/><path d="M9 4.5H6V21h12V4.5h-3"/><path d="M9 12.5l2 2 4-4"/>'},
 {id: 'historial', nombre: 'Historial', icono: '<path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="8.5"/>'},
 {id: 'bodega', nombre: 'Bodega', icono: '<path d="M3 8l9-5 9 5v10l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v10"/>'},
 {id: 'mantenimiento', nombre: 'Mantenimiento', icono: '<path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>'},
];
const AREAS = {tanques: 'Sector de tanques', torre: 'Torre de destilación'};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const hoy = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const leer = k => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };
const icono = (paths, tam = 22) => `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const clasica = new URLSearchParams(location.search).get('vista') === 'clasica';
if (!clasica) iniciar();
// Cruzar el límite teléfono/computadora rehace la página para no mezclar las dos distribuciones.
if (!clasica) movil.addEventListener('change', () => location.reload());

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
 let pendientes = {repairs: [], sinFuncionar: [], writable: false};
 const leerPendientes = () => fetch('/api/pending').then(r => r.json()).then(r => { pendientes = r; enReparacion = new Map((r.repairs || []).map(x => [x.tag, x])); pintarFranja(); pintarRegreso(); if (seccion === 'pendientes') pintarPendientes(); }).catch(() => {});

 // ---------- Estructura ----------
 const titulo = document.createElement('div'); titulo.id = 'tel-titulo'; $('header')?.append(titulo);
 const franja = document.createElement('nav'); franja.id = 'tel-franja'; franja.setAttribute('aria-label', 'Bombas por código');
 $('#viewport')?.append(franja);
 const contenido = document.createElement('section'); contenido.id = 'tel-contenido';
 document.body.append(contenido);
 const barra = document.createElement('nav'); barra.id = 'tel-barra'; barra.setAttribute('aria-label', 'Secciones');
 barra.innerHTML = SECCIONES.map(s => `<button type="button" data-s="${s.id}">${icono(s.icono)}<span>${s.nombre}</span></button>`).join('');
 document.body.append(barra);
 const paneles = Object.fromEntries(SECCIONES.map(s => { const el = document.createElement('div'); el.className = 'tel-panel'; el.dataset.s = s.id; contenido.append(el); return [s.id, el]; }));
 const ficha = document.createElement('div'); ficha.className = 'tel-ficha'; ficha.hidden = true;
 ficha.innerHTML = '<button type="button" class="tel-volver"></button>';
 contenido.append(ficha);
 const inspector = $('.inspector'); if (inspector) ficha.append(inspector);

 // ---------- Áreas ----------
 paneles.areas.innerHTML = `<label class="tel-buscar">${icono('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', 20)}<input id="tel-buscar" type="search" placeholder="Buscar bomba (ej. B14)" autocomplete="off"></label>
  <h2 class="tel-sub">Áreas de la planta</h2><div id="tel-areas"></div>
  <h2 class="tel-sub">Herramientas</h2><div id="tel-herramientas"></div>`;
 const areaMenu = $('#area-menu'), camara = $('#camera-tools');
 if (areaMenu) $('#tel-areas').append(areaMenu);
 if (camara) $('#tel-herramientas').append(camara);
 $('#tel-buscar').oninput = pintarFranja;

 function bombas() { return (V()?.pumps || []).filter(p => p.tag); }
 function pintarFranja() {
  const q = ($('#tel-buscar')?.value || '').toUpperCase().replace(/[\s-]/g, '');
  const lista = bombas().filter(p => !q || (p.tag + (p.nombre || '') + (p.marca || '')).toUpperCase().replace(/[\s-]/g, '').includes(q));
  const actual = V()?.pump?.tag;
  franja.innerHTML = lista.map(p => `<button type="button" data-tag="${esc(p.tag)}" aria-pressed="${p.tag === actual}" class="${enReparacion.has(p.tag) ? 'en-rep' : ''}" title="${esc(p.nombre || '')}${enReparacion.has(p.tag) ? ' · En reparación' : ''}">${esc(p.tag)}</button>`).join('') || '<p>Sin resultados</p>';
  franja.querySelectorAll('[data-tag]').forEach(b => b.onclick = () => elegirBomba(b.dataset.tag));
 }
 function opciones(sel = '') {
  return '<option value="">Elegí la bomba…</option>' + bombas().map(p => `<option value="${esc(p.tag)}" ${p.tag === sel ? 'selected' : ''}>${esc(p.tag)} · ${esc(p.nombre || p.ubicacion || '')}</option>`).join('');
 }

 // ---------- Formulario de Mantenimiento (incluye si se llevan la bomba) ----------
 const campoBomba = id => `<div class="tel-campo"><label for="${id}">Equipo</label>
  <div class="tel-fila"><select id="${id}" required></select></div>
  <div class="tel-fila"><button type="button" class="tel-sec" data-elegir="${id}">${icono('<path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="5"/>', 18)} Elegir en el 3D</button>
  <button type="button" class="tel-sec" data-localizar="${id}">${icono('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 18)} Localizar</button></div></div>`;
 const pie = id => `<div class="tel-dos"><div class="tel-campo"><label for="${id}-autor">Responsable</label><input id="${id}-autor" required maxlength="100" autocomplete="name"></div>
  <div class="tel-campo"><label for="${id}-fecha">Fecha</label><input id="${id}-fecha" type="date" required></div></div>`;

 paneles.mantenimiento.innerHTML = `<form id="tel-mant" novalidate>${campoBomba('mant-bomba')}
  <div class="tel-campo"><label for="mant-problema">Problema</label><textarea id="mant-problema" rows="2" maxlength="600" placeholder="Qué falla o qué se hizo"></textarea></div>
  <div class="tel-campo"><span class="tel-etiqueta">Repuestos usados</span><div id="mant-repuestos"></div>
   <button type="button" class="tel-sec" id="mant-agregar">${icono('<path d="M12 5v14M5 12h14"/>', 18)} Agregar repuesto</button></div>
  <div class="tel-campo"><label for="mant-comentario">Comentario</label><textarea id="mant-comentario" rows="3" maxlength="3000"></textarea></div>
  <fieldset class="tel-campo tel-sino"><legend>¿El equipo quedó funcionando?</legend>
   <label><input type="radio" name="mant-funcional" value="si"> Sí</label><label><input type="radio" name="mant-funcional" value="no"> No</label></fieldset>
  <fieldset class="tel-campo tel-sino"><legend>¿Se la llevan de su lugar?</legend>
   <label><input type="radio" name="mant-retiro" value="si"> Sí</label><label><input type="radio" name="mant-retiro" value="no" checked> No</label>
   <p class="tel-nota">Si se la llevan, la ficha queda «En reparación» hasta que se registre que volvió.</p></fieldset>
  ${pie('mant')}<p class="tel-aviso" role="status" id="mant-aviso"></p>
  <button class="tel-primario" type="submit">Enviar</button></form>`;

 paneles.pendientes.innerHTML = `<p class="tel-intro">Lo que necesita atención. Tocá una bomba para abrir su ficha.</p><div id="pend-lista"><p class="tel-vacio">Cargando…</p></div>`;

 paneles.historial.innerHTML = `<p class="tel-intro">Tocá una bomba para ver su historial con la vista explosionada.</p><div id="hist-filtro" class="tel-chips"></div><div id="hist-tarjetas" class="tel-tarjetas"></div>`;

 paneles.bodega.innerHTML = `<p class="tel-intro">Elegí la bomba y armá el pedido de repuestos para bodega.</p>
  <div class="tel-campo"><label for="bod-bomba">Equipo</label><select id="bod-bomba"></select></div>
  <button type="button" class="tel-primario" id="bod-ir">Armar pedido</button>
  <h2 class="tel-sub">Otras herramientas</h2>
  <div class="tel-enlaces"><a href="/levantamiento.html">Actualizar datos de una bomba</a><a href="/avance.html">Avance del levantamiento</a><a href="/equipo.html">Mover o cambiar una bomba</a></div>`;
 $('#bod-ir').onclick = () => { const tag = $('#bod-bomba').value; location.href = '/solicitud.html' + (tag ? '?tag=' + encodeURIComponent(tag) : ''); };

 for (const id of ['mant']) { $(`#${id}-autor`).value = leer('vocatus-responsable'); $(`#${id}-fecha`).value = hoy(); $(`#${id}-autor`).onchange = e => guardar('vocatus-responsable', e.target.value.trim()); }
 const repuestoFila = () => { const d = document.createElement('div'); d.className = 'tel-repuesto'; d.innerHTML = '<input placeholder="Código de bodega" maxlength="60" aria-label="Código de bodega"><input placeholder="Nombre del repuesto" maxlength="120" aria-label="Nombre del repuesto"><button type="button" aria-label="Quitar este repuesto">×</button>'; d.querySelector('button').onclick = () => d.remove(); $('#mant-repuestos').append(d); };
 $('#mant-agregar').onclick = repuestoFila; repuestoFila();

 contenido.addEventListener('click', e => {
  const elegir = e.target.closest('[data-elegir]'), localizar = e.target.closest('[data-localizar]');
  if (elegir) { eligiendo = elegir.dataset.elegir; aviso('mant', 'Tocá la bomba en el 3D o en la franja de códigos.'); document.body.classList.add('tel-eligiendo'); }
  if (localizar) { const tag = $('#' + localizar.dataset.localizar).value; if (tag) { V()?.select(tag); setTimeout(() => V()?.locate(), 600); } }
 });
 function aviso(form, texto, tipo = '') { const el = $(`#${form}-aviso`); el.textContent = texto; el.dataset.tipo = tipo; }

 $('#tel-mant').onsubmit = async e => {
  e.preventDefault();
  const tag = $('#mant-bomba').value, problema = $('#mant-problema').value.trim(), comentario = $('#mant-comentario').value.trim();
  const retiro = document.querySelector('[name=mant-retiro]:checked')?.value === 'si';
  const operativo = document.querySelector('[name=mant-funcional]:checked')?.value || '', author = $('#mant-autor').value.trim(), date = $('#mant-fecha').value;
  const parts = [...document.querySelectorAll('.tel-repuesto')].map(r => [...r.querySelectorAll('input')].map(i => i.value.trim())).filter(([c, n]) => c || n).map(([c, n]) => [c && 'Código ' + c, n].filter(Boolean).join(' · ')).join('\n');
  const falta = [!tag && 'el equipo', !problema && 'el problema', !operativo && 'si quedó funcionando', !author && 'el responsable', !date && 'la fecha'].filter(Boolean);
  if (falta.length) return aviso('mant', 'Falta indicar ' + falta.join(', ') + '.', 'error');
  if (!V()?.writable) return aviso('mant', 'Este alojamiento no guarda en Obsidian. Usá el visor de la computadora de planta.', 'error');
  try {
   aviso('mant', 'Enviando…');
   await V().api('/api/maintenance', {tag, date, author, title: 'Mantenimiento: ' + problema.split('\n')[0].slice(0, 80), symptoms: problema, details: comentario || problema, parts, operativo});
   let texto = `Guardado en el historial de ${tag}.`;
   if (retiro && enReparacion.has(tag)) texto += ' Ya figuraba en reparación.';
   else if (retiro) {
    try { await V().api('/api/equipment', {action: 'repair', tag, reason: problema.split('\n')[0].slice(0, 300), report: comentario, author, date}); texto += ' Quedó «En reparación».'; }
    catch (err) { aviso('mant', texto + ' No se pudo marcar «En reparación»: ' + err.message, 'error'); leerPendientes(); return; }
   }
   aviso('mant', texto, 'ok'); leerPendientes(); if (V()?.pump?.tag === tag) V()?.select(tag);
   $('#mant-problema').value = ''; $('#mant-comentario').value = ''; $('#mant-repuestos').innerHTML = ''; repuestoFila();
   document.querySelectorAll('[name=mant-funcional]').forEach(r => r.checked = false);
   document.querySelector('[name=mant-retiro][value=no]').checked = true;
  } catch (err) { aviso('mant', err.message, 'error'); }
 };

 // ---------- Pendientes ----------
 function pintarPendientes() {
  const lista = $('#pend-lista'); if (!lista) return;
  const nombre = tag => esc(bombas().find(p => p.tag === tag)?.nombre || '');
  const item = (tag, linea, tab = 'ficha') => `<button type="button" class="tel-pend" data-tag="${esc(tag)}" data-tab="${tab}"><strong>${esc(tag)}</strong><span>${linea}</span></button>`;
  const grupo = (titulo, items, vacio, abierto = true) => `<details class="tel-grupo"${abierto ? ' open' : ''}><summary><span>${titulo}</span><b>${items.length}</b></summary>${items.length ? `<div class="tel-pends">${items.join('')}</div>` : `<p class="tel-vacio">${vacio}</p>`}</details>`;
  const fuera = (pendientes.repairs || []).map(r => item(r.tag, `Desde ${esc(r.desde || '—')} · ${esc(r.motivo)}`));
  const sinFun = (pendientes.sinFuncionar || []).map(r => item(r.tag, `Último mantenimiento ${esc(r.date)}${r.title ? ' · ' + esc(r.title) : ''}`, 'historial'));
  const incompletas = bombas().map(p => [p, completeness(p)]).filter(([, c]) => c.done < c.total).sort((a, b) => a[1].done / a[1].total - b[1].done / b[1].total).map(([p, c]) => item(p.tag, `${nombre(p.tag)} · Completos ${c.done}/${c.total}`));
  const sinVer = bombas().filter(p => !verificationOf(p).verified).map(p => { const v = verificationOf(p); return item(p.tag, `${nombre(p.tag)} · ${v.legacy ? 'Registro antiguo' : v.partial ? 'Verificación parcial' : 'Sin verificar'}`); });
  lista.innerHTML = (pendientes.writable ? '' : '<p class="tel-vacio">Este alojamiento no guarda reparaciones ni informes; solo se muestran las fichas.</p>')
   + grupo('Fuera de su lugar', fuera, 'Ninguna bomba figura fuera de su lugar.')
   + grupo('Quedaron sin funcionar', sinFun, 'Ningún último mantenimiento dice que el equipo quedó sin funcionar.')
   + grupo('Fichas incompletas', incompletas, 'Todas las fichas están completas.', false)
   + grupo('Sin verificar en campo', sinVer, 'Todas las fichas están verificadas.', false);
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
 function pintarHistorial() {
  const areas = [...new Set(bombas().map(p => p.areaId).filter(Boolean))];
  $('#hist-filtro').innerHTML = ['', ...areas].map(a => `<button type="button" data-a="${esc(a)}" aria-pressed="${a === filtroHist}">${esc(a ? AREAS[a] || a : 'Todas')}</button>`).join('');
  $('#hist-filtro').querySelectorAll('button').forEach(b => b.onclick = () => { filtroHist = b.dataset.a; pintarHistorial(); });
  $('#hist-tarjetas').innerHTML = bombas().filter(p => !filtroHist || p.areaId === filtroHist).map(p => `<button type="button" class="tel-tarjeta" data-tag="${esc(p.tag)}"><strong>${esc(p.tag)}</strong><span>${esc(p.nombre || p.ubicacion || '')}</span></button>`).join('');
  $('#hist-tarjetas').querySelectorAll('[data-tag]').forEach(b => b.onclick = () => abrirFicha(b.dataset.tag, 'historial'));
 }

 // ---------- Ficha dentro de la app ----------
 function abrirFicha(tag, pestana = 'ficha') {
  viendoFicha = true; ficha.dataset.origen = seccion; ficha.hidden = false;
  Object.values(paneles).forEach(p => p.hidden = true);
  ficha.querySelector('.tel-volver').textContent = '← ' + SECCIONES.find(s => s.id === seccion).nombre;
  if (V()?.pump?.tag !== tag) V()?.select(tag);
  const aplicar = () => { V()?.tab(pestana); if (pestana === 'historial') V()?.explode(100); };
  setTimeout(aplicar, 700); setTimeout(aplicar, 1600); setTimeout(pintarRegreso, 900);
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 ficha.querySelector('.tel-volver').onclick = () => { V()?.explode(0); V()?.back(); cerrarFicha(); };
 function cerrarFicha() { viendoFicha = false; ficha.hidden = true; mostrar(seccion); }

 function elegirBomba(tag) {
  if (eligiendo) {
   const sel = $('#' + eligiendo); sel.value = tag; aviso('mant', `Equipo elegido: ${tag}.`, 'ok');
   eligiendo = null; document.body.classList.remove('tel-eligiendo'); V()?.select(tag); return;
  }
  if (seccion === 'areas') abrirFicha(tag); else V()?.select(tag);
 }
 // Una bomba tocada en el 3D llega por este aviso del visor.
 document.addEventListener('vocatus:bomba', e => {
  pintarFranja();
  if (eligiendo) { const tag = e.detail, campo = eligiendo; eligiendo = null; document.body.classList.remove('tel-eligiendo'); $('#' + campo).value = tag; aviso('mant', `Equipo elegido: ${tag}.`, 'ok'); return; }
  if (seccion === 'areas' && !viendoFicha) abrirFicha(e.detail);
  pintarRegreso();
  for (const id of ['mant-bomba', 'bod-bomba']) if (!$('#' + id).value) $('#' + id).value = e.detail;
 });

 // ---------- Navegación ----------
 function mostrar(id) {
  seccion = id; viendoFicha = false; ficha.hidden = true;
  for (const [k, p] of Object.entries(paneles)) p.hidden = k !== id;
  barra.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', b.dataset.s === id ? 'page' : 'false'));
  titulo.textContent = SECCIONES.find(s => s.id === id).nombre;
  document.body.dataset.telSeccion = id;
  history.replaceState(null, '', '?s=' + id + location.hash);
  if (id === 'pendientes') { pintarPendientes(); leerPendientes(); }
  if (id === 'historial') pintarHistorial();
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 barra.querySelectorAll('button').forEach(b => b.onclick = () => { if (viendoFicha) { V()?.explode(0); V()?.back(); } mostrar(b.dataset.s); });

 function alCargar() {
  pintarFranja(); leerPendientes();
  const sel = V()?.pump?.tag || '';
  for (const id of ['mant-bomba', 'bod-bomba']) $('#' + id).innerHTML = opciones(sel);
  if (seccion === 'historial') pintarHistorial();
  if (seccion === 'pendientes') pintarPendientes();
 }
 document.addEventListener('vocatus:listo', alCargar);
 // El visor puede terminar de cargar antes o después que este módulo: se espera a tener bombas.
 (function esperar(intentos = 0) { if (window.vocatus?.pumps?.length) alCargar(); else if (intentos < 80) setTimeout(() => esperar(intentos + 1), 250); })();
 mostrar(seccion);
}
