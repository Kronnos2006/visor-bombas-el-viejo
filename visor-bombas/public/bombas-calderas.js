// Bombas horizontales de calderas, dibujadas según las fotos de campo.
// Medidas en metros y aproximadas. El largo va en Z, el frente en +X y la base en y=0.
const COLOR={azul:0x1d4fa8,azulMotor:0x2a62c4,turquesa:0x5f9ea6,gris:0xa9adb0,hierro:0x34383c,negro:0x1b1d20,blanco:0xdfe3e4,malla:0x8e9498};

function piezas(THREE){
 const g=new THREE.Group();
 let part=7,nombre='Bancada',cover=false;
 const conjunto=(index,label,cubierta=false)=>{part=index;nombre=label;cover=cubierta;};
 const identificar=m=>{m.name=nombre;m.userData={part,subcomponent:nombre,anatomyCover:cover};return m;};
 const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,metalness:.25,roughness:.65,...o});
 const caja=(w,h,d,c,x,y,z,o)=>{const m=identificar(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,o)));m.position.set(x,y,z);g.add(m);return m;};
 const cil=(r,l,c,x,y,z,eje='z',o)=>{const m=identificar(new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,24),mat(c,o)));if(eje==='z')m.rotation.x=Math.PI/2;if(eje==='x')m.rotation.z=Math.PI/2;m.position.set(x,y,z);g.add(m);return m;};
 return {g,caja,cil,conjunto};
}

function bastidor(caja,largo){
 caja(.86,.06,largo,COLOR.azul,0,.03,0);
 for(const x of [-.36,.36])for(const z of [-largo/2+.05,largo/2-.05])caja(.07,.2,.07,COLOR.azul,x,.16,z);
 caja(.76,.06,largo-.06,COLOR.turquesa,0,.29,0);
}

function motor(cil,caja,color,x,y,z,r,l){
 cil(r,l,color,x,y,z);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;caja(.012,.012,l*.8,color,x+Math.cos(a)*(r+.006),y+Math.sin(a)*(r+.006),z);}
 cil(r*.92,.06,COLOR.gris,x,y,z+l/2+.03);
 caja(r*.8,r*.7,r*.9,color,x+r*.95,y,z-l*.1);
}

function tuberia(cil,caja,x,z,base){
 cil(.03,1.55-base,COLOR.negro,x,(1.55+base)/2,z,'y');
 caja(.13,.03,.13,COLOR.hierro,x,1.2,z);
 cil(.03,x+.42,COLOR.negro,(x-.42)/2,1.55,z,'x');
 cil(.05,1.34,COLOR.negro,-.42,1.55,0);
}

// Izquierda: motor gris y panel turquesa alto en el extremo.
export function bombaPanel(THREE){
 const {g,caja,cil,conjunto}=piezas(THREE);
 bastidor(caja,1.05);
 conjunto(3,'Panel de la bomba',true);
 caja(.72,.72,.09,COLOR.turquesa,0,.68,-.42);
 conjunto(9,'Motor eléctrico',true);
 motor(cil,caja,COLOR.gris,.12,.49,.02,.13,.56);
 conjunto(0,'Cuerpo de bomba y conexiones');
 cil(.09,.14,COLOR.hierro,.12,.49,-.32);
 cil(.05,.18,COLOR.hierro,-.2,.5,-.3,'y');
 tuberia(cil,caja,-.2,-.3,.6);
 return g;
}

// Centro: motor azul adelante, guarda azul en arco y bomba oscura junto a la pared.
export function bombaCorrea(THREE){
 const {g,caja,cil,conjunto}=piezas(THREE);
 bastidor(caja,1.05);
 conjunto(9,'Motor eléctrico',true);
 motor(cil,caja,COLOR.azulMotor,.2,.47,.04,.11,.4);
 conjunto(8,'Guarda y transmisión',true);
 caja(.72,.1,.1,COLOR.azul,-.02,.38,-.34);
 const arco=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,10,24,Math.PI),new THREE.MeshStandardMaterial({color:COLOR.azul,metalness:.25,roughness:.65}));arco.name='Guarda y transmisión';arco.userData={part:8,subcomponent:arco.name,anatomyCover:true};arco.rotation.y=Math.PI/2;arco.position.set(-.08,.72,-.34);g.add(arco);
 for(const x of [.22,-.38])caja(.1,.34,.1,COLOR.azul,x,.55,-.34);
 const polea=cil(.25,.04,COLOR.blanco,-.08,.72,-.28,'z');polea.material.metalness=.5;
 conjunto(0,'Cuerpo de bomba y conexiones');
 cil(.07,.3,COLOR.hierro,-.3,.55,-.05,'y');
 cil(.05,.28,COLOR.azul,-.3,.52,-.05,'x');
 tuberia(cil,caja,-.3,-.05,.7);
 return g;
}

// Derecha: motor gris con ventilador, panel turquesa atrás y bomba azul pequeña.
export function bombaFondo(THREE){
 const {g,caja,cil,conjunto}=piezas(THREE);
 bastidor(caja,1.05);
 conjunto(3,'Panel y carcasa exterior',true);
 caja(.09,.56,1,COLOR.turquesa,-.34,.6,0);
 caja(.42,.56,.09,COLOR.turquesa,-.13,.6,-.48);
 conjunto(9,'Motor eléctrico',true);
 motor(cil,caja,COLOR.gris,.14,.48,-.08,.13,.46);
 cil(.13,.05,COLOR.malla,.14,.48,.18);
 conjunto(0,'Cuerpo de bomba y conexiones');
 cil(.09,.14,COLOR.azul,-.14,.5,.34,'y');
 tuberia(cil,caja,-.14,.34,.56);
 return g;
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
