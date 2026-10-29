// Tres objetos señalados por el usuario. Cajas en coordenadas del GLB original.
// El GLB Blender conserva sus nombres; el original fusiona varios equipos por material.
export const AUXILIARES_CALDERAS=[
 {id:'1240637',sector:'REF Detalle',nombre:'Deposito vertical azul auxiliar',min:[13.82257,.3,-29.47111],max:[14.72258,2.46,-28.57110]},
 {id:'1240636',sector:'REF Detalle',nombre:'Cuadro electrico general con botoneras',min:[11.41587,.3,-27.88207],max:[12.51588,2.5,-27.21206]},
 {id:'1240581',sector:'REF Plano ampliacion',nombre:'Deposito auxiliar rectangular',min:[12.35,.3,-32.40001],max:[13.95,1.69001,-31.2]}
];

export function retirarAuxiliaresCalderas(T,scene){
 const removed=[],triangles={};
 if(scene.userData.blenderLocal){
  const objects=[];scene.traverse(o=>{if(!o.isMesh)return;const name=o.userData.original_name||o.name;
   const match=AUXILIARES_CALDERAS.find(x=>o.userData.sector===x.sector&&(name.includes('['+x.id+']')||name.includes(x.nombre)));
   if(match)objects.push({o,match});});
  for(const {o,match} of objects){removed.push({id:match.id,nombre:o.userData.original_name||o.name});o.removeFromParent();}
  return {removed,triangles};
 }
 scene.updateWorldMatrix(true,true);
 const inverse=new T.Matrix4().copy(scene.matrixWorld).invert();
 const boxes=AUXILIARES_CALDERAS.map(x=>({...x,box:new T.Box3(new T.Vector3(...x.min),new T.Vector3(...x.max)).expandByScalar(.015)}));
 scene.traverse(o=>{
  if(!o.isMesh||!o.geometry)return;
  const candidates=boxes.filter(x=>x.sector===o.userData.sector);if(!candidates.length)return;
  const matrix=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld),bounds=new T.Box3().setFromObject(o).applyMatrix4(inverse);
  if(!candidates.some(x=>x.box.intersectsBox(bounds)))return;
  const original=o.geometry,geometry=original.index?original.toNonIndexed():original.clone(),pos=geometry.getAttribute('position');if(!pos)return;
  const kept=[],center=new T.Vector3(),vertex=new T.Vector3();let cut=0;
  for(let i=0;i+2<pos.count;i+=3){center.set(0,0,0);for(let k=0;k<3;k++)center.add(vertex.fromBufferAttribute(pos,i+k).applyMatrix4(matrix));center.multiplyScalar(1/3);
   const target=candidates.find(x=>x.box.containsPoint(center));
   if(target){triangles[target.id]=(triangles[target.id]||0)+1;cut++;}else kept.push(i,i+1,i+2);
  }
  if(!cut){geometry.dispose();return;}
  const cleaned=new T.BufferGeometry();
  for(const [name,attribute] of Object.entries(geometry.attributes)){
   const array=new Float32Array(kept.length*attribute.itemSize);let offset=0;
   for(const index of kept)for(let k=0;k<attribute.itemSize;k++)array[offset++]=attribute.getComponent(index,k);
   cleaned.setAttribute(name,new T.BufferAttribute(array,attribute.itemSize));
  }
  cleaned.computeBoundingBox();cleaned.computeBoundingSphere();o.geometry=cleaned;geometry.dispose();
 });
 for(const target of AUXILIARES_CALDERAS)if(triangles[target.id])removed.push({id:target.id,nombre:target.nombre});
 return {removed,triangles};
}
