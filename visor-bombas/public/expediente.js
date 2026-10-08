// Imágenes y documentación del fabricante para el "Expediente del equipo".
// Imágenes: extraídas de "Libro1 bomba2.xlsx" (hoja Bombas), asociadas por la fila en que están ancladas.
// Enlaces: páginas/PDF públicos de cada fabricante, comprobados al preparar esta versión.
// Regla de datos: lo que no está documentado se deja como "Por confirmar".

const SKF='https://www.skf.com/';
export const enlaces={
  hidromac:[
    {t:'Catálogo Hidromac · Serie 2196 ANSI B73.1M (PDF, vía distribuidor Bomeq)',u:'https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf',k:'catálogo'},
    {t:'Portafolio Hidromac · Bombas de proceso químico ANSI',u:'https://hidromac.com/portafolio/',k:'fabricante'},
    {t:'Solicitar planos / CAD a Hidromac (asesoría técnica)',u:'https://hidromac.com/contactanos/asesoria-tecnica-y-cotizaciones/',k:'CAD',nota:'Hidromac no publica CAD descargable; se solicita al fabricante (ventas@hidromac.com).'}
  ],
  weg:[
    {t:'Catálogo WEG · Producto estándar (datos eléctricos y mecánicos, PDF)',u:'https://static.weg.net/medias/downloadcenter/hd1/hcf/US100-Electrical-and-Mechanical-Data.pdf',k:'catálogo'},
    {t:'Catálogo técnico WEG W22 trifásico NEMA (PDF)',u:'https://static.weg.net/medias/downloadcenter/hf8/h29/WEG-w22-three-phase-electric-motor-50029265-brochure-english-web.pdf',k:'catálogo'}
  ],
  rexnord:[
    {t:'Rexnord · Elemento elástico ES2-R (acople Omega)',u:'https://www.rexnord.com/products/7300075',k:'catálogo',nota:'La ficha del fabricante no publica CAD descargable en esa página.'}
  ],
  goulds:[
    {t:'Goulds e-SH · Brochure técnico del fabricante (PDF, Xylem)',u:'https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf',k:'catálogo'},
    {t:'Goulds 15SH06K6 · Kit extremo líquido e-SH (ficha)',u:'https://www.pumpcatalog.com/goulds/pump-repair-parts/15sh06k6/',k:'distribuidor'},
    {t:'Goulds e-SH · Guía de referencia de kits (PDF)',u:'https://media.pumpcatalog.com/pump-catalog/documents/goulds-e-sh-pump-kit-reference-guide-peshkitrf-021422.pdf',k:'catálogo'}
  ],
  usmotors:[
    {t:'US Motors XJ7P1BM · Ficha de especificaciones (tercero)',u:'https://tractian.com/en/assets/xj7p1bm-hazardous-location-ac-motor-75hp-230460v-xj7p1bm@4e5104db-ef8a-5157-9c0c-63b6ff582bf0',k:'ficha'}
  ],
  skf:{
    '6205-2RS':{t:'SKF 6205-2RSH (equivalente al 6205-2RS) · ficha y descarga CAD',u:SKF+'group/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6205-2RSH'},
    '6204-2RS':{t:'SKF 6204-2RSH (equivalente al 6204-2RS) · ficha y descarga CAD',u:SKF+'us/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6204-2RSH'},
    '6308-2RS':{t:'SKF 6308-2RSH (equivalente al 6308-2RS) · ficha y descarga CAD',u:SKF+'au/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6308-2RSH'},
    '6207-2RS':{t:'SKF 6207-2RSH (equivalente al 6207-2RS) · ficha y descarga CAD',u:SKF+'products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6207-2RSH?failover=true'},
    '6309-2Z':{t:'SKF 6309-2Z · ficha y descarga CAD',u:SKF+'group/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6309-2Z'},
    '6206-2Z':{t:'SKF 6206 (base del 6206-2Z) · ficha y descarga CAD',u:SKF+'us/products/rolling-bearings/ball-bearings/deep-groove-ball-bearings/productid-6206'}
  }
};

const I=n=>`/expediente/${n}.jpg`;
const fila='Libro1 bomba2.xlsx · hoja Bombas';
// placas: placa(s) de la bomba · fotos: fotografías del equipo. "ref" = nota de asociación.
export const expediente={
  B22:{placas:[{src:I('B22-placa'),t:'Placa de la bomba',ref:`${fila}, fila 25`}],fotos:[{src:I('B22-bomba'),t:'Foto de la bomba (SIN USO)',ref:`${fila}, fila 25`}],fab:['hidromac'],
    nota:'Equipo marcado SIN USO en el Excel; la placa existe pero su texto no se transcribió: sin datos técnicos.'},
  B23:{placas:[{src:I('B23-placa'),t:'Placa de características',ref:`${fila}, fila 26`}],fotos:[{src:I('B23-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 26`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B24:{placas:[],fotos:[{src:I('B24-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 27`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS'],
    nota:'El Excel no trae foto de placa para B24; comparte datos con B25 (mismo tanque FW).'},
  B25:{placas:[{src:I('B25-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 28`,serie:'210771-3'}],fotos:[],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS'],
    nota:'La placa se lee "1X1.5-8 LF" y el Excel registra "1X1.5X8 STO": verificar en campo cuál es el tamaño correcto. El último dígito de la serie es poco legible.'},
  B30:{placas:[{src:I('B30-placa'),t:'Placa de características',ref:`${fila}, fila 33`}],fotos:[{src:I('B30-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 33`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS']},
  B31:{placas:[{src:I('B31-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 34`,serie:'210771-5'}],fotos:[{src:I('B31-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 34`},{src:I('B31-bomba2'),t:'Foto adicional (anclada en la misma fila 34; puede ser B32)',ref:`${fila}, fila 34`}],fab:['hidromac','weg','rexnord'],rod:['6205-2RS','6204-2RS']},
  B32:{placas:[{src:I('B32-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 35`,serie:'210771-2'}],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B33:{placas:[],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS'],
    nota:'El Excel de fotos no incluye imágenes de B33; los datos provienen de la tabla de inventario.'},
  B36:{placas:[{src:I('B36-placa'),t:'Placa de datos (Hidromac MOD 2196)',ref:`${fila}, fila 39`,serie:'210775-3'},{src:I('B36-placa2'),t:'Segunda placa 3X4 (filas 38–39, sin ID; serie ilegible)',ref:`${fila}, fila 38–39`}],fotos:[{src:I('B36-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 39`},{src:I('B36-bomba2'),t:'Foto adicional (filas 38–40, puede ser B34/B35)',ref:`${fila}, fila 38–40`}],fab:['hidromac','weg'],rod:['6308-2RS','6207-2RS']},
  B37:{placas:[],fotos:[],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS'],
    nota:'El Excel de fotos no trae imágenes en la fila de B37.'},
  B38:{placas:[{src:I('B38-placa'),t:'Placa de características',ref:`${fila}, fila 41`}],fotos:[{src:I('B38-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 41`}],fab:['hidromac','weg'],rod:['6205-2RS','6204-2RS']},
  B41:{placas:[{src:I('B41-placa'),t:'Placa de la bomba',ref:`${fila}, fila 44`}],fotos:[{src:I('B41-bomba'),t:'Foto de la bomba',ref:`${fila}, fila 44`}],fab:['goulds','usmotors'],rod:['6309-2Z','6206-2Z']}
};
// Servicios del Excel de inventario: "Equipo / Ubicación" es el tanque al que está conectada la bomba.
