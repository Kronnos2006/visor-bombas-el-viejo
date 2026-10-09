---
tipo: auditoria
fecha: 2026-10-07
fuente: "Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx · hoja Bombas"
fuente_fecha: 2026-10-07
equipos_documentados: 77
fichas_corregidas: 77
correcciones: 88
---

# Auditoría de la importación de Libro1.xlsx

Revisión y corrección del inventario B1–B77 contra el Excel original (`Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx`). Se
reconstruyeron **las 77 fichas** desde cero a partir del Excel, con tres niveles
de dato separados y la confianza partida en tres campos.

**Respaldo de lo anterior:**
`00-Proyecto/Respaldos/respaldo-equipos-20261007-2218.zip` — 84 archivos
(las 77 fichas, el índice, las notas 19, 20, 21, 22, el `00-Indice.md` y el CSV).

## Lo que se corrigió, por tipo

| Tipo de corrección | Equipos |
|---|---|
| norma pasada de documental a inferida | 52 |
| modelo recuperado o limpiado | 10 |
| pulgadas que estaban guardadas como mm | 7 |
| catálogo recuperado del Excel | 5 |
| marca no acreditada, vaciada | 5 |
| inconsistencia de unidad marcada | 4 |
| eje tomado por error de la sección del cordón | 2 |
| sección de empaquetadura agregada | 2 |
| unidad del impulsor declarada | 1 |

## Tabla de correcciones

| Equipo | Campo | Excel | Obsidian anterior | Valor corregido | Estado | Fuente |
|---|---|---|---|---|---|---|
| B51 | `sello_eje_pulg` | Empaquetadura de cordón nylon 3/8" | 8 | (vacio) | corregido: 3/8" es la seccion del cordon, no el diam… | Libro1.xlsx |
| B52 | `sello_eje_pulg` | Empaquetadura de cordón nylon 3/8" | 8 | (vacio) | corregido: 3/8" es la seccion del cordon, no el diam… | Libro1.xlsx |
| B51 | `empaque_seccion_pulg` | Empaquetadura de cordón nylon 3/8" | (no existia) | 3/8 | agregado desde el texto del Excel | Libro1.xlsx |
| B52 | `empaque_seccion_pulg` | Empaquetadura de cordón nylon 3/8" | (no existia) | 3/8 | agregado desde el texto del Excel | Libro1.xlsx |
| B13 | `impulsor` | Ø Imp [XX]: 7.1875 · Ø Máx [XX]: 8 | impulsor_mm: 7.1875 | 7.1875 pulg (max. 8 pulg) | corregido: unidad rotulada [XX], se declara pulg con… | Libro1.xlsx |
| B62 | `impulsor_estado` | Ø Imp [mm]: 13 | impulsor_mm: 13 | valor original 13 mm + estado de inconsi… | marcado: no se corrige en silencio | Libro1.xlsx |
| B63 | `impulsor_estado` | Ø Imp [mm]: 13 | impulsor_mm: 13 | valor original 13 mm + estado de inconsi… | marcado: no se corrige en silencio | Libro1.xlsx |
| B64 | `impulsor_estado` | Ø Imp [mm]: 13 | impulsor_mm: 13 | valor original 13 mm + estado de inconsi… | marcado: no se corrige en silencio | Libro1.xlsx |
| B65 | `impulsor_estado` | Ø Imp [mm]: 13 | impulsor_mm: 13 | valor original 13 mm + estado de inconsi… | marcado: no se corrige en silencio | Libro1.xlsx |
| B58 | `impulsor_unidad` | Ø Imp [pulg]: 11.76 | impulsor_mm: 11.76 | 11.76 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B60 | `impulsor_unidad` | Ø Imp [pulg]: 13 | impulsor_mm: 13 | 13 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B61 | `impulsor_unidad` | Ø Imp [pulg]: 13 | impulsor_mm: 13 | 13 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B66 | `impulsor_unidad` | Ø Imp [pulg]: 3.58 | impulsor_mm: 3.58 | 3.58 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B67 | `impulsor_unidad` | Ø Imp [pulg]: 3.58 | impulsor_mm: 3.58 | 3.58 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B68 | `impulsor_unidad` | Ø Imp [pulg]: 4.13 | impulsor_mm: 4.13 | 4.13 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B69 | `impulsor_unidad` | Ø Imp [pulg]: 4.13 | impulsor_mm: 4.13 | 4.13 pulg | corregido: estaba guardado como mm | Libro1.xlsx |
| B39 | `catalogo` | Cat: 15SH06K6 | (no existia) | 15SH06K6 | recuperado del Excel | Libro1.xlsx |
| B40 | `catalogo` | Cat: 15SH06K6 | (no existia) | 15SH06K6 | recuperado del Excel | Libro1.xlsx |
| B41 | `catalogo` | Cat: 15SH06K6 | (no existia) | 15SH06K6 | recuperado del Excel | Libro1.xlsx |
| B42 | `catalogo` | Cat: 15SH06K6 | (no existia) | 15SH06K6 | recuperado del Excel | Libro1.xlsx |
| B43 | `catalogo` | Cat: 15SH06K6 | (no existia) | 15SH06K6 | recuperado del Excel | Libro1.xlsx |
| B39 | `modelo` | #Mod: 2X2 1/2-6-2P | — | 2X2 1/2-6-2P | recuperado del Excel | Libro1.xlsx |
| B40 | `modelo` | #Mod: 2X2 1/2-6-2P | — | 2X2 1/2-6-2P | recuperado del Excel | Libro1.xlsx |
| B41 | `modelo` | #Mod: 2X2 1/2-6-2P | — | 2X2 1/2-6-2P | recuperado del Excel | Libro1.xlsx |
| B42 | `modelo` | #Mod: 2X2 1/2-6-2P | — | 2X2 1/2-6-2P | recuperado del Excel | Libro1.xlsx |
| B43 | `modelo` | #Mod: 2X2 1/2-6-2P | — | 2X2 1/2-6-2P | recuperado del Excel | Libro1.xlsx |
| B57 | `modelo` | SB Model: 15-5(M) | : 15-5(M) | 15-5(M) | corregido: se quito el prefijo y los dos puntos | Libro1.xlsx |
| B74 | `modelo` | SB Model: 20-6 (M) | : 20-6 (M) | 20-6 (M) | corregido: se quito el prefijo y los dos puntos | Libro1.xlsx |
| B75 | `modelo` | SB Model: 20-6 (M) | : 20-6 (M) | 20-6 (M) | corregido: se quito el prefijo y los dos puntos | Libro1.xlsx |
| B76 | `modelo` | SB Model: 20-6 (M) | : 20-6 (M) | 20-6 (M) | corregido: se quito el prefijo y los dos puntos | Libro1.xlsx |
| B77 | `modelo` | SB Model: 20-6 (M) | : 20-6 (M) | 20-6 (M) | corregido: se quito el prefijo y los dos puntos | Libro1.xlsx |
| B57 | `marca` | SB Model: 15-5(M) | SB MODEL | (vacio) | corregido: 'SB Model' no acredita fabricante | Libro1.xlsx |
| B74 | `marca` | SB Model: 20-6 (M) | SB MODEL | (vacio) | corregido: 'SB Model' no acredita fabricante | Libro1.xlsx |
| B75 | `marca` | SB Model: 20-6 (M) | SB MODEL | (vacio) | corregido: 'SB Model' no acredita fabricante | Libro1.xlsx |
| B76 | `marca` | SB Model: 20-6 (M) | SB MODEL | (vacio) | corregido: 'SB Model' no acredita fabricante | Libro1.xlsx |
| B77 | `marca` | SB Model: 20-6 (M) | SB MODEL | (vacio) | corregido: 'SB Model' no acredita fabricante | Libro1.xlsx |
| B1 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B2 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B3 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B4 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B5 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B6 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B7 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B8 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B9 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B10 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B11 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B12 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B13 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B14 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B17 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B18 | `norma` | (el Excel no menciona ninguna norma) | — | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B19 | `norma` | (el Excel no menciona ninguna norma) | — | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B20 | `norma` | (el Excel no menciona ninguna norma) | — | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B21 | `norma` | (el Excel no menciona ninguna norma) | — | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B23 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B24 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B25 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B26 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B27 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B28 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B29 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B30 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B31 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B32 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B33 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B34 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B35 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B36 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B37 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B38 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B39 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B40 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B41 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B42 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B43 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B46 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B47 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B49 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B50 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B53 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B54 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B60 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B61 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B62 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B63 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B64 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |
| B65 | `norma` | (el Excel no menciona ninguna norma) | ANSI/ASME B73.1 | norma_indicada vacia; norma_inferida con… | corregido: ya no se presenta como dato del Excel | Libro1.xlsx |

## Las diez correcciones obligatorias, una por una

### 1 · B51 y B52 — el eje no mide 8 pulgadas

El Excel dice `Empaquetadura de cordón nylon 3/8"`. La versión anterior extraía
el diámetro de eje con una expresión regular que capturaba `8"` de `3/8"`, y
dejaba `sello_eje_pulg: "8"`. Era un eje inventado.

Ahora:

```yaml
tipo_sellado: "empaquetadura"
sello_eje_pulg: ""
empaque_declarado: "Empaquetadura de cordón nylon 3/8\""
empaque_seccion_pulg: "3/8"
```

Y la ficha dice en letras que 3/8" es la sección del cordón, no el eje.
**Verificado: 0 fichas afirman un eje de 8 pulgadas.**

### 2 · Unidades del impulsor

El campo `impulsor_mm` ya no existe en ninguna ficha. Se reemplazó por valor +
unidad, y se conserva además el valor y el rótulo originales del Excel:

| Equipo | Rótulo del Excel | Valor | Guardado como |
|---|---|---|---|
| B13 | `[XX]` | 7.1875 / máx. 8 | pulg, con `impulsor_estado` |
| B58 | `[pulg]` | 11.76 | pulg |
| B60, B61 | `[pulg]` / `[pilg]` | 13 / máx. 13 | pulg |
| B66, B67 | `[pulg]` | 3.58 | pulg |
| B68, B69 | `[pulg]` | 4.13 | pulg |

En B13 el Excel rotula la unidad como `[XX]`, así que la ficha lo declara:
*«el Excel rotula la unidad como [XX]; se registra en pulgadas por indicación del
responsable del proyecto y por la designación 1X1.5-8»*. No se presenta como
dato limpio del Excel.

### 3 · B62 a B65 — unidad inconsistente, no corregida en silencio

El Excel dice 13 mm. Son Titan 4196 `3X4-13 MT`, la misma familia que B60 y B61,
que dicen 13 **pulgadas**. Las cuatro fichas conservan:

```yaml
impulsor_valor_original: "13"
impulsor_unidad_original: "mm"
impulsor_estado: "unidad inconsistente: el Excel dice 13 mm, pero la familia
  Titan 4196 3X4-13 MT y B60-B61 indican 13 pulgadas. Verificar contra placa o catalogo."
```

13 mm **no** aparece como medida técnica confirmada en ninguna parte.

### 4 · B39 a B43 — catálogo y modelo recuperados

La versión anterior había perdido ambos. Ahora van en campos separados:

```yaml
marca: "GOULDS"
catalogo: "15SH06K6"
modelo: "2X2 1/2-6-2P"
tamano: "2X2 1/2-6"
```

**Verificado: 0 equipos Goulds sin catálogo o sin modelo.**

### 5 · B57, B74 a B77 — «SB Model» no acredita fabricante

```yaml
marca: ""
marca_estado: "por confirmar"
modelo: "15-5(M)"      # o "20-6 (M)"
texto_original_bomba: "SB Model: 15-5(M)\nGPM: 96\n…"
```

El carácter `:` ya no queda al principio del modelo. **Verificado: 0 modelos
empiezan con dos puntos, 0 equipos SB con marca asumida.**

### 6 · La norma es inferencia, no dato del Excel

El Excel no menciona ninguna norma. En las 52 fichas de familia ANSI:

```yaml
norma_indicada: ""
norma_inferida: "ANSI/ASME B73.1"
norma_estado: "inferencia tecnica; confirmar con catalogo"
```

**Verificado: 0 fichas con `norma_indicada` con valor.**

### 7 · B78 y B79 — filas reservadas, sin ficha

El Excel solo trae los identificadores, sin datos. No se crearon fichas y no
cuentan dentro de los 77. Quedan documentadas en
[[equipos/_INDICE-equipos]] y en [[19-Inventario-Vocatus-Dimas]].

**Verificado: 0 fichas creadas para B78/B79.**

### 8 · Asociación de placas

Ninguna asociación está confirmada en campo. La Titan `027167` → [[B13]] quedó
como `probable_por_coincidencia`, con la aclaración de que coincidencia única no
es verificación física.

| Estado | Equipos |
|---|---|
| `confirmada_en_campo` | 0 |
| `probable_por_coincidencia` | 1 |
| `candidata` | 14 |
| `sin_asociar` | 62 |

### 9 · Rodamientos

Las 77 fichas llevan `rodamientos_pertenecen_a: "por confirmar"`. Los valores se
conservan tal cual, pero ninguna ficha los presenta como repuesto de una pieza
concreta. **Verificado: 0 fichas con otro valor en ese campo.**

### 10 · Sellos y o-rings

Caras, elastómero, resorte, código de sello y o-rings quedan **vacíos** en las
77 fichas. Ninguna ficha dice que el sello esté listo para compra: el texto dice
«alcanza para consulta o cotización preliminar» y nombra lo que falta
(materiales y compatibilidad con el líquido del servicio).

**Verificado: 0 campos pendientes rellenados, 0 textos con «listo para compra».**

## Resultado de la validación automática

Comparación de `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx` contra las 77 fichas:

| Control | Resultado |
|---|---|
| Fichas revisadas | **77** |
| Fichas faltantes | 0 |
| Identificadores duplicados | 0 |
| Fichas sin fila en el Excel | 0 |
| Diferencias entre Excel y Obsidian | **0** (incluye los cuatro `texto_original_*` comparados carácter por carácter) |
| Valores en pulgadas guardados como milímetros | 0 |
| Campos `impulsor_mm` heredados | 0 |
| Campos inferidos presentados como confirmados | 0 |
| Placas asignadas sin confirmación en campo | 0 |
| Campos vacíos completados sin fuente | 0 |
| Fichas con `confianza: alta` como valor único | 0 |
| B51/B52 con eje tomado de la empaquetadura | 0 |
| Textos que afirman un eje de 8 pulgadas | 0 |
| Textos que afirman «listo para compra» | 0 |
| Goulds sin catálogo o modelo | 0 |
| Equipos SB con marca asumida | 0 |
| Modelos que empiezan con dos puntos | 0 |
| Fichas creadas para B78/B79 | 0 |
| YAML inválido | 0 |

### Enlaces y archivos

Se revisaron **101 archivos** de `00-Proyecto/`.

- **Enlaces rotos:** 0. (Los 84 enlaces a esta nota estaban rotos hasta que se
  creó; ya resuelven.)
- **Archivos mencionados que no existían:** `bombas-vocatus.csv`, que la nota 19
  citaba. **Creado** desde el Excel, con una columna por campo más cuatro
  columnas de texto original (`texto_original_bomba`, `_tamano`, `_sello`,
  `_motor`). 77 filas, 50 columnas.
- La referencia al Excel se escribe con su nombre real en la bóveda:
  `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx`.

## Lo que sigue pendiente

Nada de esto lo resuelve una revisión de datos:

1. **Confirmar las placas en campo.** 77 equipos sin verificación física; 9 de
   las 10 placas fotografiadas siguen sin equipo asignado.
2. **El sellado de los siete `LF`** (B23, B30, B31, B32, B33, B37, B38). Celda
   vacía en el Excel, y cuatro de las placas fotografiadas son de ese grupo.
3. **Los seis datos de catálogo** por familia: caras, elastómero, resorte,
   código y o-rings. Ver [[22-Pedido-al-fabricante]].
4. **La unidad real del impulsor** de B62 a B65.
5. **El fabricante real** de los cinco equipos «SB Model».
6. **A quién pertenecen los rodamientos** de las columnas del Excel, y el
   conflicto 6308 / 6206 entre la placa de motor fotografiada y B39–B43.
7. **La placa `210770-1`**, cuyo caudal no aparece en el Excel.
8. **Confirmar la inferencia B73.1** con el corte dimensional del fabricante.
9. **Conectar el visor 3D**, que todavía filtra los TAG con `^P-\d{4}[A-Z]?$` y
   no ve las fichas `B1`…`B77`. Sin tocar, por decisión explícita.

Relacionado: [[19-Inventario-Vocatus-Dimas]], [[20-Control-cruzado-placas]], [[21-Datos-del-modelo]], [[22-Pedido-al-fabricante]], [[equipos/_INDICE-equipos]]
