import * as THREE from './vendor/three.module.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';

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

export async function createPlantTopView(canvas,onProgress=()=>{}){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#17130f');
 scene.add(new THREE.HemisphereLight(0xe7f2ff,0x554b3b,2.6));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-38,85,32);scene.add(key);
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 const [gltf,campo,detalles]=await Promise.all([
  loader.loadAsync('/modelos/planta-integrada.glb',onProgress),
  loader.loadAsync('/modelos/bombas-campo.glb',onProgress),
  loader.loadAsync('/modelos/detalles-fbx-capturas.glb',onProgress)
 ]);
 const plant=new THREE.Group();plant.add(gltf.scene,campo.scene,detalles.scene);scene.add(plant);plant.updateMatrixWorld(true);
 // El visor enseña estas dos cubiertas transparentes para que se vea el equipo interior.
 gltf.scene.traverse(o=>{
  const name=String(o.userData?.original_name||o.name||'');
  if(!o.isMesh||o.userData?.sector!=='REF Cubierta comun'&&!([1240639,1240966].includes(o.userData?.fbxId)||/Nave principal - cubierta metalica|Cubierta de lamina nave ADMIN/i.test(name)))return;
  const transparent=m=>{const copy=m.clone();copy.transparent=true;copy.opacity=.12;copy.depthWrite=false;return copy;};
  o.material=Array.isArray(o.material)?o.material.map(transparent):transparent(o.material);o.renderOrder=2;
 });
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,1000);camera.up.set(0,0,-1);
 let cache='';
 function render({sector='toda',width,height}){
  const allowed=SECTORES[sector];
  plant.traverse(o=>{if(o.isMesh){const name=o.userData?.sector||o.parent?.userData?.sector;o.visible=!allowed||allowed.includes(name);}});
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
  renderer.setPixelRatio(1);renderer.setSize(rw,rh,false);renderer.render(scene,camera);
 }
 return {render,dispose(){renderer.dispose();plant.clear();}};
}
