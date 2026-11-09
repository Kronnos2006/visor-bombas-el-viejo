// Naves del plano de conjunto (lámina A15, S3 Ingenieros, abril 2024) que faltaban en el modelo.
// · Área 3 · Nave pequeña: medidas de las láminas A16 y A17 (ejes 7,97 × 13,65 m, alero +4,65 m,
//   cumbrera +6,012 m, portón 3,88 × 4,17 m, losa 9,8 × 17,5 m).
// · Nave grande existente («Bodega de ron»): sin planos; huella medida en A15 a escala 1:500
//   (26,9 × 18,1 m) y alturas estimadas con fotos de campo del 9-nov-2026.
// Ubicación: A15 se ajusta al modelo con los cinco edificios FBX (semejanza 2D, error ≈ 0,2 m).
// Las naves quedan rectas con los ejes del modelo (pedido del usuario), no con el giro de A15.
// Si una nave cae sobre equipos ya modelados (el resto del modelo no sigue A15), se aparta hacia afuera.

// Centros en A15 a 150 ppp (px, y hacia abajo).
export const PLANO_A15={
 'FBX Bodega pequena':[3017.1,720.3],'FBX Banos':[2903.6,781.2],'FBX Cuarto electrico':[2790.1,881.7],
 'FBX Bodega quimicos':[2634.7,953.3],'FBX Administracion':[3135.8,984.0]
};
const NAVE3={centro:[3355.9,1984.0],frente:[-Math.cos(60.46*Math.PI/180),-Math.sin(60.46*Math.PI/180)]};
const GRANDE={centro:[3668.8,1415.6],eje:[Math.cos(-29.39*Math.PI/180),Math.sin(-29.39*Math.PI/180)]};

// Semejanza 2D por mínimos cuadrados (Umeyama, sin reflexión): plano → [x,z] del modelo.
export function ajustarSemejanza(origen,destino){
 const n=origen.length,mo=[0,0],md=[0,0];
 for(let i=0;i<n;i++)for(const k of [0,1]){mo[k]+=origen[i][k]/n;md[k]+=destino[i][k]/n;}
 let a=0,b=0,var0=0;
 for(let i=0;i<n;i++){const ox=origen[i][0]-mo[0],oy=origen[i][1]-mo[1],dx=destino[i][0]-md[0],dy=destino[i][1]-md[1];
  a+=ox*dx+oy*dy;b+=ox*dy-oy*dx;var0+=ox*ox+oy*oy;}
 const ang=Math.atan2(b,a),s=Math.hypot(a,b)/var0,c=Math.cos(ang),sn=Math.sin(ang);
 const rot=([x,y])=>[c*x-sn*y,sn*x+c*y];
 const t=[md[0]-s*rot(mo)[0],md[1]-s*rot(mo)[1]];
 const punto=p=>{const r=rot(p);return [s*r[0]+t[0],s*r[1]+t[1]];};
 const error=Math.max(...origen.map((p,i)=>Math.hypot(punto(p)[0]-destino[i][0],punto(p)[1]-destino[i][1])));
 return {escala:s,angulo:ang,punto,direccion:rot,error};
}

function utiles(T,g){
 const mats={};
 const mat=(c,o={})=>mats[c+JSON.stringify(o)]??=new T.MeshStandardMaterial({color:c,roughness:.7,metalness:.2,side:T.DoubleSide,...o});
 const caja=(w,h,d,c,x,y,z,padre=g,o)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,o));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;padre.add(m);return m;};
 // Muro a dos aguas en un plano X=cte (frontón): ancho en Z, alero h, cumbrera hc, con hueco opcional.
 const fronton=(ancho,h,hc,c,x,hueco,padre=g)=>{
  const s=new T.Shape();s.moveTo(-ancho/2,0);s.lineTo(ancho/2,0);s.lineTo(ancho/2,h);s.lineTo(0,hc);s.lineTo(-ancho/2,h);s.closePath();
  if(hueco){const p=new T.Path();p.moveTo(-hueco[0]/2,0);p.lineTo(hueco[0]/2,0);p.lineTo(hueco[0]/2,hueco[1]);p.lineTo(-hueco[0]/2,hueco[1]);p.closePath();s.holes.push(p);}
  const m=new T.Mesh(new T.ShapeGeometry(s),mat(c));m.rotation.y=Math.PI/2;m.position.x=x;m.castShadow=m.receiveShadow=true;padre.add(m);return m;};
 // Cubierta a dos aguas con cumbrera a lo largo de X.
 const cubierta=(largo,ancho,h,hc,c,padre=g,vuelo=.5)=>{const pend=Math.atan2(hc-h,ancho/2),medio=(ancho/2+vuelo)/2,lado=(ancho/2+vuelo)/Math.cos(pend);
  for(const sgn of [-1,1]){const m=new T.Mesh(new T.BoxGeometry(largo,.05,lado),mat(c));m.rotation.x=sgn*pend;m.position.set(0,hc-Math.tan(pend)*medio+.03,sgn*medio);m.castShadow=m.receiveShadow=true;m.name='Cubierta lámina esmaltada';padre.add(m);}};
 return {mat,caja,fronton,cubierta};
}

// Local: +X hacia el portón (eje A), Z a lo ancho, origen en el centro de la losa.
// Aspecto según fotos de campo (9-nov-2026): lámina blanca, esquineros azules, cubierta gris oscuro
// con aleros, portón de dos hojas en el frente y puertas grises en un costado y en el fondo.
export function navePequena(T){
 const g=new T.Group();g.name='Área 3 · Nave pequeña';
 const {caja,fronton,cubierta}=utiles(T,g),PARED=0xeef1f3,TECHO=0x3b4146,AZUL=0x2b4f8c,PUERTA=0x7c8287,CONCRETO=0xb9b6ae;
 const L=13.65,A=7.97,H=4.65,HC=6.012,dx=-.97,yb=.15; // la losa sobresale 2,9 m al frente y 1 m atrás
 caja(17.5,.15,9.8,CONCRETO,0,.075,0);
 for(const z of [-A/2,A/2])caja(L,H,.05,PARED,dx,yb+H/2,z);
 const front=fronton(A,H,HC,PARED,dx+L/2,[3.88,4.168]);front.position.y=yb;
 const back=fronton(A,H,HC,PARED,dx-L/2);back.position.y=yb;
 for(const x of [dx-L/2,dx+L/2])for(const z of [-A/2,A/2])caja(.14,H,.14,AZUL,x,yb+H/2,z);
 const techo=new T.Group();techo.position.set(dx,yb,0);g.add(techo);
 cubierta(L+1.8,A,H,HC,TECHO,techo,.5);
 // Portón de dos hojas con marco azul.
 for(const z of [-.97,.97])caja(.05,4.1,1.92,PARED,dx+L/2+.04,yb+2.05,z);
 caja(.06,4.168,.03,AZUL,dx+L/2+.07,yb+2.084,0);
 for(const z of [-1.97,1.97])caja(.08,4.25,.1,AZUL,dx+L/2+.05,yb+2.125,z);caja(.08,.1,4.04,AZUL,dx+L/2+.05,yb+4.2,0);
 // Puertas de servicio (0,95 × 2,1 m).
 caja(.95,2.1,.06,PUERTA,dx+L/2-1.6,yb+1.05,A/2+.04);
 caja(.06,2.1,.95,PUERTA,dx-L/2-.04,yb+1.05,A/2-1.4);
 return g;
}

// Tanque vertical junto a la nave pequeña (círculo existente en A15, Ø 12,3 m) con dique circular de
// bloques y escalera helicoidal, según fotos del 9-nov-2026. Ø del tanque ≈10 m y altura ≈12 m estimados.
// Distancia a la nave según las fotos (≈1,8 m de pasillo), no según A15 (≈4,5 m).
export const TANQUE_NAVE3={x:.22,z:-11.9,diametroDique:12.3,alturaDique:2.6,diametro:10,altura:12};
export function tanqueNave(T,t=TANQUE_NAVE3){
 const g=new T.Group();g.name='Tanque junto a la nave pequeña';
 const mat=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.6,metalness:.3,side:T.DoubleSide,...o});
 const rD=t.diametroDique/2,r=t.diametro/2;
 const dique=new T.Mesh(new T.CylinderGeometry(rD,rD,t.alturaDique,64,1,true),mat(0x8d877b,{roughness:.95,metalness:0}));dique.position.y=t.alturaDique/2;g.add(dique);
 const corona=new T.Mesh(new T.RingGeometry(rD-.2,rD,64),mat(0x9a9488,{roughness:.95,metalness:0}));corona.rotation.x=-Math.PI/2;corona.position.y=t.alturaDique;g.add(corona);
 const piso=new T.Mesh(new T.CircleGeometry(rD-.2,64),mat(0xa9a59c,{roughness:1,metalness:0}));piso.rotation.x=-Math.PI/2;piso.position.y=.05;g.add(piso);
 const cuerpo=new T.Mesh(new T.CylinderGeometry(r,r,t.altura,64),mat(0xd5d9dc,{metalness:.45,roughness:.4}));cuerpo.position.y=t.altura/2+.1;g.add(cuerpo);
 const techo=new T.Mesh(new T.ConeGeometry(r+.05,.8,64),mat(0xc9cdd0,{metalness:.45,roughness:.45}));techo.position.y=t.altura+.5;g.add(techo);
 for(let i=1;i<6;i++){const anillo=new T.Mesh(new T.TorusGeometry(r+.01,.025,6,64),mat(0xaeb3b6));anillo.rotation.x=Math.PI/2;anillo.position.y=.1+i*t.altura/6;g.add(anillo);}
 // Escalera helicoidal: una vuelta casi completa, baranda amarilla.
 const vuelta=1.6*Math.PI,a0=-Math.PI*.3,curva=(dr,dy)=>new T.CatmullRomCurve3(Array.from({length:41},(_,i)=>{const k=i/40,a=a0+k*vuelta;return new T.Vector3(Math.cos(a)*(r+dr),.3+k*(t.altura-.3)+dy,Math.sin(a)*(r+dr));}));
 g.add(new T.Mesh(new T.TubeGeometry(curva(.45,0),200,.06,6),mat(0x3d4246)));
 g.add(new T.Mesh(new T.TubeGeometry(curva(.85,1),200,.035,6),mat(0xe0b52a,{metalness:.2})));
 for(let i=0;i<=60;i++){const k=i/60,a=a0+k*vuelta,y=.3+k*(t.altura-.3);const e=new T.Mesh(new T.BoxGeometry(.8,.04,.25),mat(0x3d4246));
  e.position.set(Math.cos(a)*(r+.45),y,Math.sin(a)*(r+.45));e.rotation.y=-a;g.add(e);
  if(i%3===0){const p=new T.Mesh(new T.CylinderGeometry(.02,.02,1,6),mat(0xe0b52a,{metalness:.2}));p.position.set(Math.cos(a)*(r+.85),y+.5,Math.sin(a)*(r+.85));g.add(p);}}
 g.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});
 return g;
}

// «Bodega de ron» existente. Huella de A15 (26,9 × 18,1 m); alturas estimadas de las fotos de campo:
// alero ≈8,6 m, cumbrera ≈10,3 m, zócalo de concreto ≈1,3 m, lámina plateada, ventanal alto en
// ambos frentes y portón ≈5,4 × 3,6 m con puerta peatonal en el frente −X (corregido por el usuario).
export function naveGrande(T){
 const g=new T.Group();g.name='Bodega de ron (nave grande)';
 const {caja,fronton,cubierta}=utiles(T,g),LAMINA=0xb7bcc0,ZOCALO=0xa8a49b,TECHO=0x33383c,VIDRIO=0x1d2833,MARCO=0xe4e7e9,PORTON=0xa4aaae,PUERTA=0x6f767b,CONCRETO=0xbdbab2;
 const L=26.87,A=18.1,H=8.6,HC=10.3,Z=1.3,yb=.15;
 caja(L,.15,A,CONCRETO,0,.075,0);
 for(const z of [-A/2,A/2]){caja(L,Z,.2,ZOCALO,0,yb+Z/2,z);caja(L,H-Z,.06,LAMINA,0,yb+Z+(H-Z)/2,z);}
 for(const x of [-L/2,L/2]){caja(.2,Z,A,ZOCALO,x,yb+Z/2,0);const f=fronton(A,H-Z,HC-Z,LAMINA,x);f.position.y=yb+Z;
  caja(.12,1.45,5.6,MARCO,x+Math.sign(x)*.05,yb+6.5,0);caja(.14,1.25,5.4,VIDRIO,x+Math.sign(x)*.06,yb+6.5,0);}
 const techo=new T.Group();techo.position.y=yb;g.add(techo);cubierta(L+1,A,H,HC,TECHO,techo,.6);
 caja(.12,3.6,5.4,PORTON,-L/2-.08,yb+1.8,-.4);
 caja(.1,2.1,.95,PUERTA,-L/2-.08,yb+1.05,3.6);
 caja(.95,2.1,.1,PUERTA,-2,yb+1.05,-A/2-.12);
 return g;
}

// Agrega las dos naves a la escena del modelo de Blender. Devuelve el ajuste usado o null.
export function agregarNaves(T,escena){
 if(escena.userData.navesSitio)return escena.userData.navesSitio;
 escena.updateWorldMatrix(true,true);
 const inv=new T.Matrix4().copy(escena.matrixWorld).invert(),cajas={};
 escena.traverse(o=>{const s=o.userData.sector?.trim();if(!o.isMesh||!(s in PLANO_A15))return;
  const b=new T.Box3().setFromObject(o).applyMatrix4(inv);(cajas[s]??=new T.Box3()).union(b);});
 const claves=Object.keys(PLANO_A15).filter(k=>cajas[k]);
 if(claves.length<3)return null;
 const ajuste=ajustarSemejanza(claves.map(k=>PLANO_A15[k]),claves.map(k=>{const c=cajas[k].getCenter(new T.Vector3());return [c.x,c.z];}));
 const suelo=Math.min(...claves.map(k=>cajas[k].min.y));
 // Equipos ya modelados (sin terreno ni pisos): la nave se aparta de ellos si los pisa.
 const ocupado=[];escena.traverse(o=>{const s=o.userData.sector?.trim();if(!o.isMesh||!s||s==='Entorno'||s in PLANO_A15)return;
  const b=new T.Box3().setFromObject(o).applyMatrix4(inv);if(b.max.y-b.min.y>.6)ocupado.push(b);});
 const centroPlanta=new T.Vector3();for(const b of ocupado)centroPlanta.add(b.getCenter(new T.Vector3()));if(ocupado.length)centroPlanta.divideScalar(ocupado.length);
 const movidos={},rayo=new T.Raycaster(),terreno=[];escena.traverse(o=>{if(o.userData.sector?.trim()==='Entorno'&&/suelo|terreno/i.test(o.userData.original_name||o.name))o.traverse(m=>{if(m.isMesh)terreno.push(m);});});
 const poner=(grupo,centro,dir,sector,holgura=.5)=>{
  const [x,z]=ajuste.punto(centro),[dx,dz]=ajuste.direccion(dir);
  grupo.position.set(x,suelo,z);grupo.rotation.y=Math.round(Math.atan2(-dz,dx)/(Math.PI/2))*(Math.PI/2); // recta con los ejes de la planta
  grupo.userData.sector=sector;grupo.userData.presentationOnly=true;escena.add(grupo);
  const fuera=new T.Vector3(x-centroPlanta.x,0,z-centroPlanta.z).normalize();let paso=0;
  const choca=()=>{grupo.updateMatrixWorld(true);const b=new T.Box3().setFromObject(grupo).applyMatrix4(inv).expandByScalar(holgura);return ocupado.some(o=>o.intersectsBox(b));};
  while(ocupado.length&&choca()&&paso<120){grupo.position.addScaledVector(fuera,.5);paso++;}
  // Que la losa quede sobre el terreno del modelo: si una esquina queda al aire, se acerca a la planta.
  const adentro=fuera.clone().negate();let pasoT=0;
  const alAire=()=>{grupo.updateMatrixWorld(true);const b=new T.Box3().setFromObject(grupo.children[0]);
   return [[b.min.x,b.min.z],[b.min.x,b.max.z],[b.max.x,b.min.z],[b.max.x,b.max.z]].some(([x,z])=>{
    rayo.set(new T.Vector3(x,b.max.y+50,z),new T.Vector3(0,-1,0));return !rayo.intersectObjects(terreno,false).length;});};
  while(terreno.length&&alAire()&&pasoT<60){grupo.position.addScaledVector(adentro,.5);pasoT++;}
  movidos[sector]=(paso-pasoT)*.5;
 };
 const nave3=navePequena(T),tanque=tanqueNave(T);tanque.position.set(TANQUE_NAVE3.x,0,TANQUE_NAVE3.z);nave3.add(tanque);
 poner(nave3,NAVE3.centro,NAVE3.frente,'FBX Nave pequena');
 poner(naveGrande(T),GRANDE.centro,GRANDE.eje,'REF Bodega de ron',8); // pedido: más separada de la planta
 escena.updateWorldMatrix(true,true);
 return escena.userData.navesSitio={error:ajuste.error,escala:ajuste.escala,edificios:claves.length,apartadas:movidos};
}
