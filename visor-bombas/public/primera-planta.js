// Recorta solo la torre integrada; conserva sus materiales y visibilidad al salir.
export function createFirstFloorView(T){
 const changed=new Map();
 let height=null,floor=-Infinity;
 function reset(){
  for(const [mesh,prior] of changed){
   const copies=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   for(const m of copies)m.dispose();
   mesh.material=prior.material;mesh.visible=prior.visible;
  }
  changed.clear();height=null;floor=-Infinity;
 }
 function apply(root,limit,sectors,lower=-Infinity){
  reset();root.updateWorldMatrix(true,true);height=limit;floor=lower;
  const plane=new T.Plane(new T.Vector3(0,-1,0),limit),planes=Number.isFinite(lower)?[plane,new T.Plane(new T.Vector3(0,1,0),-lower)]:[plane];
  root.traverse(mesh=>{
   if(!mesh.isMesh)return;
   let owner=mesh,belongs=false;
   while(owner){if(sectors.includes(owner.userData.sector)||owner.userData.sectorInt==='torre'){belongs=true;break;}if(owner===root)break;owner=owner.parent;}
   if(!belongs)return;
   changed.set(mesh,{material:mesh.material,visible:mesh.visible});
   const copy=m=>{const c=m.clone();c.clippingPlanes=[...(m.clippingPlanes||[]),...planes];c.clipShadows=true;return c;};
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(copy):copy(mesh.material);
   if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
   const box=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
   if(box.min.y>limit||box.max.y<lower)mesh.visible=false;
  });
 }
 return {apply,reset,get height(){return height;},contains:y=>height===null||(y<=height&&y>=floor)};
}
