// Referencias consultadas el 09-oct-2026. No completan ni modifican el inventario.
// John Crane TD-21 y TD-1/1B, revisión 10/2015; Goulds e-SH, catálogo de repuestos.
import {componentRows} from './equipos-sector.js';

export const sealDocs={
 type21:'https://www.johncrane.com/media/505hkafe/td-21-4pg-bw-oct2015_3rdfeb.pdf',
 type1:'https://www.johncrane.com/media/kutiyh5s/td-1-1b-8pg-bw-oct2015.pdf',
 goulds:'https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf'
};
const missing=v=>!v||/por confirmar|sin dato/i.test(v);
export function sealTitle(p){
 const type=p?.seal?.tipo;
 if(missing(type))return 'Sellado del eje · sin identificar';
 return /Tipo 1\s*\(/i.test(type)?'Sello mecánico · Tipos 1 / 21 registrados':/Tipo 21/i.test(type)?'Sello mecánico Tipo 21':'Sello mecánico';
}
export function sealRecord(p){
 const rows=componentRows(p,5);
 return {rows:rows.filter(([,v])=>!missing(v)),pending:rows.filter(([,v])=>missing(v)).map(([k])=>k)};
}
export function sealReference(p){
 if(p.inactive)return null;
 if(p.variant==='goulds')return {
  title:'Goulds e-SH · opciones de repuesto',
  scope:'Referencia de la familia e-SH, grupo S. El catálogo no demuestra qué kit está instalado en '+p.tag+'. Confirmar la variante y el código antes de seleccionar un repuesto.',
  rows:[['Posición del sello en el despiece','383 · Tipo 21'],['10K27 · opción estándar del catálogo','Carbón / carburo de silicio / Viton'],['10K19 · opción de alta temperatura','Carbón / carburo de silicio / EPR'],['10K64 · opción de servicio severo','Carburo de silicio / carburo de silicio / Viton']],
  links:[{t:'Goulds / Xylem · despiece y códigos de sello (PDF, pág. 2)',u:sealDocs.goulds+'#page=2',k:'fabricante'}]
 };
 const recorded=/Tipo 21/i.test(p.seal?.tipo||'');
 return {
  title:'John Crane Tipo 21 · construcción y materiales de catálogo',
  scope:recorded?'Referencia para el tipo mencionado en el registro. La anotación «Tipo 1 (O) - Tipo 21 (G)» se conserva sin resolver sus alternativas; no acredita marca ni materiales instalados.':'Referencia para comparar: el Tipo 21 figura en otras bombas de la selección, pero el sellado de '+p.tag+' no está identificado. No se le asigna este tipo por compartir familia de bomba.',
  rows:[['Construcción','Sello por componentes, con fuelle elastomérico y un resorte helicoidal; no es cartucho'],['Piezas del corte','Anillo de sellado, asiento, resorte, retenedor, fuelle y banda de arrastre'],['Cara primaria · catálogo','Carbón estándar; opciones de grafito siliconizado, carburo de tungsteno o carburo de silicio'],['Fuelle · opciones de catálogo','Buna-N, fluoroelastómero, etileno propileno o neopreno']],
  links:[{t:'John Crane Tipo 21 · corte del sello (PDF, pág. 1)',u:sealDocs.type21+'#page=1',k:'fabricante'},{t:'John Crane Tipo 21 · dimensiones (pág. 2) y materiales (pág. 3)',u:sealDocs.type21+'#page=2',k:'fabricante'},{t:'John Crane Tipos 1 / 1B · ficha y corte para comparar',u:sealDocs.type1+'#page=1',k:'fabricante'}]
 };
}
