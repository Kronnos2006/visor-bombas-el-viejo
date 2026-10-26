// Levantamiento de campo: actualiza la ficha de Obsidian con lo que se leyó en la placa,
// el sello, el empaque y los o-rings. Solo escribe campos que llegan con valor:
// un campo vacío en el formulario nunca borra un dato ya registrado.
import path from 'node:path';
import { readFile, readdir, writeFile, mkdir, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import {backupFicha} from './backup.mjs';
import {validateSurveyInput} from './public/survey-validation.js';
import {verificationOf} from './public/verification-core.js';
import { load, dump, JSON_SCHEMA } from './vendor/js-yaml.mjs';

const MAX_PHOTO = 6 * 1024 * 1024, MAX_PHOTOS = 8, MAX_ORINGS = 100;
const PENDING = /^(|por confirmar|sin levantar|pendiente.*|<pendiente.*)$/i;
export const filled = v => v != null && !PENDING.test(String(v).trim());
export const one = (v, max = 200) => String(v ?? '').replace(/[\r\n]+/g, ' ').slice(0, max).trim();

// Campo del formulario → clave en la ficha, según el tipo de ficha.
// P-xxxx: 00-Proyecto/bombas (plantilla de las 15 bombas del PFD).
// Bxx:    00-Proyecto/equipos (sector fotografiado, importado del Excel).
export const FIELDS = [
 {id:'nombre',label:'Nombre / ubicación de la bomba',group:'general',P:'nombre',B:'ubicacion'},
 {id:'servicio',label:'Servicio / fluido',group:'general',P:'servicio',B:'liquido'},
 {id:'fluido',label:'Fluido registrado',group:'general',P:'fluido',B:null},
 {id:'caudal',label:'Caudal de placa',group:'general',P:'caudal_m3h',B:'caudal_gpm',unit:{P:'m³/h',B:'GPM'}},
 {id:'altura',label:'Altura de placa',group:'general',P:'altura_m',B:'altura_m',unit:{P:'m',B:'m'}},
 {id:'impulsor',label:'Diámetro del impulsor',group:'general',P:'impulsor_mm',B:'impulsor_valor',unit:{P:'mm',B:'mm'}},
 {id:'motor_marca',label:'Marca del motor',group:'motor',P:'motor_marca',B:'motor_marca'},
 {id:'motor_modelo',label:'Modelo del motor',group:'motor',P:'motor_modelo',B:'motor_modelo'},
 {id:'motor_catalogo',label:'Código / catálogo del motor',group:'motor',P:'motor_catalogo',B:'motor_catalogo'},
 {id:'motor_serie',label:'Serie del motor',group:'motor',P:'motor_serie',B:'motor_serie'},
 {id:'motor_hp',label:'Potencia del motor en HP',group:'motor',P:'motor_hp',B:'motor_hp',number:true},
 {id:'motor_kw',label:'Potencia del motor en kW',group:'motor',P:'potencia_kw',B:'motor_kw',number:true},
 {id:'motor_rpm',label:'Velocidad del motor',group:'motor',P:'motor_rpm',B:'motor_rpm',number:true},
 {id:'rodamiento_delantero',label:'Código del rodamiento delantero',group:'componentes',P:'rodamiento_delantero',B:'rodamiento_delantero'},
 {id:'rodamiento_trasero',label:'Código del rodamiento trasero',group:'componentes',P:'rodamiento_trasero',B:'rodamiento_trasero'},
 {id:'acople',label:'Modelo / código del acople',group:'componentes',P:'acople',B:'acople'},
 {id:'marca', label:'Marca', group:'placa', P:'marca', B:'marca'},
 {id:'modelo', label:'Modelo', group:'placa', P:'modelo', B:'modelo'},
 {id:'serie', label:'N.º de serie (placa)', group:'placa', P:'serie', B:'placa_serie'},
 {id:'tamano', label:'Tamaño (ej. 1.5X3-8)', group:'placa', P:'tipo_bomba', B:'tamano'},
 {id:'rpm', label:'RPM', group:'placa', P:'rpm', B:'rpm', number:true},
 {id:'tipo_sellado', label:'Tipo de sellado', group:'sello', P:'tipo_sellado', B:'tipo_sellado', options:['sello mecanico','empaquetadura']},
 {id:'sello_marca', label:'Marca del sello', group:'sello', P:'sello_marca', B:'sello_marca'},
 {id:'sello_tipo', label:'Tipo / modelo del sello', group:'sello', P:'sello_modelo', B:'sello_tipo'},
 {id:'sello_diametro', label:'Diámetro de eje en el sello', group:'sello', P:'sello_diametro_mm', B:'sello_eje_pulg', unit:{P:'mm', B:'pulg'}},
 {id:'sello_cara_rotativa', label:'Cara rotativa (material)', group:'sello', P:'sello_cara_rotativa', B:'sello_cara_rotativa'},
 {id:'sello_cara_estatica', label:'Cara estática (material)', group:'sello', P:'sello_cara_estatica', B:'sello_cara_estatica'},
 {id:'sello_elastomero', label:'Elastómero', group:'sello', P:'sello_elastomero', B:'sello_elastomero'},
 {id:'sello_codigo', label:'Código / n.º de parte del sello', group:'sello', P:'sello_codigo', B:'sello_codigo'},
 {id:'empaque_tipo', label:'Tipo de empaque', group:'empaque', P:'empaque_tipo', B:'empaque_declarado'},
 {id:'empaque_seccion', label:'Sección del empaque', group:'empaque', P:'empaque_seccion_mm', B:'empaque_seccion_mm', unit:{P:'mm', B:'mm'}},
 {id:'empaque_anillos', label:'Cantidad de anillos', group:'empaque', P:'empaque_anillos', B:'empaque_anillos', number:true},
 {id:'rodamientos', label:'Los rodamientos pertenecen a', group:'componentes', P:'rodamientos_pertenecen_a', B:'rodamientos_pertenecen_a', options:['bomba','motor']},
 {id:'codigo_bodega', label:'Código de bodega', group:'bodega', P:'codigo_bodega', B:'codigo_bodega'},
];
export const kindOf = tag => tag.startsWith('B') ? 'B' : 'P';
export const fileOf = tag => `00-Proyecto/${kindOf(tag) === 'B' ? 'equipos' : 'bombas'}/${tag}.md`;

export function splitNote(text) {
 const m = text.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
 if (!m) throw new Error('La ficha no contiene frontmatter YAML válido.');
 const data = load(m[1], {schema: JSON_SCHEMA});
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Frontmatter inválido.');
 return {front: m[1].replace(/\r/g, ''), body: m[2].replace(/\r/g, ''), data};
}
const scalar = (value, number) => number && /^\d+(\.\d+)?$/.test(value) ? value : JSON.stringify(value);
// Reemplaza la línea "clave: ..." conservando comentarios, orden y grupos de la ficha.
export function setKey(front, key, rendered) {
 const lines = front.split('\n');
 const start = lines.findIndex(l => l.startsWith(key + ':'));
 if (start < 0) return front.replace(/\n*$/, '') + '\n' + rendered;
 let end = start + 1;
 while (end < lines.length && /^(\s+\S|\s*-\s)/.test(lines[end])) end++;
 lines.splice(start, end - start, rendered);
 return lines.join('\n');
}
export const list = (key, items) => (Array.isArray(items)?items.length:Object.keys(items).length) ? dump({[key]: items}, {lineWidth: -1, schema: JSON_SCHEMA}).trimEnd() : `${key}: []`;

// Qué falta en cada ficha. null = no aplica (ej. empaque en una bomba con sello mecánico).
export function progressOf(tag, data) {
 const k = kindOf(tag), get = id => data[FIELDS.find(f => f.id === id)[k]];
 const sealing = String(get('tipo_sellado') ?? '').toLowerCase();
 const packing = /empaq/.test(sealing), mechanical = /sello|mec/.test(sealing);
 const checks = {
  placa: filled(get('marca')) && filled(get('modelo')) && filled(get('serie')),
  sello: packing ? null : filled(get('tipo_sellado')) && filled(get('sello_tipo')) && filled(get('sello_diametro')) && filled(get('sello_elastomero')),
  empaque: mechanical && !packing ? null : filled(get('empaque_seccion')) && filled(get('empaque_anillos')),
  orings: Array.isArray(data.orings) && data.orings.some(o => filled(o?.medida)),
  fotos: Array.isArray(data.fotos) && data.fotos.length > 0,
  bodega: filled(get('codigo_bodega')),
  verificado: verificationOf(data).verified,
 };
 const applicable = Object.entries(checks).filter(([key,v])=>key!=='verificado'&&v!==null).map(([,v])=>v);
 return {tag, kind: k, area: one(data.area || ''), servicio: one(data.servicio || data.ubicacion || data.nombre || ''), checks,
  verification: verificationOf(data),
  done: applicable.filter(Boolean).length, total: applicable.length, demo: data.demostracion === true};
}

export function surveyStore(vault, options = {}) {
 const fullPath = tag => path.join(vault, fileOf(tag));
 async function progress(tags) {
  const rows = [], errors = [];
  for (const dir of ['bombas', 'equipos']) {
   let names = [];
   try { names = await readdir(path.join(vault, '00-Proyecto', dir)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
   for (const name of names.filter(n => (dir === 'bombas' ? /^P-\d{4}[A-Z]?\.md$/ : /^B[1-9]\d{0,3}\.md$/).test(n))) {
    const tag = name.slice(0, -3);
    if (dir === 'equipos' && tags && !tags.has(tag)) continue;
    try { rows.push(progressOf(tag, splitNote(await readFile(path.join(vault, '00-Proyecto', dir, name), 'utf8')).data)); }
    catch (e) { errors.push({tag, error: e.message}); }
   }
  }
  const order = t => t.startsWith('B') ? 1e6 + Number(t.slice(1)) : Number(t.slice(2, 6));
  rows.sort((a, b) => order(a.tag) - order(b.tag));
  return {rows, errors};
 }
 async function save(tag, input) {
  if(!/^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(tag))throw Error('TAG inválido.');
  const checked=validateSurveyInput(input);input={...input,fields:checked.fields};
  const k = kindOf(tag), file = fullPath(tag);
  const date = one(input.date, 10), author = one(input.author);

  const raw = await readFile(file, 'utf8');
  const note = splitNote(raw);
  if ((note.data.tag || note.data.id) !== tag) throw new Error('El identificador de la ficha no coincide con el equipo.');
  let front = note.front; const changed = [], changedIds=[];
  for (const f of FIELDS) {
   const key = f[k]; const value = one(input.fields?.[f.id]);
   if (!key || !value) continue;
   if(f.options&&!f.options.includes(value))throw Error(f.label+': opción no válida.');
   if (String(note.data[key] ?? '') === value) continue;
   front = setKey(front, key, `${key}: ${scalar(value, f.number || !!f.unit)}`); changed.push(f.label);changedIds.push(f.id);
  }
  if(changedIds.includes('impulsor')&&k==='B')front=setKey(front,'impulsor_unidad','impulsor_unidad: mm');
  // Potencia: un solo dato vigente (HP o kW). Los valores anteriores no se pierden: quedan
  // como antecedente con su unidad, fecha y responsable en motor_potencia_antecedentes.
  if(changedIds.includes('motor_hp')||changedIds.includes('motor_kw')){
   const UNIT={motor_hp:'HP',motor_kw:'kW'},vigente=changedIds.includes('motor_hp')?'motor_hp':'motor_kw',other=vigente==='motor_hp'?'motor_kw':'motor_hp';
   const keyOf=id=>FIELDS.find(f=>f.id===id)[k],previous=[];
   for(const id of [vigente,other]){const value=note.data[keyOf(id)];if(filled(value))previous.push({valor:String(value),unidad:UNIT[id],vigente_hasta:date,reemplazado_por:author});}
   if(filled(note.data[keyOf(other)]))front=setKey(front,keyOf(other),keyOf(other)+': ""');
   if(previous.length){
    const prior=Array.isArray(note.data.motor_potencia_antecedentes)?note.data.motor_potencia_antecedentes.filter(a=>a&&typeof a==='object'):[];
    front=setKey(front,'motor_potencia_antecedentes',list('motor_potencia_antecedentes',[...prior,...previous]));
    changed.push('Potencia anterior conservada como antecedente: '+previous.map(a=>a.valor+' '+a.unidad).join(', '));
   }
   front=setKey(front,'motor_potencia_vigente','motor_potencia_vigente: '+JSON.stringify(UNIT[vigente]));
  }
  const priorOrings=Array.isArray(note.data.orings)?note.data.orings:[];
  if(input.replaceOrings===true&&JSON.stringify(input.baseOrings)!==JSON.stringify(priorOrings))throw Error('La lista de o-rings cambió desde que abriste la ficha. Recargá antes de reemplazarla.');
  if((input.orings||[]).length>MAX_ORINGS)throw Error('La lista admite hasta '+MAX_ORINGS+' o-rings.');
  const orings = (Array.isArray(input.orings) ? input.orings : []).slice(0, MAX_ORINGS)
   .map(o=>{
    const original=input.replaceOrings===true&&Number.isInteger(o.existingIndex)?priorOrings[o.existingIndex]||{}:{};
    const item={...original};
    for(const key of ['posicion','medida','material','cantidad','codigo']){const value=one(o[key],key==='cantidad'?10:200);if(value)item[key]=key==='cantidad'?Number(value):value;else delete item[key];}
    return item;
   }).filter(o=>o.medida||o.codigo);
  const nextOrings=input.replaceOrings===true?orings:[...priorOrings,...orings];
  const oringsChanged=JSON.stringify(nextOrings)!==JSON.stringify(priorOrings);
  if(oringsChanged){front=setKey(front,'orings',list('orings',nextOrings));changed.push(input.replaceOrings===true?'Lista de o-rings actualizada':orings.length+' o-ring(s)');}
  const photos = (Array.isArray(input.photos) ? input.photos : []).slice(0, MAX_PHOTOS).map(p => {
   const encoded = p?.base64;
   if (typeof encoded !== 'string' || encoded.length > Math.ceil(MAX_PHOTO / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error('Foto inválida o mayor de 6 MB.');
   const bytes = Buffer.from(encoded, 'base64');
   const ext = bytes[0] === 0xFF && bytes[1] === 0xD8 ? 'jpg' : bytes.subarray(1, 4).toString() === 'PNG' ? 'png' : null;
   if (!ext) throw new Error('Las fotos deben ser JPG o PNG.');
   return {bytes, ext, note: one(p.note, 120)};
  });
  const observations = String(input.observations ?? '').replace(/\r/g, '').slice(0, 3000).trim();
  if(!changed.length&&!observations&&!photos.length&&!checked.scopes.length)throw Error('No hay datos nuevos para guardar.');
  // Un respaldo fallido impide cualquier escritura de ficha o fotos.
  const backup=await (options.backup||backupFicha)(vault,tag);
  const saved = [];
  if (photos.length) {
   const dir = path.join(vault, '00-Proyecto/fotos-campo', tag); await mkdir(dir, {recursive: true});
   for (const p of photos) {
    const rel = `00-Proyecto/fotos-campo/${tag}/${tag}_${date}_${randomUUID().slice(0, 8)}.${p.ext}`;
    await writeFile(path.join(vault, rel), p.bytes, {flag: 'wx'}); saved.push(p.note ? {ruta: rel, nota: p.note} : rel);
   }
   const prior = Array.isArray(note.data.fotos) ? note.data.fotos : [];
   front = setKey(front, 'fotos', list('fotos', [...prior, ...saved])); changed.push(`${saved.length} foto(s)`);
  }
  if (k === 'B' && checked.scopes.includes('identidad')) {
   front = setKey(front, 'asociacion_placa', 'asociacion_placa: confirmada_en_campo');
   front = setKey(front, 'placa_nota', `placa_nota: ${JSON.stringify(`Placa leída en campo el ${date} por ${author}`)}`);
  }
  const records=note.data.verificaciones_campo&&typeof note.data.verificaciones_campo==='object'?{...note.data.verificaciones_campo}:{};
  const invalid=new Set();
  if(changedIds.some(id=>['marca','modelo','serie','tamano'].includes(id)))for(const scope of ['identidad','placa','repuestos'])invalid.add(scope);
  if(changedIds.some(id=>FIELDS.find(f=>f.id===id)?.group==='placa'))invalid.add('placa');
  if(oringsChanged||changedIds.some(id=>['sello','empaque','bodega','motor','componentes'].includes(FIELDS.find(f=>f.id===id)?.group)||id==='rodamientos'))invalid.add('repuestos');
  for(const scope of invalid)if(records[scope])records[scope]={...records[scope],vigente:false};
  for(const scope of checked.scopes)records[scope]={vigente:true,author,date,evidence:checked.evidence};
  if(Object.keys(records).length)front=setKey(front,'verificaciones_campo',list('verificaciones_campo',records));
  if(k==='B'&&changedIds.includes('serie')&&!checked.scopes.includes('identidad')){
   front=setKey(front,'asociacion_placa','asociacion_placa: candidata');
   front=setKey(front,'placa_nota','placa_nota: '+JSON.stringify('Serie registrada; identidad física pendiente de verificación explícita.'));
  }
  front=setKey(front,'levantado_por','levantado_por: '+JSON.stringify(author));
  front=setKey(front,'fecha_levantamiento','fecha_levantamiento: '+JSON.stringify(date));
  if(checked.scopes.length)changed.push('Verificación: '+checked.scopes.join(', '));
  const entry = `- ${date} · ${author}: ${changed.join(', ') || 'observación'}${observations ? `\n  > ${observations.replace(/\n/g, '\n  > ')}` : ''}`;
  let body = note.body;
  const heading = /^## Levantamiento de campo[^\S\n]*$/m;
  if (heading.test(body)) body = body.replace(heading, m => `${m}\n${entry}`);
  else body = body.replace(/\s*$/, '') + `\n\n## Levantamiento de campo\n${entry}\n`;
  const next = `---\n${front}\n---\n${body.startsWith('\n') ? '' : '\n'}${body}`;
  splitNote(next); // valida antes de escribir
  const temp = `${file}.${randomUUID().slice(0, 8)}.tmp`;
  await writeFile(temp, next, 'utf8'); await rename(temp, file);
  return {file: fileOf(tag), backup: path.relative(vault,backup).replace(/\\/g,'/'), changed, photos: saved.length, progress: progressOf(tag, splitNote(next).data)};
 }
 return {progress, save};
}
