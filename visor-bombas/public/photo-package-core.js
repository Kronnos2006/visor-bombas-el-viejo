import {PHOTO_SLOTS} from './photo-slots.js';

// Formato portátil de fotos del expediente. Este módulo solo valida datos: nunca escribe.
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_PACKAGE_BYTES = 50 * 1024 * 1024;
export const MAX_PHOTOS = 200;
const SLOTS = new Set(PHOTO_SLOTS.map(([slot]) => slot));
const TAG = /^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const PNG = [137, 80, 78, 71, 13, 10, 26, 10];

function isoDate(value, label) {
 if (typeof value !== 'string') throw new Error(label + ' inválida.');
 const date = new Date(value);
 if (!Number.isFinite(date.valueOf()) || date.toISOString() !== value) throw new Error(label + ' inválida.');
 return value;
}
function photoBase64(value) {
 if (typeof value !== 'string' || !value.length || value.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4) throw new Error('Foto vacía o mayor de 8 MB.');
 if (value.length % 4 !== 0 || !BASE64.test(value)) throw new Error('La foto no contiene base64 válido.');
 let binary;
 try { binary = atob(value); } catch { throw new Error('La foto no contiene base64 válido.'); }
 if (binary.length > MAX_PHOTO_BYTES) throw new Error('La foto supera 8 MB.');
 if (btoa(binary) !== value) throw new Error('La foto no contiene base64 canónico.');
 const jpeg = binary.length >= 4 && binary.charCodeAt(0) === 255 && binary.charCodeAt(1) === 216 && binary.charCodeAt(2) === 255 && binary.charCodeAt(binary.length - 2) === 255 && binary.charCodeAt(binary.length - 1) === 217;
 const png = binary.length >= PNG.length && PNG.every((byte, index) => binary.charCodeAt(index) === byte);
 if (!jpeg && !png) throw new Error('La foto debe tener firma JPG o PNG.');
 return value;
}
function entriesOf(entries) {
 if (!Array.isArray(entries) || !entries.length || entries.length > MAX_PHOTOS) throw new Error('El paquete debe contener entre 1 y 200 fotos.');
 const keys = new Set();
 return entries.map(entry => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.tag !== 'string' || !TAG.test(entry.tag)) throw new Error('TAG inválido en el paquete de fotos.');
  if (!SLOTS.has(entry.slot)) throw new Error('Categoría de foto desconocida.');
  const key = entry.tag + ':' + entry.slot;
  if (keys.has(key)) throw new Error('El paquete repite una categoría de foto para el mismo TAG.');
  keys.add(key);
  return {tag: entry.tag, slot: entry.slot, fecha: isoDate(entry.fecha, 'Fecha de la foto'), base64: photoBase64(entry.base64)};
 });
}
function checkSize(value) {
 let encoded;
 try { encoded = JSON.stringify(value); } catch { throw new Error('El paquete no contiene JSON válido.'); }
 if (!encoded || new TextEncoder().encode(encoded).byteLength > MAX_PACKAGE_BYTES) throw new Error('El paquete supera 50 MB. Exportá menos fotos juntas.');
}
export function makePhotoPackage(entries) {
 const value = {formato: 'vocatus-pump-photos', version: 1, creado: new Date().toISOString(), photos: entriesOf(entries)};
 checkSize(value);
 return value;
}
export function readPhotoPackage(data) {
 if (typeof data === 'string') {
  if (data.length > MAX_PACKAGE_BYTES || new TextEncoder().encode(data).byteLength > MAX_PACKAGE_BYTES) throw new Error('El paquete supera 50 MB.');
  try { data = JSON.parse(data); } catch { throw new Error('El archivo no contiene JSON válido.'); }
 }
 if (!data || data.formato !== 'vocatus-pump-photos' || data.version !== 1) throw new Error('No es un paquete de fotos de Vocatus compatible.');
 checkSize(data);
 isoDate(data.creado, 'Fecha del paquete');
 return entriesOf(data.photos);
}
