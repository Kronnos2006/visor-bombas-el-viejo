import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {createAnatomyView,labelPositions} from './public/anatomy-view.js';

function fixture(){
 const root=new THREE.Group(),groups=[];
 for(let index=0;index<4;index++){
  const group=new THREE.Group();group.userData={index,base:index*2};group.position.x=index*2;group.visible=index!==3;
  const material=new THREE.MeshStandardMaterial({color:0x608d7e,opacity:0.85,transparent:true});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);mesh.userData={part:index,anatomyCover:index===0};group.add(mesh);groups.push(group);root.add(group);
 }
 const base=new THREE.Object3D();root.add(base);
 const renderer={};const view=createAnatomyView({THREE,root,renderer});view.register(groups);
 return {view,groups,root,renderer,base};
}
test('corte de cuarto afecta solo las cubiertas y raycasting omite el cuadrante recortado',()=>{
 const {view,groups,renderer}=fixture();view.set({cutaway:true});
 assert.equal(renderer.localClippingEnabled,true);
 const cover=groups[0].children[0],rotor=groups[1].children[0];
 assert.equal(cover.material.clippingPlanes.length,2);assert.equal(cover.material.clipIntersection,true);assert.equal(rotor.material.clippingPlanes,null);
 assert.equal(view.visibleHit({object:cover,point:new THREE.Vector3(0,.2,.2)}),false);
 assert.equal(view.visibleHit({object:cover,point:new THREE.Vector3(0,-.2,.2)}),true);
 assert.equal(view.visibleHit({object:rotor,point:new THREE.Vector3(2,.2,.2)}),true);
});
test('selección, transparencia y aislamiento se combinan sin revivir piezas excluidas',()=>{
 const {view,groups,base}=fixture();view.set({transparent:true,selected:1});
 assert.equal(groups[0].children[0].material.opacity,.2);assert.equal(groups[0].children[0].material.depthWrite,false);
 assert.equal(groups[1].children[0].material.opacity,.85);
 view.set({isolate:true});assert.deepEqual(groups.map(g=>g.visible),[false,true,false,false]);assert.equal(base.visible,false);
 assert.equal(view.set({selected:3}),false);
 view.set({isolate:false});assert.deepEqual(groups.map(g=>g.visible),[true,true,true,false]);assert.equal(base.visible,true);
});
test('reinicio restaura materiales y posiciones; el encuadre sigue el despiece visible',()=>{
 const {view,groups}=fixture();const original=view.bounds().getSize(new THREE.Vector3()).x;
 groups[2].position.x+=8;assert.ok(view.bounds().getSize(new THREE.Vector3()).x>original);
 view.set({transparent:true,cutaway:true,selected:1,isolate:true});view.reset();
 assert.deepEqual(view.state,{transparent:false,cutaway:false,selected:null,isolate:false,subcomponent:null});
 for(const [index,group] of groups.entries()){
  assert.equal(group.position.x,index*2);const material=group.children[0].material;
  assert.equal(material.opacity,.85);assert.equal(material.transparent,true);assert.equal(material.depthWrite,true);assert.equal(material.clippingPlanes,null);assert.equal(material.emissive.getHex(),0);
 }
 assert.equal(groups[3].visible,false);
});
test('etiquetas coincidentes se separan dentro del visor y conservan su anclaje',()=>{
 const labels=Array.from({length:8},(_,id)=>({id,x:100,y:150,anchorY:150}));
 const positioned=labelPositions(labels,400,320);
 assert.ok(positioned.every(label=>!label.hidden&&label.anchorY===150&&label.y>=18&&label.y<=302));
 for(let i=0;i<positioned.length;i++)for(let j=i+1;j<positioned.length;j++)assert.ok(Math.abs(positioned[i].y-positioned[j].y)>=24);
});
