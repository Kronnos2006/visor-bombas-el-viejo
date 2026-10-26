// Mover o reemplazar una bomba (sector de tanques o torre) desde el visor.
// Todo cambio queda en la ficha de Obsidian: la posición nueva en el frontmatter y
// una línea en «## Cambios de ubicación y reemplazos».
// Al reemplazar, la ficha completa de la bomba retirada se archiva en
// 00-Proyecto/equipos/retirados/ y en la ficha de la posición solo se conservan los
// datos de la posición (POSITION_KEYS); todo lo demás queda vacío hasta levantarlo.
// Antes de escribir una ficha se guarda un respaldo en 00-Proyecto/Respaldos/fichas/.
// Los respaldos permiten recuperar un estado anterior; no protegen contra dos personas
// editando la misma ficha al mismo tiempo (Obsidian y el visor).
import path from 'node:path';
import { readFile, writeFile, rename, mkdir, copyFile, readdir, access } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { splitNote, setKey, one, fileOf, kindOf, FIELDS } from './survey.mjs';
import {rangoTemperaturaTrabajo} from './public/temperatura-trabajo.js';

// Límites de cada área en sus coordenadas locales (sector de tanques y torre: ejes 1–5 × A–E).
const LIMITS = {tanques: {x0: -15.5, x1: 15.5, z0: -14, z1: 12}, torre: {x0: -1, x1: 16.5, z0: -1, z1: 23}};
const areaOf = base => base?.areaId === 'torre' ? 'torre' : 'tanques';
const round = v => Math.round(v * 100) / 100;
// Campos de identificación que se reemplazan cuando se instala otra bomba.
export const REPLACE_FIELDS = [
 ...FIELDS.filter(f => ['marca', 'modelo', 'serie', 'tamano', 'rpm'].includes(f.id)),
 {id: 'motor_marca', label: 'Marca del motor', P: null, B: 'motor_marca'},
 {id: 'motor_hp', label: 'Potencia del motor (HP)', P: null, B: 'motor_hp', number: true},
 {id: 'motor_rpm', label: 'RPM del motor', P: null, B: 'motor_rpm', number: true},
 {id: 'potencia_kw', label: 'Potencia (kW)', P: 'potencia_kw', B: null, number: true},
];
const SEAL_KEYS = {
 P: ['tipo_sellado', 'sello_marca', 'sello_modelo', 'sello_tipo', 'sello_diametro_mm', 'sello_cara_rotativa', 'sello_cara_estatica', 'sello_elastomero', 'sello_resorte', 'sello_codigo', 'empaque_marca', 'empaque_tipo', 'empaque_seccion_mm', 'empaque_anillos'],
 B: ['tipo_sellado', 'sello_tipo', 'sello_eje_pulg', 'sello_cara_rotativa', 'sello_cara_estatica', 'sello_elastomero', 'sello_resorte', 'sello_codigo', 'empaque_declarado', 'empaque_seccion_pulg', 'empaque_seccion_mm', 'empaque_anillos'],
};
// Lo que describe la posición y no el equipo instalado: se conserva al reemplazar.
export const POSITION_KEYS = new Set(['tipo', 'id', 'tag', 'area', 'ubicacion', 'liquido', 'servicio', 'posicion_x', 'posicion_z', 'rotacion_grados']);
// Ranuras de fotos del expediente que muestran el equipo (no la posición).
const EQUIPMENT_PHOTO_SLOTS = ['placa1', 'placa2', 'bomba'];
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const cell = v => String(v ?? '').replace(/\|/g, '/').replace(/[\r\n]+/g, ' ').trim() || '—';
const scalar = (value, number) => number && /^-?\d+(\.\d+)?$/.test(String(value)) ? String(value) : JSON.stringify(String(value));

function appendLog(body, heading, entry) {
 const re = new RegExp(`^## ${heading}[^\\S\\n]*$`, 'm');
 if (re.test(body)) return body.replace(re, m => `${m}\n${entry}`);
 return body.replace(/\s*$/, '') + `\n\n## ${heading}\n${entry}\n`;
}
function appendRow(body, heading, header, row) {
 const re = new RegExp(`^## ${heading}[^\\S\\n]*\\n(?:.*\\n)*?(\\|[- |]+\\|)\\n`, 'm');
 if (re.test(body)) return body.replace(re, m => `${m}${row}\n`);
 return body.replace(/\s*$/, '') + `\n\n## ${heading}\n\n${header}\n${row}\n`;
}
function common(input) {
 const date = one(input.date, 10), author = one(input.author), reason = one(input.reason, 300);
 if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || !author) throw new Error('Completá la fecha y quién hizo el cambio.');
 return {date, author, reason};
}
function position(input, area = 'tanques') {
 const L = LIMITS[area];
 const x = Number(input.x), z = Number(input.z), rotation = Number(input.rotation ?? 0);
 if (![x, z, rotation].every(Number.isFinite)) throw new Error('Posición inválida.');
 if (x < L.x0 || x > L.x1 || z < L.z0 || z > L.z1) throw new Error(area === 'torre' ? 'La posición queda fuera de la torre.' : 'La posición queda fuera del sector.');
 return {x: round(x), z: round(z), rotation: ((Math.round(rotation) % 360) + 360) % 360};
}

// Valor vacío para una clave del frontmatter, según el tipo de lo que tenía.
function emptyLine(key, lines) {
 const first = lines[0].slice(key.length + 1).trim();
 if (first.startsWith('[') || (first === '' && lines.length > 1 && /^\s*-\s/.test(lines[1]))) return `${key}: []`;
 if (first === 'true' || first === 'false') return `${key}: false`;
 return `${key}: ""`;
}
// Claves del frontmatter con todas sus líneas (las listas ocupan varias).
function frontEntries(front) {
 const out = [], lines = front.split('\n');
 for (let i = 0; i < lines.length; i++) {
  const m = /^([A-Za-z_][\w-]*):/.exec(lines[i]); if (!m) continue;
  let end = i + 1; while (end < lines.length && /^(\s+\S|\s*-\s)/.test(lines[end])) end++;
  out.push({key: m[1], lines: lines.slice(i, end)}); i = end - 1;
 }
 return out;
}

// opciones.antesDeEscribir(tag): solo para pruebas (simular un fallo de disco a mitad de un intercambio).
export function equipmentStore(vault, basePositions, opciones = {}) {
 const file = tag => path.join(vault, fileOf(tag));
 const backupDir = path.join(vault, '00-Proyecto', 'Respaldos', 'fichas');
 // Copia la ficha tal como está antes de modificarla. Devuelve la ruta del respaldo.
 async function backup(tag) {
  await mkdir(backupDir, {recursive: true});
  const dest = path.join(backupDir, `${tag}_${stamp()}_${randomUUID().slice(0, 4)}.md.respaldo`);
  await copyFile(file(tag), dest);
  return dest;
 }
 async function restore(tag, copy) {
  const temp = `${file(tag)}.${randomUUID().slice(0, 8)}.tmp`;
  await copyFile(copy, temp); await rename(temp, file(tag));
 }
 async function backups(tag) {
  try { return (await readdir(backupDir)).filter(n => n.startsWith(tag + '_') && n.endsWith('.md.respaldo')).sort().map(n => path.join(backupDir, n)); }
  catch (e) { if (e.code === 'ENOENT') return []; throw e; }
 }
 async function load(tag) {
  let raw;
  try { raw = await readFile(file(tag), 'utf8'); }
  catch (e) { if (e.code === 'ENOENT') { const m = new Error(`No existe la ficha ${fileOf(tag)} en esta bóveda.`); m.code = 'PUMP_NOT_AVAILABLE'; throw m; } throw e; }
  const note = splitNote(raw);
  if ((note.data.tag || note.data.id) !== tag) throw new Error('El identificador de la ficha no coincide con el equipo.');
  return note;
 }
 async function save(tag, front, body) {
  await opciones.antesDeEscribir?.(tag);
  const next = `---\n${front}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
  splitNote(next);
  const temp = `${file(tag)}.${randomUUID().slice(0, 8)}.tmp`;
  await writeFile(temp, next, 'utf8'); await rename(temp, file(tag));
 }
 // Posición vigente: la de la ficha si se movió, si no la del prototipo del sector.
 function current(tag, data) {
  const base = basePositions.find(p => p.tag === tag);
  if (!base) throw new Error(`${tag} no está en el sector del visor: solo se pueden mover bombas del mapa.`);
  const has = k => data[k] !== '' && data[k] != null && Number.isFinite(Number(data[k]));
  return {
   x: has('posicion_x') && has('posicion_z') ? Number(data.posicion_x) : base.x,
   z: has('posicion_x') && has('posicion_z') ? Number(data.posicion_z) : base.z,
   rotation: has('rotacion_grados') ? Number(data.rotacion_grados) : Math.round(base.rotation * 180 / Math.PI),
  };
 }
 function placed(note, to) {
  let front = note.front;
  front = setKey(front, 'posicion_x', `posicion_x: ${to.x}`);
  front = setKey(front, 'posicion_z', `posicion_z: ${to.z}`);
  return setKey(front, 'rotacion_grados', `rotacion_grados: ${to.rotation}`);
 }
 const where = p => `(x ${round(p.x)}, z ${round(p.z)}, ${Math.round(p.rotation)}°)`;

 async function move(tag, input) {
  const {date, author, reason} = common(input), to = position(input, areaOf(basePositions.find(p => p.tag === tag)));
  const note = await load(tag), from = current(tag, note.data);
  const body = appendLog(note.body, 'Cambios de ubicación y reemplazos', `- ${date} · ${author}: movida de ${where(from)} a ${where(to)}${reason ? `. Motivo: ${reason}` : ''}`);
  const copy = await backup(tag);
  await save(tag, placed(note, to), body);
  return {tag, action: 'move', from, to, backup: path.relative(vault, copy)};
 }
 async function swap(tag, other, input) {
  const {date, author, reason} = common(input);
  if (tag === other) throw new Error('Elegí otra bomba para intercambiar.');
  const ba = basePositions.find(p => p.tag === tag), bb = basePositions.find(p => p.tag === other);
  if (ba && bb && areaOf(ba) !== areaOf(bb)) throw new Error('Solo se pueden intercambiar bombas de la misma área.');
  const a = await load(tag), b = await load(other);
  const pa = current(tag, a.data), pb = current(other, b.data);
  const log = (who, from, to) => `- ${date} · ${author}: intercambió lugar con ${who}, de ${where(from)} a ${where(to)}${reason ? `. Motivo: ${reason}` : ''}`;
  // Se respaldan ambas fichas antes de escribir. Si la segunda escritura falla, la primera vuelve
  // a su estado original para no dejar dos bombas en el mismo lugar.
  const copyA = await backup(tag), copyB = await backup(other);
  await save(tag, placed(a, pb), appendLog(a.body, 'Cambios de ubicación y reemplazos', log(other, pa, pb)));
  try { await save(other, placed(b, pa), appendLog(b.body, 'Cambios de ubicación y reemplazos', log(tag, pb, pa))); }
  catch (err) {
   let restored = true; try { await restore(tag, copyA); } catch { restored = false; }
   const e = new Error(`No se pudo escribir ${other}: ${err.message}. ${restored ? `${tag} volvió a su posición original; no se hizo ningún cambio.` : `ATENCIÓN: ${tag} quedó modificada y no se pudo restaurar. Respaldo: ${path.relative(vault, copyA)}.`}`);
   e.code = 'SWAP_FAILED'; throw e;
  }
  return {tag, other, action: 'swap', backups: [path.relative(vault, copyA), path.relative(vault, copyB)]};
 }
 async function replace(tag, input) {
  const {date, author, reason} = common(input), k = kindOf(tag);
  const fields = REPLACE_FIELDS.filter(f => f[k]);
  const values = Object.fromEntries(fields.map(f => [f.id, one(input.fields?.[f.id])]).filter(([, v]) => v));
  if (!values.marca || !values.modelo) throw new Error('Indicá al menos la marca y el modelo de la bomba nueva.');
  const note = await load(tag), d = note.data, key = id => fields.find(f => f.id === id)?.[k];
  const previousTemperature = rangoTemperaturaTrabajo(d);
  const old = id => key(id) ? d[key(id)] : '';
  // 1. Expediente completo de la bomba retirada: copia íntegra de la ficha en retirados/.
  const slug = v => String(v || 'sin-dato').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'sin-dato';
  const archiveRel = `00-Proyecto/equipos/retirados/${tag}_retirada_${date}_${slug(old('marca'))}-${slug(old('modelo'))}_${randomUUID().slice(0, 4)}.md`;
  let archived = setKey(note.front, 'tipo', 'tipo: equipo-retirado');
  archived = setKey(archived, 'retirada_fecha', `retirada_fecha: ${JSON.stringify(date)}`);
  archived = setKey(archived, 'retirada_por', `retirada_por: ${JSON.stringify(author)}`);
  archived = setKey(archived, 'retirada_motivo', `retirada_motivo: ${JSON.stringify(reason)}`);
  await mkdir(path.join(vault, '00-Proyecto/equipos/retirados'), {recursive: true});
  await writeFile(path.join(vault, archiveRel), `---\n${archived}\n---\n\n> Expediente archivado de la bomba retirada de la posición [[${tag}]] el ${date}. No describe el equipo instalado actualmente.\n${note.body}`, {encoding: 'utf8', flag: 'wx'});
  const archiveLink = `[[${archiveRel.replace(/^00-Proyecto\/equipos\//, '').replace(/\.md$/, '')}]]`;
  // 2. Ficha de la posición: se conserva solo lo que describe la posición; el resto queda vacío.
  let front = note.front;
  // Si quien registra confirma que la bomba nueva conserva el mismo sello, sello y o-rings no se vacían.
  const keep = new Set([...POSITION_KEYS, ...(input.clearSeal === false ? [...SEAL_KEYS[k], 'orings'] : [])]);
  for (const {key: name, lines} of frontEntries(note.front)) if (!keep.has(name)) front = setKey(front, name, emptyLine(name, lines));
  for (const f of fields) front = setKey(front, f[k], `${f[k]}: ${values[f.id] ? scalar(values[f.id], f.number) : '""'}`);
  front = setKey(front, 'fuente', `fuente: ${JSON.stringify(`Reemplazo registrado en el visor el ${date} por ${author}`)}`);
  if (k === 'B') {
   front = setKey(front, 'asociacion_placa', `asociacion_placa: ${values.serie ? 'confirmada_en_campo' : 'sin_asociar'}`);
   front = setKey(front, 'placa_nota', `placa_nota: ${JSON.stringify(values.serie ? `Bomba instalada el ${date}; placa registrada por ${author}` : `Bomba reemplazada el ${date}; placa por levantar`)}`);
  }
  front = setKey(front, 'fecha_instalacion', `fecha_instalacion: ${JSON.stringify(date)}`);
  front = setKey(front, 'reemplazo_fecha', `reemplazo_fecha: ${JSON.stringify(date)}`);
  front = setKey(front, 'reemplazo_archivo', `reemplazo_archivo: ${JSON.stringify(archiveLink)}`);
  let body = appendRow(note.body, 'Equipos anteriores en esta posición',
   '| Retirada | Marca | Modelo | Serie | Tamaño | Motivo | Responsable | Expediente |\n|---|---|---|---|---|---|---|---|',
   `| ${date} | ${cell(old('marca'))} | ${cell(old('modelo'))} | ${cell(old('serie'))} | ${cell(old('tamano'))} | ${cell(reason)} | ${cell(author)} | ${archiveLink} |`);
  if (previousTemperature) body = appendLog(body, 'Cambios de temperatura de trabajo', `- ${date} · ${cell(author)}: al reemplazar la bomba se archivó el rango anterior ${previousTemperature.min} a ${previousTemperature.max} °C. Fuente: ${cell(previousTemperature.fuente)}.`);
  body = appendLog(body, 'Cambios de ubicación y reemplazos', `- ${date} · ${author}: reemplazada ${cell(old('marca'))} ${cell(old('modelo'))} por ${values.marca} ${values.modelo}${reason ? `. Motivo: ${reason}` : ''}. Expediente anterior: ${archiveLink}. ${input.clearSeal === false ? 'Sello y o-rings se conservan (confirmado al registrar). Prestaciones, motor, rodamientos, acople y fotos' : 'Prestaciones, motor, sello, o-rings, rodamientos, acople y fotos'} de la bomba nueva quedan por levantar.`);
  const copy = await backup(tag);
  await save(tag, front, body);
  // 3. Las fotos del expediente que muestran el equipo pasan al historial (la de la posición se conserva).
  const photoDir = path.join(vault, '00-Proyecto/fotos-campo', tag, 'expediente'), movedPhotos = [];
  for (const slot of EQUIPMENT_PHOTO_SLOTS) for (const ext of ['jpg', 'png']) {
   const src = path.join(photoDir, `${slot}.${ext}`);
   try { await access(src); } catch { continue; }
   await mkdir(path.join(photoDir, 'historial'), {recursive: true});
   await rename(src, path.join(photoDir, 'historial', `${slot}_retirada_${date}_${stamp()}.${ext}`)); movedPhotos.push(slot);
  }
  return {tag, action: 'replace', previous: {marca: old('marca'), modelo: old('modelo'), serie: old('serie')}, archive: archiveRel, backup: path.relative(vault, copy), photosArchived: movedPhotos};
 }
 async function temperature(tag, input) {
  const rawMin=String(input.min ?? '').trim().replace(',', '.');
  const rawMax=String(input.max ?? '').trim().replace(',', '.');
  const min=Number(rawMin),max=Number(rawMax);
  if(!rawMin||!rawMax||!Number.isFinite(min)||!Number.isFinite(max)||min>max||min< -273.15)throw new Error('Ingresá un mínimo y un máximo válidos en °C; el mínimo no puede superar al máximo.');
  const source=one(input.source,160),author=one(input.author,100);
  if(!source||!author)throw new Error('Indicá la fuente del rango y quién lo registró.');
  const note=await load(tag),before=rangoTemperaturaTrabajo(note.data);
  let front=setKey(note.front,'temperatura_trabajo_min_c',`temperatura_trabajo_min_c: ${min}`);
  front=setKey(front,'temperatura_trabajo_max_c',`temperatura_trabajo_max_c: ${max}`);
  front=setKey(front,'temperatura_trabajo_fuente',`temperatura_trabajo_fuente: ${JSON.stringify(source)}`);
  const date=new Date().toISOString().slice(0,10);
  const log=`- ${date} · ${cell(author)}: temperatura de trabajo ${before?`${before.min} a ${before.max} °C`:'sin rango registrado'} → ${min} a ${max} °C. Fuente declarada: ${cell(source)}.`;
  await backup(tag);
  await save(tag,front,appendLog(note.body,'Cambios de temperatura de trabajo',log));
  return {tag,min,max,source};
 }
 return {move, swap, replace, temperature, backups, restore};
}
