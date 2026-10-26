const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}, del(k){try{localStorage.removeItem(k);}catch{}}};
const TAG = /^(P-\d{4}[A-Z]?|B[1-9]\d{0,3})$/;
const LABELS = {placa:'Placa', sello:'Sello', empaque:'Empaque', orings:'O-rings', fotos:'Fotos', bodega:'Bodega', verificado:'Verificado'};
let info = {rows:[], fields:[], token:'', writable:false, demo:false}, photos = [], current = null;
// Equipo cuyos datos están en el formulario. Los borradores se guardan siempre bajo este TAG,
// nunca bajo lo que se esté escribiendo en el campo, para que un equipo no herede datos de otro.
let activeTag = '', selection = 0;
const draftKey = tag => 'vocatus-borrador-' + tag, photoKey = tag => 'vocatus-fotos-' + tag;
const photosByTag = new Map();
const kind = tag => tag.startsWith('B') ? 'B' : 'P';
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

function chips(row) {
 if (!row) return '<span class="chip">Equipo sin ficha en esta bóveda</span>';
 return Object.entries(row.checks).map(([k, v]) => `<span class="chip ${v === null ? 'na' : v ? 'ok' : 'no'}">${v === null ? '–' : v ? '✓' : '○'} ${LABELS[k]}</span>`).join('') + `<span class="chip">${row.done}/${row.total}</span>`;
}
function renderFields() {
 const tag = $('#tag').value.trim().toUpperCase(), k = TAG.test(tag) ? kind(tag) : 'P';
 const data = current?.data ? (current.data.documental || current.data) : {};
 for (const section of document.querySelectorAll('[data-group]')) {
  const grid = section.querySelector('.grid');
  grid.innerHTML = info.fields.filter(f => f.group === section.dataset.group && f[k]).map(f => {
   const now = data[f[k]], has = now != null && String(now).trim() !== '';
   const unit = f.unit ? ` (${f.unit[k]})` : '';
   const input = f.options ? `<select name="${f.id}"><option value="">— sin cambio —</option>${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`
    : `<input name="${f.id}" ${f.number || f.unit ? 'inputmode="decimal"' : ''} maxlength="200">`;
   return `<label>${esc(f.label + unit)}${input}${has ? `<span class="current">En ficha: ${esc(now)}</span>` : ''}</label>`;
  }).join('');
 }
}
function oringRow(o = {}) {
 const div = document.createElement('div'); div.className = 'oring';
 div.innerHTML = `<label>Posición<input data-k="posicion" maxlength="120" placeholder="Ej. tapa de carcasa"></label><label>Medida<input data-k="medida" maxlength="60" placeholder="Ej. 45 x 3 mm"></label><label>Material<input data-k="material" maxlength="60" placeholder="Viton, EPDM…"></label><label>Cant.<input data-k="cantidad" inputmode="numeric" maxlength="4"></label><label>Código<input data-k="codigo" maxlength="80"></label><button type="button" aria-label="Quitar o-ring">✕</button>`;
 for (const [k, v] of Object.entries(o)) { const el = div.querySelector(`[data-k="${k}"]`); if (el) el.value = v; }
 div.querySelector('button').onclick = () => { div.remove(); saveDraft(); };
 $('#orings').append(div);
}
function collect() {
 const form = new FormData($('#form')), fields = {};
 for (const f of info.fields) { const v = String(form.get(f.id) ?? '').trim(); if (v) fields[f.id] = v; }
 const orings = [...document.querySelectorAll('.oring')].map(div => Object.fromEntries([...div.querySelectorAll('[data-k]')].map(i => [i.dataset.k, i.value.trim()]))).filter(o => o.medida || o.codigo);
 return {tag: $('#tag').value.trim().toUpperCase(), date: form.get('date'), author: String(form.get('author') || '').trim(), fields, orings, observations: String(form.get('observations') || '').trim()};
}
function saveDraft() {
 const d = collect(); store.set('vocatus-responsable', d.author);
 if (!TAG.test(activeTag)) return;
 d.tag = activeTag;
 if (Object.keys(d.fields).length || d.orings.length || d.observations) store.set(draftKey(activeTag), d); else store.del(draftKey(activeTag));
 savePhotos();
}
function savePhotos() {
 if (!TAG.test(activeTag)) return;
 photosByTag.set(activeTag, photos);
 if (photos.length) store.set(photoKey(activeTag), photos.map(p => ({name: p.name, base64: p.base64}))); else store.del(photoKey(activeTag));
}
// Deja el formulario sin datos de ningún equipo (conserva fecha y responsable).
function clearForm() {
 for (const el of document.querySelectorAll('#form [data-group] [name]')) el.value = '';
 $('#form [name=observations]').value = '';
 $('#orings').innerHTML = '';
 photos = []; renderPhotos();
}
function loadDraft(tag) {
 const d = store.get(draftKey(tag));
 if (d && d.tag === tag) {
  for (const [k, v] of Object.entries(d.fields || {})) { const el = $(`#form [data-group] [name="${k}"]`); if (el) el.value = v; }
  $('#form [name=observations]').value = d.observations || '';
  (d.orings || []).forEach(oringRow);
 }
 const saved = photosByTag.get(tag) || (store.get(photoKey(tag)) || []).map(p => ({name: p.name, base64: p.base64, url: 'data:image/jpeg;base64,' + p.base64}));
 photos = [...saved]; renderPhotos();
}
async function selectTag() {
 const tag = $('#tag').value.trim().toUpperCase();
 if (tag === activeTag && TAG.test(tag)) return;
 clearTimeout(saveDraft.t); saveDraft();
 const ticket = ++selection;
 activeTag = TAG.test(tag) ? tag : ''; current = null;
 clearForm(); renderFields(); showTarget();
 if (!activeTag) { $('#status').innerHTML = ''; return; }
 loadDraft(activeTag); history.replaceState(null, '', '?tag=' + activeTag);
 $('#status').innerHTML = chips(info.rows.find(r => r.tag === activeTag));
 let data = null;
 try { const r = await fetch('/api/pump?tag=' + encodeURIComponent(activeTag)); if (r.ok) data = await r.json(); } catch {}
 if (ticket !== selection) return; // llegó tarde: el usuario ya eligió otro equipo
 current = data;
 const typed = Object.fromEntries([...document.querySelectorAll('#form [data-group] [name]')].map(i => [i.name, i.value]));
 renderFields();
 for (const [name, value] of Object.entries(typed)) { const el = $(`#form [data-group] [name="${name}"]`); if (el) el.value = value; }
}
function showTarget() {
 const el = $('#destino'); if (!el) return;
 el.textContent = activeTag ? `Los datos de este formulario se guardan en ${activeTag}.` : 'Elegí un equipo para empezar.';
}
async function shrink(file) {
 const bitmap = await createImageBitmap(file).catch(() => null);
 if (!bitmap) throw new Error(`No se pudo leer ${file.name}.`);
 const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
 const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
 canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
 const url = canvas.toDataURL('image/jpeg', .82);
 return {name: file.name, url, base64: url.split(',')[1]};
}
function renderPhotos() {
 $('#photos').innerHTML = photos.map((p, i) => `<figure><img src="${p.url}" alt="Foto ${i + 1}"><button type="button" data-i="${i}" aria-label="Quitar foto">✕</button></figure>`).join('');
 $('#photos').querySelectorAll('button').forEach(b => b.onclick = () => { photos.splice(Number(b.dataset.i), 1); renderPhotos(); savePhotos(); });
}
function message(target, kind, text) { $(target).innerHTML = `<div class="msg ${kind}">${text}</div>`; }
function packageOf(data) { return {formato: 'levantamiento-vocatus', version: 1, creado: new Date().toISOString(), ...data, photos: photos.map(p => ({name: p.name, base64: p.base64}))}; }
function download(data) {
 const blob = new Blob([JSON.stringify(packageOf(data))], {type: 'application/json'});
 const a = Object.assign(document.createElement('a'), {href: URL.createObjectURL(blob), download: `levantamiento_${data.tag}_${data.date}_${Date.now().toString(36)}.json`});
 document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
async function send(body) {
 const r = await fetch('/api/survey', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Local-Token': info.token}, body: JSON.stringify(body)});
 let out = {}; try { out = await r.json(); } catch {}
 if (!r.ok) { const e = new Error(out.error || `El servidor respondió HTTP ${r.status}.`); e.code = out.code; throw e; }
 return out;
}
function validate(data) {
 if (!TAG.test(data.tag)) throw new Error('Escribí un TAG válido (B1, P-1311…).');
 if (data.tag !== activeTag) throw new Error(`El formulario tiene datos de ${activeTag || 'ningún equipo'}; confirmá el TAG antes de guardar.`);
 if (!data.date || !data.author) throw new Error('Completá fecha y responsable.');
 if (!Object.keys(data.fields).length && !data.orings.length && !photos.length && !data.observations) throw new Error('No hay datos para guardar.');
}
$('#form').onsubmit = async e => {
 e.preventDefault(); const data = collect();
 try { validate(data); } catch (err) { return message('#result', 'err', esc(err.message)); }
 if (!info.writable) { download(data); return message('#result', 'warn', 'Este sitio no escribe en Obsidian. Se descargó el paquete: cargalo luego desde el visor en la computadora.'); }
 $('#save').disabled = true; $('#save').textContent = 'Guardando…';
 try {
  const out = await send({...packageOf(data)});
  store.del(draftKey(data.tag)); store.del(photoKey(data.tag)); photosByTag.delete(data.tag); photos = []; renderPhotos();
  message('#result', 'ok', `Guardado en <code>${esc(out.file)}</code>: ${esc(out.changed.join(', ') || 'observación')}.`);
  const i = info.rows.findIndex(r => r.tag === data.tag); if (i >= 0) info.rows[i] = out.progress; else info.rows.push(out.progress);
  $('#form').reset(); $('#tag').value = data.tag; $('#form [name=date]').value = data.date; $('#form [name=author]').value = data.author; activeTag = ''; await selectTag();
 } catch (err) {
  download(data);
  message('#result', 'err', `${esc(err.message)}<br>Para no perder el trabajo, se descargó el paquete.`);
 } finally { $('#save').disabled = false; $('#save').textContent = 'Guardar en la ficha'; }
};
$('#export').onclick = () => { const data = collect(); try { validate(data); download(data); message('#result', 'ok', 'Paquete descargado. Podés enviarlo a la computadora y cargarlo abajo.'); } catch (err) { message('#result', 'err', esc(err.message)); } };
$('#import').onchange = async e => {
 const lines = [];
 for (const file of e.target.files) {
  try {
   const data = JSON.parse(await file.text());
   if (data.formato !== 'levantamiento-vocatus') throw new Error('no es un paquete de levantamiento');
   if (!info.writable) throw new Error('este sitio no escribe en Obsidian; abrí el visor en la computadora');
   const out = await send(data); lines.push(`<div class="msg ok">${esc(file.name)} → ${esc(out.file)}</div>`);
  } catch (err) { lines.push(`<div class="msg err">${esc(file.name)}: ${esc(err.message)}</div>`); }
 }
 $('#import-result').innerHTML = lines.join(''); e.target.value = '';
};
$('#photo-input').onchange = async e => {
 for (const file of [...e.target.files].slice(0, 8 - photos.length)) { try { photos.push(await shrink(file)); } catch (err) { message('#result', 'err', esc(err.message)); } }
 e.target.value = ''; renderPhotos(); savePhotos();
};
$('#add-oring').onclick = () => oringRow();
$('#tag').addEventListener('change', selectTag);
$('#form').addEventListener('input', e => { if (e.target.id === 'tag') return; clearTimeout(saveDraft.t); saveDraft.t = setTimeout(saveDraft, 400); });

try {
 const r = await fetch('/api/progress'); info = await r.json(); if (!r.ok) throw new Error(info.error);
} catch (err) { message('#mode', 'err', 'No se pudo leer la lista de equipos: ' + esc(err.message)); }
$('#tags').innerHTML = info.rows.map(r => `<option value="${esc(r.tag)}">${esc(r.servicio)}</option>`).join('');
message('#mode', info.writable ? (info.demo ? 'warn' : 'ok') : 'warn', info.writable
 ? (info.demo ? 'Modo demostración: se escribe en la bóveda de ejemplo.' : 'Conectado a Obsidian: lo que guardes se escribe en la ficha.')
 : 'Sitio en la nube: los datos se guardan como paquete descargable para cargarlos después en la computadora.');
$('#form [name=date]').value = today();
$('#form [name=author]').value = store.get('vocatus-responsable') || '';
const start = new URLSearchParams(location.search).get('tag');
if (start) $('#tag').value = start.toUpperCase();
await selectTag();
