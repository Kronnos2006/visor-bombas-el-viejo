import test from 'node:test';import assert from 'node:assert/strict';
import {elegirEtiquetas,esMallaBomba} from './public/vision-bombas.js';
test('etiquetas: se oculta la más lejana si choca y nunca la marcada',()=>{
 const base={w:100,h:20,y:0},cerca={...base,x:0,z:.1},lejos={...base,x:50,z:.9},libre={...base,x:300,z:.9};
 assert.deepEqual(elegirEtiquetas([lejos,cerca,libre]),[lejos]);
 const marcada={...lejos,prioridad:true};assert.deepEqual(elegirEtiquetas([cerca,marcada]),[cerca]);
});
test('realce: solo mallas de bomba, no tuberías ni otros equipos',()=>{
 const m=(name,userData={})=>({name,userData});
 assert.ok(esMallaBomba(m(' REF Fotos - Bomba 1 con motor y guarda roja [1240482]')));
 assert.ok(esMallaBomba(m('x',{tag:'B2'})));
 assert.ok(!esMallaBomba(m(' DUSA - Conexiones visuales bomba Bach [1]')));
 assert.ok(!esMallaBomba(m(' DUSA - Cubierta bomba 1 columna Vinaza [1]')));
 assert.ok(!esMallaBomba(m(' REF Fotos - Tanque vertical verde')));
});
