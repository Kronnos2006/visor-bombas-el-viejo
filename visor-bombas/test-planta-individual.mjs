import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from './public/vendor/three.module.js';
import {cajaVisible,extraerBomba} from './public/planta-encuadre.js';
import {clavePendiente} from './public/ficha-pendiente.js';
import {SECTORES_INT,SIEMPRE,CUBIERTA,sectorDe,torreAIntegrado,ubicarTanques,visibleCon,cajaSector} from './public/planta-integrada.js';
const groups=JSON.parse(await readFile(new URL('./public/modelos/bombas-individuales.json',import.meta.url),'utf8'));
const source=JSON.parse(await readFile(new URL('./public/modelos/planta-integrada.json',import.meta.url),'utf8'));

test('extraer una bomba conserva sus metros y material sin incluir otra bomba del mismo grupo',()=>{
 const scene=new THREE.Group(),group=new THREE.Group();
 group.userData={bomba:'Dos bombas',sector:'REF Agua y enfriamiento'};group.position.set(3,0,2);scene.add(group);
 const first=new THREE.BoxGeometry(2,1,3).toNonIndexed(),second=new THREE.BoxGeometry(2,1,3).toNonIndexed();second.translate(10,0,0);
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(first.attributes.position.array.length+second.attributes.position.array.length);
 positions.set(first.attributes.position.array);positions.set(second.attributes.position.array,first.attributes.position.array.length);
 geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({color:0x123456}),mesh=new THREE.Mesh(geometry,material);group.add(mesh);
 const originalPositions=Array.from(positions),originalColor=material.color.getHex(),originalPosition=group.position.toArray();
 // El nombre individual difiere del nombre del grupo exportado; la referencia mantiene ambos.
 const reference={nombre:'Dos bombas · Bomba 1',grupo:'Dos bombas',sector:group.userData.sector,min:[2,-.5,.5],max:[4,.5,3.5]};
 const extracted=extraerBomba(THREE,scene,reference);assert.ok(extracted);
 assert.equal(extracted.children.length,1);assert.equal(extracted.children[0].geometry.attributes.position.count,first.attributes.position.count);
 const bounds=cajaVisible(THREE,extracted);
 assert.deepEqual(bounds.min.toArray(),[-1,0,-1.5]);assert.deepEqual(bounds.max.toArray(),[1,1,1.5]);
 assert.deepEqual(extracted.userData.dimensiones,[2,1,3]);assert.deepEqual(extracted.scale.toArray(),[1,1,1]);
 assert.notEqual(extracted.children[0].material,material);assert.notEqual(extracted.children[0].geometry,geometry);
 extracted.children[0].material.color.setHex(0xff0000);
 assert.equal(material.color.getHex(),originalColor);assert.deepEqual(Array.from(positions),originalPositions);assert.deepEqual(group.position.toArray(),originalPosition);
 assert.equal(mesh.parent,group);assert.equal(group.parent,scene);
 assert.equal(extraerBomba(THREE,scene,{...reference,sector:'otro sector'}),null);
 assert.equal(extraerBomba(THREE,scene,{...reference,grupo:'otro conjunto'}),null);
});

test('el encuadre usa solo geometría visible, excluyendo proxies y pisos salvo petición explícita',()=>{
 const root=new THREE.Group();
 const cube=x=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());mesh.position.x=x;return mesh;};
 root.add(cube(0));
 const hidden=cube(100);hidden.visible=false;root.add(hidden);
 const proxy=cube(200);proxy.userData.hitProxy=true;root.add(proxy);
 const floor=cube(50);floor.userData.sector=SIEMPRE[0];root.add(floor);
 const hiddenParent=new THREE.Group();hiddenParent.visible=false;hiddenParent.add(cube(300));root.add(hiddenParent);
 const box=cajaVisible(THREE,root);
 assert.deepEqual(box.min.toArray(),[-.5,-.5,-.5]);assert.deepEqual(box.max.toArray(),[.5,.5,.5]);
 const reference=cajaVisible(THREE,root,{incluirReferencia:true});
 assert.deepEqual(reference.min.toArray(),[-.5,-.5,-.5]);assert.deepEqual(reference.max.toArray(),[50.5,.5,.5]);
 const ancestor=new THREE.Group();ancestor.add(root);ancestor.visible=false;
 assert.equal(cajaVisible(THREE,root).isEmpty(),true);
});

test('encuadrar una raíz girada y trasladada conserva la escala métrica y su posición mundial',()=>{
 const root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial());
 mesh.position.set(2,1,3);root.add(mesh);root.scale.setScalar(1);root.rotation.y=Math.PI/2;root.position.set(10,4,-7);
 const before={position:root.position.toArray(),rotation:root.rotation.toArray(),scale:root.scale.toArray()};
 const box=cajaVisible(THREE,root),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
 [1,1,1].forEach((v,i)=>assert.ok(Math.abs(size.getComponent(i)-v)<1e-12));
 [13,5,-9].forEach((v,i)=>assert.ok(Math.abs(center.getComponent(i)-v)<1e-12));
 assert.deepEqual(root.position.toArray(),before.position);assert.deepEqual(root.rotation.toArray(),before.rotation);assert.deepEqual(root.scale.toArray(),before.scale);
});
test('los conjuntos del modelo conservan cada bomba con caja individual en su sector',()=>{
 const expected=[1,1,1,1,3,2,2,2,3,1,1,4,1,1,5,1,1,3];
 assert.equal(groups.length,source.bombas.length);
 assert.deepEqual(groups.map(g=>g.bombas.length),expected);
 const keys=[];
 groups.forEach((g,i)=>{
  const original=source.bombas[i];assert.equal(g.nombre,original.nombre);assert.equal(g.sector,original.sector);assert.ok(sectorDe(g.sector));
  assert.ok(!('tag' in g),'la agrupación geométrica no asigna un TAG de equipo');
  g.bombas.forEach((box,j)=>{
   assert.ok(!('tag' in box),'una caja de selección no identifica el equipo instalado');
   for(let axis=0;axis<3;axis++){assert.ok(Number.isFinite(box.min[axis])&&Number.isFinite(box.max[axis]));assert.ok(box.min[axis]<box.max[axis]);assert.ok(box.min[axis]>=original.min[axis]-.02);assert.ok(box.max[axis]<=original.max[axis]+.02);}
   keys.push(clavePendiente({sector:g.sector,nombre:g.bombas.length>1?`${g.nombre} · Bomba ${j+1}`:g.nombre}));
   for(const other of g.bombas.slice(j+1))assert.ok(box.max[0]<other.min[0]||other.max[0]<box.min[0]||box.max[2]<other.min[2]||other.max[2]<box.min[2],'dos bombas no deben compartir el mismo espacio');
  });
 });
 assert.equal(keys.length,34);assert.equal(new Set(keys).size,34);
});

test('la alineación de torre conserva distancias en metros sin cambiar la escala',()=>{
 const points=[[0,0,0],[1,0,0],[0,1,0],[0,0,1],[15.4,25.3,22],[-3,.3,9]];
 const mapped=points.map(p=>torreAIntegrado(source.torre,...p));
 assert.deepEqual(mapped[0],[source.torre.x,source.torre.y,source.torre.z]);
 const distance=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]));
 mapped.forEach(p=>assert.ok(p.every(Number.isFinite)));
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)assert.ok(Math.abs(distance(points[i],points[j])-distance(mapped[i],mapped[j]))<1e-10);
});

test('todos los sectores fuente se pueden aislar con su caja sin perder pisos de referencia',()=>{
 const ids=SECTORES_INT.map(s=>s.id);assert.equal(new Set(ids).size,ids.length);
 for(const [name,box] of Object.entries(source.sectores)){
  if(SIEMPRE.includes(name)||name===CUBIERTA)continue;
  const id=sectorDe(name);assert.ok(id,`sector fuente sin catálogo: ${name}`);
  const aggregate=cajaSector(source,id);assert.ok(aggregate);
  for(let axis=0;axis<3;axis++){assert.ok(aggregate.min[axis]<=box.min[axis]);assert.ok(aggregate.max[axis]>=box.max[axis]);}
  assert.equal(visibleCon(name,null),true);
  for(const target of ids)assert.equal(visibleCon(name,target),target===id);
 }
 for(const id of ids){for(const floor of SIEMPRE)assert.equal(visibleCon(floor,id),true);assert.equal(visibleCon(CUBIERTA,id),false);}
 assert.equal(cajaSector(source,'desconocido'),null);
});

test('la colocación provisional de tanques conserva dimensiones mediante giro y traslado rígidos',async()=>{
 const {AREAS}=await import('./public/planta-general.js');
 const local={min:[-16,-.275,-14.5],max:[16,8,12.5]};
 const location=ubicarTanques(source,AREAS.find(a=>a.id==='tanques'),AREAS.find(a=>a.id==='torre'),local);
 assert.ok([location.x,location.y,location.z,location.giro].every(Number.isFinite));
 assert.equal(location.scale??1,1);
 assert.ok(Math.abs(location.giro-source.torre.giro)<1e-6);
 const c=Math.cos(location.giro),s=Math.sin(location.giro),corners=[];
 for(const x of [local.min[0],local.max[0]])for(const z of [local.min[2],local.max[2]])corners.push([c*x+s*z+location.x,-s*x+c*z+location.z]);
 const minX=Math.min(...corners.map(p=>p[0])),maxX=Math.max(...corners.map(p=>p[0])),minZ=Math.min(...corners.map(p=>p[1])),maxZ=Math.max(...corners.map(p=>p[1]));
 // La separación de presentación no acredita coordenadas reales ni exige ausencia de colisiones.
 const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 assert.ok(Math.abs(distance(corners[0],corners[1])-(local.max[2]-local.min[2]))<1e-10);
 assert.ok(Math.abs(distance(corners[0],corners[2])-(local.max[0]-local.min[0]))<1e-10);
 assert.equal(visibleCon('Sector de tanques',null),true);
 assert.equal(visibleCon('Sector de tanques','tanques'),true);
 assert.equal(visibleCon('Sector de tanques','torre'),false);
 assert.equal(visibleCon('DUSA','tanques'),false);
 const box={min:[minX,0,minZ],max:[maxX,8,maxZ]};
 assert.deepEqual(cajaSector({sectores:{'Sector de tanques':box}},'tanques'),box);
});
