// Torre de destilación · modelo de referencia a partir de las láminas A07–A14 (S3 Ingenieros,
// abril 2024) y las fotos anotadas del usuario. Coordenadas locales en metros:
// x desde el eje 1 hacia el 5, z desde el eje A hacia el E, y = nivel (+0,00 = terreno).
// Cotas leídas del dibujo a escala 1:75: aproximadas, no sustituyen el plano.
export const EJES_X={1:0,2:5.5,3:6.76,4:12.7,5:15.4};
export const EJES_Z={A:0,B:5.93,C:11.9,D:16.9,E:21.9};
export const NIVELES=[
 ['Terreno',.3],['Nivel 2',3.3],['Nivel 2.1',5.3],['Nivel 2.2',6.3],['Nivel 3',9.3],['Nivel 3.1',10.3],['Nivel 3.2',12.3],
 ['Nivel 4',15.3],['Nivel 5',20.3],['Nivel 6',25.3],['Nivel de techo',27],['Nivel 7',30.3],['Nivel terminado',35.3]
];
// Secciones como las rotuló el usuario en la elevación (lámina A12).
export const SECCIONES=[
 {id:'p1',nombre:'Planta 1',detalle:'Terreno y Nivel 2 (lámina A07) · bombas',desde:0,hasta:5.3},
 {id:'p2',nombre:'Planta 2',detalle:'Niveles 2.1 a 3.2 (láminas A08–A09)',desde:5.3,hasta:15.3},
 {id:'p3',nombre:'Planta 3',detalle:'Nivel 4 (+15.30)',desde:15.3,hasta:20.3},
 {id:'p4',nombre:'Planta 4',detalle:'Nivel 5 (+20.30)',desde:20.3,hasta:25.3},
 {id:'p5',nombre:'Planta 5',detalle:'Nivel 6, techo y torre existente',desde:25.3,hasta:99}
];
export const seccionDe=y=>(SECCIONES.find(s=>y>=s.desde-1e-6&&y<s.hasta-1e-6)||SECCIONES.at(-1)).id;
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
  concrete:mat(0xb7b2a4,{m:.05,r:.9}),roof:mat(0xa7aeb2,{m:.6,r:.45,side:T.DoubleSide}),clad:mat(0xd9dddc,{m:.3,r:.6,side:T.DoubleSide}),
  vessel:mat(0xc3cacd,{m:.85,r:.28}),tank:mat(0x9b5a32,{m:.4,r:.5}),pipeG:mat(0x2f7d4f),pipeR:mat(0xa23a3a),pipe:mat(0xa9b0b3,{m:.7,r:.35}),glass:mat(0x8fb6c9,{t:.45})};
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
 function cyl(x,y0,h,z,r,m,section=seccionDe(y0),seg=36){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y0+h/2,z);return add(o,section);}
 const cortes=[.3,5.3,15.3,20.3,25.3,30.3,35.3];
 function columna(x,z,y0,y1,ex=false){ // se parte por secciones para poder aislarlas
  const pts=[y0,...cortes.filter(c=>c>y0&&c<y1),y1];
  for(let i=0;i<pts.length-1;i++)box(x-.16,x+.16,pts[i],pts[i+1],z-.16,z+.16,ex?M.steelOld:M.steel,seccionDe(pts[i]),ex);
 }
 function baranda(x0,x1,z0,z1,y,ex=false,lados='nsew'){
  const s=seccionDe(y),h=1.05;
  const tramo=(ax,az,bx,bz)=>{bar([ax,y+h,az],[bx,y+h,bz],.05,M.rail,s,ex);bar([ax,y+.55,az],[bx,y+.55,bz],.04,M.rail,s,ex);
   const n=Math.max(1,Math.round(Math.hypot(bx-ax,bz-az)/1.6));for(let i=0;i<=n;i++){const t=i/n;bar([ax+(bx-ax)*t,y,az+(bz-az)*t],[ax+(bx-ax)*t,y+h,az+(bz-az)*t],.05,M.rail,s,ex);}};
  if(lados.includes('n'))tramo(x0,z0,x1,z0);if(lados.includes('s'))tramo(x0,z1,x1,z1);if(lados.includes('w'))tramo(x0,z0,x0,z1);if(lados.includes('e'))tramo(x1,z0,x1,z1);
 }
 function losa(x0,x1,z0,z1,y,ex=false,lados='nsew'){
  box(x0,x1,y-.12,y+.05,z0,z1,M.grating,seccionDe(y),ex);
  // vigas perimetrales azules
  for(const [a,b] of [[[x0,z0],[x1,z0]],[[x0,z1],[x1,z1]],[[x0,z0],[x0,z1]],[[x1,z0],[x1,z1]]])bar([a[0],y-.3,a[1]],[b[0],y-.3,b[1]],.26,ex?M.steelOld:M.steel,seccionDe(y),ex);
  if(lados)baranda(x0,x1,z0,z1,y,ex,lados);
 }
 function arriostre(a,b,y0,y1,ex=false){bar([a[0],y0,a[1]],[b[0],y1,b[1]],.12,M.brace,seccionDe(y0),ex);bar([b[0],y0,b[1]],[a[0],y1,a[1]],.12,M.brace,seccionDe(y0),ex);}
 function escalera(x0,x1,z0,z1,y0,y1,ex=true){ // tramo inclinado a lo largo de z
  const s=seccionDe(y0),w=x1-x0,len=Math.hypot(z1-z0,y1-y0),o=new T.Mesh(new T.BoxGeometry(w,.08,len),M.grating);
  o.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);o.rotation.x=-Math.atan2(y1-y0,z1-z0);add(o,s,ex);
  const n=Math.round((y1-y0)/.19);for(let i=1;i<n;i++){const t=i/n;box(x0,x1,y0+(y1-y0)*t-.02,y0+(y1-y0)*t+.03,z0+(z1-z0)*t-.12,z0+(z1-z0)*t+.12,M.grating,s,ex);}
  bar([x0,y0+1,z0],[x0,y1+1,z1],.05,M.rail,s,ex);bar([x1,y0+1,z0],[x1,y1+1,z1],.05,M.rail,s,ex);
 }
 const X=EJES_X,Z=EJES_Z;
 // Losa de terreno (NPT +0.30) y anexo hacia el lado trasero.
 box(-1.4,20.2,0,.3,-1.4,24,M.concrete,'p1');
 // Columnas por eje (A: solo hasta la cubierta del cuarto; torre existente 3–5 × D–E hasta +30.30).
 for(const x of [X[1],X[3],X[5]])columna(x,Z.A,.3,10.3);
 for(const x of [X[1],X[3],X[4],X[5]])columna(x,Z.B,.3,25.3);
 for(const x of [X[1],X[2],X[3],X[4],X[5]])columna(x,Z.C,.3,25.3);
 for(const z of [Z.D,Z.E]){for(const x of [X[1],X[2]])columna(x,z,.3,25.3);for(const x of [X[3],X[4],X[5]])columna(x,z,.3,30.3,true);}
 // Caja superior existente (+30.30 a +35.30).
 for(const x of [X[3],X[4]])for(const z of [17.9,Z.E])columna(x,z,30.3,35.3,true);
 // Vigas del marco en los niveles principales.
 for(const y of [9.3,15.3,20.3,25.3]){
  for(const z of [Z.B,Z.C,Z.D,Z.E])bar([X[1],y,z],[X[5],y,z],.24,M.steel,seccionDe(y));
  for(const x of [X[1],X[3],X[4],X[5]])bar([x,y,Z.B],[x,y,Z.E],.24,M.steel,seccionDe(y));
 }
 // Arriostramientos en X (crema), como en las fotos de las vistas frontal y trasera.
 for(const [y0,y1] of [[9.3,15.3],[15.3,20.3],[20.3,25.3]]){
  arriostre([X[1],Z.B],[X[1],Z.C],y0,y1);arriostre([X[1],Z.C],[X[1],Z.D],y0,y1);
  arriostre([X[5],Z.B],[X[5],Z.C],y0,y1);arriostre([X[3],Z.E],[X[4],Z.E],y0,y1,true);
 }
 for(const [y0,y1] of [[.3,5.3],[5.3,9.3]]){arriostre([X[1],Z.B],[X[1],Z.C],y0,y1);arriostre([X[5],Z.D],[X[5],Z.E],y0,y1,true);}
 for(const [y0,y1] of [[.3,5.3],[5.3,10.3],[10.3,15.3],[15.3,20.3],[20.3,25.3],[25.3,30.3]])arriostre([X[5],Z.D],[X[5],Z.E],y0,y1,true);

 // PLANTA 1 · Nivel 2 (+3.30), 2.1 (+5.30) y 2.2 (+6.30)
 losa(X[1],X[2],Z.C,Z.D,3.3);
 losa(X[3],X[4],Z.C,Z.D,3.3,true,'nw');losa(X[2],X[5],Z.D,Z.E,3.3,true,'sw');
 losa(X[1],X[5],Z.A,Z.B,5.3);losa(X[3],X[5],Z.B,Z.C,5.3,false,'ne');
 losa(X[2],X[4],Z.C,Z.E,5.3,true,'sw');
 losa(X[1],X[2],Z.C,Z.D,6.3);
 // PLANTA 2 · Nivel 3 (+9.30) y 3.1 (+10.30)
 losa(X[1],X[2],Z.C,Z.D,9.3);losa(X[3],X[4],Z.C,Z.D,9.3,true,'n');losa(X[2],X[5],Z.D,Z.E,9.3,true,'s');
 losa(X[2],X[4],Z.C,Z.E,10.3,true,'nsw');
 // Cuarto revestido del lado A (fotos: caja blanca) y su cubierta a un agua (+10.30 a +11.30).
 const sA=seccionDe(9.3);
 box(-1.2,16.7,6.3,10.3,-.85,-.75,M.clad,sA);box(-1.25,-1.15,6.3,10.3,-.8,Z.B,M.clad,sA);box(16.65,16.75,6.3,10.3,-.8,Z.B,M.clad,sA);
 for(let x=-1;x<16.7;x+=.5)box(x,x+.04,6.3,10.3,-.92,-.86,M.clad,sA);
 const techoA=new T.Mesh(new T.BoxGeometry(18.2,.08,7.4),M.roof);techoA.position.set(7.75,10.8,2.55);techoA.rotation.x=-Math.atan2(1,6.7);add(techoA,sA);
 // PLANTA 3 · Nivel 4 (+15.30)
 losa(X[4],X[5],Z.B,Z.C,15.3);losa(X[1],X[5],Z.C,Z.D,15.3);losa(X[2],X[5],Z.D,Z.E,15.3,true,'s');
 // PLANTA 4 · Nivel 5 (+20.30)
 losa(X[4],X[5],Z.B,Z.C,20.3);losa(X[1],X[5],Z.C,Z.D,20.3);losa(X[3],X[5],Z.D,Z.E,20.3,true,'s');
 // PLANTA 5 · Nivel 6 (+25.30), techo (+27.00), Nivel 7 (+30.30) y terminado (+35.30)
 losa(-1.4,3.2,4.8,23,25.3,false,'ew');losa(12.3,16.8,4.8,Z.D,25.3,false,'ew');losa(X[3],X[5],Z.D,Z.E,25.3,true,'s');
 const ancho=18.2,cumbrera=7.7,zLen=18.6,zMid=13.9;
 for(const lado of [-1,1]){
  const run=lado<0?cumbrera+1.4:16.8-cumbrera,slope=Math.hypot(run,1.7),agua=new T.Mesh(new T.BoxGeometry(slope,.08,zLen),M.roof);
  agua.position.set(cumbrera+lado*run/2,26.15,zMid);agua.rotation.z=lado*-Math.atan2(1.7,run);add(agua,'p5');
 }
 losa(X[3],X[5],Z.D,Z.E,30.3,true);
 box(X[3],X[4],30.3,35.2,17.9,Z.E,M.clad,'p5',true);box(X[3]-.3,X[4]+.3,35.2,35.35,17.6,Z.E+.3,M.roof,'p5',true);
 // Escaleras: torre existente (ejes 4–5 × D–E) en zigzag y escalera de servicio 1–2 × D–E.
 const tramos=[.3,3.3,5.3,9.3,10.3,15.3,20.3,25.3,30.3];
 for(let i=0;i<tramos.length-1;i++){const ida=i%2===0;escalera(13.1,14.9,ida?17.4:21.4,ida?21.4:17.4,tramos[i],tramos[i+1]);}
 escalera(.5,1.7,21.4,17.6,.3,3.3,false);
 // Equipos de proceso (círculos de las plantas): tres columnas de destilación, recipientes y tanques.
 for(const x of [7.9,9.5,11.2]){const r=.55;for(const [a,b] of [[.3,5.3],[5.3,15.3],[15.3,20.3],[20.3,23.6]])cyl(x,a,b-a,12.9,r,M.vessel,seccionDe(a));
  const dome=new T.Mesh(new T.SphereGeometry(.55,24,12,0,Math.PI*2,0,Math.PI/2),M.vessel);dome.position.set(x,23.6,12.9);add(dome,'p4');}
 for(const x of [1.1,2.2,3.2]){for(const [a,b] of [[3.3,5.3],[5.3,15.3],[15.3,18.4]])cyl(x,a,b-a,12.9,.38,M.vessel,seccionDe(a));
  const cono=new T.Mesh(new T.ConeGeometry(.38,.9,24),M.vessel);cono.position.set(x,18.85,12.9);add(cono,'p3');}
 cyl(9.7,.3,5,7.8,2,M.vessel,'p1',48);cyl(9.7,5.3,1.6,7.8,2,M.vessel,'p2',48);{const c=new T.Mesh(new T.ConeGeometry(2,.8,48),M.vessel);c.position.set(9.7,7.3,7.8);add(c,'p2');}
 cyl(12.9,.3,5,2.1,1.4,M.vessel,'p1',12);cyl(12.9,5.3,1.2,2.1,1.4,M.vessel,'p2',12);
 for(const x of [7,9.4])cyl(x,5.35,2.2,2.2,.7,M.tank,'p2');
 for(const x of [.95,3.7,6.7,9,11.6]){const v=new T.Mesh(new T.CylinderGeometry(.45,.45,2.1,28),M.vessel);v.rotation.x=Math.PI/2;v.position.set(x,21.1,14.1);add(v,'p4');
  for(const dz of [-.7,.7])box(x-.35,x+.35,20.35,20.75,14.1+dz-.08,14.1+dz+.08,M.steel,'p4');}
 // Tuberías de proceso (fotos: gris, verde y roja) sobre el eje C y hacia el anexo.
 for(const [y,m] of [[4.1,M.pipe],[4.4,M.pipeG],[4.7,M.pipeR],[5,M.pipe]]){const p=new T.Mesh(new T.CylinderGeometry(.09,.09,21.6,12),m);p.rotation.z=Math.PI/2;p.position.set(9.4,y,10.5);add(p,'p1');}
 root.updateMatrixWorld(true);
 return {root,objetos};
}

// Aislar por secciones: la sección elegida queda opaca y el resto como contorno tenue.
export function aplicarSeccion(objetos,seccion,{existente=false}={}){
 for(const o of objetos){
  const m=o.material,b=o.userData.base,activa=!seccion||o.userData.section===seccion;
  o.visible=activa||o.userData.section!=='p5'||!seccion; // techos fuera de la sección no tapan la vista
  m.color.setHex(existente&&o.userData.existente?0x63c7e8:b.color);
  m.transparent=!activa||b.transparent;m.opacity=activa?b.opacity:.1;m.depthWrite=activa;m.needsUpdate=true;
 }
}
