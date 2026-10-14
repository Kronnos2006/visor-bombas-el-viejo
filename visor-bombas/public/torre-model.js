// Torre de destilación · modelo DUSA 3D exportado por el usuario desde Navisworks (FBX, 13-oct-2026),
// convertido con tools/fbx-torre-a-glb.mjs a public/modelos/torre-dusa.glb (pies → metros).
// Coordenadas locales en metros: x desde el eje 1 hacia el 5, z desde el eje A hacia el E,
// y = nivel (+0,00 = terreno). Coinciden con los ejes de las láminas A07–A14.
// No se cargan las bombas del FBX (las interactivas son las fichas Bxx) ni las tuberías (pedido del
// usuario). Las dos cubiertas superiores (Cubierta 1 y 2, +25,3 a +27 m) vienen ocultas por pedido del
// usuario y se muestran con el botón «Techo superior». La cubierta baja (Cubierta 3) siempre se ve.
export const EJES_X={1:0,2:5.5,3:6.76,4:12.7,5:15.4};
export const EJES_Z={A:0,B:5.93,C:11.9,D:16.9,E:21.9};
export const MODELO='/modelos/torre-dusa.glb';
// Pisos para aislar (NPT del modelo DUSA 3D). Al aislar un piso se recorta el modelo entre su
// cota y la del piso siguiente (con las vigas que lo sostienen), así nada de arriba tapa la vista.
export const SECCIONES=[
 {id:'n1',nombre:'Nivel 1',cota:.3,detalle:'Terreno +0.30 · bombas'},
 {id:'n2',nombre:'Nivel 2',cota:3.35,detalle:'Plataforma 1 · NPT +3.35'},
 {id:'n21',nombre:'Nivel 2.1',cota:5.3,detalle:'Plataformas 4 y 5 · primer piso del alambique · NPT +5.35'},
 {id:'n22',nombre:'Nivel 2.2',cota:6.35,detalle:'Plataforma 2 · NPT +6.35'},
 {id:'n3',nombre:'Nivel 3',cota:9.3,detalle:'Plataforma 3 y segundo piso Bach/Vinaza · NPT +9.35'},
 {id:'n31',nombre:'Nivel 3.1',cota:10.3,detalle:'Cubierta baja +10.30'},
 {id:'n4',nombre:'Nivel 4',cota:15.3,detalle:'Plataformas 6 y 7 · NPT +15.35'},
 {id:'n5',nombre:'Nivel 5',cota:20.3,detalle:'Plataformas 8 y 9 · NPT +20.35'},
 {id:'techo',nombre:'Coronas',cota:25.3,detalle:'Coronas +25.30 · parte alta abierta (sin cubiertas superiores)'}
];
const BAJO=.4; // se incluyen las vigas que quedan bajo cada plataforma
export const rangoSeccion=id=>{const i=SECCIONES.findIndex(s=>s.id===id);if(i<0)return null;const sig=SECCIONES[i+1];return [i?SECCIONES[i].cota-BAJO:-5,sig?sig.cota-BAJO:1e3];};
export const seccionDe=y=>{let id=SECCIONES[0].id;for(const s of SECCIONES)if(y>=s.cota-.05)id=s.id;return id;};
export const CENTRO={x:7.7,y:12,z:11};
// Límites reales del modelo convertido (m, coordenadas locales), medidos en public/modelos/torre-dusa.json.
export const LIMITES={min:[-1.24,0,-1.3],max:[17.57,25.35,22.39]};
// Vistas con los nombres del usuario: frontal = lado del eje 1 · derecha = lado del eje A ·
// trasera = lado del eje 5 · izquierda = lado del eje E.
export const VISTAS={
 frontal:{nombre:'Frontal',pos:[-46,10,11]},
 derecha:{nombre:'Derecha',pos:[7.7,10,-42]},
 trasera:{nombre:'Trasera',pos:[61,10,11]},
 izquierda:{nombre:'Izquierda',pos:[7.7,10,64]},
 iso:{nombre:'3D',pos:[-30,32,-26]},
 superior:{nombre:'Superior',pos:[7.7,70,11.2]}
};
// Acabados como en la escena de Blender del usuario (texturas de realismo-local/texturas).
// Cada textura se repite cada 2 m; las coordenadas se calculan aquí por proyección de caja.
const TEX='/texturas/torre/';
export const ACABADOS={
 acero:{tex:'estructura_azul',metal:.45,rough:.5},
 'acero-existente':{tex:'estructura_azul',metal:.45,rough:.5},
 baranda:{tex:'seguridad_amarillo',metal:.35,rough:.45},
 concreto:{tex:'concreto',metal:0,rough:.92},
 rejilla:{tex:'acero_satinado',metal:.55,rough:.55,color:0xc8ced1},
 escalera:{tex:'acero_satinado',metal:.55,rough:.5,color:0xd5dadc},
 inoxidable:{tex:'acero_satinado',metal:.92,rough:.22,color:0xf1f4f5},
 cobre:{tex:'guarda_ocre',metal:.85,rough:.32,color:0xffd2b0},
 azul:{tex:'bomba_azul',metal:.35,rough:.5},
 techo:{tex:'cobertura_baja',metal:.3,rough:.6},
 'techo-superior':{tex:'cubierta_terracota',metal:.25,rough:.65}
};
function uvCaja(T,o){
 const g=o.geometry,p=g.attributes.position,n=g.attributes.normal;if(!p||g.attributes.uv)return;
 const nm=new T.Matrix3().getNormalMatrix(o.matrixWorld),v=new T.Vector3(),w=new T.Vector3(),uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i++){
  v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
  if(n)w.fromBufferAttribute(n,i).applyMatrix3(nm);else w.set(0,1,0);
  const ax=Math.abs(w.x),ay=Math.abs(w.y),az=Math.abs(w.z);
  const [a,b]=ay>=ax&&ay>=az?[v.x,v.z]:ax>=az?[v.z,v.y]:[v.x,v.y];uv[i*2]=a/2;uv[i*2+1]=b/2;
 }
 g.setAttribute('uv',new T.BufferAttribute(uv,2));
}
function acabar(T,m){
 const a=ACABADOS[m.name];if(!a)return;
 const t=new T.TextureLoader().load(TEX+a.tex+'.jpg');t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;
 m.map=t;m.color.setHex(a.color??0xffffff);m.metalness=a.metal;m.roughness=a.rough;m.envMapIntensity=.9;m.needsUpdate=true;
}
// Planos de recorte compartidos por todos los materiales de la torre.
let planos=null;
// cargar(url) → Promise<{scene}>: lo pone el visor (GLTFLoader + meshopt). En pruebas se omite.
export function buildTorre(T,{cargar=null,alCargar=null}={}){
 const root=new T.Group();root.name='Torre de destilación';
 planos=[new T.Plane(new T.Vector3(0,1,0),1e3),new T.Plane(new T.Vector3(0,-1,0),1e3)];
 const objetos=[];
 const listo=!cargar?Promise.resolve(objetos):cargar(MODELO).then(gltf=>{
  const mats=new Set();gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   const m=o.material;if(!mats.has(m)){mats.add(m);m.clippingPlanes=planos;m.clipShadows=true;acabar(T,m);}
   uvCaja(T,o);o.castShadow=true;o.receiveShadow=true;
   if(o.userData.techoSuperior)o.visible=false;
   // Caja en metros locales de la torre: la malla viene cuantizada y la escala está en el nodo.
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
   o.userData.yMin=b.min.y;o.userData.yMax=b.max.y;o.userData.section=seccionDe(b.min.y);
   o.userData.base={color:m.color.getHex()};
   objetos.push(o);
  });
  root.add(gltf.scene);root.updateMatrixWorld(true);
  alCargar?.(objetos);return objetos;
 }).catch(e=>{console.error('No se pudo cargar el modelo de la torre',e);alCargar?.(objetos,e);return objetos;});
 return {root,objetos,listo};
}

// Aislar un piso: se recorta el modelo entre la cota del piso y la del siguiente.
export function aplicarSeccion(objetos,seccion,{existente=false,techo=false}={}){
 const r=seccion?rangoSeccion(seccion):null;
 if(planos){planos[0].constant=r?-r[0]:1e3;planos[1].constant=r?r[1]:1e3;}
 for(const o of objetos){
  o.visible=(!r||(o.userData.yMax>=r[0]&&o.userData.yMin<=r[1]))&&(!o.userData.techoSuperior||techo);
  if(o.material.name==='acero-existente')o.material.color.setHex(existente?0x63c7e8:o.userData.base.color);
 }
}
// Para elegir con el mouse: un punto cuenta solo si está dentro del piso aislado.
export const dentroDeSeccion=(seccion,y)=>{const r=seccion?rangoSeccion(seccion):null;return !r||(y>=r[0]&&y<=r[1]);};
