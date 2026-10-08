---
tipo: bitacora
autor: Claude (Cowork)
periodo: 2026-10-07
---

# Desde que murió ChatGPT

Todo lo de esta nota es posterior al corte de ChatGPT. En orden.

## 1 · Las fotos giradas: no era un bug

ChatGPT había dejado 5 fotos de placas giradas 90°. Primero se rotaron las
JPG derivadas. Después apareció el dato que cambió el diagnóstico: hay que
mirar `Evidencia/Fotos-bombas-2026-10-07/Originales`.

Al revisar las **41 HEIC originales**, las 41 tienen `Orientation = 1`.

Conclusión: **`revisar_fotos.py` no tiene ningún error.** El teléfono grabó
la rotación dentro del píxel, no en el EXIF. Las 5 se regeneraron desde el
HEIC original a 2200 px para no recomprimir dos veces.

## 2 · Lectura de placas a resolución completa

- Se leyeron **10 placas** completas: marca, modelo, tamaño, serie, caudal,
  altura, rpm, diámetro de impulsor, material y presión de diseño.
- Se resolvió la ambigüedad `210775-2` vs `220105-2`: son **dos bombas
  distintas**, ambas 3X4-8G.
- Quedó sin leer la placa `210771-4`.
- Se copiaron al visor las 33 fotos que faltaban (de 8 a 41).

## 3 · Primeros repuestos confirmados del proyecto

De la placa del motor: **7.5 HP, 1750 rpm, 230/460 V, 19.6/9.8 A, carcasa
213JM, TEFC, clase F**, y los rodamientos **6309-2Z-J/C3** y
**6308-2Z-J/C3**.

Son los únicos repuestos del proyecto con respaldo documental hasta hoy.

## 4 · El hallazgo ANSI/ASME B73.1

Las designaciones de placa (`1X1.5-8`, `3X4X8G`) más los modelos Hidromac
2196 y Titan 4196 indican que son bombas de la norma **ANSI/ASME B73.1**.

Qué significa en la práctica:

- El sello es **intercambiable entre marcas** del mismo tamaño.
- El diámetro de eje bajo el sello lo fija el **grupo de potencia**
  (LF / S / M / L), no el modelo comercial.
- La designación se lee: descarga × succión − diámetro nominal de impulsor.

Falta confirmarlo contra el catálogo Hidromac 2196.

Nota: [[13-Hallazgo-ANSI-B73]]

## 5 · Arreglos de fallas encontradas en esta etapa

| Falla | Cómo se cerró |
|---|---|
| `IndexError` en el export cuando todas las fichas eran de demostración | Constante fija `COLS_ACTIVOS` en vez de `activos[0].keys()` |
| Prueba #3 de `test.mjs` fallaba: ruta fuera de la bóveda | `safeVaultFile` genuinamente era más débil en POSIX. Se endureció: rechaza ruta vacía, con unidad de disco, absoluta, UNC y con byte nulo. Pasó de 4/1 a **5/0** |
| `test-sector.mjs` roto por el cambio de forma de los datos | Actualizado y reforzado: ≥10 placas, campos obligatorios, sin atribuir posición, rodamientos del motor presentes |
| `test-demo.mjs` falla en el entorno de Claude | No es un bug: borrar en una carpeta conectada está bloqueado en esa sesión. Pasa en la PC de trabajo |

## 6 · Datos de placa cargados al visor

El modo sector dejó de ser una maqueta. `public/sector-fotos.js` ahora tiene:

- `plateEvidence`: 10 objetos con sus especificaciones completas.
- `motorEvidence`: la placa del motor con los dos rodamientos.
- `estadoLevantamiento`: lista explícita de **qué está confirmado** y **qué
  falta**, visible en el panel.

El panel muestra una tabla de especificaciones por placa y los dos bloques de
estado. Ninguna placa se atribuye a una posición del mapa, porque todavía no
se sabe cuál es cuál.

## 7 · Despiece rehecho con la arquitectura B73.1

El despiece dejó de ser genérico. Las 10 piezas son ahora las del conjunto de
desarme posterior, en el orden real del eje:

| Nº | Pieza | Catálogo |
|---|---|---|
| 01 | Carcasa (voluta) | Casing |
| 02 | Empaque de carcasa | Casing gasket · o-ring confinado |
| 03 | Impulsor abierto | Impeller |
| 04 | Tapa de carcasa | Casing cover |
| 05 | Cámara de sello | Seal chamber · big bore |
| 06 | Sello mecánico de cartucho | Cartridge mechanical seal |
| 07 | Eje | Shaft |
| 08 | Bancada de rodamientos | Bearing frame · power end |
| 09 | Acople espaciador | Spacer coupling |
| 10 | Motor brida JM | JM-flange motor |

- Cada pieza lleva su nombre de catálogo en inglés para cruzarla con el
  despiece del fabricante cuando llegue.
- La geometría se rehízo acorde: succión axial embridada, descarga vertical a
  línea de centros, impulsor abierto de álabes curvos, cámara de sello con
  conexión de flush, cartucho con camisa/caras/resortes/prensa y sus dos
  o-rings, eje escalonado, bancada con radial interior más par de empuje.
- La pieza **06** pide los once campos de compra del sello y muestra
  *"Sin levantar"* en los que faltan.
- La pieza **10** es la única con repuestos confirmados.

Límite declarado en el visor y en el README: la arquitectura es de norma, la
geometría **no está dimensionada**, no es plano de taller.

## 8 · Prueba nueva: `test-despiece.mjs`

Bloquea cuatro cosas:

1. Que el despiece deje de tener las 10 piezas de la norma.
2. Que una pieza consulte una clave que la ficha no tiene.
3. Que las posiciones dejen de ir en orden del lado húmedo al motor.
4. Que desaparezca del visor la advertencia de que no es plano de taller.

## 9 · Verificación final

- `node --test test.mjs test-layout.mjs test-sector.mjs test-despiece.mjs`
  → **8 pruebas, 0 fallos.**
- Servidor local: bootstrap con **15 bombas, 0 errores de YAML**, modo datos
  reales.
- `/`, `/app.js`, `/style.css`, `/sector-fotos.js`, `/realismo.js` y las
  fotos: HTTP 200 con el tipo de contenido correcto.
- Respaldos: `server.mjs.respaldo`, `public/app.js.respaldo`,
  `app.js.respaldo2`, `app.js.respaldo3`, `sector-fotos.js.respaldo`.

## 10 · Guion para la presentación

Se preparó [[18-Guion-presentacion-lunes]]: 10 minutos, arranque previo, qué
mostrar en cada tramo, las cuatro cosas concretas que hay que pedirle a Dimas
y las preguntas probables con su respuesta.

## Lo que sigue bloqueado

Nada de esto lo puede hacer un asistente. Es trabajo de campo:

1. **Asociar serie de placa ↔ TAG del P&ID.** Hay 10 placas y 15 bombas;
   nadie puede decir todavía cuál es cuál.
2. **Conseguir el catálogo Hidromac 2196.** Con ese PDF se llenan las medidas
   de sello, empaque y o-rings.
3. **Confirmar** si las bombas fotografiadas son de las 15 del D-18033 o son
   equipos agregados después.
4. **Fotografiar la placa `210771-4`.**
5. **Averiguar** qué significan los sufijos `STO I`, `MTO I`, `LF` y `ST`.
