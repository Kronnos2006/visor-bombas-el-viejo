# 03 — Base de datos de activos (bombas)

Un archivo `bombas.csv` en `00-Proyecto/`. Columnas:

## Identificación
- `tag` — código único (ej. P-1401A). **Clave que une 2D, 3D y base de datos.**
- `nombre` — nombre común en planta
- `area` — Destilación / Fermentación / Aguas / Servicios
- `subarea` — torre, tanque o línea específica
- `pid` — lámina P&ID donde aparece (ej. D-18033-1-PID1401_R0)

## Equipo
- `marca`, `modelo`, `serie`
- `tipo` — centrífuga / desplazamiento positivo / dosificadora
- `fluido` — alcohol, mosto, vinaza, agua, etc.
- `caudal`, `presion`, `potencia_kw`, `rpm`

## Sellado — lo que pide el cliente
- `tipo_sellado` — sello mecánico / empaquetadura
- `sello_marca`, `sello_modelo`, `sello_diametro_eje`
- `sello_material_caras`, `sello_material_elastomero`
- `empaque_tipo`, `empaque_seccion`, `empaque_anillos`
- `orings_codigo` — lista separada por `;`
- `orings_medida`, `orings_material`

## Repuestos y mantenimiento
- `codigo_repuesto_bodega`, `proveedor`
- `frecuencia_mantenimiento`, `ultima_intervencion`
- `observaciones`

## Regla de oro
El `tag` debe escribirse **idéntico** en el P&ID, en el bloque de AutoCAD,
en el objeto del modelo 3D y en el CSV. Si no coincide, el visor no enlaza.
