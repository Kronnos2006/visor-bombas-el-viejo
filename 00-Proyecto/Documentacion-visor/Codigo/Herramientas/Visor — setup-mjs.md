# Visor/setup.mjs

Descarga de dependencias con versiones fijadas.

**Categoría:** Herramientas. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/visor-bombas/setup.mjs>).

SHA-256: `f78e1cfeb5795f0ffb64278c22474a3648b706f4126d6e2965de7a7ccad2f9c4`

Esta es una copia documental. Editar el original para cambiar el programa.

````javascript
import { mkdir, writeFile } from 'node:fs/promises';
const assets = [
 ['public/vendor/three.module.js','https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js'],
 ['public/vendor/OrbitControls.js','https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js'],
 ['vendor/js-yaml.mjs','https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs'],
 ['public/vendor/THREE-LICENSE.txt','https://cdn.jsdelivr.net/npm/three@0.170.0/LICENSE'],
 ['vendor/YAML-LICENSE.txt','https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/LICENSE']
];
for (const [path,url] of assets) {
 const res = await fetch(url); if (!res.ok) throw new Error(`${res.status}: ${url}`);
 await mkdir(new URL('.',new URL(path,import.meta.url)),{recursive:true});
 await writeFile(new URL(path,import.meta.url),await res.text());
 console.log(`Descargado ${path}`);
}

````
