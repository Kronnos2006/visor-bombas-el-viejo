// PDF del resumen técnico y solicitud a bodega: sin duplicados, autores conservados, orden,
// límites declarados y sin recortes silenciosos.
import test from 'node:test';
import assert from 'node:assert/strict';
import {PDFDocument} from 'pdf-lib';
import {generatePumpPDF} from './pdf-generator.mjs';
import {normalizeRequest, generatePartsRequestPDF, MAX_ITEMS} from './parts-request.mjs';
import {readIntegratedPump} from './server.mjs';

// Texto visible del PDF: pdf-lib escribe cadenas hexadecimales <..> en Tj/TJ.
async function texto(bytes) {
 const zlib = await import('node:zlib'), doc = await PDFDocument.load(bytes);
 let out = '';
 for (const p of doc.getPages()) {
  const c = p.node.Contents(), refs = c?.asArray ? c.asArray() : [c];
  for (const r of refs) {
   const st = doc.context.lookup(r), raw = Buffer.from(st.getContents());
   let s; try { s = zlib.inflateSync(raw).toString('latin1'); } catch { s = raw.toString('latin1'); }
   for (const m of s.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) out += Buffer.from(m[1], 'hex').toString('latin1') + '\n';
  }
 }
 return {out, paginas: doc.getPageCount()};
}

test('el resumen no duplica informes, conserva autores y los ordena', async () => {
 const pump = readIntegratedPump('B30');
 pump.reports = [{file: '00-Proyecto/Mantenimiento/B30_2026-09-01_a.md', record: {id: 'B30_2026-09-01_a.md', date: '2026-09-01', title: 'Cambio de sello', text: 'Se cambió el sello mecánico.', author: 'Ana Rojas', source: 'obsidian'}}];
 const reportes = [
  {id: 'B30_2026-09-01_a.md', date: '2026-09-01', title: 'Cambio de sello', text: 'Se cambió el sello mecánico.', author: 'Ana Rojas', source: 'obsidian'},
  {id: 'navegador-1', date: '2026-10-05', title: 'Ruido en rodamiento', text: 'x'.repeat(400) + ' FIN-DEL-TEXTO', author: 'Luis Mora', source: 'browser'}
 ];
 const {out} = await texto(await generatePumpPDF(pump, {reportes}));
 assert.equal(out.match(/Cambio de sello/g)?.length, 1, 'el informe de Obsidian aparece duplicado');
 assert.match(out, /Responsable: Ana Rojas/); assert.match(out, /Responsable: Luis Mora/);
 assert.doesNotMatch(out, /T[eé]cnico de Planta/);
 assert.ok(out.indexOf('2026-10-05') < out.indexOf('2026-09-01'), 'el más reciente va primero');
 assert.match(out, /FIN-DEL-TEXTO/, 'el detalle largo se cortó');
});

test('el resumen declara cuando muestra solo una parte del historial', async () => {
 const pump = readIntegratedPump('B30');
 const reportes = Array.from({length: 35}, (_, i) => ({id: 'r' + i, date: `2026-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 28).padStart(2, '0')}`, title: 'Ronda ' + i, author: 'Técnico ' + i, source: 'browser'}));
 const {out, paginas} = await texto(await generatePumpPDF(pump, {reportes}));
 const m = out.match(/Se muestran los 30 registros m.s recientes de (\d+)/); assert.ok(m && Number(m[1]) >= 35, "no se declara el límite del historial");
 assert.ok(paginas > 1);
});

test('la solicitud a bodega no recorta ni descarta en silencio', async () => {
 const base = {solicitante: 'Kensy', fecha: '2026-10-26'};
 assert.throws(() => normalizeRequest({...base, items: Array.from({length: MAX_ITEMS + 1}, () => ({pieza: 'Sello'}))}), /41 líneas; el máximo es 40/);
 assert.throws(() => normalizeRequest({...base, items: [{pieza: 'Sello', codigo: 'X'.repeat(61)}]}), /código supera 60/);
 assert.throws(() => normalizeRequest({...base, items: [{pieza: 'Sello', cantidad: '0'}]}), /cantidad/);
 const codigo = 'ABCDEFGHIJ-0123456789-KLMNOPQRST-9876543210-UVWXYZ';
 const detalle = 'Sello mecánico tipo 21 con caras carbón/cerámica, elastómero Viton, eje 1.3/8 pulg, para bomba Hidromac 2196 de la línea de alcohol FINAL';
 const items = Array.from({length: 40}, (_, i) => ({tag: 'B30', pieza: 'Sello ' + i, detalle, codigo, cantidad: 2}));
 const {out, paginas} = await texto(await generatePartsRequestPDF({...base, items}));
 assert.ok(paginas >= 2);
 assert.equal(out.match(/FINAL/g)?.length, 40, 'algún detalle se cortó');
 assert.equal(out.replace(/\n/g, '').split(codigo).length - 1, 40, 'algún código se cortó');
 assert.doesNotMatch(out, /\.\.\./);
 assert.match(out, /40 linea\(s\)/);
});
