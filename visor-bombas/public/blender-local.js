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

// El modelo de Blender quedó desplazado respecto al modelo integrado anterior,
// cuyas cajas guardan planta-integrada.json y bombas-individuales.json.
// Mide ese desplazamiento comparando las cajas de los sectores comunes y lo aplica
// a la ubicación de la torre, a las cajas de sectores y a las bombas de referencia.
export function alinearInfoBlender(T,scene,info,grupos){
 scene.updateWorldMatrix(true,true);
 const local=new T.Matrix4();if(scene.parent)local.copy(scene.parent.matrixWorld).invert();
 const boxes={};
 scene.traverse(o=>{if(!o.isMesh||!o.userData.sector)return;const b=new T.Box3().setFromObject(o).applyMatrix4(local);if(!b.isEmpty())(boxes[o.userData.sector]??=new T.Box3()).union(b);});
 const difs=[[],[],[]];
 for(const [k,b] of Object.entries(boxes)){const o=info.sectores?.[k];if(!o)continue;for(let i=0;i<3;i++)difs[i].push((b.min.getComponent(i)-o.min[i]+b.max.getComponent(i)-o.max[i])/2);}
 if(!difs[0].length)return [0,0,0];
 info.sectores??={};
 const mediana=v=>{const s=[...v].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
 const d=difs.map(mediana);
 if(info.torre){info.torre.x+=d[0];info.torre.y+=d[1];info.torre.z+=d[2];}
 for(const [k,s] of Object.entries(info.sectores||{}))if(!boxes[k])info.sectores[k]={min:s.min.map((v,i)=>v+d[i]),max:s.max.map((v,i)=>v+d[i])};
 for(const [k,b] of Object.entries(boxes))info.sectores[k]={min:b.min.toArray(),max:b.max.toArray()};
 for(const grupo of grupos)for(const caja of grupo.bombas){caja.min=caja.min.map((v,i)=>v+d[i]);caja.max=caja.max.map((v,i)=>v+d[i]);}
 return d;
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
