// Uso: npm i --no-save three@0.170.0 @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//      node tools/fbx-torre-a-glb.mjs <DUSA3D.fbx> public/modelos/torre-dusa.glb
// FBX (Navisworks/Revit, pies, Z arriba) → GLB en coordenadas locales de la torre (m, Y arriba).
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {Document,NodeIO} from '@gltf-transform/core';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {EXTMeshoptCompression,KHRMeshQuantization} from '@gltf-transform/extensions';
import {weld,simplify,quantize,meshopt,dedup,prune} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
globalThis.self=globalThis;globalThis.window={innerWidth:1000,innerHeight:800};
THREE.TextureLoader.prototype.load=function(){return new THREE.Texture();};
const [src,out]=process.argv.slice(2);
const buf=readFileSync(src);
const root=new FBXLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'');root.updateMatrixWorld(true);
const FT=.3048, M=new THREE.Matrix4().set(FT,0,0,0, 0,0,FT,0, 0,-FT,0,0, 0,0,0,1);
const limpio=n=>n.replace(/^_DUSA_(planta_)?-_/,'').replace(/^_DUSA_planta_-_/,'').replace(/_\d{6,}$/,'').replace(/_/g,' ').trim();
// Fuera: bombas del FBX (las interactivas son las fichas Bxx), tuberías y conexiones.
// Las dos cubiertas superiores (Cubierta 1 [1245301] y 2 [1245302], +25,3 a +27 m) van como pieza aparte
// «techoSuperior», oculta por defecto (se muestra con un botón). La cubierta baja (Cubierta 3) siempre se ve.
const EXCLUIR=/^(Bomba|Cubierta roja de bomba|Cubierta bomba|Conexiones|Tubería|Conexión cobre|Línea auxiliar|Salida superior)/;
const TECHO_SUPERIOR=/^Cubierta [12]$/;
const CATS=[
 [/^(Losa base|Piso exterior)/,'concreto',0xb7b2a4],
 [/sobre sector existente/,'acero-existente',0x2a6aa8],
 [/^(Pilar|Vigas|Coronas|Soportes|Bastidor|Apoyo)/,'acero',0x2f5f9c],
 [/^(Plataforma|Continuación primer piso|Segundo piso)/,'rejilla',0x7d878c],
 [/^(Barandas|Reja amarilla)/,'baranda',0xe2b72a],
 [/^Cubierta [12]$/,'techo-superior',0xb08070],
 [/^Cubierta \d/,'techo',0xa7aeb2],
 [/^(Escalera|Descanso|Tramo)/,'escalera',0x9aa3a6],
 [/(Alambique|alambique de cobre|Recipiente del alambique|Condensador del alambique|Probeta)/,'cobre',0xb87333],
 [/^Bancada azul/,'azul',0x2a5f9e],
 [/^(Columna|Botella|Decantador)/,'inoxidable',0xc3cacd],
];
const NOMBRADO=/^(Columna|Botella|Decantador|Alambique|Recipiente del alambique|Condensador|Probeta|Bancada)/;
// Las coordenadas de textura se calculan en el visor (proyección de caja), así el archivo pesa menos.
const doc=new Document();const buffer=doc.createBuffer();const scene=doc.createScene('Torre');
const mats={};const mat=(cat,color)=>mats[cat]||(mats[cat]=doc.createMaterial(cat).setBaseColorFactor([...new THREE.Color(color).toArray(),1]).setMetallicFactor(cat==='inoxidable'||cat==='cobre'?.75:.35).setRoughnessFactor(cat==='concreto'?.9:.5).setDoubleSided(/^techo/.test(cat)));
const resumen=[];let tris=0;const grupos={};const piezas=[];
const exportados=new Set();
root.traverse(o=>{
 if(!o.isMesh)return;const nombre=limpio(o.name);const id=(o.name.match(/_(\d{6,})$/)||[])[1]||'';
 if(EXCLUIR.test(nombre))return;
 const c=CATS.find(([re])=>re.test(nombre));if(!c){console.warn('sin categoría',nombre);return;}
 let g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld));
 if(g.index)g=g.toNonIndexed();
 for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);
 g.clearGroups();
 const b=new THREE.Box3().setFromBufferAttribute(g.attributes.position);
 resumen.push({nombre,id,cat:c[1],min:b.min.toArray().map(v=>+v.toFixed(2)),max:b.max.toArray().map(v=>+v.toFixed(2))});
 tris+=g.attributes.position.count/3;
 // Equipos con nombre: malla propia (se pueden señalar). Estructura: una malla por material.
 if(NOMBRADO.test(nombre)||c[1]==='acero-existente'||TECHO_SUPERIOR.test(nombre))piezas.push({nombre,c,g,extras:{cat:c[1],nombre:NOMBRADO.test(nombre)?nombre:'',existente:c[1]==='acero-existente',techoSuperior:TECHO_SUPERIOR.test(nombre),fbx:id}});
 else (grupos[c[1]]||(grupos[c[1]]={c,gs:[]})).gs.push(g);
});
for(const [cat,{c,gs}] of Object.entries(grupos))piezas.push({nombre:'Estructura · '+cat,c,g:mergeGeometries(gs,false),extras:{cat,nombre:'',existente:false}});
for(const {nombre,c,g,extras} of piezas){
 const prim=doc.createPrimitive().setMaterial(mat(c[1],c[2]))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buffer));
 if(g.attributes.normal)prim.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buffer));
 scene.addChild(doc.createNode(nombre).setMesh(doc.createMesh(nombre).addPrimitive(prim)).setExtras(extras));
}
console.log('piezas FBX',resumen.length,'mallas web',piezas.length,'triángulos',Math.round(tris));
await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await doc.transform(dedup(),weld({tolerance:.0005}),simplify({simplifier:MeshoptSimplifier,ratio:.35,error:.0008}),prune(),quantize(),meshopt({encoder:MeshoptEncoder,level:'high'}));
const io=new NodeIO().registerExtensions([EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
writeFileSync(out,await io.writeBinary(doc));
writeFileSync(out.replace(/\.glb$/,'.json'),JSON.stringify(resumen));
let t2=0;for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())t2+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
console.log('triángulos finales',Math.round(t2));
