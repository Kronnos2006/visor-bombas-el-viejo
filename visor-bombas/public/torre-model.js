// Torre de destilación · modelo de referencia a partir de las láminas A07–A14 (S3 Ingenieros,
// abril 2024) y las fotos anotadas del usuario. Coordenadas locales en metros:
// x desde el eje 1 hacia el 5, z desde el eje A hacia el E, y = nivel (+0,00 = terreno).
// Cotas leídas del dibujo a escala 1:75: aproximadas, no sustituyen el plano.
export const EJES_X={1:0,2:5.5,3:6.76,4:12.7,5:15.4};
export const EJES_Z={A:0,B:5.93,C:11.9,D:16.9,E:21.9};
// Pisos para aislar (NPT de las láminas). Cada objeto pertenece al piso donde se apoya.
export const SECCIONES=[
 {id:'n1',nombre:'Nivel 1',cota:.3,detalle:'Terreno +0.30 · bombas (lámina A07)'},
 {id:'n2',nombre:'Nivel 2',cota:3.3,detalle:'+3.30 (lámina A07)'},
 {id:'n21',nombre:'Nivel 2.1',cota:5.3,detalle:'+5.30 (lámina A08)'},
 {id:'n22',nombre:'Nivel 2.2',cota:6.3,detalle:'+6.30 · cuarto revestido'},
 {id:'n3',nombre:'Nivel 3',cota:9.3,detalle:'+9.30 (lámina A08)'},
 {id:'n31',nombre:'Nivel 3.1',cota:10.3,detalle:'+10.30 (lámina A09)'},
 {id:'n4',nombre:'Nivel 4',cota:15.3,detalle:'+15.30 (lámina A09)'},
 {id:'n5',nombre:'Nivel 5',cota:20.3,detalle:'+20.30 (lámina A10)'},
 {id:'n6',nombre:'Nivel 6',cota:25.3,detalle:'+25.30 (lámina A10)'},
 {id:'techo',nombre:'Techo y Nivel 7',cota:27,detalle:'Techo +27.00, Nivel 7 +30.30 y terminado +35.30 (lámina A11)'}
];
const COTAS=SECCIONES.map(s=>s.cota);
export const seccionDe=y=>{let id=SECCIONES[0].id;for(const s of SECCIONES)if(y>=s.cota-.05)id=s.id;return id;};
export const CENTRO={x:7.7,y:12,z:11};
// Vistas con los nombres del usuario (láminas A12–A14 y foto satelital pág. 10):
// frontal = lado del eje 1 · derecha = lado del eje A · trasera = lado del eje 5 · izquierda = lado del eje E.
export const VISTAS={
 frontal:{nombre:'Frontal',pos:[-46,10,11]},
 derecha:{nombre:'Derecha',pos:[7.7,10,-42]},
 trasera:{nombre:'Trasera',pos:[61,10,11]},
 izquierda:{nombre:'Izquierda',pos:[7.7,10,64]},
 iso:{nombre:'3D',pos:[-30,32,-26]},
 superior:{nombre:'Superior',pos:[7.7,70,11.2]}
};

export function buildTorre(T){
 const root=new T.Group();root.name='Torre de destilación';
 const mat=(color,o={})=>new T.MeshStandardMaterial({color,roughness:o.r??.55,metalness:o.m??.35,transparent:!!o.t,opacity:o.t??1,side:o.side??T.FrontSide});
 const M={steel:mat(0x2f5f9c),steelOld:mat(0x2a6aa8),brace:mat(0xd8d0b0),rail:mat(0xe2b72a),grating:mat(0x7d878c,{m:.5,r:.7}),
  concrete:mat(0xb7b2a4,{m:.05,r:.9}),roof:mat(0xa7aeb2,{m:.6,r:.45,side:T.DoubleSide}),clad:mat(0xdfe2e1,{m:.3,r:.6,side:T.DoubleSide}),
  vessel:mat(0xc3cacd,{m:.85,r:.28}),tank:mat(0xb06a2e,{m:.4,r:.5}),glass:mat(0x8fb6c9,{t:.45,side:T.DoubleSide})};
 const objetos=[];
 function add(mesh,section,existente=false){
  mesh.material=mesh.material.clone();
  mesh.userData.section=section;mesh.userData.existente=existente;mesh.userData.base={color:mesh.material.color.getHex(),opacity:mesh.material.opacity,transparent:mesh.material.transparent};
  root.add(mesh);objetos.push(mesh);return mesh;
 }
 function box(x0,x1,y0,y1,z0,z1,m,section=seccionDe(y0),ex=false){
  const o=new T.Mesh(new T.BoxGeometry(Math.max(.01,x1-x0),Math.max(.01,y1-y0),Math.max(.01,z1-z0)),m);
  o.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return add(o,section,ex);
 }
 function bar(a,b,r,m,section,ex=false){ // barra entre dos puntos
  const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),len=d.length();
  const o=new T.Mesh(new T.BoxGeometry(r,len,r),m);o.position.copy(A).add(B).multiplyScalar(.5);
  o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return add(o,section??seccionDe(Math.min(a[1],b[1])),ex);
 }
 const tramos=(y0,y1)=>{const p=[y0,...COTAS.filter(c=>c>y0+.05&&c<y1-.05),y1];return p.slice(0,-1).map((a,i)=>[a,p[i+1]]);};
 // Cilindro vertical partido en cada piso, para que cada piso se pueda aislar sin restos de otros.
 function cyl(x,y0,y1,z,r,m,seg=36){for(const [a,b] of tramos(y0,y1)){const o=new T.Mesh(new T.CylinderGeometry(r,r,b-a,seg),m);o.position.set(x,(a+b)/2,z);add(o,seccionDe(a));}}
 function columna(x,z,y0,y1,ex=false){for(const [a,b] of tramos(y0,y1))box(x-.16,x+.16,a,b,z-.16,z+.16,ex?M.steelOld:M.steel,seccionDe(a),ex);}
 function baranda(x0,x1,z0,z1,y,ex=false,lados='nsew'){
  const s=seccionDe(y),h=1.05;
  const tramo=(ax,az,bx,bz)=>{bar([ax,y+h,az],[bx,y+h,bz],.05,M.rail,s,ex);bar([ax,y+.55,az],[bx,y+.55,bz],.04,M.rail,s,ex);
   const n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/1.6));for(let i=0;i<=n;i++){const t=i/n;bar([ax+(bx-ax)*t,y,az+(bz-az)*t],[ax+(bx-ax)*t,y+h,az+(bz-az)*t],.05,M.rail,s,ex);}};
  if(lados.includes('n'))tramo(x0,z0,x1,z0);if(lados.includes('s'))tramo(x0,z1,x1,z1);if(lados.includes('w'))tramo(x0,z0,x0,z1);if(lados.includes('e'))tramo(x1,z0,x1,z1);
 }
 function losa(x0,x1,z0,z1,y,ex=false,lados='nsew'){
  const s=seccionDe(y);box(x0,x1,y-.12,y+.05,z0,z1,M.grating,s,ex);
  for(const [a,b] of [[[x0,z0],[x1,z0]],[[x0,z1],[x1,z1]],[[x0,z0],[x0,z1]],[[x1,z0],[x1,z1]]])bar([a[0],y-.3,a[1]],[b[0],y-.3,b[1]],.26,ex?M.steelOld:M.steel,s,ex);
  if(lados)baranda(x0,x1,z0,z1,y,ex,lados);
 }
 function arriostre(a,b,y0,y1,ex=false){const s=seccionDe(y0);bar([a[0],y0,a[1]],[b[0],y1,b[1]],.12,M.brace,s,ex);bar([b[0],y0,b[1]],[a[0],y1,a[1]],.12,M.brace,s,ex);}
 function escalera(x0,x1,z0,z1,y0,y1,ex=true){ // tramo inclinado a lo largo de z
  const s=seccionDe(y0),len=Math.hypot(z1-z0,y1-y0),o=new T.Mesh(new T.BoxGeometry(x1-x0,.08,len),M.grating);
  o.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);o.rotation.x=-Math.atan2(y1-y0,z1-z0);add(o,s,ex);
  const n=Math.round((y1-y0)/.19);for(let i=1;i<n;i++){const t=i/n;box(x0,x1,y0+(y1-y0)*t-.02,y0+(y1-y0)*t+.03,z0+(z1-z0)*t-.12,z0+(z1-z0)*t+.12,M.grating,s,ex);}
  bar([x0,y0+1,z0],[x0,y1+1,z1],.05,M.rail,s,ex);bar([x1,y0+1,z0],[x1,y1+1,z1],.05,M.rail,s,ex);
 }
 const X=EJES_X,Z=EJES_Z;
 // ── Nivel 1 · losa de terreno (NPT +0.30) y anexo trasero.
 box(-1.4,20.2,0,.3,-1.4,24,M.concrete,'n1');
 // Columnas por eje. A solo sostiene el cuarto revestido (hasta +10.30); la torre existente
 // (ejes 3–5 × D–E) sube a +30.30 y la caja del eje 3–4 a +35.30 (elevación frontal A13).
 for(const x of [X[1],X[3],X[5]])columna(x,Z.A,.3,10.3);
 for(const x of [X[1],X[3],X[4],X[5]])columna(x,Z.B,.3,25.3);
 for(const x of [X[1],X[2],X[3],X[4],X[5]])columna(x,Z.C,.3,25.3);
 for(const z of [Z.D,Z.E]){for(const x of [X[1],X[2]])columna(x,z,.3,25.3);for(const x of [X[3],X[4],X[5]])columna(x,z,.3,30.3,true);}
 for(const x of [X[3],X[4]])for(const z of [Z.D,Z.E])columna(x,z,30.3,35.3,true);
 // Vigas del marco: elevación derecha (A12) marca vigas en +10.30, +15.30, +20.30 y +25.30.
 for(const y of [10.3,15.3,20.3,25.3]){
  for(const z of [Z.B,Z.C,Z.D,Z.E])bar([X[1],y-.3,z],[X[5],y-.3,z],.24,M.steel,seccionDe(y));
  for(const x of [X[1],X[2],X[3],X[4],X[5]])bar([x,y-.3,x===X[2]?Z.C:Z.B],[x,y-.3,Z.E],.24,M.steel,seccionDe(y));
 }
 // Arriostramientos crema (A12 y fotos frontal/derecha): cara del eje 1, vano C–D hasta +15.30;
 // torre de escaleras existente (vano D–E de la cara del eje 5) hasta +30.30.
 for(const [y0,y1] of [[.3,3.3],[3.3,5.3],[5.3,10.3],[10.3,15.3]])arriostre([X[1],Z.C],[X[1],Z.D],y0,y1);
 for(const [y0,y1] of [[.3,5.3],[5.3,10.3],[10.3,15.3],[15.3,20.3],[20.3,25.3],[25.3,30.3]])arriostre([X[5],Z.D],[X[5],Z.E],y0,y1,true);
 for(const [y0,y1] of [[.3,5.3],[5.3,10.3],[10.3,15.3],[15.3,20.3],[20.3,25.3]])arriostre([X[3],Z.E],[X[4],Z.E],y0,y1,true);

 // ── Nivel 2 (+3.30): plataforma 1–2 × C–D; existente 3–4 × C–D y 2–5 × D–E.
 losa(X[1],X[2],Z.C,Z.D,3.3);losa(X[3],X[4],Z.C,Z.D,3.3,true,'nw');losa(X[2],X[5],Z.D,Z.E,3.3,true,'sw');
 // Fachada del eje 1 entre A y B en planta baja: puertas vidriadas (elevación derecha A12).
 box(-.06,.06,.3,4.6,1,5,M.glass,'n1');
 // ── Nivel 2.1 (+5.30): A–B completo, B–C × 3–5 y existente 2–4 × C–E.
 losa(X[1],X[5],Z.A,Z.B,5.3);losa(X[3],X[5],Z.B,Z.C,5.3,false,'ne');losa(X[2],X[4],Z.C,Z.E,5.3,true,'sw');
 // ── Nivel 2.2 (+6.30): plataforma 1–2 × C–D. Cuarto revestido A–B de +6.30 a +10.30 con alero.
 losa(X[1],X[2],Z.C,Z.D,6.3);
 box(X[1],X[5],6.3,10.3,-.06,.06,M.clad,'n22');box(-.06,.06,6.3,10.3,Z.A,Z.B,M.clad,'n22');box(X[5]-.06,X[5]+.06,6.3,10.3,Z.A,Z.B,M.clad,'n22');
 for(let x=.25;x<X[5];x+=.5)box(x,x+.04,6.3,10.3,-.12,-.06,M.clad,'n22');
 {const alero=new T.Mesh(new T.BoxGeometry(18,.06,1.6),M.roof);alero.position.set(7.7,6.45,-.7);alero.rotation.x=-.18;add(alero,'n22');}
 // ── Nivel 3 (+9.30): 1–2 × C–D; existente 3–4 × C–D y 2–5 × D–E.
 losa(X[1],X[2],Z.C,Z.D,9.3);losa(X[3],X[4],Z.C,Z.D,9.3,true,'n');losa(X[2],X[5],Z.D,Z.E,9.3,true,'s');
 // ── Nivel 3.1 (+10.30): existente 2–4 × C–E y cubierta a un agua del cuarto (sube de A a B).
 losa(X[2],X[4],Z.C,Z.E,10.3,true,'nsw');
 {const t=new T.Mesh(new T.BoxGeometry(18.2,.08,7.6),M.roof);t.position.set(7.7,10.85,2.7);t.rotation.x=-Math.atan2(1,7);add(t,'n31');}
 // ── Nivel 4 (+15.30): 4–5 × B–C, 1–5 × C–D y existente 2–5 × D–E.
 losa(X[4],X[5],Z.B,Z.C,15.3);losa(X[1],X[5],Z.C,Z.D,15.3);losa(X[2],X[5],Z.D,Z.E,15.3,true,'s');
 // ── Nivel 5 (+20.30)
 losa(X[4],X[5],Z.B,Z.C,20.3);losa(X[1],X[5],Z.C,Z.D,20.3);losa(X[3],X[5],Z.D,Z.E,20.3,true,'s');
 // ── Nivel 6 (+25.30): pasarelas sobre los ejes 1 y 4–5 (rejilla en A10) y existente 3–5 × D–E.
 losa(-1.4,3.2,4.8,23,25.3,false,'ew');losa(12.3,16.8,4.8,Z.D,25.3,false,'ew');losa(X[3],X[5],Z.D,Z.E,25.3,true,'s');
 // ── Techo (+27.00): dos aguas con cumbrera paralela a A–E (elevación frontal A13).
 const cumbrera=7.7,zLen=18.6,zMid=13.9;
 for(const lado of [-1,1]){
  const run=lado<0?cumbrera+1.4:16.8-cumbrera,slope=Math.hypot(run,1.7),agua=new T.Mesh(new T.BoxGeometry(slope,.08,zLen),M.roof);
  agua.position.set(cumbrera+lado*run/2,26.15,zMid);agua.rotation.z=lado*-Math.atan2(1.7,run);add(agua,'techo');
 }
 // Torre existente sobre el techo: caja revestida 3–4 × D–E (+27 a +35.30), Nivel 7 en 3–5.
 box(X[3],X[4],27,35.2,Z.D,Z.E,M.clad,'techo',true);box(X[3]-.3,X[4]+.3,35.2,35.35,Z.D-.3,Z.E+.3,M.roof,'techo',true);
 losa(X[4],X[5],Z.D,Z.E,30.3,true,'nse');
 // Escaleras: torre existente (4–5 × D–E) en zigzag hasta +30.30 y escalera 1–2 × D–E a +3.30.
 const pisos=[.3,3.3,5.3,9.3,10.3,15.3,20.3,25.3,30.3];
 for(let i=0;i<pisos.length-1;i++){const ida=i%2===0;escalera(13.1,14.9,ida?17.4:21.4,ida?21.4:17.4,pisos[i],pisos[i+1]);}
 escalera(.5,1.7,21.4,17.6,.3,3.3,false);
 // ── Equipos de proceso (círculos de las plantas y siluetas de las elevaciones).
 // Tres columnas de destilación (C–D, ejes 3–4) hasta cúpula sobre el Nivel 5.
 for(const x of [7.9,9.5,11.2]){cyl(x,.3,23.6,12.9,.55,M.vessel);const d=new T.Mesh(new T.SphereGeometry(.55,24,12,0,Math.PI*2,0,Math.PI/2),M.vessel);d.position.set(x,23.6,12.9);add(d,'n5');}
 // Tres recipientes esbeltos entre ejes 1–2 (círculos de los niveles 2, 3 y 4) con cono sobre el Nivel 4.
 for(const x of [1.1,2.2,3.2]){cyl(x,3.3,18.4,12.9,.38,M.vessel);const c=new T.Mesh(new T.ConeGeometry(.38,.9,24),M.vessel);c.position.set(x,18.85,12.9);add(c,'n4');}
 // Recipiente grande B–C × 3–4 y tanque dodecagonal A–B × 4 (Nivel 1, atraviesan el 2.1).
 cyl(9.7,.3,6.9,7.8,2,M.vessel,48);{const c=new T.Mesh(new T.ConeGeometry(2,.8,48),M.vessel);c.position.set(9.7,7.3,7.8);add(c,'n22');}
 cyl(12.9,.3,6.5,2.1,1.4,M.vessel,12);
 // Dos tanques sobre el Nivel 2.1, lado A (fotos: recipientes naranja bajo el cuarto revestido).
 for(const x of [7,9.4])cyl(x,5.35,7.55,2.2,.7,M.tank);
 // Cinco recipientes horizontales sobre el Nivel 5 (A10).
 for(const x of [.95,3.7,6.7,9,11.6]){const v=new T.Mesh(new T.CylinderGeometry(.45,.45,2.1,28),M.vessel);v.rotation.x=Math.PI/2;v.position.set(x,21.1,14.1);add(v,'n5');
  for(const dz of [-.7,.7])box(x-.35,x+.35,20.35,20.75,14.1+dz-.08,14.1+dz+.08,M.steel,'n5');}
 // Tolvas cónicas sobre el Nivel 4 (elevación frontal A13).
 for(const x of [9.5,11,12.2]){const c=new T.Mesh(new T.CylinderGeometry(.15,.55,.7,24),M.vessel);c.position.set(x,15.7,15.8);add(c,'n4');}
 root.updateMatrixWorld(true);
 return {root,objetos};
}

// Aislar un piso: solo se ve ese piso; los demás se ocultan para no tapar la vista.
export function aplicarSeccion(objetos,seccion,{existente=false}={}){
 for(const o of objetos){
  const m=o.material,b=o.userData.base;
  o.visible=!seccion||o.userData.section===seccion;
  m.color.setHex(existente&&o.userData.existente?0x63c7e8:b.color);
  m.transparent=b.transparent;m.opacity=b.opacity;m.depthWrite=true;m.needsUpdate=true;
 }
}
