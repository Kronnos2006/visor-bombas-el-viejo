---
tipo: bitacora
autor: Claude (Cowork)
periodo: 2026-10-05 a 2026-10-07
---

# Hecho por Claude

## 1 · Lectura de los planos sin AutoCAD

- Compiló **LibreDWG** desde código fuente (`dwg2dxf`, `dwgread`): la única
  librería libre que lee DWG nativo.
- Leyó los DXF resultantes con **ezdxf** (`ezdxf.recover.readfile`).
- Resultado: **56 archivos DWG procesados, 0 errores.**
- Nota: [[05-Herramientas-DWG]]

## 2 · Extracción automática de TAG

- Script `scripts/extract_tags.py`: recorre la carpeta, convierte cada DWG,
  lee TEXT / MTEXT / atributos de INSERT y saca los TAG con la expresión
  `\b([A-Z]{1,3})[- ]?(\d{3,4})([A-Z](?:/[A-Z])?)?\b`.
- Salida: `tags_equipos_vocatus.csv` (tag, prefijo, archivo, veces, x, y).
- Notas: [[07-Script-extract-tags]], [[06-Equipos-detectados]]

## 3 · OCR de los P&ID y corrección del conteo

- Los PDF de P&ID tienen el texto convertido a curvas. Los rasterizó con
  `pdftoppm` a 450 dpi y los pasó por **Tesseract**.
- El OCR daba ruido y sugería ~20 bombas. Al leer las **tablas LEGEND de los
  PFD** quedó el número verdadero: **15 bombas**.
- Lección registrada: buscar siempre la LEGEND antes de confiar en un OCR.
- Notas: [[08-OCR-PID-resultados]], [[10-Verificacion-bombas]]

## 4 · Base de conocimiento en Obsidian

- 15 fichas `bombas/P-1311…P-1490.md` con frontmatter YAML, más plantilla e
  índice.
- `scripts/crear_notas_bombas.py` las genera desde `bombas.csv` y **no
  sobrescribe** lo que ya existe.
- Todos los campos de sello, empaque y o-ring quedaron **vacíos a propósito**.
- Nota: [[13-Base-de-conocimiento-IA]]

## 5 · Consulta por IA con regla antiinvención

- `scripts/consultar_bombas.py`: carga las fichas y consulta Gemini, Claude u
  OpenAI con la misma instrucción de sistema.
- Regla central del prompt: si el campo está vacío, responder *"ese dato
  todavía no está levantado"*. Nunca inventar una medida, marca ni código,
  porque un o-ring equivocado en una planta de alcohol es una fuga de
  producto inflamable.

## 6 · Preparación para un CMMS

- `scripts/exportar_cmms.py` genera cuatro tablas: activos, catálogo de
  repuestos, BOM e historial.
- Taxonomía **ISO 14224** usada como vocabulario, no como certificación.
- Códigos de repuesto deterministas por **md5** de la identidad de la pieza,
  o el número de parte del fabricante cuando existe.
- Chequeo de integridad: si un renglón del BOM no tiene su pieza en el
  catálogo, el export **aborta**.
- Nota: [[14-Migracion-a-CMMS]]

## 7 · El visor 3D

- Servidor local Node (`server.mjs`) en 127.0.0.1, sin dependencias externas.
- Three.js r170: mapa del área, acercamiento a la bomba, despiece con
  deslizador de explosión, panel de ficha, historial e IA.
- Módulo `public/realismo.js`: entorno PMREM procedural, luz de tres puntos
  con sombra real, materiales PBR por familia, tone mapping ACES Filmic.
- Pruebas propias: `test.mjs`, `test-layout.mjs`, `test-sector.mjs`,
  `test-despiece.mjs`.

## 8 · Levantamiento fotográfico

- Ordenó las 41 fotos del área, corrigió la orientación de 5 regenerándolas
  desde el HEIC original a 2200 px.
- Leyó **10 placas** a resolución completa y resolvió la ambigüedad entre las
  series `210775-2` y `220105-2`: son dos bombas distintas, ambas 3X4-8G.
- Notas: [[12-Levantamiento-fotografico-del-area]], [[14-Indice-de-fotos-y-placas]]

## 9 · El hallazgo que más vale

Identificó que las bombas son **ANSI/ASME B73.1**, a partir de las
designaciones de placa (`1X1.5-8`, `3X4X8G`) y de los modelos Hidromac 2196
y Titan 4196.

Consecuencia práctica: el sello es intercambiable entre marcas del mismo
tamaño y el diámetro de eje bajo el sello lo fija el grupo de potencia, no el
modelo comercial. Esto permite estandarizar el repuesto en bodega.

Nota: [[13-Hallazgo-ANSI-B73]]

## Lo que Claude **no** hizo

- No levantó ninguna medida de sello, empaque u o-ring.
- No asoció ninguna serie de placa con ningún TAG del P&ID.
- No generó geometría CAD dimensionada.
- No hizo el plano 2D con bloques de atributos.
- No instaló ningún CMMS.
