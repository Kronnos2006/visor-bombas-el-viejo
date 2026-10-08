// Coordenadas locales aproximadas de presentación. No son cotas ni georreferencias.
// Las letras identifican posiciones de trabajo; todavía no equivalen a TAG ni placa.
export const photoPumps=[
 {tag:'BOMBA-A',nombre:'Frente principal · posición A',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'frente',x:-4,z:5.5,rotation:0,scale:.86,variant:'lf'},
 {tag:'BOMBA-B',nombre:'Frente principal · posición B',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'frente',x:0,z:5.5,rotation:0,scale:1.05,variant:'mto'},
 {tag:'BOMBA-C',nombre:'Frente principal · posición C',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'frente',x:4,z:5.5,rotation:0,scale:.9,variant:'lf'},
 {tag:'BOMBA-D',nombre:'Lado derecho · posición D',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'derecho',x:13.7,z:0,rotation:-Math.PI/2,scale:1.02,variant:'mto'},
 {tag:'BOMBA-E',nombre:'Lado derecho · posición E',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'derecho',x:13.7,z:-4.4,rotation:-Math.PI/2,scale:.84,variant:'lf'},
 {tag:'BOMBA-F',nombre:'Lado izquierdo · posición F',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'lateral',x:-13.7,z:0,rotation:Math.PI/2,scale:.86,variant:'lf'},
 {tag:'BOMBA-G',nombre:'Lado izquierdo · posición G',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'lateral',x:-13.7,z:-4.4,rotation:Math.PI/2,scale:1.04,variant:'mto'},
 {tag:'BOMBA-I',nombre:'Frente posterior · posición I',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'posterior',x:-2.4,z:-10.7,rotation:Math.PI,scale:.9,variant:'titan'},
 {tag:'BOMBA-J',nombre:'Frente posterior · posición J',area:'Sector fotografiado',servicio:'Por confirmar',grupo:'posterior',x:2.4,z:-10.7,rotation:Math.PI,scale:.9,variant:'lf'}
];
// Lectura de placa sobre las fotos del 2026-10-07. Dato real, sin asociar
// todavia a una posicion del mapa ni a un TAG del P&ID.
export const plateEvidence=[
 {serie:'210770-1', marca:'Hidromac', modelo:'2196', size:'1X1.5-8 STO I', foto:'080739',
  specs:[['Caudal','96 GPM'],['Altura','15.2 m'],['Velocidad','1750 rpm'],
         ['Impulsor','178 mm (max. 205)'],['Material','316 SS'],['Lubricacion','Aceite']]},
 {serie:'210770-7', marca:'Hidromac', modelo:'2196', size:'1X1.5X8 STO I', foto:'111524',
  specs:[['Caudal','60 GPM'],['Altura','12.2 m'],['Velocidad','1750 rpm'],
         ['Impulsor','174 mm (max. 205)'],['Material','316 SS']]},
 {serie:'210771-1', marca:'Hidromac', modelo:'2196', size:'1X1.5-8 LF', foto:'110916', specs:[]},
 {serie:'210771-2', marca:'Hidromac', modelo:'2196', size:'1X1.5-8 LF', foto:'110905', specs:[]},
 {serie:'210771-3', marca:'Hidromac', modelo:'2196', size:'1X1.5-8 LF', foto:'111538', specs:[]},
 {serie:'210771-5', marca:'Hidromac', modelo:'2196', size:'1X1.5-8 LF', foto:'110829', specs:[]},
 {serie:'210775-2', marca:'Hidromac', modelo:'2196', size:'3X4X8G MTO I', foto:'110805',
  specs:[['Caudal','200 GPM'],['Altura','15.2 m'],['Velocidad','1750 rpm'],
         ['Impulsor','200 mm (max. 215)'],['Material','316 SS'],['Max. diseno','49 PSI @ 100 F']]},
 {serie:'220105-1', marca:'Hidromac', modelo:'2196', size:'3X4-8G MTO I', foto:'111014', specs:[]},
 {serie:'220105-2', marca:'Hidromac', modelo:'2196', size:'3X4-8G MTO I', foto:'110953', specs:[]},
 {serie:'027167', marca:'Titan', modelo:'4196', size:'1X1.5-8 ST', foto:'080952', specs:[]}
];

// Expedientes preparados para la presentación. La placa existe, pero su asociación
// con la posición, el servicio, el sellado, los o-rings y el historial son DEMO.
const demoLinks=[
 [0,'142010','Agua de proceso','Sello mecánico simple','Carbono / cerámica','EPDM'],
 [6,'142038','Alcohol diluido','Sello mecánico simple','Carburo de silicio / carbono','FKM (Viton)'],
 [2,'142042','Agua de lavado','Sello mecánico simple','Carbono / cerámica','EPDM'],
 [7,'142102','Alcohol de proceso','Sello mecánico simple','Carburo de silicio / carbono','FKM (Viton)'],
 [3,'142124','Agua de proceso','Sello mecánico simple','Carbono / cerámica','EPDM'],
 [4,'142327','Alcohol diluido','Sello mecánico simple','Carbono / cerámica','FKM (Viton)'],
 [8,'142331','Agua de transferencia','Sello mecánico simple','Carburo de silicio / carbono','EPDM'],
 [9,'142319','Agua de servicio','Sello mecánico simple','Carbono / cerámica','EPDM'],
 [1,'142744','Alcohol diluido','Sello mecánico simple','Carbono / cerámica','FKM (Viton)']
];
for(const [index,[plateIndex,photo,service,sealType,faces,elastomer]] of demoLinks.entries()){
 const pump=photoPumps[index],plate=plateEvidence[plateIndex];
 Object.assign(pump,{
  foto3:photo,marca:plate.marca,modelo:plate.modelo,serie:plate.serie,size:plate.size,
  servicio:service,association:'DEMO · asociación de placa por confirmar',
  seal:{tipo:sealType,diametro:index%3===1?'1.500 in':'1.375 in',caras:faces,elastomero:elastomer,codigo:`SEL-DEMO-${String(index+1).padStart(2,'0')}`},
  orings:[
   {posicion:'Carcasa / tapa',medida:index%2?'AS568-236':'AS568-235',material:elastomer,cantidad:1,codigo:`OR-DEMO-${index+1}A`},
   {posicion:'Camisa / impulsor',medida:index%3?'AS568-118':'AS568-120',material:elastomer,cantidad:1,codigo:`OR-DEMO-${index+1}B`},
   {posicion:'Porta-rodamiento',medida:'AS568-228',material:'NBR',cantidad:1,codigo:`OR-DEMO-${index+1}C`}
  ],
  history:[
   {fecha:'2026-02-12',tipo:'Inspección preventiva',detalle:'Revisión visual de fugas, ruido y temperatura. Sin desviaciones críticas.',responsable:'Mantenimiento (DEMO)'},
   {fecha:'2026-05-28',tipo:'Ajuste de alineación',detalle:'Comprobación de acople y alineación; ajuste menor documentado para la propuesta.',responsable:'Mecánica (DEMO)'},
   {fecha:'2026-08-19',tipo:'Revisión de sellado',detalle:`Inspección del ${sealType.toLowerCase()} y elastómero ${elastomer}. Datos ilustrativos; no constituyen repuesto autorizado.`,responsable:'Mantenimiento (DEMO)'}
  ]
 });
}

// Placa de motor. Los dos codigos de rodamiento son repuesto comprable hoy.
export const motorEvidence={foto:'111146', specs:[
 ['Potencia','7.5 HP'],['Velocidad','1750 rpm'],['Tension','230/460 V'],
 ['Corriente','19.6 / 9.8 A'],['Carcasa','213JM (brida JM, estandar ANSI)'],
 ['Encerramiento','TEFC'],['Aislamiento','Clase F'],
 ['Rodamiento lado acople','6309-2Z-J/C3'],['Rodamiento lado opuesto','6308-2Z-J/C3']
]};

// Estado del levantamiento, para que la demo muestre el vacio real.
export const estadoLevantamiento={
 confirmado:[
  '15 bombas verificadas contra la leyenda de los PFD del proyecto D-18033',
  '10 placas de equipo leidas: 9 Hidromac 2196 y 1 Titan 4196',
  'Las designaciones de tamano responden a la norma ANSI/ASME B73.1',
  'Rodamientos de un motor: 6309-2Z-J/C3 y 6308-2Z-J/C3'
 ],
 pendiente:[
  'Que numero de serie corresponde a cada TAG del P&ID',
  'Sello mecanico: marca, modelo, diametro y materiales de cara',
  'Empaquetadura: seccion y numero de anillos',
  'O-rings: posicion, medida, material y codigo de bodega',
  'Catalogo Hidromac 2196 para confirmar el grupo de power end'
 ]
};

export const photoURL=id=>`/fotos/20261007_${id}.jpg`;
export const photo3URL=id=>`/fotos3/20261007_${id}.jpg`;
export const tankSpecs=[
 [-8.4,-6.8,1.65,6.7],[-4.2,-6.8,1.7,6.4],[0,-6.8,1.75,6.9],[4.3,-6.8,1.7,6.2],[8.5,-6.8,1.65,5.8],
 [-8.4,-2.5,1.55,4.8],[-4.2,-2.5,1.65,5.1],[0,-2.5,1.7,5.4],[4.3,-2.5,1.7,5.2],[8.5,-2.5,1.6,4.8],
 [-8.4,1.1,1.35,4.0],[-4.2,1.1,1.45,4.2],[0,1.1,1.5,4.4],[4.3,1.1,1.45,4.2],[8.5,1.1,1.35,4.0]
];
export function exterior(T,scale=1,variant='lf'){
 const g=new T.Group();
 const mat=(c,m=.25)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:.58});
 const blue=mat(variant==='titan'?0x2a6592:0x2469a8),orange=mat(0xc77a33),steel=mat(0xa6b9b7,.8),red=mat(0x995f52),dark=mat(0x333e44),black=mat(0x20272a);
 const large=variant==='mto',pumpK=large?1.2:1,motorK=large?1.15:1;
 function mesh(geo,m,x,y,z){const o=new T.Mesh(geo,m);o.position.set(x,y,z);g.add(o);return o;}
 function box(w,h,d,m,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,x,y,z);}
 function tube(r,h,m,x,y,z,axis='z'){const o=mesh(new T.CylinderGeometry(r,r,h,32),m,x,y,z);if(axis==='z')o.rotation.x=Math.PI/2;return o;}
 box(.12,.14,2.9,dark,-.48,.12,0);box(.12,.14,2.9,dark,.48,.12,0);
 for(const z of [-1.25,1.25])box(1.18,.08,.18,dark,0,.08,z);
 box(.72*pumpK,.18,.62*pumpK,blue,0,.28,-.66);
 tube(.43*pumpK,.42*pumpK,blue,0,.72,-.82);tube(.47*pumpK,.075,blue,0,.72,-.82);
 tube(.18*pumpK,.44,blue,0,.72,-1.18);tube(.31*pumpK,.11,steel,0,.72,-1.43);
 tube(.145*pumpK,.52,blue,.12,1.08,-.77,'y');tube(.26*pumpK,.10,steel,.12,1.38,-.77,'y');
 for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(.025,.14,black,Math.cos(a)*.255*pumpK,.72+Math.sin(a)*.255*pumpK,-1.48);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;tube(.023,.13,black,.12+Math.cos(a)*.205*pumpK,1.38,-.77+Math.sin(a)*.205*pumpK,'y');}
 tube(.2,.55,blue,0,.68,-.29);tube(.27,.48,orange,0,.68,.17);
 for(let i=0;i<9;i++)tube(.276,.016,dark,0,.68,-.03+i*.045);
 tube(.32*motorK,.88,dark,0,.65,.83);tube(.34*motorK,.12,black,0,.65,1.34);box(.46,.2,.36,dark,0,1.02,.78);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box(.035,.045,.76,dark,Math.cos(a)*.33*motorK,.65+Math.sin(a)*.33*motorK,.83);}
 // Cubierta abierta por debajo, sobre motor; no una caja que sustituya al motor.
 box(.035,.72,1.05,red,-.55,1.03,.77);box(.035,.72,1.05,red,.55,1.03,.77);
 const roof=box(1.15,.045,1.13,red,0,1.4,.77);roof.rotation.x=-.12;
 for(const x of [-.54,.54])for(const z of [.26,1.28])box(.045,.7,.045,dark,x,.38,z);
 g.scale.setScalar(scale);g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;
}
export function sector(T){
 const root=new T.Group();const material=c=>new T.MeshStandardMaterial({color:c,roughness:.8,metalness:.15});
 const concrete=material(0xb3afa0),wall=material(0xe0ded4),metal=material(0x98a5a7),blue=material(0x364e62);
 function box(w,h,d,m,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);root.add(o);return o;}
 box(32,.15,27,concrete,0,-.2,-1);box(26,.22,4.8,concrete,0,-.02,5.6);
 box(24,1.05,.18,wall,0,.48,2.35);box(24,1.05,.18,wall,0,.48,-9);box(.18,1.05,11.35,wall,-12,.48,-3.32);box(.18,1.05,11.35,wall,12,.48,-3.32);
 // Quince tanques observados en las vistas elevadas; proporciones todavía estimadas.
 for(const [x,z,r,h] of tankSpecs){
  const tank=new T.Mesh(new T.CylinderGeometry(r,r,h,48),metal);tank.position.set(x,h/2,z);root.add(tank);
  for(let y=1;y<h;y+=1.4){const band=new T.Mesh(new T.TorusGeometry(r,.018,6,48),metal);band.rotation.x=Math.PI/2;band.position.set(x,y,z);root.add(band);}
  const roof=new T.Mesh(new T.CylinderGeometry(.18,r,.28,48),metal);roof.position.set(x,h+.14,z);root.add(roof);
  const hatch=new T.Mesh(new T.CylinderGeometry(.28,.28,.08,28),metal);hatch.position.set(x+r*.35,h+.33,z+r*.08);root.add(hatch);
  const vent=new T.Mesh(new T.CylinderGeometry(.055,.055,.36,14),blue);vent.position.set(x-r*.28,h+.46,z-r*.08);root.add(vent);
 }
 for(const p of photoPumps){
  const side=p.grupo==='lateral'||p.grupo==='derecho';
  box(side?3.1:1.7,.16,side?1.7:3.1,concrete,p.x,.17,p.z);
 }
 root.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});return root;
}
