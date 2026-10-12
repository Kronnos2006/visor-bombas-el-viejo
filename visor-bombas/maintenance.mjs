import path from 'node:path';
import { readFile, readdir, mkdir, writeFile, rename, stat } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { load, JSON_SCHEMA } from './vendor/js-yaml.mjs';

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
   const record = {id: name, tag, date: String(data.fecha || name.slice(tag.length + 1, tag.length + 11)), title: String(data.titulo || body.match(/^# [^\n]*? — (.+)$/m)?.[1] || name), author: String(data.responsable || body.match(/^Responsable: (.+)$/m)?.[1] || ''), text: bodySection(body, 'Intervención'), parts: bodySection(body, 'Repuestos utilizados'), symptoms: bodySection(body, 'Síntomas observados'), created: (await stat(path.join(logs, name))).mtimeMs, source: 'obsidian', file, demonstration: data.demostracion === true || data.demostracion === 'true', sourceId: data.origen_id || '', pdf: null};
   if (data.adjunto) {
    const attachment = safeAttachment(data.adjunto);
    let size = null;
    try { size = (await stat(attachment)).size; } catch (e) { if (e.code !== 'ENOENT') throw e; }
    if (size != null) record.pdf = {name: data.adjunto_nombre || path.basename(attachment), size, path: data.adjunto, url: `/api/report-document?tag=${encodeURIComponent(tag)}&id=${encodeURIComponent(name)}`};
   }
   reports.push({file, text: raw, record});
  }
  return reports;
 }
 async function save(tag, input) {
  const date = field(input.date, 10), title = field(input.title), author = field(input.author);
  const details = text(input.details), parts = text(input.parts), symptoms = text(input.symptoms);
  if (!validDate(date) || !title || !author || !details && !input.attachment) throw new Error('Completá una fecha válida, intervención, responsable y detalle o PDF.');
  const sourceId = field(input.sourceId, 100);
  if (sourceId) {
   const prior = (await list(tag)).find(r => r.record.sourceId === sourceId);
   if (prior) return prior.record;
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
  const header = ['tipo: informe_mantenimiento', `tag: ${tag}`, `bomba: ${tag}`, `fecha: ${yaml(date)}`, `titulo: ${yaml(title)}`, `responsable: ${yaml(author)}`, `demostracion: ${demo}`, `origen_id: ${yaml(sourceId)}`, `repuesto_usado: ${yaml(field(parts, 4000))}`, `descripcion: ${yaml(field(details, 8000))}`, ...(pdf ? [`adjunto: ${yaml(attachmentPath)}`, `adjunto_nombre: ${yaml(pdf.name)}`] : [])].join('\n');
  const doc = `---\n${header}\n---\n\n# ${tag} — ${title}\n\n${demo ? 'DEMOSTRACIÓN: registro de prueba, no corresponde a una intervención real.\n\n' : ''}Responsable: ${author}\n\n## Intervención\n${details}\n\n## Repuestos utilizados\n${parts || 'No registrados.'}\n\n## Síntomas observados\n${symptoms || 'No registrados.'}\n\nFicha: [[00-Proyecto/${tag.startsWith('B') ? 'equipos' : 'bombas'}/${tag}|${tag}]]\n${pdf ? `\nAdjunto: [${pdf.name.replace(/[\[\]]/g, '')}](Adjuntos/${id}.pdf)\n` : ''}`;
  await mkdir(logs, {recursive: true});
  if (pdf) {
   await mkdir(path.dirname(safeAttachment(attachmentPath)), {recursive: true});
   try { await writeFile(safeAttachment(attachmentPath), pdf.bytes, {flag: 'wx'}); }
   catch (e) { if (e.code !== 'EEXIST' || !sourceId || !(await readFile(safeAttachment(attachmentPath))).equals(pdf.bytes)) throw e; }
  }
  try { await writeFile(path.join(logs, id + '.md'), doc, {flag: 'wx'}); }
  catch (e) { if (e.code !== 'EEXIST' || !sourceId) throw e; }
  return (await list(tag)).find(r => r.record.id === id + '.md').record;
 }
 async function remove(tag, id) {
  const report = (await list(tag)).find(r => r.record.id === id);
  if (!report) throw new Error('Informe no encontrado.');
  const trash = path.join(vault, '.trash/Mantenimiento', randomUUID());
  await mkdir(trash, {recursive: true});
  // Obsidian conserva el informe y su adjunto en papelera para poder recuperarlos.
  if (report.record.pdf) await rename(safeAttachment(report.record.pdf.path), path.join(trash, path.basename(report.record.pdf.path)));
  await rename(path.join(logs, id), path.join(trash, id));
 }
 async function attachment(tag, id) {
  const report = (await list(tag)).find(r => r.record.id === id);
  if (!report?.record.pdf) throw new Error('Adjunto no encontrado.');
  return {bytes: await readFile(safeAttachment(report.record.pdf.path)), name: report.record.pdf.name};
 }
 return {list, save, remove, attachment};
}
