// Bombas nuevas del FBX general que el visor aún no tenía. Van en un archivo aparte (bombas-campo.glb/json):
// planta-integrada.glb y planta-blender-local.glb no se regeneran ni cambian.
// Uso: npm i --no-save three@0.170.0 @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//      node --max-old-space-size=8000 tools/bombas-fbx-a-glb.mjs <Modelogeneralcompleto.fbx>
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {EXTMeshoptCompression,KHRMeshQuantization} from '@gltf-transform/extensions';
import {weld,quantize,meshopt,prune} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
globalThis.self=globalThis;globalThis.window={innerWidth:1000,innerHeight:800};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
const GRUPOS=[
 {nombre:'Bomba junto a torre pequeña',sector:'REF Almacenamiento alcohol',re:/^VOCATUS - Bomba (faltante|detalle) - /},
 {nombre:'Bomba 3 de cinco frente a semilleros',sector:'REF Semilleros y pies de cuba',re:/^VOCATUS - Bomba 3 de cinco/},
 {nombre:'Bomba 4 de cinco frente a semilleros',sector:'REF Semilleros y pies de cuba',re:/^VOCATUS - Bomba 4 de cinco/},
 {nombre:'Bomba central entre tanques auxiliares',sector:'REF Cuatro tanques detalle',re:/^VOCATUS - Bomba central entre tanques/},
 ...[1,2,3,4,5].map(n=>({nombre:`Bomba vertical ${n} de 5 de calderas`,sector:'REF Detalle',re:new RegExp(`^VOCATUS Calderas - (Bomba vertical|Ramales verdes bomba vertical) ${n}\\b`)})),
 // Colector común de las cinco: geometría sin ficha propia.
 {nombre:'Colectores verdes de bombas verticales',sector:'REF Detalle',re:/^VOCATUS Calderas - Colectores verdes/,sinFicha:true}
];
// Sustituye al conjunto aproximado de tres bombas: el usuario confirmó cinco.
const NOTA='Añadida desde el FBX general de Revit. Sin TAG ni datos confirmados.';
const COLOR={verde:0x2f7d4a,rojo:0xb3342b,concreto:0xb7b2a4,tuberia:0x9aa3a6,bomba:0x2a5f9e};
const categoria=n=>/verde/i.test(n)?'verde':/cubierta|cierre/i.test(n)?'rojo':/bancada/i.test(n)?'concreto':/descarga|brida|boca/i.test(n)?'tuberia':'bomba';
const limpio=n=>n.replace(/_?\d{6,}_?$/,'').replace(/^_+/,'').replace(/_+/g,' ').replace(/\s+-\s+/g,' - ').trim();
const buf=readFileSync(process.argv[2]);
const root=new FBXLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');root.updateMatrixWorld(true);
const FT=.3048,M=new THREE.Matrix4().set(FT,0,0,0,0,0,FT,0,0,-FT,0,0,0,0,0,1);
const piezas=[],caja=new THREE.Box3();
root.traverse(o=>{if(!o.isMesh)return;
 let g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld));caja.union(new THREE.Box3().setFromBufferAttribute(g.attributes.position));
 const nombre=limpio(o.name),grupo=GRUPOS.find(x=>x.re.test(nombre));if(!grupo)return;
 if(g.index)g=g.toNonIndexed();for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);g.clearGroups();
 piezas.push({grupo,cat:categoria(nombre),cuerpo:!/ramales/i.test(nombre),g});});
// Mismo origen que el convertidor general: centro de la huella y cota cero.
const c=caja.getCenter(new THREE.Vector3()),T=new THREE.Matrix4().makeTranslation(-c.x,-caja.min.y,-c.z);
const doc=new Document(),buffer=doc.createBuffer(),scene=doc.createScene('Bombas campo'),mats={};
const material=cat=>mats[cat]||(mats[cat]=doc.createMaterial(cat).setBaseColorFactor([...new THREE.Color(COLOR[cat]).toArray(),1]).setMetallicFactor(.15).setRoughnessFactor(.6));
const salida=[];
for(const grupo of GRUPOS){
 const propias=piezas.filter(p=>p.grupo===grupo);if(!propias.length)throw new Error('No está en el FBX: '+grupo.nombre);
 const b=new THREE.Box3();
 for(const cat of new Set(propias.map(p=>p.cat))){
  const de=propias.filter(p=>p.cat===cat);const g=mergeGeometries(de.map(p=>p.g.clone().applyMatrix4(T)),false);
  for(const p of de)if(p.cuerpo)b.union(new THREE.Box3().setFromBufferAttribute(p.g.clone().applyMatrix4(T).attributes.position));
  const prim=doc.createPrimitive().setMaterial(material(cat)).setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buffer));
  if(g.attributes.normal)prim.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buffer));
  const n='Bomba · '+grupo.nombre;scene.addChild(doc.createNode(n).setMesh(doc.createMesh(n).addPrimitive(prim)).setExtras({sector:grupo.sector,cat,...(grupo.sinFicha?{}:{bomba:grupo.nombre})}));
 }
 if(grupo.sinFicha)continue;const r=v=>+v.toFixed(4);salida.push({nombre:grupo.nombre,sector:grupo.sector,nota:NOTA,bombas:[{min:b.min.toArray().map(r),max:b.max.toArray().map(r)}]});
}
await MeshoptEncoder.ready;
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await doc.transform(weld({tolerance:.0005}),prune(),quantize(),meshopt({encoder:MeshoptEncoder,level:'high'}));
const io=new NodeIO().registerExtensions([EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
writeFileSync(new URL('../public/modelos/bombas-campo.glb',import.meta.url),await io.writeBinary(doc));
writeFileSync(new URL('../public/modelos/bombas-campo.json',import.meta.url),JSON.stringify(salida,null,1)+'\n');
console.log(salida.map(x=>x.nombre+' '+JSON.stringify(x.bombas[0])).join('\n'));
