// Acabados ilustrativos. Las dimensiones proceden del modelo que recibe cada detalle.
import {compactar} from './compactar.js';
export function herrajesBomba(T,root,identificar=mesh=>mesh){
 const materiales=new Map();
 const material=(color,options={})=>{
  const key=color+'|'+JSON.stringify(options);
  if(!materiales.has(key))materiales.set(key,new T.MeshStandardMaterial({color,metalness:.45,roughness:.48,...options}));
  return materiales.get(key);
 };
 const add=(geometry,color,x,y,z,options)=>{
  const mesh=identificar(new T.Mesh(geometry,material(color,options)));
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
 };
 const orientar=(mesh,axis)=>{if(axis==='x')mesh.rotation.y=Math.PI/2;else if(axis==='y')mesh.rotation.x=-Math.PI/2;return mesh;};
 const caja=(w,h,d,color,x,y,z,options)=>{
  const b=Math.min(.003,w*.1,h*.1,d*.1),shape=new T.Shape();
  shape.moveTo(-w/2+b,-h/2+b);shape.lineTo(w/2-b,-h/2+b);shape.lineTo(w/2-b,h/2-b);shape.lineTo(-w/2+b,h/2-b);shape.closePath();
  const geometry=new T.ExtrudeGeometry(shape,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,steps:1});
  geometry.translate(0,0,-(d-2*b)/2);
  return add(geometry,color,x,y,z,options);
 };
 const cil=(r,l,color,x,y,z,axis='z',options)=>{
  const mesh=add(new T.CylinderGeometry(r,r,l,40),color,x,y,z,options);
  if(axis==='z')mesh.rotation.x=Math.PI/2;else if(axis==='x')mesh.rotation.z=Math.PI/2;return mesh;
 };
 const aro=(outer,inner,depth,color,x,y,z,axis='z')=>{
  const shape=new T.Shape(),hole=new T.Path();shape.absarc(0,0,outer,0,Math.PI*2,false);hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);
  const geometry=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:32});geometry.translate(0,0,-depth/2);
  return orientar(add(geometry,color,x,y,z),axis);
 };
 const perno=(x,y,z,axis='y',radius=.013)=>{
  aro(radius*1.5,radius*.62,.003,0x87959c,x,y,z,axis);
  const head=add(new T.CylinderGeometry(radius,radius,.012,6),0xaebbc2,x,y,z,{metalness:.82,roughness:.28});
  if(axis==='z')head.rotation.x=Math.PI/2;else if(axis==='x')head.rotation.z=Math.PI/2;
  return head;
 };
 return {caja,cil,aro,perno};
}

export function motorDetallado(herramientas,color,x,y,z,r,l,{cuerpo=true}={}){
 const {caja,cil,aro,perno}=herramientas,metal=0x9ba8ae,oscuro=0x353d42;
 if(cuerpo){
  cil(r*.94,l,color,x,y,z);
  for(let i=0;i<20;i++){
   const angle=i*Math.PI/10,fin=caja(.009,.018,l*.77,color,x+Math.cos(angle)*r,y+Math.sin(angle)*r,z);
   fin.rotation.z=angle-Math.PI/2;
  }
 }
 for(const end of [-1,1]){
  cil(r*1.015,.035,color,x,y,z+end*l*.45);
  aro(r*.9,r*.81,.008,metal,x,y,z+end*l*.49);
  for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;perno(x+Math.cos(a)*r*.77,y+Math.sin(a)*r*.77,z+end*l*.51,'z',.009);}
 }
 cil(r*.93,.045,oscuro,x,y,z+l/2+.014);
 // Las aberturas oscuras y sus radios forman la rejilla de ventilación.
 for(let i=0;i<14;i++){
  const a=i*Math.PI/7,radio=caja(r*.59,.007,.004,metal,x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5,z+l/2+.039);
  radio.rotation.z=a;
 }
 aro(r*.94,r*.86,.012,metal,x,y,z+l/2+.04);cil(r*.22,.013,metal,x,y,z+l/2+.042);
 caja(r*.82,r*.66,r*.82,color,x+r*.86,y+r*.2,z-l*.06);
 caja(.008,r*.58,r*.72,metal,x+r*1.29,y+r*.2,z-l*.06);
 for(const sign of [-1,1])cil(.014,.035,oscuro,x+r*.87,y+r*.2,z-l*.06+sign*r*.49);
 for(const side of [-1,1]){
  caja(r*.34,.035,l*.62,color,x+side*r*.73,y-r*.94,z);
  caja(r*.36,.035,l*.62,0x68747b,x+side*r*.73,y-r*.94-.035,z);
  for(const end of [-1,1])perno(x+side*r*.73,y-r*.94+.024,z+end*l*.25);
 }
 // Placa sin datos técnicos inventados, con sus dos remaches.
 caja(r*.8,.003,l*.23,0x77858c,x,y+r*.99,z-l*.16,{metalness:.8,roughness:.25});
 for(const end of [-1,1])cil(.003,.004,metal,x+end*r*.31,y+r*1.01,z-l*.16,'y');
}

export function detallarBombaPasarela(T,scene){
 if(scene.userData.detallePasarela)return;
 const original=[];scene.traverse(o=>{if(o.isMesh&&o.userData.fbxId===1245188)original.push(o);});
 if(!original.length)return;
 scene.userData.detallePasarela=true;scene.updateWorldMatrix(true,true);
 const inverse=new T.Matrix4().copy(scene.matrixWorld).invert();
 for(const source of original){
  const {part,subcomponent,sector,bomba}=source.userData;
  const color=part===7?0x4d757b:part===9?0x7b858b:part===0?0x427f83:0xb6c0c4;
  source.material=source.material.clone();source.material.color.setHex(color);source.material.metalness=part===3?.78:.4;source.material.roughness=part===3?.3:.52;
  const box=new T.Box3().setFromObject(source).applyMatrix4(inverse),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
  const detail=new T.Group();detail.userData.sector=sector;scene.add(detail);
  const identificar=mesh=>{mesh.userData={sector,bomba,part,subcomponent,anatomyCover:part===3||part===9};mesh.name=subcomponent;return mesh;};
  const tools=herrajesBomba(T,detail,identificar);
  if(part===9){
   const r=size.z/2,l=size.x;
   for(const y of [box.min.y+r,box.max.y-r]){
    const local=new T.Group();local.position.set(center.x,y,center.z);local.rotation.y=-Math.PI/2;detail.add(local);
    motorDetallado(herrajesBomba(T,local,identificar),color,0,0,0,r,l,{cuerpo:false});
   }
  }
  if(part===3){
   const r=size.z/2;
   for(const y of [box.min.y+r,box.max.y-r])for(let i=0;i<6;i++){
    const a=i*Math.PI/3;tools.perno(box.max.x+.003,y+Math.cos(a)*r*.76,center.z+Math.sin(a)*r*.76,'x',.008);
   }
  }
  if(part===7){
   for(const x of [box.min.x+.035,box.max.x-.035])for(const z of [box.min.z+.035,box.max.z-.035])tools.perno(x,box.min.y+.024,z,'y',.01);
  }
  compactar(T,detail);detail.traverse(o=>{if(o.isMesh)identificar(o);});
 }
}
