---
tipo: especificacion
revision: 2026-10-07
regla: tres niveles de dato, sin estimaciones
---

# Datos del modelo · qué entra y qué no

Esta nota fija la regla del inventario, del despiece y del futuro visor. Existe
para que nadie —ni vos, ni yo, ni la IA que consulte después— rellene un hueco
con una suposición.

## La regla

| Nivel | Origen | ¿Entra al modelo? |
|---|---|---|
| **documental** | escrito en `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx` o en una placa legible | **sí**, con su valor y unidad originales |
| **inferido** | conclusión técnica razonable, no escrita en la fuente | **sí, pero rotulado como inferencia**, nunca como confirmado |
| **pendiente** | necesita catálogo, placa, medición o campo | **no**, queda vacío y listado como pendiente |

Y tres cosas que no se tocan:

1. Una celda vacía en el Excel queda vacía o marcada «por confirmar».
2. No se inventan medidas, unidades, materiales, códigos de repuesto, o-rings,
   asociaciones placa–bomba, historiales ni fabricantes.
3. Cada dato conserva fuente, fecha de la fuente, valor original, unidad original
   y estado de verificación.

## 1 · Documental

### Sellado

| Situación | Equipos |
|---|---|
| Sello mecánico escrito en el Excel | 46 |
| Empaquetadura escrita en el Excel | 2 (B51, B52) |
| Celda de sello vacía | 29 |

Un solo tipo de sello aparece en toda la planta, con cuatro diámetros de eje:

| Sello | Eje | Equipos |
|---|---|---|
| Tipo 1 (O) - Tipo 21 (G) | 1.1/2" | 2 |
| Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | 5 |
| Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | 18 |
| Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | 21 |

**El eje del sello solo es documental cuando está escrito como parte del tipo de
sello.** No se deduce de una medida que aparezca en otro contexto: por eso B51 y
B52, cuyo texto dice «cordón nylon 3/8"», tienen `sello_eje_pulg` **vacío** y
`empaque_seccion_pulg: "3/8"`.

### Unidades

El impulsor se guarda como valor + unidad, nunca como `impulsor_mm` a secas:

```yaml
impulsor_valor: "7.1875"
impulsor_unidad: "pulg"
impulsor_max_valor: "8"
impulsor_max_unidad: "pulg"
impulsor_valor_original: "7.1875"
impulsor_unidad_original: "XX"
impulsor_estado: "el Excel rotula la unidad como [XX]; …"
```

`impulsor_mm` solo se usaría si la fuente dijera expresamente mm, y ya no existe
como campo en ninguna ficha.

### Lo demás

Área, ubicación, líquido, marca, catálogo, modelo, designación de tamaño, caudal,
altura, rpm, rodamientos, acople y datos del motor — **cada uno solo donde la
celda tiene dato**. Cada ficha guarda además el texto exacto de las cuatro celdas
del Excel en `texto_original_*`, para que cualquiera pueda auditar la
transcripción sin abrir el Excel.

## 2 · Inferido

Dos inferencias, y las dos van rotuladas:

### La norma ANSI/ASME B73.1

El Excel **no menciona ninguna norma**. La clasificación sale de la familia
(Hidromac 2196, Titan 4196, Durco, Goulds) y de la forma de la designación.
Por eso las fichas llevan:

```yaml
norma_indicada: ""
norma_inferida: "ANSI/ASME B73.1"
norma_estado: "inferencia tecnica; confirmar con catalogo"
```

Alcanza a 52 de los 77 equipos. En el resto los tres campos quedan vacíos.

### La correlación sufijo ↔ eje

`STO`/`ST` → 1.3/8" y `MTO`/`MT` → 1.3/4" se cumple sin excepción en la fuente,
pero es una **observación**, no una regla enunciada por el Excel. No se usa para
rellenar el eje de un equipo cuya celda de sello está vacía — y de hecho los
siete `LF` siguen sin sello.

## 3 · Pendiente — no entra al modelo

### Del catálogo del fabricante

Seis datos por equipo con sello, ninguno en el Excel y ninguno estimable:
cara rotativa, cara estática, elastómero, resorte, código del sello, y medida y
material de cada o-ring. Agrupados en [[22-Pedido-al-fabricante]].

**Lo que esto permite y lo que no.** Tipo de sello más diámetro de eje alcanzan
para que un proveedor identifique el sello y dé un **precio preliminar**. No
alcanzan para emitir una orden de compra: eso exige materiales de caras,
elastómero y compatibilidad con el líquido del servicio.

### De la planta

| Pendiente | Equipos |
|---|---|
| Confirmar la placa en el equipo | 77 |
| Saber si los rodamientos de la lista son de la bomba o del motor | 62 con rodamientos |
| Tipo de sellado de los `LF` | 7 (B23, B30, B31, B32, B33, B37, B38) |
| Unidad real del impulsor | 4 (B62, B63, B64, B65) |
| Fabricante real de los equipos «SB Model» | 5 (B57, B74, B75, B76, B77) |

### Lo que no se resuelve ni con catálogo ni con placa

**La asociación placa ↔ equipo.** De las 10 placas leídas en foto, ninguna está
confirmada en campo. Una sola tiene coincidencia única en el inventario
(`027167` → [[B13]]) y queda como `probable_por_coincidencia`, **no** como
confirmada: coincidencia única no es verificación física. Las otras nueve dejan
14 equipos en estado `candidata`.

**El conflicto de rodamientos.** La placa de motor fotografiada dice
6309-2Z-J/C3 y **6308**-2Z-J/C3; los únicos 6309-2Z-J/C3 del Excel (B39–B43)
llevan **6206**. Ninguno de los dos valores sirve para comprar hasta aclararlo.

**La bomba de placa `210770-1`.** Lee `1X1.5-8 STO` a 96 GPM; no hay ninguna de
ese caudal en el Excel. No se fuerza a ninguna fila.

## El visor 3D

Sin cambios todavía, por decisión explícita: primero los datos, después la
conexión. Cuando toque, el visor filtra los TAG con `^P-\d{4}[A-Z]?$` y las
fichas nuevas son `B1`…`B77`, así que habrá que ampliar ese patrón en
`server.mjs`.

Relacionado: [[equipos/_INDICE-equipos]], [[19-Inventario-Vocatus-Dimas]], [[20-Control-cruzado-placas]], [[22-Pedido-al-fabricante]], [[23-Auditoria-importacion-Libro1]]
