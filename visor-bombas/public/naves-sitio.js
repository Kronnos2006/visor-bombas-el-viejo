// Naves del plano de conjunto (lámina A15, S3 Ingenieros, abril 2024) que faltaban en el modelo.
// · Área 3 · Nave pequeña: medidas de las láminas A16 y A17 (ejes 7,97 × 13,65 m, alero +4,65 m,
//   cumbrera +6,012 m, portón 3,88 × 4,17 m, losa 9,8 × 17,5 m).
// · Nave grande existente: sin planos propios; huella medida en A15 a escala 1:500 (26,9 × 18,1 m).
//   Alturas, cerramientos y contenido son supuestos de presentación: confirmar en campo.
// Ubicación: A15 se ajusta al modelo con los cinco edificios FBX (semejanza 2D, error ≈ 0,2 m).
// Si una nave cae sobre equipos ya modelados (el resto del modelo no sigue A15), se aparta hacia afuera.

// Centros en A15 a 150 ppp (px, y hacia abajo).
export const PLANO_A15={
 'FBX Bodega pequena':[3017.1,720.3],'FBX Banos':[2903.6,781.2],'FBX Cuarto electrico':[2790.1,881.7],
 'FBX Bodega quimicos':[2634.7,953.3],'FBX Administracion':[3135.8,984.0]
};
const NAVE3={centro:[3355.9,1984.0],frente:[-Math.cos(60.46*Math.PI/180),-Math.sin(60.46*Math.PI/180)]};
const GRANDE={centro:[3668.8,1415.6],eje:[Math.cos(-29.39*Math.PI/180),Math.sin(-29.39*Math.PI/180)]};
// Contenedores dibujados en A15 dentro de la nave grande (≈1,05 m): 6 filas junto al lado largo norte y una junto al sur.
const COLUMNAS_CONT=[-3.72,-2.12,-.32,1.38,3.08,4.48,6.08,7.66,9.07,10.78,12.36];
const FILAS_CONT=[-8.07,-6.87,-5.53,-4.33,-2.97,-1.77,8.25];

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
export function navePequena(T){
 const g=new T.Group();g.name='Área 3 · Nave pequeña';
 const {caja,fronton,cubierta}=utiles(T,g),PARED=0xdde2e4,TECHO=0x9fa9ae,ACERO=0x5d666c,CONCRETO=0xb9b6ae;
 const L=13.65,A=7.97,H=4.65,HC=6.012,dx=-.97; // la losa sobresale 2,9 m al frente y 1 m atrás
 caja(17.5,.15,9.8,CONCRETO,0,.075,0);
 const yb=.15,ejes=[L/2,L/2-4.5,L/2-9,-L/2].map(x=>x+dx);
 for(const x of ejes)for(const z of [-A/2,A/2])caja(.15,H,.15,ACERO,x,yb+H/2,z);
 for(const z of [-A/2,A/2])caja(L,H,.04,PARED,dx,yb+H/2,z);
 const front=fronton(A,H,HC,PARED,dx+L/2,[3.88,4.168]);front.position.y=yb;
 const back=fronton(A,H,HC,PARED,dx-L/2);back.position.y=yb;
 const techo=new T.Group();techo.position.set(dx,yb,0);g.add(techo);
 cubierta(L+1.8,A,H,HC,TECHO,techo,.5);
 // Portón: marco oscuro para que se lea la abertura.
 caja(.12,4.168,.12,ACERO,dx+L/2,yb+2.084,-1.94);caja(.12,4.168,.12,ACERO,dx+L/2,yb+2.084,1.94);caja(.12,.12,3.88,ACERO,dx+L/2,yb+4.168,0);
 return g;
}

// Local: X a lo largo (26,9 m), Z a lo ancho (18,1 m), origen al centro. −X = muro grueso del plano.
export function naveGrande(T){
 const g=new T.Group();g.name='Nave grande existente (a escala del plano)';
 const {caja,fronton,cubierta}=utiles(T,g),MURO=0xcfc8bb,TECHO=0x8e989d,ACERO=0x4f585e,CONCRETO=0xbdbab2,CONT=0xe9ecee,MARCO=0x6c7378;
 const L=26.87,A=18.1,H=6,HC=7.8; // alturas supuestas (sin planos)
 caja(L,.15,A,CONCRETO,0,.075,0);
 const yb=.15;
 for(let i=0;i<=7;i++){const x=-L/2+i*L/7;for(const z of [-A/2,A/2])caja(.3,H,.3,ACERO,x,yb+H/2,z);}
 for(let i=1;i<3;i++)caja(.3,H,.3,ACERO,L/2,yb+H/2,-A/2+i*A/3);
 const muro=fronton(A,H,HC,MURO,-L/2);muro.position.y=yb;
 for(const z of [-A/2,A/2])caja(L,.35,.25,ACERO,0,yb+H,z); // vigas de alero
 const techo=new T.Group();techo.position.y=yb;g.add(techo);cubierta(L+.6,A,H,HC,TECHO,techo,.5);
 for(const v of FILAS_CONT)for(const u of COLUMNAS_CONT){
  const c=new T.Group();c.name='Contenedor (según A15)';c.position.set(u,yb,v);g.add(c);
  caja(1,1.05,1,CONT,0,.6,0,c,{transparent:true,opacity:.85});caja(1.05,.12,1.05,MARCO,0,.06,0,c);
 }
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
 const poner=(grupo,centro,dir,sector)=>{
  const [x,z]=ajuste.punto(centro),[dx,dz]=ajuste.direccion(dir);
  grupo.position.set(x,suelo,z);grupo.rotation.y=Math.atan2(-dz,dx);
  grupo.userData.sector=sector;grupo.userData.presentationOnly=true;escena.add(grupo);
  const fuera=new T.Vector3(x-centroPlanta.x,0,z-centroPlanta.z).normalize();let paso=0;
  const choca=()=>{grupo.updateMatrixWorld(true);const b=new T.Box3().setFromObject(grupo).applyMatrix4(inv).expandByScalar(.5);return ocupado.some(o=>o.intersectsBox(b));};
  while(ocupado.length&&choca()&&paso<120){grupo.position.addScaledVector(fuera,.5);paso++;}
  // Que la losa quede sobre el terreno del modelo: si una esquina queda al aire, se acerca a la planta.
  const adentro=fuera.clone().negate();let pasoT=0;
  const alAire=()=>{grupo.updateMatrixWorld(true);const b=new T.Box3().setFromObject(grupo.children[0]);
   return [[b.min.x,b.min.z],[b.min.x,b.max.z],[b.max.x,b.min.z],[b.max.x,b.max.z]].some(([x,z])=>{
    rayo.set(new T.Vector3(x,b.max.y+50,z),new T.Vector3(0,-1,0));return !rayo.intersectObjects(terreno,false).length;});};
  while(terreno.length&&alAire()&&pasoT<60){grupo.position.addScaledVector(adentro,.5);pasoT++;}
  movidos[sector]=(paso-pasoT)*.5;
 };
 poner(navePequena(T),NAVE3.centro,NAVE3.frente,'FBX Nave pequena');
 poner(naveGrande(T),GRANDE.centro,GRANDE.eje,'REF Nave grande');
 escena.updateWorldMatrix(true,true);
 return escena.userData.navesSitio={error:ajuste.error,escala:ajuste.escala,edificios:claves.length,apartadas:movidos};
}
