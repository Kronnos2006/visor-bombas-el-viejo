# Visor/archivo/auditorias/auditar_exportador.py

Archivo del visor: archivo/auditorias/auditar_exportador.py

**Categoría:** Archivo. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/visor-bombas/archivo/auditorias/auditar_exportador.py>).

SHA-256: `6e250f8f1bed8ab83c812eb826a4adb4452c39e3f86f3c1003bb46ed275df893`

Esta es una copia documental. Código histórico; no ejecutar ni reponer sobre la aplicación actual.

````python
"""Prueba aislada del exportador adjunto; no altera el script ni sus salidas reales."""
import contextlib
import io
import runpy
import tempfile
from pathlib import Path

source = Path(r'C:\Users\Isabella GM\.codex\attachments\a61243c1-4d82-4014-930e-50d77e85d94b\Texto pegado.txt')
module = runpy.run_path(str(source))
scope = module['main'].__globals__
with tempfile.TemporaryDirectory() as directory:
    scope.update(NOTAS=str(Path(__file__).parent / 'demo-vault/00-Proyecto/bombas'),
                 INFORMES=str(Path(directory) / 'sin-informes'), SALIDA=directory)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            module['main']()
    except Exception as error:
        print(type(error).__name__ + ': ' + str(error))
    print('Revision generada:', (Path(directory) / '_revision.txt').exists())
    print('Fichas excluidas:', len(scope['avisos']))

````
