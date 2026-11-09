# Expediente de bombas Vocatus

Datos transcritos de Bombas.xlsx, hoja Bombas. Las fichas enlazadas se refieren a familias o variantes de catálogo. La hoja de datos original de cada configuración instalada sigue por verificar. Los datos vacíos se omiten.

El proyecto contiene una numeración distinta en Libro1.xlsx. Este expediente usa exclusivamente los TAG de Bombas.xlsx.


## Cobertura CAD

| Estado | TAG | Total |
|---|---|---:|
| Dibujo de conjunto, incluidos candidatos por confirmar | B13, B17–B18, B20–B21, B39–B45, B59, B63–B70, B77–B80 | 25 |
| Interfaces de eje, soporte o conexión | B1–B12, B14, B19, B22–B38, B46–B47, B49–B54, B71–B73 | 42 |
| Referencia de rodamientos | B15–B16, B48, B55, B57, B61 | 6 |
| Sin dibujo DXF vinculado | B56, B58, B60, B62, B74–B76, B81–B83 | 10 |

Los 31 DXF son dibujos reconstruidos. Las fichas distinguen cotas de catálogo, geometría estimada y variantes candidatas. Las hojas de datos por unidad siguen pendientes de verificación.


## Búsqueda por modelo

La tabla agrupa **73 TAG en 15 referencias de trabajo**. Los códigos Durco 62391 y 62392 se agrupan para investigar la familia, con la identificación LF-82 confirmada por placa solo para B19. Dentro de una familia se separan curvas por tamaño, impulsor y velocidad y planos por brida y soporte cuando corresponda. La ficha, la curva y el CAD se investigan una vez por modelo y configuración. Cada TAG se coteja con su placa y medidas para vincular la documentación que le corresponde. Las fichas por TAG registran esas diferencias y los candidatos por foto.

| Referencia | TAG del inventario | Ficha técnica | Hoja de datos / curva | CAD |
|---|---|---|---|---|
| [Hidromac 2196](#modelo-1-de-15--hidromac-2196) | B1–B12, B14, B23–B38, B46–B47, B49–B50, B53–B54 | Catálogo y despiece | Curvas de catálogo por variante | Veintidós DXF de referencia, incluida vista explotada LF AA |
| Multisteel RSA 25/205 | B15–B16 | Folleto RSA | Pendiente por impulsor | DXF de rodamientos |
| Durco Mark 3, códigos 62391/62392 | B17–B21 | Manual y placa LF-82 en B19 | Selección LF-82 de referencia para B19 | Bridas y soporte de referencia para B19; otras placas apuntan a Titan |
| Titan 4196 | B13, B63–B68 | Catálogo y despiece | Mapas; curva por recorte pendiente | Conjuntos reconstruidos por tamaño |
| Goulds 15SH06K6 | B39–B43 (placa Hidromac candidata en B41) | Ficha de referencia | [Curva 15SH06](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=10) y [curva 02SH06](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=13) a 3.500 rpm; confirmar recorte | Comparación 15SH06/02SH06 candidata |
| Hidromac AZ 3 × 4 × 12A | B44–B45 | Catálogo | Curva de catálogo Ø305 mm a 1.750 rpm; selección SMCDV pendiente | Esquema y envolvente reconstruidos |
| Multisteel RA65/300 | B48, B55, B57 | Folleto RA/RT y corte RA, fig. 43 | Pendiente para Ø219, Ø259 y Ø260 mm | DXF de rodamientos |
| LL-124, Viking candidata | B51–B52 | Manual y despiece candidatos | TDS-124 de referencia | Interfaz de eje y plano dimensional candidatos |
| SB 15-5(M), marca por confirmar | B59 | Catálogos ABS DIN y STAIRS ANSI/NEMA candidatos | Curvas ABS y STAIRS candidatas; discrepancia de altura por cotejar | DXF DIN y DXF de interfaz ANSI candidatos |
| Multisteel RSA32/2025 (RSA 32/205 candidata) | B61 | Folleto RSA; código por cotejar | Selección oficial interactiva Ø210 mm, 3.500 rpm | DXF de rodamientos |
| Ebara AEVMSU5-9F0500T3S | B69–B70 | Ficha y despiece | Curva EVMSU5-9 | Conjunto reconstruido; original en e-Select por obtener |
| Grundfos CR15-6K-GJ-A-E-HQQE-NX2 | B71–B72 | Referencias CR15 | Curva -6 de bajo NPSH a 60 Hz; selección NX2 pendiente | Interfaz GJ |
| KSB Movitec VF 4/8 B | B73 | Libro técnico y despiece | Curva 4/8 de referencia a 60 Hz | Interfaz candidata de bridas y base |
| SB 20-6(M), marca por confirmar | B77–B80 | Referencias ABS y STAIRS | Curva 20-6 de referencia | Conjunto DIN e interfaz ANSI candidatos |
| PACO, modelo pendiente | B60 | Manual de identificación | Punto registrado por cotejar | Pendiente de identificar modelo |

**Conteo por modelo.** La tabla contiene 14 referencias de modelo o familia con código y una fila PACO con solo marca. Los otros 10 TAG sin código hidráulico identificado son B22, B56, B58, B62, B74–B76 y B81–B83. B22 tiene placa Hidromac candidata. El número definitivo de modelos depende de resolver esos TAG y las discrepancias de placa.


## Cruce histórico para equipos sin código hidráulico

La numeración de las fichas de Libro1.xlsx corresponde a ese inventario. Los cruces siguientes se verificaron por ubicación y descripción del equipo.

| TAG Bombas.xlsx | Ficha histórica Libro1.xlsx | Evidencia para la identificación |
|---|---|---|
| B22 · Tanque lavados de Aceite | [B22](../cuentas-vercel/00-Proyecto/equipos/B22.md) | Ficha histórica sin marca, modelo ni placa asociada. La atribución Hidromac queda como candidata del expediente actual. |
| B60 · Tanque Verde | [B58](../cuentas-vercel/00-Proyecto/equipos/B58.md) | Coinciden PACO, ubicación y datos hidráulicos. La ficha histórica figura sin placa asociada. |
| B74 · Búnker diario #1 | [B71](../cuentas-vercel/00-Proyecto/equipos/B71.md) | Coinciden ubicación y código Marathon del motor. Falta el código del cuerpo hidráulico. |
| B75 · Búnker | [B72](../cuentas-vercel/00-Proyecto/equipos/B72.md) | Coinciden ubicación y ficha de motor. Falta el código del cuerpo hidráulico. |
| B76 · Búnker diario #2 | [B73](../cuentas-vercel/00-Proyecto/equipos/B73.md) | Coinciden ubicación y código Marathon del motor. Falta el código del cuerpo hidráulico. |

Las fichas históricas B74–B77 corresponden a las bombas de condensado #1–#4, numeradas B77–B80 en Bombas.xlsx. La referencia SB 20-6(M) de esas cuatro fichas no identifica las bombas #5–#7, B81–B83.

**Lectura de fotos de calderas.** Las cuatro tomas se localizaron en el respaldo local de Supabase y sus objetos también figuran en la base original. En «Bomba 1 con motor y guarda roja», placa1 confirma **Titan 4196, serie 064311, ANSI A20 y diámetro máximo de 13 pulgadas**. El tamaño se lee como **1½ × 3–13**, con el sufijo y el diámetro instalado sin lectura fiable. Placa2 muestra un motor Marathon TerraMAX de 15 HP y 1.755 rpm, distinto de los motores registrados para B74–B76. En «Bomba central pequena con motor y guarda roja», placa1 muestra una etiqueta de código de barras deteriorada y placa2 una placa de motor desgastada. Todavía falta asociar la Titan a un TAG mediante posición o tubería de servicio. [Placa hidráulica Titan 064311](Documentos-bombas-Vocatus/Titan-4196-064311-placa-calderas.jpg) · [Catálogo Titan 4196](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf).

**Plano y curva de referencia Titan 4196 A20, serie 064311.** [DXF lateral de ejes, caras y plano de apoyo](Documentos-bombas-Vocatus/Titan-4196-A20-064311-referencia.dxf). El dibujo en milímetros representa cotas de catálogo y deja pendientes la geometría de la carcasa y el montaje instalado. La fila 1½ × 3–13 del catálogo Titan corresponde al grupo MT/LT y confirma succión de 3 pulgadas, descarga de 1½ pulgadas, cotas X/A/B/D/SP de 267/495/102/254/95 mm y peso de bomba sin motor de 111 kg. El catálogo incluye el mapa de selección nominal a 1.750 rpm, próximo a las 1.755 rpm de la placa del motor. La curva individual requiere el diámetro instalado y el CAD de la ejecución requiere confirmar MT o LT, patrón de bridas y bancada. [Plano dimensional Titan, pág. PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6) · [Mapa Titan, pág. PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9).

**Cotejo de montaje de la Titan A20.** La toma de posición muestra un conjunto azul con placa roja, succión axial desde una conexión baja de un tanque verde, descarga vertical y motor separado sobre bancada. Sirve para ubicar el equipo, aunque el TAG y la serie no se leen en esa toma. La foto etiquetada «bomba» del mismo grupo muestra una placa de motor muy desgastada y un acople de aspecto distinto. Por esa discrepancia, la asociación de las fotos del grupo a una sola unidad sigue pendiente. B29 comparte el tamaño candidato A20 y potencia de 15 HP, pero el inventario registra Hidromac y motor WEG a 1.770 rpm, mientras las placas del grupo indican Titan y Marathon a 1.755 rpm. Se conserva la serie 064311 sin asignación. [Foto de posición](Documentos-bombas-Vocatus/Titan-4196-A20-montaje-candidato.jpg).

## Índice por TAG

La columna CAD refleja el alcance del dibujo vinculado. La última columna distingue las referencias externas de una hoja de datos verificada por serie.

| TAG | Servicio | CAD disponible | Documentación hidráulica en la ficha |
|---|---|---|---|
| [B1](#b1--alimentación-mosto-fermentado-dusa) | Alimentación Mosto Fermentado DUSA | Interfaces de eje | Referencia disponible |
| [B2](#b2--alimentación-mosto-fermentado-dusa) | Alimentación Mosto Fermentado DUSA | Interfaces de eje | Referencia disponible |
| [B3](#b3--columna-aldehído-2) | Columna Aldehído 2 | Interfaces de eje | Referencia disponible |
| [B4](#b4--columna-rectificadora-2) | Columna Rectificadora 2 | Interfaces de eje | Referencia disponible |
| [B5](#b5--columna-aldehído-1) | Columna Aldehído 1 | Interfaces de eje | Referencia disponible |
| [B6](#b6--columna-aldehído-1) | Columna Aldehído 1 | Interfaces de eje | Referencia disponible |
| [B7](#b7--columna-rectificadora-1) | Columna Rectificadora 1 | Interfaces de eje | Referencia disponible |
| [B8](#b8--columna-rectificadora-1) | Columna Rectificadora 1 | Interfaces de eje | Referencia disponible |
| [B9](#b9--columna-rectificadora-batch) | Columna Rectificadora Batch | Interfaces de eje | Referencia disponible |
| [B10](#b10--columna-rectificadora-batch) | Columna Rectificadora Batch | Interfaces de eje | Referencia disponible |
| [B11](#b11--columna-vinaza) | Columna Vinaza | Interfaces de eje | Referencia disponible |
| [B12](#b12--columna-vinaza) | Columna Vinaza | Interfaces de eje | Referencia disponible |
| [B13](#b13--alambique---código-uq) | Alambique - Código UQ | Dibujo de conjunto | Referencia disponible |
| [B14](#b14--alambique---código-uq) | Alambique - Código UQ | Interfaces de eje | Referencia disponible |
| [B15](#b15--alimentación-mosto-fermentado-hindú) | Alimentación Mosto Fermentado Hindú | Referencia de rodamientos | Referencia disponible |
| [B16](#b16--alimentación-mosto-fermentado-hindú) | Alimentación Mosto Fermentado Hindú | Referencia de rodamientos | Referencia disponible |
| [B17](#b17--columna-rectificadora) | Columna Rectificadora | Dibujo de conjunto | Referencia disponible |
| [B18](#b18--columna-purificadora) | Columna Purificadora | Dibujo de conjunto | Referencia disponible |
| [B19](#b19--columna-mosto) | Columna Mosto | Interfaces de eje | Referencia disponible |
| [B20](#b20--tanque-condensados) | Tanque Condensados | Dibujo de conjunto | Referencia disponible |
| [B21](#b21--tanque-reflujos-rectificadora) | Tanque Reflujos Rectificadora | Dibujo de conjunto | Referencia disponible |
| [B22](#b22--tanque-lavados-de-aceite) | Tanque lavados de Aceite | Interfaces de eje | Referencia disponible |
| [B23](#b23--tanque-producción-uq) | Tanque Producción UQ | Interfaces de eje | Referencia disponible |
| [B24](#b24--tanque-producción-fw--rw) | Tanque producción FW & RW | Interfaces de eje | Referencia disponible |
| [B25](#b25--tanque-producción-fw--rw) | Tanque producción FW & RW | Interfaces de eje | Referencia disponible |
| [B26](#b26--tanque-lavados-de-aceite) | Tanque Lavados de aceite | Interfaces de eje | Referencia disponible |
| [B27](#b27--carga-batch) | Carga Batch | Interfaces de eje | Referencia disponible |
| [B28](#b28--carga-batch) | Carga Batch | Interfaces de eje | Referencia disponible |
| [B29](#b29--lw-hacia-tanque-millonario) | LW hacia Tanque Millonario | Interfaces de eje | Referencia disponible |
| [B30](#b30--tanque-lw1) | Tanque LW1 | Interfaces de eje | Referencia disponible |
| [B31](#b31--tanque-lw2) | Tanque LW2 | Bridas de referencia | Referencia disponible |
| [B32](#b32--cabezas--colas) | Cabezas & Colas | Bridas de referencia | Referencia disponible |
| [B33](#b33--cabezas--colas) | Cabezas & Colas | Bridas de referencia | Referencia disponible |
| [B34](#b34--despacho-dusa) | Despacho DUSA | Interfaces de eje | Referencia disponible |
| [B35](#b35--despacho-dusa) | Despacho DUSA | Interfaces de eje | Referencia disponible |
| [B36](#b36--almacén-ho--uq) | Almacén HO & UQ | Interfaces de eje | Referencia disponible |
| [B37](#b37--reproceso-dusa) | Reproceso DUSA | Bridas de referencia | Referencia disponible |
| [B38](#b38--tanque-producción-ho) | Tanque Producción HO | Bridas de referencia | Referencia disponible |
| [B39](#b39--tanque-producción-diaria-hindú) | Tanque Producción Diaria Hindú | Dibujo de conjunto | Referencia disponible |
| [B40](#b40--tanque-blender) | Tanque Blender | Dibujo de conjunto | Referencia disponible |
| [B41](#b41--tanque-reproceso--técnico) | Tanque Reproceso & Técnico | Dibujo de conjunto | Referencia disponible |
| [B42](#b42--tq-aguardiente) | TQ Aguardiente | Dibujo de conjunto | Referencia disponible |
| [B43](#b43--despacho-hindú) | Despacho Hindú | Dibujo de conjunto | Referencia disponible |
| [B44](#b44--agua-de-dilución) | Agua de dilución | Dibujo de conjunto | Referencia disponible |
| [B45](#b45--agua-de-dilución) | Agua de dilución | Dibujo de conjunto | Referencia disponible |
| [B46](#b46--pie-de-cubas) | Pie de Cubas | Interfaces de eje | Referencia disponible |
| [B47](#b47--pie-de-cubas) | Pie de Cubas | Interfaces de eje | Referencia disponible |
| [B48](#b48--pie-de-cubas-3) | Pie de Cubas 3 | Referencia de rodamientos | Referencia disponible |
| [B49](#b49--tanque-esterilizador) | Tanque Esterilizador | Interfaces de eje | Referencia disponible |
| [B50](#b50--tanque-esterilizador) | Tanque Esterilizador | Interfaces de eje | Referencia disponible |
| [B51](#b51--tanque-romana) | Tanque Romana | Interfaces de eje | Referencia disponible |
| [B52](#b52--tanque-romana) | Tanque Romana | Interfaces de eje | Referencia disponible |
| [B53](#b53--descarga-fermentadores) | Descarga Fermentadores | Interfaces de eje | Referencia disponible |
| [B54](#b54--descarga-fermentadores) | Descarga Fermentadores | Interfaces de eje | Referencia disponible |
| [B55](#b55--tanque-agua-dm-1) | Tanque agua DM #1 | Referencia de rodamientos | Referencia disponible |
| [B56](#b56--sof-water-) | sof water | Sin dibujo DXF | Pendiente de vincular |
| [B57](#b57--tanque-agua-dm-2) | Tanque agua DM #2 | Referencia de rodamientos | Referencia disponible |
| [B58](#b58--agua-ultrapura) | agua ultrapura | Sin dibujo DXF | Pendiente de vincular |
| [B59](#b59--tanque-pf) | Tanque PF | Dibujo de conjunto | Referencia disponible |
| [B60](#b60--tanque-verde-en-desuso---cip-destilería) | Tanque Verde (en desuso) - CIP Destilería | Sin dibujo DXF | Referencia disponible |
| [B61](#b61--alimentación-ósmosis-inversa) | Alimentación Ósmosis Inversa | Referencia de rodamientos | Referencia disponible |
| [B62](#b62--tanque-cip-fermentación) | Tanque CIP Fermentación | Sin dibujo DXF | Pendiente de vincular |
| [B63](#b63--torre-de-enfriamiento-1) | Torre de Enfriamiento #1 | Dibujo de conjunto | Referencia disponible |
| [B64](#b64--torre-de-enfriamiento-1) | Torre de Enfriamiento #1 | Dibujo de conjunto | Referencia disponible |
| [B65](#b65--torre-de-enfriamiento-1) | Torre de Enfriamiento #1 | Dibujo de conjunto | Referencia disponible |
| [B66](#b66--torre-de-enfriamiento-2) | Torre de Enfriamiento #2 | Dibujo de conjunto | Referencia disponible |
| [B67](#b67--torre-de-enfriamiento-2) | Torre de Enfriamiento #2 | Dibujo de conjunto | Referencia disponible |
| [B68](#b68--torre-de-enfriamiento-2) | Torre de Enfriamiento #2 | Dibujo de conjunto | Referencia disponible |
| [B69](#b69--caldera-2) | Caldera #2 | Dibujo de conjunto | Referencia disponible |
| [B70](#b70--caldera-2) | Caldera #2 | Dibujo de conjunto | Referencia disponible |
| [B71](#b71--caldera-3) | Caldera #3 | Interfaces de eje | Referencia disponible |
| [B72](#b72--caldera-3) | Caldera #3 | Interfaces de eje | Referencia disponible |
| [B73](#b73--atemperador) | Atemperador | Interfaces de eje | Referencia disponible |
| [B74](#b74--búnker-diario-1) | Búnker diario #1 | Sin dibujo DXF | Pendiente de vincular |
| [B75](#b75--búnker) | Búnker | Sin dibujo DXF | Pendiente de vincular |
| [B76](#b76--búnker-diario-2) | Búnker diario #2 | Sin dibujo DXF | Pendiente de vincular |
| [B77](#b77--bomba-1) | Bomba #1 | Dibujo de conjunto | Referencia disponible |
| [B78](#b78--bomba-2) | Bomba #2 | Dibujo de conjunto | Referencia disponible |
| [B79](#b79--bomba-3) | Bomba #3 | Dibujo de conjunto | Referencia disponible |
| [B80](#b80--bomba-4) | Bomba #4 | Dibujo de conjunto | Referencia disponible |
| [B81](#b81--bomba-5) | Bomba #5 | Sin dibujo DXF | Pendiente de vincular |
| [B82](#b82--bomba-6) | Bomba #6 | Sin dibujo DXF | Pendiente de vincular |
| [B83](#b83--bomba-7) | Bomba #7 | Sin dibujo DXF | Pendiente de vincular |

## Multisteel RA 65/300 · B48, B55 y B57

Datos de selección preliminar transcritos de Bombas.xlsx. Rotación de bomba registrada de 1.750 rpm para las tres unidades.

| TAG | Caudal (GPM) | Altura (m) | Impulsor instalado registrado (mm) | Rodamientos registrados, delantero / trasero | Acople registrado |
|---|---:|---:|---:|---|---|
| B48 | 220 | 25 | 260 | 6308-ZZ / 6207-ZZ | Sin dato |
| B55 | 110 | 20 | 219 | 6209-ZZ / 6209-ZZ | Wrapflex 30R |
| B57 | 220 | 25 | 259 | 6209-ZZ / 6209-ZZ | Wrapflex 30R |

El [folleto Multisteel RA/RT, pág. 2](Documentos-bombas-Vocatus/Multisteel-RA-RT-catalogo.pdf#page=2) muestra el conjunto en corte y documenta desmontaje trasero, placa de desgaste intercambiable y variantes de impulsor abierto o tubular de la familia. La publicación de dos páginas carece de curvas por tamaño, cotas de montaje y códigos de repuesto para RA 65/300. [Página oficial de la línea RA/RT](https://bombasmultisteel.com.br/es/linha-ra-rt/).

| Parte | Dato pendiente por unidad |
|---|---|
| Carcasa y conexiones | Diámetros nominales, clase y patrón de bridas, posición de ejes y cotas de anclaje |
| Impulsor | Confirmar variante, material, ancho, fijación al eje y curva correspondiente al diámetro instalado |
| Placa de desgaste | Código, material, espesor y holgura con el impulsor |
| Eje, soporte y rodamientos | Plano del eje, grupo de soporte y verificación de las referencias de rodamiento |
| Sello y acople | Tipo y materiales del sello, diámetro de cada cubo y separación entre ejes |

**Corte constructivo y repuestos RA.** La figura 43 del manual Multisteel, sección 9.3, muestra la configuración RA con la descarga en la línea central. La figura 44 corresponde a RT. La tabla 7 identifica los repuestos que deben cotejarse por O.S.B., entre ellos eje, camisa, anillos de desgaste, sello, juntas, rodamientos, retenes e impulsor. Para B48, B55 y B57 el corte orienta la identificación de piezas; los números de dibujo, materiales y cotas del tamaño 65/300 se deben verificar por orden de servicio. [Manual Multisteel rev. 06, pp. 25–26](https://pt.scribd.com/document/1075274168/Manual-Linha-Rf-Rv-Rsv-Rh-Ra-Rt-Rev06-09-08-24-2).

**Acople de B55 y B57.** El catálogo Falk Wrapflex indica para el tamaño 30R un par de catálogo de 520 N·m, velocidad máxima de 4.500 rpm y diámetro interior máximo de cubo de 65 mm. Son límites de catálogo. Para seleccionar el plano y los repuestos del acople instalado, identificar la ejecución y medir el diámetro y chavetero de cada cubo y la separación entre puntas de eje. [Catálogo Falk Wrapflex 491-110M](https://www.rexnord.com/ContentItems/TechLibrary/Documents/491-110M_Falk-Wrapflex-Elastomeric-Couplings-Type).

**Identificación para recuperar las hojas de fábrica.** La fig. 1 del manual ubica la placa de la bomba sobre el soporte de rodamientos. El campo O.S.B. es el número de serie de la orden de servicio y el campo ROTOR registra el diámetro original de fábrica. Cotejar ambos campos por TAG con el diámetro del inventario antes de asignar la curva.

| TAG | Punto de inventario a 1.750 rpm (asumiendo galón estadounidense) | Selección a solicitar |
|---|---|---|
| B48 | 49,97 m³/h a 25 m | Curva para Ø260 mm y plano con soporte 6308-ZZ / 6207-ZZ por cotejar |
| B55 | 24,98 m³/h a 20 m | Curva para Ø219 mm y plano con soporte 6209-ZZ / 6209-ZZ por cotejar |
| B57 | 49,97 m³/h a 25 m | Curva para Ø259 mm y plano con soporte 6209-ZZ / 6209-ZZ por cotejar |

Para cada O.S.B., solicitar a Multisteel la ficha original, la curva con potencia, eficiencia y NPSHr para el recorte instalado, el plano dimensional DWG/DXF o STEP, y el despiece con códigos y materiales. [Manual Multisteel rev. 06, fig. 1](https://pt.scribd.com/document/1075274168/Manual-Linha-Rf-Rv-Rsv-Rh-Ra-Rt-Rev06-09-08-24-2) · [Biblioteca oficial Multisteel](https://bombasmultisteel.com.br/downloads/).

**Resultado del selector para B48, B55 y B57.** El menú ofrece RAO y carece de una opción RA literal. Con RAO como filtro exploratorio a 60 Hz y 1.750 rpm, se consultaron 49,97 m³/h a 25 m y 24,98 m³/h a 20 m. En ambos casos el selector remitió al departamento de ventas sin entregar modelo, curva ni plano. La correspondencia entre RA y RAO queda por verificar. Para recuperar la documentación de la RA65/300, la vía indicada es la consulta por O.S.B. [Selector Multisteel](https://app.multisteelpumpselector.online/) · [Contacto oficial](https://bombasmultisteel.com.br/downloads/).

**Cotas nominales para el CAD del soporte.** [DXF de referencia de rodamientos](Documentos-bombas-Vocatus/Multisteel-RA65-300-rodamientos-referencia.dxf). Según las referencias registradas, B48 tiene un rodamiento delantero 6308 de Ø40 × Ø90 × 23 mm y uno trasero 6207 de Ø35 × Ø72 × 17 mm. B55 y B57 registran dos 6209 por bomba, de Ø45 × Ø85 × 19 mm. Las medidas son diámetro interior × diámetro exterior × ancho. Sirven para cotejar cada asiento del eje y del alojamiento. Las tolerancias, hombros, radios y separación axial quedan pendientes. La tabla 8 de intercambiabilidad del manual Multisteel está identificada para bombas RF. Para la RA65/300, el plano del soporte se debe cotejar por O.S.B. [Catálogo SKF de dimensiones nominales](https://cdn.skfmediahub.skf.com/api/public/0901d19680416a2b/pdf_preview_medium/0901d19680416a2b_pdf_preview_medium.pdf) · [Manual Multisteel, tabla 8](https://pt.scribd.com/document/1075274168/Manual-Linha-Rf-Rv-Rsv-Rh-Ra-Rt-Rev06-09-08-24-2).

La diferencia de rodamientos entre B48 y B55/B57 impide asignar un soporte común con los datos actuales. Pendiente recuperar por serie la hoja de selección, la curva Q–H y el plano dimensional con despiece. Para reconstruir el CAD, faltan cotas de carcasa, bridas, base y soporte.


## Modelo 1 de 15 · Hidromac 2196

**Comprobación de archivos CAD.** Los 19 DXF de la 2196 se abrieron y auditaron con ezdxf. Se normalizó el identificador de la tabla de capas en diez archivos y se comprobó al reabrirlos que las unidades, entidades y atributos geométricos del espacio modelo coinciden con los originales. La auditoría final de los 19 archivos no detectó errores ni reparaciones. El DXF 2D de bridas LF AA clase 150 está en pulgadas; los otros 18 archivos están en milímetros. La comprobación valida la estructura del archivo. Para el montaje real siguen aplicando los estados de verificación de la tabla por variante.

La [ficha del fabricante](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) cubre la familia. La página 7 contiene corte y materiales de referencia, la 8 detalla los soportes y la 10 reúne las cotas de montaje. El [despiece de referencia](#hidromac-2196--despiece-de-referencia) enlaza las posiciones del manual con los componentes. Los números de pedido y los materiales instalados se confirman por configuración.

| Configuración de trabajo | TAG de inventario | Curva disponible | CAD disponible y dato para cerrarlo |
|---|---|---|---|
| AA-STO estándar, 1 × 1½–8 | B3–B10, B14, B24–B25 | Sección VIII, pág. impresa 4. Recortes Ø174, Ø178 y Ø188 mm para cotejo | Cotas de montaje e interfaz STO. Falta patrón de bridas y anclaje |
| AB-STO estándar, 1½ × 3–8 | B1–B2, B46–B47 | Pág. 5. Ø142 mm a 3.500 rpm y Ø205 mm a 1.750 rpm para cotejo | Cotas de montaje e interfaz STO. Falta plano de conjunto |
| A60-MTO, 2 × 3–8 | B11–B12, B49–B50 | Pág. 8. Línea Ø178 mm a 1.750 rpm. Hay dos alturas registradas | Cotas de montaje e interfaz MTO. Falta confirmar ejecución y plano por serie |
| A70-MTO, 3 × 4–8G | B27–B28, B34–B36 | Pág. 10. Ø200 mm entre Ø191 y Ø205 mm a 1.750 rpm | Cotas de montaje e interfaz MTO. Falta validar bridas, anclaje y bancada |
| A70-MTO, 3 × 4–7 | B53–B54 | Pág. 7. Línea Ø166 mm a 1.750 rpm. Cotejar el máximo registrado | Cotas de montaje e interfaz MTO. Falta validar el conjunto de esta ejecución |
| AA-LF, 1 × 1½–8 | B23, B30–B33, B37–B38 | Pág. 40. Candidata AA-STO a 1.750 rpm con recortes Ø175 y Ø198 mm | Patrón de bridas 150 RF de referencia. Confirmar clase, soporte y plano de conjunto |
| AA-LF STO candidata, 1 × 1½–8 | B26 | Pág. 40. Ø200 mm entre Ø192 y Ø205 mm a 1.750 rpm | Interfaz y bridas candidatas. Falta confirmar atribución de la placa 220638-2 y clase de brida |
| A20 candidata, 1½ × 3–13 | B29 | Pág. 18. Ø290 mm entre Ø280 y Ø305 mm a 1.750 rpm | Catálogo dimensional A20 LTO disponible. Resolver discrepancia con MTO de inventario |

Estas ocho filas agrupan los **35 TAG registrados como Hidromac 2196**. B22 y B41 quedan como atribuciones fotográficas candidatas fuera de ese conteo. Las páginas indicadas corresponden a la [sección VIII del catálogo histórico Hidromac–Malmepi](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf). Las curvas son de catálogo y las hojas de selección de fábrica siguen pendientes.

- [DXF de cotas de montaje de cinco variantes estándar](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-cotas-montaje.dxf)
- [DXF 3D de la envolvente exterior A70-MTO 3 × 4–8G](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-8G-envolvente-exterior.dxf)
- [DXF 3D de la envolvente exterior A60-MTO 2 × 3–8](Documentos-bombas-Vocatus/Hidromac-2196-A60-MTO-8-envolvente-exterior.dxf)
- [DXF 3D con vista explotada A60-MTO 2 × 3–8](Documentos-bombas-Vocatus/Hidromac-2196-A60-MTO-8-despiece-3D.dxf)
- [DXF 3D de la envolvente exterior AA-STO estándar 1 × 1½–8](Documentos-bombas-Vocatus/Hidromac-2196-AA-STO-8-envolvente-exterior.dxf)
- [DXF 3D de montaje AB-STO 1½ × 3–8](Documentos-bombas-Vocatus/Hidromac-2196-AB-STO-8-montaje-3D-referencia.dxf)
- [DXF 3D de despiece AB-STO, recortes Ø142 y Ø205 mm](Documentos-bombas-Vocatus/Hidromac-2196-AB-STO-8-despiece-3D.dxf)
- [DXF 3D de montaje A20-LTO 1½ × 3–13, candidato para B29](Documentos-bombas-Vocatus/Hidromac-2196-A20-LTO-montaje-3D-referencia.dxf)
- [DXF 3D con vista explotada AA-STO estándar 1 × 1½–8, impulsor Ø178 mm](Documentos-bombas-Vocatus/Hidromac-2196-AA-STO-8-despiece-3D.dxf)
- [DXF 3D con vista explotada A70-MTO 3 × 4–8G](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-8G-despiece-3D.dxf)
- [DXF 3D con vista explotada A70-MTO 3 × 4–7](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-7-despiece-3D.dxf)
- [DXF 3D de interfaces de montaje, clases 150 y 300 candidatas](Documentos-bombas-Vocatus/Hidromac-2196-interfaces-montaje-3D.dxf)
- [DXF de interfaces de soporte STO y MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf)
- [DXF de rodamientos STO y MTO](Documentos-bombas-Vocatus/Hidromac-2196-rodamientos-STO-MTO-referencia.dxf)
- [DXF 3D de envolventes de rodamientos STO y MTO](Documentos-bombas-Vocatus/Hidromac-2196-rodamientos-STO-MTO-3D.dxf)
- [DXF de interfaces de eje, camisa y sello STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-eje-camisa-sello-referencia.dxf)
- [DXF de diámetros de recorte del impulsor, posición 101](Documentos-bombas-Vocatus/Hidromac-2196-impulsores-recortes-referencia.dxf)
- [DXF de asientos de rodamientos STO y MTO con tolerancias](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-asientos-referencia.dxf)
- [DXF de patrones de bridas LF AA clase 150 RF](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf)
- [DXF 3D de interfaces LF AA, clases 150 y 300 candidatas](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-montaje-3D-referencia.dxf)
- [DXF 3D de despiece parcial LF AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-despiece-3D.dxf)
- [DXF comparativo de perforaciones clase 150 y 300, NPS 1, 1½, 2, 3 y 4](Documentos-bombas-Vocatus/Hidromac-2196-bridas-150-300-candidatas.dxf)

**Bridas de las variantes estándar.** El manual histórico describe cara plana como estándar para la 2196 y ofrece cara resaltada clase 150 y ambas caras en clase 300. El catálogo resumido muestra cara resaltada. El DXF comparativo contiene diez patrones candidatos en milímetros con diámetro exterior y agujeros. Omite el perfil de cara, el paso interno y el espesor. Por ejemplo, para NPS 3 el círculo de pernos pasa de 152,4 mm con cuatro agujeros en clase 150 a 168,275 mm con ocho en clase 300. Cotejar marcado, patrón y tipo de cara por variante antes de incorporarlos al conjunto. [Manual Hidromac, descripción de carcasa](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html) · [Catálogo Hidromac](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Tabla de perforación clase 150](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-150/) · [Tabla de perforación clase 300](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-300/).

### Hidromac 2196 · Correspondencia con el visor de planta

El visor conserva las fotos antiguas por ubicación. En la configuración de `cuentas-vercel`, el nombre de un archivo en `public/expediente` puede llevar el identificador anterior del lugar. Para cruzar esas imágenes con el inventario, consultar el campo `id` de la ubicación y el `tag` asignado. El cruce es de visualización y requiere corroboración física para asignar una placa a una bomba.

| Ubicación anterior en el visor | TAG asignado en esa configuración |
|---|---|
| tag:B22 | B32 |
| tag:B24 | B26 |
| tag:B30 | B34 |
| tag:B31 | B35 |
| tag:B32 | B36 |
| tag:B36 | B38 |
| tag:B38 | B23 |
| tag:B41 | B24 |

Por ejemplo, la placa archivada como B22 conserva su coincidencia hidráulica candidata con B26, pero el visor reasigna ese lugar a B32. De igual forma, las placas archivadas como B36 requieren cotejo antes de atribuirlas al B36 actual o al lugar hoy rotulado B38. El archivo `bombas-campo.glb` contiene mallas de escena derivadas del FBX general, con nombres por ubicación. Sus metadatos no acreditan un plano dimensional de fábrica ni una serie específica para la 2196. [Asignación del visor](../cuentas-vercel/visor-bombas/public/modelos/asignacion-bombas.json) · [Procedencia del GLB y reglas de fotos](../cuentas-vercel/visor-bombas/BOMBAS-Y-FOTOS.md).

### Hidromac 2196 · Datos de servicio para cotejar la selección

La tabla reúne las 15 combinaciones distintas de caudal, altura, velocidad y diámetros que figuran en el inventario para este modelo. Las filas agrupan puntos idénticos registrados y sirven para cruzar la curva de cada configuración con su servicio. El caudal en m³/h se calculó suponiendo galón estadounidense. Los demás valores proceden del inventario.

| TAG de referencia | Q (US GPM) | Q (m³/h) | H (m) | rpm | Ø impulsor instalado / máximo registrado (mm) |
|---|---:|---:|---:|---:|---:|
| B1–B2 | 130 | 29,53 | 33,5 | 3500 | 142 / 205 |
| B3, B14 | 50 | 11,36 | 15,2 | 1750 | 188 / 205 |
| B4, B9–B10 | 35 | 7,95 | 15,2 | 1750 | 178 / 205 |
| B5–B6 | 40 | 9,08 | 15,2 | 1750 | 178 / 205 |
| B7–B8 | 30 | 6,81 | 15,2 | 1750 | 178 / 205 |
| B11–B12 | 100 | 22,71 | 13,7 | 1750 | 178 / 215 |
| B23, B30–B33 | 8 | 1,82 | 21,3 | 1750 | 198 / 205 |
| B24–B25 | 60 | 13,63 | 12,2 | 1750 | 174 / 205 |
| B26 | 3 | 0,68 | 21 | 1750 | 200 / 205 |
| B27–B28, B34–B36 | 200 | 45,42 | 15,2 | 1750 | 200 / 215 |
| B29 | 200 | 45,42 | 21,3 | 1750 | 290 / 330 |
| B37–B38 | 8 | 1,82 | 15,24 | 1750 | 175 / 205 |
| B46–B47 | 100 | 22,71 | 18,3 | 1750 | 205 / 205 |
| B49–B50 | 100 | 22,71 | 12,1 | 1750 | 178 / 211 |
| B53–B54 | 200 | 45,42 | 12,2 | 1750 | 166 / 205 |

B11–B12 y B49–B50 comparten el tamaño A60-MTO, caudal, velocidad y recorte registrados, pero difieren en altura y diámetro máximo. Conservar ambos puntos al cotejar la selección. En el grupo AA-LF de 8 GPM, mantener separados los recortes Ø175 y Ø198 mm. Para emitir una selección definitiva faltan la curva aplicable al recorte, la verificación del punto sobre la gráfica y los datos de fluido cuando afecten la potencia o el NPSH. Esta tabla registra las condiciones declaradas de servicio.

## Hidromac 2196 LF · 1 × 1½–8

**Vista explotada parcial LF AA.** El [DXF LF](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-despiece-3D.dxf) separa en capas los contornos de Ø175, Ø198 y Ø200 mm. El último es candidato para B26. Incluye caras de brida clase 150 sobre cotas comparativas Summit, rodamientos nominales STO como candidatos y llamadas para carcasa, junta, cámara, adaptador y soporte. Se omitieron los contornos AA estándar porque falta verificar el perfil de esas piezas en la LF. Las separaciones son simbólicas. Al reabrir el archivo se verificaron los tres diámetros, diez círculos de brida y unidades en milímetros.

**Piezas que se deben cotejar en el corte LF.** La lámina de intercambiabilidad del manual separa carcasa, impulsor, cámara, adaptador y conjunto de eje y soporte. El impulsor LF se describe con álabes radiales y orificios de compensación. En el CAD, el diámetro de recorte se puede tomar del inventario como dato de referencia, pero la geometría de estos orificios requiere medir la pieza. [Manual Hidromac, págs. impresas 7–8, 89 y 94–95](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

| Posición de referencia | Pieza LF | Geometría y dato pendiente |
|---|---|---|
| 100 | Carcasa LF AA | Succión NPS 1½ y descarga NPS 1. Existe DXF de bridas candidatas. Medir perfil de voluta, cara de unión y anclajes |
| 101 | Impulsor LF abierto y roscado | Recortes de inventario Ø175 y Ø198 mm, y Ø200 mm como candidato para B26. Medir espesor y ancho de álabes, número, diámetro y círculo de los orificios de compensación, cubo y rosca |
| 412A | Junta del impulsor | Confirmar referencia, material y sección para el impulsor LF instalado |
| 184 | Cámara o tapa de prensaestopas | El manual ofrece prensaestopas, Big Bore y TaperBore Plus. Identificar la variante antes de aplicar el DXF de sellado |
| 108 / 122 / 228 | Adaptador, eje y soporte | Confirmar grupo de soporte, piloto y unión. Cotejar los repuestos con el corte LF y el código por serie |

El manual histórico Hidromac–Malmepi identifica el tamaño 1 × 1½–8 como **AA** en la lámina de intercambiabilidad del modelo LF 2196 (página impresa 95). La lámina distingue carcasa, impulsor, cámara de sello, adaptador y conjunto de eje y rodamientos. Usar la identificación AA para solicitar el despiece y la selección por serie. [Manual histórico Hidromac–Malmepi](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

| TAG | Variante según inventario | Ø impulsor registrado | Evidencia para pedir la hoja de datos |
|---|---|---:|---|
| B31 | 1 × 1½–8 LF | 198 mm | Placa LF, serie 210771-5 |
| B32 | 1 × 1½–8 LF | 198 mm | Placa LF, serie 210771-2 |
| B33 | 1 × 1½–8 LF | 198 mm | Pendiente placa y serie |
| B37 | 1 × 1½–8 LF | 175 mm | Pendiente placa y serie |
| B38 | 1 × 1½–8 LF | 175 mm | Foto Hidromac. Prefijo de serie posiblemente 210771; sufijo pendiente |

**Referencia dimensional de otra marca.** Summit publica para su 2196LF 1 × 1½–8 STO succión 1½″, descarga 1″ y cotas X/A/B/D de 6½/13½/4/5¼ pulgadas (165,1/342,9/101,6/133,35 mm). Estas cotas sirven para cotejar en campo las Hidromac LF, con prioridad en las series confirmadas de B31 y B32. La coincidencia de nomenclatura y tamaño nominal deja por verificar dimensiones de montaje, patrón de base y eje antes de reutilizar un plano. [Catálogo dimensional Summit 2196LF](https://summitpump.com/getmedia/f9aa4586-732f-4f40-b119-4936030f97f3/2196LF_Brochure.pdf) · [Manual Summit, figura 10-3](https://summitpump.com/getmedia/27812afd-28ff-4682-a034-e58488e03e5e/2196-Manual.pdf).

**Bridas de la variante LF AA.** El manual Hidromac–Malmepi indica descarga superior y bridas ANSI clase 150 de cara resaltada como estándar para el tamaño 8, con clase 300 opcional. El impulsor abierto de álabes radiales va roscado al eje; la figura 47 identifica su junta 412A. El [DXF de patrones clase 150](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf) y el [DXF 3D de interfaces clase 150/300](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-montaje-3D-referencia.dxf) separan la succión de 1½″ y la descarga de 1″. El 3D pone las caras sobre las cotas comparativas Summit y distingue esas cotas de las perforaciones candidatas por capa. Aplicable como plantilla de cotejo a B31–B33 y B37–B38. La clase, orientación, distancia entre caras y soporte instalados siguen por comprobar. [Manual histórico Hidromac](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf) · [Tabla dimensional clase 150](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-150/) · [Tabla dimensional clase 300](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-300/).

**Interfaz STO para cotejo de la variante LF.** La placa archivada como B22 parece mostrar 2196 de tamaño 1 × 1½–8 LF con sufijo STO. Esa lectura, junto con el tamaño LF confirmado en B31 y B32, permite usar la [vista STO de Hidromac](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf) como plantilla de medición para esas dos unidades. Verificar eje de acople Ø22 mm, proyección de 156 mm y grupo de soporte antes de vincular el DXF a la instalación. El manual describe LF como hidráulica de impulsor abierto para bajo caudal y alta carga, y lista varios grupos de soporte en la familia. [Manual Hidromac–Malmepi, descripción e intercambiabilidad LF](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf) · [Catálogo de soportes, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8).

**Curva de fábrica LF AA-STO.** El catálogo histórico Hidromac–Malmepi, sección VIII, página impresa 40, identifica expresamente la línea ANSI LF 2196 de 1 × 1½–8 AA-STO. El gráfico inferior a 1.750 rpm publica curvas para Ø205, Ø192, Ø179, Ø166, Ø153, Ø141, Ø128 y Ø115 mm, con líneas de potencia, eficiencia y NPSH. Para B26, si se confirma la placa LF, Ø200 mm queda entre Ø192 y Ø205 mm y el punto de 3 GPM y 21 m queda por cotejar en el gráfico. Para B31–B33 y B37–B38, usar el gráfico LF si coincide la configuración, con el diámetro de cada unidad. [Curvas Hidromac LF, sección VIII, pág. impresa 40](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf). **Copia alternativa.** El enlace anterior devolvió HTTP 410 al abrir el archivo directo. La copia del manual Hidromac 2 de 2 conserva la sección VIII, página impresa 40. Buscar «Linea Proceso ANSI LF» y el tamaño 1x1½-8 AA-STO. La gráfica inferior es la de 1.750 rpm. La transcripción permite verificar los rótulos de diámetro, pero para leer las alturas se requiere ver el gráfico. [Copia del manual Hidromac 2 de 2](https://es.scribd.com/document/907766915/Catalogo-Hidromac-2-de-2).

| TAG | Punto y recorte de inventario a 1.750 rpm | Líneas Q–H de catálogo que acotan el recorte | Evidencia de placa |
|---|---|---|---|
| B31 | 8 GPM · 21,3 m · Ø198 mm | Ø192 y Ø205 mm | LF, serie 210771-5 y lubricación OIL visibles |
| B32 | 8 GPM · 21,3 m · Ø198 mm | Ø192 y Ø205 mm | LF, serie 210771-2 y lubricación OIL visibles |
| B33 | 8 GPM · 21,3 m · Ø198 mm | Ø192 y Ø205 mm | LF según inventario |
| B37 | 8 GPM · 15,24 m · Ø175 mm | Ø166 y Ø179 mm | LF según inventario |
| B38 | 8 GPM · 15,24 m · Ø175 mm | Ø166 y Ø179 mm | LF probable por foto, serie incompleta |

Las placas legibles de B31 y B32 identifican tamaño y serie, pero el Ø198 mm procede del inventario. Los intervalos de la tabla acotan el diámetro, no verifican la altura en el punto de trabajo. La asociación de B23 y B30 con la variante LF requiere conciliar inventario y fotos. Quedan pendientes las hojas de selección y los planos dimensionales por serie, con grupo de soporte, posición de boquillas y patrón de anclaje.

**Dos series LF adicionales en fotos de campo.** Las placas de soporte **210771-1** y **210771-3** confirman Hidromac 2196, tamaño 1 × 1½–8 LF y lubricación por aceite. Ambas series pueden usarse para buscar la selección y el plano originales. Las fotos no muestran el diámetro recortado ni el punto hidráulico, por lo que falta vincularlas a un TAG mediante la placa de carcasa o la posición de la bomba. Mantener separadas las selecciones candidatas de Ø198 mm y Ø175 mm hasta resolver esa asociación. [Placa 210771-1](../visor-bombas-el-viejo/visor-bombas/public/fotos/20261007_110916.jpg) · [Placa 210771-3](../visor-bombas-el-viejo/visor-bombas/public/fotos/20261007_111538.jpg).


## Multisteel RSA · B15, B16 y B61

| TAG | Código de inventario | Caudal | Altura | Giro de bomba | Ø impulsor |
|---|---|---:|---:|---:|---:|
| B15 y B16 | RSA 25/205 | 30,8 GPM | 65 m | 3.500 rpm | 195 mm |
| B61 | RSA32/2025 | 70 GPM | 88 m | 3.500 rpm | 210 mm |

Multisteel describe la familia RSA con impulsor semiabierto y álabes posteriores, descarga lateral, placa de desgaste reemplazable y desmontaje trasero. El catálogo ofrece diferentes materiales de fundición y acero inoxidable; los materiales por pieza de las tres bombas quedan por verificar. [Ficha oficial RSA](https://bombasmultisteel.com.br/linha-rsa/) · [Folleto RSA archivado](Documentos-bombas-Vocatus/Multisteel-RSA-catalogo.pdf).

B61 conserva la grafía **RSA32/2025** del inventario. El folleto de familia no confirma ese código. Cotejar la placa antes de normalizar la referencia o asignar la curva. El inventario de B61 indica rodamientos 6309-ZZ-C3 y 6209-ZZ-C3. La ficha de familia menciona rodamientos NU; se requiere el despiece por serie para resolver la configuración de soporte.

**Corte constructivo RSA.** El folleto muestra succión axial, voluta, impulsor semiabierto, cámara de sello, eje y soporte desmontable. La ilustración identificada como RSA 400/440 corresponde a un diseño especial de descarga lateral. El corte de familia carece de escala y no identifica las dimensiones ni los repuestos de los tamaños 25/205 y 32/205. [Corte Multisteel RSA, pág. PDF 2](Documentos-bombas-Vocatus/Multisteel-RSA-catalogo.pdf#page=2).

| Parte | B15 y B16 · RSA 25/205 | B61 · RSA 32/205 candidata |
|---|---|---|
| Impulsor | Ø195 mm de inventario | Ø210 mm de inventario, coincide con la selección preliminar |
| Sello | Inventario indica doble sello y tamaño de 1⅜ pulgadas. Verificar disposición, caras y elastómeros. | Tipo, tamaño y materiales pendientes |
| Soporte | Campo delantero indica NU 306 y 3306, y el trasero 3306. Cotejar cantidad y posición antes de reconstruir. | Registra 6309-ZZ-C3 delantero y 6209-ZZ-C3 trasero. Confirmar si corresponden al soporte de bomba o al motor. |
| Voluta, placa de desgaste y eje | Faltan dibujo, dimensiones y materiales por O.S.B. | Faltan dibujo, dimensiones y materiales por O.S.B. |


**DXF de referencia de rodamientos RSA.** Las cotas nominales (interior × exterior × ancho) son NU 306: 30 × 72 × 19 mm, 3306 A de referencia: 30 × 72 × 30,2 mm, 6309: 45 × 100 × 25 mm y 6209: 45 × 85 × 19 mm. NU 306 y 3306 A comparten diámetros, con 11,2 mm de diferencia de ancho. La geometría del archivo permite cotejar cada pieza por separado. La posición, el sufijo instalado y las tolerancias de los asientos quedan por verificar. [DXF de rodamientos](Documentos-bombas-Vocatus/Multisteel-RSA-rodamientos-referencia.dxf) · [Catálogo SKF NU 306, 6309 y 6209](https://cdn.skfmediahub.skf.com/api/public/0901d19680416a2b/pdf_preview_medium/0901d19680416a2b_pdf_preview_medium.pdf) · [Catálogo SKF 3306 A](https://www.skf.com/binaries/pub12/Images/0901d196807026e8-100-700_SKF_bearings_and_mounted_products_2018_tcm_12-314117.pdf).

Por cada serie faltan la hoja de selección con la curva del diámetro instalado, el plano de bridas y anclajes y el despiece con código y material de carcasa, impulsor, placa de desgaste, eje, sello y soporte.


**Selector oficial Multisteel.** La página de la línea RSA enlaza a un selector que prepara una hoja preliminar con curva, potencia, eficiencia, NPSHr y plano dimensional de bomba, base y motor cuando hay una selección compatible. Para B15/B16 usar como punto de partida 7,00 m³/h, 65 m y 3.500 rpm y cotejar el resultado con RSA 25/205 y Ø195 mm. Para B61, 15,90 m³/h, 88 m y 3.500 rpm, con Ø210 mm y código RSA32/2025 por confirmar. Las conversiones suponen galón estadounidense. Para RA65/300, usar los tres puntos y recortes de su tabla. Una selección nueva queda como referencia hasta comprobar modelo, diámetro y ejecución con el O.S.B. de la unidad instalada. [Selector oficial de curvas y hojas de datos](https://app.multisteelpumpselector.online/).

**Resultado del selector para B15/B16.** A 7,00 m³/h y 65 m, con los filtros RSA, 60 Hz y 3.500 rpm y las propiedades de fluido por defecto (20 °C, 1,0 kg/dm³ y 1,0 cSt), el selector devolvió RSA 25/205 con Ø187 mm, eficiencia 39,72 %, potencia 4,46 CV y NPSHr 2,42 m. También devolvió RSA 25/205.1 con Ø186 mm, eficiencia 25,03 %, potencia 6,93 CV y NPSHr 1,30 m. Ambos recortes calculados difieren de Ø195 mm del inventario. La ficha interactiva mostró curvas, pero la exportación PDF no produjo un archivo verificable. Quedan pendientes la curva a Ø195 mm y el plano del conjunto instalado. [Selector Multisteel](https://app.multisteelpumpselector.online/).

**Resultado del selector para B61.** A 15,90 m³/h, 88 m y 3.500 rpm (60 Hz), con propiedades por defecto de 20 °C, 1,0 kg/dm³ y 1,0 cSt, el selector devuelve RSA 32/205 con Ø210 mm, 43,02 % de eficiencia, 12,09 CV, NPSHr de 2,05 m y paso de sólidos de 6 mm. La coincidencia del recorte con el inventario y la similitud del código apuntan a RSA 32/205 como candidata. También aparece RSA 40/205 con Ø210 mm para el mismo punto, por lo que la placa u O.S.B. sigue siendo necesaria para identificar la unidad. La curva está disponible en la ficha interactiva. Quedan por obtener el PDF y el plano dimensional de la ejecución instalada. [Selector Multisteel](https://app.multisteelpumpselector.online/).

**Identificación Multisteel para recuperar planos.** El manual del fabricante indica que la placa técnica está en la parte superior del soporte y que la **O.S.B.** identifica la orden de servicio de la bomba. Con ese número el fabricante puede localizar materiales y números de dibujo. La tabla de intercambiabilidad que menciona 25/205 y 32/205 está rotulada para la línea RF. Los números de piezas de esa tabla no se asignan a las RSA del inventario. Para B15, B16 y B61, registrar O.S.B., tipo y diámetro del impulsor de cada placa para cotejar las variantes. [Manual Multisteel, revisión 06, secciones 1, 10 y 11](https://pt.scribd.com/document/1075274168/Manual-Linha-Rf-Rv-Rsv-Rh-Ra-Rt-Rev06-09-08-24-2).

## Hidromac 2196 estándar · 1 × 1½–8 AA-STO

La sección VIII, página impresa 4, publica la curva de cinco álabes a 1.750 rpm para Ø205, Ø191, Ø178, Ø166, Ø153, Ø140 y Ø127 mm. La siguiente agrupación usa los tamaños del inventario y requiere cotejo de placa. [Curva Hidromac–Malmepi](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf) · [Copia del catálogo Hidromac 2003, pág. impresa 4](https://es.scribd.com/document/484435064/CATALOGO-HIDROMAC-08-07-03-pdf).

| TAG | Punto registrado | Curva para cotejo |
|---|---|---|
| B3 y B14 | 50 GPM, 15,2 m, Ø188 mm | Entre Ø178 y Ø191 mm |
| B4–B10 | 30–40 GPM, 15,2 m, Ø178 mm | Línea Ø178 mm |
| B26 | 3 GPM, 21 m, Ø200 mm | Confirmar hidráulica estándar o LF antes de asignar curva; cotejar caudal mínimo |

El código AA y el tamaño nominal también aparecen en la variante LF. La gráfica estándar no se asigna a los TAG de placa LF. [DXF parcial de soporte STO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf).


## Hidromac 2196 estándar · 1½ × 3–8 AB-STO

La sección VIII, página impresa 5, del catálogo histórico Hidromac–Malmepi contiene las curvas **1½ × 3–8 AB-STO**, de cinco álabes, a 3.500 y 1.750 rpm. Incluye curvas de altura, eficiencia, potencia y NPSH. [Catálogo Hidromac–Malmepi, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

| TAG | Punto del inventario | Referencia de selección |
|---|---|---|
| B1 y B2 | 130 GPM, 33,5 m, 3.500 rpm, Ø142 mm | Ø142 mm queda entre las líneas Ø140 y Ø153 mm; falta selección para el recorte real |
| B46 y B47 | 100 GPM, 18,3 m, 1.750 rpm, Ø205 mm | El catálogo incluye una línea Ø205 mm a esa velocidad; falta cotejar el punto y emitir la hoja de selección |

Esta gráfica corresponde a la 2196 estándar AB-STO. Las curvas LF AA de bajo caudal se investigan por separado. Los cuatro TAG comparten el [DXF parcial de soporte STO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Falta el CAD dimensional de conjunto.


## Hidromac 2196 MTO · Curvas por tamaño hidráulico

| Variante | TAG | Punto de inventario a 1.750 rpm | Curva de catálogo, sección VIII |
|---|---|---|---|
| 2 × 3–8 A60 | B11–B12, B49–B50 | 100 GPM, Ø178 mm; 13,7 m en B11–B12 y 12,1 m en B49–B50 | Pág. impresa 8, línea Ø178 mm. Cotejar la diferencia de altura antes de compartir hoja de selección. |
| 3 × 4–8G A70 | B27–B28, B34–B36 | 200 GPM, 15,2 m, Ø200 mm | Pág. impresa 10, curva por tamaño. Verificar recorte antes de asignar la línea. |
| 3 × 4–7 A70 | B53–B54 | 200 GPM, 12,2 m, Ø166 mm | Pág. impresa 7, línea Ø166 mm a 1.750 rpm. El máximo de inventario Ø205 mm requiere cotejo frente al mayor recorte graficado, Ø184 mm. |

La designación A70 aparece en dos tamaños hidráulicos. La curva 3 × 4–7 y la de 3 × 4–8G se mantienen separadas. Estas variantes comparten el [DXF parcial del soporte MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Quedan pendientes las hojas de selección y los CAD de conjunto por tamaño. [Catálogo Hidromac–Malmepi, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

**Selección A70 3 × 4–7.** En la página impresa 7 de Hidromac–Malmepi, el gráfico inferior de 1.750 rpm corresponde a un impulsor de cinco álabes y publica seis recortes, de Ø127 a Ø184 mm, con línea específica de Ø166 mm. El recuadro de Ø166 mm indica 3 HP, mientras que el inventario registra motor de 5 HP. El recuadro no indica la potencia absorbida en el punto de servicio. A 200 US GPM y 12,2 m, la potencia hidráulica calculada es 1,51 kW para una densidad de 1.000 kg/m³. Para evaluar el motor con mosto se requieren la densidad de servicio y la eficiencia de la bomba en ese punto. La transcripción indexada de la edición Malmedi 2004 muestra rótulos de rpm distintos. Usar una gráfica con rótulo legible de 1.750 rpm y guardar su revisión antes de extraer altura, eficiencia y NPSHr. [Hidromac–Malmepi, sección VIII, pág. impresa 7](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf) · [Edición Malmedi 2004, pág. impresa 6](https://es.scribd.com/document/359276490/MALMEDI-60HZ-14-09-04).


## Hidromac 2196 estándar · Cotas de montaje

**Montaje AB-STO 1½ × 3–8.** El [DXF 3D AB-STO](Documentos-bombas-Vocatus/Hidromac-2196-AB-STO-8-montaje-3D-referencia.dxf) ubica la succión NPS 3 y la descarga NPS 1½ con las cotas de catálogo A/B/D/X de 343/102/133/165 mm. La capa de bridas candidatas representa clase 150 con cuatro agujeros por conexión y círculos de pernos de 152,4 mm en succión y 98,425 mm en descarga. La malla exterior reutiliza el contorno contextual AA-STO. El perfil específico AB, el tipo de cara, la clase, el giro instalado y los anclajes siguen pendientes. B1–B2 y B46–B47 comparten este punto de partida para CAD de montaje, con recortes de impulsor distintos. [Catálogo Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10).

**Envolvente exterior AA-STO 1 × 1½–8.** El [DXF AA-STO](Documentos-bombas-Vocatus/Hidromac-2196-AA-STO-8-envolvente-exterior.dxf) fija A/B/D/X en 343/102/133/165 mm. La cara de descarga queda a 298 mm sobre el apoyo y la succión nominal es de 1½″. El extremo de eje usa Ø22 mm de catálogo. Se adaptaron las mallas de referencia A60 a las cotas AA-STO para representar carcasa, adaptador, soporte y patas en capas separadas. La foto B6 orienta el montaje exterior, pero oculta parte del equipo. El perfil y el ancho de esas piezas siguen estimados. Confirmar bridas, anclajes y dimensiones antes de aplicar la envolvente. La variante LF requiere comprobar su carcasa y soporte por separado. [Catálogo Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10) · [Foto B6](../visor-bombas-el-viejo/visor-bombas/public/expediente/B6-bomba.jpg).

**Reconstrucción exterior A60-MTO 2 × 3–8.** El [DXF de envolvente A60](Documentos-bombas-Vocatus/Hidromac-2196-A60-MTO-8-envolvente-exterior.dxf) usa A/B/D/X de 495/102/210/242 mm. La cara de descarga queda a 452 mm sobre el apoyo, 38 mm por debajo de la referencia A70 8G. La succión nominal es de 3″ y la descarga de 2″. Las capas separan carcasa, adaptador, soporte, patas y extremo del eje. Los contornos son estimados con las fotos de B11 y B12, y el extremo de eje usa Ø29 mm como cota candidata. La envolvente representa la bomba sin motor ni guarda. Se puede usar para B49–B50 una vez confirmado que comparten la misma ejecución mecánica. Falta levantar el perfil real, las bridas y el anclaje. [Catálogo Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10) · [Foto B11](../visor-bombas-el-viejo/visor-bombas/public/expediente/B11-bomba.jpg) · [Foto B12](../visor-bombas-el-viejo/visor-bombas/public/expediente/B12-bomba.jpg).

**Reconstrucción exterior A70-MTO 3 × 4–8G.** El [DXF de envolvente exterior](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-8G-envolvente-exterior.dxf) usa las cotas A/B/D/X de 495/102/210/280 mm para ubicar el extremo del eje, la cara de succión, el plano de apoyo y la cara de descarga. El extremo de eje usa Ø29 mm como referencia del catálogo técnico, sujeto al cotejo con la edición que indica Ø31,75 mm. Las mallas de carcasa (100), adaptador (108), soporte (228) y patas (incluida 241) se separan por capas y tienen perfiles aproximados a partir de la foto de conjunto. El dibujo sirve como envolvente exterior de bomba sin motor. Quedan pendientes los contornos medidos, anclajes, detalle de bridas y geometría interna. Los patrones de bridas se consultan en el DXF de interfaces 3D. [Plano Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10) · [Foto de referencia del grupo](../visor-bombas-el-viejo/visor-bombas/public/expediente/B36-bomba.jpg).

El [DXF de interfaces 3D](Documentos-bombas-Vocatus/Hidromac-2196-interfaces-montaje-3D.dxf) combina los ejes y caras del plano dimensional con diez juegos de perforaciones, dos clases candidatas para cada una de las cinco variantes de la tabla. La succión está en un plano vertical y la descarga en uno horizontal. El eje longitudinal del archivo apunta hacia la succión. El rectángulo de apoyo es simbólico. Los círculos dibujan perímetro y agujeros, y dejan pendientes espesor, tipo de cara, orientación angular instalada, carcasa, pies y anclajes. [Plano dimensional Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10).

El [DXF dimensional de referencia](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-cotas-montaje.dxf) ubica las caras de succión y descarga, el eje de la bomba y el plano de apoyo de cinco variantes. **X** es la altura de la cara de descarga sobre el eje de succión, **D** la altura del eje sobre el apoyo, **B** la distancia axial del eje de descarga a la cara de succión y **A** la distancia axial del eje de descarga al extremo del eje de la bomba. Las marcas de cara son simbólicas.

| Variante estándar | TAG para cotejo | Descarga × succión | X / D / B / A (mm) |
|---|---|---|---|
| AA-STO 1 × 1½–8 | B3–B10, B14, B24–B25 | 1″ × 1½″ | 165 / 133 / 102 / 343 |
| AB-STO 1½ × 3–8 | B1–B2, B46–B47 | 1½″ × 3″ | 165 / 133 / 102 / 343 |
| A60-MTO 2 × 3–8 | B11–B12, B49–B50 | 2″ × 3″ | 242 / 210 / 102 / 495 |
| A70-MTO 3 × 4–7 | B53–B54 | 3″ × 4″ | 280 / 210 / 102 / 495 |
| A70-MTO 3 × 4–8G | B27–B28, B34–B36 | 3″ × 4″ | 280 / 210 / 102 / 495 |

Para B24 y B25, el punto registrado es 60 GPM y 12,2 m con Ø174 mm a 1.750 rpm. Si se confirma la hidráulica estándar AA-STO, el recorte queda entre las líneas de Ø166 y Ø178 mm. La aplicación de las cotas y curvas requiere cotejar el tamaño y la ejecución por TAG. Quedan por verificar patrón de bridas, carcasa, anclajes y bancada instalada. [Plano Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10) · [Curva Hidromac–Malmepi, sección VIII, pág. impresa 4](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

### Hidromac 2196 · Cotas históricas de patas y acople

**A20 1½ × 3–13, candidata para B29.** La tabla dimensional del folleto 2196 identifica esa ejecución como **LTO**, con descarga de 1½″, succión de 3″, X de 10½″ (266,7 mm), D de 254 mm, B de 102 mm y A de 495 mm. La tabla histórica *Pump Dimensions* también la agrupa como LTO. La gráfica hidráulica histórica citada en B29 usa MTO, al igual que el inventario. Por tanto, A20 y el impulsor máximo de 330 mm orientan la búsqueda hidráulica, mientras que la configuración mecánica y la aplicación de estas cotas quedan sujetas a confirmar el soporte. [Folleto Hidromac ANSI-ASME 2196, tabla dimensional](https://fr.scribd.com/document/625842330/Brochure-ANSI-ASME-2196-PDF-2007) · [Catálogo Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10).

La tabla histórica *Pump Dimensions* añade las cotas E1, E2, F y H del patrón de patas, además de U, chavetero y V en el eje. Las dos referencias dan cotas distintas para el diámetro de acople MTO. Por eso el DXF de interfaz que usa Ø29 mm debe cotejarse con la revisión aplicable y con el eje instalado antes de seleccionar un acople o mecanizarlo.

| Soporte | E1 / E2 / F / H, pulgadas, tabla histórica | U, tabla histórica | Chavetero, tabla histórica | Ø en acople, catálogo de detalles técnicos |
|---|---|---|---|---|
| STO | 3 / 0 / 7¼ / ⅝ | 0,875″ (22,23 mm) | 3/16″ × 3/32″ | 22 mm (0,875″) |
| MTO | 4⅞ / 3⅝ / 12½ / ⅝ | 1,25″ (31,75 mm) | ¼″ × ⅛″ | 29 mm (1,125″) |

**Revisión 2026-11-09 (patas y acople).** La tabla Summit 2196LF repite E1/E2/F/H = 3/0/7¼/⅝″ para STO y 4⅞/3⅝/12½/⅝″ para MTO y LTO, y da U = 1,125″ en MTO, igual que el catálogo Hidromac (29 mm). Se adopta **Ø28,575 mm en acople MTO**; el 1,25″ histórico queda como discrepancia a medir. Como MTO y LTO comparten patrón de pies, **las anclas de B29 no dependen de resolver LTO/MTO**. DXF: [patas y extremo de eje](Documentos-bombas-Vocatus/Hidromac-2196-patas-y-extremo-eje-referencia.dxf) (interfaz parcial, mm). Falta la posición axial del patrón respecto a la cara de succión. Tabla completa: [Hidromac-2196-tabla-piezas-y-pendientes.md](Hidromac-2196-tabla-piezas-y-pendientes.md).

Las cotas de patas corresponden al patrón de la bomba en la tabla histórica. Para llevarlas al CAD, cotejar primero el esquema de cotas y la orientación de las patas. El patrón de pernos de la bancada instalada se levanta por separado. [Catálogo histórico Hidromac, tabla Pump Dimensions](https://es.scribd.com/document/484435064/CATALOGO-HIDROMAC-08-07-03-pdf) · [Catálogo de detalles técnicos, pág. PDF 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8).

**Curva A60 en una edición alternativa.** En el catálogo Malmedi 60 Hz de 2004, buscar la **pág. impresa 7** de la sección VIII. En la edición Hidromac–Malmepi referenciada arriba está en la **pág. impresa 8**. En ambos casos el identificador que permite localizar la curva correcta es 2196, 2 × 3–8, A60-MTO, cinco álabes, gráfico inferior a 1.750 rpm, línea Ø178 mm. El texto indexado confirma los rótulos. La altura a 100 GPM sigue por cotejar sobre la gráfica. [Catálogo Malmedi 60 Hz de 2004](https://es.scribd.com/document/359276490/MALMEDI-60HZ-14-09-04).

**Cómo distinguir el soporte A20.** La misma hoja de curvas A20 rotula **MTO/LTO a 3.500 rpm** y **MTO a 1.750 rpm**. El encabezado del gráfico identifica su alcance hidráulico, sin resolver el soporte instalado. Para el levantamiento, la tabla de detalles técnicos distingue MTO de LTO por el eje en acople (29 frente a 48 mm) y la distancia entre rodamientos (171 frente a 164 mm). Priorizar la lectura de la placa de soporte y el diámetro de acople. Dos ediciones de la curva A20 conservan los recortes Ø280 y Ø305 mm que acotan Ø290 mm, pero sus recuadros dan potencias distintas para los recortes. Registrar la revisión al pedir la selección y evitar trasladar la potencia de esos recuadros al punto de 200 GPM. [Curva Hidromac–Malmedi, revisión 29/03/05, pág. impresa 18](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf) · [Otra edición del catálogo](https://es.scribd.com/document/409427096/CATALOGO-HIDROMAC-pdf) · [Soportes, pág. PDF 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8).

### Hidromac 2196 · Cotejo de eje y rodamientos

El [DXF 3D A20-LTO](Documentos-bombas-Vocatus/Hidromac-2196-A20-LTO-montaje-3D-referencia.dxf) representa las caras de succión y descarga, el eje, el apoyo y el diámetro de acople Ø48 mm según las cotas LTO citadas arriba. La cara de descarga está a 520,7 mm del apoyo. El patrón clase 150 es candidato y la aplicación a B29 depende de confirmar el soporte. El archivo contiene interfaces. La carcasa y los anclajes requieren medidas.

| Soporte estándar | Rodamiento radial | Rodamiento de empuje | Ø eje entre rodamientos / en acople | Distancia entre rodamientos |
|---|---|---|---|---|
| STO | 6207 | 3306 A/C3 | 38 / 22 mm | 105 mm |
| MTO | 6309 | 3309 A/C3 | 54 / 29 mm | 171 mm |

El diámetro de eje **entre** rodamientos describe un tramo del eje. Para mecanizar se necesitan los diámetros de asiento, sus tolerancias, radios, hombros y posición axial. El catálogo también distingue el eje en la cámara de sellado: STO Ø35 mm sin camisa y Ø29 mm con camisa; MTO Ø45 mm sin camisa y Ø38 mm con camisa. Estas cotas se deben cotejar con el arreglo de sello y camisa instalado. [Detalles técnicos Hidromac, pág. PDF 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8).

| Tamaño del inventario | TAG | Delantero / trasero registrado |
|---|---|---|
| STO estándar | B1–B2 | 6308-2RS / 6207-2RS |
| STO estándar | B3–B10, B24–B25 | 6205-2RS / 6204-2RS |
| STO estándar | B14 | 6206-ZZ / 6205-ZZ |
| STO estándar | B46–B47 | 6307-2RS / 6206-2RS |
| STO, variante hidráulica por confirmar | B26 | 6205-ZZ / 6204-ZZ |
| LF | B23, B30–B33, B37–B38 | 6205-2RS / 6204-2RS |
| MTO | B11–B12, B49–B50, B53–B54 | 6307-2RS / 6206-2RS |
| MTO | B27–B28, B34–B36 | 6308-2RS / 6207-2RS |
| MTO según inventario, tamaño por confirmar | B29 | 6309-2RS-C3 / 6209-2RS-C3 |

Ningún par registrado para STO o MTO coincide por completo con el par de catálogo de su soporte estándar. En B1–B2 coincide la serie 6207 con el radial STO; en B29 coincide la serie 6309 con el radial MTO, con sufijo registrado distinto del catálogo. Para resolver la procedencia, cotejar el código grabado y la posición de cada rodamiento con la placa del motor y el soporte de la bomba por separado. Para LF, verificar el despiece específico por tamaño y serie antes de asignar rodamientos. Mantener las referencias del inventario como datos por verificar al elaborar el despiece y el CAD del eje.

**CAD por pieza.** El [DXF de rodamientos STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-rodamientos-STO-MTO-referencia.dxf) incluye vistas frontales y cortes de envolvente en milímetros. Los códigos son los del soporte estándar de catálogo. La instalación y el sufijo exactos se cotejan con el rodamiento retirado.

El [DXF 3D de rodamientos STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-rodamientos-STO-MTO-3D.dxf) contiene cuatro mallas anulares separadas por capa y rotuladas con soporte, posición y referencia. Reproduce el diámetro interior, el exterior y el ancho nominal. Los cilindros se aproximan con 64 segmentos. Son envolventes para colocar en el despiece y cotejar los asientos. Quedan por confirmar el rodamiento instalado, la posición axial y la variante de empuje. Las pistas, bolas, jaulas y radios de borde quedan fuera de la envolvente.

| Soporte | Posición | Nombre de la pieza | Referencia | Ø interior × Ø exterior × ancho (mm) |
|---|---|---|---|---|
| STO | 168A | Rodamiento radial de bolas | 6207 | 35 × 72 × 17 |
| STO | 112A | Rodamiento de empuje de contacto angular de doble hilera | 3306 A/C3 | 30 × 72 × 30,2 |
| MTO | 168A | Rodamiento radial de bolas | 6309 | 45 × 100 × 25 |
| MTO | 112A | Rodamiento de empuje de contacto angular de doble hilera | 3309 A/C3 | 45 × 100 × 39,7 |

[Dimensiones SKF 6207 y 6309](https://cdn.skfmediahub.skf.com/api/public/0901d196807026e8/pdf_preview_medium/0901d196807026e8_pdf_preview_medium.pdf) · [Dimensiones SKF 3306 y 3309](https://cdn.skfmediahub.skf.com/api/public/0901d19680237e2b/pdf_preview_medium/950-710_Nilos_08_pdf_preview_medium.pdf).

### Hidromac 2196 · Ajustes de asientos STO y MTO

El [DXF de asientos](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-asientos-referencia.dxf) contiene cuatro secciones transversales independientes. Los círculos representan diámetros nominales y las notas indican los límites de la tabla 8. La posición axial, los hombros y los radios requieren plano de detalle o medición.

La tabla 8 del manual Hidromac publica límites de diámetro para el eje y sus alojamientos con rodamientos ABEC 1. Los intervalos se muestran de menor a mayor, en milímetros. «Interior» corresponde al rodamiento radial del lado de la bomba y «exterior» al del lado del acople.

| Superficie | STO | MTO |
|---|---:|---:|
| Ø exterior del eje en el asiento interior | 35,002–35,013 | 45,002–45,013 |
| Ø interior del soporte en el asiento interior | 72,000–72,019 | 100,000–100,022 |
| Ø exterior del eje en el asiento exterior | 30,002–30,011 | 45,002–45,013 |
| Ø interior de la caja en el asiento exterior | 72,000–72,019 | 100,000–100,022 |

Según la misma tabla, el montaje del rodamiento interior sobre el eje tiene 0,002–0,025 mm de interferencia en ambos soportes. Para el exterior, la interferencia indicada es 0,002–0,021 mm en STO y 0,002–0,025 mm en MTO. La holgura diametral de alojamiento es 0–0,032 mm en STO y 0–0,037 mm en MTO. Estos límites complementan el DXF del soporte. Para aplicarlos al CAD de una unidad instalada hay que confirmar el grupo y la disposición de rodamientos, así como las longitudes, hombros y radios del eje y de la caja. [Manual Hidromac, tabla 8, pág. impresa 61](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

### Hidromac 2196 · Eje, camisa, cámara y sello

| Posición | Pieza | STO | MTO |
|---|---|---|---|
| 122 / 122A según edición | Eje en la zona de sellado | Ø35 mm sin camisa o Ø29 mm en versión con camisa | Ø45 mm sin camisa o Ø38 mm en versión con camisa |
| 126 | Camisa o bocina de eje | Ø exterior nominal 35 mm | Ø exterior nominal 45 mm |
| 184 / 184A según edición | Cámara Big Bore o prensaestopas | Ø exterior de catálogo 73 o 51 mm, respectivamente | Ø exterior de catálogo 89 o 64 mm, respectivamente |
| 383 según el manual | Sello mecánico | Candidatos Tipo 1 y Tipo 21, 1⅜″ | Candidatos Tipo 1 y Tipo 21, 1¾″ |

| Sello candidato John Crane | Ø nominal de eje o camisa D1 | Ø exterior del sello D3 | Ø mínimo de alojamiento D4 | Altura de trabajo L3 |
|---|---:|---:|---:|---:|
| Tipo 1, 1⅜″ | 1,375″ | 1,875″ | 2,125″ | 1,687″ |
| Tipo 21, 1⅜″ | 1,375″ | 2,062″ | 2,312″ | 1,125″ |
| Tipo 1, 1¾″ | 1,750″ | 2,375″ | 2,625″ | 2,000″ |
| Tipo 21, 1¾″ | 1,750″ | 2,625″ | 2,875″ | 1,375″ |

El [DXF de interfaces de sellado](Documentos-bombas-Vocatus/Hidromac-2196-eje-camisa-sello-referencia.dxf) separa las secciones nominales Hidromac de las envolventes candidatas John Crane. Los diámetros exteriores de cámara del catálogo Hidromac no equivalen al alojamiento interior mínimo D4 de John Crane. El Tipo 1 y el Tipo 21 comparten el diámetro de eje para cada tamaño, pero cambian el alojamiento y la altura de trabajo. Confirmar el fabricante y tipo del sello instalado, la forma y profundidad del asiento fijo, la longitud de camisa y el material de caras y elastómero. La camisa tiene opciones de material en el catálogo, entre ellas inoxidable 316 y CD4MCu. [Catálogo Hidromac, págs. PDF 7–8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8) · [John Crane Tipo 1](https://www.johncrane.com/media/kutiyh5s/td-1-1b-8pg-bw-oct2015.pdf) · [John Crane Tipo 21](https://www.johncrane.com/media/505hkafe/td-21-4pg-bw-oct2015_3rdfeb.pdf).

**Referencia axial para reconstruir el sello.** El manual, figura 155, toma como referencia la cara donde asienta la junta del casquillo contra la tapa 184 y transfiere esa posición al eje 122 o a la camisa 126. Para completar el DXF, registrar desde esa cara la profundidad hasta el asiento fijo y la posición de trabajo del elemento giratorio. Para sello de cartucho, registrar su plano de montaje y el código del conjunto. Conservar la altura L3 del fabricante del sello como dato separado de la longitud total de la camisa. El apéndice VI contiene cotas y acabado de una camisa de PTFE para la variante revestida. No hay evidencia para transferir esas tolerancias a la camisa metálica 126 de las Hidromac 2196 del inventario. [Manual Hidromac, pág. impresa 77 y apéndice VI](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

### Hidromac 2196 · Despiece de referencia

**Vista explotada A70-MTO 3 × 4–7.** El [DXF 3D A70 3 × 4–7](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-7-despiece-3D.dxf) usa el contorno de impulsor 101 de Ø166 mm para B53–B54 y las caras de succión NPS 4 y descarga NPS 3 con perforaciones clase 150 candidatas. La carcasa 100 queda representada por sus caras de conexión hasta medir su perfil. El adaptador y el soporte MTO son referencias comunes pendientes de cotejo; las separaciones del despiece son simbólicas. Se verificaron en el archivo las unidades, el radio del contorno del impulsor y los 14 círculos de bridas. [Cotas Hidromac, pág. PDF 10](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=10).

**Vista explotada AB-STO 1½ × 3–8.** El [DXF AB-STO](Documentos-bombas-Vocatus/Hidromac-2196-AB-STO-8-despiece-3D.dxf) añade las perforaciones candidatas de las bridas AB y dos capas alternativas para el impulsor 101, Ø142 mm para B1–B2 y Ø205 mm para B46–B47, ambos según inventario. Usa el soporte STO y rodamientos 6207 / 3306 A/C3 como candidatos de catálogo. La malla exterior AA-STO sirve de contexto mientras se mide el perfil AB. Se verificaron al reabrir el DXF las unidades, los dos radios de impulsor y los diez círculos de brida. Las separaciones son simbólicas. Quedan por medir la geometría de los álabes, el cubo y las superficies de unión.

**Vista explotada AA-STO estándar 1 × 1½–8.** El [DXF 3D AA-STO](Documentos-bombas-Vocatus/Hidromac-2196-AA-STO-8-despiece-3D.dxf) usa las mallas exteriores estimadas de la AA-STO y el contorno Ø178 mm del impulsor 101, diámetro visible en la placa archivada como B6. Incluye los rodamientos nominales de catálogo STO 168A (6207) y 112A (3306 A/C3) y el Ø73 mm exterior de la cámara Big Bore como candidato. La junta 412A se identifica por posición. Las separaciones son simbólicas y los rodamientos y la cámara instalados siguen por comprobar. Para los recortes Ø174 y Ø188 mm, usar los contornos del DXF de impulsores tras verificar que la ejecución mecánica sea la misma. [Placa B6](../visor-bombas-el-viejo/visor-bombas/public/expediente/B6-placa2.jpg) · [Detalles técnicos Hidromac, pág. PDF 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8).

**Vista explotada A60-MTO 2 × 3–8.** El [DXF 3D A60](Documentos-bombas-Vocatus/Hidromac-2196-A60-MTO-8-despiece-3D.dxf) conserva las mallas exteriores específicas de A60 y representa el impulsor 101 por su contorno de Ø178 mm. Reutiliza las envolventes nominales del soporte estándar MTO para 168A (6309) y 112A (3309 A/C3). La cámara 184 usa el diámetro exterior Big Bore de catálogo como candidato y la junta 412A aparece por posición. Las separaciones son simbólicas. Los contornos exteriores son estimados y quedan por verificar el sello, los rodamientos instalados y las superficies de unión.

**Vista explotada A70-MTO 3 × 4–8G.** El [DXF 3D del despiece](Documentos-bombas-Vocatus/Hidromac-2196-A70-MTO-8G-despiece-3D.dxf) separa carcasa 100, impulsor 101, junta 412A, cámara 184, adaptador 108, rodamientos 168A/112A, soporte 228, pata 241 y extremo de eje 122. Las separaciones de la vista son simbólicas. La junta aparece como llamada sin geometría y el impulsor como contorno de Ø200 mm. La cámara usa el diámetro exterior Big Bore de catálogo como candidato. Los rodamientos llevan sus dimensiones nominales, mientras que los contornos exteriores reutilizan la envolvente estimada por foto. La forma de la junta, el sello, el eje completo y las superficies de unión siguen por levantar antes de definir el conjunto interno.

El manual histórico Hidromac identifica las siguientes posiciones para leer el corte y solicitar la lista de repuestos por serie. Las posiciones identifican piezas en el dibujo. El número de pedido y el material de cada pieza dependen de la ejecución instalada.

| Posición | Pieza | Código de repuesto o referencia | Medidas y estado del CAD | Material de referencia | Fuente |
|---|---|---|---|---|---|
| 100 | Carcasa | Por serie | Cotas de montaje por tamaño confirmadas en catálogo. Contornos de las envolventes estimados. Verificar bridas, unión y perfil interior | Hierro nodular, 316SS, CD4MCu, aleación 20 o Hastelloy | Catálogo, pp. 7 y 10 |
| 101 | Impulsor abierto | Por tamaño, recorte y serie | DXF de recortes Ø142–290 mm de inventario, según variante. Pendientes álabes, cubo y rosca | Opciones de fundición como la carcasa. Verificar por serie | Catálogo, p. 7 e inventario |
| 412A | Junta tórica del impulsor | Cotejar 496A en la edición resumida | Llamada en vistas explotadas. Pendientes diámetro, sección y ranura | PTFE según catálogo resumido | Catálogo, p. 7 y manual, figs. 46–48 |
| 122 / 122A | Eje | Por soporte y arreglo con o sin camisa | DXF de asientos y sello con cotas de catálogo. Pendientes estaciones axiales, hombros, radios y rosca | SAE 4140 e inoxidables, según ejecución | Catálogo, pp. 7–8 y manual, tabla 8 |
| 126 | Camisa de eje | Por soporte y sello | Ø exterior nominal STO 35 mm y MTO 45 mm. Pendientes longitud, perfil y ajuste interior | Inoxidable 316, CD4MCu, aleación 20 o Hastelloy | Catálogo, pp. 7–8 |
| 184 / 184A | Tapa de cámara o prensaestopas | Por arreglo de sellado | Big Bore Ø exterior 73/89 mm STO/MTO. Pendientes profundidad, piloto y perforación | Hierro nodular o aleación según ejecución | Catálogo, pp. 7–8 |
| 383 | Sello mecánico | Tipo 1 o Tipo 21 candidato, 1⅜″ STO y 1¾″ MTO | DXF de interfaces con cotas John Crane. Pendiente asiento fijo y código instalado | Caras y elastómero por verificar | Manual, p. 85 y fichas John Crane citadas arriba |
| 253B | Casquillo del sello mecánico | Por serie y revisión del corte | Pendientes diámetro, profundidad y fijación | Por verificar | Manual, p. 85 |
| 105 / 106 / 107 | Anillo de cierre, empaquetadura y casquillo | Por arreglo de prensaestopas empacado | Pendientes sección, diámetro y dimensiones del casquillo | Catálogo lista PTFE para 105 y cordón grafitado para 106. Verificar 107 | Catálogo, p. 7 y manual, p. 85 |
| 108 | Adaptador | Por soporte y serie | Malla exterior estimada. Pendientes pilotos y tornillos de unión | Hierro nodular | Catálogo, p. 7 |
| 134 | Caja de rodamientos | Por soporte y disposición de empuje | Ajustes Ø72,000–72,019 mm STO y Ø100,000–100,022 mm MTO. Pendientes ancho, ranuras y hombros | Por verificar | Manual, tabla 8 |
| 228 / 241 | Soporte y pata | Por grupo y montaje | Mallas exteriores estimadas. Cotejar apoyo y anclajes | Soporte en hierro nodular o gris según catálogo. Pata por verificar | Catálogo, pp. 7–8 y manual, p. 85 |
| 168A | Rodamiento radial | STO 6207, MTO 6309 nominales | Envolventes 3D de 35 × 72 × 17 y 45 × 100 × 25 mm. Confirmar código instalado | Por referencia y fabricante del rodamiento | Catálogo, p. 8 y tabla SKF citada arriba |
| 112A | Rodamiento de empuje | STO 3306 A/C3, MTO 3309 A/C3 nominales | Envolventes 3D de 30 × 72 × 30,2 y 45 × 100 × 39,7 mm. Confirmar disposición instalada | Por referencia y fabricante del rodamiento | Catálogo, p. 8 y tabla SKF citada arriba |
| 400 | Chaveta de acople | Por eje y acople | Sección histórica STO 3/16″ × 3/32″ y MTO ¼″ × ⅛″. Verificar revisión, ranura y longitud | Por verificar | Tabla histórica de patas y acople citada arriba |

Para piezas fundidas, el manual distingue, entre otros, **1013** (hierro dúctil ASTM A536 grado 60-42-10), **1203** (inoxidable fundido ASTM A744 CF-8M) y **1216** (ASTM A744 CD4MCu). Estos son códigos de material de catálogo. Su asignación por TAG requiere el registro de fabricación o identificación de la pieza. El corte de la **2196 estándar** está en la página impresa 88 y el de la **LF** en la 89. Consultar el corte de la variante antes de aplicar las posiciones a una unidad LF. [Manual ANSI 2196 de Hidromac, págs. impresas 85–89](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

#### Juntas, fijaciones y lubricación del soporte

| Posición del manual | Pieza | Material de referencia o dato pendiente para CAD |
|---|---|---|
| 109C | Tapa del extremo del rodamiento exterior | Confirmar variante, piloto, espesor y perforación |
| 136 | Contratuerca del rodamiento | Acero según catálogo resumido. Medir rosca y cara de apoyo |
| 248 | Lanzador de aceite | Confirmar ejecución, diámetro de ajuste y ancho |
| 319 | Indicador de nivel | Catálogo de referencia en vidrio/acero. Cotejar rosca o fijación y altura |
| 332A / 333A | Laberintos exterior e interior | El catálogo resumido lista bronce al silicio y junta FKM para la referencia de laberinto. Confirmar ejecución y materiales de ambas posiciones |
| 351 | Junta de carcasa | Fibra de aramida según catálogo resumido. Medir contorno, pasos de tornillos y espesor |
| 360C | Junta de tapa del extremo de empuje | Fibra de celulosa con adhesivo según catálogo resumido. Medir perfil y espesor |
| 360F | Junta entre soporte y adaptador | Fibra de celulosa con adhesivo según catálogo resumido. Medir piloto, patrón y espesor |
| 360Q | Junta entre casquillo y tapa del prensaestopas | Confirmar arreglo, material y medidas |
| 361A | Anillo de retención | Confirmar grupo de soporte, sección, diámetro y ranura |
| 370 / 370B | Perno de adaptador a carcasa / perno de soporte a adaptador | Cotejar rosca, longitud y grado por unión |
| 370C / 370D / 423 | Perno de sujeción, perno de ajuste y contratuerca de caja de rodamientos | Verificar rosca, carrera disponible y número de fijaciones |
| 382 | Arandela de seguridad del rodamiento | Cotejar tipo y diámetro con la contratuerca 136 |
| 408A | Tapón de drenaje de aceite | Medir la rosca del soporte. El 358 corresponde al drenaje de carcasa |
| 469B | Pasador guía de soporte a adaptador | Acero según catálogo resumido. Medir diámetro, longitud y ajuste |
| 496 | Junta tórica de la caja del rodamiento | Buna según catálogo resumido. Confirmar compuesto, diámetro y sección |
| 497F / 497G | Juntas de rotor y estator del laberinto exterior | Confirmar medidas y compuesto por ejecución |
| 497H / 497J | Juntas de rotor y estator del laberinto interior | Confirmar medidas y compuesto por ejecución |

Las posiciones provienen de la lista del manual histórico. El catálogo resumido agrupa algunas referencias con sufijos distintos. Para los soportes STO y MTO, confirmar si la disposición de empuje es un rodamiento de doble hilera o un par de rodamientos antes de seleccionar tapa, retención y caja. [Manual Hidromac, lista de partes y montaje del extremo de energía](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html) · [Catálogo Hidromac, pág. PDF 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7).

### Hidromac 2196 · Impulsor 101 y junta 412A

El [DXF de diámetros de recorte](Documentos-bombas-Vocatus/Hidromac-2196-impulsores-recortes-referencia.dxf) agrupa 12 diámetros de inventario en las ocho configuraciones de trabajo. Los círculos marcan el límite radial de cada recorte en milímetros. Los recortes candidatos conservan el mismo estado de identificación que en la tabla del modelo. Las curvas A60 2 × 3–8 y A70 3 × 4–7 / 3 × 4–8G documentan cinco álabes en las ejecuciones graficadas. La LF utiliza impulsor abierto de álabes radiales según el manual. Estas descripciones orientan el CAD, pero dejan por medir el ancho, el perfil de los álabes y el cubo.

| Posición | Pieza | Dato de catálogo y dato pendiente |
|---|---|---|
| 101 | Impulsor abierto roscado | Diámetro por recorte. El catálogo ofrece hierro nodular, inoxidable 316, CD4MCu, aleación 20 y Hastelloy. Verificar material instalado, ancho axial, número y perfil de álabes, Ø y largo de cubo, y diámetro, paso, mano y profundidad de rosca. |
| 412A | Junta tórica del impulsor | El catálogo resumido indica PTFE. Verificar compuesto instalado, diámetro interior, sección y ranura antes de definir el repuesto. |
| 100 | Carcasa, superficie frente a los álabes | La tabla 3 del manual distingue el ajuste en frío por soporte, variante y temperatura de servicio. Cotejar la fila aplicable antes de fijar la separación axial en el CAD. |

[Catálogo Hidromac, corte y materiales, pág. PDF 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7) · [Manual Hidromac, tabla 3 y figs. 46–48](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

### Hidromac 2196 · Identificación para recuperar documentos por serie

El manual sitúa la placa hidráulica en la carcasa y la placa de lubricación en el soporte. Fotografiar ambas y conservar por separado la placa del motor. El tamaño se lee como descarga × succión – diámetro nominal máximo del impulsor, en pulgadas. El diámetro recortado se registra en un campo aparte. [Manual Hidromac, pág. impresa 9, figs. 1 y 2](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

| TAG | Lectura de la placa archivada | Documento por recuperar |
|---|---|---|
| B6 | 2196, 1 × 1½–8 STO, 40 GPM, 15,2 m, 1.750 rpm y Ø178 mm. Serie probable **210770-3**, con lectura por confirmar. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B6-placa2.jpg) | Cotejar serie y pedir hoja de selección AA-STO Ø178 mm y plano dimensional |
| B11 | 2 × 3–8 MTO I, **210776-1**, lubricación OIL. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B11-placa.jpg) | Pedir selección A60 y plano dimensional por serie |
| B12 | 2 × 3–8 MTO I, **210776-2**, lubricación OIL. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B12-placa.jpg) | Pedir selección A60 y plano dimensional por serie |
| B31 / B32 | LF 1 × 1½–8, **210771-5 / 210771-2**, respectivamente. Véase el cotejo LF. | Pedir selección LF AA, plano dimensional y confirmación del soporte por serie |

Para cada serie, solicitar la curva Q–H al recorte de fábrica, el plano general con revisión y archivo CAD si existe, y la lista de materiales con número de pedido por posición. En B11 y B12, Ø178 mm y 100 GPM proceden del inventario y deben cotejarse con las selecciones originales.

**Resultado de la búsqueda por serie B11 y B12.** La búsqueda pública por 210776-1 y 210776-2 no devolvió selecciones ni archivos CAD de esas unidades. El gráfico inferior de la sección VIII, pág. impresa 8, confirma una curva A60-MTO 2 × 3–8 de cinco álabes a 1.750 rpm con línea Ø178 mm. El gráfico identifica la familia hidráulica, y el significado de la «I» de las placas queda por confirmar. [Gráficas Hidromac–Malmepi, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

**Revisión del despiece para B11 y B12.** El catálogo resumido de Hidromac identifica el eje sin camisa como 122 y el eje con camisa como 122A. El manual histórico usa 122 para ambos en su lista. Al cotejar una oferta o un plano, indicar expresamente «con camisa» o «sin camisa» y pedir el número de parte y la revisión correspondientes a cada serie. El catálogo enumera hierro nodular, inoxidable 316, CD4MCu, aleación 20 y Hastelloy como opciones de carcasa e impulsor. Confirmar la combinación de fábrica por serie. [Catálogo Hidromac, pág. PDF 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7) · [Manual Hidromac, pág. impresa 85](https://pdfcoffee.com/manual-ansi-2196-completo-5-pdf-free.html).

**Canal para consultar archivos históricos.** Vimatec se presenta como distribuidor autorizado de Hidromac y ofrece selección técnica y repuestos originales. La consulta por B11 y B12 debe incluir ambas fotos y pedir confirmación del sufijo «I», selección de fábrica, plano dimensional con revisión, CAD disponible y despiece valorizado por número de parte y material. El acceso del distribuidor al archivo de esas series sigue por confirmar. [Vimatec, línea Hidromac](https://www.vimatec.com.co/hidromac/).

### Hidromac 2196 · Medidas de campo para completar el CAD

Completar una hoja por configuración mecánica distinta. Si dos TAG comparten el conjunto verificado, registrar ambos en la misma hoja. Para el croquis, fijar el origen en el centro de la cara de succión, con el eje axial positivo hacia el acople, la vertical positiva hacia arriba y el eje transversal completando un sistema de mano derecha. Registrar unidades, instrumento y foto o plano de respaldo.

| Zona | Dato que falta | Referencia para cotejo |
|---|---|---|
| Identidad | Variante, TAG, serie y foto que vincule la placa con el conjunto | Tabla del modelo. Separar AA estándar de AA-LF y A70 3 × 4–7 de 3 × 4–8G |
| Caras de conexión | Posición de cada cara y dirección de su eje, cotas X y B, giro de la perforación | DXF de cotas de montaje |
| Bridas de succión y descarga | Tamaño nominal, marcado de clase, tipo de cara, Ø exterior, círculo de pernos, número y Ø de agujeros, paso interno y espesor si están accesibles | DXF comparativo 150/300 |
| Carcasa y soporte | Contorno en planta, alzado y frente, altura D, cota A y posición de los pies | DXF de cotas de montaje e interfaces |
| Patas y bancada | Coordenadas de agujeros de patas, diámetros o ranuras, medidas exteriores de la bancada y coordenadas de sus anclajes | Cotas históricas E1/E2/F/H para cotejar las patas |
| Acople y guarda | Ø y proyección del extremo del eje, chavetero, distancia entre extremos de ejes y envolvente exterior de guarda | Revisar en MTO la diferencia de catálogo de Ø29 frente a Ø31,75 mm |
| Detalles internos | Asientos, longitudes axiales, radios, hombros, rosca del impulsor y arreglo del sello | Plano de detalle o medición de piezas durante una intervención de mantenimiento |

Para el CAD de montaje exterior, bastan las interfaces, anclajes y envolventes verificadas. Para fabricar piezas internas se necesita el plano de detalle o un levantamiento de la pieza con tolerancias y material verificados. Si una variante comparte montaje pero cambia el impulsor, usar el mismo CAD exterior y conservar su selección hidráulica por separado.

### Hidromac 2196 · Solicitud de archivos de fábrica

Texto listo para enviar al fabricante o distribuidor. Adjuntar las fotos de las placas citadas en las secciones de identificación, LF y A70.

> Buscamos recuperar la documentación original de bombas Hidromac 2196 instaladas en la planta Vocatus / Azucarera El Viejo, Costa Rica. ¿Pueden consultar las siguientes series en su archivo de fabricación?
>
> - 2 × 3–8 MTO I, A60, series 210776-1 y 210776-2.
> - 1 × 1½–8 LF, AA, series 210771-1, 210771-2, 210771-3 y 210771-5.
> - 3 × 4–8G MTO I, A70, series 210775-2, 210775-3, 220105-1 y 220105-2.
> - 1 × 1½–8 STO, lectura de serie por verificar 210770-3, y 1 × 1½–8 LF STO, lectura por verificar 220638-2. Agradecemos confirmar la lectura a partir de las placas.
>
> Para cada configuración distinta, solicitamos la hoja de selección con curva Q–H al diámetro de fábrica y velocidad indicada, el plano general dimensional con número y revisión, el CAD de conjunto en STEP o DWG/DXF si está disponible, y el despiece con números de repuesto y materiales. Si un mismo juego de documentos aplica a varias series, agradeceríamos que indiquen a cuáles.
>
> En el plano, necesitamos identificar clase y tipo de cara de las bridas, anclajes de bomba y bancada, grupo de soporte y extremo del eje de acople. En el despiece, necesitamos confirmar la ejecución del sello, si el eje lleva camisa, los rodamientos y el significado del sufijo I en STO I y MTO I. Si conservan solo parte de la documentación, agradeceríamos los archivos disponibles con su revisión.

Las series sin TAG confirmado se incluyen para recuperar documentación por configuración. La asignación a una ubicación de planta se verifica por separado. Para variantes con serie por recuperar, usar los tamaños y recortes de la tabla principal de la 2196 y solicitar la documentación general de esas ejecuciones.

## B1 · Alimentación Mosto Fermentado DUSA

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 130 · RPM: 3500 · HD [m]: 33.5 · Ø Imp [mm]: 142 · Ø Máx [mm]: 205
- **Tamaño** 1.5X3-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG · HP: 7.5 · RPM: 3515
- **Acople o elastómero** REXNORD · ES-4R
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B2 · Alimentación Mosto Fermentado DUSA

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 130 · RPM: 3500 · HD [m]: 33.5 · Ø Imp [mm]: 142 · Ø Máx [mm]: 205
- **Tamaño** 1.5X3-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG  · HP: 7.5 · RPM: 3515
- **Acople o elastómero** REXNORD · ES-4R
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B3 · Columna Aldehído 2

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 50 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 188 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B4 · Columna Rectificadora 2

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 35 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B5 · Columna Aldehído 1

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 40 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** 2R
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B6 · Columna Aldehído 1

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Curva Hidromac por tamaño** [Catálogo histórico, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf), página impresa 4, 1 × 1½–8 AA-STO, 1.750 rpm, Ø178 mm. Copia indexada; descarga directa no disponible.

**Lectura de placa archivada** Hidromac 2196, 1 × 1½–8 STO, 40 GPM, 1.750 rpm e impulsor de 178 mm. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B6-placa2.jpg) · [Mapa de selección por tamaño y velocidad, pág. 9](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=9) · [Piezas y materiales, pág. 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7). El mapa presenta rangos por tamaño; queda pendiente la curva individual para el impulsor instalado. CAD exacto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 40 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** 2R
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B7 · Columna Rectificadora 1

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 30 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B8 · Columna Rectificadora 1

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 30 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B9 · Columna Rectificadora Batch

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 35 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B10 · Columna Rectificadora Batch

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 35 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 178 · Ø Máx [mm]: 205
- **Tamaño** 1x1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B11 · Columna Vinaza

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Curva Hidromac por tamaño** [Catálogo histórico, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf), página impresa 8, 2 × 3–8 A60 MTO, 1.750 rpm, con curva Ø178 mm. Copia indexada; descarga directa no disponible.

**Lectura de placa archivada** Hidromac 2196, 2 × 3–8 MTO. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B11-placa.jpg) · [Mapa de selección por tamaño y velocidad, pág. 9](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=9) · [Piezas y materiales, pág. 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7). El mapa presenta rangos por tamaño; queda pendiente la curva individual para el impulsor instalado. CAD exacto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Mosto - Vinaza
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 13.7 · Ø Imp [mm]: 178 · Ø Máx [mm]: 215
- **Tamaño** 2X3-8 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG  · HP: 5 · RPM: 1750
- **Acople o elastómero** 3R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B12 · Columna Vinaza

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Curva Hidromac por tamaño** [Catálogo histórico, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf), página impresa 8, 2 × 3–8 A60 MTO, 1.750 rpm, con curva Ø178 mm. Copia indexada; descarga directa no disponible.

**Lectura de placa archivada** Hidromac 2196, 2 × 3–8 MTO. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B12-placa.jpg) · [Mapa de selección por tamaño y velocidad, pág. 9](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=9) · [Piezas y materiales, pág. 7](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=7). El mapa presenta rangos por tamaño; queda pendiente la curva individual para el impulsor instalado. CAD exacto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 13.7 · Ø Imp [mm]: 178 · Ø Máx [mm]: 215
- **Tamaño** 2X3-8 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG  · HP: 5 · RPM: 1750
- **Acople o elastómero** 3R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B13 · Alambique - Código UQ

**CAD reconstruido B13** [DXF frontal y lateral en mm](Documentos-bombas-Vocatus/B13-Titan-4196-ST-esquema.dxf). Cotas principales Titan de catálogo. Perfil de carcasa y bridas esquemático. Motor y bancada instalada pendientes. [Envolvente 3D DXF](Documentos-bombas-Vocatus/B13-Titan-4196-ST-envolvente-3D.dxf). Mallas esquemáticas con posición de conexiones según catálogo. Motor y bancada omitidos.

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 1 × 1½–8 AA ST. Succión 1½″, descarga 1″. X/A/B/D/SP 165/343/102/133/95 mm. Bomba sin motor 45 kg. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** TITAN 4196 · GPM:  · RPM:  · HD [m]: 13.7 · Ø Imp [XX]: 7.1875 · Ø Máx [XX]: 8
- **Tamaño** 1X1.5-8 ST
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG  · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** CAD pendiente por tamaño y soporte.

## B14 · Alambique - Código UQ

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 1. DESTILACIÓN PLANTA DUSA

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 50 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 188 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG  · HP: 3 · RPM: 1750
- **Rodamiento delantero registrado** 6206-ZZ
- **Rodamiento trasero registrado** 6205-ZZ
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B15 · Alimentación Mosto Fermentado Hindú

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Mosto
- **Bomba y datos registrados** MULTISTEEL  · RSA 25/205 · GPM: 30.8 · RPM: 3500 · HD [m]: 65 · Ø Imp [mm]: 195
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** LINCOLN · HP: 10 · RPM: 3500
- **Rodamiento delantero registrado** NU 306 · 3306
- **Rodamiento trasero registrado** 3306
- **Observaciones** Doble sello.
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RSA](Documentos-bombas-Vocatus/Multisteel-RSA-catalogo.pdf). Referencias de familia.
- **CAD** CAD pendiente. Confirmar tamaño y serie.

## B16 · Alimentación Mosto Fermentado Hindú

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Mosto
- **Bomba y datos registrados** MULTISTEEL  · RSA 25/205 · GPM: 30.8 · RPM: 3500 · HD [m]: 65 · Ø Imp [mm]: 195
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** LINCOLN · HP: 10 · RPM: 3500
- **Rodamiento delantero registrado** NU 306 · 3306
- **Rodamiento trasero registrado** 3306
- **Observaciones** Doble sello.
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RSA](Documentos-bombas-Vocatus/Multisteel-RSA-catalogo.pdf). Referencias de familia.
- **CAD** CAD pendiente. Confirmar tamaño y serie.

## B17 · Columna Rectificadora

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 1 × 1½–6 AA ST. Succión 1½″, descarga 1″. X/A/B/D/SP 165/343/102/133/95 mm. Bomba sin motor 38 kg. Aplicable si se confirma la asociación de la placa Titan con este TAG. [DXF 2D Titan 1 × 1½–6 ST](Documentos-bombas-Vocatus/Titan-4196-1x1.5-6-AA-ST-esquema.dxf). Cotas de catálogo compartidas con 1 × 1½–8 ST; perfil genérico estimado. CAD editable y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente.

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** DURCO 62392 · GPM: 11 · RPM: 3500 · HD: 31.3
- **Tamaño** 1X1.5-6 ST
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** TITAN 4196
- **Ficha o referencia del fabricante** [Manual de familia Flowserve](https://abset.com/wp-content/uploads/2014/07/71569102-e.pdf)
- **CAD** CAD pendiente. Contrastar marca y serie con la placa.
- **Evidencia de campo** [Foto archivada como B17](../visor-bombas-el-viejo/visor-bombas/public/expediente/B17-placa.jpg). Se distingue Titan. Asociación física pendiente.

## B18 · Columna Purificadora

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 1 × 1½–6 AA ST. Succión 1½″, descarga 1″. X/A/B/D/SP 165/343/102/133/95 mm. Bomba sin motor 38 kg. Aplicable si se confirma la asociación de la placa Titan con este TAG. [DXF 2D Titan 1 × 1½–6 ST](Documentos-bombas-Vocatus/Titan-4196-1x1.5-6-AA-ST-esquema.dxf). Cotas de catálogo compartidas con 1 × 1½–8 ST; perfil genérico estimado. CAD editable y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente.

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** DURCO 62392 · GPM: 11 · RPM: 3500 · HD: 31.3
- **Motor** BALDOR  · X1906M34760 · HP: 5.5 · RPM: 3520
- **Ficha o referencia del fabricante** [Manual de familia Flowserve](https://abset.com/wp-content/uploads/2014/07/71569102-e.pdf)
- **CAD** CAD pendiente. Contrastar marca y serie con la placa.
- **Evidencia de campo** [Foto archivada como B18](../visor-bombas-el-viejo/visor-bombas/public/expediente/B18-placa.jpg). Se distingue Titan. Asociación física pendiente.

## B19 · Columna Mosto

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Mosto
- **Bomba y datos registrados** DURCO 62392 · GPM: 11 · RPM: 3500 · HD: 31.3
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Contraste de placa para selección y sello** Se leen 2,5 m³/h (≈11 US GPM), 31,3 m y 3.500 rpm. El valor 139 parece corresponder al campo de diámetro de impulsor; confirmar unidad y lectura antes de seleccionar curva. La línea de sello contiene «C/SIC (CARTEX)», que apunta a un cartucho Cartex. Cotejar el sello instalado con la placa y el registro de Tipos 1/21 antes de pedir repuestos o usar el DXF Tipo 21. [Foto de placa](../visor-bombas-el-viejo/visor-bombas/public/expediente/B19-placa2.jpg) · [Catálogo EagleBurgmann Cartex](https://media.eagleburgmann.com/literature-competences-products-solutions/division-mechanical-seals/products/main-catalog/catalog-mechanical-seals-magnetic-couplings).
- **Dimensiones candidatas del sello Tipo 21** La fila John Crane de 1⅜″ indica D1 de 1,375″ (eje o camisa), D3 de 2,062″ (exterior del sello), D4 de 2,312″ (alesaje mínimo) y L3 de 1,125″ (longitud de trabajo). Verificar si la unidad lleva Tipo 1 o Tipo 21, geometría del asiento y materiales de caras y elastómero. [Ficha dimensional John Crane Tipo 21](https://www.johncrane.com/media/505hkafe/td-21-4pg-bw-oct2015_3rdfeb.pdf). [DXF de cotejo del sello](Documentos-bombas-Vocatus/B19-John-Crane-Tipo21-envolvente-candidata.dxf), vista axial con tres diámetros de referencia.
- **Motor** BALDOR  · F1906202004 · HP: 5 · RPM: 3470
- **Acople o elastómero** Amortiguador LoveJoy L-100. La ficha Lovejoy L100 indica diámetro exterior de 2,54 pulgadas (64,5 mm) y diámetro interior máximo de cubo de 1,375 pulgadas (34,9 mm). Este máximo es un límite de catálogo. Para seleccionar el cubo y el elastómero de B19, confirmar el diámetro y chavetero de ambos ejes y el material del elemento. [Ficha Lovejoy tipo L](https://www.lovejoy-inc.com/products/jaw-type-couplings/l-type-standard-jaw-coupling/) · [Tabla dimensional](https://www.lovejoy-inc.com/wp-content/uploads/2025/12/jaw-section-2025-jw21kept.pdf).
- **Ficha o referencia del fabricante** [Manual de familia Flowserve](https://abset.com/wp-content/uploads/2014/07/71569102-e.pdf)
- **Placa archivada** Durco 1K1.5 × 1 LF-82, código 62392 y altura 31,3 m legibles. La coincidencia de código y altura respalda su asociación con B19. [Foto de placa](../visor-bombas-el-viejo/visor-bombas/public/expediente/B19-placa2.jpg).
- **Mapa hidráulico Durco a 60 Hz** El folleto Flowserve PS-10-13 identifica con el número 5 la envolvente de selección 1½ × 1 LF-8 a 3.500 rpm. Sirve para ubicar la familia de bajo caudal. La curva de recorte y el NPSHr para la unidad 62392 siguen pendientes. [Folleto Flowserve PS-10-13, copia pública](https://www.scribd.com/document/202409319/Durco-M3-ANSI-ps-10-13-e1).
- **Hoja de datos de referencia** [Selección Flowserve 1K1.5x1LF-82 M3 LF](https://www.lcec.com/objects/catalog/product/extras/114935_2.pdf), para otro servicio. Identifica la curva MIII7065V y un impulsor de 5,56 pulgadas para esa selección. Pendiente recuperar la selección de B19.
- **Plano dimensional de referencia** [Plano Flowserve 1K1.5x1LF-82 M3 LF](https://www.lcec.com/objects/catalog/product/extras/109667_1.pdf). El conjunto dibujado usa bridas ANSI clase 150 de cara plana, succión 1½″ y descarga 1″. Motor, bancada, clase de bridas y demás opciones deben cotejarse con B19. [DXF editable de bridas candidatas](Documentos-bombas-Vocatus/B19-Durco-LF82-bridas-referencia.dxf). Patrones según [tabla Texas Flange clase 150](https://www.texasflange.com/product/class-150/). CAD del conjunto pendiente.

**Revisión 2026-11-09 · B17–B21.** Durco Mark 3 y Titan 4196 cumplen ASME B73.1, y 1K1.5×1-6 es designación AA (curva Durco MIII7030V). Los tamaños de B17–B21 son todos AA, así que el montaje (patas, D = 133 mm, eje de acople ⅞″) es igual sea Durco o Titan. Se vinculan al [DXF ST/AA](Documentos-bombas-Vocatus/Titan-4196-patas-y-extremo-eje-B73.dxf). Los repuestos internos dependen de la marca de cada placa. [Tabla Durco](Durco-Mark3-62391-62392-tabla-piezas-y-pendientes.md).

**Despiece Flowserve Lo-Flo de referencia.** La sección 8.4 del manual muestra el corte hidráulico Lo-Flo del **Grupo 2** e identifica carcasa (1100) y tapa (1220). La sección 8.3 de la misma página corresponde a Sealmatic y tiene una lista separada. La placa 1K identifica **Grupo 1** y soporte Mark 3 según la nomenclatura de Flowserve. El corte Lo-Flo Grupo 2 queda como referencia visual y el despiece de repuestos debe buscarse para Grupo 1. [Nomenclatura Flowserve, p. 12](Documentos-bombas-Vocatus/Durco-Mark3-manual.pdf#page=12). [Manual Flowserve 71569102, p. 66](Documentos-bombas-Vocatus/Durco-Mark3-manual.pdf#page=66).

**Despiece del soporte Mark 3 Grupo 1.** La sección 8.1 identifica eje **2100**, adaptador **1340**, carcasa de rodamientos **3200**, portarrodamientos **3240**, rodamientos interior **3011** y exterior **3013**, retenes **4310.1/4310.2** y chaveta **6700**. Flowserve ilustra también una disposición dúplex opcional. Usar este corte para identificar el soporte Grupo 1; el conjunto hidráulico Lo-Flo y el sello Cartex requieren cotejo por serie. Los números indican posiciones de dibujo. [Corte y lista Flowserve Grupo 1, p. 64](Documentos-bombas-Vocatus/Durco-Mark3-manual.pdf#page=64).


**Rodamientos de catálogo para Grupo 1.** En la ejecución abierta para baño o niebla de aceite, Flowserve indica **6207-C3** interior (posición 3011) y **5306-AC3 o 3306-AC3** exterior (posición 3013), con alternativa dúplex **7306-BECBY**. El manual lista variantes blindadas y selladas para otras lubricaciones. La figura 6.30 da cota A de **68 mm** para el eje estándar y **61 mm** para el eje dúplex. Confirmar lubricación y ejecución instalada antes de seleccionar repuestos o aplicar la cota. [Manual Flowserve, figuras 6.29–6.30, p. 56](Documentos-bombas-Vocatus/Durco-Mark3-manual.pdf#page=56).

**Ajustes del soporte Grupo 1 para cotejo dimensional.** Valores de las figuras 6.19 y 6.20 de Flowserve, en milímetros. IB indica el lado interior y OB el exterior.

| Interfaz | Diámetro en mm |
|---|---:|
| Asiento del rodamiento IB en el eje | 35,004–35,014 |
| Agujero del rodamiento IB | 34,989–35,000 |
| Asiento del rodamiento OB en el eje | 30,003–30,013 |
| Agujero del rodamiento OB | 29,990–30,000 |
| Alojamiento IB y portarrodamientos OB | 71,999–72,017 |

Estas cotas delimitan los ajustes del soporte de catálogo. [DXF de asientos y posición Grupo 1](Documentos-bombas-Vocatus/B19-Durco-Grupo1-asientos-y-posicion.dxf), cotas parciales de referencia. Para dibujar el eje completo de la 62392 faltan las longitudes y perfiles de hombros, extremo de acople, zona del sello y fijación del impulsor. [Manual Flowserve, p. 52](Documentos-bombas-Vocatus/Durco-Mark3-manual.pdf#page=52).


## B20 · Tanque Condensados

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 1 × 1½–6 AA ST. Succión 1½″, descarga 1″. X/A/B/D/SP 165/343/102/133/95 mm. Bomba sin motor 38 kg. Aplicable si se confirma la asociación de la placa Titan con este TAG. [DXF 2D Titan 1 × 1½–6 ST](Documentos-bombas-Vocatus/Titan-4196-1x1.5-6-AA-ST-esquema.dxf). Cotas de catálogo compartidas con 1 × 1½–8 ST; perfil genérico estimado. CAD editable y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente.

**Contraste de placa** La segunda foto archivada muestra Titan 4196, tamaño 1 × 1½–6 ST. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B20-placa2.jpg) · [Manual Titan, corte ST en pág. 42](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Asociación con el TAG pendiente.

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Agua
- **Bomba y datos registrados** DURCO 62392 · GPM: 8.8 · RPM: 3500 · HD: 40.1
- **Motor** BALDOR  · F1906201994 · HP: 5 · RPM: 3470
- **Acople o elastómero** Amortiguador LoveJoy L-101
- **Ficha o referencia del fabricante** [Manual de familia Flowserve](https://abset.com/wp-content/uploads/2014/07/71569102-e.pdf)
- **CAD** CAD pendiente. Contrastar marca y serie con la placa.
- **Evidencia de campo** [Foto archivada como B20](../visor-bombas-el-viejo/visor-bombas/public/expediente/B20-placa.jpg). Se distingue Titan. Asociación física pendiente.

## B21 · Tanque Reflujos Rectificadora

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** Agua / Alcohol
- **Bomba y datos registrados** DURCO 62391 · GPM: 16.2 · RPM: 3500 · HD: 48.7
- **Motor** BALDOR  · X1906M34759 · HP: 5.5 · RPM: 3520
- **Ficha o referencia del fabricante** [Manual de familia Flowserve](https://abset.com/wp-content/uploads/2014/07/71569102-e.pdf)
- **Modelo candidato por placa** La [segunda foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B21-placa2.jpg) indica Titan 4196, lubricación por aceite y lectura probable 1 × 1½–8 ST. La serie requiere una foto más nítida. Confirmar qué placa corresponde a la bomba instalada, dado que el inventario indica Durco 62391.
- **Ficha y CAD de la variante candidata** [Catálogo Titan, plano dimensional en p. 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6) · [DXF 2D reconstruido](Documentos-bombas-Vocatus/B21-Titan-4196-1x1.5-8-ST-candidata.dxf). Cotas compartidas con el tamaño 1 × 1½–6 ST. Contorno estimado. Pendientes hoja de datos por serie y plano de la bancada instalada.
- **Evidencia de campo** [Foto archivada como B21](../visor-bombas-el-viejo/visor-bombas/public/expediente/B21-placa.jpg). Se distingue Titan. Asociación física pendiente.

## B22 · Tanque lavados de Aceite

**Contraste de placa** La placa parece indicar Hidromac 2196, 1 × 1½–8 LF STO, impulsor Ø200 mm, 1.750 rpm y 21 m de altura. El número de serie parece 220638-2. El Excel marca SIN USO; la presencia y asociación del equipo quedan por comprobar. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B22-placa.jpg). Asociación y modelo pendientes.

**Cruce de la foto con B26.** En la placa girada y ampliada, el campo de caudal se lee probablemente **3 GPM** y el de serie **220638-2**. Ese caudal, el Ø200 mm, las 1.750 rpm y los 21 m coinciden con B26, que registra Hidromac 2196 STO en un servicio de nombre casi idéntico, en otra área. B22 figura SIN USO. El grabado LF STO refuerza la hipótesis de que la placa archivada como B22 corresponde a B26. La toma de conjunto archivada con B22 no permite leer el TAG. Mantener **220638-2 como serie candidata de B26** para buscar la selección LF AA-STO y el plano, con atribución pendiente de una toma que vincule la placa al ramal correcto. [Comparar B26](#b26--tanque-lavados-de-aceite).

**Área** 2. DESTILACIÓN PLANTA PRAJ

- **Líquido o estado** SIN USO
- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.
- **Ficha y CAD candidatos por placa** [Catálogo Hidromac 2196, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8) · [DXF de interfaz STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Consultar vista STO solo si se verifica el TAG y la lectura. Hoja de datos por serie y CAD de conjunto pendientes.

## B23 · Tanque Producción UQ

**Datos visibles en placa Hidromac** 2196, 1 × 1½–8 STO, 60 GPM, 1.750 rpm, impulsor 174 mm. El Excel asigna LF a B23; el TAG de la foto queda por cotejar. [Foto archivada](../visor-bombas-el-viejo/visor-bombas/public/expediente/B23-placa.jpg)

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 198 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD de interfaz candidato por foto** [DXF STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf), vista STO. La foto muestra 60 GPM e impulsor Ø174 mm; el inventario de B23 registra 8 GPM y Ø198 mm. Confirmar la asociación antes de aplicar las cotas. Hoja de datos por serie y CAD de conjunto pendientes.

## B24 · Tanque producción FW & RW

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 60 · RPM: 1750 · HD [m]: 12.2 · Ø Imp [mm]: 174 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5X8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** ES2-R
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B25 · Tanque producción FW & RW

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Datos visibles en placa Hidromac** 2196, 1 × 1½–8 LF. El Excel asigna STO a B25; el TAG de la foto queda por cotejar. [Foto archivada](../visor-bombas-el-viejo/visor-bombas/public/expediente/B25-placa.jpg)

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 60 · RPM: 1750 · HD [m]: 12.2 · Ø Imp [mm]: 174 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5X8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** ES2-R
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B26 · Tanque Lavados de aceite

**Hidráulica LF candidata.** La foto archivada como B22 coincide con el impulsor Ø200 mm, 1.750 rpm y 21 m de B26 y muestra LF STO. Hasta cotejar la serie en campo, conservar ambas entradas y usar como referencia candidata el [DXF de bridas LF AA clase 150 RF](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf), sujeto a confirmar la clase de brida. La gráfica Hidromac LF a 1.750 rpm incluye los diámetros vecinos Ø192 y Ø205 mm. Falta cotejar el punto para Ø200 mm y obtener la selección por serie. [Foto archivada](../visor-bombas-el-viejo/visor-bombas/public/expediente/B22-placa.jpg).

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 3 · RPM: 1750 · HD [m]: 21 · Ø Imp [mm]: 200 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG ·  NBR17094-1 · HP: 1.1 · RPM: 1745
- **Rodamiento delantero registrado** 6205-ZZ
- **Rodamiento trasero registrado** 6204-ZZ
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B27 · Carga Batch

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 200 · Ø Máx [mm]: 215
- **Tamaño** 3X4X8G MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG · HP: 7.5 · RPM: 1765
- **Acople o elastómero** ES3-R.
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B28 · Carga Batch

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 200 · Ø Máx [mm]: 215
- **Tamaño** 3X4X8G MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG · HP: 7.5 · RPM: 1765
- **Acople o elastómero** ES3-R.
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B29 · LW hacia Tanque Millonario

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 290 · Ø Máx [mm]: 330
- **Tamaño** 1.5X3-18 MTO
- **Variante hidráulica candidata** Hidromac 2196 **1½ × 3–13 A20 MTO**. La curva de fábrica a 1.750 rpm incluye Ø330 mm como mayor recorte graficado, igual al máximo registrado. El Ø290 mm del inventario queda entre las líneas Ø280 y Ø305 mm. El número 18 del Excel también coincide con la página impresa de la gráfica, pero su origen queda sin verificar. Conservar el tamaño de inventario hasta cotejar placa o plano por serie. [Catálogo Hidromac–Malmepi, sección VIII, p. impresa 18](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG · 00518XT3E254T · HP: 15 · RPM: 1770
- **Acople o elastómero** ES5-R.
- **Rodamiento delantero registrado** 6309-2RS-C3
- **Rodamiento trasero registrado** 6209-2RS-C3
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

**Cotas para cotejar la A20 candidata de B29.** Los planos A20 de otros fabricantes coinciden en succión 3″, descarga 1½″ y cotas X/A/B/SP de 10½/19½/4/3¾ pulgadas. La cota D difiere: Investa MTR/LTR indica 8¼″ y PumpWorks 1196LF Grupo 3 indica 10″. Los valores sirven como referencia para el levantamiento de B29. Para reconstruir el conjunto Hidromac, falta verificar la altura de eje, los anclajes y las caras de brida de la unidad. [Plano Investa, tabla A20](https://investapumps.com/pdf/ANSI_Pump-Brochure.pdf) · [Plano PumpWorks, tabla A20 LF](https://www.pumpworks.com/wp-content/uploads/2017/04/PWI-PWA-LF-1.pdf).

## B30 · Tanque LW1

**Contraste de placa** La placa archivada parece indicar 3 × 4–8G MTO, frente a 1 × 1½–8 LF en el Excel. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B30-placa.jpg). El tamaño de placa también figura en B36. Cotejar serie y TAG en campo.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 198 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** ES2-R.
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD candidato por foto** [Interfaz MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Eje en el acople Ø29 mm, proyección 213 mm y separación de rodamientos 171 mm según [catálogo, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Aplicar solo si se confirma la placa para B30. Pendientes hoja de datos y CAD de conjunto.

## B31 · Tanque LW2

**Datos visibles en placa Hidromac** 2196, 1 × 1½–8 LF, serie 210771-5. [Foto archivada](../visor-bombas-el-viejo/visor-bombas/public/expediente/B31-placa.jpg)

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 198 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Acople o elastómero** ES2-R.
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **Hoja de datos por unidad** Pendiente. Identificador para recuperar la configuración de fábrica: Hidromac 2196 1 × 1½–8 LF, serie 210771-5.
- **CAD** Pendiente plano dimensional correspondiente a la serie y confirmación del grupo de soporte. El diámetro de impulsor registrado es Ø198 mm.
- **CAD parcial de bridas** [DXF compartido Hidromac 2196 LF 1 × 1½–8 AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf). Patrón candidato ANSI clase 150 RF. Verificar el marcado de clase y la orientación en la bomba instalada.

## B32 · Cabezas & Colas

**Datos visibles en placa Hidromac** 2196, 1 × 1½–8 LF, serie 210771-2. [Foto archivada](../visor-bombas-el-viejo/visor-bombas/public/expediente/B32-placa.jpg)

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 198 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **Hoja de datos por unidad** Pendiente. Identificador para recuperar la configuración de fábrica: Hidromac 2196 1 × 1½–8 LF, serie 210771-2.
- **CAD** Pendiente plano dimensional correspondiente a la serie y confirmación del grupo de soporte. El diámetro de impulsor registrado es Ø198 mm.
- **CAD parcial de bridas** [DXF compartido Hidromac 2196 LF 1 × 1½–8 AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf). Patrón candidato ANSI clase 150 RF. Verificar el marcado de clase y la orientación en la bomba instalada.

## B33 · Cabezas & Colas

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 21.3 · Ø Imp [mm]: 198 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.
- **CAD parcial de bridas** [DXF compartido Hidromac 2196 LF 1 × 1½–8 AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf). Patrón candidato ANSI clase 150 RF. Verificar el marcado de clase y la orientación en la bomba instalada.

## B34 · Despacho DUSA

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 200 · Ø Máx [mm]: 215
- **Tamaño** 3X4X8G MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 7.5 · RPM: 1765
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B35 · Despacho DUSA

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 200 · Ø Máx [mm]: 215
- **Tamaño** 3X4X8G MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 7.5 · RPM: 1765
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B36 · Almacén HO & UQ

**Montaje visible y cotejo pendiente.** Las fotos de conjunto archivadas como B36 muestran bombas horizontales en fila, con succión axial desde el lado del muro, descarga vertical, guarda de acoplamiento y base metálica sobre un pedestal de concreto. La cubierta rojiza del motor es un elemento separado. En esas vistas no se lee la serie ni se distingue el TAG. La auditoría fotográfica de Libro1 aporta una asociación parcial para la primera vista y ubica la segunda en el grupo B34–B36, sin individualizarla. Para vincular el CAD a B36, identificar primero el ramal de Almacén HO & UQ en una toma que incluya la placa del soporte. Luego levantar por separado el patrón de anclajes de la base, el largo y ancho del pedestal, el patrón de pernos de cada brida y la altura del eje desde la cara superior de la base metálica. [Primera vista](../visor-bombas-el-viejo/visor-bombas/public/expediente/B36-bomba.jpg) · [Vista de la fila](../visor-bombas-el-viejo/visor-bombas/public/expediente/B36-bomba2.jpg) · [Auditoría de fotos](../visor-bombas-el-viejo/00-Proyecto/auditorias/2026-10-26/clasificacion-fotos-revisada.json).

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Curva Hidromac por tamaño** [Catálogo histórico, sección VIII](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf), página impresa 10, 3 × 4–8G A70 MTO, cinco álabes, 1.750 y 3.500 rpm. Diámetro instalado pendiente. Copia indexada; descarga directa no disponible.

**Cotejo de placas archivadas como B36.** Las dos fotos de soporte muestran Hidromac 2196, 3 × 4–8G MTO I, lubricación por aceite, con series distintas: **210775-3** y **220105-2**. La segunda coincide con la foto de campo 110953. La asociación de una de ellas a B36 requiere una toma de conjunto que muestre el TAG o el trazado de tubería hacia Almacén HO & UQ. [Placa 210775-3](../visor-bombas-el-viejo/visor-bombas/public/expediente/B36-placa.jpg) · [Placa 220105-2](../visor-bombas-el-viejo/visor-bombas/public/fotos/20261007_110953.jpg).

**Placas adicionales del grupo A70 · B27–B28 y B34–B36.** La placa hidráulica **210775-2** confirma 2196 A70, 3 × 4–8G MTO I, 200 GPM, 15,2 m, 1.750 rpm, impulsor Ø200 mm y máximo Ø215 mm. Coincide con el punto de inventario de los cinco TAG del grupo, por lo que la serie queda sin asignación individual. La placa de soporte **220105-1** confirma el mismo tamaño y lubricación por aceite, con recorte y punto de servicio por verificar. El gráfico de fábrica a 1.750 rpm acota Ø200 mm entre Ø191 y Ø205 mm. Queda pendiente verificar la altura a 200 GPM sobre el gráfico y obtener la selección y el plano por serie. [Placa hidráulica 210775-2](../visor-bombas-el-viejo/visor-bombas/public/fotos/20261007_110805.jpg) · [Placa de soporte 220105-1](../visor-bombas-el-viejo/visor-bombas/public/fotos/20261007_111014.jpg) · [Curvas Hidromac–Malmepi, sección VIII, pág. impresa 10](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 15.2 · Ø Imp [mm]: 200 · Ø Máx [mm]: 215
- **Tamaño** 3X4X8G MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 7.5 · RPM: 1765
- **Rodamiento delantero registrado** 6308-2RS
- **Rodamiento trasero registrado** 6207-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B37 · Reproceso DUSA

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 15.24 · Ø Imp [mm]: 175 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.
- **CAD parcial de bridas** [DXF compartido Hidromac 2196 LF 1 × 1½–8 AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf). Patrón candidato ANSI clase 150 RF. Verificar el marcado de clase y la orientación en la bomba instalada.

## B38 · Tanque Producción HO

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 8 · RPM: 1750 · HD [m]: 15.24 · Ø Imp [mm]: 175 · Ø Máx [mm]: 205
- **Tamaño** 1X1.5-8 LF
- **Motor** WEG · 00218XT3E145T · HP: 2 · RPM: 1750
- **Rodamiento delantero registrado** 6205-2RS
- **Rodamiento trasero registrado** 6204-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **Evidencia de placa** La ampliación de la placa hidráulica permite proponer 8 GPM, tamaño 1 × 1½–8 LF y diámetros de impulsor instalado y máximo de 175 y 205 mm, respectivamente. Son lecturas probables que coinciden con el inventario. El prefijo de serie parece 210771 y el sufijo sigue sin lectura fiable. Las fotos de campo 210771-1 y 210771-3 muestran placas de soporte, por lo que hace falta vincular físicamente una de ellas con esta placa hidráulica antes de asignarla a B38. [Foto original](../visor-bombas-el-viejo/visor-bombas/public/expediente/B38-placa.jpg).
- **Curva candidata** Si se confirma que el soporte es STO y el impulsor instalado es Ø175 mm, usar la gráfica LF AA-STO a 1.750 rpm, entre las curvas de Ø166 y Ø179 mm. El punto de inventario de 8 US GPM y 15,24 m equivale a 1,82 m³/h y 50 pies. El intervalo de diámetros orienta la selección. La altura sobre la curva y el caudal mínimo admisible siguen por verificar. [Gráfica Hidromac–Malmepi, sección VIII, pág. impresa 40](https://es.scribd.com/document/907766915/Catalogo-Hidromac-2-de-2).
- **Hoja de datos y CAD** Pendientes confirmar serie completa, grupo de soporte y plano dimensional de la unidad.

**Curvas Goulds compartidas · B39–B43.** El catálogo incluye curvas individuales a 3.500 rpm para [15SH06, descarga 1½″, p. 10](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=10) y [02SH06, descarga 2″, p. 13](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=13). La [tabla de recortes, p. 35](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=35) permite cruzar el código del impulsor con su diámetro. Confirmar en campo el tamaño, el recorte y el punto de servicio para generar la hoja de selección. B41 tiene una placa Hidromac candidata.

**Recortes Goulds para elegir la curva de B39–B43.** Diámetros nominales en pulgadas, transcritos de la tabla del grupo S. La misma letra identifica diámetros distintos según el tamaño hidráulico.

| Código | 15SH06 | 02SH06 |
|---|---:|---:|
| A | 6¾ | 6⁹⁄₁₆ |
| B | 6⅜ | 6³⁄₁₆ |
| C | 6¹⁄₁₆ | 5¹³⁄₁₆ |
| D | 5⅝ | 5½ |
| E | 5⁵⁄₁₆ | 5⅛ |
| F | 4¹¹⁄₁₆ | 4¹³⁄₁₆ |
| G | 4⅜ | 4⁷⁄₁₆ |
| H | 4³⁄₁₆ | — |

La referencia 15SH06K6 del inventario identifica el conjunto hidráulico. El recorte se debe verificar en la placa, en el número de pieza del impulsor o mediante medición. [Tabla Goulds, p. 35](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=35).


**Plano Goulds de bomba sin motor · B39–B43.** Para ejecución e-SH con soporte independiente, la página 55 muestra eje de acople Ø1,124–1,125″, chavetero ⅛ × ¼″, cuatro orificios Ø7⁄16″ y cota X de 6⅜″ para 15SH06 o 7⅛″ para 02SH06. Ambas filas indican 57 lb. Este plano corresponde a la versión con soporte independiente. Verificar la ejecución instalada antes de usarlo junto al DXF comparativo para bastidor 213/215. [Plano Goulds e-SH, p. 55](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf#page=55). [DXF candidato del patrón de anclaje](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-anclaje-soporte.dxf): 5 × 5½ pulgadas entre centros.
- **CAD parcial de bridas** [DXF compartido Hidromac 2196 LF 1 × 1½–8 AA](Documentos-bombas-Vocatus/Hidromac-2196-LF-AA-bridas-150RF-referencia.dxf). Patrón candidato ANSI clase 150 RF. Verificar el marcado de clase y la orientación en la bomba instalada.

## B39 · Tanque Producción Diaria Hindú

**Revisión 2026-11-09 · Goulds B39–B43.** Según la guía de kits PeSHKITRF, 15SH06K6 es el kit de extremo de bomba 1½ × 2½–6 (el de 2 × 2½–6 es 02SH06K6), así que el Excel tiene código y modelo cruzados: hay que medir la brida de descarga. Los rodamientos 6309/6206 son del motor JM. Números de pedido: [tabla Goulds](Goulds-eSH-15SH06-tabla-piezas-y-pendientes.md).


**CAD comparativo Goulds** [DXF de las dos variantes candidatas](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-comparacion.dxf). Cotas L de catálogo para bastidor 213/215 y contornos esquemáticos. Asociación al equipo pendiente de confirmar.

**Comparación dimensional Goulds** [Ficha e-SH, pág. impresa 53](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf). Ambos tamaños tienen succión de 2½″. El 15SH06 tiene descarga de 1½″ y cota L de 11⅜″ con bastidor 213/215. El 02SH06 tiene descarga de 2″ y L de 12⅛″. Verificar placa y descarga de la bomba antes de seleccionar hoja de datos y CAD. [Guía Goulds PeSHKITRF](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/z/Goulds-e-SH-Pump-Kit-Reference-Guide-PeSHKITRF_021422.pdf): 15SH06K6 identifica el conjunto hidráulico de 1½ × 2½–6; el impulsor tiene su propio número de pedido. No identifica el impulsor instalado. Confirmar código de la bomba completa.

**Datos y repuestos de catálogo** [Despiece e-SH y números de repuesto](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf). 15SH06 corresponde a 1½ × 2½–6 y 02SH06 a 2 × 2½–6. Cotejar el tamaño antes de escoger la columna.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** GOULDS · Cat: 15SH06K6 · #Mod: 2X2 1/2-6-2P
- **Tamaño** 2X2 1/2-6
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/4"
- **Motor** US Motors · Cat: XJ7P1BM Mod: FL62 · HP: 7.5 · RPM: 3510
- **Rodamiento delantero registrado** 6309-2Z-J/C3
- **Rodamiento trasero registrado** 6206-2Z-J/C3
- **Ficha o referencia del fabricante** [Ficha e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- **CAD** CAD pendiente. Cotejar 15SH06K6 y el tamaño de placa.

## B40 · Tanque Blender

**CAD comparativo Goulds** [DXF de las dos variantes candidatas](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-comparacion.dxf). Cotas L de catálogo para bastidor 213/215 y contornos esquemáticos. Asociación al equipo pendiente de confirmar.

**Comparación dimensional Goulds** [Ficha e-SH, pág. impresa 53](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf). Ambos tamaños tienen succión de 2½″. El 15SH06 tiene descarga de 1½″ y cota L de 11⅜″ con bastidor 213/215. El 02SH06 tiene descarga de 2″ y L de 12⅛″. Verificar placa y descarga de la bomba antes de seleccionar hoja de datos y CAD. [Guía Goulds PeSHKITRF](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/z/Goulds-e-SH-Pump-Kit-Reference-Guide-PeSHKITRF_021422.pdf): 15SH06K6 identifica el conjunto hidráulico de 1½ × 2½–6; el impulsor tiene su propio número de pedido. No identifica el impulsor instalado. Confirmar código de la bomba completa.

**Datos y repuestos de catálogo** [Despiece e-SH y números de repuesto](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf). 15SH06 corresponde a 1½ × 2½–6 y 02SH06 a 2 × 2½–6. Cotejar el tamaño antes de escoger la columna.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** GOULDS · Cat: 15SH06K6 · #Mod: 2X2 1/2-6-2P
- **Tamaño** 2X2 1/2-6
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/4"
- **Motor** US Motors · Cat: XJ7P1BM Mod: FL62 · HP: 7.5 · RPM: 3510
- **Rodamiento delantero registrado** 6309-2Z-J/C3
- **Rodamiento trasero registrado** 6206-2Z-J/C3
- **Ficha o referencia del fabricante** [Ficha e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- **CAD** CAD pendiente. Cotejar 15SH06K6 y el tamaño de placa.

## B41 · Tanque Reproceso & Técnico

**CAD comparativo Goulds** [DXF de las dos variantes candidatas](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-comparacion.dxf). Cotas L de catálogo para bastidor 213/215 y contornos esquemáticos. Asociación al equipo pendiente de confirmar.

**Comparación dimensional Goulds** [Ficha e-SH, pág. impresa 53](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf). Ambos tamaños tienen succión de 2½″. El 15SH06 tiene descarga de 1½″ y cota L de 11⅜″ con bastidor 213/215. El 02SH06 tiene descarga de 2″ y L de 12⅛″. Verificar placa y descarga de la bomba antes de seleccionar hoja de datos y CAD. [Guía Goulds PeSHKITRF](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/z/Goulds-e-SH-Pump-Kit-Reference-Guide-PeSHKITRF_021422.pdf): 15SH06K6 identifica el conjunto hidráulico de 1½ × 2½–6; el impulsor tiene su propio número de pedido. No identifica el impulsor instalado. Confirmar código de la bomba completa.

**Datos y repuestos de catálogo** [Despiece e-SH y números de repuesto](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf). 15SH06 corresponde a 1½ × 2½–6 y 02SH06 a 2 × 2½–6. Cotejar el tamaño antes de escoger la columna.

**Contraste de placa** La foto archivada muestra una placa Hidromac, mientras el Excel registra Goulds. La lectura probable es 2196 LF a 1.750 rpm, con diámetro máximo marcado de 205 mm; el tamaño completo y la serie requieren confirmación. Comparar con las placas LF de B31/B32/B38 antes de atribuirla a B41. El DXF Goulds queda vinculado como candidato del inventario. [Foto](../visor-bombas-el-viejo/visor-bombas/public/expediente/B41-placa.jpg). Asociación pendiente.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** GOULDS · Cat: 15SH06K6 · #Mod: 2X2 1/2-6-2P
- **Tamaño** 2X2 1/2-6
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/4"
- **Motor** US Motors · Cat: XJ7P1BM Mod: FL62 · HP: 7.5 · RPM: 3510
- **Rodamiento delantero registrado** 6309-2Z-J/C3
- **Rodamiento trasero registrado** 6206-2Z-J/C3
- **Ficha o referencia del fabricante** [Ficha e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- **CAD** CAD pendiente. Cotejar 15SH06K6 y el tamaño de placa.

## B42 · TQ Aguardiente

**CAD comparativo Goulds** [DXF de las dos variantes candidatas](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-comparacion.dxf). Cotas L de catálogo para bastidor 213/215 y contornos esquemáticos. Asociación al equipo pendiente de confirmar.

**Comparación dimensional Goulds** [Ficha e-SH, pág. impresa 53](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf). Ambos tamaños tienen succión de 2½″. El 15SH06 tiene descarga de 1½″ y cota L de 11⅜″ con bastidor 213/215. El 02SH06 tiene descarga de 2″ y L de 12⅛″. Verificar placa y descarga de la bomba antes de seleccionar hoja de datos y CAD. [Guía Goulds PeSHKITRF](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/z/Goulds-e-SH-Pump-Kit-Reference-Guide-PeSHKITRF_021422.pdf): 15SH06K6 identifica el conjunto hidráulico de 1½ × 2½–6; el impulsor tiene su propio número de pedido. No identifica el impulsor instalado. Confirmar código de la bomba completa.

**Datos y repuestos de catálogo** [Despiece e-SH y números de repuesto](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf). 15SH06 corresponde a 1½ × 2½–6 y 02SH06 a 2 × 2½–6. Cotejar el tamaño antes de escoger la columna.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** GOULDS · Cat: 15SH06K6 · #Mod: 2X2 1/2-6-2P
- **Tamaño** 2X2 1/2-6
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/4"
- **Motor** US Motors · Cat: XJ7P1BM Mod: FL62 · HP: 7.5 · RPM: 3510
- **Rodamiento delantero registrado** 6309-2Z-J/C3
- **Rodamiento trasero registrado** 6206-2Z-J/C3
- **Ficha o referencia del fabricante** [Ficha e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- **CAD** CAD pendiente. Cotejar 15SH06K6 y el tamaño de placa.

## B43 · Despacho Hindú

**CAD comparativo Goulds** [DXF de las dos variantes candidatas](Documentos-bombas-Vocatus/Goulds-eSH-15SH06-02SH06-comparacion.dxf). Cotas L de catálogo para bastidor 213/215 y contornos esquemáticos. Asociación al equipo pendiente de confirmar.

**Comparación dimensional Goulds** [Ficha e-SH, pág. impresa 53](Documentos-bombas-Vocatus/Goulds-eSH-ficha.pdf). Ambos tamaños tienen succión de 2½″. El 15SH06 tiene descarga de 1½″ y cota L de 11⅜″ con bastidor 213/215. El 02SH06 tiene descarga de 2″ y L de 12⅛″. Verificar placa y descarga de la bomba antes de seleccionar hoja de datos y CAD. [Guía Goulds PeSHKITRF](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/z/Goulds-e-SH-Pump-Kit-Reference-Guide-PeSHKITRF_021422.pdf): 15SH06K6 identifica el conjunto hidráulico de 1½ × 2½–6; el impulsor tiene su propio número de pedido. No identifica el impulsor instalado. Confirmar código de la bomba completa.

**Datos y repuestos de catálogo** [Despiece e-SH y números de repuesto](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/parts/reshsmgr.pdf). 15SH06 corresponde a 1½ × 2½–6 y 02SH06 a 2 × 2½–6. Cotejar el tamaño antes de escoger la columna.

**Área** 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

- **Líquido o estado** Alcohol
- **Bomba y datos registrados** GOULDS · Cat: 15SH06K6 · #Mod: 2X2 1/2-6-2P
- **Tamaño** 2X2 1/2-6
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/4"
- **Motor** US Motors · Cat: XJ7P1BM Mod: FL62 · HP: 7.5 · RPM: 3510
- **Rodamiento delantero registrado** 6309-2Z-J/C3
- **Rodamiento trasero registrado** 6206-2Z-J/C3
- **Ficha o referencia del fabricante** [Ficha e-SH](https://www.xylem.com/siteassets/brand/goulds-water-technology/resources/technical-brochure/besh-r2-web.pdf)
- **CAD** CAD pendiente. Cotejar 15SH06K6 y el tamaño de placa.

**Selección compartida Hidromac AZ 80-315A · B44 y B45.** Para impulsor de 305 mm, el catálogo publica **540 GPM a 48 m** y lista dos opciones monobloque, código **3152 de 30 HP** y **3156 de 40 HP**. La de 40 HP coincide con la potencia inventariada. En eje libre a 1.750 rpm, los códigos **3668 (IIIA)** y **3672 (IVA)** comparten ese punto y las bocas de succión 4″ y descarga 3″. El punto de inventario es 550 GPM a 48 m, aproximadamente 1,9 % por encima del caudal tabulado. El punto de catálogo sirve para cotejar la selección; para escoger el plano y la curva exactos falta confirmar el montaje y el sufijo SMCDV. [Selección monobloque, p. 9](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=9) · [Selección eje libre, p. 12](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=12).


**Curvas Hidromac AZ 80-315A a 1.750 rpm.** La sección II, página impresa 27 del catálogo de 2003 muestra la curva del impulsor Ø305 mm y los recortes Ø286, Ø267, Ø248, Ø229 y Ø210 mm. El manual histórico Hidromac–Malmepi, sección II, página impresa 73, también muestra una curva Ø305 mm, con una serie de recortes distinta. Para B44 y B45, usar Ø305 mm como referencia de cotejo y confirmar la ejecución SMCDV antes de adoptar una curva de selección. [Catálogo Hidromac 2003](https://es.scribd.com/document/484435064/CATALOGO-HIDROMAC-08-07-03-pdf) · [Manual histórico Hidromac–Malmepi](https://formacion-industrial.com/wp-content/uploads/jet-form-builder/093b243be9baaeca14f875efdc2b403f/2022/09/BOMBAS-MALMEDI.pdf).

**Manual de mantenimiento Hidromac AZ · B44 y B45.** El manual de la serie AZ incluye una lista de partes y distingue los anillos de desgaste, la camisa del eje con la parte giratoria del sello, la chaveta y el deflector. Estos componentes se documentan como referencias de familia. Para el despiece de la 80-315A SMCDV quedan pendientes los números de pedido, los materiales y la correspondencia de los rodamientos 6312-C3 y 6212-C3 del inventario con el soporte instalado. [Manual Hidromac AZ](https://www.manualslib.es/manual/520906/Hidromac-Malmedi-Az-Serie.html) · [Desmontaje, p. 5](https://www.manualslib.es/manual/520906/Hidromac-Malmedi-Az-Serie.html?page=5).

**Interfaz de sello para Hidromac AZ · B44 y B45.** El inventario registra Tipo 1 / Tipo 21 de 1½″. Para el John Crane Tipo 21 de ese tamaño, la tabla del fabricante da D1 (eje o camisa) **1,500″**, D3 (exterior del sello) **2,187″**, D4 (alesaje mínimo) **2,437″** y L3 (longitud de trabajo) **1,125″**. Antes de aplicar las cotas, comprobar el tipo instalado, el asiento fijo y los materiales de caras y elastómero. [Ficha dimensional John Crane Tipo 21](https://www.johncrane.com/media/505hkafe/td-21-4pg-bw-oct2015_3rdfeb.pdf).

**Revisión 2026-11-09 · AZ B44–B45.** Con motor WEG aparte y acople Omega, la ejecución es de **eje libre** (3668 IIIA o 3672 IVA), no monobloque. La hoja de datos técnicos AZ (catálogo Equinter) da para IIIA/IVA: eje en el impulsor y en el acople 1¼″, chaveta ¼″, camisa en el sello 1½″ (coincide con el sello 1½″ del inventario), rodamientos **6308** (IIIA) o **6310** (IVA) y entre centros 7¾″ / 7⅝″. Los 6312-C3/6212-C3 del inventario corresponden probablemente al motor WEG 324T; falta cotejar la placa. SM = sello mecánico; «CDV» sigue pendiente. [DXF eje y rodamientos IIIA/IVA](Documentos-bombas-Vocatus/Hidromac-AZ-80-315A-eje-rodamientos-IIIA-IVA.dxf) · [Tabla de piezas AZ](Hidromac-AZ-80-315A-tabla-piezas-y-pendientes.md).

**Patrón de conexiones para cotejo · Hidromac AZ 80-315A.** El catálogo AZ distingue conexiones DIN y ANSI, y la tabla de la 80-315A con brida ANSI indica succión de 4″ y descarga de 3″. Si el marcado confirma ASME B16.5 clase 150, el [DXF de patrones NPS 4 y NPS 3](Documentos-bombas-Vocatus/Titan-4196-A40-bridas-clase150-candidatas.dxf) sirve como plantilla de los círculos de pernos. El archivo está rotulado Titan A40 y sus vistas son independientes. En la AZ deben verificarse clase, orientación y distancia entre caras antes de montar. [Catálogo AZ, p. 12](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=12) · [Tabla de patrones clase 150](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-150/).

## B44 · Agua de dilución

**CAD reconstruido Hidromac AZ** [DXF 2D frontal y laterales para soportes II y IIIA/IVA](Documentos-bombas-Vocatus/Hidromac-AZ-80-315A-esquema.dxf). Cotas X y D de catálogo y contorno estimado en capas separadas. DF depende del soporte. Confirmar variante SMCDV. [Envolvente 3D comparativa DXF](Documentos-bombas-Vocatus/Hidromac-AZ-80-315A-soportes-envolvente-3D.dxf). Perfiles y profundidades estimados. Motor, bancada y perforaciones omitidos.

**Referencia dimensional Hidromac AZ** [Catálogo, pág. 9](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=9) lista 80-315A / 3 × 4 × 12A, código 3156, impulsor 305 mm, 540 GPM, 48 m y 40 HP. El inventario indica 550 GPM. [Conexiones, pág. 12](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=12) de 4″ en succión y 3″ en descarga. [Tabla dimensional, pág. 15](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=15). Sufijo SMCDV y CAD editable pendientes. La tabla de selección de bases da X/Y/Z/DC/D/DD = 216/54/192/214/203/227 mm. DF = 140 mm para soporte II o 165 mm para IIIA/IVA. El catálogo califica estas cotas como estimativas y pide consultar al proveedor para dimensiones de construcción.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua
- **Bomba y datos registrados** HIDROMAC AZ · 3X4X12A SMCDV · GPM: 550 · RPM: 1750 · HD: 48 · Ø Imp [mm]: 305
- **Tamaño** 3X4X12
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/2"
- **Motor** WEG · TE1BF0X0N · HP: 40 · RPM: 1770
- **Acople o elastómero** OMEGA E20
- **Rodamiento delantero registrado** 6312-C3
- **Rodamiento trasero registrado** 6212-C3
- **Ficha o referencia del fabricante** [Catálogo Hidromac](https://equinter.co/wp-content/uploads/2020/01/Cata%CC%81logo-Hidromac.pdf)
- **CAD** CAD pendiente. Confirmar variante SMCDV.

## B45 · Agua de dilución

**CAD reconstruido Hidromac AZ** [DXF 2D frontal y laterales para soportes II y IIIA/IVA](Documentos-bombas-Vocatus/Hidromac-AZ-80-315A-esquema.dxf). Cotas X y D de catálogo y contorno estimado en capas separadas. DF depende del soporte. Confirmar variante SMCDV. [Envolvente 3D comparativa DXF](Documentos-bombas-Vocatus/Hidromac-AZ-80-315A-soportes-envolvente-3D.dxf). Perfiles y profundidades estimados. Motor, bancada y perforaciones omitidos.

**Referencia dimensional Hidromac AZ** [Catálogo, pág. 9](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=9) lista 80-315A / 3 × 4 × 12A, código 3156, impulsor 305 mm, 540 GPM, 48 m y 40 HP. El inventario indica 550 GPM. [Conexiones, pág. 12](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=12) de 4″ en succión y 3″ en descarga. [Tabla dimensional, pág. 15](Documentos-bombas-Vocatus/Hidromac-AZ-catalogo.pdf#page=15). Sufijo SMCDV y CAD editable pendientes. La tabla de selección de bases da X/Y/Z/DC/D/DD = 216/54/192/214/203/227 mm. DF = 140 mm para soporte II o 165 mm para IIIA/IVA. El catálogo califica estas cotas como estimativas y pide consultar al proveedor para dimensiones de construcción.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** AGUA
- **Bomba y datos registrados** HIDROMAC AZ · 3X4X12A SMCDV · GPM: 550 · RPM: 1750 · HD: 48 · Ø Imp [mm]: 305
- **Tamaño** 3X4X12
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.1/2"
- **Motor** WEG · TE1BF0X0N · HP: 40 · RPM: 1770
- **Acople o elastómero** OMEGA E20
- **Rodamiento delantero registrado** 6312-C3
- **Rodamiento trasero registrado** 6212-C3
- **Ficha o referencia del fabricante** [Catálogo Hidromac](https://equinter.co/wp-content/uploads/2020/01/Cata%CC%81logo-Hidromac.pdf)
- **CAD** CAD pendiente. Confirmar variante SMCDV.

## B46 · Pie de Cubas

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 18.3 · Ø Imp [mm]: 205 · Ø Máx [mm]: 205
- **Tamaño** 1.5X3-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG ·  · HP: 3 · RPM: 1760
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B47 · Pie de Cubas

**Datos del soporte 2196** STO: eje en acople Ø22 mm; proyección 156 mm; distancia entre rodamientos 105 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 18.3 · Ø Imp [mm]: 205 · Ø Máx [mm]: 205
- **Tamaño** 1.5X3-8 STO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/8"
- **Motor** WEG ·  · HP: 3 · RPM: 1760
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B48 · Pie de Cubas 3

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua
- **Bomba y datos registrados** MULTISTEEL  · RA65/300 · GPM: 220 · RPM: 1750 · HD [m]: 25 · Ø Imp [mm]: 260
- **Motor** WEG ·  · HP: 7.5 · RPM: 1765
- **Rodamiento delantero registrado** 6308-ZZ
- **Rodamiento trasero registrado** 6207-ZZ
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RA/RT](Documentos-bombas-Vocatus/Multisteel-RA-RT-catalogo.pdf). Referencias de familia.
- **Hoja de datos y CAD** Pendientes por serie. [Comparación por unidad y datos faltantes por pieza](#multisteel-ra-65300--b48-b55-y-b57).

## B49 · Tanque Esterilizador

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Melaza
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 12.1 · Ø Imp [mm]: 178 · Ø Máx [mm]: 211
- **Tamaño** 2X3-8 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 3 · RPM: 1760
- **Acople o elastómero** 3R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B50 · Tanque Esterilizador

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Melaza
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 100 · RPM: 1750 · HD [m]: 12.1 · Ø Imp [mm]: 178 · Ø Máx [mm]: 211
- **Tamaño** 2X3-8 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 3 · RPM: 1760
- **Acople o elastómero** 3R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## Viking LL-124 · Cotas candidatas para B51 y B52

Transcripción de la fila LL-124 del boletín dimensional Viking DD-124-V. Las letras corresponden a las vistas del fabricante. Valores aproximados en pulgadas.

| Cota | Valor | Cota | Valor |
|---|---:|---|---:|
| A | 10,00 | L | 18,56 |
| B | 5,50 | M | 2,25 |
| CP | 23,00 | N | 2,50 |
| CP1 | 26,06 | O | 14,00 |
| D | 7,00 | P | 0,75 |
| E | 4,38 | R | 4,44 |
| F | 4,00 | T | 9,38 |
| G | 0,62 | U | 1,125 |
| H | 0,53 | V | 2,00 |
| W | 5,12 | X / Y | 7,00 / 7,00 |

Bocas de 3 pulgadas, cuatro agujeros de montaje H y chavetero de 0,250 × 0,125 pulgadas. El fabricante contempla ocho orientaciones de carcasa y variantes de largo de eje, que afectan las cotas N y V. [Boletín dimensional Viking DD-124-V](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20DD-124-V.pdf).

Como cotejo del accionamiento, 1.768 rpm de motor requerirían una relación aproximada de 3,4:1 para alcanzar las 520 rpm del punto nominal Viking. Ese cálculo sirve para comparar con la placa del reductor; la relación y velocidad instalada siguen sin verificar.


**Contraste con Hidromac EN.** El catálogo histórico Hidromac sí documenta bombas EN de engranajes con dos piñones y dos ejes. Su tabla dimensional enumera bocas iguales de ½, 1, 1½, 2½ y 4 pulgadas. La tabla revisada carece de una variante 3 × 3 y de la denominación LL-124. Para separar las opciones en campo, fotografiar la placa de la carcasa y registrar el diámetro nominal real de ambas bocas. La evidencia disponible favorece Viking como referencia por código y tamaño, con la marca instalada pendiente. [Catálogo Hidromac, tabla de dimensiones EN](https://es.scribd.com/document/422542785/Catalogo-de-Bombas-Hydromac-pdf).

### Despiece Viking LL-124 con empaquetadura

| Posiciones | Componentes de la vista explotada |
|---|---|
| 1–9 | Retenes exterior e interior, tapas, tuerca y arandela de fijación, rodamiento de bolas, separador y tornillo prisionero |
| 10–16 | Engrasador, tapón, soporte, fijaciones del prensaestopas, prensaestopas, anillos de empaquetadura y buje del soporte |
| 17–19 | Junta, carcasa y conjunto rotor-eje |
| 20–26 | Engranaje conducido, buje, pasador, junta, tapa, fijaciones y engrasador |

La vista corresponde a la LL-124 empacada y sirve como referencia para B51 y B52, que registran cordón de 3/8 pulgadas. Las posiciones identifican piezas en el dibujo. Los números de pedido, materiales y dimensiones del repuesto siguen pendientes de verificar para cada serie. [Manual Viking TSM-124-V, p. 4](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20TSM-124-V.pdf#page=4).


**Material de empaque y versión de catálogo.** La ficha Viking lista grafito/PTFE C-1065 como empaquetadura estándar, mientras el inventario de Vocatus registra cordón de nylon de 3/8 de pulgada. Verificar lo instalado antes de seleccionar material o kit. Las referencias del dibujo son posiciones. Viking lista LL124 en su archivo de modelos históricos y LL124A como su reemplazo de referencia. La documentación dimensional debe cotejarse con la versión original y la orientación instalada. [Manual Viking TSM-124-V, p. 4](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20TSM-124-V.pdf) · [Ficha Viking TDS-124-V](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20TDS-124-V.pdf) · [Archivo Viking](https://www.vikingpump.com/legacy-products).

**Contraste con el catálogo de engranajes Hidromac–Malmepi.** El catálogo histórico publica planos y datos de bombas tipo EN con tamaños de ½, 1, 1½, 2½ y 4 pulgadas, y muestra piñones superior e inferior en el despiece. La tabla EN no ofrece una fila 3 × 3 ni el código LL-124. Para B51/B52 queda abierta la atribución Hidromac del inventario. La placa hidráulica y la disposición del tren de engranajes permitirán decidir si aplicar el plano Viking candidato o buscar otra serie Hidromac. [Catálogo histórico Hidromac, sección de engranajes EN](https://es.scribd.com/document/422542785/Catalogo-de-Bombas-Hydromac-pdf).

## B51 · Tanque Romana

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Melaza
- **Bomba y datos registrados** HDROMAC 220106-2 · LL-124
- **Tamaño** 3X3
- **Sello** Empaquetadura de cordón nylon 3/8"
- **Motor** SEW-EURODRIVE · DRN132S4/FG · KW:5.5 · RPM: 1768
- **Velocidad del accionamiento.** El catálogo SEW a 60 Hz confirma 5,5 kW y 1.768 rpm para DRN132S4. El sufijo /FG designa una ejecución de motor integral suministrada como motor independiente. El código registrado deja sin identificar la transmisión y su relación. Como contraste, para obtener 520 rpm de bomba a partir de 1.768 rpm se necesitaría una relación de 3,40:1 si se usa reducción mecánica. Las 520 rpm pertenecen al punto de catálogo Viking. Para seleccionar el punto de melaza y dimensionar el acoplamiento, obtener la velocidad medida o la placa de la transmisión de cada unidad. [Catálogo SEW a 60 Hz](https://download.sew-eurodrive.com/download/pdf/24772933.pdf) · [Nomenclatura SEW /FG](https://download.sew-eurodrive.com/download/html/33346739/en-EN/1933557684351898373259.html).
- **Acople o elastómero** OMEGA E20. Rexnord lista 10287336 para el elemento E20 estándar de acople corto y 10287352 para el elemento espaciador ES20. Verificar el elemento instalado y los diámetros de cubo antes de asignar el repuesto o el dibujo del acople. [Catálogo Omega 4000, elementos y cubos](https://www.rexnord.com/ContentItems/TechLibrary/Documents/4000_Catalog) · [Ficha del elemento estándar E20](https://www.rexnord.com/products/couplings/elastomeric-coupling-parts-and-kits/elements-flexible/omega-close-coupled-elastomeric-elements/10287336).
- **Ficha candidata** Viking LL-124 de engranajes internos, con dos conexiones ANSI de 3 pulgadas. Coinciden el código LL-124 y el tamaño 3 × 3 del inventario, que atribuye el equipo a Hidromac. Confirmar la marca y la placa de cada bomba; ambos TAG repiten el código 220106-2. [Manual de servicio y despiece Viking TSM-124-V](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20TSM-124-V.pdf).
- **Hoja de datos candidata Viking TDS-124** La fila LL-124 publica 138 GPM (522 L/min) a 520 rpm, 50 psi y 21 cSt, con potencia requerida de 4,48 kW a 50 psi y 8,58 kW a 100 psi bajo las condiciones del catálogo. Para cotejar el servicio de melaza, confirmar rpm de la bomba, presión diferencial, temperatura y viscosidad de operación. [Ficha Viking TDS-124](https://www.vikingpumpcanada.com/sites/default/files/literature/VPC_SERIES%20124_TDS_0.pdf).
- **Plano dimensional candidato** [Viking DD-124-V, fila LL-124](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20DD-124-V.pdf). Cotas aproximadas del fabricante: eje Ø1⅛ pulgadas, cuatro orificios de anclaje Ø0,53 pulgadas y cotas CP/CP1/L/N/V de 23/26,06/18,56/2,5/2 pulgadas. El DXF incorpora las longitudes como referencias independientes y el diámetro H de anclaje. La ubicación de los agujeros requiere el dibujo de montaje o medición. [DXF candidato de eje, chavetero y cotas DD-124-V](Documentos-bombas-Vocatus/B51-B52-Viking-LL124-interfaz-eje-candidata.dxf). Hoja de datos y CAD de conjunto de cada unidad pendientes. Verificar orientación de bocas y rpm a la salida del reductor; las 1.768 rpm del Excel corresponden al motor.

## B52 · Tanque Romana

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Melaza
- **Bomba y datos registrados** HDROMAC 220106-2 · LL-124
- **Tamaño** 3X3
- **Sello** Empaquetadura de cordón nylon 3/8"
- **Motor** SEW-EURODRIVE · DRN132S4/FG · KW:5.5 · RPM: 1768
- **Velocidad del accionamiento.** El catálogo SEW a 60 Hz confirma 5,5 kW y 1.768 rpm para DRN132S4. El sufijo /FG designa una ejecución de motor integral suministrada como motor independiente. El código registrado deja sin identificar la transmisión y su relación. Como contraste, para obtener 520 rpm de bomba a partir de 1.768 rpm se necesitaría una relación de 3,40:1 si se usa reducción mecánica. Las 520 rpm pertenecen al punto de catálogo Viking. Para seleccionar el punto de melaza y dimensionar el acoplamiento, obtener la velocidad medida o la placa de la transmisión de cada unidad. [Catálogo SEW a 60 Hz](https://download.sew-eurodrive.com/download/pdf/24772933.pdf) · [Nomenclatura SEW /FG](https://download.sew-eurodrive.com/download/html/33346739/en-EN/1933557684351898373259.html).
- **Acople o elastómero** OMEGA E20. Rexnord lista 10287336 para el elemento E20 estándar de acople corto y 10287352 para el elemento espaciador ES20. Verificar el elemento instalado y los diámetros de cubo antes de asignar el repuesto o el dibujo del acople. [Catálogo Omega 4000, elementos y cubos](https://www.rexnord.com/ContentItems/TechLibrary/Documents/4000_Catalog) · [Ficha del elemento estándar E20](https://www.rexnord.com/products/couplings/elastomeric-coupling-parts-and-kits/elements-flexible/omega-close-coupled-elastomeric-elements/10287336).
- **Ficha candidata** Viking LL-124 de engranajes internos, con dos conexiones ANSI de 3 pulgadas. Coinciden el código LL-124 y el tamaño 3 × 3 del inventario, que atribuye el equipo a Hidromac. Confirmar la marca y la placa de cada bomba; ambos TAG repiten el código 220106-2. [Manual de servicio y despiece Viking TSM-124-V](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20TSM-124-V.pdf).
- **Hoja de datos candidata Viking TDS-124** La fila LL-124 publica 138 GPM (522 L/min) a 520 rpm, 50 psi y 21 cSt, con potencia requerida de 4,48 kW a 50 psi y 8,58 kW a 100 psi bajo las condiciones del catálogo. Para cotejar el servicio de melaza, confirmar rpm de la bomba, presión diferencial, temperatura y viscosidad de operación. [Ficha Viking TDS-124](https://www.vikingpumpcanada.com/sites/default/files/literature/VPC_SERIES%20124_TDS_0.pdf).
- **Plano dimensional candidato** [Viking DD-124-V, fila LL-124](https://www.vikingpumpcanada.com/sites/default/files/literature/Viking%20-%20DD-124-V.pdf). Cotas aproximadas del fabricante: eje Ø1⅛ pulgadas, cuatro orificios de anclaje Ø0,53 pulgadas y cotas CP/CP1/L/N/V de 23/26,06/18,56/2,5/2 pulgadas. El DXF incorpora las longitudes como referencias independientes y el diámetro H de anclaje. La ubicación de los agujeros requiere el dibujo de montaje o medición. [DXF candidato de eje, chavetero y cotas DD-124-V](Documentos-bombas-Vocatus/B51-B52-Viking-LL124-interfaz-eje-candidata.dxf). Hoja de datos y CAD de conjunto de cada unidad pendientes. Verificar orientación de bocas y rpm a la salida del reductor; las 1.768 rpm del Excel corresponden al motor.

## B53 · Descarga Fermentadores

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 12.2 · Ø Imp [mm]: 166 · Ø Máx [mm]: 205
- **Tamaño** 3X4-7 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 5 · RPM: 1750
- **Acople o elastómero** ES2-R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B54 · Descarga Fermentadores

**Datos del soporte 2196** MTO: eje en acople Ø29 mm; proyección 213 mm; distancia entre rodamientos 171 mm. [Detalles técnicos, pág. 8](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf#page=8). Referencia para el soporte registrado, pendiente de comprobar en el equipo. [DXF de interfaces STO/MTO](Documentos-bombas-Vocatus/Hidromac-2196-STO-MTO-interfaces.dxf). Cotas independientes del eje y soporte. CAD del conjunto pendiente.

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Mosto
- **Bomba y datos registrados** HIDROMAC 2196 · GPM: 200 · RPM: 1750 · HD [m]: 12.2 · Ø Imp [mm]: 166 · Ø Máx [mm]: 205
- **Tamaño** 3X4-7 MTO
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 5 · RPM: 1750
- **Acople o elastómero** ES2-R
- **Rodamiento delantero registrado** 6307-2RS
- **Rodamiento trasero registrado** 6206-2RS
- **Ficha o referencia del fabricante** [Catálogo Hidromac 2196](Documentos-bombas-Vocatus/Hidromac-2196-catalogo.pdf) · [Fuente del PDF](https://bomeq.com.co/assets/catalogos/Catalogo%20-%20HIDROMAC.pdf).
- **CAD** CAD pendiente. Confirmar tamaño, soporte y serie.

## B55 · Tanque agua DM #1

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua
- **Bomba y datos registrados** MULTISTEEL  · RA65/300 · GPM: 110 · RPM: 1750 · HD [m]: 20 · Ø Imp [mm]: 219
- **Motor** SIEMENS · GP100 · RPM: 1759
- **Acople o elastómero** WRAPFLEX 30R.
- **Rodamiento delantero registrado** 6209-ZZ
- **Rodamiento trasero registrado** 6209-ZZ
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RA/RT](Documentos-bombas-Vocatus/Multisteel-RA-RT-catalogo.pdf). Referencias de familia.
- **Hoja de datos y CAD** Pendientes por serie. [Comparación por unidad y datos faltantes por pieza](#multisteel-ra-65300--b48-b55-y-b57).

## B56 · sof water 

**Área** 4. FERMENTACIÓN

- **Líquido o estado** agua
- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

## B57 · Tanque agua DM #2

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua
- **Bomba y datos registrados** MULTISTEEL  · RA65/300 · GPM: 220 · RPM: 1750 · HD [m]: 25 · Ø Imp [mm]: 259
- **Motor** SIEMENS · GP100 · RPM: 1759
- **Acople o elastómero** WRAPFLEX 30R.
- **Rodamiento delantero registrado** 6209-ZZ
- **Rodamiento trasero registrado** 6209-ZZ
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RA/RT](Documentos-bombas-Vocatus/Multisteel-RA-RT-catalogo.pdf). Referencias de familia.
- **Hoja de datos y CAD** Pendientes por serie. [Comparación por unidad y datos faltantes por pieza](#multisteel-ra-65300--b48-b55-y-b57).

## B58 · agua ultrapura

**Área** 4. FERMENTACIÓN

- **Líquido o estado** agua
- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

## B59 · Tanque PF

**CAD candidato ABS SB15-5** [DXF de referencia](Documentos-bombas-Vocatus/ABS-SB-15-5-DIN-referencia-B59.dxf) · [Ficha ABS, pág. PDF 30](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=30). 10 HP a 60 Hz, brida DIN DN50, H1 587 mm, H2 992 mm y 300 mm entre caras. No asignar a B59 hasta verificar placa y discrepancia hidráulica.

**Curva y cotas STAIRS SB 15 a 60 Hz.** La página impresa 30 presenta la curva H–Q de cinco etapas, junto con las gráficas de potencia, eficiencia y NPSH. La tabla dimensional SB 15-5 da H1/H2 de 587/992 mm para DIN y oval, con D1/D2/D3 de 235/197/300 mm y pesos netos de 106,0 kg (DIN) y 104,4 kg (oval). El catálogo STAIRS identifica los 300 mm como D3. La coincidencia dimensional comprobada con el DXF DIN existente es H1/H2. El valor entre caras del DXF se documenta por separado en su referencia ABS. Quedan por cotejar la lectura de la curva STAIRS en 96 GPM y la identificación de la bomba instalada. [Catálogo STAIRS SB/SBI/SBN de 60 Hz](https://stairspumps.pl/wp-content/uploads/2023/02/SBSBISBN_pompy-pionowe-wielostopniowe-in-line_60zH_220518_eng.pdf).

**Interfaz STAIRS ANSI candidata.** Reconstrucción 2D de la brida de 2 pulgadas, 250 lb RF, con diámetro exterior de 165,10 mm y círculo de pernos de 127,00 mm según la pág. impresa 28. El DXF representa el contorno y las referencias de pernos. El catálogo distingue la conexión oval NPT de 2 pulgadas en las etapas 15-1 a 15-5. [DXF de interfaz ANSI](Documentos-bombas-Vocatus/STAIRS-SB15-5-ANSI-NEMA-interfaz-candidata-B59.dxf).

**Ficha dimensional STAIRS SB 15-5 a 60 Hz, candidata.** La tabla NEMA indica motor recomendado de 10 HP, bastidor TEFC 213TC y H1 de 23,07 pulgadas (586,0 mm) para conexiones ANSI y oval. La potencia coincide con el inventario y H1 difiere en cerca de 1 mm del dibujo DIN de ABS. Para elegir el CAD de B59, verificar el patrón de conexión, el bastidor y la placa hidráulica. [Catálogo STAIRS ANSI/NEMA](https://www.stairs.com.tw/wp-content/uploads/2023/06/10.SBSBISBN_Series_NEMA_60Hz.pdf).

**Cotejo de altura SB** [Curva ABS SB 15, pág. PDF 29](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=29). A 96 US GPM la curva de cinco etapas indica aproximadamente 80 m, frente a 25 m registrados. Modelo o punto de operación por cotejar. [Manual del sello STAIRS SB 10/15/20, referencia candidata](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf).

**Contraste de caudal SB** 96 US GPM ≈ 21,8 m³/h, dentro del rango de familia SB 15 (10,5–28 m³/h). [Catálogo ABS, pág. 3](https://absbombas.com/wp-content/uploads/2020/06/CAT%C3%81LOGO-BOMBAS-CENTRIFUGAS-ABS-SERIE-SB-SBI-SBN.pdf#page=3). Compatibilidad de caudal de familia. Fabricante, altura en la curva y sufijo (M) pendientes.

**Despiece del sello STAIRS SB 10/15/20, referencia candidata.** El manual numera 1 camisa de eje, 2 anillo giratorio, 3 anillo fijo, 4 base del sello, 5 resorte de compresión, 6 funda, 7 junta tórica de eje AS568-114, 8 junta de la funda AS568-211, 9 junta del anillo fijo AS568-120, 10 junta de la base AS568-123 y 11 tornillo de hexágono interior. Las referencias AS568 identifican tamaños. El compuesto de las juntas, el material de las caras y el código del cartucho instalado en el servicio de agua con soda requieren verificación. [Manual y despiece del sello](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf) · [Fuente STAIRS](https://www.stairs.com.tw/wp-content/uploads/2023/06/SB_101520_Manual_Download.pdf).

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua con soda
- **Bomba y datos registrados** SB Model: 15-5(M) · GPM: 96 · RPM: 3450 · HD [m]: 25
- **Motor** Serie: 2200044859 · HP: 10 · RPM: 3550
- **Rodamiento delantero registrado** 6303-ZZ
- **Rodamiento trasero registrado** 6306-ZZ
- **Ficha o referencia del fabricante** [Catálogo STAIRS, fabricante candidato](https://www.stairs.com.tw/index.php/downloads/)
- **CAD** CAD pendiente. Confirmar fabricante, modelo y sufijo.

## B60 · Tanque Verde (en desuso) - CIP Destilería

**Cruce de inventarios y fotos.** La PACO de Tanque Verde es B60 en Bombas.xlsx y B58 en Libro1.xlsx. La ficha histórica coincide en ubicación, 480 GPM, HD 105 e impulsor de 11,76 pulgadas, y figura sin placa asociada. El B60 de Libro1.xlsx es una TITAN de la torre de enfriamiento. En la búsqueda de fotos, usar ubicación y marca junto con el TAG de la fuente. [Ficha histórica PACO B58](../cuentas-vercel/00-Proyecto/equipos/B58.md) · [Ficha histórica TITAN B60](../cuentas-vercel/00-Proyecto/equipos/B60.md).

**Identificación por montaje.** En la nomenclatura Grundfos, VL es en línea, LC es de succión axial con motor acoplado directamente y LF es de succión axial con soporte independiente. La orientación de las bocas y una vista lateral del motor y su acoplamiento ayudan a distinguir estas familias. El código de placa sigue siendo necesario para asignar curva, despiece y CAD. [Catálogo Grundfos, familias VL, LC y LF](https://portals.grundfos.com/content/dam/portals/extranet-landing/gpu/documents/2024-pricebooks-and-lists/2024%20Commercial%20Buildings%20Pricebook.pdf).

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua
- **Bomba y datos registrados** PACO PUMPS · GPM: 480 · HD: 105 · Ø Imp [pulg]: 11.76
- **Motor** WEG · TE1BFOXO · HP: 7.5 · RPM: 1160
- **Rodamiento delantero registrado** 6308-ZZ
- **Rodamiento trasero registrado** 6207-ZZ
- **Ficha o referencia del fabricante** [Manual Grundfos PACO VL, sección 5.1](https://api.grundfos.com/literature/Grundfosliterature-5104627.pdf), referencia para ubicar número de catálogo y serie en la placa de la voluta. Familia instalada pendiente.
- **Validación del punto de servicio** HD 105 figura sin unidad. Si significa 105 pies, 480 US GPM de agua requieren aproximadamente 12,7 HP hidráulicos, frente a 7,5 HP registrados de motor. Si significa 105 m, serían aproximadamente 41,8 HP hidráulicos. Verificar si Q y H corresponden al mismo punto y cotejar la placa del motor antes de seleccionar una curva. El impulsor registrado de 11,76 pulgadas equivale a 298,7 mm.
- **Despiece para cotejar la familia PACO LF.** El manual Grundfos LC/LCV/LF separa los cortes de las tres ejecuciones. La sección 5.6 documenta la LF con soporte de rodamientos, y el manual LFE identifica 18A/18B como rodamientos interior y exterior, 20Y como soporte, 6A como eje y 14A como sello. Son posiciones de referencia de esa familia. Los códigos 6308-ZZ y 6207-ZZ del inventario no permiten vincular la bomba a ese soporte. Sus cotas nominales son 40 × 90 × 23 mm y 35 × 72 × 17 mm (interior × exterior × ancho). Verificar si pertenecen al motor o al cuerpo hidráulico. [Manual Grundfos PACO LC/LCV/LF, sección 5.6](https://cdn2.hubspot.net/hubfs/4260356/HurleyEngineering_March2018/pdf/LCLF_Series_IO.pdf) · [Corte Grundfos PACO LFE, sección 8.8](https://d1pkofokfruj4.cloudfront.net/media/upload/resource/c/Grundfos-PACO-LFE-LCSE-End-Suction-Pumps-Installation-Operation-Manual.pdf) · [Catálogo SKF](https://cdn.skfmediahub.skf.com/api/public/0901d19680416a2b/pdf_preview_medium/0901d19680416a2b_pdf_preview_medium.pdf).
- **Cómo identificar la B60 si la placa está parcialmente legible.** Buscar la placa en la voluta y transcribir los campos CAT # y SER # por separado. En el manual de las PACO en línea, los primeros dígitos del número de catálogo distinguen **16 (VL)** y **17 (VLS, con acoplamiento partido)**. La placa puede omitir los guiones. Fotografiar también las bocas y el acople para contrastar la familia. El prefijo permite orientar la búsqueda; el CAT # completo y la serie permiten solicitar la hoja de selección, el plano dimensional y el despiece de la unidad. Fotografiar además los campos GPM, TDH y diámetro de impulsor para verificar el punto registrado. [Manual Grundfos PACO VL/VLS, sección 2.1](https://www.gogrundfos.com/hubfs/GRUNDFOS%20I%20AND%20O%20MANUALS/I%26O-VL-VLS.pdf?hsLang=en).
- **CAD y hoja de datos** Pendientes número de catálogo, serie y configuración de conexiones de la bomba.

## B61 · Alimentación Ósmosis Inversa

**Área** 4. FERMENTACIÓN

- **Líquido o estado** Agua con soda
- **Bomba y datos registrados** MULTISTEEL  · RSA32/2025 · GPM: 70 · RPM: 3500 · HD [m]: 88 · Ø Imp [mm]: 210
- **Motor** WEG · W22 · HP: 15 · RPM: 3540
- **Rodamiento delantero registrado** 6309-ZZ-C3
- **Rodamiento trasero registrado** 6209-ZZ-C3
- **Ficha o referencia del fabricante** [Biblioteca Multisteel](https://bombasmultisteel.com.br/downloads/) · [PDF RSA](Documentos-bombas-Vocatus/Multisteel-RSA-catalogo.pdf). Referencias de familia.
- **CAD** CAD pendiente. Confirmar tamaño y serie.

## B62 · Tanque CIP Fermentación

**Área** **

- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

**Datos para seleccionar la curva Titan 4196 3 × 4–13 MT · B63–B68.** El inventario da 13 pulgadas para el impulsor en B63 y B64, pero registra 13 mm en B65–B68. Dado el tamaño hidráulico 3 × 4–13, **13 pulgadas (330,2 mm)** es una interpretación probable para estos cuatro TAG, pendiente de placa o medición. B66–B68 registran motor de 40 HP a 1.770 rpm; el mapa nominal de 1.750 rpm es la referencia más cercana para esas unidades. En B63–B65 falta la velocidad. Para cerrar la selección se requieren caudal, altura y diámetro verificado. [Mapa Titan, p. 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9).

**Revisión 2026-11-09 · Titan 4196.** Titan declara conformidad con ASME B73.1M, que fija por designación las cotas de montaje, el eje de entrada y los pernos de anclaje. Por eso B13 (AA), B63–B68 (A40) y la serie 064311 (A20) usan el [DXF de patas y extremo de eje](Documentos-bombas-Vocatus/Titan-4196-patas-y-extremo-eje-B73.dxf) con los mismos valores que la 2196. Los rodamientos del inventario (6212 Z C3 en B63–B68; 6205/6204 en B13) parecen de motor. Las piezas internas siguen pendientes del manual escaneado. [Tabla Titan](Titan-4196-tabla-piezas-y-pendientes.md).

**Despiece Titan MT compartido · B63–B68.** El corte MT identifica la carcasa **100**, el impulsor **101**, el adaptador **108**, el eje **122**, la camisa **126**, el alojamiento exterior **134**, los rodamientos interior **168A** y exterior **112**, la tapa de cámara **184**, el soporte **228** y su pie **241**. El sello mecánico figura en dos elementos, fijo **365** y giratorio **383**. El dibujo distingue retenes laberínticos interior **333A** y exterior **332A**. Las posiciones sirven para identificar las piezas en el corte; para pedirlas, cotejar serie, material y ejecución de sello y rodamientos. [Manual Titan, corte MT, p. 43](Documentos-bombas-Vocatus/Titan-4196-manual.pdf#page=43).

**Bridas candidatas Titan A40 · B63–B68.** [DXF de patrones clase 150](Documentos-bombas-Vocatus/Titan-4196-A40-bridas-clase150-candidatas.dxf). Succión NPS 4 con ocho agujeros Ø¾″ sobre Ø7½″; descarga NPS 3 con cuatro agujeros Ø¾″ sobre Ø6″. La clase 150 y la orientación angular requieren verificación en cada montaje. [Tabla Texas Flange](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-150/).

**Variante de brida clase 300 para cotejo.** [DXF candidato](Documentos-bombas-Vocatus/Titan-4196-A40-bridas-clase300-candidatas.dxf). Para succión NPS 4, círculo de pernos Ø7⅞ pulgadas y diámetro exterior Ø10 pulgadas. Para descarga NPS 3, círculo Ø6⅝ pulgadas y diámetro exterior Ø8¼ pulgadas. Ambas llevan ocho agujeros Ø⅞ pulgadas. El manual Titan incluye clase 150 y clase 300; verificar el marcado de B63–B68 antes de asignar el patrón. [Tabla clase 300](https://texasflange.com/products/flange-dims-weights/ansi-b16-5-forged-flanges/class-300/).

## B63 · Torre de Enfriamiento #1

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [pulg]: 13 · Ø Máx [pilg]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** SIEMENS
- **Rodamiento delantero registrado** 6212 Z C3
- **Rodamiento trasero registrado** 6212 Z C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

## B64 · Torre de Enfriamiento #1

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [pulg]: 13 · Ø Máx [pulg]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** SIEMENS
- **Rodamiento delantero registrado** 6212 Z C3
- **Rodamiento trasero registrado** 6212 Z C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

## B65 · Torre de Enfriamiento #1

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [mm]: 13 · Ø Máx [mm]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** SIEMENS
- **Rodamiento delantero registrado** 6212 Z C3
- **Rodamiento trasero registrado** 6212 Z C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

## B66 · Torre de Enfriamiento #2

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [mm]: 13 · Ø Máx [mm]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 40 · RPM: 1770
- **Rodamiento delantero registrado** 6312-C3
- **Rodamiento trasero registrado** 6212-C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

## B67 · Torre de Enfriamiento #2

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [mm]: 13 · Ø Máx [mm]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 40 · RPM: 1770
- **Rodamiento delantero registrado** 6312-C3
- **Rodamiento trasero registrado** 6212-C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

## B68 · Torre de Enfriamiento #2

**Plano dimensional Titan** [Catálogo, página PDF 6](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=6). 3 × 4–13 A40 MT/LT. Succión 4″, descarga 3″. X/A/B/D/SP 318/495/102/254/95 mm. Bomba sin motor 150 kg. [DXF lateral reconstruido](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-esquema.dxf). Cotas de referencia de catálogo y contorno estimado en capas separadas. CAD original y plano de bancada instalada pendientes. [Mapa de rendimiento Titan, página PDF 9](Documentos-bombas-Vocatus/Titan-4196-catalogo.pdf#page=9). Rangos a 1.750/1.450 y 3.500/2.900 rpm. Curva individual por diámetro pendiente. [DXF 3D de referencia](Documentos-bombas-Vocatus/Titan-4196-3x4-13-A40-MT-envolvente-3D.dxf). Envolvente esquemática derivada de ST y ajustada a las cotas MT. Motor y bancada omitidos.

**Datos y repuestos de catálogo** [Materiales, cortes y vistas explotadas Titan](https://www.titanpumpsinc.com/titan_pdfs/Titan_4196_Ansi_Pump_Maintenance_Manual.pdf). Consultar págs. 41–43 y 51–52. Seleccionar ST o MT según la unidad.

**Área** 5. TORRES DE ENFRIAMIENTO

- **Líquido o estado** Agua
- **Bomba y datos registrados** TITAN 4196 · GPM: · RPM: · HD: · Ø Imp [mm]: 13 · Ø Máx [mm]: 13
- **Tamaño** 3X4-13 MT
- **Sello** Tipo 1 (O) - Tipo 21 (G) 1.3/4"
- **Motor** WEG ·  · HP: 40 · RPM: 1770
- **Rodamiento delantero registrado** 6312-C3
- **Rodamiento trasero registrado** 6212-C3
- **Ficha o referencia del fabricante** [Catálogo y manual Titan](https://www.titanpumpsinc.com/download)
- **CAD** DXF de conjunto de referencia compartido arriba. Pendientes CAD original y cotas de bancada instalada.

**Lectura hidráulica de catálogo para B69–B70.** Como punto de referencia, a 20 US GPM (4,54 m³/h), la curva EVMSU5-9/5 HP a 3.500 rpm indica alrededor de 400 ft (122 m) de altura y la gráfica inferior de la familia indica un NPSH de aproximadamente 6–7 ft (1,8–2,1 m). Valores aproximados leídos de la gráfica. El inventario de estos TAG carece de caudal y altura; queda pendiente la hoja de selección del punto real. [Curvas Ebara, p. 12](Documentos-bombas-Vocatus/Ebara-EVMSU-curvas.pdf#page=12).

**Interfaz del sello S para B69–B70.** La tabla Ebara EVMSU(L) 1/3/5 muestra dos cartuchos con caras SiC/carbono y elastómero FPM. Las cotas de la tabla están en pulgadas.

| Cartucho | Presión máxima de catálogo | d1 | d2 | d3 | d4 | l |
|---|---:|---:|---:|---:|---:|---:|
| Sin balancear | 230 psi | 0,630 | — | 0,906 | 1,063 | 1,378 |
| Balanceado | 375 psi | 0,630 | 0,787 | 0,906 | 1,063 | 1,673 |

La fila EVMSU5-9 con brida F indica 230 psi de presión máxima de bomba (pág. 14), por lo que el cartucho sin balancear de 230 psi es la referencia de catálogo que corresponde cotejar primero. El DXF 2D compartido incorpora sus tres diámetros y longitud en una capa independiente. [DXF con cotas del sello](Documentos-bombas-Vocatus/Ebara-EVMSU5-9-F-esquema.dxf). El sufijo S identifica materiales en ambas ejecuciones. Confirmar el código del cartucho instalado antes de aplicar la longitud o pedir repuesto. [Cortes y cotas del sello Ebara, p. 9](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=9).


## B69 · Caldera #2

**CAD reconstruido Ebara** [DXF 2D, brida F](Documentos-bombas-Vocatus/Ebara-EVMSU5-9-F-esquema.dxf). Cotas generales de catálogo y perfiles estimados. La vista lateral incluye la envolvente TEFC 184TC de catálogo en una capa separada. El DXF 2D incluye detalle de brida F con círculo de pernos Ø98,425 mm y cuatro agujeros Ø19,05 mm. Orientación angular reconstruida del esquema. La vista superior incorpora el patrón de montaje de base: cuatro agujeros Ø11,906 mm, separados 100,013 × 180,975 mm entre centros. Aplicación condicionada a confirmar el código de placa. [Envolvente 3D DXF](Documentos-bombas-Vocatus/Ebara-EVMSU5-9-F-envolvente-3D.dxf). Cotas de catálogo: H2 600,075 mm, 250,825 mm entre caras, eje de conexión a 74,6125 mm, bridas Ø139,7 × 15,875 mm. Perfiles restantes estimados. La malla incluye una envolvente cilíndrica de motor TEFC 184TC en capa separada, con diámetro de referencia 215,9 mm y altura total 992,2 mm. Caja de conexiones, acople y agujeros de montaje omitidos. La forma y dimensiones del WEG instalado quedan por cotejar.

**Altura de conjunto de catálogo.** Para EVMSU5-9 con motor TEFC 184TC, la tabla EBARA da B = 8½ pulgadas (215,9 mm), C = 6⅞ pulgadas (174,6 mm) y H3 = 15 7/16 pulgadas (392,1 mm). La figura define H3 desde la cara de montaje del motor hasta su extremo superior. Sumada a H2 = 23⅝ pulgadas de la bomba con brida F, la altura de referencia resulta **39 1/16 pulgadas (992,2 mm)**. La cota C de EBARA es transversal al eje y la C del catálogo WEG mide la longitud axial total del motor. Esta altura describe la configuración de catálogo EBARA y queda por confirmar para el WEG instalado. [Dimensiones de motor EBARA, págs. 18–19](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=19).

**Materiales de piezas Ebara** [Tabla EVMSU(L)5, pág. 12](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=12). Ítem 21, impulsor AISI 304 en EVMSU o AISI 316 en EVMSUL. Ítem 111, sello SiC/carbono/FPM. Ítem 115-1, junta de carcasa FPM de 129,54 × 5,34 mm (OR 6510). Confirmar variante y número de repuesto antes de pedir piezas. [Cantidades EVMSU(L)5-9, pág. 13](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=13). Por bomba: 9 impulsores (21), 1 eje (31), 1 sello mecánico (111), 2 juntas de carcasa (115-1) y 4 tirantes (120-1). Aplicar las notas del catálogo para excluir ítems exclusivos de bridas N o LF en una configuración F.

**Acople y unión al motor, EVMSU5-9 de 5 HP.** Por bomba, la lista EBARA registra dos piezas del acople (posición 140), de aluminio fundido EN AB-AlSi11Cu2 (Fe) para esta potencia. Se fijan con cuatro tornillos M6 × 25 ISO 4762 (120-6) y cuatro tuercas M6 ISO 4032 (128-6). El protector (245) consta de dos piezas de AISI 304 con cuatro tornillos M5 × 6 (130-2). El adaptador (51) y el soporte del motor (162) son de fundición EN-GJL-200. Las posiciones identifican componentes en el despiece. El diámetro de ambos alojamientos del acople, su longitud y el código comercial de repuesto quedan por confirmar. [Despiece y cantidades EBARA, págs. 12–13](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=12).

**Plano dimensional Ebara F** [EVMSU(L)5, página 14](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=14). La ficha identifica F como brida redonda. Para EVMSU(L)5-9 con brida F/LF lista 5 HP, bastidor 184TC, H2 de 23⅝″ y peso de bomba de 37,9 lb. Coincidencia de catálogo con el tamaño y la letra F del código registrado. Confirmar la configuración completa en placa antes de asignar CAD. [Curva Ebara EVMSU5, pág. 12](Documentos-bombas-Vocatus/Ebara-EVMSU-curvas.pdf#page=12). Seguir la línea 9/5 HP, 3.500 rpm nominales, impulsor de 3,58″ y conexión ANSI compatible 1¼″ de cuatro pernos.

**Datos y repuestos de catálogo** [Hoja técnica EVMSU](https://www.pumpsebara.com/wp-content/uploads/EVMSU_tech.pdf) · [Curvas](https://www.pumpsebara.com/wp-content/uploads/EVMSU_curves.pdf) · [Lista de piezas](https://www.pumpsebara.com/wp-content/uploads/EVM_Parts-Reference.pdf). Aplicabilidad del código completo pendiente.

**Área** 6. CALDERAS

- **Líquido o estado** Agua con químicos
- **Bomba y datos registrados** EBARA · AEVMSU5-9F0500T3S · Ø Imp [pulg]: 3.58
- **Código de configuración Ebara** En el tramo EVMSU5-9F0500T3S, 5 es el tamaño nominal, 9 el número de impulsores, F la brida redonda compatible ANSI, 0500 la potencia de 5 HP, T el motor cerrado con ventilación externa (TEFC), 3 la alimentación trifásica y S el sello SiC/carbono/FPM. La ausencia de L en EVMSU indica construcción inoxidable 304 según la nomenclatura de la familia. El prefijo A queda sin decodificar. [Nomenclatura Ebara, p. 5](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=5).
- **Motor** WEG · 00536ET3ER184TC-W22 · HP: 5 · RPM: 3485
- **Ficha de motor por código WEG** El catálogo US100 identifica 00536ET3ER184TC-W22 como motor TEFC trifásico sin patas, cara C 184TC, 5 HP, 230/460 V y longitud total C de 17,197 pulgadas (436,8 mm). Indica 5,90 A a alta tensión, eficiencia de 88,5 % y factor de servicio 1,25. El catálogo agrupa el motor en 3.600 rpm y el inventario registra 3.485 rpm. La cota C sirve para reconstruir el contorno con el plano de cara C y la proyección del eje, pendientes de confirmar. [Catálogo WEG US100](https://static.weg.net/medias/downloadcenter/hc7/h62/US100-Standard-Stock-Catalog-Complete.pdf/US100%20Standard%20Stock%20Catalog%20Complete.pdf).
- **Hoja de datos WEG por código 12822267.** La ficha de fabricante del motor 00536ET3ER184TC-W22 indica 230/460 V, 11,8/5,90 A, 60 Hz, IP55 y rodamientos 6207 ZZ y 6206 ZZ. Esto permite cotejar los rodamientos registrados con el motor. La ficha indica 3.500 rpm nominales bajo carga, frente a 3.485 rpm del inventario; verificar la placa de cada unidad. El distribuidor indexa un plano dimensional por el código exacto. La descarga del plano sigue pendiente. [Hoja de datos WEG](https://images.willeelectric.com/EclipseProductSpecs/02379352.pdf) · [Índice del plano WEG](https://www.purvisindustries.com/1393382/product/n/weg-569363).
- **Cara C de referencia WEG 182/4TC.** El plano de familia W22 identifica la brida FC-184 y cuatro roscas BF 3/8-16 UNC. Las cotas de catálogo, en pulgadas, son BA 2,750, BB 0,157, BC 0,125, AK 8,500, BD 8,875, AH 2,625 y AJ 7,252. Usar los rótulos del dibujo WEG para cotejar las superficies y el patrón. La ficha específica identifica el motor como 184TC. El plano dimensional de esa ejecución y el acople Ebara siguen pendientes de comprobar antes de integrar la cara C en el CAD. [Catálogo WEG W22, tabla de bridas C](https://static.weg.net/medias/downloadcenter/hf8/h29/WEG-w22-three-phase-electric-motor-50029265-brochure-english-web.pdf).
- **Rodamiento delantero registrado** 6207-ZZ
- **Rodamiento trasero registrado** 6206-ZZ
- **Ficha o referencia del fabricante** [Datos EVMSU](https://www.pumpsebara.com/wp-content/uploads/EVMSU_tech.pdf)
- **CAD original** Ebara dirige los planos EVMSU a **Document Library** dentro de e-Select. Buscar el código **AEVMSU5-9F0500T3S** y verificar brida F, motor de 5 HP y bastidor 184TC en el resultado. Descarga exacta pendiente. [Ficha oficial EVMSU](https://www.pumpsebara.com/product/evms-series/) · [e-Select](https://ebara.portal-center.intelliquip.com/).

## B70 · Caldera #2

**CAD reconstruido Ebara** [DXF 2D, brida F](Documentos-bombas-Vocatus/Ebara-EVMSU5-9-F-esquema.dxf). Cotas generales de catálogo y perfiles estimados. La vista lateral incluye la envolvente TEFC 184TC de catálogo en una capa separada. El DXF 2D incluye detalle de brida F con círculo de pernos Ø98,425 mm y cuatro agujeros Ø19,05 mm. Orientación angular reconstruida del esquema. La vista superior incorpora el patrón de montaje de base: cuatro agujeros Ø11,906 mm, separados 100,013 × 180,975 mm entre centros. Aplicación condicionada a confirmar el código de placa. [Envolvente 3D DXF](Documentos-bombas-Vocatus/Ebara-EVMSU5-9-F-envolvente-3D.dxf). Cotas de catálogo: H2 600,075 mm, 250,825 mm entre caras, eje de conexión a 74,6125 mm, bridas Ø139,7 × 15,875 mm. Perfiles restantes estimados. La malla incluye una envolvente cilíndrica de motor TEFC 184TC en capa separada, con diámetro de referencia 215,9 mm y altura total 992,2 mm. Caja de conexiones, acople y agujeros de montaje omitidos. La forma y dimensiones del WEG instalado quedan por cotejar.

**Altura de conjunto de catálogo.** Para EVMSU5-9 con motor TEFC 184TC, la tabla EBARA da B = 8½ pulgadas (215,9 mm), C = 6⅞ pulgadas (174,6 mm) y H3 = 15 7/16 pulgadas (392,1 mm). La figura define H3 desde la cara de montaje del motor hasta su extremo superior. Sumada a H2 = 23⅝ pulgadas de la bomba con brida F, la altura de referencia resulta **39 1/16 pulgadas (992,2 mm)**. La cota C de EBARA es transversal al eje y la C del catálogo WEG mide la longitud axial total del motor. Esta altura describe la configuración de catálogo EBARA y queda por confirmar para el WEG instalado. [Dimensiones de motor EBARA, págs. 18–19](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=19).

**Materiales de piezas Ebara** [Tabla EVMSU(L)5, pág. 12](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=12). Ítem 21, impulsor AISI 304 en EVMSU o AISI 316 en EVMSUL. Ítem 111, sello SiC/carbono/FPM. Ítem 115-1, junta de carcasa FPM de 129,54 × 5,34 mm (OR 6510). Confirmar variante y número de repuesto antes de pedir piezas. [Cantidades EVMSU(L)5-9, pág. 13](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=13). Por bomba: 9 impulsores (21), 1 eje (31), 1 sello mecánico (111), 2 juntas de carcasa (115-1) y 4 tirantes (120-1). Aplicar las notas del catálogo para excluir ítems exclusivos de bridas N o LF en una configuración F.

**Acople y unión al motor, EVMSU5-9 de 5 HP.** Por bomba, la lista EBARA registra dos piezas del acople (posición 140), de aluminio fundido EN AB-AlSi11Cu2 (Fe) para esta potencia. Se fijan con cuatro tornillos M6 × 25 ISO 4762 (120-6) y cuatro tuercas M6 ISO 4032 (128-6). El protector (245) consta de dos piezas de AISI 304 con cuatro tornillos M5 × 6 (130-2). El adaptador (51) y el soporte del motor (162) son de fundición EN-GJL-200. Las posiciones identifican componentes en el despiece. El diámetro de ambos alojamientos del acople, su longitud y el código comercial de repuesto quedan por confirmar. [Despiece y cantidades EBARA, págs. 12–13](Documentos-bombas-Vocatus/Ebara-EVM-repuestos.pdf#page=12).

**Plano dimensional Ebara F** [EVMSU(L)5, página 14](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=14). La ficha identifica F como brida redonda. Para EVMSU(L)5-9 con brida F/LF lista 5 HP, bastidor 184TC, H2 de 23⅝″ y peso de bomba de 37,9 lb. Coincidencia de catálogo con el tamaño y la letra F del código registrado. Confirmar la configuración completa en placa antes de asignar CAD. [Curva Ebara EVMSU5, pág. 12](Documentos-bombas-Vocatus/Ebara-EVMSU-curvas.pdf#page=12). Seguir la línea 9/5 HP, 3.500 rpm nominales, impulsor de 3,58″ y conexión ANSI compatible 1¼″ de cuatro pernos.

**Datos y repuestos de catálogo** [Hoja técnica EVMSU](https://www.pumpsebara.com/wp-content/uploads/EVMSU_tech.pdf) · [Curvas](https://www.pumpsebara.com/wp-content/uploads/EVMSU_curves.pdf) · [Lista de piezas](https://www.pumpsebara.com/wp-content/uploads/EVM_Parts-Reference.pdf). Aplicabilidad del código completo pendiente.

**Área** 6. CALDERAS

- **Líquido o estado** Agua con químicos
- **Bomba y datos registrados** EBARA · AEVMSU5-9F0500T3S · Ø Imp [pulg]: 3.58
- **Código de configuración Ebara** En el tramo EVMSU5-9F0500T3S, 5 es el tamaño nominal, 9 el número de impulsores, F la brida redonda compatible ANSI, 0500 la potencia de 5 HP, T el motor cerrado con ventilación externa (TEFC), 3 la alimentación trifásica y S el sello SiC/carbono/FPM. La ausencia de L en EVMSU indica construcción inoxidable 304 según la nomenclatura de la familia. El prefijo A queda sin decodificar. [Nomenclatura Ebara, p. 5](Documentos-bombas-Vocatus/Ebara-EVMSU-ficha.pdf#page=5).
- **Motor** WEG · 00536ET3ER184TC-W22 · HP: 5 · RPM: 3485
- **Ficha de motor por código WEG** El catálogo US100 identifica 00536ET3ER184TC-W22 como motor TEFC trifásico sin patas, cara C 184TC, 5 HP, 230/460 V y longitud total C de 17,197 pulgadas (436,8 mm). Indica 5,90 A a alta tensión, eficiencia de 88,5 % y factor de servicio 1,25. El catálogo agrupa el motor en 3.600 rpm y el inventario registra 3.485 rpm. La cota C sirve para reconstruir el contorno con el plano de cara C y la proyección del eje, pendientes de confirmar. [Catálogo WEG US100](https://static.weg.net/medias/downloadcenter/hc7/h62/US100-Standard-Stock-Catalog-Complete.pdf/US100%20Standard%20Stock%20Catalog%20Complete.pdf).
- **Hoja de datos WEG por código 12822267.** La ficha de fabricante del motor 00536ET3ER184TC-W22 indica 230/460 V, 11,8/5,90 A, 60 Hz, IP55 y rodamientos 6207 ZZ y 6206 ZZ. Esto permite cotejar los rodamientos registrados con el motor. La ficha indica 3.500 rpm nominales bajo carga, frente a 3.485 rpm del inventario; verificar la placa de cada unidad. El distribuidor indexa un plano dimensional por el código exacto. La descarga del plano sigue pendiente. [Hoja de datos WEG](https://images.willeelectric.com/EclipseProductSpecs/02379352.pdf) · [Índice del plano WEG](https://www.purvisindustries.com/1393382/product/n/weg-569363).
- **Cara C de referencia WEG 182/4TC.** El plano de familia W22 identifica la brida FC-184 y cuatro roscas BF 3/8-16 UNC. Las cotas de catálogo, en pulgadas, son BA 2,750, BB 0,157, BC 0,125, AK 8,500, BD 8,875, AH 2,625 y AJ 7,252. Usar los rótulos del dibujo WEG para cotejar las superficies y el patrón. La ficha específica identifica el motor como 184TC. El plano dimensional de esa ejecución y el acople Ebara siguen pendientes de comprobar antes de integrar la cara C en el CAD. [Catálogo WEG W22, tabla de bridas C](https://static.weg.net/medias/downloadcenter/hf8/h29/WEG-w22-three-phase-electric-motor-50029265-brochure-english-web.pdf).
- **Rodamiento delantero registrado** 6207-ZZ
- **Rodamiento trasero registrado** 6206-ZZ
- **Ficha o referencia del fabricante** [Datos EVMSU](https://www.pumpsebara.com/wp-content/uploads/EVMSU_tech.pdf)
- **CAD original** Ebara dirige los planos EVMSU a **Document Library** dentro de e-Select. Buscar el código **AEVMSU5-9F0500T3S** y verificar brida F, motor de 5 HP y bastidor 184TC en el resultado. Descarga exacta pendiente. [Ficha oficial EVMSU](https://www.pumpsebara.com/product/evms-series/) · [e-Select](https://ebara.portal-center.intelliquip.com/).

**Cotejo hidráulico compartido CR15-6K · B71 y B72.** Los 90,3 US GPM del inventario equivalen a 20,51 m³/h. En la curva Grundfos de bajo NPSH a 60 Hz, la línea -6 entrega alrededor de 105 m a ese caudal, frente a 102 m registrados. La lectura gráfica apoya la selección de referencia. La curva y la hoja de datos del código GJ-A-E-HQQE-NX2 siguen pendientes de verificar por número de producto. [Curva Grundfos, p. 108](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=108).

**Número de producto candidato para B71 y B72.** Grundfos México lista **93236398** para CR15-06 K-GJ-A-E-HQQE, 15 HP, 254TC, trifásica 230/460 V y 60 Hz. Buscar este número en Product Center para recuperar el plano y la selección; cotejar el sufijo NX2 con las placas. El submittal **97757998** corresponde a una variante A sin bajo NPSH y publica 90,3 GPM a 300,9 ft (91,7 m), por lo que queda como contraste frente a los 102 m registrados. Coincide además con el motor Baldor 85600H24 registrado, 15 HP a 3.520 rpm, y con el impulsor de 4,13 pulgadas. Su página 8 incluye el plano dimensional GJ y la página 9 el esquema eléctrico. Usar para cotejo de motor e interfaz; la selección hidráulica K/NX2 y su CAD siguen pendientes. [Listado Grundfos México](https://portals.grundfos.com/content/dam/portals/extranet-landing/gmx/price-list/MX_General_Price_List_2026.pdf) · [Submittal Grundfos 97757998](https://pfcestore.com/wp-content/uploads/2020/04/97757998_CR_156_AGJAEHQQE.pdf).

**Sello HQQE compartido · B71 y B72.** Grundfos identifica HQQE como cartucho balanceado con junta tórica, caras de carburo de silicio contra carburo de silicio y elastómero EPDM. La ejecución HQQV usa FKM y tiene código distinto. El catálogo de servicio CR/CRI/CRN 10, 15 y 20 lista el kit HQQE **96511844**, con un sello (posición 105) y una horquilla de ajuste. Confirmar diámetro, compatibilidad y límites por número de producto K/NX2 antes de pedir el kit. [Catálogo Grundfos de kits, sección CR 10/15/20](https://api.grundfos.com/literature/Grundfosliterature-5261468.pdf). [Manual Grundfos CR/CRI/CRN, sellos estándar](https://api.grundfos.com/literature/Grundfosliterature-6012970.pdf).

**Alturas de referencia para el CAD CR15-6.** La tabla Grundfos de 60 Hz para bajo NPSH, motor de 11 kW y brida DIN indica **B1 = 709 mm** y **B1 + B2 = 1.180 mm**. También lista D1/D2/D3 = 314/204/350 mm y peso neto de 126 kg. Estas cotas corresponden al conjunto DIN de la tabla. Para B71–B72, el DXF GJ documenta la base y las conexiones; quedan pendientes las alturas del conjunto K-GJ/NX2 con motor Baldor. [Tabla dimensional Grundfos, p. 153](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=153).


**Número de producto Grundfos candidato para B71–B72.** El catálogo Grundfos México registra el número **97786834** para CR 15-6 K-GJ-A-E-HQQE, 15 HP, trifásica, 230/460 V a 60 Hz, con bastidor 254TC. Coincide con la cadena hidráulica y la potencia del inventario. El renglón de catálogo omite NX2, por lo que el 97786834 queda como referencia para solicitar la hoja de datos y el CAD, sujeto al número de producto de las placas de las dos unidades. Las alturas del plano DIN permanecen como referencia separada. [Catálogo Grundfos México, revisión R1](https://portals.grundfos.com/content/dam/portals/extranet-landing/gmx/price-list/LP%20GMX%202021%20MX%20R1.pdf).

**Cotas ANSI de la CR15-6 de bajo NPSH a 60 Hz.** El libro técnico Grundfos 5188179 especifica bastidor 254TC, impulsor de 4,13 pulgadas y B1 de 27,17 pulgadas (690,1 mm). Con motor TEFC, B1 + B2 es 45,98 pulgadas (1.167,9 mm), con D1/D2 de 13,18/9,45 pulgadas. Con motor ODP, la altura total es 45,83 pulgadas (1.164,1 mm), con D1/D2 de 11,58/9,45 pulgadas. El impulsor coincide con el registro de B71–B72. El DXF GJ compartido incorpora una vista independiente con las alturas ANSI de referencia para TEFC y ODP. [DXF GJ con alturas ANSI](Documentos-bombas-Vocatus/Grundfos-CR15-GJ-interfaz.dxf). Usar la tabla ANSI para cotejar la versión GJ candidata y verificar la envolvente del motor Baldor y el sufijo NX2 antes de asignar la altura de instalación. [Libro técnico Grundfos 5188179, tabla CR 15 low-NPSH](https://www.pumpproducts.com/media/amasty/amfile/attach/Grundfos_96416374_CR_CRI_CRN_CRT_Cre_Crie_Crne_Crte_Custom-built_Pumps_Data_Booklet.pdf).

**Cotejo de la curva para B71–B72.** A 90,3 US GPM (20,51 m³/h), la curva CR15-6 de bajo NPSH a 60 Hz indica aproximadamente 104–108 m de altura por lectura gráfica. El inventario registra 102 m y 3.450 rpm de bomba. La proximidad respalda la referencia hidráulica -6, con la velocidad efectiva y la selección NX2 por confirmar. El documento específico 97786834 figura en el índice del distribuidor, pero el PDF enlazado no pudo abrirse en esta revisión. [Curva Grundfos, pág. 108](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=108) · [Índice del documento 97786834](https://pfcestore.com/product/grundfos-low-npsh-pump-cr15-6/).

**Cotejo de dos planos de interfaz GJ.** El plano del producto 97757998 (CR15-6 A, con el mismo Baldor 85600H24) da 11,80 pulgadas entre caras y eje a 3,54 pulgadas sobre la base, equivalentes a 299,7 y 89,9 mm. Son coherentes con los 300 y 90 mm del DXF de familia. Para los ocho agujeros ranurados, la llamada del 97757998 es 0,91 × 0,79 pulgadas (23,1 × 20,1 mm), frente a 21,5 × 18 mm del plano de familia utilizado en el DXF. La diferencia requiere medir las bridas instaladas y verificar el número de producto de cada bomba antes de fijar el patrón de montaje. [Plano Grundfos 97757998, pág. 8](https://pfcestore.com/wp-content/uploads/2020/04/97757998_CR_156_AGJAEHQQE.pdf#page=8) · [Plano GJ de familia, pág. 44](Documentos-bombas-Vocatus/Grundfos-6014748.pdf#page=44).

**Evidencia del sufijo NX2.** Un expediente público de repuestos de Liconsa identifica una CR15-6A-GJ-A-E-HQQE-NX2 y la relaciona con el número de producto 97757998. El submittal Grundfos de ese mismo número omite NX2 en el título. Esto documenta que un listado comercial sin el sufijo puede corresponder a una placa que sí lo incluye y que NX2 también aparece en la ejecución A. El significado del sufijo y su relación con las variantes K candidatas 97786834 y 93236398 siguen por verificar en la placa de Vocatus. [Expediente Liconsa, partida de anillo 47A](https://repositorioct.liconsa.gob.mx/files/GMSur/ADQUISICIONES/2023/cuarto-2023/BASES-N85-2023.pdf) · [Submittal Grundfos 97757998](https://pfcestore.com/wp-content/uploads/2020/04/97757998_CR_156_AGJAEHQQE.pdf).

**Clave de configuración Grundfos · B71 y B72.** El manual del fabricante, sección 3.2, identifica **15** como el caudal nominal de la serie en m³/h, **6** como seis etapas, **K** como la versión de bajo NPSH y **GJ** como la conexión con bridas ANSI y JIS. El código de materiales **A** indica cabezal de fundición y acero inoxidable EN 1.4301 en las demás piezas en contacto con el líquido, según la clasificación general del fabricante. El código **E** identifica las piezas de goma en EPDM. Para el sello HQQE, véase el detalle anterior. La designación GJ permite acotar la búsqueda del plano dimensional; el patrón y las cotas de las bridas instaladas siguen sujetos al número de producto y al cotejo en campo. [Manual Grundfos, sección 3.2](https://api.grundfos.com/literature/Grundfosliterature-4712303.pdf#page=5).

## B71 · Caldera #3

**Grundfos CR 15-6 a 60 Hz** [Curva de bajo NPSH, pág. 108](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=108). [Tabla dimensional, pág. 153](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=153) para brida DIN. El inventario indica GJ y sufijo NX2. Confirmar número de producto antes de asignar cotas o CAD. [Plano de interfaz GJ, pág. 44](Documentos-bombas-Vocatus/Grundfos-6014748.pdf#page=44) · [DXF parcial GJ](Documentos-bombas-Vocatus/Grundfos-CR15-GJ-interfaz.dxf). 300 mm entre caras, eje a 90 mm y centros de montaje de 176 × 215 mm. Ancho de base 256 mm. Brida con ocho ranuras de 18 × 21,5 mm y reparto angular reconstruido del dibujo. CAD del conjunto NX2 pendiente.

**Datos y repuestos de catálogo** [Manual CR 10/15/20 con posiciones de piezas](https://api.grundfos.com/literature/Grundfosliterature-143535.pdf) · [Buscador de repuestos](https://www.grundfos.com/us/mygrundfos/spare-part-finder) · [Guía CAD](https://www.grundfos.com/ca/support/how-to-guides/how-to-find-cad-drawings). Variante NX2 pendiente.

**Área** 6. CALDERAS

- **Líquido o estado** Agua con químicos
- **Bomba y datos registrados** GRUNDFOS · CR15-6K-GJ-A-E-HQQE-NX2 · GPM: 90.3 · RPM: 3450 · HD [m]: 102 · Ø Imp [pulg]: 4.13
- **Motor** BALDOR · 85600H24 · HP: 15 · RPM: 3520
- **Hoja de datos del motor exacto.** Grundfos identifica 85600H24 como Baldor 254TC, TEFC, 15 HP, 3.520 rpm, 60 Hz, 208–230/460 V trifásico e IP54. La ficha indica 7309 en el lado de accionamiento y 6208 en el opuesto, coincidentes con los códigos del inventario. Son rodamientos del motor para este número de producto. La ejecución TEFC coincide con la columna de referencia ANSI de 1.167,9 mm de altura total. La cota instalada sigue sujeta al plano del conjunto NX2 o a medición. [Ficha Grundfos del motor 85600H24, pág. 4](https://pfcestore.com/wp-content/uploads/2019/07/85600H24_BALDOR_254TC.pdf#page=4).
- **Rodamiento delantero registrado** 7309
- **Rodamiento trasero registrado** 6208
- **Ficha o referencia del fabricante** [Manual de servicio CR](https://api.grundfos.com/literature/Grundfosliterature-143535.pdf)
- **CAD** CAD pendiente. Confirmar número de producto de placa.

## B72 · Caldera #3

**Grundfos CR 15-6 a 60 Hz** [Curva de bajo NPSH, pág. 108](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=108). [Tabla dimensional, pág. 153](Documentos-bombas-Vocatus/Grundfos-CR-libro-tecnico.pdf#page=153) para brida DIN. El inventario indica GJ y sufijo NX2. Confirmar número de producto antes de asignar cotas o CAD. [Plano de interfaz GJ, pág. 44](Documentos-bombas-Vocatus/Grundfos-6014748.pdf#page=44) · [DXF parcial GJ](Documentos-bombas-Vocatus/Grundfos-CR15-GJ-interfaz.dxf). 300 mm entre caras, eje a 90 mm y centros de montaje de 176 × 215 mm. Ancho de base 256 mm. Brida con ocho ranuras de 18 × 21,5 mm y reparto angular reconstruido del dibujo. CAD del conjunto NX2 pendiente.

**Datos y repuestos de catálogo** [Manual CR 10/15/20 con posiciones de piezas](https://api.grundfos.com/literature/Grundfosliterature-143535.pdf) · [Buscador de repuestos](https://www.grundfos.com/us/mygrundfos/spare-part-finder) · [Guía CAD](https://www.grundfos.com/ca/support/how-to-guides/how-to-find-cad-drawings). Variante NX2 pendiente.

**Área** 6. CALDERAS

- **Líquido o estado** Agua con químicos
- **Bomba y datos registrados** GRUNDFOS · CR15-6K-GJ-A-E-HQQE-NX2 · GPM: 90.3 · RPM: 3450 · HD [m]: 102 · Ø Imp [pulg]: 4.13
- **Motor** BALDOR · 85600H24 · HP: 15 · RPM: 3520
- **Hoja de datos del motor exacto.** Grundfos identifica 85600H24 como Baldor 254TC, TEFC, 15 HP, 3.520 rpm, 60 Hz, 208–230/460 V trifásico e IP54. La ficha indica 7309 en el lado de accionamiento y 6208 en el opuesto, coincidentes con los códigos del inventario. Son rodamientos del motor para este número de producto. La ejecución TEFC coincide con la columna de referencia ANSI de 1.167,9 mm de altura total. La cota instalada sigue sujeta al plano del conjunto NX2 o a medición. [Ficha Grundfos del motor 85600H24, pág. 4](https://pfcestore.com/wp-content/uploads/2019/07/85600H24_BALDOR_254TC.pdf#page=4).
- **Rodamiento delantero registrado** 7309
- **Rodamiento trasero registrado** 6208
- **Ficha o referencia del fabricante** [Manual de servicio CR](https://api.grundfos.com/literature/Grundfosliterature-143535.pdf)
- **CAD** CAD pendiente. Confirmar número de producto de placa.

## B73 · Atemperador

**Área** 6. CALDERAS

- **Líquido o estado** Agua
- **Bomba y datos registrados** MOVITEC VF 4/8B · GPM: 20 · RPM: 3460 · HD [m]: 83.6
- **Motor** WEG ·  · HP: 3 · RPM: 3480
- **Rodamiento delantero registrado** 6205-ZZ
- **Rodamiento trasero registrado** 6204-ZZ
- **Ficha o referencia del fabricante** [Ficha y CAD de familia KSB](https://www.ksb.com/en-br/lc/products/pump/ring-section-pump/movitec/m12a)
- **Datos dimensionales de familia** [Libro técnico KSB Movitec B](Documentos-bombas-Vocatus/KSB-Movitec-B-libro-tecnico.pdf), pp. 40–41. La V(S)F del catálogo de 50 Hz muestra bridas redondas DN25 PN40, Ø115 mm con cuatro taladros Ø14 sobre Ø85, 250 mm entre caras, eje de conexión a 75 mm de la base y patrón de anclaje 180 × 100 mm.
- **DXF de interfaz candidata** [Bridas y anclajes](Documentos-bombas-Vocatus/B73-KSB-Movitec-VF-interfaz-candidata.dxf). Confirmar estas cotas sobre la unidad inventariada antes de usar el dibujo en montaje.
- **CAD** [Selector CAD directo KSB Movitec](https://ksb.partcommunity.com/3d-cad-models/movitec-ksb-se-co-kgaa?info=ksb%2Fdirect_selection%2F1pump%2Fmovitec). Descarga exacta pendiente. Confirmar número de material y configuración a 60 Hz.

**Curva hidráulica de referencia a 60 Hz.** El manual técnico KSB Movitec incluye una gráfica 4B a 3.500 rpm y distingue la línea 4/8 con motor de 2,2 kW (aprox. 3 HP). El punto del inventario, 20 US GPM (4,54 m³/h) y 83,6 m, debe cotejarse con la curva por número de material para la VF instalada, que figura a 3.460 rpm. [Manual KSB Movitec 60 Hz, copia pública](https://pt.scribd.com/document/698430060/Bomba-de-alta-pressao-Inline-Movitec-60-Hz-Manual-Tecnico-1).

**Plano de la Movitec 4B a 60 Hz.** [DXF de interfaz y vista lateral VF/VSF 4/8 B](Documentos-bombas-Vocatus/B73-KSB-Movitec-VF-4-8B-60Hz-referencia.dxf). La vista lateral separa los planos de referencia F1/F2 de las vistas de interfaces. El manual KSB, pág. impresa 35, publica el dibujo VF/VSF a 3.500 rpm. Confirma DN25, diámetro exterior Ø115 mm, cuatro taladros Ø14 sobre círculo Ø85, 250 mm entre caras, eje de boquillas a 75 mm y anclajes 180 × 100 mm con cuatro taladros Ø13. Estas cotas de interfaz coinciden con las usadas en el DXF candidato. Para ocho etapas, la tabla presenta E1/E2 de 185/160 mm y F1/F2 de 715/433 mm para el grupo que incluye VF/VSF. Verificar esas dimensiones en la unidad con motor WEG antes de reconstruir la envolvente instalada. [Manual técnico KSB a 60 Hz, pág. 35](https://pt.scribd.com/document/698430060/Bomba-de-alta-pressao-Inline-Movitec-60-Hz-Manual-Tecnico-1).

**Plano de sello KSB 4MC 012, opción de referencia.** KSB documenta este cartucho simple estacionario para Movitec V(C/S/F) 2/4/6 B. El corte acota d1/d2/d3 de 12/49,7/61 mm y l1/l2/l3 de 56/43,5/4,3 mm, con fijación 4 × M5. La coincidencia de familia permite cotejar la interfaz del sello de B73. Para seleccionar el repuesto, confirmar código del sello instalado, materiales de las caras y elastómero. [Catálogo KSB de sellos mecánicos, tabla 4MC](https://live-resources-e2e-sales.ksb.com/resource/blob/1337250/c239706fe0313f4322cfcaa40760e549/dow-product-portfolio-mechanical-seals-and-supply-systems-en-data.pdf).

**Despiece de referencia KSB Movitec V 4**. Los números son posiciones del dibujo. La columna de materiales corresponde a Movitec V, tamaño 4, en el catálogo de referencia.

| Posición | Componente | Material u opción de catálogo |
|---|---|---|
| 101 | Carcasa de bomba | 1.4308 |
| 108, 160 | Carcasa de etapa y tapa de descarga | 1.4301 |
| 10-6 | Camisa exterior | 1.4301 |
| 210 | Eje | 1.4057 |
| 230 | Impulsor | 1.4038 |
| 341 | Soporte de motor | Fundición JL 1040 |
| 412 | Juntas tóricas | EPDM y opciones según ejecución |
| 433, 471 | Sello mecánico y tapa de sello | Configuración por confirmar |
| 525, 529 | Camisa espaciadora y camisa de cojinete | 1.4301 y carburo de tungsteno según tabla |
| 723, 862, 890 | Brida, acoplamiento y placa base | Confirmar ejecución por número de material |

[Tabla de materiales, pág. 3](Documentos-bombas-Vocatus/KSB-Movitec-B-libro-tecnico.pdf#page=3) · [Corte y lista de posiciones, pp. 58–59](Documentos-bombas-Vocatus/KSB-Movitec-B-libro-tecnico.pdf#page=58). Para pedir repuestos de B73 faltan el número de material KSB, el código del sello y la ejecución de las juntas. La hoja de datos individual a 60 Hz y el CAD completo siguen pendientes.


## B74 · Búnker diario #1

**Área** 6. CALDERAS

- **Líquido o estado** Búnker
- **Motor registrado en la columna de bomba** Marathon · WV M 56T17F5321J. El [ensayo Texas A&M, tabla C-1](https://oaktrust.library.tamu.edu/server/api/core/bitstreams/25f3165f-14f0-42cb-aac4-78fa04f58588/content) identifica el código base como motor G581, 0,5 HP y 1.725 rpm.
- **Ficha del motor de referencia** Marathon G581, 56C con patas y cara C, trifásico, 208–230/460 V a 60 Hz, rodamientos 6203 en ambos lados. Cotejar la placa del motor instalado. [Ficha Marathon y referencia de plano G581.pdf](https://marathon-motors.com/g581-1-2-hp-1800-rpm-56c-fr-208-230-460-vac-3-ph-tefc-c-face-footed-general-purpose-standard-efficiency-056t17f5321/).
- **Ficha, hoja de datos y CAD de bomba** Pendientes marca, modelo y serie de la placa del cuerpo hidráulico.

## B75 · Búnker

**Área** 6. CALDERAS

- **Líquido o estado** Búnker
- **Motor** ECHTOP · T 801-4 · HP: 0.75 · RPM: 1710
- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

## B76 · Búnker diario #2

**Área** 6. CALDERAS

- **Líquido o estado** Búnker
- **Motor registrado en la columna de bomba** Marathon · WV M 56T17F5321J. El [ensayo Texas A&M, tabla C-1](https://oaktrust.library.tamu.edu/server/api/core/bitstreams/25f3165f-14f0-42cb-aac4-78fa04f58588/content) identifica el código base como motor G581, 0,5 HP y 1.725 rpm.
- **Ficha del motor de referencia** Marathon G581, 56C con patas y cara C, trifásico, 208–230/460 V a 60 Hz, rodamientos 6203 en ambos lados. Cotejar la placa del motor instalado. [Ficha Marathon y referencia de plano G581.pdf](https://marathon-motors.com/g581-1-2-hp-1800-rpm-56c-fr-208-230-460-vac-3-ph-tefc-c-face-footed-general-purpose-standard-efficiency-056t17f5321/).
- **Ficha, hoja de datos y CAD de bomba** Pendientes marca, modelo y serie de la placa del cuerpo hidráulico.

## SB 20-6 · Diferencia de montaje entre DIN y ANSI

Para B77–B80, STAIRS publica dos configuraciones de 60 Hz. La versión DIN DN50 tiene H1/H2 de 709/1.154 mm, coincidentes con el dibujo de referencia del expediente. La versión ANSI con motor NEMA recomendado de 15 HP y bastidor 254TC tiene H1 de 27,46 pulgadas (697,5 mm). El plano ANSI (p. impresa 32) indica brida de 2 pulgadas, 250 lb RF, Ø exterior 6½ pulgadas y círculo de pernos de 5 pulgadas. [DXF de interfaz ANSI candidata](Documentos-bombas-Vocatus/STAIRS-SB20-6-ANSI-NEMA-interfaz-candidata.dxf). Confirmar patrón de brida y bastidor de cada bomba antes de aplicar el DXF correspondiente. [Catálogo STAIRS DIN](https://www.stairs.com.tw/files/SB%2CSBI%2CSBN_60Hz_Catalog_Download.pdf) · [Catálogo STAIRS ANSI/NEMA](https://www.stairs.com.tw/wp-content/uploads/2023/06/10.SBSBISBN_Series_NEMA_60Hz.pdf).

### Despiece candidato del sello STAIRS SB

| Posición | Pieza o referencia |
|---:|---|
| 1–4 | Camisa del eje, anillo giratorio, anillo fijo y base del sello |
| 5–6 | Resorte de compresión y casquillo |
| 7 | Junta AS568-114 en ranura del eje |
| 8 | Junta AS568-211 dentro del casquillo |
| 9 | Junta AS568-120 en el anillo fijo |
| 10 | Junta AS568-123 en la base del sello |
| 11 | Tornillo con hexágono interior |

La posición 8 figura abreviada como AS56-211 en la leyenda y como AS568-211 en los pasos de desmontaje y montaje. Las referencias identifican el tamaño de junta. El material del elastómero, las caras del sello y el código del kit siguen pendientes de confirmar en las unidades instaladas. Aplica como referencia candidata a B77–B80 y a B59 si se confirma la familia SB. [Manual STAIRS SB 10/15/20, pp. 2–5](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf#page=2).


B81–B83 están en el área 8, Tanque Condensado. Los TAG B77–B80 pertenecen al área 7, Zona Franca. La continuidad de los nombres Bomba #1 a #7 queda como referencia de numeración; no acredita una configuración compartida.


## B77 · Bomba #1

**CAD de referencia SB** [DXF 2D ABS SB 20-6 DIN](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-referencia.dxf). H1 709 mm y H2 1.154 mm. El plano incluye 300 mm entre caras, eje a 90 mm y detalle de brida DIN DN50 con círculo de pernos Ø125 mm y cuatro agujeros Ø19 mm. Contorno y giro de agujeros reconstruidos. [Plano ABS, pág. PDF 33](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=33). La marca y el sufijo (M) de la bomba instalada siguen pendientes. [Envolvente 3D DXF](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-envolvente-3D.dxf). Mallas esquemáticas con H1/H2 y conexiones de catálogo. Espesor de brida, perfil del motor y carcasa estimados; perforaciones omitidas.

**Cotejo de altura SB** [Curva ABS SB 20, pág. PDF 32](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=32). A 111 US GPM la curva de seis etapas pasa cerca de 100 m, frente a 99 m registrados. Coincidencia hidráulica de referencia; marca y sufijo pendientes. [Manual del sello STAIRS SB 10/15/20, referencia candidata](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf).

**Contraste de caudal SB** 111 US GPM ≈ 25,2 m³/h, dentro del rango de familia SB 20 (12,5–35 m³/h). [Catálogo ABS, pág. 3](https://absbombas.com/wp-content/uploads/2020/06/CAT%C3%81LOGO-BOMBAS-CENTRIFUGAS-ABS-SERIE-SB-SBI-SBN.pdf#page=3). Compatibilidad de caudal de familia. Fabricante, altura en la curva y sufijo (M) pendientes.

**Área** 7. ZONA FRANCA

- **Líquido o estado** Agua
- **Bomba y datos registrados** SB Model: 20-6 (M) · GPM: 111 · RPM: 3450 · HD [m]: 99
- **Tamaño** Bomba vertical
- **Observaciones** ZEBOL
- **Ficha o referencia del fabricante** [Catálogo STAIRS, fabricante candidato](https://www.stairs.com.tw/index.php/downloads/)
- **CAD** CAD pendiente. Confirmar fabricante, modelo y sufijo.

## B78 · Bomba #2

**CAD de referencia SB** [DXF 2D ABS SB 20-6 DIN](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-referencia.dxf). H1 709 mm y H2 1.154 mm. El plano incluye 300 mm entre caras, eje a 90 mm y detalle de brida DIN DN50 con círculo de pernos Ø125 mm y cuatro agujeros Ø19 mm. Contorno y giro de agujeros reconstruidos. [Plano ABS, pág. PDF 33](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=33). La marca y el sufijo (M) de la bomba instalada siguen pendientes. [Envolvente 3D DXF](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-envolvente-3D.dxf). Mallas esquemáticas con H1/H2 y conexiones de catálogo. Espesor de brida, perfil del motor y carcasa estimados; perforaciones omitidas.

**Cotejo de altura SB** [Curva ABS SB 20, pág. PDF 32](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=32). A 111 US GPM la curva de seis etapas pasa cerca de 100 m, frente a 99 m registrados. Coincidencia hidráulica de referencia; marca y sufijo pendientes. [Manual del sello STAIRS SB 10/15/20, referencia candidata](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf).

**Contraste de caudal SB** 111 US GPM ≈ 25,2 m³/h, dentro del rango de familia SB 20 (12,5–35 m³/h). [Catálogo ABS, pág. 3](https://absbombas.com/wp-content/uploads/2020/06/CAT%C3%81LOGO-BOMBAS-CENTRIFUGAS-ABS-SERIE-SB-SBI-SBN.pdf#page=3). Compatibilidad de caudal de familia. Fabricante, altura en la curva y sufijo (M) pendientes.

**Área** 7. ZONA FRANCA

- **Líquido o estado** Agua
- **Bomba y datos registrados** SB Model: 20-6 (M) · GPM: 111 · RPM: 3450 · HD [m]: 99
- **Tamaño** Bomba vertical
- **Observaciones** ZEBOL
- **Ficha o referencia del fabricante** [Catálogo STAIRS, fabricante candidato](https://www.stairs.com.tw/index.php/downloads/)
- **CAD** CAD pendiente. Confirmar fabricante, modelo y sufijo.

## B79 · Bomba #3

**CAD de referencia SB** [DXF 2D ABS SB 20-6 DIN](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-referencia.dxf). H1 709 mm y H2 1.154 mm. El plano incluye 300 mm entre caras, eje a 90 mm y detalle de brida DIN DN50 con círculo de pernos Ø125 mm y cuatro agujeros Ø19 mm. Contorno y giro de agujeros reconstruidos. [Plano ABS, pág. PDF 33](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=33). La marca y el sufijo (M) de la bomba instalada siguen pendientes. [Envolvente 3D DXF](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-envolvente-3D.dxf). Mallas esquemáticas con H1/H2 y conexiones de catálogo. Espesor de brida, perfil del motor y carcasa estimados; perforaciones omitidas.

**Cotejo de altura SB** [Curva ABS SB 20, pág. PDF 32](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=32). A 111 US GPM la curva de seis etapas pasa cerca de 100 m, frente a 99 m registrados. Coincidencia hidráulica de referencia; marca y sufijo pendientes. [Manual del sello STAIRS SB 10/15/20, referencia candidata](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf).

**Contraste de caudal SB** 111 US GPM ≈ 25,2 m³/h, dentro del rango de familia SB 20 (12,5–35 m³/h). [Catálogo ABS, pág. 3](https://absbombas.com/wp-content/uploads/2020/06/CAT%C3%81LOGO-BOMBAS-CENTRIFUGAS-ABS-SERIE-SB-SBI-SBN.pdf#page=3). Compatibilidad de caudal de familia. Fabricante, altura en la curva y sufijo (M) pendientes.

**Área** 7. ZONA FRANCA

- **Líquido o estado** Agua
- **Bomba y datos registrados** SB Model: 20-6 (M) · GPM: 111 · RPM: 3450 · HD [m]: 99
- **Tamaño** Bomba vertical
- **Observaciones** ZEBOL
- **Ficha o referencia del fabricante** [Catálogo STAIRS, fabricante candidato](https://www.stairs.com.tw/index.php/downloads/)
- **CAD** CAD pendiente. Confirmar fabricante, modelo y sufijo.

## B80 · Bomba #4

**CAD de referencia SB** [DXF 2D ABS SB 20-6 DIN](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-referencia.dxf). H1 709 mm y H2 1.154 mm. El plano incluye 300 mm entre caras, eje a 90 mm y detalle de brida DIN DN50 con círculo de pernos Ø125 mm y cuatro agujeros Ø19 mm. Contorno y giro de agujeros reconstruidos. [Plano ABS, pág. PDF 33](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=33). La marca y el sufijo (M) de la bomba instalada siguen pendientes. [Envolvente 3D DXF](Documentos-bombas-Vocatus/ABS-SB-20-6-DIN-envolvente-3D.dxf). Mallas esquemáticas con H1/H2 y conexiones de catálogo. Espesor de brida, perfil del motor y carcasa estimados; perforaciones omitidas.

**Cotejo de altura SB** [Curva ABS SB 20, pág. PDF 32](Documentos-bombas-Vocatus/ABS-SB-SBI-SBN-catalogo.pdf#page=32). A 111 US GPM la curva de seis etapas pasa cerca de 100 m, frente a 99 m registrados. Coincidencia hidráulica de referencia; marca y sufijo pendientes. [Manual del sello STAIRS SB 10/15/20, referencia candidata](Documentos-bombas-Vocatus/STAIRS-SB-10-15-20-manual.pdf).

**Contraste de caudal SB** 111 US GPM ≈ 25,2 m³/h, dentro del rango de familia SB 20 (12,5–35 m³/h). [Catálogo ABS, pág. 3](https://absbombas.com/wp-content/uploads/2020/06/CAT%C3%81LOGO-BOMBAS-CENTRIFUGAS-ABS-SERIE-SB-SBI-SBN.pdf#page=3). Compatibilidad de caudal de familia. Fabricante, altura en la curva y sufijo (M) pendientes.

**Área** 7. ZONA FRANCA

- **Líquido o estado** Agua
- **Bomba y datos registrados** SB Model: 20-6 (M) · GPM: 111 · RPM: 3450 · HD [m]: 99
- **Tamaño** Bomba vertical
- **Observaciones** ZEBOL
- **Ficha o referencia del fabricante** [Catálogo STAIRS, fabricante candidato](https://www.stairs.com.tw/index.php/downloads/)
- **CAD** CAD pendiente. Confirmar fabricante, modelo y sufijo.

## B81 · Bomba #5

**Área** 8. TANQUE CONDENSADO

- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

## B82 · Bomba #6

**Área** 8. TANQUE CONDENSADO

- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.

## B83 · Bomba #7

**Área** 8. TANQUE CONDENSADO

- **Ficha de fabricante** Pendiente de identificar la bomba.
- **CAD** Pendiente de identificar la bomba.
