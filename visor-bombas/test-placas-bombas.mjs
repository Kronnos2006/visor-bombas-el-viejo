import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fijarPlacas,bloquePlaca,placaDe} from './public/placas-bombas.js';
const datos=JSON.parse(readFileSync(new URL('./public/modelos/placas-bombas.json',import.meta.url)));
test('cada una de las 83 bombas tiene entrada con manual o aviso',()=>{
 assert.equal(Object.keys(datos).length,83);
 for(const [tag,p] of Object.entries(datos)){assert.ok(p.manual?.texto,tag);if(p.manual.url)assert.match(p.manual.url,/^https:\/\//,tag);}
});
test('la ficha muestra placa, motor y el enlace al manual',()=>{
 fijarPlacas(datos);
 const html=bloquePlaca('B71');
 assert.match(html,/97786834/);assert.match(html,/href="https:\/\/api\.grundfos\.com/);assert.match(html,/rel="noopener noreferrer"/);
 assert.match(bloquePlaca('B57'),/Vale lo que dice la placa/);
 assert.match(bloquePlaca('B82'),/Sin manual/);assert.doesNotMatch(bloquePlaca('B82'),/href=/);
 assert.equal(bloquePlaca('B999'),'');assert.equal(placaDe('b71').manual.texto,datos.B71.manual.texto);
});
test('no deja pasar enlaces que no son https ni texto con HTML',()=>{
 fijarPlacas({B1:{placa:'<img src=x onerror=alert(1)>',manual:{texto:'x',url:'javascript:alert(1)'}}});
 const html=bloquePlaca('B1');assert.doesNotMatch(html,/<img/);assert.doesNotMatch(html,/javascript:/);
});
