---
fecha: 2026-10-07
estado: orientacion-corregida
---

# 14 — Índice de las 41 fotos y lectura de placas

[[12-Levantamiento-fotografico-del-area|Levantamiento]] · [[13-Hallazgo-ANSI-B73|Hallazgo ANSI B73.1]]

## Corrección de orientación

Cinco fotos de placa estaban giradas 90° y no se podían leer. Se corrigieron
y se reemplazaron en `Consulta/` y en `visor-bombas/public/fotos/`:

| Archivo | Giro aplicado |
|---|---|
| 20261007_080730 | +90° |
| 20261007_080739 | +90° |
| 20261007_110805 | +90° |
| 20261007_111146 | −90° |
| 20261007_111524 | +90° |

Quedan tres verticales (111150, 111447, 111451): están bien así, son tomas
en vertical de motor y pasillo.

Los originales HEIC **no se tocaron**, y es correcto que queden así.

### Por qué estaban giradas — causa confirmada

Se revisó el EXIF de los 41 HEIC originales: **los 41 tienen
`Orientation = 1` (normal)**. No hay rotación EXIF que se haya perdido al
convertir. El teléfono guardó esas cinco tomas con el contenido ya acostado
dentro de un marco vertical de 1848×4000.

Consecuencia práctica: **no hay nada que corregir en el script de
conversión.** `revisar_fotos.py` hizo bien su trabajo. La corrección es
editorial —girar esas cinco imágenes— y solo aplica a las copias de consulta.

Las cinco se **regeneraron desde el HEIC original** a 2200 px con el giro ya
aplicado, para no arrastrar doble compresión. Se reemplazaron también en
`visor-bombas/public/fotos/`.

## Clasificación de las 41 fotos

| Tipo | Cantidad | Fotos |
|---|---|---|
| **Placa de bomba** | 9 | 02, 03, 04, 05, 07, 09, 10, 15, 16, 34, 35 |
| **Placa de motor** | 1 | 20 |
| **Conjunto completo** | 12 | 06, 08, 11, 12, 13, 17, 28, 29, 30, 33, 36, 37 |
| **Detalle de motor / acople** | 4 | 14, 19, 21, 22 |
| **Equipo distinto (amarillo)** | 1 | 01 |
| **Vista general del patio de tanques** | 14 | 18, 23–27, 31, 32, 38, 39, 40, 41 |

> La foto 40 (`111845`) es la referencia frontal: cinco conjuntos sobre la
> plataforma, frente al muro, junto a la escalera amarilla.

## Placas leídas tras enderezar

Lectura visual. **Todas por confirmar contra la placa física.**

### Hidromac 2196 — 210770-1 · fotos 02 y 03
- SIZE `1X1.5-8 STO I`
- GPM 96 · HD 15.2 m · RPM 1750
- Impulsor 178 mm (máx. 205 mm)
- Material de construcción **316 SS**
- Lubricación: **aceite**

### Hidromac 2196 — 210775-2 · foto 05
- SIZE `3X1X8 G MTO I` (los dígitos centrales son dudosos)
- GPM 200 · HD 15.2 m · RPM 1750
- Impulsor 200 mm (máx. 215 mm)
- Material **316 SS** · TD A70

### Hidromac 2196 — 210770-7 · foto 34
- SIZE `1X1.5X8 STO I`
- GPM 60 · HD 12.2 m · RPM 1750
- Impulsor 174 mm (máx. 205 mm)
- Material **316 SS**

### Motor eléctrico · foto 20 — **primer repuesto confirmado del proyecto**
- **7.5 HP · 1750 RPM · 230/460 V · 19.6/9.8 A · 60 Hz · 3 fases**
- Carcasa **213JM** (brida JM, propia de bombas ANSI)
- Encerramiento **TEFC** · aislamiento clase F · servicio continuo
- Peso 145 lb · eficiencia nominal NEMA 89.5 %
- **Rodamiento lado acople: 6309-2Z-J/C3**
- **Rodamiento lado opuesto: 6308-2Z-J/C3**

> Esos dos números de rodamiento son **códigos de repuesto reales y
> comprables**. Son los primeros datos duros de repuesto que entra al
> proyecto. Van directo a la ficha de la bomba que corresponda, una vez
> identificada.

## Series distintas detectadas hasta ahora

`210770-1` · `210770-7` · `210771-1` · `210771-2` · `210771-3` · `210771-5`
· `210775-2` · `220105-1` · `220105-2` · Titan `027167`

Son **hasta 10 equipos distintos**, no 6.

Dos observaciones:

- La serie `210771` va de -1 a -5 y falta el **-4**. Probablemente existe y
  no se fotografió.
- ~~Las lecturas `210775-2` y `220105-2` se parecen, verificar en campo.~~
  **Resuelto el 2026-10-07** leyendo ambas placas a resolución completa desde
  los HEIC: son **dos bombas distintas**, las dos de tamaño 3X4-8G.

  | Foto | SIZE | SER |
  |---|---|---|
  | 110805 | `3X4X8G MTO I` | **210775-2** |
  | 110953 | `3X4-8G MTO I` | **220105-2** |

  La 110805 añade: GPM 200 · HD 15.2 m · RPM 1750 · TD A70 · 316 SS ·
  máx. diseño 49 PSI @ 100 °F.

## Dos fabricantes, una misma norma

La foto 04 es una placa **Titan Manufacturing modelo 4196**, SIZE `1X1.5-8 ST`,
serie 027167, Houston TX. Titan 4196 es también una bomba de proceso
**ANSI B73.1**, del mismo tamaño que las Hidromac 1X1.5-8.

Eso refuerza [[13-Hallazgo-ANSI-B73]] y agrega algo útil: **dos marcas
distintas, misma norma, mismo tamaño** significa que los repuestos de
sellado deberían ser intercambiables. Confirmar con el fabricante.

## Qué falta

1. Emparejar cada número de serie con su TAG del P&ID — en campo.
2. Fotografiar la placa de la `210771-4` si existe.
3. Confirmar el sufijo de tamaño: se leen `STO I`, `MTO I`, `LF` y `ST`
   en distintas placas. Hay que saber qué significa cada uno.
4. Placas de los demás motores: cada una da sus códigos de rodamiento.
