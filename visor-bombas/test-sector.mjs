import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import * as THREE from './public/vendor/three.module.js';
import {photoPumps,plateEvidence,motorEvidence,estadoLevantamiento,tankSpecs,exterior,sector,photoURL,photo3URL} from './public/sector-fotos.js';
import {readIntegratedPump} from './server.mjs';
assert.equal(photoPumps.length,9);
assert.deepEqual(Object.fromEntries(['frente','lateral','derecho','posterior'].map(g=>[g,photoPumps.filter(p=>p.grupo===g).length])),{frente:3,lateral:2,derecho:2,posterior:2});
const bounds=photoPumps.map(p=>{
 const g=exterior(THREE,p.scale,p.variant);g.position.set(p.x,.3,p.z);g.rotation.y=p.rotation;g.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(g);
 assert.ok(b.min.y>=0,'No puede hundirse bajo la plataforma');
 assert.ok(b.min.x>-16&&b.max.x<16&&b.min.z>-14.5&&b.max.z<12.5,'La bomba debe quedar dentro de la plataforma');
 assert.ok(!/^P-/.test(p.tag),'El identificador temporal no es un TAG oficial');
 assert.match(p.association,/DEMO/,'La placa asignada a una posición debe quedar marcada como demo');
 return b;
});
for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++)assert.ok(!bounds[i].intersectsBox(bounds[j]),'Conjuntos superpuestos');
for(const id of ['111845','110943',motorEvidence.foto,...plateEvidence.map(p=>p.foto)])await access(new URL('./public'+photoURL(id),import.meta.url));
for(const pump of photoPumps){
 assert.ok(pump.marca&&pump.modelo&&pump.serie&&pump.foto3,'Cada posición necesita un expediente de demo');
 assert.equal(pump.orings.length,3,'Cada expediente de demo debe mostrar tres o-rings');
 assert.equal(pump.history.length,3,'Cada expediente de demo debe mostrar historial');
 assert.match(pump.association,/DEMO/,'La asociación inventada debe estar rotulada');
 await access(new URL('./public'+photo3URL(pump.foto3),import.meta.url));
}
assert.equal(new Set(photoPumps.map(p=>p.serie)).size,photoPumps.length,'No repetir placas entre expedientes de demo');
assert.equal(tankSpecs.length,15,'La vista elevada sustenta quince tanques en el render de propuesta');
for(let i=0;i<tankSpecs.length;i++)for(let j=i+1;j<tankSpecs.length;j++)assert.ok(Math.hypot(tankSpecs[i][0]-tankSpecs[j][0],tankSpecs[i][1]-tankSpecs[j][1])>tankSpecs[i][2]+tankSpecs[j][2],'Tanques superpuestos');
// La evidencia de placa debe estar completa y no atribuida a una posicion.
assert.ok(plateEvidence.length>=10,'Deben figurar las 10 placas leidas');
for(const p of plateEvidence){
 assert.ok(p.serie&&p.marca&&p.modelo&&p.size,'Cada placa lleva serie, marca, modelo y tamano');
 assert.equal(p.posicion,undefined,'Una placa no se atribuye a una posicion sin evidencia');
}
assert.ok(motorEvidence.specs.some(([k])=>/Rodamiento/i.test(k)),'La placa de motor aporta los rodamientos');
assert.ok(estadoLevantamiento.pendiente.length>=4,'El panel debe declarar lo que falta');
const context=sector(THREE);assert.ok(context.children.length>40);
context.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();assert.ok(Number.isFinite(o.geometry.boundingBox.max.x));}});
const appSource=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
const htmlSource=await readFile(new URL('./public/index.html',import.meta.url),'utf8');
assert.match(appSource,/id="component-detail"/,'La pieza seleccionada debe abrir su ficha enfocada');
assert.match(appSource,/class="photo-pair"/,'Cada expediente debe mostrar bomba y placa juntas');
assert.match(appSource,/panel\?\.scrollTo/,'La selección debe llevar al inicio de la información de la pieza');
assert.doesNotMatch(htmlSource,/workspace-mode|Fichas de Obsidian/,'La vista antigua no debe aparecer como modo separado');
assert.match(appSource,/Gemini analiza solamente el expediente DEMO/,'Gemini debe estar integrado en el expediente seleccionado');
assert.equal(readIntegratedPump('BOMBA-A')?.data.tag,'BOMBA-A','El servidor debe entregar a Gemini el expediente integrado');
assert.equal(readIntegratedPump('P-9001'),null,'Las fichas antiguas no deben confundirse con el expediente integrado');
console.log('OK: 9 expedientes DEMO distribuidos 3/2/2/2, 15 tanques, sin escaleras ni tuberías y fotos disponibles.');
