# 10 — Verificación de bombas: LISTA DEFINITIVA

Fecha: 2026-10-06. Tarea 1 del [[09-Plan-de-Accion]] — **completada**.

## El hallazgo

Los dos **PFD** (Process Flow Diagram) traen una tabla **LEGEND** con la lista
de equipos completa: código + descripción de cada uno. Es la *equipment list*
oficial del proyecto, estaba dentro del plano.

- `D-18033-1-PFD1301_R0` → sección Fermentación
- `D-18033-1-PFD1401_R0` → sección Destilación

Con esto no hay que adivinar nada: la lista está confirmada contra documento,
no contra OCR.

## Datos del proyecto (del cajetín del PFD)

- **Cliente:** Vocatus Holding Sociedad Anónima
- **Planta:** 10,000 litros/día de alcohol neutro (Buen Gusto) o alcohol de ron
- **Ubicación:** Costa Rica
- **Ingeniería:** Praj Industries Ltd. (Pune, India)
- **Job code:** D-18033 · Rev. 0 · 11/04/2019 "For detailed engineering"
- Los planos están marcados **CONFIDENTIAL** — no publicarlos fuera de la empresa.

## LAS 15 BOMBAS

### Fermentación (9)

| TAG    | Servicio                         |
| ------ | -------------------------------- |
| P-1311 | Fermentor re-circulation pump I  |
| P-1312 | Fermentor re-circulation pump II |
| P-1321 | Prefermentor recirculation pump  |
| P-1324 | Molasses transfer pump           |
| P-1331 | Beer well transfer pump          |
| P-1341 | Antifoam dosing pump             |
| P-1342 | Acid pump                        |
| P-1343 | Nutrient pump                    |
| P-1351 | CIP pump                         |

### Destilación (6)

| TAG | Servicio |
|---|---|
| P-1401 | Mash column bottom pump |
| P-1451 | Purifier bottom transfer pump |
| P-1461 | Rectifier reflux pump |
| P-1462 | Rectifier bottom pump |
| P-1463 | FO washing pump (fusel oil) |
| P-1490 | Steam condensate transfer pump |

Todas llevan motor acoplado ("with motor" en la leyenda).

## Descartados — eran errores de OCR

| Leído | Qué era en realidad |
|---|---|
| P-131 | truncado, era P-1311 o P-1312 |
| P-1324B | contaminación de `B-1341A/B` (air blower) dibujado al lado |
| P-1391 | PID1308 es distribución de aire de instrumentos, no hay bombas |
| P-1401H | contaminación de `H-1401A/B` (pre-heater) al lado |
| P-1491 | era `H-1491`, simmering column reboiler |
| P-1524, P-1542 | fuera del rango de TAG del proyecto |

> **Conclusión sobre el método:** el OCR sirvió para encontrar dónde mirar,
> pero la leyenda del PFD es la fuente de verdad. Siempre buscar la LEGEND
> antes de confiar en lecturas sueltas del plano.

## Equipos totales del proyecto
Las dos leyendas también dan el resto: columnas (C), intercambiadores (H),
tanques (T), agitadores (A), bombas (P), sopladores (B), filtros (F),
inyectores (N), separadores (S), botellas (K), fermentadores (R),
boquillas de limpieza (Y), diluidores (M).

## Estado de `bombas.csv`
Ya tiene las 15 filas con TAG, área, servicio y en qué láminas aparece cada
una. Falta lo de campo: marca, modelo, sellos, empaques, o-rings.

## Siguiente
Tarea 2 de la semana 1: reunión con Dimas. Llevar esta lista impresa.
Ver [[04-Preguntas-para-la-planta]].
