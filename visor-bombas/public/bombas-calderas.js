// Bombas horizontales de calderas, dibujadas según las fotos de campo.
// Medidas en metros y aproximadas. El largo va en Z, el frente en +X y la base en y=0.
const COLOR={azul:0x1d4fa8,azulMotor:0x2a62c4,turquesa:0x5f9ea6,gris:0xa9adb0,hierro:0x34383c,negro:0x1b1d20,blanco:0xdfe3e4,malla:0x8e9498};

function piezas(THREE){
 const g=new THREE.Group();
 const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,metalness:.25,roughness:.65,...o});
 const caja=(w,h,d,c,x,y,z,o)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,o));m.position.set(x,y,z);g.add(m);return m;};
 const cil=(r,l,c,x,y,z,eje='z',o)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,24),mat(c,o));if(eje==='z')m.rotation.x=Math.PI/2;if(eje==='x')m.rotation.z=Math.PI/2;m.position.set(x,y,z);g.add(m);return m;};
 return {g,caja,cil};
}

function bastidor(caja,largo){
 caja(.86,.06,largo,COLOR.azul,0,.03,0);
 for(const x of [-.4,.4])for(const z of [-largo/2+.05,largo/2-.05])caja(.07,.22,.07,COLOR.azul,x,.17,z);
 caja(.8,.06,largo-.08,COLOR.turquesa,0,.31,0);
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
 cil(.05,2.66,COLOR.negro,-.42,1.55,0);
}

// Motor gris y bomba pequeña, con la caja turquesa detrás.
export function bombaCaja(THREE){
 const {g,caja,cil}=piezas(THREE);
 bastidor(caja,1.3);
 caja(.1,.62,1.15,COLOR.turquesa,-.33,.65,0);
 motor(cil,caja,COLOR.gris,.08,.5,.16,.14,.5);
 caja(.3,.12,.34,COLOR.turquesa,.08,.4,-.36);
 cil(.09,.16,COLOR.hierro,.08,.54,-.34);
 cil(.05,.16,COLOR.hierro,.08,.54,-.2);
 tuberia(cil,caja,.08,-.42,.6);
 return g;
}

// Motor azul abajo y polea grande arriba, con guarda azul y malla.
export function bombaCorrea(THREE){
 const {g,caja,cil}=piezas(THREE);
 bastidor(caja,1.3);
 motor(cil,caja,COLOR.azulMotor,.14,.5,.2,.13,.46);
 caja(.05,.5,.72,COLOR.malla,-.03,.72,.04,{transparent:true,opacity:.55});
 const polea=cil(.25,.05,COLOR.blanco,-.1,.86,-.08,'x');polea.material.metalness=.5;
 caja(.03,.08,.8,COLOR.azul,-.02,1.1,.03);
 caja(.03,.5,.08,COLOR.azul,-.02,.72,.43);
 caja(.2,.5,.06,COLOR.azul,-.14,.72,-.36);
 cil(.11,.24,COLOR.azul,-.14,.84,-.47,'x');
 cil(.05,.3,COLOR.azul,-.14,.72,-.47,'y');
 tuberia(cil,caja,-.14,-.47,.98);
 return g;
}

const MODELOS={'caldera-caja':bombaCaja,'caldera-correa':bombaCorrea};
export const crearModeloCaldera=(THREE,nombre)=>MODELOS[nombre]?.(THREE)||null;
