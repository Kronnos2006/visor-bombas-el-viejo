import {makePhotoPackage,readPhotoPackage} from './photo-package-core.js';
import {fotosActualizadas,guardarFoto,htmlFotos,originales,bindPhotoTransfers,exportPhotoPackage,importPhotoPackage,saveLocalPhotos} from './fotos-bomba.js';
import {expedienteDe} from './expediente.js';
import {validateSurveyInput,NUMERIC_RULES} from './survey-validation.js';
import {verificationText} from './verification-core.js';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}, del(k){try{localStorage.removeItem(k);}catch{}}};
const TAG = /^(P-\d{4}[A-Z]?|B[1-9]\d{0,3})$/;
const LABELS = {placa:'Placa', sello:'Sello', empaque:'Empaque', orings:'O-rings', fotos:'Fotos', bodega:'Bodega', verificado:'Verificado'};
let info = {rows:[], fields:[], token:'', writable:false, demo:false}, photos = [], current = null;
// Equipo cuyos datos están en el formulario. Los borradores se guardan siempre bajo este TAG,
// nunca bajo lo que se esté escribiendo en el campo, para que un equipo no herede datos de otro.
let activeTag = '', selection = 0, replacementBase=null;
const draftKey = tag => 'vocatus-borrador-' + tag, photoKey = tag => 'vocatus-fotos-' + tag;
const photosByTag = new Map();
let clearFields={};
function syncClearFields(){
 for(const button of document.querySelectorAll('[data-clear-field]')){
  const id=button.dataset.clearField,marked=Object.hasOwn(clearFields,id),input=button.parentElement.querySelector('[name]');
  button.setAttribute('aria-pressed',String(marked));button.textContent=marked?'↶ Conservar dato':'Quitar dato incorrecto';
  input.disabled=marked;
  button.parentElement.querySelector('[data-clear-status]').textContent=marked?'Se quitará al guardar. Quedará en respaldo e historial.':'';
 }
}
const kind = tag => tag.startsWith('B') ? 'B' : 'P';
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

function chips(row) {
 if (!row) return '<span class="chip">Equipo sin ficha en esta bóveda</span>';
 return Object.entries(row.checks).filter(([k])=>k!=='verificado').map(([k, v]) => `<span class="chip ${v === null ? 'na' : v ? 'ok' : 'no'}">${v === null ? '–' : v ? '✓' : '○'} ${LABELS[k]}</span>`).join('') + `<span class="chip">${row.done}/${row.total}</span><span class="chip">${esc(verificationText(row.verification))}</span>`;
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
    : `<input name="${f.id}" ${NUMERIC_RULES[f.id]?.integer ? 'inputmode="numeric" pattern="[0-9]*"' : f.unit || f.number ? 'inputmode="decimal"' : ''} maxlength="200">`;
   return `<div><label>${esc(f.label + unit)}${input}${has ? `<span class="current">En ficha: ${esc(now)}</span>` : ''}</label>${has?`<button type="button" data-clear-field="${f.id}" data-clear-value="${esc(now)}" aria-pressed="false">Quitar dato incorrecto</button><small data-clear-status role="status"></small>`:''}</div>`;
  }).join('');
 }
 document.querySelectorAll('[data-clear-field]').forEach(button=>button.onclick=()=>{
  const id=button.dataset.clearField;
  if(Object.hasOwn(clearFields,id))delete clearFields[id];else clearFields[id]=button.dataset.clearValue;
  syncClearFields();saveDraft();
 });
 syncClearFields();
}
function oringRow(o = {}) {
 const div = document.createElement('div'); div.className = 'oring';
 div.innerHTML = `<label>Posición<input data-k="posicion" maxlength="120" placeholder="Ej. tapa de carcasa"></label><label>Medida<input data-k="medida" maxlength="60" placeholder="Ej. 45 x 3 mm"></label><label>Material<input data-k="material" maxlength="60" placeholder="Viton, EPDM…"></label><label>Cant.<input data-k="cantidad" inputmode="numeric" maxlength="4"></label><label>Código<input data-k="codigo" maxlength="80"></label><button type="button" aria-label="Quitar o-ring">✕</button>`;
 for (const [k, v] of Object.entries(o)) { const el = div.querySelector(`[data-k="${k}"]`); if (el) el.value = v; }
 if(Number.isInteger(o.existingIndex))div.dataset.existingIndex=String(o.existingIndex);
 div.querySelector('button').onclick = () => { div.remove(); saveDraft(); };
 $('#orings').append(div);
}
function collect() {
 const form = new FormData($('#form')), fields = {};
 for (const f of info.fields) { const v = String(form.get(f.id) ?? '').trim(); if (v&&!Object.hasOwn(clearFields,f.id)) fields[f.id] = v; }
 const orings=[...document.querySelectorAll('.oring')].map(div=>{
  const item=Object.fromEntries([...div.querySelectorAll('[data-k]')].map(i=>[i.dataset.k,i.value.trim()]));
  if(div.dataset.existingIndex!==undefined)item.existingIndex=Number(div.dataset.existingIndex);
  return item;
 }).filter(o=>o.medida||o.codigo);
 return {clearFields:{...clearFields},clearReason:String(form.get('clearReason')||'').trim(),replaceOrings:$('#replace-orings').checked,baseOrings:replacementBase||(current?.data?(current.data.documental||current.data).orings||[]:[]),tag: $('#tag').value.trim().toUpperCase(), date: form.get('date'), author: String(form.get('author') || '').trim(), fields, orings, observations: String(form.get('observations') || '').trim(),verification:{scopes:[...document.querySelectorAll('[name=verification-scope]:checked')].map(el=>el.value),evidence:String(form.get('verification-evidence')||'').trim()}};
}
function saveDraft() {
 const d = collect(); store.set('vocatus-responsable', d.author);
 if (!TAG.test(activeTag)) return;
 d.tag = activeTag;
 if (Object.keys(d.clearFields).length || Object.keys(d.fields).length || d.orings.length || d.observations || d.verification.scopes.length || d.replaceOrings) store.set(draftKey(activeTag), d); else store.del(draftKey(activeTag));
 savePhotos();
}
function savePhotos() {
 if (!TAG.test(activeTag)) return;
 photosByTag.set(activeTag, photos);
 if (photos.length) store.set(photoKey(activeTag), photos.map(p => ({name: p.name, base64: p.base64}))); else store.del(photoKey(activeTag));
}
// Deja el formulario sin datos de ningún equipo (conserva fecha y responsable).
function clearForm() {
 clearFields={};$('#form [name=clearReason]').value='';
 for (const el of document.querySelectorAll('#form [data-group] [name]')) el.value = '';
 $('#form [name=observations]').value = '';
 $('#orings').innerHTML = '';$('#replace-orings').checked=false;replacementBase=null;$('#component-photos').innerHTML='';$('#orings-actuales').textContent='';
 document.querySelectorAll('[name=verification-scope]').forEach(el=>el.checked=false);$('#form [name=verification-evidence]').value='';
 photos = []; renderPhotos();
}
function loadDraft(tag) {
 const d = store.get(draftKey(tag));
 if (d && d.tag === tag) {
  clearFields={...(d.clearFields||{})};$('#form [name=clearReason]').value=d.clearReason||'';syncClearFields();
  for (const [k, v] of Object.entries(d.fields || {})) { const el = $(`#form [data-group] [name="${k}"]`); if (el) el.value = v; }
  $('#form [name=observations]').value = d.observations || '';
  $('#replace-orings').checked=d.replaceOrings===true;replacementBase=d.replaceOrings?d.baseOrings||[]:null;
  (d.orings || []).forEach(oringRow);
  document.querySelectorAll('[name=verification-scope]').forEach(el=>el.checked=(d.verification?.scopes||[]).includes(el.value));$('#form [name=verification-evidence]').value=d.verification?.evidence||'';
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
 loadDraft(activeTag); history.replaceState(null, '', '?tag=' + activeTag + location.hash);
 $('#status').innerHTML = chips(info.rows.find(r => r.tag === activeTag));
 let data = null;
 try { const r = await fetch('/api/pump?tag=' + encodeURIComponent(activeTag)); if (r.ok) data = await r.json(); } catch {}
 if (ticket !== selection) return; // llegó tarde: el usuario ya eligió otro equipo
 current = data;
 const existing=(current?.data?.documental||current?.data||{}).orings||[];$('#orings-actuales').textContent=existing.length+' o-ring(s) registrados en '+activeTag+'.';
 renderPhotoEditor();
 const typed = Object.fromEntries([...document.querySelectorAll('#form [data-group] [name]')].map(i => [i.name, i.value]));
 renderFields();
 for (const [name, value] of Object.entries(typed)) { const el = $(`#form [data-group] [name="${name}"]`); if (el) el.value = value; }
 const section=document.getElementById(location.hash.slice(1));if(section)section.scrollIntoView({block:'start'});
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
function packageOf(data) { return {formato: 'levantamiento-vocatus', version: 2, creado: new Date().toISOString(), ...data, photos: photos.map(p => ({name: p.name, base64: p.base64}))}; }
async function download(data) {
 const pkg=packageOf(data);try{const all=await exportPhotoPackage(data.tag,{writable:!!info.writable,tagOnly:true});const photos=readPhotoPackage(all).filter(p=>p.tag===data.tag);if(photos.length)pkg.expedientePhotos=makePhotoPackage(photos);}catch(error){if(!/No hay fotos actualizadas/.test(error.message))throw error;}
 const blob = new Blob([JSON.stringify(pkg)], {type: 'application/json'});
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
 validateSurveyInput(data);
 if (!Object.keys(data.clearFields||{}).length && !Object.keys(data.fields).length && !data.orings.length && !photos.length && !data.observations && !data.verification.scopes.length && !data.replaceOrings) throw new Error('No hay datos para guardar.');
}
$('#form').onsubmit = async e => {
 e.preventDefault(); const data = collect();
 try { validate(data); } catch (err) { return message('#result', 'err', esc(err.message)); }
 if (!info.writable) { try{await download(data);}catch(error){return message('#result','err',esc(error.message));} return message('#result', 'warn', 'Este sitio no escribe en Obsidian. Se descargó el paquete: cargalo luego desde el visor en la computadora.'); }
 $('#save').disabled = true; $('#save').textContent = 'Guardando…';
 try {
  const out = await send({...packageOf(data)});
  store.del(draftKey(data.tag)); store.del(photoKey(data.tag)); photosByTag.delete(data.tag); photos = []; renderPhotos();
  message('#result', 'ok', `Guardado en <code>${esc(out.file)}</code>: ${esc(out.changed.join(', ') || 'observación')}. Respaldo previo: <code>${esc(out.backup||'')}</code>.`);
  const i = info.rows.findIndex(r => r.tag === data.tag); if (i >= 0) info.rows[i] = out.progress; else info.rows.push(out.progress);
  $('#form').reset(); $('#tag').value = data.tag; $('#form [name=date]').value = data.date; $('#form [name=author]').value = data.author; activeTag = ''; await selectTag();
 } catch (err) {
  try{await download(data);message('#result','err',`${esc(err.message)}<br>Se descargó el paquete para conservar el trabajo.`);}catch(backupError){message('#result','err',`${esc(err.message)}<br>No se pudo descargar el respaldo: ${esc(backupError.message)}. El borrador se conserva en este navegador.`);}
 } finally { $('#save').disabled = false; $('#save').textContent = 'Guardar en la ficha'; }
};
$('#export').onclick = async () => { const data = collect(); try { validate(data); await download(data); message('#result', 'ok', 'Paquete descargado. Podés enviarlo a la computadora y cargarlo abajo.'); } catch (err) { message('#result', 'err', esc(err.message)); } };
$('#import').onchange = async e => {
 const lines = [];
 for (const file of e.target.files) {
  try {
   const data = JSON.parse(await file.text());
   if (data.formato !== 'levantamiento-vocatus') throw new Error('no es un paquete de levantamiento');
   if (!info.writable) throw new Error('este sitio no escribe en Obsidian; abrí el visor en la computadora');
   if(data.expedientePhotos&&readPhotoPackage(data.expedientePhotos).some(photo=>photo.tag!==data.tag))throw new Error('Las fotos del paquete no corresponden al TAG del levantamiento.');
   const out = await send(data);let photoNote='';if(data.expedientePhotos){const imported=await importPhotoPackage(data.expedientePhotos);const result=await saveLocalPhotos(data.tag,{writable:info.writable,token:info.token,allowKeys:imported.addedKeys});photoNote=' · '+result.added+' fotos guardadas; '+(result.preserved+imported.preserved)+' casillas anteriores conservadas. El archivo original permite revisar las fotos omitidas.';}lines.push(`<div class="msg ok">${esc(file.name)} → ${esc(out.file)}${esc(photoNote)}</div>`);
  } catch (err) { lines.push(`<div class="msg err">${esc(file.name)}: ${esc(err.message)}</div>`); }
 }
 $('#import-result').innerHTML = lines.join(''); e.target.value = '';
};
$('#photo-input').onchange = async e => {
 for (const file of [...e.target.files].slice(0, 8 - photos.length)) { try { photos.push(await shrink(file)); } catch (err) { message('#result', 'err', esc(err.message)); } }
 e.target.value = ''; renderPhotos(); savePhotos();
};
$('#replace-orings').onchange=()=>{
 $('#orings').innerHTML='';
 replacementBase=null;if($('#replace-orings').checked){const rings=(current?.data?.documental||current?.data||{}).orings||[];replacementBase=JSON.parse(JSON.stringify(rings));rings.forEach((o,existingIndex)=>oringRow({...o,existingIndex}));}
 saveDraft();
};
$('#add-oring').onclick = () => oringRow();
$('#tag').addEventListener('change', selectTag);
$('#form').addEventListener('input', e => { if (e.target.id === 'tag') return; clearTimeout(saveDraft.t); saveDraft.t = setTimeout(saveDraft, 400); });

try {
 const r = await fetch('/api/survey-catalog'); info = await r.json(); if (!r.ok) throw new Error(info.error);
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

async function renderPhotoEditor(){
 const tag=activeTag,target=$('#component-photos');if(!tag||!current)return;
 const p={...current.data,tag},options={writable:!!info.writable,token:info.token};
 const original=originales(p,expedienteDe(p));
 let act={},photoError='';try{act=await fotosActualizadas(tag,options);photoError=act.warning||'';}catch(error){photoError=error.message;}if(activeTag!==tag||!target.isConnected)return;
 target.innerHTML=htmlFotos(p,original,act,options);
 bindPhotoTransfers(target,tag,options,renderPhotoEditor);if(photoError){target.querySelector('#fotos-error').textContent=photoError;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=renderPhotoEditor;target.querySelector('#fotos-error').after(retry);}
 target.querySelectorAll('input[data-slot]').forEach(input=>{
  const label=input.closest('label');label.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}};
  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;input.disabled=true;try{await guardarFoto(tag,input.dataset.slot,file,options);if(activeTag===tag)await renderPhotoEditor();}catch(error){if(activeTag===tag)target.querySelector('#fotos-error').textContent=error.message;input.disabled=false;}};
 });
}

// Teléfono: los botones «Quitar dato incorrecto» se muestran solo al activar este modo,
// para que el formulario no duplique cada campo con un botón. Un dato ya marcado sigue visible.
{const modo=document.getElementById('modo-corregir');if(modo)modo.onclick=()=>{const activo=document.body.classList.toggle('modo-corregir');modo.setAttribute('aria-pressed',String(activo));modo.textContent=activo?'Terminar de corregir datos':'Corregir o quitar datos registrados';};}
