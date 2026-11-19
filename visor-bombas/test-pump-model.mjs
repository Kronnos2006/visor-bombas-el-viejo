import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {buildPumpModel,sectorShellGeometry} from './public/pump-model.js';
import {createAnatomyView} from './public/anatomy-view.js';
import {pumpReference,buildInstalledReference,buildVerticalReference} from './public/pump-reference.js';
import {crearModeloCaldera,buildCalderaReference} from './public/bombas-calderas.js';

test('las bombas de combustible conservan la misma carcasa en planta, ensambladas y al rearmar el despiece',()=>{
 const geometryOf=root=>{root.updateMatrixWorld(true,true);const result=[];root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position,m=o.matrixWorld;for(let i=0;i<p.count;i++)result.push(...new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m).toArray());});return result;};
 for(const name of ['caldera-fondo','caldera-panel','caldera-correa']){
  const installed=crearModeloCaldera(THREE,name),model=buildCalderaReference(THREE,name);
  const sorted=values=>values.map(v=>Math.round(v*1e6)).sort((a,b)=>a-b);
  const original=sorted(geometryOf(installed));
  assert.deepEqual(sorted(geometryOf(model.root)),original,name+' conserva todas las mallas');
  assert.ok(model.components[0].children.length>0&&model.components[9].children.length>0);
  assert.equal(model.components[2].visible,false,'sin impulsor centrífugo inventado');
  model.moveExplosion(1,true);assert.notDeepEqual(sorted(geometryOf(model.root)),original);
  model.moveExplosion(0,true);assert.deepEqual(sorted(geometryOf(model.root)),original,name+' vuelve al mismo conjunto');
 }
});

test('B73 mantiene carcasa vertical ensamblada, ocho etapas y un despiece que se puede rearmar',()=>{
 const profile=pumpReference({tag:'B73',marca:'Movitec',modelo:'VF 4/8B'});
 const body=buildInstalledReference(THREE,profile),bounds=new THREE.Box3().setFromObject(body),size=bounds.getSize(new THREE.Vector3());
 assert.equal(body.userData.referenceKind,'vertical');assert.ok(size.y>size.x*2&&size.y>size.z*2);
 assert.ok(Math.abs(bounds.min.y)<1e-6);
 const model=buildVerticalReference(THREE,profile.stages,profile.finish),impellers=[];
 model.root.traverse(o=>{if(o.name==='Impulsor de etapa')impellers.push(o);});
 assert.equal(impellers.length,8);
 assert.ok(model.root.getObjectByName('Camisa exterior inoxidable'));
 const positions=model.components.map(g=>g.position.toArray());
 model.moveExplosion(1,true);assert.notDeepEqual(model.components.map(g=>g.position.toArray()),positions);
 model.moveExplosion(0,true);assert.deepEqual(model.components.map(g=>g.position.toArray()),positions);
});

test('el modelo y la placa deciden la forma aunque el TAG tuviera otra referencia',()=>{
 assert.equal(pumpReference({tag:'B69',marca:'Hidromac',modelo:'2196 1X1.5-8 LF'}).kind,'lowFlow');
 assert.equal(pumpReference({tag:'B30',marca:'Ebara',modelo:'AEVMSU5-9F0500T3S'}).kind,'vertical');
 assert.equal(pumpReference({tag:'B61',marca:'Multisteel',modelo:'RSA 32/205'}).kind,'process');
 assert.equal(pumpReference({tag:'B69',marca:'Goulds',modelo:'NPE'}).kind,'compact');
 assert.equal(pumpReference({tag:'B69',marca:'Ebara',tipo_bomba:'Horizontal'}).kind,'standard');
 const plate={fuente:'Placa (manda sobre Excel)',placa:'Titan 4196 3X4-13 MT'};
 assert.equal(pumpReference({tag:'B61',marca:'Multisteel',modelo:'RSA 32/205'},plate).kind,'titan');
 assert.equal(pumpReference({tag:'B69',marca:'Ebara',modelo:'AEVMSU5-9F0500T3S'},{fuente:'Placa',placa:'— (sin identificar)'}).stages,9);
 assert.equal(pumpReference({tag:'B73',marca:'Movitec',modelo:'VF 4/8B'}).stages,8);
});

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
