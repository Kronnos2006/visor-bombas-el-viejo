import {readSavedSurvey,writeSavedSurvey,savedSurveyKey,readSurveyPhotos,writeSurveyPhotos,updateSurveyPhotos} from './survey-drafts.js';
import {makePhotoPackage,readPhotoPackage} from './photo-package-core.js';
import {fotosActualizadas,guardarFoto,htmlFotos,originales,bindPhotoTransfers,exportPhotoPackage,importPhotoPackage,saveLocalPhotos} from './fotos-bomba.js';
import {photoInputStarted,setPhotoInputStatus} from './fotos-bomba.js';
import {expedienteDe} from './expediente.js';
import {validateSurveyInput,NUMERIC_RULES} from './survey-validation.js';
import {verificationText} from './verification-core.js';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = {get(k){try{return JSON.parse(localStorage.getItem(k));}catch{return null;}}, set(k,v){const text=JSON.stringify(v);localStorage.setItem(k,text);if(localStorage.getItem(k)!==text)throw Error('No se confirmó el guardado del borrador.');}, del(k){try{localStorage.removeItem(k);}catch{}}};
const TAG = /^(P-\d{4}[A-Z]?|B[1-9]\d{0,3})$/;
const LABELS = {placa:'Placa', sello:'Sello', empaque:'Empaque', orings:'O-rings', fotos:'Fotos', bodega:'Bodega', verificado:'Verificado'};
let info = {rows:[], fields:[], token:'', writable:false, demo:false}, photos = [], current = null;
// Equipo cuyos datos están en el formulario. Los borradores se guardan siempre bajo este TAG,
// nunca bajo lo que se esté escribiendo en el campo, para que un equipo no herede datos de otro.
let activeTag = '', selection = 0, replacementBase=null;
const draftKey = tag => 'vocatus-borrador-' + tag, photoKey = tag => 'vocatus-fotos-' + tag;
const photosByTag = new Map(),photoJobs=new Map();
let photoReady=false,dataReady=false,submitting=false;
function draftNotice(text,error=false){const el=$('#draft-status');el.textContent=text;el.dataset.error=String(error);}
function queuePhotos(tag,task){const previous=photoJobs.get(tag)||Promise.resolve();const job=previous.catch(()=>{}).then(task);photoJobs.set(tag,job);job.finally(()=>{if(photoJobs.get(tag)===job)photoJobs.delete(tag);}).catch(()=>{});return job;}
function saveLabel(){return info.writable?'Guardar en Obsidian':'Guardar en este navegador';}
function syncActions(){$('#photo-input').disabled=!activeTag||!photoReady||submitting;$('#save').disabled=submitting||!photoReady||!dataReady;$('#save').textContent=submitting?'Guardando…':saveLabel();}
function reportDraftError(error){draftNotice('No se pudo conservar el borrador: '+error.message+' Descargá un paquete antes de salir.',true);}
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
 if(submitting||!TAG.test(activeTag))return;
 try{const d=collect();d.tag=activeTag;store.set(draftKey(activeTag),d);store.set('vocatus-responsable',d.author);draftNotice('Borrador de '+activeTag+' guardado en este navegador.');}catch(error){reportDraftError(error);}
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
 const d = store.get(draftKey(tag)) || readSavedSurvey(tag)?.data;
 if (d && d.tag === tag) {
  clearFields={...(d.clearFields||{})};$('#form [name=clearReason]').value=d.clearReason||'';syncClearFields();
  for (const [k, v] of Object.entries(d.fields || {})) { const el = $(`#form [data-group] [name="${k}"]`); if (el) el.value = v; }
  $('#form [name=observations]').value = d.observations || '';
  $('#form [name=author]').value=d.author||$('#form [name=author]').value;if(d.date)$('#form [name=date]').value=d.date;
  $('#replace-orings').checked=d.replaceOrings===true;replacementBase=d.replaceOrings?d.baseOrings||[]:null;
  (d.orings || []).forEach(oringRow);
  document.querySelectorAll('[name=verification-scope]').forEach(el=>el.checked=(d.verification?.scopes||[]).includes(el.value));$('#form [name=verification-evidence]').value=d.verification?.evidence||'';
 }
 photos=[];renderPhotos();
}
async function loadPhotos(tag,ticket){
 photoReady=false;syncActions();$('#photo-status').textContent='Recuperando fotos de '+tag+'…';
 try{await photoJobs.get(tag);const saved=await readSurveyPhotos(tag);if(ticket!==selection)return;photos=saved.map(p=>({...p,url:'data:image/jpeg;base64,'+p.base64}));photosByTag.set(tag,photos);photoReady=true;$('#photo-status').textContent='Fotos recuperadas de '+tag+'.';renderPhotos();}
 catch(error){if(ticket===selection){$('#photo-status').textContent=error.message+' Las fotos anteriores se conservan. Reintentá la lectura.';$('#photo-retry').hidden=false;}}
 finally{if(ticket===selection)syncActions();}
}

async function selectTag() {
 if(submitting)return;
 const tag = $('#tag').value.trim().toUpperCase();$('#tag').value=tag;
 if (tag === activeTag && TAG.test(tag)&&dataReady) return;
 clearTimeout(saveDraft.t); saveDraft();
 const ticket = ++selection;
 activeTag = TAG.test(tag) ? tag : '';current=null;dataReady=false;syncActions();
 clearForm(); renderFields(); showTarget();
 if (!activeTag) {photoReady=false;syncActions();$('#status').innerHTML = ''; return; }
 try{loadDraft(activeTag);}catch(error){reportDraftError(error);}
 $('#photo-retry').hidden=true;loadPhotos(activeTag,ticket);history.replaceState(null, '', '?tag=' + activeTag + location.hash);
 $('#status').innerHTML = chips(info.rows.find(r => r.tag === activeTag));
 let data = null;
 try{const r=await fetch('/api/pump?tag='+encodeURIComponent(activeTag),{signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('No se pudo consultar la ficha (HTTP '+r.status+').');data=await r.json();}catch(error){if(ticket===selection){$('#status').textContent=error.message+' Tocá Abrir equipo para reintentar.';}return;}
 while(submitting&&ticket===selection)await new Promise(resolve=>setTimeout(resolve,30));
 if (ticket !== selection) return; // llegó tarde: el usuario ya eligió otro equipo
 current = data;if(current?.data&&!info.rows.some(row=>row.tag===activeTag))$('#status').innerHTML='<span class="chip">Ficha documental disponible · '+esc(activeTag)+'</span>';
 const existing=(current?.data?.documental||current?.data||{}).orings||[];$('#orings-actuales').textContent=existing.length+' o-ring(s) registrados en '+activeTag+'.';
 renderPhotoEditor();
 const typed = Object.fromEntries([...document.querySelectorAll('#form [data-group] [name]')].map(i => [i.name, i.value]));
 renderFields();
 for (const [name, value] of Object.entries(typed)) { const el = $(`#form [data-group] [name="${name}"]`); if (el) el.value = value; }
 dataReady=true;syncActions();const section=document.getElementById(location.hash.slice(1));if(section)section.scrollIntoView({block:'start'});
}
function showTarget() {
 const el=$('#destino');if(!el)return;const typed=$('#tag').value.trim().toUpperCase();
 el.textContent=activeTag?(typed!==activeTag?'TAG escrito '+typed+' sin abrir. El formulario aún pertenece a '+activeTag+'. Tocá Abrir equipo.':'Estás editando '+activeTag+'. Los cambios corresponden a esta bomba.'):'Escribí un TAG y tocá Abrir equipo para empezar.';
 const back=$('#volver-ficha');back.hidden=!activeTag;if(activeTag){back.href='/?s=areas#'+encodeURIComponent(activeTag);back.textContent='Volver a la ficha de '+activeTag;}
}

async function shrink(file) {
 const bitmap = await createImageBitmap(file).catch(() => null);
 if (!bitmap) throw new Error(`No se pudo leer ${file.name}.`);
 const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
 const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
 canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
 bitmap.close?.();const url = canvas.toDataURL('image/jpeg', .82);
 return {name: file.name, url, base64: url.split(',')[1]};
}
function renderPhotos() {
 $('#photos').innerHTML=photos.map((p,i)=>`<figure><img src="${p.url}" alt="Foto ${i+1}"><button type="button" data-i="${i}" ${submitting?'disabled':''} aria-label="Quitar foto">✕</button></figure>`).join('');
 $('#photos').querySelectorAll('button').forEach(button=>button.onclick=()=>{
  if(submitting||!photoReady)return;const tag=activeTag,removed=photos[Number(button.dataset.i)];
  queuePhotos(tag,async()=>{
   const next=await updateSurveyPhotos(tag,latest=>{const index=latest.findIndex(photo=>photo.name===removed.name&&photo.base64===removed.base64);return latest.filter((_,i)=>i!==index);});
   if(activeTag===tag){photos=next.map(photo=>({...photo,url:'data:image/jpeg;base64,'+photo.base64}));renderPhotos();$('#photo-status').textContent='Fotos guardadas de '+tag+'.';}
  }).catch(error=>{if(activeTag===tag)$('#photo-status').textContent='No se pudo quitar la foto: '+error.message;});
 });
}

function message(target, kind, text) { $(target).innerHTML = `<div class="msg ${kind}">${text}</div>`;if(target==='#result')$(target).scrollIntoView({block:'center',behavior:'auto'}); }
function packageOf(data) { return {formato: 'levantamiento-vocatus', version: 2, creado: new Date().toISOString(), ...data, photos: photos.map(p => ({name: p.name, base64: p.base64}))}; }
async function download(data,{allowPartial=false}={}) {
 const pkg=packageOf(data);try{const all=await exportPhotoPackage(data.tag,{writable:!!info.writable,tagOnly:true});const photos=readPhotoPackage(all).filter(p=>p.tag===data.tag);if(photos.length)pkg.expedientePhotos=makePhotoPackage(photos);}catch(error){if(!/No hay fotos actualizadas/.test(error.message)){if(!allowPartial)throw error;pkg.backupWarnings=[...(pkg.backupWarnings||[]),'Fotos categorizadas no recuperadas: '+error.message];}}
 if(pkg.backupWarnings?.length)pkg.partialBackup=true;
 const blob = new Blob([JSON.stringify(pkg)], {type: 'application/json'});
 const a = Object.assign(document.createElement('a'), {href: URL.createObjectURL(blob), download: `levantamiento_${data.tag}_${data.date}_${Date.now().toString(36)}.json`});
 document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);return pkg.backupWarnings||[];
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
async function settledInput({emergency=false}={}){
 if((!photoReady||!dataReady)&&!emergency)throw Error('Esperá la carga de la ficha y las fotos o usá Reintentar.');
 const tag=activeTag,data=collect();
 if(data.tag!==tag||!TAG.test(tag))throw Error('Confirmá el TAG con Abrir equipo antes de guardar o descargar.');
 if(!photoReady)data.backupWarnings=['Adjuntos antiguos no recuperados; el respaldo incluye solo las fotos disponibles en memoria.'];
 lockForm(true);
 try{
  try{await photoJobs.get(tag);}catch(error){if(!emergency)throw error;data.backupWarnings=[...(data.backupWarnings||[]),'Preparación de fotos incompleta: '+error.message];}
  if(activeTag!==tag)throw Error('El equipo cambió; revisá el TAG antes de guardar.');
  try{const latest=await readSurveyPhotos(tag);photos=latest.map(photo=>({...photo,url:'data:image/jpeg;base64,'+photo.base64}));renderPhotos();}catch(error){if(!emergency)throw error;data.backupWarnings=[...(data.backupWarnings||[]),'No se confirmó la lectura actual de adjuntos: '+error.message];}
  if(!emergency)validate(data);return data;
 }catch(error){lockForm(false);throw error;}
}

function lockForm(locked){if(submitting===locked)return;submitting=locked;for(const el of document.querySelectorAll('#form input,#form select,#form textarea,#form button')){if(locked){el.dataset.wasDisabled=String(el.disabled);el.disabled=true;}else if(el.dataset.wasDisabled!==undefined){el.disabled=el.dataset.wasDisabled==='true';delete el.dataset.wasDisabled;}}syncActions();}
$('#form').onsubmit=async e=>{
 e.preventDefault();if(submitting)return;clearTimeout(saveDraft.t);saveDraft();
 let data;try{data=await settledInput();}catch(error){return message('#result','err',esc(error.message));}
 lockForm(true);
 try{
  if(!info.writable){const family=kind(data.tag);data.fieldLabels=Object.fromEntries(info.fields.map(field=>[field.id,field.label+(field.unit?.[family]?' ('+field.unit[family]+')':'')]));writeSavedSurvey(data);store.set(draftKey(data.tag),data);message('#result','ok','Datos y adjuntos de '+esc(data.tag)+' guardados en este navegador. La ficha documental de Obsidian se conserva. Descargá el paquete para trasladarlos a planta.');draftNotice('Cambios locales guardados de '+data.tag+' · pendientes de llevar a Obsidian.');return;}
  const out=await send(packageOf(data));
  // Primero conservar la confirmación. La limpieza del borrador no elimina fotos guardadas.
  message('#result','ok','Guardado en Obsidian: '+esc(out.file)+'.');
  try{store.del(draftKey(data.tag));store.del(photoKey(data.tag));localStorage.removeItem(savedSurveyKey(data.tag));photosByTag.delete(data.tag); /* Adjuntos confirmados se conservan como respaldo local. */}catch(error){message('#result','warn','Guardado en Obsidian. El respaldo local se conserva: '+esc(error.message));}
  const i=info.rows.findIndex(r=>r.tag===data.tag);if(i>=0)info.rows[i]=out.progress;else info.rows.push(out.progress);
  $('#form').reset();$('#tag').value=data.tag;$('#form [name=date]').value=data.date;$('#form [name=author]').value=data.author;activeTag='';
 }catch(error){message('#result','err',esc(error.message)+' No se confirmó el guardado. Conservá esta página y descargá el paquete para respaldar el trabajo.');}
 finally{lockForm(false);if(!activeTag)await selectTag();}
};
$('#export').onclick=async()=>{if(submitting)return;try{const data=await settledInput({emergency:true});const warnings=await download(data,{allowPartial:true});message('#result',warnings.length?'warn':'ok',warnings.length?'Respaldo parcial descargado con los datos y fotos disponibles de '+esc(data.tag)+'. '+warnings.map(esc).join(' '):'Paquete descargado con los datos y fotos de '+esc(data.tag)+'.');}catch(error){message('#result','err',esc(error.message));}finally{lockForm(false);}};
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
$('#photo-input').onchange=e=>{
 const tag=activeTag,files=[...e.target.files];e.target.value='';if(!tag||!photoReady||submitting)return;
 $('#photo-status').textContent='Preparando fotos de '+tag+'…';
 queuePhotos(tag,async()=>{
  const added=[];for(const file of files)added.push(await shrink(file));
  const next=await updateSurveyPhotos(tag,latest=>{if(latest.length+added.length>8)throw Error('Máximo 8 adjuntos por equipo.');return [...latest,...added];});
  if(activeTag===tag){photos=next.map(photo=>({...photo,url:'data:image/jpeg;base64,'+photo.base64}));renderPhotos();$('#photo-status').textContent='Fotos guardadas en este navegador para '+tag+'.';}
 }).catch(error=>{if(activeTag===tag)$('#photo-status').textContent='No se confirmaron las fotos nuevas: '+error.message+' Las anteriores se conservan.';});
};
$('#photo-retry').onclick=()=>{if(!submitting){$('#photo-retry').hidden=true;loadPhotos(activeTag,selection);}};
$('#replace-orings').onchange=()=>{
 $('#orings').innerHTML='';
 replacementBase=null;if($('#replace-orings').checked){const rings=(current?.data?.documental||current?.data||{}).orings||[];replacementBase=JSON.parse(JSON.stringify(rings));rings.forEach((o,existingIndex)=>oringRow({...o,existingIndex}));}
 saveDraft();
};
$('#add-oring').onclick = () => {oringRow();saveDraft();};
window.addEventListener('pagehide',saveDraft);
$('#tag').addEventListener('change',selectTag);
$('#tag').addEventListener('input',showTarget);
$('#abrir-equipo').onclick=()=>selectTag().catch(reportDraftError);
$('#tag').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();selectTag().catch(reportDraftError);}});
$('#form').addEventListener('input', e => { if (e.target.id === 'tag') return; clearTimeout(saveDraft.t); saveDraft.t = setTimeout(saveDraft, 400); });

try {
 const r = await fetch('/api/survey-catalog'); info = await r.json(); if (!r.ok) throw new Error(info.error);
} catch (err) { message('#mode', 'err', 'No se pudo leer la lista de equipos: ' + esc(err.message)); }
$('#tags').innerHTML = info.rows.map(r => `<option value="${esc(r.tag)}">${esc(r.servicio)}</option>`).join('');
message('#mode', info.writable ? (info.demo ? 'warn' : 'ok') : 'warn', info.writable
 ? (info.demo ? 'Modo demostración: se escribe en la bóveda de ejemplo.' : 'Conectado a Obsidian: lo que guardes se escribe en la ficha.')
 : 'Guardado local en este navegador. Los cambios no se sincronizan con Obsidian. Guardá aquí y descargá el paquete para llevarlo a planta.');
syncActions();
$('#form [name=date]').value = today();
$('#form [name=author]').value = store.get('vocatus-responsable') || '';
const start = new URLSearchParams(location.search).get('tag');
if (start) $('#tag').value = start.toUpperCase();
await selectTag();

async function renderPhotoEditor(){
 const tag=activeTag,target=$('#component-photos');if(!tag||!current)return;
 const p={...current.data,tag},options={writable:!!info.writable,token:info.token};
 const original=originales(p,expedienteDe(p));
 let act={},photoError='';try{act=await fotosActualizadas(tag,options);photoError=act.warning||'';}catch(error){photoError=error.message;}while(submitting&&activeTag===tag)await new Promise(resolve=>setTimeout(resolve,30));if(activeTag!==tag||!target.isConnected)return;
 target.innerHTML=htmlFotos(p,original,act,options);
 bindPhotoTransfers(target,tag,options,renderPhotoEditor);if(photoError){target.querySelector('#fotos-error').textContent=photoError;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=renderPhotoEditor;target.querySelector('#fotos-error').after(retry);}
 target.querySelectorAll('input[data-slot]').forEach(input=>{

  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;input.disabled=true;try{await photoInputStarted(input);await guardarFoto(tag,input.dataset.slot,file,options);if(activeTag===tag)await renderPhotoEditor();}catch(error){setPhotoInputStatus(input,error.message,true);if(activeTag===tag)target.querySelector('#fotos-error').textContent=error.message;}finally{input.disabled=false;input.value='';}};
 });
}

// Teléfono: los botones «Quitar dato incorrecto» se muestran solo al activar este modo,
// para que el formulario no duplique cada campo con un botón. Un dato ya marcado sigue visible.
{const modo=document.getElementById('modo-corregir');if(modo)modo.onclick=()=>{const activo=document.body.classList.toggle('modo-corregir');modo.setAttribute('aria-pressed',String(activo));modo.textContent=activo?'Terminar de corregir datos':'Corregir o quitar datos registrados';};}
