// Rango de trabajo de la bomba, registrado por TAG. No procede del simulador
// ni de los límites de temperatura de un catálogo de sellos o motores.
const numero = value => {
 if (value === null || value === undefined || String(value).trim() === '') return null;
 const parsed = Number(String(value).trim().replace(',', '.'));
 return Number.isFinite(parsed) ? parsed : null;
};

export function rangoTemperaturaTrabajo(data = {}) {
 const ficha = data.documental || data;
 const min = numero(ficha.temperatura_trabajo_min_c);
 const max = numero(ficha.temperatura_trabajo_max_c);
 if (min === null || max === null || min > max) return null;
 return {min, max, fuente: String(ficha.temperatura_trabajo_fuente || '').trim()};
}

export function formatoRangoTemperatura(range) {
 return range ? `${range.min} a ${range.max} °C` : 'Por confirmar';
}

export function temperaturaTrabajo(data = {}) {
 return formatoRangoTemperatura(rangoTemperaturaTrabajo(data));
}
