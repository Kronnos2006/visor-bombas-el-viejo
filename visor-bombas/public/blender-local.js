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
// Se mide el desplazamiento comparando las cajas de los sectores comunes (mediana por eje)
// y se aplica igual a la torre, a las cajas de sector y a las bombas de referencia.
// "residuo" es la mayor diferencia de un sector respecto a ese desplazamiento común: si crece,
// el modelo nuevo no es una simple traslación del anterior y las ubicaciones deben revisarse.
const mediana=v=>{const s=[...v].sort((a,b)=>a-b),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
export function medirDesplazamiento(cajas,info){
 const difs=[[],[],[]],porSector={};
 for(const [k,b] of Object.entries(cajas)){const o=info.sectores?.[k];if(!o)continue;
  porSector[k]=[0,1,2].map(i=>(b.min[i]-o.min[i]+b.max[i]-o.max[i])/2);porSector[k].forEach((v,i)=>difs[i].push(v));}
 if(!difs[0].length)return {d:[0,0,0],residuo:0,comunes:0};
 const d=difs.map(mediana);
 const residuo=Math.max(...Object.values(porSector).map(v=>Math.max(...v.map((x,i)=>Math.abs(x-d[i])))));
 return {d,residuo,comunes:difs[0].length};
}
export function aplicarDesplazamiento(info,grupos,cajas,d){
 info.sectores??={};
 if(info.torre){info.torre.x+=d[0];info.torre.y+=d[1];info.torre.z+=d[2];}
 for(const [k,s] of Object.entries(info.sectores))if(!cajas[k])info.sectores[k]={min:s.min.map((v,i)=>v+d[i]),max:s.max.map((v,i)=>v+d[i])};
 for(const [k,b] of Object.entries(cajas))info.sectores[k]={min:[...b.min],max:[...b.max]};
 for(const grupo of grupos)for(const caja of grupo.bombas){caja.min=caja.min.map((v,i)=>v+d[i]);caja.max=caja.max.map((v,i)=>v+d[i]);}
}
// Pisos y losas del modelo: una bomba se apoya en el más alto que tenga debajo, sin pasar de "techo".
export const ES_PISO=/\b(losa|piso|suelo|contrapiso|plataforma)\b/i;
export function alturaPiso(pisos,x,z,techo=Infinity){
 let y=null;
 for(const p of pisos)if(x>=p.min[0]&&x<=p.max[0]&&z>=p.min[2]&&z<=p.max[2]&&p.max[1]<=techo&&(y===null||p.max[1]>y))y=p.max[1];
 return y;
}
export function alinearInfoBlender(T,scene,info,grupos){
 scene.updateWorldMatrix(true,true);
 const local=new T.Matrix4();if(scene.parent)local.copy(scene.parent.matrixWorld).invert();
 const cajas={},pisos=[];
 scene.traverse(o=>{if(!o.isMesh||!o.userData.sector)return;const b=new T.Box3().setFromObject(o).applyMatrix4(local);if(b.isEmpty())return;
  const c=cajas[o.userData.sector]??={min:b.min.toArray(),max:b.max.toArray()};
  for(let i=0;i<3;i++){c.min[i]=Math.min(c.min[i],b.min.getComponent(i));c.max[i]=Math.max(c.max[i],b.max.getComponent(i));}
  if(ES_PISO.test(o.userData.original_name||o.name))pisos.push({min:b.min.toArray(),max:b.max.toArray()});});
 const medida=medirDesplazamiento(cajas,info);
 aplicarDesplazamiento(info,grupos,cajas,medida.d);
 if(medida.residuo>.25)console.warn(`Modelo de Blender: los sectores no se movieron juntos (residuo ${medida.residuo.toFixed(2)} m); revisar ubicaciones.`);
 return {...medida,pisos};
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
