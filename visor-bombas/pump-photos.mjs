// Fotos del expediente que se pueden sustituir desde el visor, una por categoría (PHOTO_SLOTS).
// Se guardan en la bóveda: 00-Proyecto/fotos-campo/<TAG>/expediente/<categoría>.<ext>.
// La foto anterior no se borra: se copia a .../expediente/historial/<categoría>_<fecha>_<id>.<ext>.
// Sustitución segura: la foto nueva se escribe primero en un temporal y la anterior se copia
// (no se mueve) al historial. Solo al final la nueva ocupa su lugar. Si cualquier paso falla,
// se deshace lo hecho y la foto anterior sigue siendo la vigente.
import {copyFile, mkdir, readdir, readFile, rename, rm, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {PHOTO_SLOTS} from './public/photo-slots.js';

export const SLOTS=Object.fromEntries(PHOTO_SLOTS);
const MAX = 8 * 1024 * 1024;
const EXTS = ['jpg', 'png'];
const kind = bytes => bytes[0] === 0xFF && bytes[1] === 0xD8 ? 'jpg' : bytes.subarray(1, 4).toString() === 'PNG' ? 'png' : null;
const validTag = tag => /^B[1-9]\d{0,3}$|^P-\d{4}[A-Z]?$/.test(tag);
const photoDir = (vault, tag) => path.join(vault, '00-Proyecto/fotos-campo', tag, 'expediente');

// Foto vigente de una categoría: el primer archivo regular <categoría>.jpg|png (un directorio no cuenta).
async function currentIn(dir, slot) {
 for (const ext of EXTS) {
  const file = path.join(dir, `${slot}.${ext}`);
  try { const info = await stat(file); if (info.isFile()) return {file, ext, info}; } catch {}
 }
 return null;
}
// Categorías con foto vigente para un TAG (usado también por Avance).
export async function currentPhotoSlots(vault, tag) {
 if (!validTag(tag)) return new Set();
 const dir = photoDir(vault, tag), out = new Set();
 for (const slot of Object.keys(SLOTS)) if (await currentIn(dir, slot)) out.add(slot);
 return out;
}

// opciones.antesDeConfirmar(): solo para pruebas (simular un fallo justo antes de confirmar el cambio).
export function pumpPhotoStore(vault, opciones = {}) {
 const dir = tag => photoDir(vault, tag);
 const check = (tag, slot) => { if (!validTag(tag)) throw new Error('TAG inválido.'); if (!Object.hasOwn(SLOTS,slot)) throw new Error('Foto desconocida.'); };
 const current = (tag, slot) => currentIn(dir(tag), slot);
 async function list(tag) {
  check(tag, 'bomba'); const out = {};
  for (const slot of Object.keys(SLOTS)) { const c = await current(tag, slot); if (c) out[slot] = {url: `/api/pump-photo?tag=${encodeURIComponent(tag)}&slot=${slot}&v=${Math.round(c.info.mtimeMs)}`, fecha: c.info.mtime.toISOString()}; }
  return out;
 }
 async function save(tag, slot, base64) {
  check(tag, slot);
  if (typeof base64 !== 'string' || base64.length > Math.ceil(MAX / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new Error('Foto inválida o mayor de 8 MB.');
  const bytes = Buffer.from(base64, 'base64'), ext = kind(bytes);
  if (!ext) throw new Error('La foto debe ser JPG o PNG.');
  const base = dir(tag), target = path.join(base, `${slot}.${ext}`);
  await mkdir(path.join(base, 'historial'), {recursive: true});
  const prior = await current(tag, slot);
  const temp = path.join(base, `.${slot}.${randomUUID().slice(0, 8)}.tmp`);
  let archived = null, placed = false;
  try {
   await writeFile(temp, bytes, {flag: 'wx'});
   if (prior) {
    archived = path.join(base, 'historial', `${slot}_${prior.info.mtime.toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0,8)}.${prior.ext}`);
    await copyFile(prior.file, archived);
   }
   await opciones.antesDeConfirmar?.(tag, slot);
   await rename(temp, target); placed = true;
   // Con otra extensión, la anterior se retira solo cuando la nueva ya está en su lugar.
   if (prior && prior.file !== target) await rm(prior.file);
  } catch (err) {
   await rm(temp, {force: true}).catch(() => {});
   // Si la nueva llegó a su lugar pero no se pudo retirar la anterior, se quita la nueva:
   // la anterior (que sigue en su ruta) continúa vigente.
   if (placed && prior && prior.file !== target) await rm(target, {force: true}).catch(() => {});
   // La copia del historial sobra salvo que la anterior ya haya sido sustituida en su misma ruta.
   if (archived && !(placed && prior?.file === target)) await rm(archived, {force: true}).catch(() => {});
   throw err;
  }
  return (await list(tag))[slot];
 }
 async function read(tag, slot) { check(tag, slot); const c = await current(tag, slot); if (!c) { const e = new Error('Sin foto actualizada.'); e.code = 'ENOENT'; throw e; } return {bytes: await readFile(c.file), ext: c.ext}; }
 async function historial(tag) { try { return (await readdir(path.join(dir(tag), 'historial'))).length; } catch { return 0; } }
 return {list, save, read, historial};
}
