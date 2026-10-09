# 07 — Script `extract_tags.py`

Archivo real: `00-Proyecto/scripts/extract_tags.py`
Salida: `00-Proyecto/tags_equipos_vocatus.csv`
Resultado probado: **56 DWG, 0 errores, 45 TAG únicos, 151 apariciones.**

## Qué hace
1. Recorre una carpeta y busca todos los `.dwg`.
2. Convierte cada uno a DXF con **LibreDWG** (`dwg2dxf`).
3. Abre el DXF con **ezdxf** y lee los textos del plano: `TEXT`, `MTEXT`
   y los atributos de los bloques (`INSERT`).
4. Busca el patrón de TAG: 1–3 letras mayúsculas, guion, 3–4 números,
   letra opcional al final. Ej: `P-1401`, `H-1401A`.
5. Escribe un CSV con: TAG, prefijo, plano donde aparece, veces,
   y coordenadas X/Y dentro del dibujo.

Las coordenadas X/Y son las que después permiten ubicar cada bomba en el
plano y enlazarla con el objeto del modelo 3D.

## Requisitos
- Python 3 con `ezdxf` → `pip install ezdxf`
- LibreDWG compilado → ver [[05-Herramientas-DWG]]

## Cómo correrlo
Editar las dos rutas de arriba del archivo (`SRC` y `DWG2DXF`) y ejecutar:

```bash
python3 extract_tags.py
```

## Código

```python
import os, re, json, csv, subprocess, sys, collections

SRC = "RUTA/A/LA/CARPETA/CON/DWG"          # <- editar
DXF = "/tmp/work/dxf"; os.makedirs(DXF, exist_ok=True)
DWG2DXF = "/ruta/a/libredwg/programs/dwg2dxf"   # <- editar

import ezdxf
from ezdxf import recover

TAG_RE = re.compile(r'\b([A-Z]{1,3})[- ]?(\d{3,4})([A-Z](?:/[A-Z])?)?\b')
rows, errs, files = [], [], []

for root, _, fs in os.walk(SRC):
    for f in fs:
        if f.lower().endswith('.dwg') and not f.startswith('._'):
            files.append(os.path.join(root, f))
files.sort()

for src in files:
    rel = os.path.relpath(src, SRC)
    out = os.path.join(DXF, rel.replace(os.sep, '__') + '.dxf')
    subprocess.run([DWG2DXF, "-o", out, src], capture_output=True)
    if not os.path.exists(out):
        errs.append((rel, "dwg2dxf fallo")); continue
    try:
        doc, _ = recover.readfile(out)
    except Exception as e:
        errs.append((rel, f"ezdxf: {e}")); continue

    msp = doc.modelspace()
    found = collections.Counter()
    ctx = {}
    for e in msp:
        t = e.dxftype(); s = None
        if t == "MTEXT":
            s = e.plain_text()
        elif t == "TEXT":
            s = e.dxf.text
        elif t == "INSERT":
            for a in e.attribs:
                for m in TAG_RE.finditer(a.dxf.text or ""):
                    found[f"{m.group(1)}-{m.group(2)}{m.group(3) or ''}"] += 1
            continue
        if not s:
            continue
        for m in TAG_RE.finditer(s):
            tag = f"{m.group(1)}-{m.group(2)}{m.group(3) or ''}"
            found[tag] += 1
            try:
                ctx[tag] = (round(e.dxf.insert[0], 1), round(e.dxf.insert[1], 1))
            except Exception:
                pass

    for tag, n in found.items():
        x, y = ctx.get(tag, ("", ""))
        rows.append({"tag": tag, "prefijo": tag.split("-")[0],
                     "archivo_dwg": rel, "veces": n, "x": x, "y": y})

with open("tags_crudos.csv", "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, ["tag", "prefijo", "archivo_dwg", "veces", "x", "y"])
    w.writeheader(); w.writerows(rows)

print("DWG procesados:", len(files), "| con error:", len(errs))
for e in errs[:10]:
    print("  ERR", e)
pre = collections.Counter(r["prefijo"] for r in rows)
print("PREFIJOS:", dict(pre.most_common()))
tags = sorted({r["tag"] for r in rows})
print("TAGS UNICOS:", len(tags))
print("BOMBAS (P-):", sorted(t for t in tags if t.startswith("P-")))
```

## Mejoras pendientes
- Leer también el *paper space* (layouts), no solo el modelo.
- Distinguir TAG real de texto suelto que casualmente matchea el patrón
  (ej. `TO-075`, `TO-125` probablemente no son equipos).
- Asociar cada TAG con el texto vecino (servicio, fluido) por cercanía de
  coordenadas.
- Soportar DXF directo, sin pasar por LibreDWG.

Relacionado: [[05-Herramientas-DWG]] · [[06-Equipos-detectados]] · [[03-Base-Activos-Bombas]]
