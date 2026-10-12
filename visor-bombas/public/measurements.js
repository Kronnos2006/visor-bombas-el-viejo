// No se sustituyen lecturas ausentes por valores calculados o de demostración.
export function reportMeasurements(text) {
 const pressure = String(text || '').match(/(-?\d+(?:[.,]\d+)?)\s*(bar|kg\/cm2)/i);
 const flow = String(text || '').match(/(-?\d+(?:[.,]\d+)?)\s*(m3\/h|m³\/h|gpm)/i);
 const number = match => match ? Number(match[1].replace(',', '.')) : null;
 return {
  pressure: pressure ? number(pressure) * (/kg/i.test(pressure[2]) ? 0.980665 : 1) : null,
  flow: flow ? number(flow) * (/gpm/i.test(flow[2]) ? 0.227124707 : 1) : null
 };
}
