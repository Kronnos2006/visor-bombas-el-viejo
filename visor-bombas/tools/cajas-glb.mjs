// Lee solo el bloque JSON de un .glb (sin decodificar la geometría Draco) y calcula
// las cajas de cada nodo con su transformación, a partir de los min/max de POSITION.
// Sirve para pruebas en Node: el visor calcula lo mismo sobre la escena cargada.
import {readFileSync} from 'node:fs';
import * as T from '../public/vendor/three.module.js';
export function leerCajasGLB(ruta){
 const buf=readFileSync(ruta);
 if(buf.readUInt32LE(0)!==0x46546c67)throw new Error('No es un archivo glb: '+ruta);
 const largo=buf.readUInt32LE(12),j=JSON.parse(buf.subarray(20,20+largo).toString('utf8'));
 const nodos=[],sectores={};
 const visitar=(i,padre)=>{
  const n=j.nodes[i],m=new T.Matrix4();
  if(n.matrix)m.fromArray(n.matrix);
  else m.compose(new T.Vector3(...(n.translation||[0,0,0])),new T.Quaternion(...(n.rotation||[0,0,0,1])),new T.Vector3(...(n.scale||[1,1,1])));
  const mundo=padre.clone().multiply(m);
  if(n.mesh!==undefined){
   const caja=new T.Box3();
   for(const pr of j.meshes[n.mesh].primitives){const a=j.accessors[pr.attributes.POSITION];if(!a?.min)continue;
    caja.union(new T.Box3(new T.Vector3(...a.min),new T.Vector3(...a.max)).applyMatrix4(mundo));}
   if(!caja.isEmpty()){
    const ex=n.extras||{},sector=(ex.sector||'').trim(),item={nombre:(ex.original_name||n.name||'').trim(),sector,min:caja.min.toArray(),max:caja.max.toArray()};
    nodos.push(item);
    if(sector){const s=sectores[sector]??={min:[...item.min],max:[...item.max]};for(let k=0;k<3;k++){s.min[k]=Math.min(s.min[k],item.min[k]);s.max[k]=Math.max(s.max[k],item.max[k]);}}
   }
  }
  for(const h of n.children||[])visitar(h,mundo);
 };
 for(const i of j.scenes[j.scene??0].nodes)visitar(i,new T.Matrix4());
 return {nodos,sectores};
}
