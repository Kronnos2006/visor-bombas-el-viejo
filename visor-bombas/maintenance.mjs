import {normalizeEvidence} from './public/evidence-core.js';
import path from 'node:path';
import { readFile, readdir, mkdir, writeFile, rename, stat, unlink } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { load, JSON_SCHEMA } from './vendor/js-yaml.mjs';
import { measurementInput } from './public/measurements.js';

const MAX_PDF = 10 * 1024 * 1024;
const text = (value, max = 8000) => String(value ?? '').replace(/\r/g, '').slice(0, max).trim();
const field = (value, max = 200) => text(value, max).replace(/\n/g, ' ');
const yaml = value => JSON.stringify(value);
function bodySection(body, heading) {
 return body.split(/^##\s+/m).find(s => s.split(/\r?\n/)[0].trim() === heading)?.split(/\r?\n/).slice(1).join('\n').trim() || '';
}
export function validDate(date) {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
 const parsed = new Date(date + 'T00:00:00Z');
 return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}
export function maintenanceStore(vault, demo) {
 const logs = path.join(vault, '00-Proyecto/Mantenimiento');
 const safeAttachment = relative => {
  if (typeof relative !== 'string' || !/^00-Proyecto\/Mantenimiento\/Adjuntos\/[A-Za-z0-9_-]+\.pdf$/.test(relative)) throw new Error('Adjunto inválido.');
  return path.join(vault, relative);
 };
 const safeEvidence=relative=>{if(typeof relative!=='string'||!/^00-Proyecto\/Mantenimiento\/Adjuntos\/[A-Za-z0-9_-]+\.(jpg|png|webp)$/.test(relative))throw new Error('Ruta de evidencia inválida.');return path.join(vault,relative);};
 async function list(tag) {
  let names;
  try { names = await readdir(logs); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  const reports = [];
  for (const name of names.filter(n => n.startsWith(tag + '_') && n.endsWith('.md')).sort().reverse()) {
   const raw = await readFile(path.join(logs, name), 'utf8');
   const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
   const data = match ? load(match[1], {schema: JSON_SCHEMA}) || {} : {};
   if (data.tag && data.tag !== tag || data.bomba && data.bomba !== tag) throw new Error(`El informe ${name} pertenece a otro equipo.`);
   const body = match?.[2] || raw;
   const file = '00-Proyecto/Mantenimiento/' + name;
   const record = {id: name, tag, date: String(data.fecha || name.slice(tag.length + 1, tag.length + 11)), title: String(data.titulo || body.match(/^# [^\n]*? — (.+)$/m)?.[1] || name), author: String(data.responsable || body.match(/^Responsable: (.+)$/m)?.[1] || ''), text: bodySection(body, 'Intervención'), parts: bodySection(body, 'Repuestos utilizados'), symptoms: bodySection(body, 'Síntomas observados'), created: (await stat(path.join(logs, name))).mtimeMs, source: 'obsidian', file, demonstration: data.demostracion === true || data.demostracion === 'true', mediciones: {presion_bar: data.medicion_presion_bar ?? null, caudal_m3h: data.medicion_caudal_m3h ?? null}, sourceId: data.origen_id || '', workOrderId: data.orden_trabajo || '', pdf: null};
   if (data.adjunto) {
    const attachment = safeAttachment(data.adjunto);
    let size = null;
    try { size = (await stat(attachment)).size; } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (size != null) record.pdf = {name: data.adjunto_nombre || path.basename(attachment), size, path: data.adjunto, url: `/api/report-document?tag=${encodeURIComponent(tag)}&id=${encodeURIComponent(name)}`};
   }
   record.evidence=[];
   for(const [index,image] of (Array.isArray(data.evidencias)?data.evidencias:[]).entries()){const filename=safeEvidence(image.path);let info;try{info=await stat(filename);}catch(e){if(e.code==='ENOENT')continue;throw e;}if(info.isFile())record.evidence.push({name:String(image.name||path.basename(filename)),mime:({jpg:'image/jpeg',png:'image/png',webp:'image/webp'})[path.extname(filename).slice(1)],size:info.size,path:image.path,url:`/api/report-evidence?tag=${encodeURIComponent(tag)}&id=${encodeURIComponent(name)}&index=${index}`});}
   reports.push({file, text: raw, record});
  }
  return reports;
 }
 async function save(tag, input) {
  const photos=normalizeEvidence(input.evidence||[]);
  const date = field(input.date, 10), title = field(input.title), author = field(input.author);
  const details = text(input.details), parts = text(input.parts), symptoms = text(input.symptoms);
  // ¿Quedó funcionando? 'si' | 'no' | vacío (no se indicó).
  const operativo = input.operativo === undefined || input.operativo === '' ? null : input.operativo === 'si' ? true : input.operativo === 'no' ? false : (() => { throw new Error('Indicá si el equipo quedó funcionando: sí o no.'); })();
  if (!validDate(date) || !title || !author || !details && !input.attachment) throw new Error('Completá una fecha válida, intervención, responsable y detalle o PDF.');
  // Mediciones con unidad fija (bar, m³/h) y la fecha del informe; vacías si no se midió.
  const med = measurementInput(input.measurements?.presion_bar, input.measurements?.caudal_m3h);
  const sourceId = field(input.sourceId, 100);
  if (sourceId) {
   const prior = (await list(tag)).find(r => r.record.sourceId === sourceId);
   if(prior){
    const saved=prior.record.evidence||[];let same=saved.length===photos.length;
    for(let i=0;same&&i<photos.length;i++)same=photos[i].name===saved[i].name&&(await readFile(safeEvidence(saved[i].path))).equals(Buffer.from(photos[i].base64,'base64'));
    if(!same)throw new Error('Este reporte ya se guardó con fotos diferentes. Revisá su historial; el borrador actual se conserva.');
    return prior.record;
   }
  }
  let pdf = null;
  if (input.attachment) {
   const encoded = input.attachment.base64;
   if (typeof encoded !== 'string' || encoded.length > Math.ceil(MAX_PDF / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('PDF inválido o mayor de 10 MB.');
   const bytes = Buffer.from(encoded, 'base64');
   if (bytes.length > MAX_PDF || bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('El adjunto debe ser un PDF válido de hasta 10 MB.');
   pdf = {bytes, name: field(input.attachment.name, 160)};
  }
  const id = `${tag}_${date}_${sourceId ? createHash('sha256').update(sourceId).digest('hex') : randomUUID()}`;
  const attachmentPath = pdf ? `00-Proyecto/Mantenimiento/Adjuntos/${id}.pdf` : '';
  const evidence=photos.map((photo,i)=>({name:photo.name,mime:photo.mime,path:`00-Proyecto/Mantenimiento/Adjuntos/${id}_e${i}.${({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[photo.mime]}`}));
  const header = ['tipo: informe_mantenimiento', `tag: ${tag}`, `bomba: ${tag}`, `fecha: ${yaml(date)}`, `titulo: ${yaml(title)}`, `responsable: ${yaml(author)}`, `demostracion: ${demo}`, `origen_id: ${yaml(sourceId)}`, ...(input.workOrderId?[`orden_trabajo: ${yaml(input.workOrderId)}`]:[]), `repuesto_usado: ${yaml(field(parts, 4000))}`, `descripcion: ${yaml(field(details, 8000))}`, ...(operativo !== null ? [`equipo_funcional: ${operativo}`] : []), ...(med.presion_bar !== null ? [`medicion_presion_bar: ${med.presion_bar}`] : []), ...(med.caudal_m3h !== null ? [`medicion_caudal_m3h: ${med.caudal_m3h}`] : []), ...(med.presion_bar !== null || med.caudal_m3h !== null ? [`medicion_fecha: ${yaml(date)}`] : []), ...(evidence.length?[`evidencias: ${JSON.stringify(evidence)}`]:[]), ...(pdf ? [`adjunto: ${yaml(attachmentPath)}`, `adjunto_nombre: ${yaml(pdf.name)}`] : [])].join('\n');
  const doc = `---\n${header}\n---\n\n# ${tag} — ${title}\n\n${demo ? 'DEMOSTRACIÓN: registro de prueba, no corresponde a una intervención real.\n\n' : ''}Responsable: ${author}\n${operativo !== null ? `Estado al terminar: ${operativo ? 'quedó funcionando' : 'no quedó funcionando'}\n` : ''}\n## Intervención\n${details}\n\n## Repuestos utilizados\n${parts || 'No registrados.'}\n\n## Síntomas observados\n${symptoms || 'No registrados.'}\n\nFicha: [[00-Proyecto/${tag.startsWith('B') ? 'equipos' : 'bombas'}/${tag}|${tag}]]\n${evidence.length?'\n## Evidencia fotográfica\n'+evidence.map(photo=>`![${photo.name.replace(/[\[\]\(\)]/g,'')}](Adjuntos/${path.basename(photo.path)})`).join('\n')+'\n':''}${pdf ? `\nAdjunto: [${pdf.name.replace(/[\[\]]/g, '')}](Adjuntos/${id}.pdf)\n` : ''}`;
  await mkdir(logs, {recursive: true});
  if (pdf) {
   await mkdir(path.dirname(safeAttachment(attachmentPath)), {recursive: true});
   try { await writeFile(safeAttachment(attachmentPath), pdf.bytes, {flag: 'wx'}); }
   catch (e) { if (e.code !== 'EEXIST' || !sourceId || !(await readFile(safeAttachment(attachmentPath))).equals(pdf.bytes)) throw e; }
  }
  const created=[];
  try{
   for(const [i,photo] of photos.entries()){const filename=safeEvidence(evidence[i].path),bytes=Buffer.from(photo.base64,'base64');await mkdir(path.dirname(filename),{recursive:true});try{await writeFile(filename,bytes,{flag:'wx'});created.push(filename);}catch(e){if(e.code!=='EEXIST'||!sourceId||!(await readFile(filename)).equals(bytes))throw e;}}
   try{await writeFile(path.join(logs,id+'.md'),doc,{flag:'wx'});}catch(e){if(e.code!=='EEXIST'||!sourceId)throw e;}
  }catch(e){for(const filename of created)try{await unlink(filename);}catch{}throw e;}

  return (await list(tag)).find(r => r.record.id === id + '.md').record;
 }
 async function remove(tag, id) {
  const report = (await list(tag)).find(r => r.record.id === id);
  if (!report) throw new Error('Informe no encontrado.');
  const trash = path.join(vault, '.trash/Mantenimiento', randomUUID());
  await mkdir(trash, {recursive: true});
  // Obsidian conserva el informe y su adjunto en papelera para poder recuperarlos.
  if (report.record.pdf) await rename(safeAttachment(report.record.pdf.path), path.join(trash, path.basename(report.record.pdf.path)));
  for(const image of report.record.evidence||[])await rename(safeEvidence(image.path),path.join(trash,path.basename(image.path)));
  await rename(path.join(logs, id), path.join(trash, id));
 }
 async function attachment(tag, id) {
  const report = (await list(tag)).find(r => r.record.id === id);
  if (!report?.record.pdf) throw new Error('Adjunto no encontrado.');
  return {bytes: await readFile(safeAttachment(report.record.pdf.path)), name: report.record.pdf.name};
 }
 async function evidence(tag,id,index){if(!Number.isInteger(index)||index<0||index>3)throw new Error('Índice de foto inválido.');const report=(await list(tag)).find(r=>r.record.id===id);const image=report?.record.evidence?.find(x=>Number(new URL(x.url,'http://local').searchParams.get('index'))===index);if(!image)throw new Error('Evidencia no encontrada.');return {bytes:await readFile(safeEvidence(image.path)),name:image.name,mime:image.mime};}
 // Estado con que quedó cada equipo en su último informe (fecha más reciente; mismo día, el último guardado).
 async function latestStatus() {
  let names;
  try { names = await readdir(logs); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
  const last = new Map();
  for (const name of names.filter(n => /^[A-Za-z0-9-]+_\d{4}-\d{2}-\d{2}_.+\.md$/.test(n))) {
   const [tag, date] = name.split('_'), mtime = (await stat(path.join(logs, name))).mtimeMs, prev = last.get(tag);
   if (!prev || date > prev.date || date === prev.date && mtime > prev.mtime) last.set(tag, {name, date, mtime});
  }
  const out = [];
  for (const [tag, {name, date}] of last) {
   const match = (await readFile(path.join(logs, name), 'utf8')).replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
   const data = match ? load(match[1], {schema: JSON_SCHEMA}) || {} : {};
   out.push({tag, date: String(data.fecha || date), title: String(data.titulo || ''), funcional: data.equipo_funcional === true ? true : data.equipo_funcional === false ? false : null});
  }
  return out.sort((a, b) => a.tag.localeCompare(b.tag));
 }
 return {list, save, remove, attachment, evidence, latestStatus};
}
