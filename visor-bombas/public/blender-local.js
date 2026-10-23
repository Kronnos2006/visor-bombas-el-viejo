// Modelo de Blender integrado; ?modelo=original conserva la vista anterior.
export async function cargarModeloPlanta({GLTFLoader,MeshoptDecoder,area}){
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 if(!area.aparte||new URLSearchParams(location.search).get('modelo')==='original')return loader.loadAsync(area.modelo);
 const {DRACOLoader}=await import('/vendor/blender-local/DRACOLoader.js');
 const draco=new DRACOLoader().setDecoderPath('/vendor/blender-local/draco/');
 loader.setDRACOLoader(draco);
 try{
  const glb=await loader.loadAsync('/modelos/blender-local/planta-blender-local.glb');
  glb.scene.userData.blenderLocal=true;
  glb.scene.traverse(o=>{if(o.userData.sector)o.userData.sector=o.userData.sector.trim();});
  return glb;
 }finally{draco.dispose();}
}

// Reproduce solamente el orden del exportador para identificar las piezas originales.
// No agrega la geometría de referencia a la escena ni recalcula su posición.
export function prepararBombasBlender(T,scene,{sector,exterior,photoPumps,grupos}){
 const reference=sector(T,photoPumps),indices=new Map(),groups={};
 for(const p of photoPumps){const body=exterior(T,p.scale,p.variant);body.userData.tag=p.tag;reference.add(body);}
 let index=0;
 reference.traverse(o=>{if(!o.isMesh)return;let parent=o;while(parent&&!parent.userData.tag)parent=parent.parent;if(parent)indices.set(index,parent.userData.tag);index++;});
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 scene.updateWorldMatrix(true,true);
 for(const mesh of meshes){
  const name=(mesh.userData.original_name||mesh.name).trim();
  if(mesh.userData.sector==='Sector de tanques'){
   const tag=indices.get(Number(name.match(/ (\d+)$/)?.[1]));
   if(tag){(groups[tag]??=[]).push(mesh);}
  }
  for(const grupo of grupos){if(mesh.userData.sector===grupo.sector&&name.includes(grupo.nombre))mesh.userData.bomba=grupo.nombre;}
 }
 const result={};
 for(const [tag,parts] of Object.entries(groups)){
  const bounds=new T.Box3();for(const part of parts)bounds.union(new T.Box3().setFromObject(part));
  const group=new T.Group();group.name='Bomba '+tag;group.userData.tag=tag;
  group.position.copy(scene.worldToLocal(bounds.getCenter(new T.Vector3())));scene.add(group);group.updateWorldMatrix(true,false);
  for(const part of parts)group.attach(part);
  result[tag]=group;
 }
 reference.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});
 if(Object.keys(result).length!==photoPumps.length)throw new Error('No coinciden las bombas exportadas con sus fichas');
 return result;
}
