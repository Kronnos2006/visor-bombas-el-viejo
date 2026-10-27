// Borradores y traslado explícito de reportes; no simula sincronización con la planta.
export const validTag = tag => /^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(tag);
export function validReportDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const parsed = new Date(date + 'T00:00:00Z');
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}
export function createDraftStore(storage, prefix = 'vocatus-reporte-borrador-v1:') {
  const key = tag => {
    if (tag && !validTag(tag)) throw new Error('TAG de borrador inválido.');
    return prefix + (tag || '__sin_tag__');
  };
  return {
    read(tag) {
      const raw = storage.getItem(key(tag));
      if (!raw) return null;
      const draft = JSON.parse(raw);
      if (draft.version !== 1 || draft.tag !== tag || !draft.data || typeof draft.data !== 'object') throw new Error('El borrador no corresponde a este equipo.');
      return draft.data;
    },
    write(tag, data) {
      const encoded = JSON.stringify({version: 1, tag, data, updated: new Date().toISOString()});
      storage.setItem(key(tag), encoded);
      if (storage.getItem(key(tag)) !== encoded) throw new Error('El navegador no confirmó el guardado del borrador.');
    },
    remove(tag) { storage.removeItem(key(tag)); }
  };
}
function text(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new Error(label + ' inválido.');
  return value.trim();
}
export function normalizeFieldReport(input) {
  if (!input || typeof input !== 'object' || !validTag(input.tag)) throw new Error('Equipo inválido en el reporte.');
  const id = text(input.id, 100, 'Identificador');
  if (!/^[\w.-]+$/.test(id)) throw new Error('Identificador inválido.');
  if (!validReportDate(input.date)) throw new Error('Fecha inválida.');
  if (!['si', 'no'].includes(input.operativo)) throw new Error('Indicá si el equipo quedó funcionando.');
  if (typeof input.retirado !== 'boolean') throw new Error('Indicá si el equipo se retiró.');
  const symptoms = text(input.symptoms, 600, 'Problema');
  const details = text(input.text || input.details || symptoms, 8000, 'Detalle');
  const parts = input.parts || '';
  if (typeof parts !== 'string' || parts.length > 4000) throw new Error('La lista de repuestos supera 4000 caracteres.');
  return {id, tag: input.tag, date: input.date, author: text(input.author, 100, 'Responsable'),
    title: text(input.title, 200, 'Título'), symptoms, text: details, parts,
    operativo: input.operativo, retirado: input.retirado};
}
export function fieldReportPackage(records) {
  if (!Array.isArray(records) || !records.length || records.length > 50) throw new Error('El paquete debe contener entre 1 y 50 reportes.');
  const reports = records.map(normalizeFieldReport);
  const keys = reports.map(r => r.tag + ':' + r.id);
  if (new Set(keys).size !== keys.length) throw new Error('El paquete contiene reportes duplicados.');
  return {format: 'vocatus-field-reports', version: 1, exported: new Date().toISOString(), reports};
}
export function parseFieldReportPackage(raw) {
  if (typeof raw !== 'string' || raw.length > 5 * 1024 * 1024) throw new Error('El archivo debe ser JSON de hasta 5 MB.');
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('El archivo no contiene JSON válido.'); }
  if (data?.format !== 'vocatus-field-reports' || data.version !== 1) throw new Error('No es un paquete de reportes de Vocatus compatible.');
  return fieldReportPackage(data.reports).reports;
}
export async function importFieldReports(records, api) {
  const reports = fieldReportPackage(records).reports;
  const pending = await api('/api/pending');
  if (!pending.writable) throw new Error('Importá el paquete desde el visor de la computadora conectado a Obsidian.');
  const repairs = new Set((pending.repairs || []).map(r => r.tag));
  let count = 0;
  for (const r of reports) {
    await api('/api/maintenance', {tag: r.tag, sourceId: r.id, date: r.date, author: r.author,
      title: r.title, details: r.text, symptoms: r.symptoms, parts: r.parts, operativo: r.operativo});
    if (r.retirado && !repairs.has(r.tag)) {
      await api('/api/equipment', {action: 'repair', tag: r.tag, reason: r.symptoms.split('\n')[0].slice(0, 300), report: r.text, date: r.date, author: r.author});
      repairs.add(r.tag);
    }
    count++;
  }
  return count;
}
