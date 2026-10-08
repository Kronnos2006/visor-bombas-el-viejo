---
tipo: indice
equipos_documentados: 77
filas_reservadas: "B78, B79"
con_sello_documentado: 46
con_empaquetadura: 2
sin_dato_de_sellado: 29
---

# Equipos · índice

Una ficha por equipo, **B1 a B77**. Fuente: `Fuentes/Libro1-bombas-Dimas-2026-10-07.xlsx`, hoja Bombas,
entregado el 2026-10-07.

**Filas reservadas del Excel, sin ficha:**

- **B78** — fila reservada, sin datos.
- **B79** — fila reservada, sin datos.

No cuentan dentro de los 77 equipos documentados.

## Los tres niveles

Cada ficha separa `documental`, `inferido` y `pendiente`, y nunca presenta un
inferido como confirmado. Una celda vacía en el Excel queda vacía.

La confianza está partida en tres campos, porque una transcripción exacta no
implica que se sepa cuál bomba física es:

| Campo | Valores |
|---|---|
| `confianza_transcripcion` | alta · media · baja |
| `confianza_identificacion` | confirmada · probable · ambigua · pendiente |
| `asociacion_placa` | confirmada_en_campo · probable_por_coincidencia · candidata · sin_asociar |

Estado actual: **1** probable por coincidencia única, **14** candidatas por
familia, **62** sin asociar. Ninguna confirmada en campo.

## Tableros (requieren el plugin Dataview)

```dataview
TABLE WITHOUT ID
  file.link AS "Equipo", ubicacion AS "Ubicación", tamano AS "Tamaño",
  sello_tipo AS "Sello", sello_eje_pulg AS "Eje",
  confianza_identificacion AS "Identificación", asociacion_placa AS "Placa"
FROM "00-Proyecto/equipos"
WHERE tipo = "equipo"
SORT area ASC, id ASC
```

### Listos para consulta o cotización preliminar

No para orden de compra: faltan materiales y compatibilidad con el líquido.

```dataview
TABLE WITHOUT ID file.link AS "Equipo", marca AS "Marca", modelo AS "Modelo",
  tamano AS "Tamaño", sello_eje_pulg AS "Eje", liquido AS "Líquido"
FROM "00-Proyecto/equipos"
WHERE tipo = "equipo" AND tipo_sellado = "sello mecanico"
SORT sello_eje_pulg ASC, id ASC
```

### Sin dato de sellado en el Excel

```dataview
TABLE WITHOUT ID file.link AS "Equipo", ubicacion AS "Ubicación",
  tamano AS "Tamaño", marca AS "Marca", marca_estado AS "Marca"
FROM "00-Proyecto/equipos"
WHERE tipo = "equipo" AND tipo_sellado = ""
SORT id ASC
```

### Con unidad o marca por confirmar

```dataview
TABLE WITHOUT ID file.link AS "Equipo", impulsor_valor_original AS "Valor",
  impulsor_unidad_original AS "Unidad Excel", impulsor_estado AS "Estado",
  marca_estado AS "Marca"
FROM "00-Proyecto/equipos"
WHERE tipo = "equipo" AND (impulsor_estado != "" OR marca_estado != "")
SORT id ASC
```

## Índice estático

Por si Dataview no está instalado.


### 1. DESTILACIÓN PLANTA DUSA

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B1]] | Alimentación Mosto Fermentado DUSA | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B2]] | Alimentación Mosto Fermentado DUSA | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B3]] | Columna Aldehído 2 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B4]] | Columna Rectificadora 2 | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B5]] | Columna Aldehído 1 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B6]] | Columna Aldehído 1 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B7]] | Columna Rectificadora 1 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B8]] | Columna Rectificadora 1 | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B9]] | Columna Rectificadora Batch | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B10]] | Columna Rectificadora Batch | `1x1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B11]] | Columna Vinaza | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B12]] | Columna Vinaza | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B13]] | Alambique - Código UQ | `1X1.5-8 ST` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | probable_por_coincidencia |
| [[B14]] | Alambique - Código UQ | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |

### 2. DESTILACIÓN PLANTA PRAJ

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B15]] | Alimentación Mosto Fermentado Hindú | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B16]] | Alimentación Mosto Fermentado Hindú | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B17]] | Columna Rectificadora | `1X1.5-6 ST` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B18]] | Columna Purificadora | `—` | **sin dato** | — | sin_asociar |
| [[B19]] | Columna Mosto | `—` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B20]] | Tanque Condensados | `—` | **sin dato** | — | sin_asociar |
| [[B21]] | Tanque Reflujos Rectificadora | `—` | **sin dato** | — | sin_asociar |
| [[B22]] | Tanque lavados de Aceite | `—` | **sin dato** | — | sin_asociar |

### 3. ALIMENTACIÓN TANQUES DE ALMACÉN & DESPACHO.

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B23]] | Tanque UQ | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B24]] | Tanque FW | `1X1.5X8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | candidata |
| [[B25]] | Tanque FW | `1X1.5X8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | candidata |
| [[B26]] | Tanque Destrucción | `1X1.5-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B27]] | Carga Batch | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | candidata |
| [[B28]] | Carga Batch | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | candidata |
| [[B29]] | Tanque Millonario | `1.5X3-18 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B30]] | Tanque LW1 | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B31]] | Tanque LW2 | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B32]] | Cabezas & Colas | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B33]] | Cabezas & Colas | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B34]] | Despacho DUSA | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | candidata |
| [[B35]] | Despacho DUSA | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | candidata |
| [[B36]] | Despacho Panamá | `3X4X8G MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | candidata |
| [[B37]] | Alimentación Aldehído | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B38]] | Tanque Producción HO | `1X1.5-8 LF` | **sin dato** | — | candidata |
| [[B39]] | Tanque Producción Diaria Hindú | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | sin_asociar |
| [[B40]] | Tanque Blender | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | sin_asociar |
| [[B41]] | Tanque Reproceso | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | sin_asociar |
| [[B42]] | Rechazo | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | sin_asociar |
| [[B43]] | Despacho Hindú | `2X2 1/2-6` | Tipo 1 (O) - Tipo 21 (G) | 1.1/4" | sin_asociar |

### 4. FERMENTACIÓN

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B44]] | Agua de dilución | `3X4X12` | Tipo 1 (O) - Tipo 21 (G) | 1.1/2" | sin_asociar |
| [[B45]] | Agua de dilución | `3X4X12` | Tipo 1 (O) - Tipo 21 (G) | 1.1/2" | sin_asociar |
| [[B46]] | Pie de Cubas | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B47]] | Pie de Cubas | `1.5X3-8 STO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/8" | sin_asociar |
| [[B48]] | Caño | `—` | **sin dato** | — | sin_asociar |
| [[B49]] | Tanque Esterilizador | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B50]] | Tanque Esterilizador | `2X3-8 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B51]] | Tanque Romana | `3X3` | empaquetadura | — | sin_asociar |
| [[B52]] | Tanque Romana | `3X3` | empaquetadura | — | sin_asociar |
| [[B53]] | Descarga Fermentadores | `3X4-7 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B54]] | Descarga Fermentadores | `3X4-7 MTO` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B55]] | Tanque agua DM #1 | `—` | **sin dato** | — | sin_asociar |
| [[B56]] | Tanque agua DM #2 | `—` | **sin dato** | — | sin_asociar |
| [[B57]] | Tanque PF | `—` | **sin dato** | — | sin_asociar |
| [[B58]] | Tanque Verde (en desuso) | `—` | **sin dato** | — | sin_asociar |
| [[B59]] | CIP viejo (en desuso) | `—` | **sin dato** | — | sin_asociar |

### 5. TORRES DE ENFRIAMIENTO

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B60]] | Torre de Enfriamiento #1 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B61]] | Torre de Enfriamiento #1 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B62]] | Torre de Enfriamiento #1 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B63]] | Torre de Enfriamiento #2 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B64]] | Torre de Enfriamiento #2 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |
| [[B65]] | Torre de Enfriamiento #2 | `3X4-13 MT` | Tipo 1 (O) - Tipo 21 (G) | 1.3/4" | sin_asociar |

### 6. CALDERAS

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B66]] | Caldera #2 | `—` | **sin dato** | — | sin_asociar |
| [[B67]] | Caldera #2 | `—` | **sin dato** | — | sin_asociar |
| [[B68]] | Caldera #3 | `—` | **sin dato** | — | sin_asociar |
| [[B69]] | Caldera #3 | `—` | **sin dato** | — | sin_asociar |
| [[B70]] | Atemperador | `—` | **sin dato** | — | sin_asociar |
| [[B71]] | Búnker diario #1 | `—` | **sin dato** | — | sin_asociar |
| [[B72]] | Búnker | `—` | **sin dato** | — | sin_asociar |
| [[B73]] | Búnker diario #2 | `—` | **sin dato** | — | sin_asociar |

### 7. ZONA FRANCA

| Equipo | Ubicación | Tamaño | Sello | Eje | Placa |
|---|---|---|---|---|---|
| [[B74]] | Bomba #1 | `Bomba vertical` | **sin dato** | — | sin_asociar |
| [[B75]] | Bomba #2 | `Bomba vertical` | **sin dato** | — | sin_asociar |
| [[B76]] | Bomba #3 | `Bomba vertical` | **sin dato** | — | sin_asociar |
| [[B77]] | Bomba #4 | `Bomba vertical` | **sin dato** | — | sin_asociar |

Relacionado: [[19-Inventario-Vocatus-Dimas]], [[20-Control-cruzado-placas]], [[21-Datos-del-modelo]], [[22-Pedido-al-fabricante]], [[23-Auditoria-importacion-Libro1]]
