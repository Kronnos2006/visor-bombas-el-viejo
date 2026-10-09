# 13 — Hallazgo: las bombas son norma ANSI B73.1

Fecha: 2026-10-07. Origen: levantamiento fotográfico del sector
([[12-Levantamiento-fotografico-del-area]]).

## El dato

Las placas fotografiadas dicen **Hidromac 2196**, con designaciones de tamaño:

| Serie | Designación | Fotos |
|---|---|---|
| 210771-1 / -2 / -3 / -5 | `1 × 1.5 – 8 LF` | 110829, 110905, 110916, 111538 |
| 220105-1 / -2 | `3 × 4 – 8 G` | 110953, 111014 |

Ese formato — **descarga × succión – diámetro nominal de impulsor + grupo** —
es la nomenclatura de las bombas de proceso **ANSI / ASME B73.1**, el mismo
patrón de la serie Goulds 3196. El número de modelo 2196 apunta a lo mismo.

> **Por confirmar contra el catálogo Hidromac.** No dar por hecha la
> intercambiabilidad hasta tenerlo por escrito del fabricante o del
> representante en Costa Rica.

## Por qué esto cambia el proyecto

ANSI B73.1 no es una marca: es una **norma dimensional**. Define medidas de
montaje, altura de línea de centros, bridas y, lo más importante para
nosotros, la **cámara de sellado**.

Consecuencias directas:

**1. El despiece deja de ser genérico.**
La arquitectura B73.1 es fija: *back pull-out*, impulsor abierto, carcasa,
tapa de carcasa, cámara de sellado, camisa de eje, bastidor de rodamientos
(power end), acople espaciador. Eso ya lo podemos dibujar con fundamento,
no como ilustración.

**2. El diámetro de eje en el sello sale del grupo, no del fluido.**
En B73.1 el *power end* viene en grupos (LF / S / M / L, o 1 / 2 / 3). Cada
grupo tiene su diámetro de eje en la cámara de sellado. Si confirmamos el
grupo de cada bomba, acotamos el tamaño de sello **antes de medir en campo**.

- `1 × 1.5 – 8 LF` → grupo LF (low flow)
- `3 × 4 – 8 G` → grupo intermedio; confirmar la letra

**3. Los repuestos son estándar.**
Sellos mecánicos y o-rings para cámara de sellado B73.1 los fabrican John
Crane, Flowserve, Chesterton y otros, por grupo y diámetro. No dependemos de
que Hidromac tenga repuesto.

**4. Hay documentación pública.**
Los manuales IOM de bombas 3196 traen vistas de despiece con números de ítem
y listas de partes. Sirven como referencia de arquitectura mientras
conseguimos el documento de Hidromac.

## Lo que hay que hacer con esto

1. Conseguir el **catálogo o manual de Hidromac 2196** — vía el representante
   en Costa Rica o bodega. Es el documento que confirma todo lo anterior.
2. Confirmar el **grupo de power end** de cada una de las seis placas.
3. Con el grupo confirmado, **el diámetro de eje en el sello queda acotado**:
   el levantamiento en campo pasa de medir a verificar.
4. Rehacer el despiece del visor con la arquitectura B73.1 real.

## Lo que NO se puede concluir todavía

- Qué TAG del P&ID corresponde a cada número de serie. Las fotos no lo
  permiten; hay que ir con la lista de 15 TAG y emparejar en campo.
- Si estas seis bombas son parte de las 15 del proyecto D-18033 o son
  equipos agregados después.
- El material de caras y elastómero: eso depende del fluido, no de la norma.

## Lo que cambió en el visor (2026-10-07)

El despiece del visor dejó de ser genérico. Ahora las diez piezas son las
del conjunto B73.1 de desarme posterior, en el orden real del eje:

| Nº | Pieza | Catálogo |
|---|---|---|
| 01 | Carcasa (voluta) | Casing |
| 02 | Empaque de carcasa | Casing gasket · o-ring confinado |
| 03 | Impulsor abierto | Impeller |
| 04 | Tapa de carcasa | Casing cover |
| 05 | Cámara de sello | Seal chamber · big bore |
| 06 | Sello mecánico de cartucho | Cartridge mechanical seal |
| 07 | Eje | Shaft |
| 08 | Bancada de rodamientos | Bearing frame · power end |
| 09 | Acople espaciador | Spacer coupling |
| 10 | Motor brida JM | JM-flange motor |

Cada pieza lleva su nombre de catálogo en inglés, para cruzarla con el
despiece del fabricante cuando llegue, y una nota de norma. La pieza 06
pide los once campos de compra del sello; la pieza 10 es la única con
repuestos ya confirmados por placa (6309-2Z-J/C3 y 6308-2Z-J/C3).

Lo que esto **no** es: un plano de taller. La arquitectura es de norma, la
geometría no está dimensionada y ninguna medida del modelo sirve para
comprar. La prueba `test-despiece.mjs` bloquea dos cosas: que una pieza
consulte una clave que la ficha no tiene, y que desaparezca del visor la
advertencia de que no es plano de taller.

Relacionado: [[12-Levantamiento-fotografico-del-area]]
