// Bodega en línea: repuestos del Excel, validación del pedido y reglas de la base (sin red ni base real).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {repuestosDeExcel,limpiarPedido} from './public/bodega.js';
const asig=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url),'utf8'));
const sql=await readFile(new URL('../supabase/migrations/20261112180000_vocatus_pedidos_repuestos.sql',import.meta.url),'utf8');

test('las bombas sin ficha completa toman sus repuestos del Excel',()=>{
 const r=repuestosDeExcel('B1',asig);
 assert.ok(r.some(x=>x.pieza==='Sello mecánico'));assert.ok(r.some(x=>x.pieza==='Rodamiento delantero'&&/6308/.test(x.detalle)));
 assert.ok(r.every(x=>x.tag==='B1'&&x.cantidad===1));
 assert.deepEqual(repuestosDeExcel('B999',asig),[]);
});
test('el pedido se limpia: cantidades 1 a 99, sin filas vacías, máximo 40',()=>{
 const p=limpiarPedido([{tag:'B14',pieza:' Sello ',cantidad:0},{tag:'x',pieza:'Rodamiento',cantidad:500},{pieza:''}],'  urgente ');
 assert.deepEqual(p.items,[{tag:'B14',pieza:'Sello',detalle:'',codigo:'',cantidad:1},{tag:'',pieza:'Rodamiento',detalle:'',codigo:'',cantidad:99}]);
 assert.equal(p.note,'urgente');
 assert.throws(()=>limpiarPedido([]),/al menos un repuesto/);
 assert.throws(()=>limpiarPedido(Array.from({length:41},()=>({pieza:'a'}))),/40/);
});
test('la base: quien pide ve los suyos, el administrador ve y marca todos, se avisa con la campana',()=>{
 assert.match(sql,/parts_read[\s\S]*created_by=\(select auth\.uid\(\)\) or \(select vocatus_access\.current_is_admin\(\)\)/);
 assert.match(sql,/parts_cancel_own[\s\S]*status='pendiente'[\s\S]*status='cancelado'/);
 assert.match(sql,/notify_admins\(new\.created_by,'repuestos'/);
 assert.match(sql,/listos para retirar/);
 assert.doesNotMatch(sql,/grant[^;]*\bdelete\s*(,|on)/i);
 assert.match(sql,/supabase_realtime/);
});
test('Bodega ya no manda a la página de la versión de computadora',async()=>{
 const app=await readFile(new URL('./public/telefono-app.js',import.meta.url),'utf8');
 assert.doesNotMatch(app,/id="bod-ir" href="\/solicitud\.html"/);
 assert.match(app,/iniciarBodega\(/);assert.match(app,/repuestosDeExcel\(/);
});
