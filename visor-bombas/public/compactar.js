// Rendimiento: une las mallas de un grupo que comparten material (una llamada de dibujo por
// material en vez de una por pieza). La forma no cambia: se hornean las transformaciones.
export function compactar(T,grupo){
 grupo.updateMatrixWorld(true);
 const inv=new T.Matrix4().copy(grupo.matrixWorld).invert(),porMat=new Map();
 grupo.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&!o.userData.hitProxy&&o.visible){if(!porMat.has(o.material))porMat.set(o.material,[]);porMat.get(o.material).push(o);}});
 for(const [mat,mallas] of porMat){
  if(mallas.length<2)continue;
  const geos=mallas.map(m=>{const g=m.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,m.matrixWorld));return g.index?g.toNonIndexed():g;});
  const comunes=Object.keys(geos[0].attributes).filter(k=>geos.every(g=>g.attributes[k]&&g.attributes[k].itemSize===geos[0].attributes[k].itemSize));
  const unida=new T.BufferGeometry();
  for(const k of comunes){
   const n=geos.reduce((s,g)=>s+g.attributes[k].array.length,0),arr=new Float32Array(n);let off=0;
   for(const g of geos){arr.set(g.attributes[k].array,off);off+=g.attributes[k].array.length;}
   unida.setAttribute(k,new T.BufferAttribute(arr,geos[0].attributes[k].itemSize,geos[0].attributes[k].normalized));
  }
  unida.computeBoundingBox();unida.computeBoundingSphere();
  const nueva=new T.Mesh(unida,mat);nueva.name='Unida · '+(mat.name||'material');
  nueva.castShadow=mallas.some(m=>m.castShadow);nueva.receiveShadow=mallas.some(m=>m.receiveShadow);
  for(const m of mallas){m.parent.remove(m);m.geometry.dispose();}
  for(const g of geos)g.dispose();
  grupo.add(nueva);
 }
 return grupo;
}
