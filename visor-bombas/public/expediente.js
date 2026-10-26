// Imágenes y documentación del fabricante para el "Expediente del equipo".
// Imágenes: extraídas de "Libro1 bomba2.xlsx" (hoja Bombas), asociadas por la fila en que están ancladas.
// Enlaces: páginas/PDF públicos de cada fabricante, comprobados al preparar esta versión.
// Regla de datos: lo que no está documentado se deja como "Por confirmar".

import {sealReference, sealDocs} from './sellos-fabricante.js';
const SKF='https://www.skf.com/';
export const enlaces={
  hidromac:[
    {t:'Catálogo Hidromac · Serie 2196 ANSI B73.1M (PDF, vía distribuidor Bomeq)',u:'https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf',k:'catálogo'},
    {t:'Portafolio Hidromac · Bombas de proceso químico ANSI',u:'https://hidromac.com/portafolio/',k:'fabricante'},
    {t:'Solicitar planos / CAD a Hidromac (asesoría técnica)',u:'https://hidromac.com/contactanos/asesoria-tecnica-y-cotizaciones/',k:'CAD',nota:'Hidromac no publica CAD descargable; se solicita al fabricante (ventas@hidromac.com).'}
  ],
  weg:[
    {t:'Catálogo WEG · Producto estándar (datos eléctricos y mecánicos, PDF)',u:'https://static.weg.net/medias/downloadcenter/hd1/hcf/US100-Electrical-and-Mechanical-Data.pdf',k:'catálogo'},
    {t:'WEG W21 · 00218XT3E145T · ficha del código registrado',u:'https://www.weg.net/catalog/weg/US/en/MKT-WMO-US-TEXT-Explosion-NEMA-PREMIUM-EFFICIENCY//W21-Explosion-proof-Motor-NEMA-Premium-Efficiency-2-HP-4P-143-5T-3Ph-230-460-380-V-60-50-Hz-IC411---TEFC---Foot-mounted/p/14281754',k:'fabricante',nota:'La ficha indica reemplazo por producto 14325085. Aplicable como referencia únicamente al código 00218XT3E145T.'}
  ],
  rexnord:[
    {t:'Rexnord · Elemento elástico ES2-R (acople Omega)',u:'https://www.rexnord.com/products/7300075',k:'catálogo',nota:'La ficha del fabricante no publica CAD descargable en esa página.'}
  ],
  goulds:[
    {t:'Goulds e-SH · Brochure técnico del fabricante (PDF, Xylem)',u:'https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf',k:'catálogo'},
    {t:'Goulds 15SH06K6 · Kit extremo líquido e-SH (ficha)',u:'https://www.pumpcatalog.com/goulds/pump-repair-parts/15sh06k6/',k:'distribuidor'},
    {t:'Goulds e-SH · despiece y catálogo de repuestos (PDF, Xylem)',u:sealDocs.goulds,k:'fabricante',nota:'Referencia de familia; comprobar grupo y variante antes de seleccionar piezas.'}
  ],
  usmotors:[
    {t:'Nidec / US Motors · XJ7P1BM · tabla oficial de motores JM (PDF)',u:'https://acim.nidec.com/-/media/USMotors/Documents/Catalogs/FL600/CCP-3ph-HAZ-JM.pdf',k:'fabricante',nota:'Buscar XJ7P1BM. El catálogo agrupa por velocidad sincrónica; se conserva la velocidad registrada del equipo.'}
  ],
  skf:{
    '6205-2RS':{t:'SKF 6205-2RSH · referencia cercana; no confirma equivalencia con 6205-2RS',u:SKF+'group/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6205-2RSH'},
    '6204-2RS':{t:'SKF 6204-2RSH · referencia cercana; no confirma equivalencia con 6204-2RS',u:SKF+'us/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6204-2RSH'},
    '6308-2RS':{t:'SKF 6308-2RSH · referencia cercana; no confirma equivalencia con 6308-2RS',u:SKF+'au/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6308-2RSH'},
    '6207-2RS':{t:'SKF 6207-2RSH · referencia cercana; no confirma equivalencia con 6207-2RS',u:SKF+'products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6207-2RSH?failover=true'},
    '6309-2Z':{t:'SKF 6309-2Z · ficha y descarga CAD',u:SKF+'group/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6309-2Z'},
    '6206-2Z':{t:'SKF 6206 (base del 6206-2Z) · ficha y descarga CAD',u:SKF+'us/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6206'}
  }
};

const I=n=>`/expediente/${n}.jpg`;
const fila='Libro1 bomba2.xlsx · hoja Bombas',fila3='Libro1.bombas_3.xlsx · hoja Bombas';
// placas: placa(s) de la bomba · fotos: fotografías del equipo. "ref" = nota de asociación.
export const expediente={

  // Torre de destilación · imágenes de «Libro1.bombas_3.xlsx» (13-oct-2026), asociadas por la fila del ancla.
  B3:{placas:[{src:I('B3-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 6`},{src:I('B3-placa2'),t:'Placa del motor',ref:`${fila3}, fila 6`}],fotos:[{src:I('B3-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 6`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B4:{placas:[{src:I('B4-placa2'),t:'Placa del motor',ref:`${fila3}, fila 7`}],fotos:[{src:I('B4-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 7`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B5:{placas:[{src:I('B5-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 8`},{src:I('B5-placa2'),t:'Placa del motor',ref:`${fila3}, fila 8`}],fotos:[{src:I('B5-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 8`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B6:{placas:[{src:I('B6-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 9`},{src:I('B6-placa2'),t:'Placa del motor',ref:`${fila3}, fila 9`}],fotos:[{src:I('B6-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 9`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B7:{placas:[{src:I('B7-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 10`},{src:I('B7-placa2'),t:'Placa del motor',ref:`${fila3}, fila 10`}],fotos:[{src:I('B7-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 10`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B8:{placas:[{src:I('B8-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 11`},{src:I('B8-placa2'),t:'Placa del motor',ref:`${fila3}, fila 11`}],fotos:[{src:I('B8-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 11`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B11:{placas:[{src:I('B11-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 14`}],fotos:[{src:I('B11-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 14`}],fab:['hidromac','weg'],rod:['6307-2RS','6206-2RS']},
  B12:{placas:[{src:I('B12-placa'),t:'Placa de la bomba',ref:`${fila3}, fila 15`}],fotos:[{src:I('B12-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 15`}],fab:['hidromac','weg'],rod:['6307-2RS','6206-2RS']},
  B17:{placas:[{src:I('B17-placa'),t:'Placa Titan (1 de 2)',ref:`${fila3}, fila 20`},{src:I('B17-placa2'),t:'Placa Titan (2 de 2)',ref:`${fila3}, fila 20`}],fotos:[{src:I('B17-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 20`}],fab:[],rod:[]},
  B18:{placas:[{src:I('B18-placa'),t:'Placa Titan (1 de 2)',ref:`${fila3}, fila 21`},{src:I('B18-placa2'),t:'Placa Titan (2 de 2)',ref:`${fila3}, fila 21`}],fotos:[{src:I('B18-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 21`}],fab:[],rod:[]},
  B19:{placas:[{src:I('B19-placa2'),t:'Placa del motor',ref:`${fila3}, fila 22`}],fotos:[{src:I('B19-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 22`}],fab:[],rod:[]},
  B20:{placas:[{src:I('B20-placa'),t:'Placa Titan (1 de 2)',ref:`${fila3}, fila 23`},{src:I('B20-placa2'),t:'Placa Titan (2 de 2)',ref:`${fila3}, fila 23`}],fotos:[{src:I('B20-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 23`}],fab:[],rod:[]},
  B21:{placas:[{src:I('B21-placa'),t:'Placa Titan (1 de 2)',ref:`${fila3}, fila 24`},{src:I('B21-placa2'),t:'Placa Titan (2 de 2)',ref:`${fila3}, fila 24`}],fotos:[{src:I('B21-bomba'),t:'Foto de la bomba',ref:`${fila3}, fila 24`}],fab:[],rod:[]},
  B22:{placas:[{src:I('B22-placa'),t:'Placa de la bomba',ref:`${fila}, fila 25`}],fotos:[{src:I('B22-bomba'),t:'Foto de la bomba (SIN USO)',ref:`${fila}, fila 25`}],fab:[],
    pendiente:'B22/B24: el croquis de la página 8 rotula B22 en la posición que la página 1 y la confirmación del 08-oct-2026 asignan a B24. B22 se conserva en el frente como SIN USO; falta conciliar el documento de origen.',
    nota:'Equipo marcado SIN USO en el Excel; la placa existe pero su texto no se transcribió: sin datos técnicos.'},
  B23:{placas:[{src:I('B23-placa'),t:'Placa de características',ref:`${fila}, fila 26`}],fotos:[{src:I('B23-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 26`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B24:{placas:[],fotos:[{src:I('B24-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 27`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS'],
    pendiente:'B22/B24: el croquis de la página 8 rotula B22 en esta posición. La página 1 y la confirmación del 08-oct-2026 indican B24; se conserva B24 y la discrepancia queda pendiente de conciliación documental.',
    nota:'El Excel no trae foto de placa para B24; comparte datos con B25 (mismo tanque FW).'},
  B25:{placas:[{src:I('B25-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 28`,serie:'210771-3'}],fotos:[],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS'],
    nota:'La placa se lee "1X1.5-8 LF" y el Excel registra "1X1.5X8 STO": verificar en campo cuál es el tamaño correcto. El último dígito de la serie es poco legible.'},
  B30:{placas:[{src:I('B30-placa'),t:'Placa de características',ref:`${fila}, fila 33`}],fotos:[{src:I('B30-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 33`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS']},
  B31:{placas:[{src:I('B31-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 34`,serie:'210771-5'}],fotos:[{src:I('B31-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 34`},{src:I('B31-bomba2'),t:'Foto adicional (anclada en la misma fila 34; puede ser B32)',ref:`${fila}, fila 34`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS']},
  B32:{placas:[{src:I('B32-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 35`,serie:'210771-2'}],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B33:{placas:[],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS'],
    pendiente:'B33 no tiene fila ni imágenes en Libro1 bomba2.xlsx. Los datos técnicos proceden de la tabla aportada por el usuario el 08-oct-2026; la ubicación Cabezas & Colas procede de la ficha previa. Falta conciliar ambas fuentes en campo.',
    nota:'El Excel de fotos no incluye imágenes de B33. No se le asigna una fila ni una placa por semejanza.'},
  B36:{placas:[{src:I('B36-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 39`,serie:'210775-3'},{src:I('B36-placa2'),t:'Segunda placa 3X4 (filas 38–39, sin ID; serie ilegible)',ref:`${fila}, fila 38–39`}],fotos:[{src:I('B36-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 39`},{src:I('B36-bomba2'),t:'Foto adicional (filas 38–40, puede ser B34/B35)',ref:`${fila}, fila 38–40`}],fab:['hidromac','weg'],rod:['6308-2RS','6207-2RS']},
  B37:{placas:[],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS'],
    nota:'El Excel de fotos no trae imágenes en la fila de B37.'},
  B38:{placas:[{src:I('B38-placa'),t:'Placa de características',ref:`${fila}, fila 41`}],fotos:[{src:I('B38-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 41`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B41:{placas:[{src:I('B41-placa'),t:'Placa de la bomba',ref:`${fila}, fila 44`}],fotos:[{src:I('B41-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 44`}],fab:['goulds','usmotors'],rod:['6309-2Z','6206-2Z']}
};
// Servicios del Excel de inventario: "Equipo / Ubicación" es el tanque al que está conectada la bomba.

// ── Manual, planos y enlace por componente ─────────────────────────────────────────────
// Manual Malmedi/Hidromac 2196 (112 pág.) en ManualsLib; ?page=N abre la página. Páginas según el índice del manual (verificar).
const MAN='https://www.manualslib.es/manual/481189/Malmedi-Hidromac-2196.html';
const pag=n=>`${MAN}?page=${n}`;
const CAT_H=enlaces.hidromac[0].u;
const GOULDS={man:'https://www.xylem.com/en-us/brand/goulds-water-technology/',guia:enlaces.goulds[2].u,bro:enlaces.goulds[0].u};
// índice de pieza (ver `parts` en app.js) → [texto, url, páginas]
const HID_PIEZA=[
  ['Carcasa · descripción',pag(8),'pág. 8'],['Juntas y o-rings en armado',pag(51),'pág. 51'],['Ajuste del impulsor',pag(30),'pág. 30–31'],
  ['Lista de partes y corte',pag(87),'pág. 87–92'],['Mantenimiento de sellos del eje',pag(40),'pág. 40'],['Mantenimiento de sellos del eje',pag(40),'pág. 40–41'],
  ['Eje y bocina',pag(59),'pág. 59'],['Mantenimiento de rodamientos',pag(38),'pág. 38–39'],['Instalación y alineación del acople',pag(12),'pág. 12'],null];
// Documentación por fabricante y modelo: solo se asigna cuando la relación es explícita.
// Lo que no coincide queda como "Documentación pendiente"; nunca se asume otro fabricante.
// La relación explícita puede venir del modelo de la placa o del expediente (campo fab).
const fabDe=p=>expediente[p.tag]?.fab||[];
const esHid=p=>/HIDROMAC/i.test(p.marca||'')&&(/^2196\b/.test(String(p.modelo||'').trim())||fabDe(p).includes('hidromac'));
const esGoulds=p=>/GOULDS/i.test(p.marca||'')&&(/SH/i.test(p.modelo||'')||fabDe(p).includes('goulds'));
export function linksBomba(p){
  if(p.inactive)return null;
  if(esHid(p))return{alcance:'modelo',
    manual:{t:'Manual de instalación y mantenimiento Hidromac 2196 (112 pág.)',u:MAN},
    planos:{t:'Planos: corte, lista de partes y dimensiones (manual pág. 87–99)',u:pag(90)},
    extra:[{t:'Catálogo Hidromac 2196 (corte y curvas)',u:CAT_H},enlaces.hidromac[2]]};
  if(esGoulds(p))return{alcance:'familia',nota:'Documentación de la familia Goulds e-SH; comprobar grupo y variante del modelo instalado.',
    manual:{t:'Goulds e-SH · manuales en el sitio del fabricante (referencia de familia)',u:GOULDS.man},
    planos:{t:'Goulds e-SH · guía de partes y vistas del kit (PDF, referencia de familia)',u:GOULDS.guia},
    extra:[{t:'Brochure técnico Goulds e-SH',u:GOULDS.bro}]};
  return null;
}
export function linkPieza(p,i){
  if(p.inactive)return [];
  const out=[];
  if(esHid(p)){const h=HID_PIEZA[i];if(h)out.push({t:`Manual Hidromac 2196 · ${h[0]} (${h[2]})`,u:h[1]});out.push({t:'Catálogo Hidromac · corte y lista de partes',u:CAT_H});}
  else if(esGoulds(p)){out.push({t:'Goulds e-SH · guía de partes del kit (PDF, referencia de familia)',u:GOULDS.guia},{t:'Goulds e-SH · brochure técnico',u:GOULDS.bro});}
  const e=expediente[p.tag]||{};
  if(i===8&&(e.fab||[]).includes('rexnord'))out.unshift(enlaces.rexnord[0]);
  if(i===5)out.unshift(...(sealReference(p)?.links||[]));
  if(i===9){const fab=e.fab||[],marca=p.motor?.marca||'';
    if(fab.includes('usmotors')||/US\s*MOTORS|NIDEC/i.test(marca))out.unshift(...enlaces.usmotors);
    else if(fab.includes('weg')||/WEG/i.test(marca))out.unshift(...(p.motor?.catalogo==='00218XT3E145T'?[enlaces.weg[1],enlaces.weg[0]]:[enlaces.weg[0]]));}
  if(i===7&&e.rod)out.unshift(...e.rod.map(k=>enlaces.skf[k]).filter(Boolean));
  return out;
}
