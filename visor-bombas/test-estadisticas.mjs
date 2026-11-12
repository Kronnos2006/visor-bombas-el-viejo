// Gráficos de reparaciones: los cálculos (sin pantalla ni base real).
import test from 'node:test';
import assert from 'node:assert/strict';
import {calcular,categoriasDe} from './public/estadisticas.js';

test('reconoce los problemas comunes aunque estén escritos de distintas formas',()=>{
 assert.deepEqual(categoriasDe('Cambio de sello por fuga'),['Sello / fuga']);
 assert.ok(categoriasDe('Rodamiento hace ruido').includes('Rodamientos'));
 assert.ok(categoriasDe('Rodamiento hace ruido').includes('Vibración / ruido'));
 assert.deepEqual(categoriasDe('MOTOR QUEMADO'),['Motor / eléctrico']);
 assert.deepEqual(categoriasDe('pintura'),['Otro']);
});
test('cuenta qué bomba se repara más, problemas, repuestos, meses y atención',()=>{
 const rep=(tag,date,data={})=>({tag,data:{date,...data}});
 const r=calcular({
  reports:[rep('B14','2026-11-01',{problema:'fuga en sello',parts:[{name:'sello tipo 21'}]}),rep('B14','2026-11-05',{problema:'sello gotea',operativo:'no',parts:[{name:'Sello tipo 21'}]}),rep('B2','2026-10-10',{problema:'cambio de rodamiento'}),{tag:'B9',data:{date:'2026-11-02'},archived_at:'x'}],
  orders:[{data:{type:'correctivo',status:'pendiente',due:'2026-11-01',title:'Revisar motor',created:'2026-11-01'}},{data:{type:'preventivo',status:'completada',due:'2026-12-01',created:'2026-11-02'}},{data:{type:'correctivo',status:'pendiente',due:'2026-11-30'},archived_at:'y'}],
  incidents:[{tag:'B14',title:'Hace ruido',status:'abierto',created_at:'2026-11-06T10:00:00Z'}]
 },{hoy:'2026-11-12'});
 assert.equal(r.trabajos,3);assert.equal(r.abiertas,1);assert.equal(r.vencidas,1);assert.equal(r.avisosAbiertos,1);
 assert.deepEqual(r.bombas[0],['B14',3]);
 assert.deepEqual(r.problemas[0],['Sello / fuga',2]);
 assert.deepEqual(r.repuestos[0],['Sello tipo 21',2]);
 assert.equal(r.meses.length,6);assert.deepEqual(r.meses.at(-1),['2026-11',2]);assert.deepEqual(r.meses.at(-2),['2026-10',1]);
 assert.equal(r.atencion.length,1);assert.equal(r.atencion[0].tag,'B14');assert.ok(r.atencion[0].sinFuncionar);
});
test('el período deja afuera los trabajos viejos',()=>{
 const r=calcular({reports:[{tag:'B1',data:{date:'2026-01-01'}},{tag:'B2',data:{date:'2026-11-10'}}]},{desde:'2026-10-13',hoy:'2026-11-12'});
 assert.equal(r.trabajos,1);assert.deepEqual(r.bombas,[['B2',1]]);
});
test('lee los informes con el formato guardado en la nube (texto, síntomas, repuestos en una línea)',async()=>{
 const {repuestosDe}=await import('./public/estadisticas.js');
 assert.deepEqual(repuestosDe('Código 456875 · sello'),['sello']);
 assert.deepEqual(repuestosDe('Código 1 · Rodamiento 6308; Código 2 · Sello tipo 21'),['Rodamiento 6308','Sello tipo 21']);
 assert.deepEqual(repuestosDe([{code:'X',name:'O-ring'}]),['O-ring']);
 assert.deepEqual(repuestosDe(undefined),[]);
 const r=calcular({reports:[{tag:'B41',data:{date:'2026-11-05',title:'Fuga',symptoms:'gotea por el sello',parts:'Código 456875 · sello',operativo:'no',retirado:true}}]},{hoy:'2026-11-12'});
 assert.equal(r.trabajos,1);assert.deepEqual(r.bombas,[['B41',1]]);assert.deepEqual(r.problemas[0],['Sello / fuga',1]);
 assert.deepEqual(r.repuestos,[['Sello',1]]);assert.ok(r.atencion[0].retirada&&r.atencion[0].sinFuncionar);
});
