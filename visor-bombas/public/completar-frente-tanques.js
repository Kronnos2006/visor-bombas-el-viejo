import {compactar} from './compactar.js';

// Tres posiciones para completar la fila de seis confirmada por el usuario.
// Los TAG existentes se conservan; las nuevas referencias siguen sin identificar.
export function completarFrenteTanques(T,{scene,grupos,tankBodies,exterior,cubiertaFotografica}){
 const data=grupos.find(g=>g.nombre==='Bombas faltantes del frente de tanques');if(!data)return [];
 const inverse=new T.Matrix4().copy(scene.matrixWorld).invert(),sceneRotation=scene.getWorldQuaternion(new T.Quaternion()).invert(),added=[];
 for(const [index,pair] of data.entre.entries()){
  const [first,last]=pair.map(tag=>tankBodies[tag]);if(!first||!last)continue;
  first.updateWorldMatrix(true,true);last.updateWorldMatrix(true,true);
  const a=new T.Box3().setFromObject(first).applyMatrix4(inverse),b=new T.Box3().setFromObject(last).applyMatrix4(inverse),target=a.getCenter(new T.Vector3()).lerp(b.getCenter(new T.Vector3()),data.fracciones?.[index]??.5);
  const referenceModel=first.children.find(o=>o.userData.exteriorCampo)||first;
  const model=exterior(T,.86,'lf');cubiertaFotografica(T,model);compactar(T,model);
  model.quaternion.copy(sceneRotation.clone().multiply(referenceModel.getWorldQuaternion(new T.Quaternion())));
  model.updateWorldMatrix(true,true);const local=new T.Box3().setFromObject(model),center=local.getCenter(new T.Vector3());
  model.position.set(target.x-center.x,(a.min.y+b.min.y)/2-local.min.y,target.z-center.z);
  model.name='Frente de tanques · bomba adicional '+(index+1);
  model.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{sector:data.sector,bomba:data.nombre});});
  scene.add(model);scene.updateWorldMatrix(true,true);
  const box=new T.Box3().setFromObject(model).applyMatrix4(inverse);data.bombas[index]={min:box.min.toArray(),max:box.max.toArray()};added.push(model);
  // Bancada propia: no cambiar el generador del exportador ni sus índices TAG.
  const base=new T.Mesh(new T.BoxGeometry(1.7,.16,3.1),new T.MeshStandardMaterial({color:0xb3afa0,roughness:.8}));
  base.quaternion.copy(model.quaternion);base.position.set(target.x,(a.min.y+b.min.y)/2-.08,target.z);base.userData.sector=data.sector;base.receiveShadow=true;scene.add(base);
 }
 return added;
}
