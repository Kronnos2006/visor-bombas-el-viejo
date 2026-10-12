// Exploración de conjuntos inspirada en Anatomy (Ryan, MIT).
// Usa el Three.js del visor y mantiene los identificadores de sus diez componentes.
export function createAnatomyView({THREE, root, renderer}) {
 let groups=[], entries=[], context=[];
 const state={cutaway:false,transparent:false,isolate:false,selected:null,subcomponent:null};
 const localPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(0,0,-1),0)];
 renderer.localClippingEnabled=true;
 function register(nextGroups) {
  groups=nextGroups;
  entries=[];
  for(const group of groups) {
   group.userData.anatomyAvailable=group.visible;
   group.traverse(object=>{
    if(!object.isMesh)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials)entries.push({object,material,index:group.userData.index,original:{visible:object.visible,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,side:material.side,clippingPlanes:material.clippingPlanes,clipIntersection:material.clipIntersection,emissive:material.emissive?.clone(),emissiveIntensity:material.emissiveIntensity}});
   });
  }
  context=root.children.filter(child=>!groups.includes(child)).map(object=>({object,visible:object.visible}));
  Object.assign(state,{cutaway:false,transparent:false,isolate:false,selected:null,subcomponent:null});
  apply();
 }
 function apply() {
  root.updateMatrixWorld(true);
  const planes=localPlanes.map(plane=>plane.clone().applyMatrix4(root.matrixWorld));
  for(const group of groups)group.visible=group.userData.anatomyAvailable&&(!state.isolate||state.selected===group.userData.index);
  for(const item of context)item.object.visible=item.visible&&!state.isolate;
  for(const {object,material,index,original} of entries) {
   object.visible=original.visible&&!(state.cutaway&&object.userData.removableQuarter)&&!(state.isolate&&state.subcomponent&&object.userData.subcomponent!==state.subcomponent);
   material.opacity=original.opacity; material.transparent=original.transparent;material.depthWrite=original.depthWrite;
   material.side=original.side;material.clippingPlanes=original.clippingPlanes;material.clipIntersection=original.clipIntersection;
   if(original.emissive)material.emissive.copy(original.emissive);
   material.emissiveIntensity=original.emissiveIntensity;
   const selected=state.selected===index&&(!state.subcomponent||state.subcomponent===object.userData.subcomponent), cover=object.userData.anatomyCover===true;
   if(state.transparent&&cover||state.selected!==null&&!selected&&!state.isolate) {
    material.opacity=cover&&state.transparent?0.2:0.32;material.transparent=true;material.depthWrite=false;
   }
   if(state.cutaway&&cover&&!object.userData.quarterShell) {material.clippingPlanes=planes;material.clipIntersection=true;material.side=THREE.DoubleSide;}
   if(selected&&material.emissive) {material.emissive.setHex(0xa3e635);material.emissiveIntensity=0.25;}
   material.needsUpdate=true;
  }
 }
 function set(changes) {
  if('selected' in changes&&changes.selected!==null&&!groups.some(g=>g.userData.index===changes.selected&&g.userData.anatomyAvailable))return false;
  if(changes.subcomponent&&!entries.some(entry=>entry.index===(changes.selected??state.selected)&&entry.object.userData.subcomponent===changes.subcomponent))return false;
  Object.assign(state,changes);
  if(state.selected===null){state.isolate=false;state.subcomponent=null;}
  apply();return true;
 }
 function reset() {
  Object.assign(state,{cutaway:false,transparent:false,isolate:false,selected:null,subcomponent:null});
  for(const group of groups)group.position.x=group.userData.base;
  apply();
 }
 function visibleHit(hit) {
  const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
  const planes=material?.clippingPlanes;
  if(!planes?.length)return true;
  const removed=plane=>plane.distanceToPoint(hit.point)<0;
  return !(material.clipIntersection?planes.every(removed):planes.some(removed));
 }
 function bounds() {
  const box=new THREE.Box3();
  root.updateMatrixWorld(true);
  const visibleGroups=new Set(groups.filter(g=>g.visible).map(g=>g.userData.index));
  for(const {object,index} of entries)if(object.visible&&visibleGroups.has(index))box.union(new THREE.Box3().setFromObject(object));
  return box;
 }
 return {register,set,reset,visibleHit,bounds,get state(){return {...state};}};
}

export function labelPositions(labels,width,height) {
 const placed=[];
 return labels.map(label=>{
  for(const offset of [0,-26,26,-52,52,-78,78,-104,104,-130,130]) {
   const y=label.y+offset;
   if(y<18||y>height-18||label.x<18||label.x>width-18)continue;
   if(placed.some(other=>Math.abs(other.x-label.x)<28&&Math.abs(other.y-y)<24))continue;
   const result={...label,y,offset};placed.push(result);return result;
  }
  return {...label,hidden:true};
 });
}
