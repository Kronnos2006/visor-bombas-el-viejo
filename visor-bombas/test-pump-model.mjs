import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {buildPumpModel,sectorShellGeometry} from './public/pump-model.js';
import {createAnatomyView} from './public/anatomy-view.js';

test('carcasas huecas tienen caras interiores y cortes radiales cerrados',()=>{
 const geometry=sectorShellGeometry(THREE,{inner:.5,outer:.65,length:1});
 assert.equal(geometry.groups.length,4);assert.ok(geometry.groups[3].count>0,'Faltan caras que cierren los extremos del cuarto');
 for(const number of geometry.attributes.position.array)assert.ok(Number.isFinite(number));
 const radial=[];for(let i=0;i<geometry.attributes.position.count;i++)radial.push(Math.hypot(geometry.attributes.position.getY(i),geometry.attributes.position.getZ(i)));
 assert.ok(Math.min(...radial)>.49);assert.ok(Math.max(...radial)<.66);
});
test('retirar y reponer 1/4 conserva eje, impulsor, sello y materiales sin reconstruir meshes',()=>{
 const {root,components}=buildPumpModel(THREE,'lf');const view=createAnatomyView({THREE,root,renderer:{}});view.register(components);
 const meshes=[];root.traverse(object=>{if(object.isMesh)meshes.push(object);});
 const quarter=meshes.filter(mesh=>mesh.userData.removableQuarter);assert.ok(quarter.length>10);
 view.set({cutaway:true});assert.ok(quarter.every(mesh=>mesh.visible===false));
 for(const index of [2,5,6])components[index].traverse(object=>{if(object.isMesh)assert.equal(object.visible,true);});
 view.set({cutaway:false});assert.ok(quarter.every(mesh=>mesh.visible===true));
 const after=[];root.traverse(object=>{if(object.isMesh)after.push(object.uuid);});assert.deepEqual(after,meshes.map(mesh=>mesh.uuid));
});
test('modelos incluyen rodamientos, resorte, camisa, bobinados y rotor sin agregar un acople externo a Goulds',()=>{
 for(const variant of ['lf','mto','goulds']){
  const {root,components}=buildPumpModel(THREE,variant);const names=[];root.traverse(object=>{if(object.isMesh)names.push(object.name);});
  for(const expected of ['Resorte helicoidal del sello','Camisa de eje','Rotor del motor','Bobina de cobre del estator','Eje continuo'])assert.ok(names.includes(expected));
  assert.ok(names.some(name=>name.startsWith('Bola del rodamiento')));
  assert.equal(components[7].visible,variant!=='goulds');assert.equal(components[8].visible,variant!=='goulds');
 }
});
test('se puede seleccionar y aislar el resorte dentro del conjunto del sello',()=>{
 const {root,components}=buildPumpModel(THREE,'lf');const view=createAnatomyView({THREE,root,renderer:{}});view.register(components);
 assert.equal(view.set({selected:5,subcomponent:'Resorte helicoidal del sello',isolate:true}),true);
 const visible=[];components[5].traverse(object=>{if(object.isMesh&&object.visible)visible.push(object.name);});
 assert.deepEqual(visible,['Resorte helicoidal del sello']);assert.ok(!view.bounds().isEmpty());
 view.reset();assert.ok(components[5].children.every(object=>object.visible));
});
