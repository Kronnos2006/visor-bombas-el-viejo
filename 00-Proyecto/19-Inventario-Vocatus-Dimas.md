---
tipo: inventario
fuente: "Libro1.xlsx · hoja Bombas"
fuente_fecha: 2026-10-07
revision: 2026-10-07
equipos_documentados: 77
filas_reservadas: "B78, B79"
---

# Inventario de bombas y motores · Vocatus

Transcripción de la hoja **Bombas** del Excel que entregó Dimas. **77 equipos
documentados**, B1 a B77. Las filas **B78** y **B79** existen en el Excel pero
están vacías: son filas reservadas y **no cuentan** como equipos.

Original en `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx`.
Versión tabulada con el texto original de cada celda en `bombas-vocatus.csv`.
Una ficha por equipo en [[equipos/_INDICE-equipos|equipos/]].

## Cómo leer este inventario

Cada dato tiene un nivel, y los niveles no se mezclan:

| Nivel | Qué significa |
|---|---|
| **documental** | está escrito en el Excel o en una placa legible |
| **inferido** | conclusión técnica razonable, **no escrita** en la fuente |
| **pendiente** | necesita catálogo, placa, medición o confirmación en campo |

Una celda vacía en el Excel queda vacía en la ficha. No se estima nada.

La confianza tampoco es un valor único. Cada ficha trae tres:

- `confianza_transcripcion` — qué tan fiel es la copia del Excel
- `confianza_identificacion` — si se sabe cuál equipo físico es
- `asociacion_placa` — si hay una placa fotografiada asociada y con qué grado

Una transcripción puede ser exacta aunque la identificación física siga pendiente.
Eso es lo que pasa hoy con 62 de los 77 equipos.

## Cobertura de la fuente

| Dato | Equipos con dato | De 77 |
|---|---|---|
| Marca de bomba (escrita) | 70 | 77 |
| Catálogo | 5 | 77 |
| Modelo | 74 | 77 |
| Designación de tamaño | 56 | 77 |
| Tipo de sello | 46 | 77 |
| Diámetro de eje en el sello | 46 | 77 |
| Diámetro de impulsor | 55 | 77 |
| Rodamiento delantero | 62 | 77 |
| Rodamiento trasero | 62 | 77 |
| Elemento de acople | 25 | 77 |
| Marca de motor | 68 | 77 |

## Sellado

| Situación | Equipos |
|---|---|
| Sello mecánico documentado | 46 |
| Empaquetadura documentada | 2 (B51, B52) |
| **Sin dato de sellado en el Excel** | 29 |

Los tipos de sello que aparecen escritos:

| Sello | Eje | Equipos |
|---|---|---|
| Tipo 1 (O) - Tipo 21 (G) | 1.1/2" | 2 |
| Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | 5 |
| Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | 18 |
| Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | 21 |
| Empaquetadura de cordón nylon (sección 3/8") | no aplica | 2 |

**Advertencia sobre la empaquetadura de B51 y B52.** El Excel dice
«Empaquetadura de cordón nylon 3/8"». Esa medida es la **sección del cordón**.
No es el diámetro del eje. La versión anterior de estas fichas lo había tomado
como eje de 8 pulgadas; está corregido. Ver [[23-Auditoria-importacion-Libro1]].

## Correlación sufijo ↔ eje del sello

En los 46 equipos con sello documentado, el sufijo de la designación acompaña
siempre al mismo diámetro de eje:

| Sufijo | Eje en el sello |
|---|---|
| `STO` · `ST` | 1.3/8" |
| `MTO` · `MT` | 1.3/4" |
| `LF` | el Excel no trae sello para este grupo |

Esto es **una correlación observada en la fuente**, no una regla que el Excel
enuncie. La explicación probable es la norma ANSI/ASME B73.1, pero eso es
**inferencia**: ver [[21-Datos-del-modelo]].

## Unidades del impulsor

El Excel rotula la unidad entre corchetes y no siempre lo hace igual. Lo que hay:

| Rótulo en el Excel | Equipos | Tratamiento |
|---|---|---|
| `[mm]` | la mayoría | se guarda como mm |
| `[pulg]` | B58, B60, B61, B66, B67, B68, B69 | se guarda como pulg |
| `[pilg]` | B60 (máximo) | error de digitación, se lee pulg |
| `[XX]` | B13 | se registra en pulg con estado explícito |
| `[mm]` con valor 13 | B62, B63, B64, B65 | **unidad inconsistente**, ver abajo |

**B62 a B65.** El Excel dice 13 mm. Pero son Titan 4196 `3X4-13 MT`, la misma
familia que B60 y B61, y esas dos dicen 13 **pulgadas**. No se corrigió en
silencio: la ficha conserva `impulsor_valor_original: 13` con
`impulsor_unidad_original: mm` y un `impulsor_estado` que dice que hay que
verificarlo contra placa o catálogo. 13 mm **no** se presenta como medida
confirmada.

## Problemas de la propia fuente

Cosas que hay que confirmar con Dimas antes de usar el Excel como fuente única:

- La columna **«Elastómero eje»** no contiene elastómeros: contiene elementos de
  acople (REXNORD ES-4R, OMEGA E20, WRAPFLEX 30R, LoveJoy L-100). En el CSV y en
  las fichas se tabuló como `acople`.
- Las columnas **«Rol Delantero / Rol Trasero»** no dicen si los rodamientos son
  de la bomba o del motor. Todas las fichas llevan
  `rodamientos_pertenecen_a: "por confirmar"`.
- **B17** tiene «TITAN 4196» en la columna de motor, que es un modelo de bomba.
  No se registró marca de motor.
- **B51** y **B52** escriben «HDROMAC». Probable error de digitación por HIDROMAC.
  Se conserva tal cual.
- **B57** y **B74** a **B77** dicen «SB Model: …». Eso no acredita que SB sea el
  fabricante: la marca quedó vacía con `marca_estado: "por confirmar"`.
- **B71** y **B73** traen una referencia MARATHON en la columna de bomba, que es
  marca de motores.
- **B22** (Tanque lavados de Aceite) está marcada **SIN USO** y sin datos.
- **B78** y **B79**: filas reservadas, sin información. Sin ficha.

---

## 1. DESTILACIÓN PLANTA DUSA · 14 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B1]] | Alimentación Mosto Fermentado DUSA | Mosto | HIDROMAC 2196 | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B2]] | Alimentación Mosto Fermentado DUSA | Mosto | HIDROMAC 2196 | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B3]] | Columna Aldehído 2 | Alcohol | HIDROMAC 2196 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B4]] | Columna Rectificadora 2 | Alcohol | HIDROMAC 2196 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B5]] | Columna Aldehído 1 | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B6]] | Columna Aldehído 1 | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B7]] | Columna Rectificadora 1 | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B8]] | Columna Rectificadora 1 | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B9]] | Columna Rectificadora Batch | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B10]] | Columna Rectificadora Batch | Alcohol | HIDROMAC 2196 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B11]] | Columna Vinaza | Mosto - Vinaza | HIDROMAC 2196 | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B12]] | Columna Vinaza | Mosto | HIDROMAC 2196 | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B13]] | Alambique - Código UQ | Alcohol | TITAN 4196 | `1X1.5-8 ST` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B14]] | Alambique - Código UQ | Alcohol | HIDROMAC 2196 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |

## 2. DESTILACIÓN PLANTA PRAJ · 8 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B15]] | Alimentación Mosto Fermentado Hindú | Mosto | MULTISTEEL RSA 25/205 | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B16]] | Alimentación Mosto Fermentado Hindú | Mosto | MULTISTEEL RSA 25/205 | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B17]] | Columna Rectificadora | Alcohol | DURCO 62392 | `1X1.5-6 ST` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B18]] | Columna Purificadora | Alcohol | DURCO 62392 | `—` | **sin dato** | — |
| [[B19]] | Columna Mosto | Mosto | DURCO 62392 | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B20]] | Tanque Condensados | Agua | DURCO 62392 | `—` | **sin dato** | — |
| [[B21]] | Tanque Reflujos Rectificadora | Agua / Alcohol | DURCO 62391 | `—` | **sin dato** | — |
| [[B22]] | Tanque lavados de Aceite | SIN USO | (marca por confirmar)  | `—` | **sin dato** | — |

## 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO. · 21 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B23]] | Tanque UQ | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B24]] | Tanque FW | Alcohol | HIDROMAC 2196 | `1X1.5X8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B25]] | Tanque FW | Alcohol | HIDROMAC 2196 | `1X1.5X8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B26]] | Tanque Destrucción | Alcohol | HIDROMAC 2196 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B27]] | Carga Batch | Alcohol | HIDROMAC 2196 | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B28]] | Carga Batch | Alcohol | HIDROMAC 2196 | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B29]] | Tanque Millonario | Alcohol | HIDROMAC 2196 | `1.5X3-18 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B30]] | Tanque LW1 | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B31]] | Tanque LW2 | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B32]] | Cabezas & Colas | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B33]] | Cabezas & Colas | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B34]] | Despacho DUSA | Alcohol | HIDROMAC 2196 | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B35]] | Despacho DUSA | Alcohol | HIDROMAC 2196 | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B36]] | Despacho Panamá | Alcohol | HIDROMAC 2196 | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B37]] | Alimentación Aldehído | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B38]] | Tanque Producción HO | Alcohol | HIDROMAC 2196 | `1X1.5-8 LF` | **sin dato** | — |
| [[B39]] | Tanque Producción Diaria Hindú | Alcohol | GOULDS 2X2 1/2-6-2P | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" |
| [[B40]] | Tanque Blender | Alcohol | GOULDS 2X2 1/2-6-2P | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" |
| [[B41]] | Tanque Reproceso | Alcohol | GOULDS 2X2 1/2-6-2P | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" |
| [[B42]] | Rechazo | Alcohol | GOULDS 2X2 1/2-6-2P | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" |
| [[B43]] | Despacho Hindú | Alcohol | GOULDS 2X2 1/2-6-2P | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" |

## 4. FERMENTACIÓN · 16 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B44]] | Agua de dilución | Agua | HIDROMAC AZ 3X4X12A SMCDV | `3X4X12` | Tipo 1 (O) - Tipo 21 (G) | 1.1/2" |
| [[B45]] | Agua de dilución | AGUA | HIDROMAC AZ 3X4X12A SMCDV | `3X4X12` | Tipo 1 (O) - Tipo 21 (G) | 1.1/2" |
| [[B46]] | Pie de Cubas | Mosto | HIDROMAC 2196 | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B47]] | Pie de Cubas | Mosto | HIDROMAC 2196 | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| [[B48]] | Caño | Agua | MULTISTEEL RA65/300 | `—` | **sin dato** | — |
| [[B49]] | Tanque Esterilizador | Melaza | HIDROMAC 2196 | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B50]] | Tanque Esterilizador | Melaza | HIDROMAC 2196 | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B51]] | Tanque Romana | Melaza | HDROMAC 220106-2 | `3X3` | empaquetadura | — |
| [[B52]] | Tanque Romana | Melaza | HDROMAC 220106-2 | `3X3` | empaquetadura | — |
| [[B53]] | Descarga Fermentadores | Mosto | HIDROMAC 2196 | `3X4-7 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B54]] | Descarga Fermentadores | Mosto | HIDROMAC 2196 | `3X4-7 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B55]] | Tanque agua DM #1 | Agua | MULTISTEEL RA65/300 | `—` | **sin dato** | — |
| [[B56]] | Tanque agua DM #2 | Agua | MULTISTEEL RA65/300 | `—` | **sin dato** | — |
| [[B57]] | Tanque PF | Agua con soda | (marca por confirmar) 15-5(M) | `—` | **sin dato** | — |
| [[B58]] | Tanque Verde (en desuso) | Agua | PACO PUMPS  | `—` | **sin dato** | — |
| [[B59]] | CIP viejo (en desuso) | Agua con soda | MULTISTEEL RSA32/2025 | `—` | **sin dato** | — |

## 5. TORRES DE ENFRIAMIENTO · 6 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B60]] | Torre de Enfriamiento #1 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B61]] | Torre de Enfriamiento #1 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B62]] | Torre de Enfriamiento #1 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B63]] | Torre de Enfriamiento #2 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B64]] | Torre de Enfriamiento #2 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |
| [[B65]] | Torre de Enfriamiento #2 | Agua | TITAN 4196 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |

## 6. CALDERAS · 8 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B66]] | Caldera #2 | Agua con químicos | EBARA AEVMSU5-9F0500T3S | `—` | **sin dato** | — |
| [[B67]] | Caldera #2 | Agua con químicos | EBARA AEVMSU5-9F0500T3S | `—` | **sin dato** | — |
| [[B68]] | Caldera #3 | Agua con químicos | GRUNDFOS CR15-6K-GJ-A-E-HQQE-NX2 | `—` | **sin dato** | — |
| [[B69]] | Caldera #3 | Agua con químicos | GRUNDFOS CR15-6K-GJ-A-E-HQQE-NX2 | `—` | **sin dato** | — |
| [[B70]] | Atemperador | Agua | MOVITEC VF 4/8B | `—` | **sin dato** | — |
| [[B71]] | Búnker diario #1 | Búnker | MARATHON WV M 56T17F5321J | `—` | **sin dato** | — |
| [[B72]] | Búnker | Búnker | (marca por confirmar)  | `—` | **sin dato** | — |
| [[B73]] | Búnker diario #2 | Búnker | MARATHON WV M 56T17F5321J | `—` | **sin dato** | — |

## 7. ZONA FRANCA · 4 equipos

| ID | Ubicación | Líquido | Bomba | Tamaño | Sello | Eje |
|---|---|---|---|---|---|---|
| [[B74]] | Bomba #1 | Agua | (marca por confirmar) 20-6 (M) | `Bomba vertical` | **sin dato** | — |
| [[B75]] | Bomba #2 | Agua | (marca por confirmar) 20-6 (M) | `Bomba vertical` | **sin dato** | — |
| [[B76]] | Bomba #3 | Agua | (marca por confirmar) 20-6 (M) | `Bomba vertical` | **sin dato** | — |
| [[B77]] | Bomba #4 | Agua | (marca por confirmar) 20-6 (M) | `Bomba vertical` | **sin dato** | — |

Relacionado: [[equipos/_INDICE-equipos]], [[20-Control-cruzado-placas]], [[21-Datos-del-modelo]], [[22-Pedido-al-fabricante]], [[23-Auditoria-importacion-Libro1]]
