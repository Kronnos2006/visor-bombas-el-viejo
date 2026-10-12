const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS = {placa:'Placa', sello:'Sello', empaque:'Empaque', orings:'O-rings', fotos:'Fotos', bodega:'Bodega', verificado:'Verificado'};
let data = {rows: []};
function render() {
 const kind = $('#kind').value, only = $('#only').value;
 const rows = data.rows.filter(r => (!kind || r.kind === kind) && (!only || (only === 'done') === (r.done === r.total)));
 const pct = rows.length ? Math.round(rows.reduce((s, r) => s + r.done / r.total, 0) / rows.length * 100) : 0;
 const missing = Object.keys(LABELS).map(k => [k, rows.filter(r => r.checks[k] === false).length]);
 $('#stats').innerHTML = `<div><b>${rows.length}</b><span>equipos en la vista</span></div><div><b>${pct}%</b><span>avance promedio</span></div><div><b>${rows.filter(r => r.done === r.total).length}</b><span>fichas completas</span></div>` +
  missing.filter(([, n]) => n).map(([k, n]) => `<div><b>${n}</b><span>sin ${LABELS[k].toLowerCase()}</span></div>`).join('');
 $('#rows').innerHTML = rows.map(r => `<tr><td><strong>${esc(r.tag)}</strong>${r.demo ? ' <span class="demo-chip">DEMO</span>' : ''}<br><span class="muted">${esc(r.servicio || r.area)}</span></td><td><div class="chips">${Object.entries(r.checks).map(([k, v]) => `<span class="chip ${v === null ? 'na' : v ? 'ok' : 'no'}">${v === null ? '–' : v ? '✓' : '○'} ${LABELS[k]}</span>`).join('')}</div></td><td style="min-width:110px">${r.done}/${r.total}<div class="bar"><i style="width:${Math.round(r.done / r.total * 100)}%"></i></div></td><td class="no-print"><a href="/levantamiento.html?tag=${encodeURIComponent(r.tag)}">Levantar →</a></td></tr>`).join('') || '<tr><td colspan="4" class="muted">No hay equipos con este filtro.</td></tr>';
}
try {
 const r = await fetch('/api/progress'); data = await r.json(); if (!r.ok) throw new Error(data.error);
 $('#mode').innerHTML = data.demo ? '<div class="msg warn">Modo demostración: estas fichas son de ejemplo.</div>' : '';
 if (data.errors?.length) $('#mode').innerHTML += `<div class="msg err">No se pudieron leer: ${data.errors.map(e => esc(e.tag + ' (' + e.error + ')')).join(', ')}</div>`;
} catch (err) { $('#mode').innerHTML = `<div class="msg err">No se pudo leer el avance: ${esc(err.message)}</div>`; }
$('#kind').onchange = $('#only').onchange = render;
render();
