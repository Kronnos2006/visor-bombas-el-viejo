# 01 — Inventario técnico del material

Fecha de revisión: 2026-10-06
Total: **392 MB**, 133 PDF · 94 DWG · 2 NWD · 1 DWF · 39 .bak (respaldos, ignorar)

## 1. Modelos 3D — YA EXISTEN

| Archivo | Tipo | Nota |
|---|---|---|
| `D-18033_3D model _3April 20.nwd` (4.4 MB) | Navisworks | Modelo 3D de coordinación |
| `D-18033_20 May.nwd` (3.2 MB) | Navisworks | Revisión posterior (más nueva) |
| `D-18033_3D model _3April 20.dwf` (5.6 MB) | Autodesk DWF | Misma info, formato de publicación |

**Esto es lo más importante del paquete.** El NWD ya es un modelo 3D navegable
con árbol de objetos y propiedades. No hay que modelar la planta desde cero.

Se abre gratis con **Navisworks Freedom**. Para el visor web se convierte vía
Autodesk APS (Forge) o se exporta a FBX/glTF.

## 2. Planos 2D editables (DWG)

- `D-18033-1-BLD1401_R0.dwg` (2.7 MB, AutoCAD 2000) — plano de edificio principal
- `Planta Dusa/` — 24 DWG: Planta Dusa, Torres A–F, Tanque Bach, piezas
- `Planta Praj/` — 11 DWG: Planta Praj (Indu), Ensamblaje Indu, torres C-1401 / C-1451 / C-1491
- `Prcatica_1_VOCATUS/` — ~20 DWG de equipos individuales ya con TAG en el nombre:
  `C-1401`, `C-1461`, `H-1402..H-1468`, `S-1461`, `T-1461`, `T-1463`
- `PERMISO ARQUITECTONICO/DWG/` — juego arquitectónico completo 2024, organizado
  por edificio (oficina, torre, nave pequeña, baños, cuarto eléctrico, bodegas),
  con XREF de conjunto y ubicación

Versiones: las plantas Dusa/Praj son **AC1032 (AutoCAD 2018)**; el BLD1401 es
**AC1015 (AutoCAD 2000)**.

## 3. P&ID y diagramas de flujo — AQUÍ ESTÁN LAS BOMBAS

`Diagramas Flujo/`
- Destilación: PFD1301, PID1301 … PID1308
- Fermentación: PFD1401, PID1401 … PID1411

`Diagramas de Aguas/` — Agua de río, agua Dusa, pozo, pozo ZF (DWG + PDF)

> **Los P&ID son la fuente de los TAG de bombas.** Toda bomba de la planta
> aparece ahí con su número de equipo, servicio y línea.

## 4. Planos de equipos (GAD)

`D-18033-DTR-STA-046 Planos Equipos/` — 28 láminas `D-18033-x-GAD-1401` a `1428`.
GAD = General Arrangement Drawing. Dimensiones y disposición de cada equipo.

## 5. Arquitectónico / permisos

`PERMISO ARQUITECTONICO/PDF/` — A01 a A29 + `00A_VOCATUS_BIND.pdf`.
Índice completo de láminas A (arquitectura), S (estructura), E (eléctrico).
Incluye ubicación y localización, planta de conjunto, torre de destilación
niveles 1 a 7, nave, bodegas, cuarto eléctrico.

## 6. Hallazgo crítico sobre los PDF

| Grupo | ¿Tiene texto extraíble? |
|---|---|
| PERMISO ARQUITECTONICO (A01–A29) | **Sí** — ploteados desde AutoCAD 2020 |
| P&ID / PFD (Diagramas Flujo) | **No** — texto convertido a curvas |
| Planos de equipos GAD | **No** — igual |

Consecuencia: los TAG de bombas **no se pueden extraer automáticamente de los
PDF de P&ID**. Hay que sacarlos del DWG original, o por OCR, o digitarlos.

## 7. Lo que NO hay en el paquete

- Lista de equipos / equipment list en Excel o CSV
- Hojas de datos (datasheets) de bombas
- Despiece de sellos mecánicos, empaques y o-rings
- Códigos de repuesto / inventario de bodega
- Fotos de los equipos instalados

**Ese es el vacío central del proyecto.** El 3D y el 2D ya están resueltos en
un 80 %; lo que falta es exactamente la información que el cliente quiere ver
al tocar la bomba.
