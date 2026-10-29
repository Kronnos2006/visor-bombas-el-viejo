import {retirarAuxiliaresCalderas} from './retirar-auxiliares-calderas.js';
import {compactar} from './compactar.js';
// Correcciones visuales según Notes_261029_092331.pdf y confirmación del usuario.
// Proporciones de presentación: no son cotas de levantamiento ni diseño hidráulico.
export function cubiertaFotografica(T,body){
 const quitar=[];body.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===0x995f52)quitar.push(o);});
 quitar.forEach(o=>o.removeFromParent());
 const cover=new T.Group();cover.name='Cubierta marrón a dos aguas';
 const mat=new T.MeshStandardMaterial({color:0x995f52,roughness:.8,metalness:.25});
 const shape=new T.Shape();shape.moveTo(-.57,.54);shape.lineTo(.57,.54);shape.lineTo(.57,1.22);shape.lineTo(0,1.58);shape.lineTo(-.57,1.22);shape.closePath();
 const hole=new T.Path();hole.absarc(0,1.02,.17,0,Math.PI*2,true);shape.holes.push(hole);
 const face=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.035,bevelEnabled:false}),mat);face.position.z=.20;cover.add(face);
 for(const side of [-1,1]){const panel=new T.Mesh(new T.BoxGeometry(.035,.68,1.13),mat);panel.position.set(side*.57,.88,.78);cover.add(panel);
 const roof=new T.Mesh(new T.BoxGeometry(.68,.035,1.17),mat);roof.rotation.z=-side*Math.atan2(.36,.57);roof.position.set(side*.285,1.40,.78);cover.add(roof);}
 cover.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});body.add(cover);return cover;
}

export function conjuntoVertical(T){
 const root=new T.Group();root.name='Conjunto compartido de alimentación de calderas';
 const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.5,metalness:.55});
 const steel=mat(0xa8b2ad),blue=mat(0x315f91),green=mat(0x437d48),red=mat(0xb72e26);
 function box(w,h,d,m,x,y,z,parent=root){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o;}
 function pipe(r,h,m,x,y,z,axis='y',parent=root){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,20),m);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;o.position.set(x,y,z);parent.add(o);return o;}
 box(3.35,.12,1.35,blue,0,.06,0);
 const pumps=[];
 for(let i=0;i<3;i++){
 const x=(i-1)*1.05,p=new T.Group();p.name='Bomba vertical '+(i+1);root.add(p);pumps.push(p);
 box(.55,.10,.6,blue,x,.19,0,p);pipe(.16,.80,steel,x,.66,0,'y',p);pipe(.24,.45,i===0?blue:steel,x,1.35,0,'y',p);
 for(const y of [.3,.93,1.1,1.59])pipe(.21,.055,steel,x,y,0,'y',p);
 for(let n=0;n<12;n++){const a=n*Math.PI/6;box(.028,.36,.028,steel,x+Math.cos(a)*.245,1.35,Math.sin(a)*.245,p);}
 pipe(.065,1.65,green,x+.35,.95,.36);pipe(.065,.5,green,x+.15,.29,.36,'x');pipe(.065,.5,green,x+.15,1.76,.36,'x');box(.055,.38,.10,red,x+.35,1.43,.36);
 }
 for(const y of [.29,1.76])pipe(.09,3.25,green,0,y,.36,'x');
 root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});root.userData.presentationOnly=true;return {root,pumps};
}

// Se ejecuta DESPUÉS de asociar los TAG del exportador: nunca altera sus índices.
export function aplicarCambiosCampo(T,{scene,grupos,tankBodies,desplazamiento=[0,0,0],info,exterior,photoPumps}){
 if(scene.userData.cambiosCampo)return scene.userData.cambiosCampo;
 const result={cubiertas:0,retirados:[],conjuntosCalderas:1,bombasVerticales:3,fuente:'Notes_261029_092331.pdf',aproximado:true};
 result.removedMeshes=[];
 for(const [tag,body] of Object.entries(tankBodies)){
 const p=photoPumps.find(p=>p.tag===tag);if(!p)continue;
 body.updateWorldMatrix(true,true);const inv=new T.Matrix4().copy(body.matrixWorld).invert(),old=new T.Box3().setFromObject(body).applyMatrix4(inv);
 const removed=[];body.traverse(o=>{if(o.isMesh)removed.push(o);});for(const o of removed){result.removedMeshes.push(o);o.removeFromParent();}
 const model=exterior(T,scene.userData.blenderLocal?p.scale:1,p.variant);cubiertaFotografica(T,model);compactar(T,model);
 if(scene.userData.blenderLocal)model.rotation.y=p.rotation+info.torre.giro;
 model.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3()),target=old.getCenter(new T.Vector3());
 model.position.set(target.x-center.x,old.min.y-bounds.min.y,target.z-center.z);
 model.traverse(o=>{if(o.isMesh){o.userData.tag=tag;o.userData.sector='Sector de tanques';}});body.add(model);result.cubiertas++;
 }
 const limpieza=retirarAuxiliaresCalderas(T,scene);result.retirados=limpieza.removed.map(x=>x.nombre);result.auxiliaresRetirados=limpieza.removed.map(x=>x.id);
 const data=grupos.find(g=>g.nombre==='Conjunto compartido de bombas verticales de calderas');
 if(data){const {root,pumps}=conjuntoVertical(T);root.userData.sector='REF Detalle';root.userData.bomba=data.nombre;root.rotation.y=data.giro||0;
 const center=data.bombas[1].min.map((v,i)=>(v+data.bombas[1].max[i])/2);root.position.set(center[0],data.bombas[1].min[1]-.14,center[2]);root.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{sector:data.sector,bomba:data.nombre});});scene.add(root);scene.updateWorldMatrix(true,true);
 const inverse=new T.Matrix4().copy(scene.matrixWorld).invert();pumps.forEach((p,i)=>{const b=new T.Box3().setFromObject(p).applyMatrix4(inverse);data.bombas[i]={min:b.min.toArray(),max:b.max.toArray()};});compactar(T,root);root.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{sector:data.sector,bomba:data.nombre});});}
 const water=grupos.find(g=>g.nombre==='Bombas adicionales de tanques de agua');
 if(water)for(const b of water.bombas){const model=compactar(T,exterior(T,.55,'lf'));model.position.set((b.min[0]+b.max[0])/2,b.min[1],(b.min[2]+b.max[2])/2);model.traverse(o=>{if(o.isMesh)Object.assign(o.userData,{sector:water.sector,bomba:water.nombre});});scene.add(model);scene.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(model).applyMatrix4(new T.Matrix4().copy(scene.matrixWorld).invert());b.min=box.min.toArray();b.max=box.max.toArray();}
 // Separación adicional de presentación entre bloque de agua y torre de enfriamiento.
 const moved=[];scene.traverse(o=>{if(o.isMesh&&o.userData.sector==='REF Agua y enfriamiento'&&/Equipo unico grande|Dos ventiladores superiores|Base continua equipo unico|Colectores verdes|Soportes de colectores|Tres bombas de circulacion|Canaleta con rejilla/.test(o.userData.original_name||o.name))moved.push(o);});
 for(const o of moved)o.position.x+=3;
 for(const g of grupos)if(moved.length&&g.sector==='REF Agua y enfriamiento'&&/Tres bombas de circulacion|Canaleta con rejilla/.test(g.nombre))for(const b of g.bombas)for(const k of ['min','max'])b[k][0]+=3;
 result.separacionVisualAdicional=moved.length?3:0;result.desplazamiento=desplazamiento;
 scene.updateWorldMatrix(true,true);const inv=new T.Matrix4().copy(scene.matrixWorld).invert();
 for(const sector of ['REF Detalle','REF Plano ampliacion','REF Agua y enfriamiento']){const box=new T.Box3();scene.traverse(o=>{if(o.isMesh&&o.userData.sector===sector)box.union(new T.Box3().setFromObject(o).applyMatrix4(inv));});if(!box.isEmpty())info.sectores[sector]={min:box.min.toArray(),max:box.max.toArray()};}
 scene.userData.cambiosCampo={...result,removedMeshes:undefined};return result;
}
