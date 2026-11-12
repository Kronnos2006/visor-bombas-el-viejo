import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,validateState,assign,addPump,changes} from './public/ubicar-bombas-core.js';
const data=JSON.parse(await readFile(new URL('./public/modelos/plano-bombas.json',import.meta.url)));
const map=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url)));
const start=()=>validateState(initialState(data,map),data);
test('el plano conserva catálogo y asignaciones actuales, sin inventar conversión 3D',()=>{
 const s=start();assert.equal(s.catalog.length,83);assert.equal(s.points.length,data.P.length);
 assert.equal(s.points.find(p=>p.id==='tag:B2').tag,'B3');
 assert.ok(s.points.every(p=>p.x>=0&&p.x<=2800&&p.y>=0&&p.y<=2504));
});
test('el registro incluye las bombas ya colocadas aunque no haya cambios',()=>{
 const s=start(),report=changes(s,structuredClone(s));
 const placed=s.points.filter(p=>!p.removed&&p.tag);
 assert.ok(placed.length>0);
 for(const p of placed)assert.ok(report.includes(`POSICIÓN ${p.tag}${p.name?' · '+p.name:''} · px ${Math.round(p.x)},${Math.round(p.y)}`),p.tag+' debe figurar con su posición');
 assert.match(report,/Sin cambios respecto al mapa de referencia/);
 const removed=s.points.find(p=>p.tag==='B3');removed.removed=true;
 assert.doesNotMatch(changes(s,start()),/POSICIÓN B3 ·/);
});
test('añadir y reubicar una bomba no duplica TAG ni intercambia otra bomba',()=>{
 const s=start(),original=structuredClone(s);assert.equal(addPump(s,{tag:'B84',nombre:'Bomba adicional',area:'Prueba'}),'B84');
 assert.throws(()=>addPump(s,{tag:'B84',nombre:'Otra',area:'Prueba'}),/ya está/);
 assert.throws(()=>addPump(s,{tag:'B084',nombre:'Otra',area:'Prueba'}),/TAG/);
 assert.throws(()=>addPump(s,{tag:'B12345',nombre:'Otra',area:'Prueba'}),/TAG/);
 assign(s,s.points[0].id,'B84');assign(s,s.points[1].id,'B84');
 assert.equal(s.points.filter(p=>p.tag==='B84').length,1);assert.equal(s.points[0].tag,null);
 const restored=validateState(JSON.parse(JSON.stringify(s)),data);assert.deepEqual(restored,s);
 assert.match(changes(restored,original),/CATÁLOGO B84/);assert.match(changes(restored,original),/UBICAR B84/);
});
test('los respaldos rechazan TAG duplicados, coordenadas inválidas y pérdida de puntos',()=>{
 const s=start();s.points[1].tag=s.points[0].tag;assert.throws(()=>validateState(s,data),/más de una posición/);
 const outside=start();outside.points[0].x=2801;assert.throws(()=>validateState(outside,data),/fuera/);
 const missing=start();missing.points.pop();assert.throws(()=>validateState(missing,data),/Faltan puntos/);
 const catalog=start();catalog.catalog.pop();assert.throws(()=>validateState(catalog,data),/catálogo original/);
 const longTag=start();longTag.catalog.push({tag:'B12345',nombre:'Otra',area:'Prueba'});assert.throws(()=>validateState(longTag,data),/TAG/);
 const malformed=start();malformed.points[0].id='__proto__';assert.throws(()=>validateState(malformed,data),/identificadores/);
});
