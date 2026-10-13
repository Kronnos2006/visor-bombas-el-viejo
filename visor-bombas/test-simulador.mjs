import test from 'node:test';
import assert from 'node:assert/strict';
import {createPumpModel,simParams,GUIDE,parseSize} from './public/pump-sim.js';
import {photoPumps} from './public/equipos-sector.js';
const steady=(M,over={})=>{let s=M.initialState(),i={...M.defaults(),running:true,...over};for(let t=0;t<400;t+=.1)s=M.step(s,i,.1);return M.derive(s,i);};
test('la generalización reproduce la referencia de la guía HIDROMAC 2196',()=>{
 const d=steady(createPumpModel(GUIDE));
 assert.ok(Math.abs(d.q*3600-25.20)<.05);assert.ok(Math.abs(d.H-13.18)<.05);assert.ok(Math.abs(d.electric/1000-1.63)<.01);
});
test('lee la designación de tamaño de cada bomba',()=>{
 assert.deepEqual(parseSize('1X1.5-8 LF'),{descarga:1,succion:1.5,impulsor:8});
 assert.deepEqual(parseSize('3X4X8G MTO'),{descarga:3,succion:4,impulsor:8});
 assert.deepEqual(parseSize('2X2 1/2-6'),{descarga:2,succion:2.5,impulsor:6});
});
test('cada bomba activa pasa por su punto de placa y B22 no se simula',()=>{
 for(const p of photoPumps){
  const P=simParams(p);
  if(p.inactive){assert.equal(P,null);continue;}
  const d=steady(createPumpModel(P));
  const tol=P.nMotor===P.n0?.01:.03;
  assert.ok(Math.abs(d.q/P.Qd-1)<tol,`${p.tag} caudal`);assert.ok(Math.abs(d.H/P.Hd-1)<2*tol,`${p.tag} altura`);
  assert.ok(d.load<1,`${p.tag} dentro de la potencia del motor`);assert.equal(d.phase,'En servicio');
 }
 const goulds=simParams(photoPumps.find(p=>p.tag==='B41'));assert.ok(goulds.closeCoupled);assert.ok(goulds.estimados.length>0);
 assert.notEqual(simParams(photoPumps.find(p=>p.tag==='B30')).Qd,simParams(photoPumps.find(p=>p.tag==='B36')).Qd);
});
test('escenarios: válvula cerrada, sin cebado, parada y ebullición del alcohol',()=>{
 const M=createPumpModel(simParams(photoPumps.find(p=>p.tag==='B36')));
 assert.equal(steady(M,{valve:0}).q,0);
 const dry=steady(M,{primed:false});assert.equal(dry.q,0);assert.ok(dry.sealTemp>100);
 let s=steady(M)&&M.initialState();s={...s,rpm:1765};const i={...M.defaults(),running:false};for(let t=0;t<60;t+=.1)s=M.step(s,i,.1);assert.ok(s.rpm<5);assert.equal(M.derive(s,i).electric,0);
 const hot=steady(M,{temperature:80,fluid:'etanol'});assert.ok(hot.cavitation);
 const water=steady(M,{temperature:80,fluid:'agua'});assert.ok(!water.cavitation);
 const ethanol=steady(M,{fluid:'etanol'}),agua=steady(M,{fluid:'agua'});assert.ok(ethanol.shaft<agua.shaft);
});
test('los valores se mantienen finitos en escenarios extremos',()=>{
 for(const p of photoPumps.filter(p=>!p.inactive)){const M=createPumpModel(simParams(p));
  for(const over of [{frequency:0},{frequency:60,valve:1,suction:-8,temperature:90},{valve:.001},{oil:0},{power:false},{frequency:'x',valve:-3}]){
   const d=steady(M,over);for(const k of ['q','H','electric','current','npsha','oilTemp','sealTemp','motorTemp'])assert.ok(Number.isFinite(d[k]),`${p.tag} ${k}`);}}
});
