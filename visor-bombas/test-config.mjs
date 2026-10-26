import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {vaultConfiguration} from './vault.mjs';
import {validDate} from './maintenance.mjs';
import {reportMeasurements,measurementInput} from './public/measurements.js';

test('nube fuerza DEMO incluso con bóveda real o DEMO=0',()=>{
 for(const flag of [{VOCATUS_CLOUD_DEV:'1'},{CODESPACES:'true'},{VERCEL:'1'}]){
  const config=vaultConfiguration('/app/visor-bombas',{...flag,VOCATUS_DEMO:'0',OBSIDIAN_VAULT:'/datos/reales'});
  assert.equal(config.demo,true);assert.equal(config.vault,path.join('/app/visor-bombas','demo-vault'));
 }
 assert.equal(vaultConfiguration('/app/visor-bombas',{VERCEL:'1'}).writable,false);
 assert.equal(vaultConfiguration('/app/visor-bombas',{OBSIDIAN_VAULT:'/datos/reales'}).vault,path.resolve('/datos/reales'));
});
test('fechas inválidas no se aceptan como intervenciones',()=>{
 assert.equal(validDate('2026-02-30'),false);assert.equal(validDate('2026-13-01'),false);assert.equal(validDate('2024-02-29'),true);
});
test('un reporte sin mediciones no produce números ficticios y GPM se convierte',()=>{
 assert.deepEqual(reportMeasurements('Cambio de sello sin mediciones.'),{pressure:null,flow:null,origen:{pressure:null,flow:null}});
 assert.deepEqual(reportMeasurements('Presión: 2,1 bar; Caudal: 0 m³/h'),{pressure:2.1,flow:0,origen:{pressure:'texto',flow:'texto'}});
 assert.ok(Math.abs(reportMeasurements('Caudal: 8 GPM').flow-1.816997656)<1e-9);
 assert.ok(Math.abs(reportMeasurements('Presión: 1 kg/cm2').pressure-.980665)<1e-9);
});

test('un texto con antes/después no se convierte en una lectura confirmada',()=>{
 const m=reportMeasurements('Antes 2 bar; presión medida: 4 bar');
 assert.equal(m.pressure,null);assert.equal(m.origen.pressure,'ambiguo');
 assert.equal(reportMeasurements('Presión de 2 a 4 bar tras el cambio').pressure,null);
 assert.equal(reportMeasurements('Presión 3 bar y luego 3,5 bar').origen.pressure,'ambiguo');
});
test('las mediciones estructuradas mandan sobre el texto',()=>{
 const m=reportMeasurements({mediciones:{presion_bar:4,caudal_m3h:null},text:'Antes 2 bar; presión medida: 4 bar'});
 assert.equal(m.pressure,4);assert.equal(m.origen.pressure,'registro');assert.equal(m.flow,null);
 assert.throws(()=>measurementInput('-1',''),/mayor o igual a 0/);
 assert.deepEqual(measurementInput('2,5',''),{presion_bar:2.5,caudal_m3h:null});
});
