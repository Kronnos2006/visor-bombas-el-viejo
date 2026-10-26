"""Prueba de navegador del levantamiento por TAG (requiere: pip install playwright; playwright install chromium).

Copia la bóveda del repositorio a una carpeta temporal, levanta el visor apuntando a esa copia
y comprueba que preparar B32 y luego guardar B33 no transfiere campos, o-rings, observaciones
ni fotos de B32, y que el borrador de B32 se conserva. Nunca escribe en la bóveda real.

Uso:  python visor-bombas/tools/e2e-levantamiento.py
"""
import asyncio, os, shutil, socket, subprocess, sys, tempfile, time, pathlib, struct, zlib
from playwright.async_api import async_playwright

RAIZ = pathlib.Path(__file__).resolve().parents[2]
VISOR = RAIZ / 'visor-bombas'

def png(ruta):  # imagen mínima válida, sin dependencias
    fila = b'\x00' + b'\xc8\x1e\x1e' * 40
    datos = zlib.compress(fila * 30)
    trozo = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    ruta.write_bytes(b'\x89PNG\r\n\x1a\n' + trozo(b'IHDR', struct.pack('>IIBBBBB', 40, 30, 8, 2, 0, 0, 0)) + trozo(b'IDAT', datos) + trozo(b'IEND', b''))

def puerto_libre():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p

async def prueba(base, tmp):
    async with async_playwright() as p:
        nav = await p.chromium.launch()
        pg = await nav.new_page(viewport={'width': 420, 'height': 900})
        errores = []; pg.on('pageerror', lambda e: errores.append(str(e)))
        async def lenta(route):  # la ficha de B32 responde tarde
            if 'tag=B32' in route.request.url: await asyncio.sleep(2)
            await route.continue_()
        await pg.route('**/api/pump?*', lenta)
        await pg.goto(base + '/levantamiento.html?tag=B32'); await pg.wait_for_timeout(3000)
        campo = (await pg.eval_on_selector_all('#form [data-group] input[name]', 'e=>e.map(x=>x.name)'))[0]
        await pg.fill('#form [name=author]', 'Prueba automática')
        await pg.fill(f'#form [name="{campo}"]', 'DATO-B32')
        await pg.fill('#form [name=observations]', 'observacion de B32')
        await pg.click('#add-oring'); await pg.fill('.oring [data-k=medida]', '45 x 3 mm')
        await pg.set_input_files('#photo-input', str(tmp / 'foto.png')); await pg.wait_for_timeout(1000)
        assert await pg.locator('#photos figure').count() == 1
        await pg.fill('#tag', 'B33'); await pg.dispatch_event('#tag', 'change'); await pg.wait_for_timeout(3000)
        restos = await pg.eval_on_selector_all('#form [data-group] [name]', 'e=>e.map(x=>x.value).filter(Boolean)')
        assert restos == [], f'B33 heredó campos de B32: {restos}'
        assert await pg.input_value('#form [name=observations]') == '', 'B33 heredó la observación'
        assert await pg.locator('.oring').count() == 0, 'B33 heredó o-rings'
        assert await pg.locator('#photos figure').count() == 0, 'B33 heredó fotos'
        assert 'B33' in await pg.text_content('#destino')
        await pg.fill(f'#form [name="{campo}"]', 'DATO-B33'); await pg.wait_for_timeout(600)
        await pg.click('#save'); await pg.wait_for_timeout(2500)
        assert 'Guardado' in await pg.text_content('#result'), await pg.text_content('#result')
        await pg.fill('#tag', 'B32'); await pg.dispatch_event('#tag', 'change'); await pg.wait_for_timeout(3500)
        assert await pg.input_value(f'#form [name="{campo}"]') == 'DATO-B32', 'Se perdió el borrador de B32'
        assert await pg.locator('.oring').count() == 1 and await pg.locator('#photos figure').count() == 1
        assert not errores, errores
        await nav.close()

def main():
    with tempfile.TemporaryDirectory(prefix='vocatus-prueba-') as d:
        tmp = pathlib.Path(d); shutil.copytree(RAIZ / '00-Proyecto', tmp / '00-Proyecto'); png(tmp / 'foto.png')
        antes = (tmp / '00-Proyecto/equipos/B33.md').read_text(encoding='utf-8')
        puerto = puerto_libre()
        env = {**os.environ, 'OBSIDIAN_VAULT': str(tmp), 'PORT': str(puerto), 'VOCATUS_DEMO': '0'}
        srv = subprocess.Popen(['node', 'server.mjs'], cwd=VISOR, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            time.sleep(2); asyncio.run(prueba(f'http://localhost:{puerto}', tmp))
        finally:
            srv.terminate()
        despues = (tmp / '00-Proyecto/equipos/B33.md').read_text(encoding='utf-8')
        nuevas = [l for l in despues.splitlines() if l not in antes.splitlines()]
        for marca in ('DATO-B32', '45 x 3 mm', 'observacion de B32', 'fotos-campo/B33'):
            assert not any(marca in l for l in nuevas), f'B33 recibió datos de B32: {marca}'
        assert any('DATO-B33' in l for l in nuevas), 'No se guardó el dato de B33'
    print('OK: preparar B32 y guardar B33 no transfiere campos, o-rings, observaciones ni fotos; el borrador de B32 se conserva.')

if __name__ == '__main__':
    sys.exit(main())
