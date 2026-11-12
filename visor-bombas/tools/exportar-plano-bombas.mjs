// Genera el mismo editor en un HTML autónomo para abrirlo sin servidor.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const pub=fileURLToPath(new URL('../public/',import.meta.url));
const read=f=>readFile(path.join(pub,f),'utf8');
const [page,css,core,script,points,map,image]=await Promise.all([
 readFile(new URL('./ubicar-bombas.template.html',import.meta.url),'utf8'),read('ubicar-bombas.css'),read('ubicar-bombas-core.js'),read('ubicar-bombas.js'),read('modelos/plano-bombas.json'),read('modelos/asignacion-bombas.json'),readFile(path.join(pub,'modelos/plano-bombas.jpg')),
]);
const safeJson=s=>s.replace(/</g,'\\u003c');
let js=script.replace(/^import .*?;\r?\n/,'');
js=js.replace("[D,base]=await Promise.all([fetchJson('/modelos/plano-bombas.json'),fetchJson('/modelos/asignacion-bombas.json')]);",`[D,base]=[${safeJson(points)},${safeJson(map)}];`);
const bundled=core.replace(/\bexport /g,'')+'\n'+js+"\nif(location.protocol==='file:')document.querySelector('.volver')?.remove();";
const html=page.replace('<link rel="stylesheet" href="/ubicar-bombas.css">',`<style>${css}</style>`)
 .replace('/modelos/plano-bombas.jpg','data:image/jpeg;base64,'+image.toString('base64'))
 .replace('<script type="module" src="/ubicar-bombas.js"></script>',()=>`<script type="module">${bundled.replace(/<\/script/gi,'<\\/script')}</script>`);
const target=path.resolve(process.argv[2]||path.join(pub,'ubicar-bombas.html'));
await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html);console.log(target);
