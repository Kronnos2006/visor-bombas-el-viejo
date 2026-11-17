// Bombas horizontales de calderas, dibujadas según las fotos de campo.
// Medidas en metros y aproximadas. El largo va en Z, el frente en +X y la base en y=0.
import {herrajesBomba,motorDetallado} from './detalles-bombas.js';
import {compactar} from './compactar.js';
const COLOR={azul:0x1d4fa8,azulMotor:0x2a62c4,turquesa:0x5f9ea6,gris:0xa9adb0,hierro:0x34383c,negro:0x1b1d20,blanco:0xdfe3e4,malla:0x8e9498};

function finalizarModelo(T,root){
 const grupos=new Map();
 for(const mesh of [...root.children]){
  const part=mesh.userData.part;
  if(!grupos.has(part))grupos.set(part,{grupo:new T.Group(),datos:{...mesh.userData}});
  grupos.get(part).grupo.add(mesh);
 }
 for(const {grupo,datos} of grupos.values()){
  compactar(T,grupo);
  for(const mesh of [...grupo.children]){mesh.userData={...datos};mesh.name=datos.subcomponent;root.add(mesh);}
 }
 return root;
}

function piezas(THREE){
 const g=new THREE.Group();
 const porParte=new Map();
 let part=7,nombre='Bancada',cover=false;
 const conjunto=(index,label,cubierta=false)=>{part=index;nombre=label;cover=cubierta;};
 const identificar=m=>{
  const cache=porParte.get(m.material)||new Map();porParte.set(m.material,cache);
  if(!cache.has(part))cache.set(part,cache.size?m.material.clone():m.material);
  m.material=cache.get(part);m.name=nombre;m.userData={part,subcomponent:nombre,anatomyCover:cover};return m;
 };
 return {g,...herrajesBomba(THREE,g,identificar),conjunto};
}

function bastidor({caja,perno},largo){
 // Dos perfiles longitudinales y travesaños, con placas y anclajes visibles.
 for(const x of [-.36,.36]){
  caja(.12,.018,largo,COLOR.azul,x,.009,0);
  caja(.018,.25,largo,COLOR.azul,x,.14,0);
  caja(.12,.018,largo,COLOR.azul,x,.268,0);
 }
 for(const z of [-largo/2+.06,largo/2-.06])caja(.78,.07,.08,COLOR.azul,0,.065,z);
 for(const x of [-.36,.36])for(const z of [-largo/2+.08,largo/2-.08]){
  caja(.11,.012,.12,COLOR.hierro,x,.012,z);perno(x,.027,z,'y',.013);
 }
 caja(.76,.03,largo-.06,COLOR.turquesa,0,.29,0);
 for(const x of [-.31,.31])for(const z of [-largo/2+.12,largo/2-.12])perno(x,.313,z,'y',.01);
}

function tuberia({cil,caja,aro,perno},x,z,base){
 const paint=0x38444a,metal=0xa9b6bc;
 aro(.032,.023,1.55-base,paint,x,(1.55+base)/2,z,'y');
 aro(.032,.023,x+.42,paint,(x-.42)/2,1.55,z,'x');
 aro(.05,.039,1.34,paint,-.42,1.55,0);
 for(const y of [base+.045,1.18]){
  aro(.065,.026,.018,metal,x,y,z,'y');
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;perno(x+Math.cos(a)*.049,y+.014,z+Math.sin(a)*.049,'y',.008);}
 }
 cil(.045,.095,0x527570,x,1.27,z,'y');cil(.009,.10,metal,x,1.34,z,'y');
 aro(.065,.053,.009,0x353d40,x,1.39,z,'y');
 caja(.115,.006,.007,0x353d40,x,1.39,z);caja(.007,.006,.115,0x353d40,x,1.39,z);
 // Manómetro sin rotulado de valores de operación.
 cil(.012,.08,metal,x+.04,1.02,z,'x');cil(.042,.022,metal,x+.08,1.02,z+.015);
 cil(.035,.003,0xdde1df,x+.08,1.02,z+.028);
 const needle=caja(.032,.003,.002,0x283338,x+.087,1.027,z+.031);needle.rotation.z=.7;
 for(let i=0;i<6;i++){const a=-Math.PI*.7+i*Math.PI*1.4/5,tick=caja(.003,.006,.002,0x283338,x+.08+Math.sin(a)*.028,1.02+Math.cos(a)*.028,z+.031);tick.rotation.z=-a;}
}

// Izquierda: motor gris y panel turquesa alto en el extremo.
export function bombaPanel(THREE){
 const tools=piezas(THREE),{g,caja,cil,conjunto}=tools;
 bastidor(tools,1.05);
 conjunto(3,'Panel de la bomba',true);
 caja(.72,.72,.018,COLOR.turquesa,0,.68,-.42);
 for(const x of [-.35,.35])caja(.02,.72,.035,COLOR.turquesa,x,.68,-.407);
 for(const y of [.33,1.03])caja(.72,.02,.035,COLOR.turquesa,0,y,-.407);
 for(const x of [-.31,.31])for(const y of [.38,.98])tools.perno(x,y,-.434,'z',.008);
 conjunto(9,'Motor eléctrico',true);
 motorDetallado(tools,COLOR.gris,.12,.49,.02,.13,.56);
 conjunto(0,'Cuerpo de bomba y conexiones');
 cil(.09,.14,COLOR.hierro,.12,.49,-.32);
 cil(.05,.18,COLOR.hierro,-.2,.5,-.3,'y');
 tuberia(tools,-.2,-.3,.6);
 return finalizarModelo(THREE,g);
}

// Centro: motor azul adelante, guarda azul en arco y bomba oscura junto a la pared.
export function bombaCorrea(THREE){
 const tools=piezas(THREE),{g,caja,cil,conjunto}=tools;
 bastidor(tools,1.05);
 conjunto(9,'Motor eléctrico',true);
 motorDetallado(tools,COLOR.azulMotor,.2,.47,.04,.11,.4);
 conjunto(8,'Guarda y transmisión',true);
 caja(.72,.1,.1,COLOR.azul,-.02,.38,-.34);
 const arco=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,10,24,Math.PI),new THREE.MeshStandardMaterial({color:COLOR.azul,metalness:.25,roughness:.65}));arco.name='Guarda y transmisión';arco.userData={part:8,subcomponent:arco.name,anatomyCover:true};arco.rotation.y=Math.PI/2;arco.position.set(-.08,.72,-.34);g.add(arco);
 for(const x of [.22,-.38])caja(.1,.34,.1,COLOR.azul,x,.55,-.34);
 const polea=cil(.25,.04,COLOR.blanco,-.08,.72,-.28,'z');polea.material.metalness=.5;
 conjunto(0,'Cuerpo de bomba y conexiones');
 cil(.07,.3,COLOR.hierro,-.3,.55,-.05,'y');
 cil(.05,.28,COLOR.azul,-.3,.52,-.05,'x');
 tuberia(tools,-.3,-.05,.7);
 return finalizarModelo(THREE,g);
}

// Derecha: motor gris con ventilador, panel turquesa atrás y bomba azul pequeña.
export function bombaFondo(THREE){
 const tools=piezas(THREE),{g,caja,cil,conjunto}=tools;
 bastidor(tools,1.05);
 conjunto(3,'Panel y carcasa exterior',true);
 caja(.018,.56,1,COLOR.turquesa,-.34,.6,0);
 caja(.42,.56,.018,COLOR.turquesa,-.13,.6,-.48);
 for(const y of [.33,.87]){
  caja(.035,.018,1,COLOR.turquesa,-.327,y,0);
  caja(.42,.018,.035,COLOR.turquesa,-.13,y,-.467);
 }
 for(const y of [.39,.81])for(const z of [-.40,.40])tools.perno(-.352,y,z,'x',.008);
 for(const y of [.39,.81])for(const x of [-.28,.02])tools.perno(x,y,-.493,'z',.008);
 conjunto(9,'Motor eléctrico',true);
 motorDetallado(tools,COLOR.gris,.14,.48,-.08,.13,.46);
 conjunto(0,'Cuerpo de bomba y conexiones');
 caja(.16,.12,.14,COLOR.azul,-.14,.37,.34);
 cil(.09,.14,COLOR.azul,-.14,.5,.34,'y');
 tools.aro(.115,.036,.025,0xa9b6bc,-.14,.55,.34,'y');
 for(let i=0;i<6;i++){const a=i*Math.PI/3;tools.perno(-.14+Math.cos(a)*.09,.569,.34+Math.sin(a)*.09,'y',.009);}
 tuberia(tools,-.14,.34,.56);
 return finalizarModelo(THREE,g);
}

const MODELOS={'caldera-panel':bombaPanel,'caldera-correa':bombaCorrea,'caldera-fondo':bombaFondo};
export const esModeloCaldera=nombre=>Object.hasOwn(MODELOS,nombre);
export const crearModeloCaldera=(THREE,nombre)=>MODELOS[nombre]?.(THREE)||null;

// Usa las mismas mallas de la planta y las agrupa sin modificar su forma ensamblada.
export function buildCalderaReference(THREE,nombre){
 const root=crearModeloCaldera(THREE,nombre);if(!root)return null;
 return buildSeparatedReference(THREE,root);
}
export function buildSeparatedReference(THREE,root){
 const components=Array.from({length:10},(_,index)=>{const g=new THREE.Group();g.userData={index,base:0,subcomponents:[]};return g;});
 for(const mesh of [...root.children]){const group=components[mesh.userData.part];group.add(mesh);if(!group.userData.subcomponents.includes(mesh.name))group.userData.subcomponents.push(mesh.name);}
 for(const group of components){group.visible=group.children.length>0;root.add(group);}
 const offsets={0:[-.65,.1,-.4],3:[-.85,.35,0],6:[0,.3,.65],7:[0,-.35,0],8:[.8,.35,0],9:[.55,.6,.7]};
 let explosion=0;
 return {root,components,get explosion(){return explosion;},moveExplosion(target,immediate){
  explosion=immediate?target:THREE.MathUtils.lerp(explosion,target,.12);
  components.forEach((group,index)=>{const d=offsets[index]||[0,0,0];group.position.set(...d.map(v=>v*explosion));});
 },visual:{spinner:()=>null,flowScale:[.2,.2,.2],flowOffset:[-.14,.5,0]}};
}
