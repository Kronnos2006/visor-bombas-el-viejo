# 05 — Cómo manejar los DWG sin AutoCAD (probado y funcionando)

## Resultado
Se procesaron **56 archivos DWG, 0 errores**, y se extrajeron automáticamente
**45 TAG de equipos** en 151 apariciones. Resultado en `tags_equipos_vocatus.csv`.

## La cadena de herramientas

### 1. LibreDWG — leer DWG (GPL, gratis)
https://github.com/LibreDWG/libredwg

Es la única librería libre que lee DWG nativo de verdad. Trae `dwg2dxf`,
`dwgread`, `dwgwrite`. Lee desde R13 hasta AC1032 (AutoCAD 2018) — cubre
todos los archivos del proyecto.

Compilar en Linux/WSL:
```
git clone --depth 1 https://github.com/LibreDWG/libredwg.git
cd libredwg && sh autogen.sh
./configure --disable-bindings --disable-python --disable-shared
make -j4
# binarios en programs/dwg2dxf y programs/dwgread
```
Dependencias: `autoconf automake libtool texinfo gcc make`

### 2. ezdxf — leer el DXF resultante (Python, MIT)
https://github.com/mozman/ezdxf — `pip install ezdxf`

Da acceso a entidades, capas, bloques, atributos y coordenadas.
Usar `ezdxf.recover.readfile()` (no `readfile()`) porque el DXF que
genera LibreDWG no siempre es 100% limpio.

### 3. Alternativas si no querés compilar
- **ODA File Converter** (gratis, Open Design Alliance) — convierte DWG↔DXF
  por lotes con interfaz gráfica. Lo más fácil en Windows.
- **@mlightcad/libredwg-web** — LibreDWG compilado a WebAssembly, corre en
  Node o en el navegador. Útil si el visor web va a leer DWG directo.
- **dxfgrabber / dxf2gcode** — solo DXF, no sirven para DWG.

## Script de extracción
Guardado en `00-Proyecto/scripts/extract_tags.py`.
Recorre una carpeta, convierte cada DWG a DXF, lee TEXT / MTEXT / INSERT con
atributos, y saca todo lo que matchea el patrón de TAG `[A-Z]{1,3}-\d{3,4}[A-Z]?`.

## Lo que ESTO cambia en el proyecto
No hace falta licencia de AutoCAD para armar la lista de equipos.
Fase 1 del plan pasa de "leer 19 P&ID a mano" a "correr un script".
