from pathlib import Path
import argparse, hashlib, json, sys, zipfile

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / '.herramientas-fotos'))
from PIL import Image, ImageDraw, ImageOps
import pillow_heif

pillow_heif.register_heif_opener()
parser = argparse.ArgumentParser(description='Conserva HEIC y genera JPG/hojas de contacto.')
parser.add_argument('zip')
parser.add_argument('salida')
args = parser.parse_args()
root = Path(args.salida)
original, consulta = root / 'Originales', root / 'Consulta'
original.mkdir(parents=True, exist_ok=True)
consulta.mkdir(parents=True, exist_ok=True)
records = []
with zipfile.ZipFile(args.zip) as archive:
    entries = [e for e in archive.infolist() if not e.is_dir() and e.filename.lower().endswith(('.heic', '.jpg', '.jpeg', '.png'))]
    for number, entry in enumerate(entries, 1):
        data, name = archive.read(entry), Path(entry.filename).name
        source = original / name
        source.write_bytes(data)
        image = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
        dimensions = image.size
        image.thumbnail((2200, 2200))
        preview = consulta / f'{Path(name).stem}.jpg'
        image.save(preview, quality=92)
        records.append({'numero': number, 'archivo': name, 'dimensiones': dimensions, 'sha256': hashlib.sha256(data).hexdigest()})
for start in range(0, len(records), 12):
    sheet = Image.new('RGB', (1400, 1200), '#eeeeee')
    draw = ImageDraw.Draw(sheet)
    for offset, record in enumerate(records[start:start + 12]):
        image = Image.open(consulta / f"{Path(record['archivo']).stem}.jpg")
        image.thumbnail((340, 355))
        x, y = (offset % 4) * 350, (offset // 4) * 400
        sheet.paste(image, (x + (350 - image.width) // 2, y))
        draw.text((x + 8, y + 360), f"{record['numero']:02}  {record['archivo']}", fill='black')
    sheet.save(root / f'contacto-{start // 12 + 1}.jpg', quality=92)
(root / 'inventario.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
print(f'{len(records)} fotos preparadas en {root.resolve()}')
