---
fecha: 2026-10-20
tipo: modelo-3d
estado: casi terminado (provisional)
fuente: Planta_3D_VOCATUS_2026-10-20_161709
---

# Planta 3D integrada — respaldo del 20-oct-2026

[[Inicio|Volver al inicio]] · [[00-Navegacion/08-Planos-y-modelos|Planos y modelos]]


## Qué es

Respaldo completo del modelo 3D de la planta Vocatus / El Viejo, preparado el 20-oct-2026 a las 16:13. La integridad de los 5 archivos principales está verificada con SHA-256 (`VERIFICACION_SHA256.csv`, todos `True`).

- **Modelo completo:** `PLANTA_COMPLETA_ABRIR_EN_REVIT_2026.rvt` (63 MB). Es una copia de `Tanque de Agua.rvt`, el archivo donde se integró todo el conjunto industrial.
- **Vista a abrir:** `VOCATUS - Modelo general completo`.
- **Programa:** Revit 2026. Al preparar el respaldo, el modelo no tenía cambios pendientes.
- **Respaldo:** `RESPALDO_COMPLETO.zip` (2,6 GB) y su carpeta descomprimida `RESPALDO_COMPLETO` (1 514 archivos, 4,4 GB de origen, sin referencias faltantes).

## Qué contiene el modelo

Conjunto integrado con: torre de destilación DUSA con alambique y pasarela, fermentadores (nueve) y semilleros, nave de almacenamiento con tanques y bombas, sector de cuatro tanques, agua de enfriamiento, calderas con su plataforma, tanques horizontales con dique, oficina administrativa y los edificios del plano de sitio (bodega pequeña, baños, cuarto eléctrico, bodega de químicos).

Las medidas son **provisionales**: se modeló con fotos, plantas 2D y PDF; no es un levantamiento exacto ni un cálculo de proceso o estructura. La geometría es DirectShape, sin conectores MEP.

## Carpetas del respaldo

| Carpeta | Contenido |
|---|---|
| `Proyecto_Practica_II/Modelos 3D` | RVT de cada edificio, `DUSA 3D.rvt` y `Tanque de Agua.rvt` (con versiones de respaldo .0001, .0002…) |
| `Proyecto_Practica_II/FBX` | 6 FBX exportados de Revit (5 edificios + conjunto industrial provisional del 16-oct) |
| `Proyecto_Practica_II/Modelos 2D` | DWG: Diagrama Dusa, DUSA_3D_MASTER, columnas, botella de presión, intercambiador |
| `Proyecto_Practica_II` | `Libro1.bombas 3.xlsx`, `Libro1 bomba2.xlsx`, `Libro1.xlsx`, machote de bitácora FO03 |
| `Fuentes_originales_VOCATUS` | Planos de equipos D-18033 (PDF), diagramas de flujo y de aguas, Planta Dusa, Planta Praj, permiso arquitectónico |
| `Trabajo_DUSA_y_planos_2026-10-12` | Análisis del DWG y NWD de DUSA, cotas y discrepancias, revisión de bombas |
| `Trabajo_edificios_2026-10-14` | Registros de modelado de cada edificio |
| `Trabajo_diagrama_2026-10-15` | `Diagrama Dusa - Mejorado.dwg` y su PDF de presentación |
| `Trabajo_modelo_integrado_2026-10-16` | Capturas por sector, scripts de Revit (.cs) y `conjunto_industrial.obj` provisional |
| `Referencias_del_chat` | Fotos de campo (HEIC del 20-oct) y capturas de referencia |

## Relación con el visor

- El visor publicado en GitHub ya tiene la torre DUSA (`torre-dusa.glb`) y los 5 edificios FBX convertidos a GLB (ver `visor-bombas/EDIFICIOS-FBX.md`).
- El modelo integrado final **todavía no está en el visor**: solo existe en el RVT. El único export web (`conjunto_industrial.obj`, 16-oct) es la versión provisional del tanque de agua con dos bombas, anterior al modelo final.
- Para agregarlo al visor hace falta exportar desde Revit la vista `VOCATUS - Modelo general completo` a FBX (Archivo › Exportar › FBX), igual que se hizo con los edificios. Con ese FBX se convierte a GLB con el mismo procedimiento.
- Los RVT, el ZIP y las fotos son material privado de la planta: no van al repositorio público.

## Advertencias del respaldo

- Los scripts `.cs` de Revit **ya se ejecutaron**; no repetirlos porque duplican elementos.
- Las cotas sustituidas del Diagrama Dusa (48) no se deben usar para medir; ver `Trabajo_DUSA_y_planos_2026-10-12/outputs/DUSA/cotas-y-discrepancias.md`.
