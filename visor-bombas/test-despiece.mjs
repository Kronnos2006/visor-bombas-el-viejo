// Verifica que el despiece siga la arquitectura ANSI/ASME B73.1 y que no
// prometa medidas que todavía no están levantadas.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const DIR=path.dirname(fileURLToPath(import.meta.url));
const src=readFileSync(path.join(DIR,'public/app.js'),'utf8');

// 1. La lista de piezas existe y tiene las diez posiciones del conjunto.
const bloque=src.slice(src.indexOf('const parts=['),src.indexOf('];',src.indexOf('const parts=[')));
const nombres=[...bloque.matchAll(/\{name:'([^']+)'/g)].map(m=>m[1]);
assert.equal(nombres.length,10,'El despiece debe tener 10 piezas');

// 2. Las piezas obligatorias del desarme posterior.
for(const esperada of ['Carcasa (voluta)','Impulsor abierto','Tapa de carcasa','Cámara de sello','Sello mecánico','Eje','Bancada de rodamientos','Acople espaciador','Motor eléctrico'])
 assert.ok(nombres.includes(esperada),`Falta la pieza «${esperada}»`);

// 3. Cada pieza declara su nombre de catálogo en inglés, para cruzar con el fabricante.
const piezas=[...bloque.matchAll(/pieza:'([^']+)'/g)].map(m=>m[1]);
assert.equal(piezas.length,10,'Cada pieza debe declarar su nombre de catálogo');

// 4. El sello es el repuesto crítico: debe pedir los campos de compra completos.
const sello=bloque.slice(bloque.indexOf("name:'Sello mecánico'"));
for(const campo of ['sello_modelo','sello_diametro_mm','sello_cara_rotativa','sello_cara_estatica','sello_elastomero','empaque_seccion_mm'])
 assert.ok(sello.includes(campo),`El sello no consulta ${campo}`);

// 5. Ninguna pieza puede inventar una clave que la ficha no tenga.
const plantillaLocal=path.join(DIR,'../autocad el vieno vovatus/00-Proyecto/bombas/_plantilla-bomba.md');
const plantillaRepo=path.join(DIR,'../00-Proyecto/bombas/_plantilla-bomba.md');
const plantilla=readFileSync(existsSync(plantillaLocal)?plantillaLocal:plantillaRepo,'utf8');
const claves=new Set([...plantilla.matchAll(/^([a-z_0-9]+):/gm)].map(m=>m[1]));
for(const [,clave] of bloque.matchAll(/\['[^']*','([a-z_0-9]+)'\]/g))
 assert.ok(claves.has(clave),`La pieza consulta «${clave}», que no existe en la ficha`);

// 6. La geometría usa las mismas diez posiciones que la lista.
assert.ok(/const bases=\[([^\]]+)\]/.test(src),'Falta el arreglo de posiciones');
const bases=RegExp.$1.split(',').map(Number);
assert.equal(bases.length,10,'Debe haber una posición por pieza');
for(let i=1;i<bases.length;i++)assert.ok(bases[i]>bases[i-1],'Las posiciones deben ir en orden del lado húmedo al motor');

// 7. El visor no debe declarar que esto es el plano del fabricante.
assert.ok(/no es plano de taller/.test(src),'Falta la advertencia de que no es plano de taller');
assert.ok(!/despiece gen[eé]rico ilustrativo/i.test(src),'Quedó texto viejo de despiece genérico');

console.log(`OK: ${nombres.length} piezas B73.1 en orden, claves válidas y advertencia presente.`);
