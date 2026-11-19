import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizePlant,plantSheets} from './public/admin-planta-core.js';
import {plantWorkbook} from './public/admin-planta-xlsx.js';

const example={
 catalog:{B30:{liquido:'Alcohol'},B31:{liquido:'alcohol'},B44:{liquido:'Agua'},B77:{liquido:'Agua'}},
 plates:{B77:{fuente:'Fuera de la lista',placa:'No instalada'}},
 overrides:[{reference_key:'tag:B44',data:{fluido:'Agua con químicos'}}],
 reports:[{tag:'B30',source_id:'r1',work_order_id:'o1',data:{date:'2026-11-04',title:'Fuga de sello',parts:'Sello',operativo:false}},
  {tag:'B31',source_id:'r2',data:{date:'2026-10-01',title:'Inspección de rutina'}}],
 orders:[{id:'o1',tag:'B30',data:{title:'Cambiar sello',type:'correctivo',status:'pendiente',created:'2026-11-02',due:'2026-11-03'}}],
 incidents:[{id:'i1',tag:'B30',title:'Fuga y vibración',order_id:'o1',created_at:'2026-11-03'}],
};

test('control de planta cruza líquidos y agrupa fallas vinculadas sin contar mantenimientos rutinarios',()=>{
 const summary=summarizePlant(example,{from:'2026-11-01',until:'2026-11-30',today:'2026-11-10'});
 assert.equal(summary.tracked,3);
 assert.equal(summary.outside,1);
 assert.deepEqual(summary.liquids,[['Alcohol',2],['Agua con químicos',1]]);
 assert.deepEqual(summary.frequent,[['B30',1]]);
 assert.deepEqual(summary.monthly,[['2026-11',1]]);
 assert.equal(summary.events[0].day,'2026-11-02');
 assert.deepEqual(summary.events[0].categories,['Sello / fuga','Vibración / ruido']);
 assert.equal(summary.reportRows.length,1);
 assert.equal(summary.late,1);
 assert.equal(plantSheets(summary).Bombas.length,5);
});

test('Excel exporta las hojas y escribe texto ingresado como valor literal',async()=>{
 const workbook=plantWorkbook({...plantSheets(summarizePlant(example)),Entrada:[['=1+1','<sello>',23]]});
 const bytes=Buffer.from(await workbook.arrayBuffer()),entries=new Map();
 for(let offset=0;bytes.readUInt32LE(offset)===0x04034b50;){
  const size=bytes.readUInt32LE(offset+18),len=bytes.readUInt16LE(offset+26);
  const start=offset+30+len;
  entries.set(bytes.toString('utf8',offset+30,start),bytes.toString('utf8',start,start+size));
  offset=start+size;
 }
 assert.equal(workbook.type,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
 assert.match(entries.get('xl/workbook.xml'),/name="Líquidos"/);
 assert.match(entries.get('xl/worksheets/sheet11.xml'),/<t xml:space="preserve">=1\+1<\/t>.*&lt;sello&gt;.*<v>23<\/v>/);
 assert.doesNotMatch(entries.get('xl/worksheets/sheet11.xml'),/<f>/);
});
