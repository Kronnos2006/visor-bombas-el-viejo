import test from 'node:test';import assert from 'node:assert/strict';
import {datosDeExcel} from './public/asignacion-bombas.js';
test('la ficha toma del Excel marca, modelo, caudal y rodamientos',()=>{
 const d=datosDeExcel({liquido:'Agua',bomba:'GRUNDFOS · CR15-6K · GPM: 90.3 · RPM: 3450 · HD [m]: 102 · Ø Imp [pulg]: 4.13',motor:'BALDOR · HP: 15',rodDel:'7309',rodTra:'6208'});
 assert.equal(d.marca,'GRUNDFOS');assert.equal(d.modelo,'CR15-6K');assert.equal(d.caudal,'90.3');assert.equal(d.altura,'102');assert.equal(d.impulsor,'4.13 pulg');assert.equal(d.rodamiento_trasero,'6208');assert.equal(d.servicio,'Agua');
});
test('una bomba sin datos no inventa campos',()=>{assert.deepEqual(datosDeExcel({bomba:'',liquido:''}),{});assert.deepEqual(datosDeExcel(null),{});});
