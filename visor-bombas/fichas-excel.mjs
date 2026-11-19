// Ficha completa para cada bomba del Excel que no tiene ficha propia en el prototipo.
// Así las 90 bombas usan la misma ficha: Ubicar, Fotos, Manual, Mantenimiento, Historial,
// Preguntar y Simulador. Los datos salen solo del Excel del usuario; lo que falta dice «Por confirmar».
// Import estático: Vercel incluye el JSON en la función al seguir el import.
import asignacion from './public/modelos/asignacion-bombas.json' with {type: 'json'};
import {datosDeExcel} from './public/asignacion-bombas.js';

const excel = () => asignacion.excel || {};
const PC = 'Por confirmar';
const v = x => String(x ?? '').trim() || PC;
const campo = (texto, clave) => {
 const p = String(texto || '').split('·').map(s => s.trim());
 return p.find(s => s.toLowerCase().startsWith(clave.toLowerCase() + ':'))?.split(':').slice(1).join(':').trim() || '';
};
function areaId(area) {
 const a = String(area || '').toLowerCase();
 return /destilaci/.test(a) ? 'torre' : 'tanques';
}
export function tagsExcel() { return Object.keys(excel()).sort((a, b) => a.slice(1) - b.slice(1)); }
export function fichaDeExcel(tag) {
 const e = excel()[tag];
 if (!e) return null;
 const d = datosDeExcel(e);
 const motorTxt = String(e.motor || ''), motorMarca = motorTxt.split('·')[0]?.trim() || '';
 const hp = campo(motorTxt, 'HP'), kw = campo(motorTxt, 'kW'), rpmM = campo(motorTxt, 'RPM');
 const ejeSello = String(e.sello || '').match(/(\d+(?:[.,]\d+)?(?:\/\d+)?\s*(?:"|pulg))/)?.[1] || '';
 return {
  tag, nombre: v(e.nombre), area: v(e.area), areaId: areaId(e.area), zona: v(e.area), servicio: v(e.liquido),
  grupo: 'excel', variant: 'lf', inactive: false, photo: null, soloExcel: true,
  marca: v(d.marca), modelo: v(d.modelo), size: v(e.tamano), serie: '',
  association: 'Datos del Excel de bombas · placa sin asociar',
  source: 'Excel de bombas del usuario (90 bombas)', documentarySource: 'Excel de bombas del usuario',
  specs: [['Caudal', d.caudal ? d.caudal + ' GPM' : PC], ['Altura', d.altura ? d.altura + ' m' : PC], ['Velocidad de bomba', d.rpm ? d.rpm + ' rpm' : PC], ['Impulsor', d.impulsor ? (/pulg/.test(d.impulsor) ? d.impulsor : d.impulsor + ' mm') : PC]],
  motor: {marca: v(motorMarca && !motorMarca.includes(':') ? motorMarca : ''), catalogo: PC, potencia: hp ? hp + ' HP' : kw ? kw + ' kW' : PC, rpm: rpmM ? rpmM + ' rpm' : PC},
  seal: {tipo: v(e.sello), diametro: v(ejeSello), caras: PC, elastomero: PC, codigo: PC},
  acople: v(e.acople), rodamientos: {delantero: v(e.rodDel), trasero: v(e.rodTra), conjunto: 'Bomba o motor: por confirmar'},
  observaciones: String(e.obs || '').trim(), orings: [], history: [], demonstracion: false
 };
}
