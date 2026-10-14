// Planta general: el plano de sitio (lámina «REMODELAR») como piso y las áreas modeladas
// ubicadas encima. Escala leída del propio plano: 6,2 px por metro; giro de 28,5°.
// Posiciones relativas aproximadas: sirven para orientarse, no son coordenadas topográficas.
export const PLANO={url:'/referencias/torre/plano-sitio.jpg',ancho:781,alto:537,pxm:6.2};
const GIRO=.497; // rad: ejes de la torre y del sector respecto del plano
// Separación visual entre áreas (pedido del usuario): la torre se corre hacia su lado A y el
// sector hacia el lado contrario. Distancias de presentación, no de levantamiento.
const SEP_TORRE=8,SEP_TANQUES=5;
const correr=([x,z],d)=>[x+d*Math.sin(GIRO),z+d*Math.cos(GIRO)];
const separarFila=([x,z],d)=>[x+d*Math.cos(GIRO),z-d*Math.sin(GIRO)];
export const pxAMundo=(px,py)=>[(px-PLANO.ancho/2)/PLANO.pxm,(py-PLANO.alto/2)/PLANO.pxm];

export const AREAS=[
 {id:'planta',nombre:'Planta general',corto:'Toda la planta',estado:'general'},
 {id:'tanques',nombre:'Sector de tanques',corto:'Sector de tanques',estado:'modelada',
  // centro del sector (0, −0,5 locales) sobre el centro de la losa de tanques del plano
  pos:correr(pxAMundo(263.3,422.9),.5+SEP_TANQUES),giro:GIRO,
  camara:{pos:[0,39,9],obj:[0,0,-1]}},
 {id:'torre',nombre:'Torre de destilación',corto:'Torre de destilación',estado:'nueva',
  pos:correr(pxAMundo(128.3,276.9),-SEP_TORRE),giro:GIRO,camara:{pos:[-30,32,-26],obj:[7.7,10,11]}},
 // Centros estimados de las huellas dibujadas en «REMODELAR». El orden 7, 4, 5, 6
 // responde a la revisión visual del usuario; requiere confirmación en campo.
 {id:'area1',numero:1,nombre:'Área 1 · Oficina administrativa',corto:'Área 1 · Oficina',estado:'nueva',
  pos:pxAMundo(359,177),giro:GIRO,modelo:'/modelos/oficina-administrativa.glb',huella:[31,13,5.3],
  camara:{pos:[30,20,27],obj:[0,2,0]}},
 // La fachada azul y los escalones del FBX están en +X local: girarla 90° hacia la oficina.
 {id:'area7',numero:7,nombre:'Área 7 · Bodega pequeña',corto:'Área 7 · Bodega pequeña',estado:'nueva',
  pos:separarFila(pxAMundo(300,66),1),giro:GIRO-Math.PI/2,modelo:'/modelos/bodega-pequena.glb',huella:[8.2,8.2,4.4],
  camara:{pos:[12,12,14],obj:[0,2,0]}},
 {id:'area4',numero:4,nombre:'Área 4 · Baños',corto:'Área 4 · Baños',estado:'nueva',
  pos:pxAMundo(246,95),giro:GIRO,modelo:'/modelos/banos.glb',huella:[11.2,8,3.3],
  camara:{pos:[15,13,15],obj:[0,2,0]}},
 {id:'area5',numero:5,nombre:'Área 5 · Cuarto eléctrico',corto:'Área 5 · Cuarto eléctrico',estado:'nueva',
  pos:separarFila(pxAMundo(194,126),-2),giro:GIRO,modelo:'/modelos/cuarto-electrico.glb',huella:[11,7,4.3],
  camara:{pos:[12,12,14],obj:[0,2,0]}},
 {id:'area6',numero:6,nombre:'Área 6 · Bodega de químicos',corto:'Área 6 · Bodega químicos',estado:'nueva',
  pos:separarFila(pxAMundo(130,151),-4),giro:GIRO,modelo:'/modelos/bodega-quimicos.glb',huella:[14,8.5,4.1],
  camara:{pos:[18,14,18],obj:[0,2,0]}}
];
// Edificios numerados del plano de sitio que aún no se modelan.
export const PENDIENTES=[];

export function sueloSitio(T){
 const g=new T.Group();g.name='Plano de sitio';
 const w=PLANO.ancho/PLANO.pxm,h=PLANO.alto/PLANO.pxm;
 const material=new T.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0,transparent:true,opacity:.92});
 new T.TextureLoader().load(PLANO.url,t=>{t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;material.map=t;material.needsUpdate=true;});
 const piso=new T.Mesh(new T.PlaneGeometry(w,h),material);piso.rotation.x=-Math.PI/2;piso.position.y=-.32;g.add(piso);
 return g;
}
// Ubica un grupo local de área sobre el plano.
export function ubicar(group,area){group.position.set(area.pos[0],0,area.pos[1]);group.rotation.y=area.giro;group.updateMatrixWorld(true);return group;}
