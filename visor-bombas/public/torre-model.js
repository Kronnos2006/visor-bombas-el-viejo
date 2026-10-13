// Torre de destilación · modelo DUSA 3D exportado por el usuario desde Navisworks (FBX, 13-oct-2026),
// convertido con tools/fbx-torre-a-glb.mjs a public/modelos/torre-dusa.glb (pies → metros).
// Coordenadas locales en metros: x desde el eje 1 hacia el 5, z desde el eje A hacia el E,
// y = nivel (+0,00 = terreno). Coinciden con los ejes de las láminas A07–A14.
// Las bombas del FBX y las tuberías no se cargan: las bombas son las interactivas del visor
// (fichas Bxx) y las tuberías quedan fuera por pedido del usuario.
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
 {id:'techo',nombre:'Coronas y techo',cota:25.3,detalle:'Coronas +25.30 y cubiertas hasta +27.00'}
];
const BAJO=.4; // se incluyen las vigas que quedan bajo cada plataforma
export const rangoSeccion=id=>{const i=SECCIONES.findIndex(s=>s.id===id);if(i<0)return null;const sig=SECCIONES[i+1];return [i?SECCIONES[i].cota-BAJO:-5,sig?sig.cota-BAJO:1e3];};
export const seccionDe=y=>{let id=SECCIONES[0].id;for(const s of SECCIONES)if(y>=s.cota-.05)id=s.id;return id;};
export const CENTRO={x:7.7,y:12,z:11};
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
// Planos de recorte compartidos por todos los materiales de la torre.
let planos=null;
// cargar(url) → Promise<{scene}>: lo pone el visor (GLTFLoader + meshopt). En pruebas se omite.
export function buildTorre(T,{cargar=null,alCargar=null}={}){
 const root=new T.Group();root.name='Torre de destilación';
 planos=[new T.Plane(new T.Vector3(0,1,0),1e3),new T.Plane(new T.Vector3(0,-1,0),1e3)];
 const objetos=[];
 const listo=!cargar?Promise.resolve(objetos):cargar(MODELO).then(gltf=>{
  const mats=new Set();
  gltf.scene.traverse(o=>{
   if(!o.isMesh)return;
   const m=o.material;if(!mats.has(m)){mats.add(m);m.clippingPlanes=planos;m.clipShadows=true;}
   if(m.name==='techo'){m.transparent=true;m.opacity=.55;m.depthWrite=false;}
   o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
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
export function aplicarSeccion(objetos,seccion,{existente=false}={}){
 const r=seccion?rangoSeccion(seccion):null;
 if(planos){planos[0].constant=r?-r[0]:1e3;planos[1].constant=r?r[1]:1e3;}
 for(const o of objetos){
  o.visible=!r||(o.userData.yMax>=r[0]&&o.userData.yMin<=r[1]);
  if(o.material.name==='acero-existente')o.material.color.setHex(existente?0x63c7e8:o.userData.base.color);
 }
}
// Para elegir con el mouse: un punto cuenta solo si está dentro del piso aislado.
export const dentroDeSeccion=(seccion,y)=>{const r=seccion?rangoSeccion(seccion):null;return !r||(y>=r[0]&&y<=r[1]);};
