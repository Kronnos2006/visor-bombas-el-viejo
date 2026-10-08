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
