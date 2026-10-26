// Convierte las texturas PNG de un .glb a WebP sin tocar la geometría.
// Solo reemplaza los bytes de las imágenes: los bloques Draco, nodos, transformaciones y
// metadatos (extras) quedan idénticos, así que no cambia ninguna coordenada ni la selección.
// Uso: node visor-bombas/tools/comprimir-texturas.mjs entrada.glb salida.glb [calidad=90]
// Requiere sharp (npm install --no-save sharp).
import {readFileSync, writeFileSync} from 'node:fs';
import sharp from 'sharp';

const [entrada, salida, q = '90'] = process.argv.slice(2);
if (!entrada || !salida) { console.error('Uso: node comprimir-texturas.mjs entrada.glb salida.glb [calidad]'); process.exit(1); }
const glb = readFileSync(entrada);
if (glb.readUInt32LE(0) !== 0x46546c67) throw new Error('No es un archivo glb');
const largoJson = glb.readUInt32LE(12), j = JSON.parse(glb.subarray(20, 20 + largoJson).toString('utf8'));
const inicioBin = 20 + largoJson + 8, bin = glb.subarray(inicioBin, inicioBin + glb.readUInt32LE(20 + largoJson));
if (j.buffers.length !== 1) throw new Error('Se esperaba un único buffer');

// Bytes de cada bufferView; las imágenes PNG se reemplazan por WebP.
const vistas = j.bufferViews.map(v => bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength));
let antes = 0, despues = 0, convertidas = 0;
for (const img of j.images || []) {
 if (img.mimeType !== 'image/png' || img.bufferView === undefined) continue;
 const original = vistas[img.bufferView];
 const webp = await sharp(original).webp({quality: Number(q), effort: 6, smartSubsample: true}).toBuffer();
 if (webp.length >= original.length) continue;
 antes += original.length; despues += webp.length; convertidas++;
 vistas[img.bufferView] = webp; img.mimeType = 'image/webp';
}
// Las texturas que apuntan a una imagen WebP la declaran con EXT_texture_webp.
const esWebp = new Set((j.images || []).map((im, i) => im.mimeType === 'image/webp' ? i : -1).filter(i => i >= 0));
for (const t of j.textures || []) if (esWebp.has(t.source)) { t.extensions = {...t.extensions, EXT_texture_webp: {source: t.source}}; delete t.source; }
for (const k of ['extensionsUsed', 'extensionsRequired']) j[k] = [...new Set([...(j[k] || []), 'EXT_texture_webp'])];

// Reconstruye el buffer binario alineando cada vista a 4 bytes.
const partes = []; let off = 0;
vistas.forEach((bytes, i) => {
 const relleno = (4 - off % 4) % 4; if (relleno) { partes.push(Buffer.alloc(relleno)); off += relleno; }
 j.bufferViews[i].byteOffset = off; j.bufferViews[i].byteLength = bytes.length; partes.push(bytes); off += bytes.length;
});
const binNuevo = Buffer.concat(partes, off), binPad = Buffer.concat([binNuevo, Buffer.alloc((4 - binNuevo.length % 4) % 4)]);
j.buffers[0].byteLength = binNuevo.length;
let json = Buffer.from(JSON.stringify(j), 'utf8'); json = Buffer.concat([json, Buffer.alloc((4 - json.length % 4) % 4, 0x20)]);
const cab = Buffer.alloc(12); cab.writeUInt32LE(0x46546c67, 0); cab.writeUInt32LE(2, 4); cab.writeUInt32LE(12 + 8 + json.length + 8 + binPad.length, 8);
const trozo = (tipo, datos) => { const h = Buffer.alloc(8); h.writeUInt32LE(datos.length, 0); h.writeUInt32LE(tipo, 4); return Buffer.concat([h, datos]); };
writeFileSync(salida, Buffer.concat([cab, trozo(0x4E4F534A, json), trozo(0x004E4942, binPad)]));
console.log(`${convertidas} texturas PNG → WebP: ${(antes / 1e6).toFixed(1)} MB → ${(despues / 1e6).toFixed(1)} MB. Archivo: ${(glb.length / 1e6).toFixed(1)} MB → ${((12 + 16 + json.length + binPad.length) / 1e6).toFixed(1)} MB.`);
