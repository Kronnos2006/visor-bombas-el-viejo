// Modelo de referencia de mantenimiento. Escala visual arbitraria, sin cotas de compra.
// La organización del extremo húmedo toma como referencia el despiece e-SH de Xylem.
export function sectorShellGeometry(T,{inner,outer,length,start=0,end=Math.PI/2,steps=24}){
 const positions=[],groups=[];
 const point=(x,r,a)=>[x,r*Math.cos(a),r*Math.sin(a)];
 const quad=(a,b,c,d)=>positions.push(...a,...b,...c,...a,...c,...d);
 const surface=(material,fn)=>{const first=positions.length/3;fn();groups.push({start:first,count:positions.length/3-first,material});};
 const left=-length/2,right=length/2;
 surface(0,()=>{for(let i=0;i<steps;i++){const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;quad(point(left,outer,a),point(right,outer,a),point(right,outer,b),point(left,outer,b));}});
 surface(1,()=>{for(let i=0;i<steps;i++){const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;quad(point(left,inner,b),point(right,inner,b),point(right,inner,a),point(left,inner,a));}});
 surface(1,()=>{for(let i=0;i<steps;i++){const a=start+(end-start)*i/steps,b=start+(end-start)*(i+1)/steps;quad(point(left,inner,a),point(left,outer,a),point(left,outer,b),point(left,inner,b));quad(point(right,inner,b),point(right,outer,b),point(right,outer,a),point(right,inner,a));}});
 surface(1,()=>{quad(point(left,inner,start),point(right,inner,start),point(right,outer,start),point(left,outer,start));quad(point(left,outer,end),point(right,outer,end),point(right,inner,end),point(left,inner,end));});
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
 for(const group of groups)geometry.addGroup(group.start,group.count,group.material);
 geometry.computeVertexNormals();geometry.computeBoundingBox();return geometry;
}

export function buildPumpModel(T,variant='lf'){
 const compact=variant==='goulds';
 const positions=[-2.2,-1.67,-2.15,-1.6,-1.27,-1.3,0,.1,1.8,compact?.65:3.25];
 const materials={
  paint:new T.MeshStandardMaterial({color:compact?0x9ba9ad:0x608d7e,metalness:compact?.82:.35,roughness:.42,side:T.DoubleSide}),
  steel:new T.MeshStandardMaterial({color:0xbfcbd1,metalness:.92,roughness:.25,side:T.DoubleSide}),
  dark:new T.MeshStandardMaterial({color:0x253238,metalness:.65,roughness:.5,side:T.DoubleSide}),
  rubber:new T.MeshStandardMaterial({color:0x22272a,metalness:0,roughness:.82}),
  copper:new T.MeshStandardMaterial({color:0xba713b,metalness:.85,roughness:.33}),
  motor:new T.MeshStandardMaterial({color:0x375d64,metalness:.45,roughness:.45,side:T.DoubleSide})
 };
 const root=new T.Group(),components=[];
 function mesh(group,geometry,material,name,x=0,y=0,z=0){
  const object=new T.Mesh(geometry,Array.isArray(material)?material.map(m=>m.clone()):material.clone());
  object.position.set(x,y,z);object.name=name;object.userData.subcomponent=name;group.add(object);return object;
 }
 function cylinder(group,r,length,material,name,x=0,y=0,z=0,axis='x',segments=48){
  const object=mesh(group,new T.CylinderGeometry(r,r,length,segments),material,name,x,y,z);
  if(axis==='x')object.rotation.z=Math.PI/2;return object;
 }
 function torus(group,r,tube,material,name,x=0,y=0,z=0){const object=mesh(group,new T.TorusGeometry(r,tube,10,64),material,name,x,y,z);object.rotation.y=Math.PI/2;return object;}
 function box(group,x,y,z,material,name,px=0,py=0,pz=0){return mesh(group,new T.BoxGeometry(x,y,z),material,name,px,py,pz);}
 function shell(group,inner,outer,length,material,name,x=0,{cover=true}={}){
  const assembly=new T.Group();assembly.position.x=x;group.add(assembly);
  for(let quarter=0;quarter<4;quarter++){
   const object=mesh(assembly,sectorShellGeometry(T,{inner,outer,length,start:quarter*Math.PI/2,end:(quarter+1)*Math.PI/2}),[material,materials.steel],name);
   object.userData.anatomyCover=cover;object.userData.quarterShell=cover;object.userData.removableQuarter=cover&&quarter===0;
  }
  return assembly;
 }
 function bolts(group,r,x,count=8){for(let i=0;i<count;i++){const a=i*Math.PI*2/count;const bolt=cylinder(group,.052,.1,materials.steel,'Tornillo y arandela',x,r*Math.cos(a),r*Math.sin(a),'x',6);if(a>=0&&a<Math.PI/2)bolt.userData.removableQuarter=true;torus(group,.063,.012,materials.steel,'Arandela',x-.045,r*Math.cos(a),r*Math.sin(a));}}
 function bearing(group,x,name){
  shell(group,.125,.17,.16,materials.steel,'Pista interior · '+name,x,{cover:false});
  shell(group,.255,.3,.16,materials.steel,'Pista exterior · '+name,x,{cover:false});
  for(let i=0;i<10;i++){const a=i*Math.PI/5;mesh(group,new T.SphereGeometry(.047,12,8),materials.steel,'Bola del rodamiento · '+name,x,.215*Math.cos(a),.215*Math.sin(a));}
  torus(group,.215,.012,materials.copper,'Jaula del rodamiento · '+name,x-.065);
 }
 for(let index=0;index<10;index++){
  const group=new T.Group();group.userData={index,base:positions[index]};group.position.x=positions[index];root.add(group);components.push(group);
 }
 const [casing,gasket,impeller,plate,chamber,seal,shaft,frame,coupling,motor]=components;
 // Cuerpo hueco y bridas abiertas. Su cavidad contiene el impulsor en vista de conjunto.
 shell(casing,.99,1.15,1.0,materials.paint,'Pared de la voluta');
 shell(casing,.37,1.13,.09,materials.paint,'Frente de carcasa con abertura de succión',-.51);
 shell(casing,.36,.46,.56,materials.paint,'Conducto de succión',-.81);
 shell(casing,.36,.7,.12,materials.steel,'Brida de succión',-1.13);bolts(casing,.56,-1.21);
 const discharge=shell(casing,.27,.38,.8,materials.paint,'Conducto de descarga');discharge.position.set(.08,1.12,0);discharge.rotation.z=Math.PI/2;
 const flange=shell(casing,.27,.55,.1,materials.steel,'Brida de descarga');flange.position.set(.08,1.53,0);flange.rotation.z=Math.PI/2;
 box(casing,.55,.55,.24,materials.paint,'Pata de carcasa',0,-1.12,.7);box(casing,.55,.55,.24,materials.paint,'Pata de carcasa',0,-1.12,-.7);
 torus(gasket,1.015,.033,materials.rubber,'Junta de la carcasa');
 // Álabes curvos con volumen, cubo, chaveta y fijación.
 cylinder(impeller,.87,.08,materials.steel,'Disco posterior del impulsor',.14);
 shell(impeller,.135,.25,.3,materials.steel,'Cubo del impulsor',-.02,{cover:false});
 for(let blade=0;blade<6;blade++){
  const shape=new T.Shape();
  const edge=(offset,reverse=false)=>{for(let k=0;k<=18;k++){const i=reverse?18-k:k,t=i/18,r=.23+.62*t,a=blade*Math.PI/3+.72*t+offset;const y=r*Math.cos(a),z=r*Math.sin(a);if(k===0&&offset<0)shape.moveTo(y,z);else shape.lineTo(y,z);}};
  edge(-.035);edge(.035,true);shape.closePath();
  const bladeMesh=mesh(impeller,new T.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:true,bevelSize:.008,bevelThickness:.008,bevelSegments:2,steps:1}),materials.steel,'Álabe curvo del impulsor');
  bladeMesh.rotation.y=Math.PI/2;bladeMesh.position.x=-.15;
 }
 cylinder(impeller,.16,.11,materials.steel,'Tuerca de fijación del impulsor',-.24,0,0,'x',6);
 box(impeller,.15,.035,.05,materials.steel,'Chaveta del impulsor',0,.14,0);
 shell(plate,.145,1.14,.16,materials.paint,'Tapa posterior con paso de eje');bolts(plate,1.02,.11);
 shell(chamber,.38,.54,.58,materials.paint,'Pared de cámara de sello');
 const flush=shell(chamber,.05,.09,.2,materials.steel,'Conexión de lavado');flush.rotation.z=Math.PI/2;flush.position.y=.61;
 if(compact)shell(chamber,.38,.62,.53,materials.paint,'Adaptador del motor · montaje directo',.55);
 // Par de caras, fuelle y resorte visibles al retirar el cuarto de la cámara.
 shell(seal,.13,.26,.085,materials.dark,'Cara estacionaria',-.17,{cover:false});
 shell(seal,.13,.26,.08,materials.steel,'Cara rotativa',-.08,{cover:false});
 shell(seal,.135,.205,.2,materials.rubber,'Fuelle elastomérico',.08,{cover:false});
 torus(seal,.155,.018,materials.rubber,'O-ring del eje',-.22);torus(seal,.27,.018,materials.rubber,'Junta del asiento',-.17);
 const springPoints=[];for(let i=0;i<=240;i++){const t=i/240,a=t*Math.PI*14;springPoints.push(new T.Vector3(.02+t*.3,.24*Math.cos(a),.24*Math.sin(a)));}
 mesh(seal,new T.TubeGeometry(new T.CatmullRomCurve3(springPoints),240,.017,8,false),materials.steel,'Resorte helicoidal del sello');
 shell(seal,.13,.29,.055,materials.steel,'Retenedor del resorte',.33,{cover:false});
 cylinder(shaft,.115,compact?3.2:4.35,materials.steel,'Eje continuo',compact?-1:-.18);
 cylinder(shaft,.14,1.25,materials.steel,'Escalón de apoyo del eje',.17);
 shell(shaft,.116,.151,.62,materials.steel,'Camisa de eje',-1.25,{cover:false});
 box(shaft,.3,.024,.06,materials.steel,'Chaveta del acople',1.51,.125,0);
 shell(frame,.34,.5,2.2,materials.paint,'Carcasa hueca de rodamientos');bearing(frame,-.64,'delantero');bearing(frame,.74,'trasero');
 shell(frame,.125,.48,.08,materials.paint,'Tapa de rodamiento',1.15);bolts(frame,.39,1.22,6);
 box(frame,.9,.75,.9,materials.paint,'Pedestal de rodamientos',.1,-.84,0);
 cylinder(frame,.09,.09,materials.steel,'Tapón de lubricación',0,.54,0,'y');
 shell(coupling,.13,.34,.23,materials.steel,'Cubo del acople · bomba',-.32,{cover:false});
 shell(coupling,.13,.34,.23,materials.steel,'Cubo del acople · motor',.32,{cover:false});
 shell(coupling,.14,.25,.4,materials.dark,'Espaciador del acople',0,{cover:false});
 torus(coupling,.27,.042,materials.rubber,'Elemento flexible del acople',-.15);torus(coupling,.27,.042,materials.rubber,'Elemento flexible del acople',.15);
 bolts(coupling,.27,-.42,6);bolts(coupling,.27,.42,6);
 // El motor tiene cubiertas huecas, estator, bobinado, rotor y rodamientos internos.
 const motorLength=compact?2.2:1.8;
 shell(motor,.53,.66,motorLength,materials.motor,'Carcasa del motor');
 for(let i=0;i<20;i++){const a=i*Math.PI/10;const fin=box(motor,motorLength,.09,.045,materials.motor,'Aleta de refrigeración',0,.68*Math.cos(a),.68*Math.sin(a));fin.rotation.x=a;fin.userData.removableQuarter=a<Math.PI/2;fin.userData.anatomyCover=true;fin.userData.quarterShell=true;}
 // Seccionado de referencia del estator para dejar ver el rotor al retirar 1/4.
 shell(motor,.33,.49,motorLength*.82,materials.dark,'Paquete de chapas del estator');
 for(let i=0;i<12;i++){
  const a=i*Math.PI/6,L=motorLength*.38;
  const p=(x,t)=>new T.Vector3(x,.415*Math.cos(a)-t*Math.sin(a),.415*Math.sin(a)+t*Math.cos(a));
  const path=new T.CatmullRomCurve3([p(-L,-.035),p(L,-.035),p(L+.12,0),p(L,.035),p(-L,.035),p(-L-.12,0)],true);
  const winding=mesh(motor,new T.TubeGeometry(path,64,.017,6,true),materials.copper,'Bobina de cobre del estator');
  winding.userData.removableQuarter=a<Math.PI/2;winding.userData.anatomyCover=true;winding.userData.quarterShell=true;
 }
 cylinder(motor,.28,motorLength*.78,materials.steel,'Rotor del motor');cylinder(motor,.105,motorLength+.75,materials.steel,'Eje del motor');
 bearing(motor,-motorLength/2-.04,'motor delantero');bearing(motor,motorLength/2+.04,'motor trasero');
 shell(motor,.125,.66,.16,materials.motor,'Escudo delantero del motor',-motorLength/2);
 shell(motor,.125,.66,.16,materials.motor,'Escudo trasero del motor',motorLength/2);
 cylinder(motor,.19,.07,materials.dark,'Cubo del ventilador',motorLength/2+.21);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;const fan=box(motor,.06,.38,.065,materials.dark,'Aspa del ventilador',motorLength/2+.23,.27*Math.cos(a),.27*Math.sin(a));fan.rotation.x=a;}
 shell(motor,.54,.68,.34,materials.motor,'Cubierta del ventilador',motorLength/2+.25);
 const terminal=box(motor,.48,.33,.45,materials.motor,'Caja de conexiones',0,.83,-.12);terminal.userData.removableQuarter=true;
 box(motor,motorLength*.8,.19,1.05,materials.motor,'Pies del motor',0,-.77,0);
 if(compact){frame.visible=false;coupling.visible=false;}
 for(const group of components){
  group.userData.subcomponents=[...new Set(group.children.flatMap(child=>{const names=[];child.traverse(object=>{if(object.isMesh)names.push(object.name);});return names;}))];
  group.traverse(object=>{if(object.isMesh)object.userData.part=group.userData.index;});
 }
 box(root,compact?5.8:8.9,.14,2.05,materials.dark,'Bancada general',compact?-1:0.65,-1.47,0);
 root.userData.referenceOnly=true;root.updateMatrixWorld(true);
 for(const material of Object.values(materials))material.dispose();
 return {root,components};
}
