// Editor de diseño: validación y aplicación sobre un HTML de prueba (sin red ni base real).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {limpiarDiseno,enlaceSeguro,cssDeColores,ELEMENTOS} from './public/diseno-core.js';

test('solo acepta colores hex y textos planos de piezas conocidas',()=>{
 const d=limpiarDiseno({colores:{oscuro:{accent:'#FF0000',fondo:'red;}body{x',inventado:'#000000'}},textos:{'nav-historial':'  Progreso ','no-existe':'x','buscador':'sin texto'},ocultos:['nav-historial','nav-areas','tab-ficha','raro']});
 assert.deepEqual(d.colores.oscuro,{accent:'#ff0000'});
 assert.deepEqual(d.textos,{'nav-historial':'Progreso'});
 assert.deepEqual(d.ocultos,['nav-historial']);
});
test('los enlaces solo pueden ser https o páginas del visor',()=>{
 assert.equal(enlaceSeguro('javascript:alert(1)'),null);
 assert.equal(enlaceSeguro('data:text/html,x'),null);
 assert.equal(enlaceSeguro('//malo.com'),null);
 assert.equal(enlaceSeguro('http://inseguro.com'),null);
 assert.equal(enlaceSeguro('/avance.html'),'/avance.html');
 assert.equal(enlaceSeguro('https://drive.google.com/x'),'https://drive.google.com/x');
 const d=limpiarDiseno({menu:[{texto:'Drive',enlace:'https://drive.google.com'},{texto:'Malo',enlace:'javascript:1'}],logo:'javascript:1'});
 assert.equal(d.menu.length,1);assert.equal(d.logo,'');
});
test('el orden solo usa piezas existentes y como máximo 8 botones extra',()=>{
 const d=limpiarDiseno({menu:Array.from({length:12},(_,i)=>({texto:'b'+i,enlace:'/'})),orden:{menu:['nav-bodega','extra-3','extra-20','x'],pestanas:['tab-sim','tab-ficha']}});
 assert.equal(d.menu.length,8);assert.deepEqual(d.orden.menu,['nav-bodega','extra-3']);assert.deepEqual(d.orden.pestanas,['tab-sim','tab-ficha']);
});
test('el CSS de colores no deja escapar nada raro',()=>{
 const css=cssDeColores(limpiarDiseno({colores:{oscuro:{accent:'#112233'},claro:{fondo:'#ffffff'}}}));
 assert.match(css,/body:not\(\.claro\)\{--accent:#112233\}/);assert.match(css,/body\.claro\{--fondo:#ffffff\}/);
});
test('cada pieza editable existe en la página o en el diseño del visor',async()=>{
 const fuente=(await readFile(new URL('./public/index.html',import.meta.url),'utf8'))+(await readFile(new URL('./public/telefono-app.js',import.meta.url),'utf8'))+(await readFile(new URL('./public/cloud-photo-global.js',import.meta.url),'utf8'))+(await readFile(new URL('./public/paleta-bombas.js',import.meta.url),'utf8'))+(await readFile(new URL('./public/cabecera-flujo.js',import.meta.url),'utf8'));
 for(const e of ELEMENTOS){
  const claves=[...e.sel.matchAll(/#([\w-]+)|data-(?:s|tab)="(\w+)"|\.(tel-[\w-]+|cloud-[\w-]+)/g)].map(m=>m[1]||m[2]||m[3]);
  assert.ok(claves.length,e.id);for(const c of claves)assert.ok(fuente.includes(c),e.id+' → '+c);
 }
 assert.match(fuente,/diseno\.js/);
});
test('la tabla del diseño solo deja guardar a administradores y no permite borrar',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/20261111140000_vocatus_site_design.sql',import.meta.url),'utf8');
 assert.doesNotMatch(sql,/grant[^;]*delete/i);
 assert.match(sql,/for insert[\s\S]*current_is_admin/);assert.match(sql,/for update[\s\S]*current_is_admin/);
 assert.match(sql,/supabase_realtime/);
});
test('el editor es página de administrador',async()=>{
 for(const f of ['auth.mjs','cloud-identity.mjs','cloud-edge-access.js'])assert.match(await readFile(new URL('./'+f,import.meta.url),'utf8'),/\/diseno\.html/,f);
});
test('la vista previa del editor puede cargarse solo desde la misma web',async()=>{
 const cfg=JSON.parse(await readFile(new URL('./vercel.json',import.meta.url),'utf8'));
 const h=cfg.headers.flatMap(x=>x.headers).find(x=>x.key==='X-Frame-Options');
 assert.equal(h.value,'SAMEORIGIN');
});
