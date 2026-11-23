// La respuesta de Gemini se muestra con formato legible y sin dejar pasar HTML.
import test from 'node:test';
import assert from 'node:assert/strict';
import {respuestaIaHtml} from './public/respuesta-ia.js';

test('convierte negritas, viñetas, líneas y código sin dejar marcas visibles',()=>{
 const h=respuestaIaHtml('**RESPUESTA DE DEMOSTRACIÓN**\n\nNo hay historial de la bomba **B72** (Modelo: CR15).\n\n---\n**Fuentes utilizadas:**\n* Inventario actual · B72 (`Inventario actual · B72`)\n* Otra fuente');
 assert.match(h,/<h4>RESPUESTA DE DEMOSTRACIÓN<\/h4>/);
 assert.match(h,/<strong>B72<\/strong>/);
 assert.match(h,/<hr>/);
 assert.match(h,/<h4>Fuentes utilizadas:<\/h4>/);
 assert.match(h,/<ul><li>Inventario actual · B72 \(<code>Inventario actual · B72<\/code>\)<\/li><li>Otra fuente<\/li><\/ul>/);
 assert.doesNotMatch(h,/\*\*|`/);
});
test('listas numeradas y títulos con #',()=>{
 const h=respuestaIaHtml('## Pasos\n1. Apagar\n2) Revisar sello');
 assert.match(h,/<h4>Pasos<\/h4><ol><li>Apagar<\/li><li>Revisar sello<\/li><\/ol>/);
});
test('el HTML que venga en la respuesta se muestra como texto, no se ejecuta',()=>{
 const h=respuestaIaHtml('<img src=x onerror=alert(1)> **ok** <script>x</script>');
 assert.doesNotMatch(h,/<img|<script/);
 assert.match(h,/&lt;img/);
 assert.match(h,/<strong>ok<\/strong>/);
});
test('texto vacío o nulo no falla',()=>{assert.equal(respuestaIaHtml(''),'');assert.equal(respuestaIaHtml(null),'');});
