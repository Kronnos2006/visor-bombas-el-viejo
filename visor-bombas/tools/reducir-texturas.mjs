// Achica las texturas de un .glb para que cada pestaña del visor use menos memoria de video.
// Las texturas casi lisas (un solo color) pasan a 4×4; las demás, a un lado máximo de 512 px.
// Igual que comprimir-texturas.mjs, solo cambia los bytes de las imágenes: los bloques Draco,
// nodos, transformaciones y metadatos (extras) quedan idénticos.
// Uso: node visor-bombas/tools/reducir-texturas.mjs entrada.glb salida.glb [lado=512]
// Requiere sharp (npm install --no-save sharp).
import {readFileSync, writeFileSync} from 'node:fs';
import sharp from 'sharp';

const [entrada, salida, ladoTexto = '512'] = process.argv.slice(2);
if (!entrada || !salida) { console.error('Uso: node reducir-texturas.mjs entrada.glb salida.glb [lado]'); process.exit(1); }
const lado = Number(ladoTexto), LISA = 2; // desviación máxima por canal (0–255) para considerarla lisa
const glb = readFileSync(entrada);
if (glb.readUInt32LE(0) !== 0x46546c67) throw new Error('No es un archivo glb');
const largoJson = glb.readUInt32LE(12), j = JSON.parse(glb.subarray(20, 20 + largoJson).toString('utf8'));
const inicioBin = 20 + largoJson + 8, bin = glb.subarray(inicioBin, inicioBin + glb.readUInt32LE(20 + largoJson));
if (j.buffers.length !== 1) throw new Error('Se esperaba un único buffer');

const vistas = j.bufferViews.map(v => bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength));
let lisas = 0, reducidas = 0, videoAntes = 0, videoDespues = 0;
const video = (w, h) => w * h * 4 * 4 / 3; // RGBA con mipmaps
for (const img of j.images || []) {
 if (img.bufferView === undefined) continue;
 const original = vistas[img.bufferView], base = sharp(original), meta = await base.metadata();
 const {channels} = await sharp(original).stats();
 const esLisa = channels.every(c => c.stdev <= LISA);
 const destino = esLisa ? 4 : Math.min(lado, Math.max(meta.width, meta.height));
 videoAntes += video(meta.width, meta.height);
 if (!esLisa && destino >= Math.max(meta.width, meta.height)) { videoDespues += video(meta.width, meta.height); continue; }
 let salidaImg = sharp(original).resize({width: destino, height: destino, fit: 'inside', kernel: esLisa ? 'nearest' : 'lanczos3'});
 salidaImg = img.mimeType === 'image/jpeg' ? salidaImg.jpeg({quality: 88, mozjpeg: true}) : img.mimeType === 'image/png' ? salidaImg.png({compressionLevel: 9}) : salidaImg.webp({quality: 90, effort: 6});
 const bytes = await salidaImg.toBuffer(), nueva = await sharp(bytes).metadata();
 videoDespues += video(nueva.width, nueva.height);
 vistas[img.bufferView] = bytes; esLisa ? lisas++ : reducidas++;
}

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
console.log(`${lisas} lisas a 4×4, ${reducidas} reducidas a ${lado} px. Memoria de video de texturas: ${(videoAntes / 1e6).toFixed(0)} MB → ${(videoDespues / 1e6).toFixed(0)} MB. Archivo: ${(glb.length / 1e6).toFixed(1)} MB → ${((12 + 16 + json.length + binPad.length) / 1e6).toFixed(1)} MB.`);
