// Solicitud de repuestos a bodega en PDF. No guarda nada: el PDF lo descarga quien lo pide.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { safeText } from './pdf-generator.mjs';

const MAX_ITEMS = 40;
const one = (v, max = 160) => safeText(String(v ?? '').slice(0, max));

export function normalizeRequest(input) {
 const items = (Array.isArray(input?.items) ? input.items : []).slice(0, MAX_ITEMS).map(i => ({
  tag: one(i.tag, 12), pieza: one(i.pieza, 80), detalle: one(i.detalle, 160), codigo: one(i.codigo, 60),
  cantidad: Math.max(1, Math.min(999, Number.parseInt(i.cantidad, 10) || 1)),
 })).filter(i => i.pieza);
 if (!items.length) throw new Error('Agregá al menos un repuesto a la solicitud.');
 const solicitante = one(input.solicitante, 80);
 if (!solicitante) throw new Error('Indicá quién solicita los repuestos.');
 const fecha = /^\d{4}-\d{2}-\d{2}$/.test(input.fecha) ? input.fecha : new Date().toISOString().slice(0, 10);
 return {items, solicitante, fecha, area: one(input.area, 80), motivo: one(input.motivo, 300), orden: one(input.orden, 40), demo: !!input.demo};
}

export async function generatePartsRequestPDF(input) {
 const r = normalizeRequest(input);
 const doc = await PDFDocument.create();
 const font = await doc.embedFont(StandardFonts.Helvetica), bold = await doc.embedFont(StandardFonts.HelveticaBold);
 const dark = rgb(.12, .16, .15), muted = rgb(.4, .46, .44), line = rgb(.82, .86, .85), head = rgb(.08, .22, .2), alt = rgb(.96, .97, .97), warn = rgb(.75, .35, .15);
 const W = 595.28, H = 841.89, X = 40, CW = W - 2 * X;
 const cols = [{k: '#', w: 22}, {k: 'TAG', w: 48}, {k: 'Pieza', w: 110}, {k: 'Detalle / medida', w: 175}, {k: 'Código', w: 110}, {k: 'Cant.', w: CW - 465}];
 let page, y;
 const fit = (text, f, size, width) => { let t = text; while (t && f.widthOfTextAtSize(t, size) > width) t = t.slice(0, -1); return t === text ? t : t.slice(0, -1) + '...'; };
 const wrap = (text, f, size, width) => { const out = []; let cur = ''; for (const w of text.split(' ')) { const t = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t; } if (cur) out.push(cur); return out.length ? out : ['']; };
 function newPage() {
  page = doc.addPage([W, H]); y = H - 50;
  page.drawRectangle({x: 0, y: H - 8, width: W, height: 8, color: head});
  page.drawText('VOCATUS · EL VIEJO'.replace('·', '-'), {x: X, y, size: 9, font: bold, color: muted});
  page.drawText(`Solicitud a bodega - ${r.fecha}`, {x: W - X - font.widthOfTextAtSize(`Solicitud a bodega - ${r.fecha}`, 9), y, size: 9, font, color: muted});
  y -= 30;
 }
 newPage();
 page.drawText('Solicitud de repuestos a bodega', {x: X, y, size: 20, font: bold, color: head}); y -= 26;
 if (r.demo) { page.drawText('DEMOSTRACION: datos ficticios, no usar para compras reales.', {x: X, y, size: 10, font: bold, color: warn}); y -= 18; }
 for (const [label, value] of [['Solicita', r.solicitante], ['Fecha', r.fecha], ['Area', r.area || '-'], ['Orden de trabajo', r.orden || '-']]) {
  page.drawText(label + ':', {x: X, y, size: 10, font: bold, color: dark}); page.drawText(value, {x: X + 105, y, size: 10, font, color: dark}); y -= 15;
 }
 if (r.motivo) { page.drawText('Motivo:', {x: X, y, size: 10, font: bold, color: dark}); for (const l of wrap(r.motivo, font, 10, CW - 105)) { page.drawText(l, {x: X + 105, y, size: 10, font, color: dark}); y -= 14; } }
 y -= 12;
 const header = () => {
  page.drawRectangle({x: X, y: y - 6, width: CW, height: 20, color: head});
  let cx = X + 4; for (const c of cols) { page.drawText(c.k, {x: cx, y, size: 9, font: bold, color: rgb(1, 1, 1)}); cx += c.w; }
  y -= 22;
 };
 header();
 r.items.forEach((item, n) => {
  const detail = wrap(item.detalle || '-', font, 8.5, cols[3].w - 6).slice(0, 3), h = Math.max(1, detail.length) * 11 + 8;
  if (y - h < 150) { newPage(); header(); }
  if (n % 2) page.drawRectangle({x: X, y: y - h + 12, width: CW, height: h, color: alt});
  let cx = X + 4;
  const cells = [String(n + 1), item.tag || '-', item.pieza, null, item.codigo || 'Sin codigo', String(item.cantidad)];
  cells.forEach((text, i) => {
   if (i === 3) detail.forEach((l, j) => page.drawText(l, {x: cx, y: y - j * 11, size: 8.5, font, color: dark}));
   else page.drawText(fit(text, i === 2 ? bold : font, 8.5, cols[i].w - 6), {x: cx, y, size: 8.5, font: i === 2 ? bold : font, color: i === 4 && !item.codigo ? warn : dark});
   cx += cols[i].w;
  });
  y -= h; page.drawLine({start: {x: X, y: y + 10}, end: {x: X + CW, y: y + 10}, thickness: .5, color: line});
 });
 y -= 10;
 page.drawText(`${r.items.length} linea(s) · ${r.items.reduce((s, i) => s + i.cantidad, 0)} unidades`.replace('·', '-'), {x: X, y, size: 9, font, color: muted});
 if (r.items.some(i => !i.codigo)) { y -= 14; page.drawText('Las lineas "Sin codigo" requieren que bodega confirme el numero de parte antes de despachar.', {x: X, y, size: 8.5, font, color: warn}); }
 y = Math.min(y - 50, 120);
 for (const [i, label] of ['Solicita', 'Autoriza', 'Entrega bodega'].entries()) {
  const sx = X + i * (CW / 3);
  page.drawLine({start: {x: sx, y}, end: {x: sx + CW / 3 - 20, y}, thickness: .7, color: dark});
  page.drawText(label, {x: sx, y: y - 13, size: 9, font, color: muted});
 }
 page.drawText('Generado por el visor de bombas. Verificar medidas y compatibilidad contra la ficha y el catalogo del fabricante.', {x: X, y: 40, size: 7.5, font, color: muted});
 return doc.save();
}
