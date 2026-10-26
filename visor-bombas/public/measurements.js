// Mediciones de presión y caudal de los informes de mantenimiento.
// No se sustituyen lecturas ausentes por valores calculados, nominales o de demostración.
//
// Orden de confianza:
//  1. "registro": campos estructurados del informe (medicion_presion_bar / medicion_caudal_m3h),
//     guardados desde el formulario con unidad y fecha.
//  2. "texto": un único valor rotulado en el texto de un informe anterior ("Presión: 2,1 bar").
//     Es una extracción: se muestra como tal, no como lectura confirmada.
//  3. "ambiguo": el texto menciona varios valores o un antes/después ("Antes 2 bar; medida: 4 bar").
//     No se grafica ninguno; se informa que hay que revisarlo.
const AMBIGUO = /\b(antes|despu[eé]s|previ[oa]|anterior|inicial|final|subi[oó]|baj[oó]|cambi[oó]|pas[oó])\b|\bde\s+\d+(?:[.,]\d+)?\s*(?:bar|kg\/cm2|m3\/h|m³\/h|gpm)?\s+a\s+\d/i;
const num = s => Number(String(s).replace(',', '.'));
const finite = v => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) ? Number(v) : null;

function fromText(text, re, convert) {
 const values = [...String(text || '').matchAll(re)].map(m => convert(num(m[1]), m[2]));
 const distinct = [...new Set(values.map(v => Math.round(v * 1000) / 1000))];
 if (!distinct.length) return {value: null, origen: null};
 if (distinct.length > 1 || AMBIGUO.test(text)) return {value: null, origen: 'ambiguo'};
 return {value: values[0], origen: 'texto'};
}
const PRESSURE = /(-?\d+(?:[.,]\d+)?)\s*(bar|kg\/cm2)\b/gi;
const FLOW = /(-?\d+(?:[.,]\d+)?)\s*(m3\/h|m³\/h|gpm)/gi;
const toBar = (v, u) => /kg/i.test(u) ? v * 0.980665 : v;
const toM3h = (v, u) => /gpm/i.test(u) ? v * 0.227124707 : v;

// Acepta un informe ({mediciones, text, title}) o, por compatibilidad, solo su texto.
export function reportMeasurements(report) {
 const r = typeof report === 'string' || report == null ? {text: report} : report;
 const m = r.mediciones || {};
 const text = [r.text, r.title].filter(Boolean).join(' ');
 const one = (structured, re, convert) => structured !== null ? {value: structured, origen: 'registro'} : fromText(text, re, convert);
 const p = one(finite(m.presion_bar), PRESSURE, toBar), f = one(finite(m.caudal_m3h), FLOW, toM3h);
 return {pressure: p.value, flow: f.value, origen: {pressure: p.origen, flow: f.origen}};
}

// Valida lo que llega del formulario: número finito y no negativo, en bar y m³/h.
export function measurementInput(pressure, flow) {
 const parse = (v, label) => {
  const s = String(v ?? '').trim().replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) throw new Error(`${label} debe ser un número mayor o igual a 0.`);
  return n;
 };
 return {presion_bar: parse(pressure, 'La presión'), caudal_m3h: parse(flow, 'El caudal')};
}
