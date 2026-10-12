import importlib.util
import json
import os
from pathlib import Path
import shutil
import sys
import unittest
from uuid import uuid4

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).resolve().parent / 'exportar_cmms.py'

class ExportacionMantenimiento(unittest.TestCase):
    def setUp(self):
        self.root = SCRIPT.parent / ('.test-cmms-' + uuid4().hex)
        self.root.mkdir()
        self.project = self.root / '00-Proyecto'
        for folder in ('bombas', 'equipos', 'Mantenimiento', 'informes-mantenimiento'):
            (self.project / folder).mkdir(parents=True)
        self.previous = os.environ.get('OBSIDIAN_VAULT')
        os.environ['OBSIDIAN_VAULT'] = str(self.root)
        spec = importlib.util.spec_from_file_location('export_test', SCRIPT)
        self.exporter = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.exporter)
        self.write('equipos/B33.md', '---\ntipo: equipo\nid: B33\nubicacion: Cabezas\nmarca: HIDROMAC\nmodelo: 2196\norings: []\n---\n# B33\n')

    def write(self, relative, text):
        (self.project / relative).write_text(text, encoding='utf-8')

    def tearDown(self):
        if self.previous is None:
            os.environ.pop('OBSIDIAN_VAULT', None)
        else:
            os.environ['OBSIDIAN_VAULT'] = self.previous
        assert self.root.resolve().parent == SCRIPT.parent.resolve()
        assert self.root.name.startswith('.test-cmms-')
        shutil.rmtree(self.root)

    def test_actual_legacy_y_demo(self):
        description = 'Inspección "sello" # campo'
        self.write('Mantenimiento/B33_actual.md', '---\ntag: B33\nbomba: B33\nfecha: "2026-10-11"\nresponsable: "Técnico de prueba"\ndemostracion: false\ndescripcion: ' + json.dumps(description, ensure_ascii=False) + '\n---\n## Intervención\nHecha.\n')
        self.write('Mantenimiento/B33_legacy.md', '---\nbomba: B33\nfecha: 2026-10-10\n---\nResponsable: Responsable antiguo\n\n## Intervención\nTexto antiguo.\n\n## Repuestos utilizados\nSin cambio.\n')
        self.write('informes-mantenimiento/B33_otro.md', '---\ntag: B33\nfecha: 2026-10-09\nresponsable: Otro técnico\n---\nInforme anterior.\n')
        self.write('Mantenimiento/B33_demo.md', '---\ntag: B33\ndemostracion: true\n---\nDEMO\n')
        self.write('Mantenimiento/B999_huerfano.md', '---\ntag: B999\n---\nNo tiene ficha.\n')
        self.exporter.main()
        import csv
        with (self.project / 'export/ordenes.csv').open(encoding='utf-8-sig') as stream:
            rows = list(csv.DictReader(stream))
        self.assertEqual(len(rows), 3)
        self.assertTrue(all(r['tag_activo'] == 'B33' for r in rows))
        self.assertIn(description, [r['descripcion'] for r in rows])
        self.assertIn('Responsable antiguo', [r['responsable'] for r in rows])
        self.assertIn('Texto antiguo.', [r['descripcion'] for r in rows])
        self.assertTrue(any('DEMO' in warning for warning in self.exporter.avisos))
        self.assertTrue(any('sin activo exportable' in warning for warning in self.exporter.avisos))

if __name__ == '__main__':
    unittest.main()
