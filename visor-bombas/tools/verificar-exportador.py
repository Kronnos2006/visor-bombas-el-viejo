"""Verificación del exportador vigente en salidas temporales aisladas."""
import contextlib
import csv
import io
import runpy
import tempfile
from pathlib import Path

app = Path(__file__).resolve().parent.parent
project = app.parent / 'autocad el vieno vovatus' / '00-Proyecto'
for label, notes, expected in [('demo', app / 'demo-vault/00-Proyecto/bombas', 0), ('real', project / 'bombas', 15)]:
    module = runpy.run_path(str(project / 'scripts/exportar_cmms.py'))
    output = Path(tempfile.mkdtemp(prefix='auditoria-export-', dir=app)).resolve()
    assert output.parent == app.resolve(), 'Salida fuera del proyecto'
    try:
        module['main'].__globals__.update(NOTAS=str(notes), INFORMES=str(output / 'sin-informes'), SALIDA=str(output))
        with contextlib.redirect_stdout(io.StringIO()):
            module['main']()
        with (output / 'activos.csv').open(encoding='utf-8-sig', newline='') as handle:
            rows = list(csv.DictReader(handle))
        assert len(rows) == expected
        report = (output / '_revision.txt').read_text(encoding='utf-8')
        if label == 'demo':
            assert 'P-9001' in report and 'P-9002' in report
        print(f'OK exportador vigente: {label}, {len(rows)} activos, _revision.txt generado. Sin informes externos en esta prueba.')
    finally:
        # Solo archivos de esta salida temporal propia; no borrado recursivo.
        for file in output.iterdir():
            if file.is_file():
                file.unlink()
        output.rmdir()
