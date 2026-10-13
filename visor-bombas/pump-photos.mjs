// Fotos del expediente que se pueden sustituir desde el visor: dos placas, la bomba y su posición.
// Se guardan en la bóveda: 00-Proyecto/fotos-campo/<TAG>/expediente/<ranura>.<ext>.
// La foto anterior no se borra: pasa a .../expediente/historial/<ranura>_<fecha>.<ext>.
import {mkdir, readdir, readFile, rename, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';

export const SLOTS = {
 placa1: 'Placa de la bomba',
 placa2: 'Segunda placa (motor)',
 bomba: 'Foto de la bomba',
 posicion: 'Foto de la posición'
};
const MAX = 8 * 1024 * 1024;
const kind = bytes => bytes[0] === 0xFF && bytes[1] === 0xD8 ? 'jpg' : bytes.subarray(1, 4).toString() === 'PNG' ? 'png' : null;

export function pumpPhotoStore(vault) {
 const dir = tag => path.join(vault, '00-Proyecto/fotos-campo', tag, 'expediente');
 const check = (tag, slot) => { if (!/^B\d{1,3}$|^P-\d{4}[A-Z]?$/.test(tag)) throw new Error('TAG inválido.'); if (!SLOTS[slot]) throw new Error('Foto desconocida.'); };
 async function current(tag, slot) {
  for (const ext of ['jpg', 'png']) { const file = path.join(dir(tag), `${slot}.${ext}`); try { return {file, ext, info: await stat(file)}; } catch {} }
  return null;
 }
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
  await mkdir(path.join(dir(tag), 'historial'), {recursive: true});
  const prior = await current(tag, slot);
  if (prior) await rename(prior.file, path.join(dir(tag), 'historial', `${slot}_${prior.info.mtime.toISOString().replace(/[:.]/g, '-')}.${prior.ext}`));
  await writeFile(path.join(dir(tag), `${slot}.${ext}`), bytes);
  return (await list(tag))[slot];
 }
 async function read(tag, slot) { check(tag, slot); const c = await current(tag, slot); if (!c) { const e = new Error('Sin foto actualizada.'); e.code = 'ENOENT'; throw e; } return {bytes: await readFile(c.file), ext: c.ext}; }
 async function historial(tag) { try { return (await readdir(path.join(dir(tag), 'historial'))).length; } catch { return 0; } }
 return {list, save, read, historial};
}
