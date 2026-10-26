// Recorta solo la torre integrada; conserva sus materiales y visibilidad al salir.
export function createFirstFloorView(T){
 const changed=new Map();
 let height=null;
 function reset(){
  for(const [mesh,prior] of changed){
   const copies=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   for(const m of copies)m.dispose();
   mesh.material=prior.material;mesh.visible=prior.visible;
  }
  changed.clear();height=null;
 }
 function apply(root,limit,sectors){
  reset();root.updateWorldMatrix(true,true);height=limit;
  const plane=new T.Plane(new T.Vector3(0,-1,0),limit);
  root.traverse(mesh=>{
   if(!mesh.isMesh)return;
   let owner=mesh,belongs=false;
   while(owner){if(sectors.includes(owner.userData.sector)||owner.userData.sectorInt==='torre'){belongs=true;break;}if(owner===root)break;owner=owner.parent;}
   if(!belongs)return;
   changed.set(mesh,{material:mesh.material,visible:mesh.visible});
   const copy=m=>{const c=m.clone();c.clippingPlanes=[...(m.clippingPlanes||[]),plane];c.clipShadows=true;return c;};
   mesh.material=Array.isArray(mesh.material)?mesh.material.map(copy):copy(mesh.material);
   if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
   const box=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
   if(box.min.y>limit)mesh.visible=false;
  });
 }
 return {apply,reset,get height(){return height;},contains:y=>height===null||y<=height};
}
