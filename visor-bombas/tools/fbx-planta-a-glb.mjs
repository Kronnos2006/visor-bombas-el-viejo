// Uso: npm i --no-save three@0.170.0 @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//      node --max-old-space-size=8000 tools/fbx-planta-a-glb.mjs <Modelogeneralcompleto.fbx> public/modelos/planta-integrada.glb
// Modelo integrado de Revit (vista «VOCATUS - Modelo general completo», 20-oct-2026).
// FBX de Revit (pies, Z arriba, sin materiales) → GLB en metros, Y arriba, centrado en su huella y apoyado en cota cero.
// Revit no exportó materiales: el color se asigna por el nombre del elemento y es ilustrativo, no indica el material instalado.
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
const limpio=n=>n.replace(/_?\d{6,}_?$/,'').replace(/^_+/,'').replace(/_+/g,' ').replace(/\s+-\s+/g,' - ').trim();
// Sector del modelo (para agrupar y para el nombre al pasar el mouse).
const SECTOR=n=>(n.match(/^(FBX \w+(?: \w+)?|REF [^-]+|DUSA(?: planta)?|VOCATUS Enlace \w+|Suelo VOCATUS)/)||['Otros'])[0].trim();
// Orden importa: la primera regla que coincide decide el color.
const CATS=[
 [/window|ventana|muntin|trim-window/i,'ventana',0x9fb4c0],
 [/cobre|alambique/i,'cobre',0xb87333],
 [/marr[oó]n/i,'marron',0x7a4a32],
 [/verde/i,'verde',0x2f7d4a],
 [/negr|oscur|bunker/i,'oscuro',0x2c3034],
 [/roj|guarda/i,'rojo',0xb3342b],
 [/amarill|baranda|pasamanos/i,'amarillo',0xe2b72a],
 [/azul|pretil|zocalo/i,'azul',0x2f5f9c],
 [/malla|verja|reja/i,'malla',0x8b9296],
 [/rejilla|plataforma|pasarela|descanso|pelda|escal[oó]n|escalera/i,'rejilla',0x7d878c],
 [/cubierta|l[aá]mina|techo|canoa|botagua|cerramiento|correa|cercha|p[oó]rtico/i,'lamina',0xc9ced2],
 [/piso|losa|suelo|contrapiso|base|plinto|pedestal|franja|borde|slab|foundation|concreto|division/i,'concreto',0xb7b2a4],
 [/muro|wall|bloque|pared/i,'muro',0xe8e4da],
 [/bomba|motor/i,'bomba',0x2a5f9e],
 [/tuber|v[aá]lvula|colector|conexi|brida|ducto|tubo|bajante|rotametro/i,'tuberia',0x9aa3a6],
 [/fermentador|semillero|pie de cuba|tanque|dep[oó]sito|recipiente|romana|columna|botella|decantador|filtro|vaso|caldera|torre|condensador|alcohol|nutriente|transformador|gabinete/i,'inoxidable',0xc3cacd],
 [/viga|columna|poste|pilar|estructura|bastidor|apoyo|soporte|pata|cartela|m[eé]nsula|diagonal|clavador|marco|cabio|limatesa/i,'acero',0x5a6a78],
];
const OTRO=['otro',0xd0d0cc];
const doc=new Document();const buffer=doc.createBuffer();const scene=doc.createScene('Planta integrada');
const mats={};const mat=(cat,color)=>mats[cat]||(mats[cat]=doc.createMaterial(cat).setBaseColorFactor([...new THREE.Color(color).toArray(),1]).setMetallicFactor(['inoxidable','cobre','acero','malla','tuberia'].includes(cat)?.6:.15).setRoughnessFactor(cat==='concreto'?.95:.55).setDoubleSided(['lamina','malla','muro'].includes(cat)));
const caja=new THREE.Box3();const gs=[];let tris=0;const conteo={};
root.traverse(o=>{
 if(!o.isMesh)return;const nombre=limpio(o.name);
 let g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld));
 if(g.index)g=g.toNonIndexed();
 for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);
 g.clearGroups();
 // El nombre del sector va primero ("FBX Banos - ..."): se colorea por la parte descriptiva.
 const desc=nombre.replace(/^(FBX \w+(?: \w+)? - |REF [^-]+ - |DUSA(?: planta)? - |VOCATUS Enlace \w+ - )/,'');
 const c=CATS.find(([re])=>re.test(desc))||[null,...OTRO];
 caja.expandByObject(new THREE.Mesh(g));tris+=g.attributes.position.count/3;conteo[c[1]]=(conteo[c[1]]||0)+1;
 gs.push({sector:SECTOR(nombre),cat:c[1],color:c[2],g});
});
// Centrar en la huella y apoyar en cota cero.
const centro=caja.getCenter(new THREE.Vector3());const T=new THREE.Matrix4().makeTranslation(-centro.x,-caja.min.y,-centro.z);
// Una malla por sector y color: liviano para la web y permite mostrar el sector al pasar el mouse.
const grupos={};for(const x of gs){x.g.applyMatrix4(T);(grupos[x.sector+'|'+x.cat]||(grupos[x.sector+'|'+x.cat]={...x,lista:[]})).lista.push(x.g);}
for(const {sector,cat,color,lista} of Object.values(grupos)){
 const g=mergeGeometries(lista,false);
 const prim=doc.createPrimitive().setMaterial(mat(cat,color))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buffer));
 if(g.attributes.normal)prim.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buffer));
 scene.addChild(doc.createNode(sector).setMesh(doc.createMesh(sector).addPrimitive(prim)).setExtras({sector,cat}));
}
const tam=caja.getSize(new THREE.Vector3());
console.log('elementos FBX',gs.length,'mallas web',Object.keys(grupos).length,'triángulos',Math.round(tris));
console.log('huella (m)',tam.x.toFixed(1),tam.z.toFixed(1),'alto',tam.y.toFixed(1));console.log('colores',conteo);
await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await doc.transform(dedup(),weld({tolerance:.0005}),simplify({simplifier:MeshoptSimplifier,ratio:.15,error:.002}),prune(),quantize(),meshopt({encoder:MeshoptEncoder,level:'high'}));
const io=new NodeIO().registerExtensions([EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
writeFileSync(out,await io.writeBinary(doc));
let t2=0;for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())t2+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
console.log('triángulos finales',Math.round(t2));
