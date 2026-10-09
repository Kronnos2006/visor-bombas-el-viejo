# 02 — Plan de trabajo

## Fase 0 — Limpieza y confirmación (1–2 días)
- Abrir los dos `.nwd` con Navisworks Freedom (gratis) y comparar.
  Decidir cuál es la versión vigente (probablemente `20 May`).
- Verificar si el NWD trae propiedades por objeto (TAG, disciplina, sistema).
  Si las trae, medio proyecto está hecho.
- Confirmar con la planta: ¿los planos D-18033 corresponden a lo construido?
- Entregable: nota de estado del material.

## Fase 1 — Lista de equipos (la base de todo)
- Leer los P&ID (PID1301–1308 destilación, PID1401–1411 fermentación).
- Extraer TAG de cada bomba, su servicio, fluido, línea y área.
- Volcar a `bombas.csv` con la estructura de [[03-Base-Activos-Bombas]].
- Entregable: lista de equipos completa. **Sin esto no hay proyecto.**

## Fase 2 — Levantamiento de sellos y repuestos
- Por cada bomba: marca, modelo, serie (chapa del equipo).
- Tipo de sello mecánico, empaque, o-rings, medidas, material.
- Fuentes: datasheets del fabricante, bodega de repuestos, historial de
  mantenimiento, inspección física.
- Entregable: `bombas.csv` lleno.

## Fase 3 — Plano 2D editable
- Depurar `D-18033-1-BLD1401_R0.dwg` + plantas Dusa y Praj.
- Insertar un bloque de bomba **con atributos** (TAG, ÁREA, SERVICIO) en
  cada posición. Eso permite exportar la lista desde AutoCAD con `DATAEXTRACTION`.
- Entregable: DWG de planta con equipos etiquetados.

## Fase 4 — Visor 3D consultable
- Convertir el NWD a formato web.
  - Opción A: Autodesk APS (Forge) — sube el NWD, ya trae visor, árbol y propiedades.
  - Opción B: exportar a FBX → glTF → visor propio con Three.js.
- Vincular cada objeto del modelo con su fila de `bombas.csv` por el TAG.
- Buscador por nombre y filtro por área.
- Al hacer clic en una bomba: ficha con sellos, empaques, o-rings, repuestos.
- Entregable: visor web funcional.

## Fase 5 — Entrega
- Manual de uso corto.
- Procedimiento para que la planta actualice la base cuando cambie un sello.

## Riesgo principal
El cuello de botella no es el software, es **conseguir el dato de sellos y
o-rings de cada bomba**. Arrancar la Fase 2 desde ya, en paralelo.
