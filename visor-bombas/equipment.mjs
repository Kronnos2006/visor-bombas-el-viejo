// Mover o reemplazar una bomba (sector de tanques o torre) desde el visor.
// Todo cambio queda en la ficha de Obsidian: la posición nueva en el frontmatter y
// una línea en «## Cambios de ubicación y reemplazos». Al reemplazar, los datos de la
// bomba retirada se archivan en una tabla para no perderlos.
import path from 'node:path';
import { readFile, writeFile, rename } from 'node:fs/promises';
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

export function equipmentStore(vault, basePositions) {
 const file = tag => path.join(vault, fileOf(tag));
 async function load(tag) {
  let raw;
  try { raw = await readFile(file(tag), 'utf8'); }
  catch (e) { if (e.code === 'ENOENT') { const m = new Error(`No existe la ficha ${fileOf(tag)} en esta bóveda.`); m.code = 'PUMP_NOT_AVAILABLE'; throw m; } throw e; }
  const note = splitNote(raw);
  if ((note.data.tag || note.data.id) !== tag) throw new Error('El identificador de la ficha no coincide con el equipo.');
  return note;
 }
 async function save(tag, front, body) {
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
  await save(tag, placed(note, to), body);
  return {tag, action: 'move', from, to};
 }
 async function swap(tag, other, input) {
  const {date, author, reason} = common(input);
  if (tag === other) throw new Error('Elegí otra bomba para intercambiar.');
  const ba = basePositions.find(p => p.tag === tag), bb = basePositions.find(p => p.tag === other);
  if (ba && bb && areaOf(ba) !== areaOf(bb)) throw new Error('Solo se pueden intercambiar bombas de la misma área.');
  const a = await load(tag), b = await load(other);
  const pa = current(tag, a.data), pb = current(other, b.data);
  const log = (who, from, to) => `- ${date} · ${author}: intercambió lugar con ${who}, de ${where(from)} a ${where(to)}${reason ? `. Motivo: ${reason}` : ''}`;
  await save(tag, placed(a, pb), appendLog(a.body, 'Cambios de ubicación y reemplazos', log(other, pa, pb)));
  await save(other, placed(b, pa), appendLog(b.body, 'Cambios de ubicación y reemplazos', log(tag, pb, pa)));
  return {tag, other, action: 'swap'};
 }
 async function replace(tag, input) {
  const {date, author, reason} = common(input), k = kindOf(tag);
  const fields = REPLACE_FIELDS.filter(f => f[k]);
  const values = Object.fromEntries(fields.map(f => [f.id, one(input.fields?.[f.id])]).filter(([, v]) => v));
  if (!values.marca || !values.modelo) throw new Error('Indicá al menos la marca y el modelo de la bomba nueva.');
  const note = await load(tag), d = note.data, key = id => fields.find(f => f.id === id)?.[k];
  const previousTemperature = rangoTemperaturaTrabajo(d);
  const old = id => key(id) ? d[key(id)] : '';
  let body = appendRow(note.body, 'Equipos anteriores en esta posición',
   '| Retirada | Marca | Modelo | Serie | Tamaño | Motivo | Responsable |\n|---|---|---|---|---|---|---|',
   `| ${date} | ${cell(old('marca'))} | ${cell(old('modelo'))} | ${cell(old('serie'))} | ${cell(old('tamano'))} | ${cell(reason)} | ${cell(author)} |`);
  let front = note.front;
  // Los datos de la bomba retirada no pueden quedar mezclados con la nueva: se vacían y se archivan arriba.
  for (const f of fields) front = setKey(front, f[k], `${f[k]}: ${values[f.id] ? scalar(values[f.id], f.number) : '""'}`);
  if (input.clearSeal !== false) {
   for (const s of SEAL_KEYS[k]) if (s in d) front = setKey(front, s, `${s}: ""`);
   front = setKey(front, 'orings', 'orings: []');
  }
  if (previousTemperature) body = appendLog(body, 'Cambios de temperatura de trabajo', `- ${date} · ${cell(author)}: al reemplazar la bomba se archivó el rango anterior ${previousTemperature.min} a ${previousTemperature.max} °C. Fuente: ${cell(previousTemperature.fuente)}.`);
  for (const key of ['temperatura_trabajo_min_c', 'temperatura_trabajo_max_c', 'temperatura_trabajo_fuente']) if (key in d) front = setKey(front, key, `${key}: ""`);
  if (k === 'B') {
   front = setKey(front, 'asociacion_placa', `asociacion_placa: ${values.serie ? 'confirmada_en_campo' : 'sin_asociar'}`);
   front = setKey(front, 'placa_nota', `placa_nota: ${JSON.stringify(values.serie ? `Bomba instalada el ${date}; placa registrada por ${author}` : `Bomba reemplazada el ${date}; placa por levantar`)}`);
  }
  front = setKey(front, 'fecha_instalacion', `fecha_instalacion: ${JSON.stringify(date)}`);
  body = appendLog(body, 'Cambios de ubicación y reemplazos', `- ${date} · ${author}: reemplazada ${cell(old('marca'))} ${cell(old('modelo'))} por ${values.marca} ${values.modelo}${reason ? `. Motivo: ${reason}` : ''}${input.clearSeal !== false ? '. Sello y o-rings quedan por levantar.' : ''}`);
  await save(tag, front, body);
  return {tag, action: 'replace', previous: {marca: old('marca'), modelo: old('modelo'), serie: old('serie')}};
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
  await save(tag,front,appendLog(note.body,'Cambios de temperatura de trabajo',log));
  return {tag,min,max,source};
 }
 return {move, swap, replace, temperature};
}
