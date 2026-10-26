import {tankSpecs} from './sector-fotos.js';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};
const known = v => v != null && String(v).trim() !== '' && !/^(por confirmar|sin dato)/i.test(String(v).trim());
const deg = r => Math.round(((r * 180 / Math.PI) % 360 + 360) % 360);
// Cada área tiene su mapa: sector de tanques o torre de destilación (ejes 1–5 × A–E, Nivel 1).
const AREA = p => p?.areaId === 'torre' ? 'torre' : 'tanques';
const LIM = {tanques: {x0: -15.5, x1: 15.5, z0: -14, z1: 12, vb: '-17.4 -14.5 34.8 27', w: 1.4, h: 2.8}, torre: {x0: -1, x1: 16.5, z0: -1, z1: 23, vb: '-4 -3.2 23 28.4', w: 1, h: 2}};
const TX = {1: 0, 2: 5.5, 3: 6.76, 4: 12.7, 5: 15.4}, TZ = {A: 0, B: 5.93, C: 11.9, D: 16.9, E: 21.9};
let pumps = [], token = '', writable = false, replaceFields = [], tag = '', action = '', target = null, swapWith = '';

function pick(t) {
 tag = t; swapWith = ''; const p = pumps.find(x => x.tag === tag);
 document.querySelectorAll('#pick button').forEach(b => b.classList.toggle('active', b.dataset.tag === tag));
 target = p ? {x: p.x, z: p.z, rotation: deg(p.rotation)} : null;
 $('#step2').hidden = !p; if (!p) return;
 history.replaceState(null, '', '?tag=' + tag);
 $('#old-name').textContent = `${tag} · ${known(p.marca) ? p.marca : 'Marca sin dato'} ${known(p.modelo) ? p.modelo : ''}`;
 $('#old-serie').textContent = p.serie ? 'Serie ' + p.serie : 'Serie sin registrar';
 $('#new-fields').innerHTML = replaceFields.filter(f => f.B).map(f => `<label>${esc(f.label)}${f.id === 'marca' || f.id === 'modelo' ? ' *' : ''}<input data-f="${f.id}" maxlength="200" ${f.number ? 'inputmode="decimal"' : ''} ${f.id === 'marca' || f.id === 'modelo' ? 'required' : ''}></label>`).join('');
 $('#new-fields').oninput = () => { const v = id => $(`[data-f="${id}"]`)?.value.trim(); $('#new-name').textContent = [v('marca'), v('modelo')].filter(Boolean).join(' ') || 'Bomba nueva'; };
 if (action) choose(action);
}
function choose(a) {
 action = a;
 document.querySelectorAll('.choice button').forEach(b => b.classList.toggle('active', b.dataset.action === a));
 $('#move').hidden = a !== 'move'; $('#replace').hidden = a !== 'replace'; $('#who').hidden = false; $('#result').innerHTML = '';
 $('#save').textContent = a === 'move' ? 'Guardar nueva posición' : 'Guardar bomba nueva';
 if (a === 'move') drawMap();
 $(a === 'move' ? '#move' : '#replace').scrollIntoView({behavior: 'smooth', block: 'start'});
}
// Mapa del sector visto desde arriba: mismo sistema de coordenadas que el visor 3D.
function drawMap() {
 const svg = $('#map'), me0 = pumps.find(p => p.tag === tag), area = AREA(me0), L = LIM[area];
 svg.setAttribute('viewBox', L.vb); svg.setAttribute('aria-label', area === 'torre' ? 'Mapa de la torre de destilación, Nivel 1' : 'Mapa del sector');
 const tanks = tankSpecs.map(([x, z, r]) => `<circle cx="${x}" cy="${z}" r="${r}" class="tank"/>`).join('');
 const shape = (p, x, z, rot, cls) => `<g class="${cls}" data-tag="${p.tag}" transform="translate(${x} ${z}) rotate(${-rot})"><rect x="${-L.w / 2}" y="${-L.h / 2}" width="${L.w}" height="${L.h}" rx=".25"/><text y=".35" transform="rotate(${rot})">${p.tag}</text></g>`;
 const others = pumps.filter(p => p.tag !== tag && p.tag !== swapWith && AREA(p) === area).map(p => shape(p, p.x, p.z, deg(p.rotation), 'pump other')).join('');
 const partner = pumps.find(p => p.tag === swapWith);
 const me = pumps.find(p => p.tag === tag);
 const swapped = partner ? shape(partner, me.x, me.z, deg(me.rotation), 'pump partner') : '';
 const fondo = area === 'torre' ? `<rect x="-1" y="-1" width="17.5" height="24" class="slab"/>${Object.entries(TX).map(([n, x]) => `<line x1="${x}" y1="-1" x2="${x}" y2="23" class="axis"/><text x="${x}" y="-1.8" class="side">${n}</text>`).join('')}${Object.entries(TZ).map(([n, z]) => `<line x1="-1" y1="${z}" x2="16.5" y2="${z}" class="axis"/><text x="-2.4" y="${z + .35}" class="side">${n}</text>`).join('')}<text x="7.7" y="24.6" class="side">TORRE · NIVEL 1</text>` : null;
 svg.innerHTML = fondo ? `${fondo}${others}${swapped}<line x1="${me.x}" y1="${me.z}" x2="${target.x}" y2="${target.z}" class="trail"/><circle cx="${me.x}" cy="${me.z}" r=".35" class="origin"/>${shape(me, target.x, target.z, target.rotation, 'pump mine')}` : `<rect x="-16" y="-14.5" width="32" height="27" class="slab"/><rect x="-12" y="-9" width="24" height="11.35" class="wall"/>${tanks}<text x="0" y="11.6" class="side">FRONTAL</text><text x="0" y="-12.9" class="side">TRASERO</text><text x="-16.6" y="-3.3" class="side" transform="rotate(-90 -16.6 -3.3)">IZQUIERDO</text><text x="16.6" y="-3.3" class="side" transform="rotate(90 16.6 -3.3)">DERECHO</text>${others}${swapped}<line x1="${me.x}" y1="${me.z}" x2="${target.x}" y2="${target.z}" class="trail"/><circle cx="${me.x}" cy="${me.z}" r=".35" class="origin"/>${shape(me, target.x, target.z, target.rotation, 'pump mine')}`;
 $('#coords').textContent = swapWith ? `Cambia de lugar con ${swapWith}` : `x ${target.x.toFixed(2)} · z ${target.z.toFixed(2)} · ${target.rotation}°`;
 $('#swap-box').innerHTML = swapWith ? `<div class="msg ok">${esc(tag)} y ${esc(swapWith)} intercambian lugares. <button type="button" id="no-swap">Deshacer</button></div>` : '';
 $('#no-swap')?.addEventListener('click', () => { swapWith = ''; target = {x: me.x, z: me.z, rotation: deg(me.rotation)}; drawMap(); });
 svg.querySelectorAll('.other').forEach(g => g.onclick = () => { swapWith = g.dataset.tag; const o = pumps.find(p => p.tag === swapWith); target = {x: o.x, z: o.z, rotation: deg(o.rotation)}; drawMap(); });
 const mine = svg.querySelector('.mine');
 mine.onpointerdown = e => {
  e.preventDefault(); mine.setPointerCapture(e.pointerId); swapWith = '';
  const move = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse());
   target.x = Math.max(L.x0, Math.min(L.x1, Math.round(p.x * 4) / 4)); target.z = Math.max(L.z0, Math.min(L.z1, Math.round(p.y * 4) / 4));
   mine.setAttribute('transform', `translate(${target.x} ${target.z}) rotate(${-target.rotation})`); svg.querySelector('.trail').setAttribute('x2', target.x); svg.querySelector('.trail').setAttribute('y2', target.z);
   $('#coords').textContent = `x ${target.x.toFixed(2)} · z ${target.z.toFixed(2)} · ${target.rotation}°`; };
  const up = () => { mine.removeEventListener('pointermove', move); drawMap(); };
  mine.addEventListener('pointermove', move); mine.addEventListener('pointerup', up, {once: true});
 };
}
const rotate = d => { swapWith = ''; target.rotation = ((target.rotation + d) % 360 + 360) % 360; drawMap(); };
$('#rot-left').onclick = () => rotate(90); $('#rot-right').onclick = () => rotate(-90);
$('#undo').onclick = () => { const p = pumps.find(x => x.tag === tag); swapWith = ''; target = {x: p.x, z: p.z, rotation: deg(p.rotation)}; drawMap(); };
document.querySelectorAll('.choice button').forEach(b => b.onclick = () => choose(b.dataset.action));
$('#save').onclick = async () => {
 const date = $('#date').value, author = $('#author').value.trim(), reason = $('#reason').value.trim();
 const fail = m => { $('#result').innerHTML = `<div class="msg err">${esc(m)}</div>`; };
 if (!writable) return fail('Mover o reemplazar solo funciona en el visor de la computadora (Iniciar visor.cmd), porque escribe en Obsidian.');
 if (!date || !author) return fail('Completá fecha y responsable.');
 let body;
 if (action === 'move') {
  const p = pumps.find(x => x.tag === tag);
  if (!swapWith && target.x === p.x && target.z === p.z && target.rotation === deg(p.rotation)) return fail('La bomba no se movió: arrastrala o girala en el mapa.');
  body = swapWith ? {action: 'swap', tag, other: swapWith} : {action: 'move', tag, x: target.x, z: target.z, rotation: target.rotation};
 } else {
  const fields = Object.fromEntries([...document.querySelectorAll('[data-f]')].map(i => [i.dataset.f, i.value.trim()]).filter(([, v]) => v));
  if (!fields.marca || !fields.modelo) return fail('Escribí al menos la marca y el modelo de la bomba nueva.');
  body = {action: 'replace', tag, fields, clearSeal: $('#clear-seal').checked};
 }
 store.set('vocatus-responsable', author);
 $('#save').disabled = true;
 try {
  const r = await fetch('/api/equipment', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Local-Token': token}, body: JSON.stringify({...body, date, author, reason})});
  const out = await r.json().catch(() => ({})); if (!r.ok) throw new Error(out.error || `HTTP ${r.status}`);
  const done = `<div class="msg ok">Listo: ${action === 'move' ? (swapWith ? `${esc(tag)} y ${esc(swapWith)} cambiaron de lugar` : `${esc(tag)} quedó en su nueva posición`) : `${esc(tag)} ahora es ${esc(body.fields.marca)} ${esc(body.fields.modelo)}. El expediente completo de la bomba retirada quedó archivado en <code>${esc(out.archive || 'la ficha')}</code>; caudal, motor, rodamientos, acople y fotos de la nueva quedan por levantar`}.${out.backup || out.backups ? `<br><small>Respaldo de la ficha antes del cambio: <code>${esc([].concat(out.backup || out.backups).join(', '))}</code></small>` : ''}<br><a href="/#${encodeURIComponent(tag)}">Ver en el visor 3D →</a>${action === 'replace' && body.clearSeal ? ` · <a href="/levantamiento.html?tag=${encodeURIComponent(tag)}">Levantar sello y o-rings →</a>` : ''}</div>`;
  await load(); pick(tag); $('#result').innerHTML = done;
 } catch (e) { fail(e.message); } finally { $('#save').disabled = false; }
};
async function load() {
 const [b, p] = await Promise.all([fetch('/api/bootstrap').then(r => r.json()), fetch('/api/progress').then(r => r.json())]);
 pumps = b.sectorPumps || []; token = b.token; writable = !!b.maintenanceWritable; replaceFields = p.replaceFields || [];
 $('#pick').innerHTML = pumps.map(p => `<button type="button" data-tag="${esc(p.tag)}"><b>${esc(p.tag)}</b><span>${AREA(p) === 'torre' ? 'Torre · ' : ''}${esc(p.nombre || '')}</span>${p.movido ? '<i>movida</i>' : ''}</button>`).join('');
 $('#pick').querySelectorAll('button').forEach(b => b.onclick = () => pick(b.dataset.tag));
 $('#mode').innerHTML = writable ? '' : '<div class="msg warn">Estás en la versión en la nube: podés ver el mapa, pero para guardar abrí el visor en la computadora.</div>';
}
try { await load(); } catch (e) { $('#mode').innerHTML = `<div class="msg err">No se pudo cargar la lista de bombas: ${esc(e.message)}</div>`; }
const d = new Date(); $('#date').value = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
$('#author').value = store.get('vocatus-responsable') || '';
const start = new URLSearchParams(location.search).get('tag'); if (start && pumps.some(p => p.tag === start.toUpperCase())) pick(start.toUpperCase());
