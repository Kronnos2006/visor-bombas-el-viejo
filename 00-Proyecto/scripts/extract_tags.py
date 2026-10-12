import os, re, json, csv, subprocess, sys, collections, argparse, shutil
parser = argparse.ArgumentParser(description='Extraer TAG de los DWG de una bóveda de Obsidian.')
parser.add_argument('--source', default=os.environ.get('OBSIDIAN_VAULT') or os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
parser.add_argument('--output', help='Carpeta de salida para DXF y tags_crudos.csv')
parser.add_argument('--converter', default=shutil.which('dwg2dxf'), help='Ejecutable dwg2dxf de LibreDWG')
args = parser.parse_args()
SRC = os.path.abspath(args.source)
DXF = os.path.abspath(args.output or os.path.join(SRC, '00-Proyecto/export/dxf'))
DWG2DXF = args.converter
if not os.path.isdir(SRC):
    parser.error('No existe la bóveda indicada en --source.')
if not DWG2DXF or not os.path.isfile(DWG2DXF):
    parser.error('No se encontró LibreDWG. Indicá --converter con la ruta de dwg2dxf.')
try:
    import ezdxf
except ImportError:
    parser.error('Falta ezdxf. Instalalo con python -m pip install ezdxf.')
from ezdxf import recover
os.makedirs(DXF, exist_ok=True)

TAG_RE = re.compile(r'\b([A-Z]{1,3})[- ]?(\d{3,4})([A-Z](?:/[A-Z])?)?\b')
rows=[]; errs=[]
files=[]
for root,_,fs in os.walk(SRC):
    for f in fs:
        if f.lower().endswith('.dwg') and not f.startswith('._'):
            files.append(os.path.join(root,f))
files.sort()
if not files:
    parser.error('No se encontraron archivos DWG; no se generó un CSV vacío.')
for i,src in enumerate(files):
    rel=os.path.relpath(src,SRC)
    out=os.path.join(DXF, rel.replace(os.sep,'__')+'.dxf')
    r=subprocess.run([DWG2DXF,"-o",out,src],capture_output=True)
    if not os.path.exists(out):
        errs.append((rel,"dwg2dxf fallo")); continue
    try:
        doc,_=recover.readfile(out)
    except Exception as e:
        errs.append((rel,f"ezdxf: {e}")); continue
    msp=doc.modelspace()
    found=collections.Counter()
    ctx={}
    for e in msp:
        t=e.dxftype(); s=None
        if t=="MTEXT": s=e.plain_text()
        elif t=="TEXT": s=e.dxf.text
        elif t=="INSERT":
            for a in e.attribs:
                for m in TAG_RE.finditer(a.dxf.text or ""):
                    tag=f"{m.group(1)}-{m.group(2)}{m.group(3) or ''}"
                    found[tag]+=1
            continue
        if not s: continue
        for m in TAG_RE.finditer(s):
            tag=f"{m.group(1)}-{m.group(2)}{m.group(3) or ''}"
            found[tag]+=1
            try: ctx[tag]=(round(e.dxf.insert[0],1), round(e.dxf.insert[1],1))
            except Exception: pass
    for tag,n in found.items():
        x,y=ctx.get(tag,("",""))
        rows.append({"tag":tag,"prefijo":tag.split("-")[0],"archivo_dwg":rel,
                     "veces":n,"x":x,"y":y})
with open(os.path.join(DXF, "tags_crudos.csv"),"w",newline="",encoding="utf-8") as fh:
    w=csv.DictWriter(fh,["tag","prefijo","archivo_dwg","veces","x","y"]); w.writeheader(); w.writerows(rows)
print("DWG procesados:",len(files),"| con error:",len(errs))
for e in errs[:10]: print("  ERR",e)
pre=collections.Counter(r["prefijo"] for r in rows)
print("PREFIJOS:",dict(pre.most_common()))
tags=sorted({r["tag"] for r in rows})
print("TAGS UNICOS:",len(tags))
bombas=sorted({t for t in tags if t.startswith("P-")})
print("BOMBAS (P-):",bombas)
