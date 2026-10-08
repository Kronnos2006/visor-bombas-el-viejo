---
tipo: control-cruzado
revision: 2026-10-07
placas_leidas: 10
equipos_documentados: 77
confirmadas_en_campo: 0
probables_por_coincidencia: 1
---

# Control cruzado · placas fotografiadas contra el Excel

Se cruzaron las **10 placas leídas** en las fotos del 2026-10-07 contra los
**77 equipos** del Excel. El criterio es el dato de placa: designación de tamaño,
marca y modelo; y donde la foto permitió leer caudal, altura y diámetro de
impulsor, también esos tres.

**Ninguna asociación está confirmada.** Una coincidencia única en el inventario
no es una verificación física: para confirmar hay que ver la placa en el equipo.

## Estados permitidos

| Estado | Qué significa | Equipos |
|---|---|---|
| `confirmada_en_campo` | alguien vio la placa en ese equipo | **0** |
| `probable_por_coincidencia` | única coincidencia del inventario, sin verificar | **1** |
| `candidata` | comparte familia con una placa, varias posibles | **14** |
| `sin_asociar` | ninguna placa leída apunta a este equipo | **62** |

## Resultado placa por placa

| Serie | Tamaño de placa | Estado | Equipos candidatos | Criterio |
|---|---|---|---|---|
| `210770-1` | `1X1.5-8 STO` | sin coincidencia | ninguno | el caudal de placa (96 GPM) no aparece en el Excel |
| `210770-7` | `1X1.5X8 STO` | candidata | [[B24]], [[B25]] | tamano + marca + modelo + caudal + altura + impulsor |
| `210771-1` | `1X1.5-8 LF` | candidata | [[B23]], [[B30]], [[B31]], [[B32]], [[B33]], [[B37]], [[B38]] | tamano + marca + modelo |
| `210771-2` | `1X1.5-8 LF` | candidata | [[B23]], [[B30]], [[B31]], [[B32]], [[B33]], [[B37]], [[B38]] | tamano + marca + modelo |
| `210771-3` | `1X1.5-8 LF` | candidata | [[B23]], [[B30]], [[B31]], [[B32]], [[B33]], [[B37]], [[B38]] | tamano + marca + modelo |
| `210771-5` | `1X1.5-8 LF` | candidata | [[B23]], [[B30]], [[B31]], [[B32]], [[B33]], [[B37]], [[B38]] | tamano + marca + modelo |
| `210775-2` | `3X4X8G MTO` | candidata | [[B27]], [[B28]], [[B34]], [[B35]], [[B36]] | tamano + marca + modelo + caudal + altura + impulsor |
| `220105-1` | `3X4-8G MTO` | candidata | [[B27]], [[B28]], [[B34]], [[B35]], [[B36]] | tamano + marca + modelo |
| `220105-2` | `3X4-8G MTO` | candidata | [[B27]], [[B28]], [[B34]], [[B35]], [[B36]] | tamano + marca + modelo |
| `027167` | `1X1.5-8 ST` | probable_por_coincidencia | [[B13]] | unica Titan 4196 de ese tamano en el inventario |

## `027167` → [[B13]] · probable, no confirmada

Es la única Titan 4196 `1X1.5-8 ST` del inventario, así que el descarte es
limpio. Pero sigue siendo descarte, no verificación: la ficha queda con
`asociacion_placa: probable_por_coincidencia` y
`confianza_identificacion: probable`.

Lo que el Excel aporta **si la asociación se confirma**:

| Dato | Valor | Nivel |
|---|---|---|
| Ubicación | Alambique - Código UQ | documental |
| Área | 1. DESTILACIÓN PLANTA DUSA | documental |
| Líquido | Alcohol | documental |
| Sello mecánico | Tipo 1 (O) - Tipo 21 (G) | documental |
| Eje en el sello | 1.3/8" | documental |
| Altura | 13.7 m | documental |
| Impulsor | 7.1875 pulg (máx. 8 pulg) | documental, unidad rotulada `[XX]` en el Excel |
| Motor | WEG, 2 HP, 1750 rpm | documental |
| Rodamientos de la lista | 6205-2RS / 6204-2RS | documental, pertenencia **por confirmar** |

## Lo que se resuelve por grupo, aunque no por equipo

Para estas placas no se sabe cuál equipo es, pero **todas sus candidatas
comparten el mismo sellado documentado**, así que el dato de sello no depende de
resolver la asociación:

| Placas | Candidatas | Sello | Eje |
|---|---|---|---|
| `210770-7` | B24, B25 (Tanque FW) | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" |
| `210775-2`, `220105-1`, `220105-2` | B27, B28, B34, B35, B36 | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" |

Eso permite **cotizar** el sello de esas cuatro bombas sin cerrar la asociación.
No permite comprarlo: faltan materiales y compatibilidad con el líquido.

## Los tres problemas que el cruce dejó abiertos

### 1 · Las cuatro bombas `LF` siguen sin sello

Las placas `210771-1`, `-2`, `-3` y `-5` son `1X1.5-8 LF`. Los siete equipos `LF`
del Excel (B23, B30, B31, B32, B33, B37, B38) tienen **la celda de sello vacía**.

No es un problema del cruce: es un hueco de la fuente. Y no lo resuelve el
catálogo por sí solo, porque primero hay que saber si llevan sello mecánico o
empaquetadura. Hay que preguntárselo a Dimas.

### 2 · La placa `210770-1` no aparece en el Excel

Lee `1X1.5-8 STO`, **96 GPM**, 15.2 m, impulsor 178 mm (máx. 205). Hay nueve
equipos `1X1.5-8 STO` en el Excel, con caudales de 3, 30, 35, 40 y 50 GPM.
Ninguno de 96.

O el caudal de la foto se leyó mal, o es un equipo que no está inventariado.
No se asignó a ninguna fila.

### 3 · Conflicto en los rodamientos

La placa de motor fotografiada dice **6309-2Z-J/C3** (delantero) y
**6308-2Z-J/C3** (trasero).

En el Excel, los únicos equipos con 6309-2Z-J/C3 son **B39 a B43** (Goulds, cat.
15SH06K6, motores US Motors), y ahí el trasero es **6206-2Z-J/C3**, no 6308.

Puede ser que el Excel traiga los rodamientos de la bomba y la placa los del
motor, o al revés, o que sean equipos distintos. Hasta aclararlo, **ninguno de los
dos datos sirve para comprar**, y todas las fichas llevan
`rodamientos_pertenecen_a: "por confirmar"`.

## Qué cierra las nueve placas abiertas

Una sola cosa, y es de campo: **anotar la serie de placa junto al equipo y su
ubicación**. Con eso `210771-1` deja de ser «una de siete LF» y pasa a ser «la
del Tanque LW1», y su fila del Excel queda disponible con identificación
confirmada.

No hace falta medir ni desarmar nada. Es caminar la planta con el inventario
impreso y el número de serie a la vista.

Relacionado: [[19-Inventario-Vocatus-Dimas]], [[21-Datos-del-modelo]], [[equipos/_INDICE-equipos]], [[Documentacion-visor/14-Indice-de-fotos-y-placas]], [[Documentacion-visor/13-Hallazgo-ANSI-B73]]
