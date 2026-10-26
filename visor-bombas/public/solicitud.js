import {known,joinDetails as join,cleanLegacyCart} from './request-core.js';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}};

const oldCart=store.get('vocatus-solicitud')||[], cleaned=cleanLegacyCart(oldCart);
let token = '', demo = false, cart = cleaned.items, options = [];
if(cleaned.changed){if(!store.get('vocatus-solicitud-antes-limpieza'))store.set('vocatus-solicitud-antes-limpieza',oldCart);store.set('vocatus-solicitud',cart);$('#cart-migration').textContent='Se quitaron '+cleaned.changed+' textos «false» del carrito. Se conservó una copia en este navegador. Revisá los PDF ya emitidos: no se modifican automáticamente.';}

// Convierte la ficha (P-xxxx o Bxx) en líneas de repuesto. Solo lo que está documentado.
function partsOf(p) {
 const d = p.data, raw = d.documental || d, out = [];
 if (d.seal) { // Bxx: datos normalizados por el servidor
  const s = d.seal;
  if (known(s.tipo) || known(s.codigo)) out.push({pieza: 'Sello mecánico', detalle: join(s.tipo, known(s.diametro) && 'eje ' + s.diametro, known(s.caras) && 'caras ' + s.caras, known(s.elastomero) && s.elastomero), codigo: known(s.codigo) ? s.codigo : ''});
  for (const [lado, cod] of [['delantero', d.rodamientos?.delantero], ['trasero', d.rodamientos?.trasero]]) if (known(cod)) out.push({pieza: 'Rodamiento ' + lado, detalle: join(cod, known(d.rodamientos?.conjunto) && 'pertenece a ' + d.rodamientos.conjunto), codigo: cod});
  if (known(d.acople)) out.push({pieza: 'Elemento de acople', detalle: d.acople, codigo: ''});
 } else {
  if (known(d.tipo_sellado) || known(d.sello_modelo)) out.push({pieza: 'Sello mecánico', detalle: join(d.tipo_sellado, d.sello_marca, d.sello_modelo, known(d.sello_diametro_mm) && 'eje ' + d.sello_diametro_mm + ' mm', d.sello_elastomero), codigo: d.sello_codigo || d.codigo_bodega || ''});
 }
 if (known(raw.empaque_seccion_mm) || known(raw.empaque_tipo) || known(raw.empaque_declarado)) out.push({pieza: 'Empaquetadura', detalle: join(raw.empaque_tipo || raw.empaque_declarado, known(raw.empaque_seccion_mm) && 'sección ' + raw.empaque_seccion_mm + ' mm', known(raw.empaque_anillos) && raw.empaque_anillos + ' anillos'), codigo: '', cantidad: Number(raw.empaque_anillos) || 1});
 for (const o of Array.isArray(d.orings) ? d.orings : []) out.push({pieza: 'O-ring', detalle: join(o.posicion, o.medida, o.material), codigo: o.codigo || '', cantidad: Number(o.cantidad) || 1});
 return out.map(i => ({...i, tag: p.tag, cantidad: i.cantidad || 1}));
}
function saveCart() { store.set('vocatus-solicitud', cart); renderCart(); }
function add(item) { cart.push({...item, id: crypto.randomUUID?.() || String(Date.now() + Math.random())}); saveCart(); $('#result').innerHTML = `<div class="msg ok">Agregado: ${esc(item.pieza)} (${esc(item.tag || 'sin equipo')}).</div>`; }
function renderCart() {
 const largos = cart.filter(i => String(i.detalle || '').length > 160 || String(i.codigo || '').length > 60 || String(i.pieza || '').length > 80).length;
 $('#cart-count').textContent = cart.length ? `· ${cart.length} de 40 línea(s)` : '';
 if (cart.length > 40 || largos) $('#result').innerHTML = `<div class="msg warn">${cart.length > 40 ? `La solicitud tiene ${cart.length} líneas y el máximo es 40: dividila en dos. ` : ''}${largos ? `${largos} línea(s) tienen un texto demasiado largo (pieza 80, detalle 160, código 60 caracteres): editalas antes de generar el PDF.` : ''}</div>`;
 $('#cart').innerHTML = cart.length ? cart.map(i => `<div class="cart-line"><p><strong>${esc(i.tag ? i.tag + ' · ' : '')}${esc(i.pieza)}</strong><br><small class="muted">${esc(i.detalle || '—')}${i.codigo ? ' · código ' + esc(i.codigo) : ' · <span style="color:#f5c27f">sin código</span>'}</small></p><input type="number" min="1" max="999" value="${i.cantidad}" data-id="${i.id}" aria-label="Cantidad"><button type="button" data-del="${i.id}" aria-label="Quitar">✕</button></div>`).join('') : '<p class="muted">Todavía no agregaste repuestos.</p>';
 $('#cart').querySelectorAll('input').forEach(el => el.onchange = () => { const i = cart.find(x => x.id === el.dataset.id); i.cantidad = Math.max(1, Math.min(999, Number.parseInt(el.value, 10) || 1)); saveCart(); });
 $('#cart').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { cart = cart.filter(x => x.id !== b.dataset.del); saveCart(); });
}
async function choose(tag) {
 $('#suggest').innerHTML = tag ? '<p class="muted">Leyendo ficha…</p>' : '';
 if (!tag) return;
 try {
  const r = await fetch('/api/pump?tag=' + encodeURIComponent(tag)); const p = await r.json(); if (!r.ok) throw new Error(p.error);
  options = partsOf(p);
  $('#suggest').innerHTML = options.length ? options.map((o, i) => `<div class="suggest"><p><strong>${esc(o.pieza)}</strong> ${o.cantidad > 1 ? `×${o.cantidad}` : ''}<br><small>${esc(o.detalle || '—')}${o.codigo ? ' · código ' + esc(o.codigo) : ' · sin código en la ficha'}</small></p><button type="button" data-i="${i}">＋ Agregar</button></div>`).join('')
   : `<div class="msg warn">La ficha de ${esc(tag)} todavía no tiene sello, empaque ni o-rings registrados. <a href="/levantamiento.html?tag=${encodeURIComponent(tag)}">Levantarlos →</a></div>`;
  $('#suggest').querySelectorAll('[data-i]').forEach(b => b.onclick = () => add(options[Number(b.dataset.i)]));
  if (!$('#request [name=area]').value && (p.data.area || p.data.documental?.area)) $('#request [name=area]').value = p.data.area || p.data.documental.area;
 } catch (err) { $('#suggest').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; }
}
$('#pump').onchange = e => choose(e.target.value);
$('#manual').onsubmit = e => { e.preventDefault(); const f = new FormData(e.target); add({tag: $('#pump').value, pieza: f.get('pieza').trim(), detalle: f.get('detalle').trim(), codigo: f.get('codigo').trim(), cantidad: Number(f.get('cantidad'))}); e.target.reset(); e.target.cantidad.value = 1; };
$('#clear').onclick = () => { cart = []; saveCart(); $('#result').innerHTML = ''; };
$('#pdf').onclick = async () => {
 const form = $('#request'); if (!form.reportValidity()) return;
 if (!cart.length) { $('#result').innerHTML = '<div class="msg err">Agregá al menos un repuesto.</div>'; return; }
 const f = new FormData(form); store.set('vocatus-solicitante', f.get('solicitante'));
 $('#pdf').disabled = true; $('#pdf').textContent = 'Generando…';
 try {
  const r = await fetch('/api/parts-request', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Local-Token': token}, body: JSON.stringify({...Object.fromEntries(f), items: cart})});
  if (!r.ok) { let m = `HTTP ${r.status}`; try { m = (await r.json()).error || m; } catch {} throw new Error(m); }
  const blob = await r.blob(); const a = Object.assign(document.createElement('a'), {href: URL.createObjectURL(blob), download: `Solicitud_bodega_${f.get('fecha')}.pdf`});
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  $('#result').innerHTML = '<div class="msg ok">Solicitud descargada. La lista se conserva hasta que la vacíes.</div>';
 } catch (err) { $('#result').innerHTML = `<div class="msg err">${esc(err.message)}</div>`; }
 finally { $('#pdf').disabled = false; $('#pdf').textContent = 'Descargar solicitud PDF'; }
};
try {
 const r = await fetch('/api/bootstrap'); const b = await r.json(); if (!r.ok) throw new Error(b.error);
 token = b.token; demo = b.demo;
 const list = [...b.pumps.map(p => [p.tag, p.servicio || p.nombre]), ...b.sectorPumps.map(p => [p.tag, p.nombre])];
 $('#pump').innerHTML += list.map(([t, n]) => `<option value="${esc(t)}">${esc(t)} — ${esc(n || '')}</option>`).join('');
 if (demo) $('#mode').innerHTML = '<div class="msg warn">Modo demostración: el PDF saldrá marcado como DEMO.</div>';
} catch (err) { $('#mode').innerHTML = `<div class="msg err">No se pudo cargar la lista de bombas: ${esc(err.message)}</div>`; }
const d = new Date(); $('#request [name=fecha]').value = new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
$('#request [name=solicitante]').value = store.get('vocatus-solicitante') || '';
const start = new URLSearchParams(location.search).get('tag'); if (start) { $('#pump').value = start; choose(start); }
renderCart();
