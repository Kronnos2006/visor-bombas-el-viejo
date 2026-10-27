// App de teléfono (≤ 900 px): 3D arriba y cinco secciones abajo — Áreas, Reparación, Historial,
// Bodega y Mantenimiento — según los bocetos del 27-10-2026. Reutiliza el visor (window.vocatus):
// no duplica la lógica de selección, 3D, ficha ni guardado. En computadora no hace nada.
const movil = matchMedia('(max-width:900px)');
const SECCIONES = [
 {id: 'areas', nombre: 'Áreas', icono: '<path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6"/>'},
 {id: 'reparacion', nombre: 'Reparación', icono: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'},
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

if (movil.matches) iniciar();
// Cruzar el límite teléfono/computadora rehace la página para no mezclar las dos distribuciones.
movil.addEventListener('change', () => location.reload());

function iniciar() {
 document.body.classList.add('app-tel');
 const $ = s => document.querySelector(s);
 const V = () => window.vocatus;
 let seccion = new URLSearchParams(location.search).get('s') || 'areas';
 if (!SECCIONES.some(s => s.id === seccion)) seccion = 'areas';
 let eligiendo = null; // campo que espera una bomba tocada en el 3D o en la franja
 let viendoFicha = false;
 let enReparacion = new Set();
 const leerReparaciones = () => fetch('/api/repairs').then(r => r.json()).then(r => { enReparacion = new Set((r.repairs || []).map(x => x.tag)); pintarFranja(); }).catch(() => {});

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

 // ---------- Formularios (Mantenimiento y Reparación) ----------
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
  ${pie('mant')}<p class="tel-aviso" role="status" id="mant-aviso"></p>
  <button class="tel-primario" type="submit">Enviar</button></form>`;

 paneles.reparacion.innerHTML = `<p class="tel-intro">Para cuando se llevan una bomba de su lugar. Queda «En reparación» hasta registrar que volvió.</p>
  <form id="tel-rep" novalidate>${campoBomba('rep-bomba')}
  <div class="tel-campo"><label for="rep-motivo">Por qué se la llevan</label><input id="rep-motivo" maxlength="300" required></div>
  <div class="tel-campo"><label for="rep-reporte">Reporte</label><textarea id="rep-reporte" rows="4" maxlength="3000" placeholder="Estado en que sale, a dónde va, qué lleva"></textarea></div>
  ${pie('rep')}<p class="tel-aviso" role="status" id="rep-aviso"></p>
  <button class="tel-primario" type="submit">Registrar salida</button></form>
  <h2 class="tel-sub">Fuera de su lugar</h2><div id="rep-lista"><p class="tel-vacio">Cargando…</p></div>`;

 paneles.historial.innerHTML = `<p class="tel-intro">Tocá una bomba para ver su historial con la vista explosionada.</p><div id="hist-filtro" class="tel-chips"></div><div id="hist-tarjetas" class="tel-tarjetas"></div>`;

 paneles.bodega.innerHTML = `<p class="tel-intro">Elegí la bomba y armá el pedido de repuestos para bodega.</p>
  <div class="tel-campo"><label for="bod-bomba">Equipo</label><select id="bod-bomba"></select></div>
  <button type="button" class="tel-primario" id="bod-ir">Armar pedido</button>
  <h2 class="tel-sub">Otras herramientas</h2>
  <div class="tel-enlaces"><a href="/levantamiento.html">Actualizar datos de una bomba</a><a href="/avance.html">Avance del levantamiento</a><a href="/equipo.html">Mover o cambiar una bomba</a></div>`;
 $('#bod-ir').onclick = () => { const tag = $('#bod-bomba').value; location.href = '/solicitud.html' + (tag ? '?tag=' + encodeURIComponent(tag) : ''); };

 for (const id of ['mant', 'rep']) { $(`#${id}-autor`).value = leer('vocatus-responsable'); $(`#${id}-fecha`).value = hoy(); $(`#${id}-autor`).onchange = e => guardar('vocatus-responsable', e.target.value.trim()); }
 const repuestoFila = () => { const d = document.createElement('div'); d.className = 'tel-repuesto'; d.innerHTML = '<input placeholder="Código de bodega" maxlength="60" aria-label="Código de bodega"><input placeholder="Nombre del repuesto" maxlength="120" aria-label="Nombre del repuesto"><button type="button" aria-label="Quitar este repuesto">×</button>'; d.querySelector('button').onclick = () => d.remove(); $('#mant-repuestos').append(d); };
 $('#mant-agregar').onclick = repuestoFila; repuestoFila();

 contenido.addEventListener('click', e => {
  const elegir = e.target.closest('[data-elegir]'), localizar = e.target.closest('[data-localizar]');
  if (elegir) { eligiendo = elegir.dataset.elegir; aviso(eligiendo.startsWith('mant') ? 'mant' : 'rep', 'Tocá la bomba en el 3D o en la franja de códigos.'); document.body.classList.add('tel-eligiendo'); }
  if (localizar) { const tag = $('#' + localizar.dataset.localizar).value; if (tag) { V()?.select(tag); setTimeout(() => V()?.locate(), 600); } }
 });
 function aviso(form, texto, tipo = '') { const el = $(`#${form}-aviso`); el.textContent = texto; el.dataset.tipo = tipo; }

 $('#tel-mant').onsubmit = async e => {
  e.preventDefault();
  const tag = $('#mant-bomba').value, problema = $('#mant-problema').value.trim(), comentario = $('#mant-comentario').value.trim();
  const operativo = document.querySelector('[name=mant-funcional]:checked')?.value || '', author = $('#mant-autor').value.trim(), date = $('#mant-fecha').value;
  const parts = [...document.querySelectorAll('.tel-repuesto')].map(r => [...r.querySelectorAll('input')].map(i => i.value.trim())).filter(([c, n]) => c || n).map(([c, n]) => [c && 'Código ' + c, n].filter(Boolean).join(' · ')).join('\n');
  const falta = [!tag && 'el equipo', !problema && 'el problema', !operativo && 'si quedó funcionando', !author && 'el responsable', !date && 'la fecha'].filter(Boolean);
  if (falta.length) return aviso('mant', 'Falta indicar ' + falta.join(', ') + '.', 'error');
  if (!V()?.writable) return aviso('mant', 'Este alojamiento no guarda en Obsidian. Usá el visor de la computadora de planta.', 'error');
  try {
   aviso('mant', 'Enviando…');
   await V().api('/api/maintenance', {tag, date, author, title: 'Mantenimiento: ' + problema.split('\n')[0].slice(0, 80), symptoms: problema, details: comentario || problema, parts, operativo});
   aviso('mant', `Guardado en el historial de ${tag}.`, 'ok');
   $('#mant-problema').value = ''; $('#mant-comentario').value = ''; $('#mant-repuestos').innerHTML = ''; repuestoFila();
   document.querySelectorAll('[name=mant-funcional]').forEach(r => r.checked = false);
  } catch (err) { aviso('mant', err.message, 'error'); }
 };

 $('#tel-rep').onsubmit = async e => {
  e.preventDefault();
  const tag = $('#rep-bomba').value, reason = $('#rep-motivo').value.trim(), report = $('#rep-reporte').value.trim(), author = $('#rep-autor').value.trim(), date = $('#rep-fecha').value;
  const falta = [!tag && 'el equipo', !reason && 'por qué se la llevan', !author && 'el responsable', !date && 'la fecha'].filter(Boolean);
  if (falta.length) return aviso('rep', 'Falta indicar ' + falta.join(', ') + '.', 'error');
  if (!V()?.writable) return aviso('rep', 'Este alojamiento no guarda en Obsidian. Usá el visor de la computadora de planta.', 'error');
  try {
   aviso('rep', 'Registrando…');
   await V().api('/api/equipment', {action: 'repair', tag, reason, report, author, date});
   aviso('rep', `${tag} quedó registrada en reparación.`, 'ok');
   $('#rep-motivo').value = ''; $('#rep-reporte').value = '';
   cargarReparaciones();
  } catch (err) { aviso('rep', err.message, 'error'); }
 };

 async function cargarReparaciones() {
  const lista = $('#rep-lista');
  try {
   const r = await fetch('/api/repairs').then(x => x.json());
   if (!r.writable) { lista.innerHTML = '<p class="tel-vacio">Este alojamiento no guarda reparaciones.</p>'; return; }
   enReparacion = new Set(r.repairs.map(x => x.tag)); pintarFranja();
   lista.innerHTML = r.repairs.length ? r.repairs.map(x => `<article class="tel-rep" data-tag="${esc(x.tag)}"><div><strong>${esc(x.tag)}</strong><span>Desde ${esc(x.desde || '—')} · ${esc(x.motivo)}</span></div>
     <details><summary>Volvió a su lugar</summary><div class="tel-campo"><label>Fecha de regreso<input type="date" value="${hoy()}"></label></div><div class="tel-campo"><label>Nota (opcional)<input maxlength="300"></label></div><button type="button" class="tel-primario">Registrar regreso</button><p class="tel-aviso" role="status"></p></details></article>`).join('')
    : '<p class="tel-vacio">Ninguna bomba figura fuera de su lugar.</p>';
   lista.querySelectorAll('.tel-rep .tel-primario').forEach(b => b.onclick = async () => {
    const art = b.closest('.tel-rep'), [fecha, nota] = art.querySelectorAll('input'), out = art.querySelector('.tel-aviso');
    const author = $('#rep-autor').value.trim();
    if (!author) { out.textContent = 'Escribí el responsable en el formulario de arriba.'; out.dataset.tipo = 'error'; return; }
    try { await V().api('/api/equipment', {action: 'repair-return', tag: art.dataset.tag, date: fecha.value, reason: nota.value.trim(), author}); cargarReparaciones(); }
    catch (err) { out.textContent = err.message; out.dataset.tipo = 'error'; }
   });
  } catch { lista.innerHTML = '<p class="tel-vacio">No se pudo leer la lista.</p>'; }
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
  setTimeout(aplicar, 700); setTimeout(aplicar, 1600);
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 ficha.querySelector('.tel-volver').onclick = () => { V()?.explode(0); V()?.back(); cerrarFicha(); };
 function cerrarFicha() { viendoFicha = false; ficha.hidden = true; mostrar(seccion); }

 function elegirBomba(tag) {
  if (eligiendo) {
   const sel = $('#' + eligiendo); sel.value = tag; aviso(eligiendo.startsWith('mant') ? 'mant' : 'rep', `Equipo elegido: ${tag}.`, 'ok');
   eligiendo = null; document.body.classList.remove('tel-eligiendo'); V()?.select(tag); return;
  }
  if (seccion === 'areas') abrirFicha(tag); else V()?.select(tag);
 }
 // Una bomba tocada en el 3D llega por este aviso del visor.
 document.addEventListener('vocatus:bomba', e => {
  pintarFranja();
  if (eligiendo) { const tag = e.detail, campo = eligiendo; eligiendo = null; document.body.classList.remove('tel-eligiendo'); $('#' + campo).value = tag; aviso(campo.startsWith('mant') ? 'mant' : 'rep', `Equipo elegido: ${tag}.`, 'ok'); return; }
  if (seccion === 'areas' && !viendoFicha) abrirFicha(e.detail);
  for (const id of ['mant-bomba', 'rep-bomba', 'bod-bomba']) if (!$('#' + id).value) $('#' + id).value = e.detail;
 });

 // ---------- Navegación ----------
 function mostrar(id) {
  seccion = id; viendoFicha = false; ficha.hidden = true;
  for (const [k, p] of Object.entries(paneles)) p.hidden = k !== id;
  barra.querySelectorAll('button').forEach(b => b.setAttribute('aria-current', b.dataset.s === id ? 'page' : 'false'));
  titulo.textContent = SECCIONES.find(s => s.id === id).nombre;
  document.body.dataset.telSeccion = id;
  history.replaceState(null, '', '?s=' + id + location.hash);
  if (id === 'reparacion') cargarReparaciones();
  if (id === 'historial') pintarHistorial();
  contenido.scrollTop = 0; window.dispatchEvent(new Event('resize'));
 }
 barra.querySelectorAll('button').forEach(b => b.onclick = () => { if (viendoFicha) { V()?.explode(0); V()?.back(); } mostrar(b.dataset.s); });

 function alCargar() {
  pintarFranja(); leerReparaciones();
  const sel = V()?.pump?.tag || '';
  for (const id of ['mant-bomba', 'rep-bomba', 'bod-bomba']) $('#' + id).innerHTML = opciones(sel);
  if (seccion === 'historial') pintarHistorial();
 }
 document.addEventListener('vocatus:listo', alCargar);
 // El visor puede terminar de cargar antes o después que este módulo: se espera a tener bombas.
 (function esperar(intentos = 0) { if (window.vocatus?.pumps?.length) alCargar(); else if (intentos < 80) setTimeout(() => esperar(intentos + 1), 250); })();
 mostrar(seccion);
}
