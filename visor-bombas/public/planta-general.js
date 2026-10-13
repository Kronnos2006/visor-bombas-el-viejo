// Planta general: el plano de sitio (lámina «REMODELAR») como piso y las áreas modeladas
// ubicadas encima. Escala leída del propio plano: 6,2 px por metro; giro de 28,5°.
// Posiciones relativas aproximadas: sirven para orientarse, no son coordenadas topográficas.
export const PLANO={url:'/referencias/torre/plano-sitio.jpg',ancho:781,alto:537,pxm:6.2};
const GIRO=.497; // rad: ejes de la torre y del sector respecto del plano
// Separación visual entre áreas (pedido del usuario): la torre se corre hacia su lado A y el
// sector hacia el lado contrario. Distancias de presentación, no de levantamiento.
const SEP_TORRE=12,SEP_TANQUES=5;
const correr=([x,z],d)=>[x+d*Math.sin(GIRO),z+d*Math.cos(GIRO)];
export const pxAMundo=(px,py)=>[(px-PLANO.ancho/2)/PLANO.pxm,(py-PLANO.alto/2)/PLANO.pxm];

export const AREAS=[
 {id:'planta',nombre:'Planta general',corto:'Toda la planta',estado:'general'},
 {id:'tanques',nombre:'Sector de tanques',corto:'Sector de tanques',estado:'modelada',
  // centro del sector (0, −0,5 locales) sobre el centro de la losa de tanques del plano
  pos:correr(pxAMundo(263.3,422.9),.5+SEP_TANQUES),giro:GIRO,
  camara:{pos:[0,39,9],obj:[0,0,-1]}},
 {id:'torre',nombre:'Torre de destilación',corto:'Torre de destilación',estado:'nueva',
  pos:correr(pxAMundo(128.3,276.9),-SEP_TORRE),giro:GIRO,camara:{pos:[-30,32,-26],obj:[7.7,10,11]}}
];
// Edificios numerados del plano de sitio que aún no se modelan.
export const PENDIENTES=[
 {n:1,px:360,py:188},{n:4,px:250,py:92},{n:5,px:206,py:146},{n:6,px:130,py:172},{n:7,px:300,py:66}
];

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
