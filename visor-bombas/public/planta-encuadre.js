import {SIEMPRE,CUBIERTA} from './planta-integrada.js';

// Encuadra la geometría que se está mostrando, sin cambiar su escala métrica.
// Box3.setFromObject incluye hijos ocultos: no sirve para sectores aislados.
export function cajaVisible(T,root,{incluirReferencia=false}={}){
 const result=new T.Box3();
 if(!root)return result;
 root.updateWorldMatrix(true,true);
 let ancestor=root.parent;
 while(ancestor){if(!ancestor.visible)return result;ancestor=ancestor.parent;}
 function visitar(object){
  if(!object.visible||object.userData.hitProxy)return;
  const sector=object.userData.sector;
  if(!incluirReferencia&&(SIEMPRE.includes(sector)||sector===CUBIERTA))return;
  if(object.isMesh&&object.geometry){
   const materials=Array.isArray(object.material)?object.material:[object.material];
   if(materials.some(material=>material&&material.visible!==false&&(!material.transparent||material.opacity>0))){
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
    if(object.geometry.boundingBox)result.union(object.geometry.boundingBox.clone().applyMatrix4(object.matrixWorld));
   }
  }
  for(const child of object.children)visitar(child);
 }
 visitar(root);
 return result;
}

// Extrae el exterior de una bomba del GLB, conservando sus coordenadas métricas.
// Los grupos exportados pueden contener varias bombas; la caja individual decide
// qué triángulos pertenecen a la selección. Solo cambia el origen para explorarla.
export function extraerBomba(T,scene,reference){
 if(!scene||!reference?.min||!reference?.max)return null;
 scene.updateWorldMatrix(true,true);
 const result=new T.Group(),box=new T.Box3(new T.Vector3(...reference.min),new T.Vector3(...reference.max));
 box.expandByScalar(.025);
 const inverse=new T.Matrix4().copy(scene.matrixWorld).invert();
 scene.traverse(object=>{
  if(!object.isMesh||!object.geometry)return;
  let node=object,metadata=null;
  while(node){if(node.userData.bomba){metadata=node.userData;break;}if(node===scene)break;node=node.parent;}
  if(!metadata||metadata.sector!==reference.sector||metadata.bomba!==(reference.grupo||reference.nombre))return;
  const geometry=object.geometry,position=geometry.getAttribute('position'),normal=geometry.getAttribute('normal'),index=geometry.index;
  if(!position)return;
  const matrix=new T.Matrix4().multiplyMatrices(inverse,object.matrixWorld),normalMatrix=new T.Matrix3().getNormalMatrix(matrix);
  const positions=[],normals=[],count=index?index.count:position.count;
  for(let i=0;i+2<count;i+=3){
   const ids=[0,1,2].map(offset=>index?index.getX(i+offset):i+offset);
   const vertices=ids.map(id=>new T.Vector3().fromBufferAttribute(position,id).applyMatrix4(matrix));
   const center=vertices.reduce((sum,v)=>sum.add(v),new T.Vector3()).multiplyScalar(1/3);
   if(!box.containsPoint(center))continue;
   for(let j=0;j<3;j++){
    positions.push(...vertices[j].toArray());
    if(normal)normals.push(...new T.Vector3().fromBufferAttribute(normal,ids[j]).applyNormalMatrix(normalMatrix).toArray());
   }
  }
  if(!positions.length)return;
  const selected=new T.BufferGeometry();selected.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  if(normals.length)selected.setAttribute('normal',new T.Float32BufferAttribute(normals,3));else selected.computeVertexNormals();
  // El conversor del GLB usa un material por malla. Clonarlo evita que cerrar
  // una ficha elimine o cambie los materiales compartidos de la planta.
  const material=Array.isArray(object.material)?object.material[0].clone():object.material.clone();
  const mesh=new T.Mesh(selected,material);mesh.castShadow=true;mesh.receiveShadow=true;result.add(mesh);
 });
 if(!result.children.length)return null;
 const bounds=new T.Box3().setFromObject(result),center=bounds.getCenter(new T.Vector3());
 for(const mesh of result.children)mesh.geometry.translate(-center.x,-bounds.min.y,-center.z);
 result.userData.modeloIntegrado=true;result.userData.dimensiones=bounds.getSize(new T.Vector3()).toArray();
 return result;
}
