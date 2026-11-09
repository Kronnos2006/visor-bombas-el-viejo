import test from 'node:test';
import assert from 'node:assert/strict';
import {vigilarPestanas, contarOtras} from './public/pestanas-visor.js';

// Canal falso que reparte mensajes entre las pestañas creadas en la prueba.
function red() {
 const canales = new Set();
 return class {
  constructor() { canales.add(this); }
  postMessage(data) { for (const c of canales) if (c !== this) c.onmessage?.({data}); }
 };
}
function documento() {
 const oyentes = [];
 return {hidden: false, addEventListener: (_, f) => oyentes.push(f), cambiar(h) { this.hidden = h; oyentes.forEach(f => f()); }};
}
globalThis.addEventListener ??= () => {};
const viejoIntervalo = globalThis.setInterval;
globalThis.setInterval = () => 0;

test('cuenta solo pestañas con latido reciente', () => {
 assert.equal(contarOtras(new Map([['a', 1000], ['b', 1000 - 60000]]), 1000), 1);
});

test('avisa al abrir una segunda pestaña', () => {
 const Canal = red(), avisos = [];
 vigilarPestanas({liberar() {}, recargar() {}, avisar: n => avisos.push(n), doc: documento(), Canal});
 vigilarPestanas({liberar() {}, recargar() {}, avisar: n => avisos.push(n), doc: documento(), Canal});
 assert.ok(avisos.includes(2));
});

test('libera la pestaña oculta solo si hay otra abierta y recarga al volver', async () => {
 const Canal = red(), d1 = documento(), log = [];
 const a = vigilarPestanas({liberar: () => log.push('liberar'), recargar: () => log.push('recargar'), avisar() {}, espera: 5, doc: d1, Canal});
 d1.cambiar(true); await new Promise(r => setTimeout(r, 20));
 assert.deepEqual(log, [], 'sola no se libera');
 vigilarPestanas({liberar() {}, recargar() {}, avisar() {}, doc: documento(), Canal});
 d1.cambiar(false); d1.cambiar(true); await new Promise(r => setTimeout(r, 20));
 assert.deepEqual(log, ['liberar']); assert.equal(a.liberado, true);
 d1.cambiar(false);
 assert.deepEqual(log, ['liberar', 'recargar']); assert.equal(a.liberado, false);
});

test('el modelo de planta no supera 100 MB de texturas en video', async () => {
 const {readFileSync} = await import('node:fs');
 const glb = readFileSync(new URL('./public/modelos/blender-local/planta-blender-local.glb', import.meta.url));
 const largo = glb.readUInt32LE(12), j = JSON.parse(glb.subarray(20, 20 + largo).toString('utf8'));
 const bin = glb.subarray(20 + largo + 8);
 let total = 0;
 for (const img of j.images) {
  const v = j.bufferViews[img.bufferView], b = bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength);
  let w, h;
  if (img.mimeType === 'image/jpeg') { let i = 2; while (i < b.length) { const m = b[i + 1], l = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xc3) { h = b.readUInt16BE(i + 5); w = b.readUInt16BE(i + 7); break; } i += 2 + l; } }
  else if (b.toString('ascii', 8, 12) === 'WEBP') { const f = b.toString('ascii', 12, 16); if (f === 'VP8 ') { w = b.readUInt16LE(26) & 0x3fff; h = b.readUInt16LE(28) & 0x3fff; } else if (f === 'VP8L') { const n = b.readUInt32LE(21); w = (n & 0x3fff) + 1; h = ((n >> 14) & 0x3fff) + 1; } else { w = 1 + b.readUIntLE(24, 3); h = 1 + b.readUIntLE(27, 3); } }
  else { w = b.readUInt32BE(16); h = b.readUInt32BE(20); }
  assert.ok(w > 0 && h > 0, 'tamaño legible');
  total += w * h * 4 * 4 / 3;
 }
 assert.ok(total < 100e6, `texturas ${Math.round(total / 1e6)} MB`);
});

test.after(() => { globalThis.setInterval = viejoIntervalo; });
