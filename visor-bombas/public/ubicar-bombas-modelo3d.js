import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
import {PLANTA_BLENDER_CACHE,medirDesplazamiento} from './blender-local.js';

const SECTORES={
 tanques:['Sector de tanques'],
 torre:['DUSA','DUSA planta','VOCATUS Enlace destilacion'],
 fermentacion:['REF Fermentacion','REF Fermentacion ampliacion'],
 semilleros:['REF Semilleros y pies de cuba'],
 almacenamiento:['REF Almacenamiento alcohol','REF Sector completo sur'],
 cuatro:['REF Cuatro tanques','REF Cuatro tanques detalle'],
 agua:['REF Agua y enfriamiento','REF Torre pequena','REF Pasillo'],
 calderas:['REF Detalle','REF Detras ADMIN','REF Exterior','REF Fotos','REF Plano ampliacion'],
 millo:['REF Tanque de millo'],
 edificios:['FBX Administracion','FBX Banos','FBX Bodega pequena','FBX Bodega quimicos','FBX Cuarto electrico','FBX Nave pequena','REF Bodega de ron']
};

// Conversión calibrada con las bombas cuyo modelo 3D tiene coordenadas medidas.
// Conserva la ubicación existente del plano 2D para las etiquetas sin geometría propia.
const PLANO_A_MODELO={escalaX:.0371374,offsetX:-51.994,escalaZ:.0371404,offsetZ:-46.507,altura:.3};

async function loadTankSector(loader,onProgress){
 const {DRACOLoader}=await import('/vendor/blender-local/DRACOLoader.js');
 const draco=new DRACOLoader().setDecoderPath('/vendor/blender-local/draco/');loader.setDRACOLoader(draco);
 try{
  let gltf;
  if(typeof DecompressionStream==='function'){
   const response=await fetch('/modelos/blender-local/planta-blender-local.glb.gz?v='+PLANTA_BLENDER_CACHE);
   if(response.status===404)gltf=await loader.loadAsync('/modelos/blender-local/planta-blender-local.glb?v='+PLANTA_BLENDER_CACHE,onProgress);
   else if(!response.ok)throw Error('No se pudo descargar el detalle de los tanques ('+response.status+').');
   else if(!response.body)gltf=await loader.loadAsync('/modelos/blender-local/planta-blender-local.glb?v='+PLANTA_BLENDER_CACHE,onProgress);
   else{
    const total=Number(response.headers.get('content-length'))||0;let loaded=0;
    const progress=new TransformStream({transform(chunk,controller){loaded+=chunk.byteLength;onProgress?.({loaded,total});controller.enqueue(chunk);}});
    const stream=response.body.pipeThrough(progress),buffered=/\bgzip\b/i.test(response.headers.get('content-encoding')||'')?stream:stream.pipeThrough(new DecompressionStream('gzip'));
    gltf=await loader.parseAsync(await new Response(buffered).arrayBuffer(),'/modelos/blender-local/');
   }
  }else gltf=await loader.loadAsync('/modelos/blender-local/planta-blender-local.glb?v='+PLANTA_BLENDER_CACHE,onProgress);
  gltf.scene.traverse(o=>{if(o.userData.sector)o.userData.sector=o.userData.sector.trim();if(o.isMesh)o.userData.mapSectorOnly=true;});
  gltf.scene.updateMatrixWorld(true);
  const boxes={};gltf.scene.traverse(o=>{if(!o.isMesh||!o.userData.sector)return;const b=new THREE.Box3().setFromObject(o);if(b.isEmpty())return;const s=boxes[o.userData.sector]??={min:b.min.toArray(),max:b.max.toArray()};for(let i=0;i<3;i++){s.min[i]=Math.min(s.min[i],b.min.getComponent(i));s.max[i]=Math.max(s.max[i],b.max.getComponent(i));}});
  const info=await fetch('/modelos/planta-integrada.json').then(r=>{if(!r.ok)throw Error('No se pudieron alinear los tanques con la planta.');return r.json();});
  const {d,residuo}=medirDesplazamiento(boxes,info);if(residuo>.25)throw Error('El modelo de tanques no coincide con la planta integrada.');
  const aligned=new THREE.Group();aligned.name='Tanques del modelo detallado';aligned.position.set(-d[0],-d[1],-d[2]);aligned.add(gltf.scene);return aligned;
 }finally{draco.dispose();}
}

export async function createPlantTopView(canvas,onProgress=()=>{},points=[]){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#17130f');
 scene.add(new THREE.HemisphereLight(0xe7f2ff,0x554b3b,2.6));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-38,85,32);scene.add(key);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 const [gltf,campo,detalles,tanques]=await Promise.all([
  loader.loadAsync('/modelos/planta-integrada.glb',onProgress),
  loader.loadAsync('/modelos/bombas-campo.glb',onProgress),
  loader.loadAsync('/modelos/detalles-fbx-capturas.glb',onProgress),
  loadTankSector(loader,onProgress)
 ]);
 const plant=new THREE.Group();plant.add(gltf.scene,campo.scene,detalles.scene,tanques);scene.add(plant);plant.updateMatrixWorld(true);
 // El visor enseña estas dos cubiertas transparentes para que se vea el equipo interior.
 gltf.scene.traverse(o=>{
  const name=String(o.userData?.original_name||o.name||'');
  const roofCommon=o.userData?.sector==='REF Cubierta comun';
  const roofBoilers=o.userData?.sector==='REF Detalle'&&o.userData?.cat==='lamina';
  if(!o.isMesh||!roofCommon&&!roofBoilers&&!([1240639,1240966].includes(o.userData?.fbxId)||/Nave principal - cubierta metalica|Cubierta de lamina nave ADMIN/i.test(name)))return;
  const opacity=roofBoilers ? .04 : .12;
  const transparent=m=>{const copy=m.clone();copy.transparent=true;copy.opacity=opacity;copy.depthWrite=false;return copy;};
  o.material=Array.isArray(o.material)?o.material.map(transparent):transparent(o.material);o.renderOrder=2;
 });
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,1000);camera.up.set(0,0,-1);
 const fetchJson=async u=>{const r=await fetch(u);if(!r.ok)throw Error('No se pudieron leer las coordenadas de '+u);return r.json();};
 const [individuales,detallesInfo,campoInfo]=await Promise.all([fetchJson('/modelos/bombas-individuales.json'),fetchJson('/modelos/detalles-fbx-capturas.json'),fetchJson('/modelos/bombas-campo.json')]);
 const catalogo=[...individuales,...detallesInfo.bombas.map(b=>({...b,bombas:[b]})),...campoInfo],positions={};
 const add=(id,b)=>{if(b?.min?.length===3&&b?.max?.length===3)positions[id]={x:(b.min[0]+b.max[0])/2,y:(b.min[1]+b.max[1])/2,z:(b.min[2]+b.max[2])/2};};
 for(const {id} of points){
  if(!id?.startsWith('integrado:'))continue;
  const g=catalogo.filter(g=>id.startsWith(`integrado:${g.sector}:${g.nombre}`)).sort((a,b)=>b.nombre.length-a.nombre.length)[0];if(!g)continue;
  const match=id.match(/ · Bomba (\d+)$/),index=match&&g.bombas.length>1?+match[1]-1:0;
  // Si el catálogo no tiene esa bomba, conserva su punto del plano; no dupliques
  // la última caja disponible para inventar una segunda ubicación.
  if(index<g.bombas.length)add(id,g.bombas[index]);
 }
 const fbxPumps=new Map(detallesInfo.bombas.map(g=>[g.nombre,g]));
 const extraTags={B72:'Bomba vertical multietapas bajo el desaireador',B73:'Bomba de la pasarela exterior de caldera ADMIN',B74:'Bomba de combustible de caldera ADMIN 1',B75:'Bomba horizontal bajo el desaireador',B76:'Bomba de combustible de caldera ADMIN 2'};
 for(const [tag,name] of Object.entries(extraTags))add('tag:'+tag,fbxPumps.get(name));
 for(const p of points){
  if(positions[p.id]||!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
  positions[p.id]={x:PLANO_A_MODELO.offsetX+PLANO_A_MODELO.escalaX*p.x,y:PLANO_A_MODELO.altura,z:PLANO_A_MODELO.offsetZ+PLANO_A_MODELO.escalaZ*p.y};
 }
 let cache='';
 function render({sector='toda',width,height}){
  const allowed=SECTORES[sector];
  plant.traverse(o=>{if(o.isMesh){const name=o.userData?.sector||o.parent?.userData?.sector;o.visible=o.userData.mapSectorOnly?name==='Sector de tanques'&&(!allowed||allowed.includes(name)):!allowed||allowed.includes(name);}});
  plant.updateMatrixWorld(true);
  const box=new THREE.Box3();plant.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry)return;o.geometry.computeBoundingBox();if(o.geometry.boundingBox)box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));});
  if(box.isEmpty())throw Error('El modelo no contiene geometría para este sector.');
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),aspect=width/height;
  const viewHeight=Math.max(size.z,size.x/aspect,1)*1.1;
  const key=[sector,width,height,box.min.x,box.min.z,box.max.x,box.max.z].join('|');
  if(key===cache)return;cache=key;
  camera.left=-viewHeight*aspect/2;camera.right=viewHeight*aspect/2;camera.top=viewHeight/2;camera.bottom=-viewHeight/2;
  camera.position.set(center.x,box.max.y+Math.max(size.x,size.z)*1.3,center.z);camera.lookAt(center.x,center.y,center.z);camera.near=.01;camera.far=2000;camera.updateProjectionMatrix();
  const scale=Math.min(1,1500/Math.max(width,height)),rw=Math.max(1,Math.round(width*scale)),rh=Math.max(1,Math.round(height*scale));
  renderer.setPixelRatio(1);renderer.setSize(rw,rh,false);camera.updateMatrixWorld(true);renderer.render(scene,camera);
 }
 function project(point){const p=new THREE.Vector3(point.x,point.y,point.z).project(camera);return {x:(p.x+1)/2,y:(1-p.y)/2,visible:p.z>=-1&&p.z<=1};}
 return {positions,render,project,dispose(){renderer.dispose();plant.clear();}};
}
