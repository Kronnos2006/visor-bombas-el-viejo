# 09 — Plan de acción

> [!info] Revisión documental 2026-10-07
> Cronograma histórico anterior al alcance demo. Sus 20 bombas y estimaciones no describen la propuesta vigente; ver [[Documentacion-visor/01-Estado-y-alcance]].

Práctica: oct–dic 2026. Hoy: 6 de octubre.
Ya resuelto: inventario, herramienta DWG, 111 equipos, 20 bombas identificadas.
Lo que falta es **dato que no está en ningún archivo**: marca, modelo, sellos,
empaques y o-rings de cada bomba.

Plantilla lista: `bombas.csv` — 20 filas, columnas vacías por llenar.

---

## Semana 1 (6–10 oct) — Cerrar la lista y destrabar el dato

**1. Verificar los 14 TAG de confianza MEDIA** (medio día)
Abrir cada P&ID y confirmar a ojo. Marcar también los pares A/B.
Corregir `bombas.csv`. Sin esto, todo lo demás se hace sobre una lista mala.

**2. Reunión con Dimas Arrieta** — la reunión más importante del proyecto
Llevar impreso: la lista de 20 bombas y las preguntas de
[[04-Preguntas-para-la-planta]]. Lo que hay que salir sabiendo:
- ¿Existe equipment list o datasheets del proyecto D-18033?
- ¿Bodega tiene catálogo de repuestos con códigos de sellos y o-rings?
- ¿Qué usan hoy para mantenimiento? ¿Hay historial?
- ¿Quién me acompaña al campo y cuándo puedo entrar?
- ¿Qué licencias hay disponibles (AutoCAD, Navisworks)?

**3. Abrir el modelo 3D**
Navisworks Freedom (gratis). Comparar los dos `.nwd`, ver si traen
propiedades por objeto. Si las traen, la Fase 4 se acorta muchísimo.

> **Decisión de la semana 1:** si bodega ya tiene los códigos de sellos,
> el proyecto es de 6 semanas. Si hay que levantar todo en campo, son 10.
> No sigas hasta tener esa respuesta.

---

## Semanas 2–4 (13 oct – 31 oct) — Levantamiento

**Orden de ataque, de barato a caro:**

1. **Documentos primero.** Datasheets y catálogo de bodega. Lo que salga
   de ahí ya no hay que caminarlo.
2. **Bodega después.** Revisar los repuestos físicos en estante: la caja
   del sello trae marca, modelo y medida impresos. Fotografiar cada una.
3. **Campo al final.** Solo las bombas que quedaron sin dato.

**Protocolo por bomba en campo:**
- Foto de la chapa del equipo (marca, modelo, serie, caudal, potencia)
- Foto del conjunto completo y de la zona del sello
- Anotar: tipo de sellado (sello mecánico o empaquetadura), diámetro de eje
- Si es empaquetadura: sección del cordón y número de anillos
- Guardar las fotos como `TAG_chapa.jpg` / `TAG_sello.jpg`

**Ritmo realista:** 4–6 bombas por jornada de campo. 20 bombas = 4 jornadas.
Agendarlas, no improvisarlas.

**Regla:** llenar `bombas.csv` el mismo día. Lo que no se escribe el mismo
día, se pierde.

---

## Semana 5 (3–7 nov) — Completar por catálogo

Con marca y modelo de cada bomba, buscar en el catálogo del fabricante las
medidas de sellos y o-rings que no se pudieron medir. Marcar en
`observaciones` qué dato es de campo y cuál es de catálogo —
no es lo mismo y mantenimiento necesita saberlo.

**Entregable semana 5:** `bombas.csv` completo. Este es el entregable que
le da valor a todo lo demás.

---

## Semanas 6–7 (10–21 nov) — Plano 2D

- Depurar `D-18033-1-BLD1401_R0.dwg` y las plantas Dusa / Praj.
- Crear un bloque "BOMBA" con atributos: `TAG`, `AREA`, `SERVICIO`.
- Insertarlo en cada posición de bomba.
- Verificar con `DATAEXTRACTION`: debe salir la misma lista que `bombas.csv`.

**Entregable:** DWG de planta con las 20 bombas etiquetadas y exportables.

---

## Semanas 8–9 (24 nov – 5 dic) — Visor 3D

- Convertir el `.nwd` a formato web.
  - Autodesk APS (Forge): sube el NWD, trae visor, árbol y propiedades.
  - O exportar FBX → glTF → visor propio con Three.js.
- Enlazar cada objeto del 3D con su fila de `bombas.csv` usando el TAG.
- Buscador por nombre + filtro por área.
- Al tocar una bomba: ficha con sellos, empaques, o-rings y repuestos.

**Entregable:** visor funcional.

---

## Semana 10 (8–12 dic) — Cierre

- Manual de uso de 2 páginas.
- Procedimiento para que la planta actualice `bombas.csv` cuando cambien
  un sello.
- Informe final de práctica.
- Entregar el vault completo, no solo el visor.

---

## Riesgos y qué hacer

| Riesgo | Señal temprana | Plan B |
|---|---|---|
| Bodega no tiene códigos | Semana 1 | Levantar todo en campo, recortar a las 10 bombas críticas |
| No hay acceso a planta | Semana 1–2 | Pedir a mantenimiento que fotografíe las chapas |
| Sin licencia de Navisworks | Semana 1 | Navisworks Freedom es gratis para ver; para exportar, usar el `.dwf` |
| Sin presupuesto para APS | Semana 8 | Three.js + glTF, todo gratis pero más trabajo |
| El tiempo no alcanza | Semana 6 | Entregar 2D + base de datos completa; el 3D queda documentado como fase 2 |

## Regla de oro
Si en algún momento hay que recortar, **se recorta el 3D, no la base de
datos**. Un Excel bien hecho con los sellos de 20 bombas le sirve a la
planta todos los días. Un 3D bonito sin datos no le sirve a nadie.

Relacionado: [[02-Plan-de-Trabajo]] · [[03-Base-Activos-Bombas]] · [[04-Preguntas-para-la-planta]] · [[08-OCR-PID-resultados]]
