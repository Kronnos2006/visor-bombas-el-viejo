// Todas las bombas abren con la misma estructura: Datos y fotos → Resumen de la bomba.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const m=new Map();globalThis.localStorage={getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,v)};
const {bombaParaResumen,clavePendiente}=await import('./public/ficha-pendiente.js');

test('el resumen de una bomba sin ficha usa los mismos campos que una ficha completa',()=>{
 const s={sector:'torre',nombre:'Ref 1',tagAsignado:'B14',excel:{liquido:'Alcohol',tamano:'1X1.5-8',bomba:'Hidromac 2196 · GPM: 8 · HD [m]: 30 · RPM: 3500',motor:'WEG 5 HP',sello:'Tipo 1'}};
 localStorage.setItem(clavePendiente(s),JSON.stringify({rodamiento_delantero:'6207',temperatura:'40 °C'}));
 const p=bombaParaResumen(s);
 assert.equal(p.tag,'B14');assert.equal(p.servicio,'Alcohol');assert.equal(p.size,'1X1.5-8');
 assert.deepEqual(p.specs.find(([k])=>k==='Caudal'),['Caudal','8 GPM']);
 assert.equal(p.motor.marca,'WEG 5 HP');assert.equal(p.seal.tipo,'Tipo 1');assert.equal(p.rodamientos.delantero,'6207');assert.equal(p.temperaturaTexto,'40 °C');
});
test('la ficha sin ficha completa empieza con Datos y fotos y deja el formulario plegado',async()=>{
 const src=await readFile(new URL('./public/ficha-pendiente.js',import.meta.url),'utf8');
 const i=src.indexOf('Datos y fotos de'),j=src.indexOf('id="resumen-pendiente"'),k=src.indexOf('id="editar-datos"');
 assert.ok(i>0&&i<j&&j<k);assert.match(src,/Editar datos de \$\{esc\(titulo\)\}/);assert.match(src,/Editar fotos de \$\{esc\(titulo\)\}/);
 const app=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
 assert.match(app,/paintPumpSummary\(bombaParaResumen\(reference\),\{pendiente:true\}\)/);
});
test('Bodega quedó fuera: no aparece en la barra ni se puede abrir, y no hay «Pedir repuestos»',async()=>{
 const app=await readFile(new URL('./public/telefono-app.js',import.meta.url),'utf8');
 assert.match(app,/\{id: 'bodega', oculta: true/);assert.match(app,/SECCIONES\.filter\(s => !s\.oculta\)\.map/);
 assert.match(app,/requestedSection&&!s\.oculta/);
 const css=await readFile(new URL('./public/telefono-app.css',import.meta.url),'utf8');
 assert.match(css,/\[data-order-action="parts"\]\{display:none!important\}/);
});
