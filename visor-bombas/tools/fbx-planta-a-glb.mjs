// Uso: npm i --no-save three@0.170.0 @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1 @gltf-transform/extensions@4.1.1 meshoptimizer@0.22.0
//      node --max-old-space-size=8000 tools/fbx-planta-a-glb.mjs <Modelogeneralcompleto.fbx> public/modelos/planta-integrada.glb public/modelos/torre-dusa.json
// Escribe también planta-integrada.json: huella, cajas por sector, bombas sin ficha y la alineación de la torre.
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
const args=process.argv.slice(2);
const conservarBombasDusa=args.includes('--conservar-bombas-dusa');
const detalleCapturas=args.includes('--detalle-capturas');
const [src,out,torreJSON]=args.filter(arg=>!arg.startsWith('--'));
const detalles=new Map([
 ...[1244368,1244369,1244370,1244371,1244372,1244378,1244379,1244380,1244381,1245203,1245204,1245205].map(id=>[id,'REF Tanque de millo']),
 [1244382,'Suelo VOCATUS'],
 ...[1245163,1245167,1245171,1245172,1245173,1245180,1245181,1245188,1245189].map(id=>[id,'REF Detras ADMIN']),
 ...[1245221,1245222,1245223,1245245].map(id=>[id,'REF Exterior'])
]);
const cubiertasCalderas=new Set([1240639,1240966]);
const nombresBombas=new Map([
 [1245188,'Bomba de la pasarela exterior de caldera ADMIN'],
 [1245171,'Bomba horizontal bajo el desaireador'],[1245172,'Bomba vertical multietapas bajo el desaireador'],
 [1245204,'Bomba exterior del tanque de millo'],[1245245,'Bomba en la pasarela del tanque café']
]);
const coloresDetalle=new Map([
 [1244370,['lamina',0x82919b]],[1244371,['lamina',0xcbd3d7]],
 [1244379,['inoxidable',0x74828a]],[1244380,['inoxidable',0xc5cfd4]],[1244381,['inoxidable',0xa9b9c0]],
 [1245167,['inoxidable',0xd6dee0]],[1245173,['verde',0x2f7d4a]],
 [1245188,['inoxidable',0x9da7ab]],[1245203,['concreto',0xa79c87]]
]);
// Colores de referencia por componente, en el orden de los grupos del FBX.
const baseOscura=0x455461,aceroSatinado=0xaab9bf,azulMotor=0x2f5f9c;
const acabadosCalderas=new Map([
 [1245171,[baseOscura,azulMotor,aceroSatinado,baseOscura,0x46746c,aceroSatinado,0x46746c,aceroSatinado,aceroSatinado,0x46746c,aceroSatinado,aceroSatinado,0xb3342b]],
 [1245172,[baseOscura,aceroSatinado,aceroSatinado,azulMotor,azulMotor,azulMotor,0x46746c,aceroSatinado,0xc1c9cc]],
 [1245180,[baseOscura,0x89959b,0x5b7182,0xbbc7cc]],
 [1245245,[baseOscura,0x46746c,aceroSatinado,azulMotor,0xb3342b,aceroSatinado,0x46746c,0xe2b72a,aceroSatinado]]
]);
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
const mats={};const mat=(cat,color)=>mats[cat+'|'+color]??=doc.createMaterial(cat).setBaseColorFactor([...new THREE.Color(color).toArray(),1]).setMetallicFactor(['inoxidable','cobre','acero','malla','tuberia'].includes(cat)?.6:.15).setRoughnessFactor(cat==='concreto'?.95:.55).setDoubleSided(['lamina','malla','muro'].includes(cat));
// La torre DUSA del modelo integrado es la misma del visor (torre-dusa.glb): sus bombas se reemplazan
// por las bombas con ficha del visor, ubicadas con la alineación calculada abajo.
const BOMBA_TORRE=/^(Bomba|Cubierta roja de bomba|Cubierta bomba|Conexiones visuales bomba|Conexiones bomba|Conexiones segunda bomba)/;
// Bombas modeladas sin ficha: cada una queda como malla propia para poder señalarla.
const BOMBA=/\bbombas?\b/i, NO_BOMBA=/^(Tuber|Conexi|Colector|Soportes|Canaleta|Piso|Ramales)/i;
const torreNombre=n=>n.replace(/^_DUSA_(planta_)?-_/,'').replace(/_\d{6,}$/,'').replace(/_/g,' ').trim();
function desglosarBombaPasarela(g,sector,id){
 if(g.groups.length!==10||g.groups[1].count!==4596||g.groups[6].count!==4596)throw Error('Cambió la geometría de la bomba de pasarela ADMIN.');
 const box=new THREE.Box3().setFromBufferAttribute(g.attributes.position);
 const conjuntos=[{part:7,subcomponent:'Bastidor de la bomba',indices:[0,5]},
  {part:9,subcomponent:'Motores del conjunto',indices:[1,6]},
  {part:0,subcomponent:'Cuerpos de bomba',indices:[2,7]},
  {part:3,subcomponent:'Tapas de los cuerpos',indices:[3,8],cover:true},
  {part:6,subcomponent:'Transmisiones del conjunto',indices:[4,9]}];
 return conjuntos.map(({part,subcomponent,indices,cover},index)=>{
  const piezas=indices.map(i=>{const {start,count}=g.groups[i],pieza=new THREE.BufferGeometry();
   for(const atributo of ['position','normal']){const base=g.getAttribute(atributo);if(base)pieza.setAttribute(atributo,new THREE.BufferAttribute(base.array.slice(start*3,(start+count)*3),3));}
   return pieza;
  });
  const parte=mergeGeometries(piezas,false);
  return {sector,id,cat:'inoxidable',color:0x9da7ab,g:parte,b:new THREE.Box3().setFromBufferAttribute(parte.attributes.position),
   desc:nombresBombas.get(id),bomba:true,part,subcomponent,cover,referenceBox:box.clone(),skipReference:index>0};
 });
}
function desglosarParBunker(g,sector,id){
 // Los grupos del elemento 1245163 contienen una bancada, dos bombas y el colector compartido.
 const partes=g.groups;
 if(partes[1]?.count!==6588||partes[21]?.count!==108||partes[22]?.count!==6588||partes[42]?.count!==1272){
  throw new Error('Cambió la geometría de las dos bombas de combustible del FBX.');
 }
 const guardas=new Set([7,8,28,29]);
 const componer=(indices,desc,bomba)=>{
  const piezas=indices.map(i=>{
   const {start,count}=partes[i],pieza=new THREE.BufferGeometry();
   for(const atributo of ['position','normal']){
    const base=g.getAttribute(atributo);
    if(base)pieza.setAttribute(atributo,new THREE.BufferAttribute(base.array.slice(start*3,(start+count)*3),3));
   }
   const color=new THREE.Color(guardas.has(i)?0xe2b72a:bomba?0x8a959a:0x59666f);
   const rgb=new Float32Array(count*3);for(let v=0;v<count;v++)color.toArray(rgb,v*3);
   pieza.setAttribute('color',new THREE.BufferAttribute(rgb,3));
   return pieza;
  });
  const parte=mergeGeometries(piezas,false);
  return {sector,id,cat:'acero',color:0xffffff,g:parte,b:new THREE.Box3().setFromBufferAttribute(parte.attributes.position),desc,bomba};
 };
 const indices=partes.map((_,i)=>i);
 return [componer(indices.slice(1,21),'Bomba de combustible de caldera ADMIN 1',true),
  componer(indices.slice(21,42),'Bomba de combustible de caldera ADMIN 2',true),
  componer([0,...indices.slice(42)],'Base y colector de las bombas de combustible ADMIN',false)];
}
const caja=new THREE.Box3();const gs=[];let tris=0;const conteo={};const dusa=[];
root.traverse(o=>{
 if(!o.isMesh)return;
 const id=Number(o.name.match(/(\d{6,})$/)?.[1]);
 const detalle=(detalleCapturas||conservarBombasDusa)&&detalles.get(id);
 const nombre=limpio(o.name),sector=detalle||SECTOR(nombre);
 let g=o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(M,o.matrixWorld));
 const b=new THREE.Box3().setFromBufferAttribute(g.attributes.position);caja.union(b);
 if(detalleCapturas&&!detalle){g.dispose();return;}
 if(g.index)g=g.toNonIndexed();
 if(detalle&&id===1245188){gs.push(...desglosarBombaPasarela(g,sector,id));tris+=g.attributes.position.count/3;return;}
 if(detalle&&id===1245163){gs.push(...desglosarParBunker(g,sector,id));tris+=g.attributes.position.count/3;return;}
 for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);
 const acabados=detalle&&acabadosCalderas.get(id);
 if(acabados){
  if(g.groups.length!==acabados.length)throw new Error('Cambió el orden de los componentes FBX de '+id);
  const rgb=new Float32Array(g.attributes.position.count*3);
  g.groups.forEach(({start,count},i)=>{
   const color=new THREE.Color(acabados[i]);
   for(let v=start;v<start+count;v++)color.toArray(rgb,v*3);
  });
  g.setAttribute('color',new THREE.BufferAttribute(rgb,3));
 }
 g.clearGroups();
 // El nombre del sector va primero ("FBX Banos - ..."): se colorea por la parte descriptiva.
 let desc=nombre.replace(/^(FBX \w+(?: \w+)? - |REF [^-]+ - |DUSA(?: planta)? - |VOCATUS Enlace \w+ - )/,'');
 if(detalle)desc=desc.replace(/^(VOCATUS (?:Anexos|Fotos\d+)|Caldera ADMIN fotos) - /,'');
 const [cat,color]=acabados?['acero',0xffffff]:(detalle&&coloresDetalle.get(id))||(CATS.find(([re])=>re.test(desc))?.slice(1)??OTRO);
 if(/^DUSA/.test(sector))dusa.push({nombre:torreNombre(o.name),b});
 if(!conservarBombasDusa&&/^DUSA/.test(sector)&&BOMBA_TORRE.test(desc))return;
 tris+=g.attributes.position.count/3;conteo[cat]=(conteo[cat]||0)+1;
 const bomba=detalle?nombresBombas.has(id):BOMBA.test(desc)&&!NO_BOMBA.test(desc);
 gs.push({sector,cat,color,g,b,desc:bomba&&nombresBombas.get(id)||desc,bomba,id:detalleCapturas||acabados||conservarBombasDusa&&cubiertasCalderas.has(id)?id:null});
});
// Centrar en la huella y apoyar en cota cero.
const centro=caja.getCenter(new THREE.Vector3());const off=new THREE.Vector3(-centro.x,-caja.min.y,-centro.z);const T=new THREE.Matrix4().makeTranslation(off.x,off.y,off.z);
// Desfase FBX → planta integrada, medido sobre sectores comunes sin cambios.
if(detalleCapturas){off.add(new THREE.Vector3(-1.25,0,21.8));T.makeTranslation(off.x,off.y,off.z);}
const r2=v=>+v.toFixed(2),cajaJSON=b=>({min:b.min.toArray().map(r2),max:b.max.toArray().map(r2)});
// Alineación torre del visor → modelo integrado: giro en planta + traslado, por mínimos cuadrados
// sobre los centros de las piezas que tienen el mismo nombre en los dos modelos.
let torre=null;
if(torreJSON){
 const ref=new Map(JSON.parse(readFileSync(torreJSON,'utf8')).map(p=>[p.nombre,p]));const pares=[];
 for(const {nombre,b} of dusa){const p=ref.get(nombre);if(!p)continue;
  const a=new THREE.Vector3().fromArray(p.min).add(new THREE.Vector3().fromArray(p.max)).multiplyScalar(.5);
  const q=b.getCenter(new THREE.Vector3()).add(off);pares.push([a,q]);}
 const n=pares.length,ma=new THREE.Vector3(),mq=new THREE.Vector3();for(const [a,q] of pares){ma.add(a);mq.add(q);}ma.divideScalar(n);mq.divideScalar(n);
 let sxx=0,sxy=0;for(const [a,q] of pares){const ax=a.x-ma.x,az=a.z-ma.z,qx=q.x-mq.x,qz=q.z-mq.z;sxx+=ax*qx+az*qz;sxy+=ax*qz-az*qx;}
 const th=Math.atan2(sxy,sxx),cs=Math.cos(th),sn=Math.sin(th);
 const tx=mq.x-(cs*ma.x-sn*ma.z),tz=mq.z-(sn*ma.x+cs*ma.z),ty=mq.y-ma.y;
 let e=0;for(const [a,q] of pares){const x=cs*a.x-sn*a.z+tx,z=sn*a.x+cs*a.z+tz;e+=(x-q.x)**2+(a.y+ty-q.y)**2+(z-q.z)**2;}
 // three.js: x'=cos·x−sen·z ; z'=sen·x+cos·z equivale a rotación.y = −th.
 torre={giro:+(-th).toFixed(5),x:r2(tx),y:r2(ty),z:r2(tz),piezas:n,errorMedio:+Math.sqrt(e/n).toFixed(3)};
 console.log('alineación torre',torre);
}
// Una malla por sector y color (liviano); cada bomba sin ficha va aparte para señalarla.
const grupos={},bombas=[],sectores={};
for(const x of gs){x.g.applyMatrix4(T);x.b.translate(off);(sectores[x.sector]||(sectores[x.sector]=new THREE.Box3())).union(x.b);
 if(x.bomba&&!x.skipReference)bombas.push({nombre:x.desc,sector:x.sector,...cajaJSON(x.referenceBox?x.referenceBox.translate(off):x.b)});
 if(x.id||x.bomba){const extras={sector:x.sector,cat:x.cat};if(x.id)extras.fbxId=x.id;if(x.bomba)extras.bomba=x.desc;if(x.part!=null)Object.assign(extras,{part:x.part,subcomponent:x.subcomponent,anatomyCover:!!x.cover});grupos['pieza|'+(x.id?x.id+'|'+x.desc+'|'+(x.part??''):bombas.length)]={...x,nodo:x.subcomponent||(x.bomba?'Bomba · '+x.desc:x.desc),extras,lista:[x.g]};continue;}
 const clave=[x.sector,x.cat,x.color].join('|');
 (grupos[clave]??={...x,nodo:x.sector,extras:{sector:x.sector,cat:x.cat},lista:[]}).lista.push(x.g);}
for(const {nodo,cat,color,lista,extras} of Object.values(grupos)){
 const g=mergeGeometries(lista,false);
 const prim=doc.createPrimitive().setMaterial(mat(cat,color))
  .setAttribute('POSITION',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.position.array)).setBuffer(buffer));
 if(g.attributes.normal)prim.setAttribute('NORMAL',doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.attributes.normal.array)).setBuffer(buffer));
 if(g.attributes.color)prim.setAttribute('COLOR_0',doc.createAccessor().setType('VEC3').setArray(g.attributes.color.array).setBuffer(buffer));
 scene.addChild(doc.createNode(nodo).setMesh(doc.createMesh(nodo).addPrimitive(prim)).setExtras(extras));
}
const tam=caja.getSize(new THREE.Vector3());
console.log('elementos FBX',gs.length,'mallas web',Object.keys(grupos).length,'bombas sin ficha',bombas.length,'triángulos',Math.round(tris));
console.log('huella (m)',tam.x.toFixed(1),tam.z.toFixed(1),'alto',tam.y.toFixed(1));console.log('colores',conteo);
await MeshoptEncoder.ready;await MeshoptSimplifier.ready;
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
// El anexo se inspecciona de cerca. El modelo de planta completa sigue optimizado para la vista general.
const simplificacion=detalleCapturas?{ratio:.36,error:.0007}:{ratio:.15,error:.002};
await doc.transform(dedup(),weld({tolerance:.0005}),simplify({simplifier:MeshoptSimplifier,...simplificacion}),prune(),quantize(),meshopt({encoder:MeshoptEncoder,level:'high'}));
const io=new NodeIO().registerExtensions([EXTMeshoptCompression,KHRMeshQuantization]).registerDependencies({'meshopt.encoder':MeshoptEncoder});
writeFileSync(out,await io.writeBinary(doc));
writeFileSync(out.replace(/\.glb$/,'.json'),JSON.stringify({huella:[r2(tam.x),r2(tam.z),r2(tam.y)],torre,sectores:Object.fromEntries(Object.entries(sectores).map(([k,b])=>[k,cajaJSON(b)])),bombas},null,1));
let t2=0;for(const m of doc.getRoot().listMeshes())for(const p of m.listPrimitives())t2+=(p.getIndices()?.getCount()??p.getAttribute('POSITION').getCount())/3;
console.log('triángulos finales',Math.round(t2));
