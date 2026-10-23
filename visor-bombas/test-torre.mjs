import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from './public/vendor/three.module.js';
import {torrePumps,torreSinTag} from './public/equipos-torre.js';
import {photoPumps,plantPumps} from './public/sector-fotos.js';
import {buildTorre,aplicarSeccion,SECCIONES,EJES_X,EJES_Z,seccionDe,rangoSeccion,dentroDeSeccion} from './public/torre-model.js';
import {AREAS,PENDIENTES,pxAMundo} from './public/planta-general.js';
import {simParams,createPumpModel} from './public/pump-sim.js';
import {readPump,handler} from './server.mjs';
import {Readable} from 'node:stream';
import {rangoTemperaturaTrabajo,temperaturaTrabajo} from './public/temperatura-trabajo.js';

test('la torre tiene las 16 bombas (B9 sin uso) anotadas en el croquis, sin repetir TAG del sector',()=>{
 assert.deepEqual(torrePumps.map(p=>p.tag),['B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12','B17','B18','B19','B20','B21']);
 assert.equal(plantPumps.length,photoPumps.length+16);
 assert.equal(torrePumps.find(p=>p.tag==='B9').enUso,false);
 assert.ok(torrePumps.filter(p=>p.tag!=='B9').every(p=>p.enUso));
 assert.equal(new Set(plantPumps.map(p=>p.tag)).size,plantPumps.length);
 for(const p of torrePumps){
  assert.equal(p.areaId,'torre');assert.equal(p.source,`00-Proyecto/equipos/${p.tag}.md`);
  assert.ok(p.x>EJES_X[1]&&p.x<EJES_X[5]&&p.z>EJES_Z.A&&p.z<EJES_Z.E,`${p.tag} dentro de la planta de la torre`);
  assert.match(p.photo,/^\/referencias\/torre\//);
 }
 assert.equal(torreSinTag.length,1);
});
test('datos de las fichas: B11 Vinaza 2X3-8 MTO, B17 Durco, B20 agua',()=>{
 const t=tag=>torrePumps.find(p=>p.tag===tag);
 assert.equal(t('B11').size,'2X3-8 MTO');assert.equal(t('B11').variant,'mto');assert.equal(t('B17').marca,'DURCO');assert.equal(t('B20').servicio,'Agua');
});
test('modelo DUSA 3D: cada piso tiene estructura, se aísla por recorte y las bombas no chocan',async()=>{
 const {readFile,stat}=await import('node:fs/promises');
 assert.ok((await stat(new URL('./public/modelos/torre-dusa.glb',import.meta.url))).size<4e6,'GLB liviano para la web');
 const partes=JSON.parse(await readFile(new URL('./public/modelos/torre-dusa.json',import.meta.url),'utf8'));
 for(const s of SECCIONES){const [lo,hi]=rangoSeccion(s.id);assert.ok(partes.some(o=>o.max[1]>=lo&&o.min[1]<=hi&&o.cat!=='concreto'),`estructura en ${s.id}`);}
 assert.ok(partes.some(o=>/^Columna Vinaza/.test(o.nombre))&&partes.some(o=>/^Columna Rectificadora HO/.test(o.nombre)));
 assert.ok(!partes.some(o=>/^(Bomba|Tubería|Conexiones)/.test(o.nombre)),'sin bombas ni tuberías del FBX');
 assert.deepEqual(partes.filter(o=>['1245301','1245302'].includes(o.id)).map(o=>o.cat),['techo-superior','techo-superior'],'cubiertas superiores aparte (ocultas por defecto)');
 const baja=partes.find(o=>o.id==='1245303');assert.ok(baja&&baja.min[1]>10&&baja.max[1]<11.5,'cubierta baja conservada');
 assert.ok(Math.max(...partes.filter(o=>o.cat!=='techo-superior').map(o=>o.max[1]))<25.5,'sin el techo superior, la parte alta queda abierta');
 assert.equal(seccionDe(.3),'n1');assert.equal(seccionDe(5.3),'n21');assert.equal(seccionDe(20.3),'n5');assert.equal(seccionDe(25.4),'techo');
 assert.ok(torrePumps.every(p=>seccionDe(p.y)==='n1'));
 const choques=[...torrePumps,...torreSinTag.map(s=>({tag:'Sin TAG',...s}))].flatMap(p=>partes.filter(o=>!['concreto','rejilla'].includes(o.cat)&&o.min[1]<1.6&&o.max[0]>p.x-.42&&o.min[0]<p.x+.42&&o.max[2]>p.z-1.12&&o.min[2]<p.z+1.04).map(o=>p.tag+' ↔ '+o.nombre));
 assert.deepEqual(choques,[]);
 const {objetos,listo}=buildTorre(THREE);await listo;assert.equal(objetos.length,0,'sin cargador no se pide el GLB');
 aplicarSeccion([],'n4');assert.ok(dentroDeSeccion('n4',16)&&!dentroDeSeccion('n4',22)&&dentroDeSeccion(null,99));
});
test('áreas sobre el plano de sitio: torre en el área 2, junto al sector de tanques',()=>{
 const torre=AREAS.find(a=>a.id==='torre'),tanques=AREAS.find(a=>a.id==='tanques');
 const [x2,z2]=pxAMundo(150,310);
 assert.ok(Math.hypot(torre.pos[0]-x2,torre.pos[1]-z2)<25);
 const d=Math.hypot(torre.pos[0]-tanques.pos[0],torre.pos[1]-tanques.pos[1]);assert.ok(d>35&&d<60,"áreas separadas pero cercanas: "+d);
});
test('los cinco edificios FBX siguen el orden corregido y la bodega mira a la oficina',async()=>{
 const {readFile}=await import('node:fs/promises');
 const expected=[['area1','oficina-administrativa'],['area7','bodega-pequena'],['area4','banos'],['area5','cuarto-electrico'],['area6','bodega-quimicos']];
 assert.deepEqual(PENDIENTES,[]);
 for(const [id,name] of expected){
  const area=AREAS.find(a=>a.id===id);assert.ok(area,`${id} en menú`);
  assert.match(area.modelo,new RegExp(`${name}\\.glb$`));
  assert.equal(area.pos.length,2);
  const file=new URL(`./public${area.modelo}`,import.meta.url);
  const header=await readFile(file);assert.equal(header.toString('ascii',0,4),'glTF');
  assert.ok(header.length>10000,`${name} tiene geometría`);
 }
 const fila=expected.slice(1).map(([id])=>AREAS.find(a=>a.id===id));
 const ejeX=a=>a.pos[0]*Math.cos(fila[1].giro)-a.pos[1]*Math.sin(fila[1].giro);
 for(let i=1;i<fila.length;i++){
  const distancia=ejeX(fila[i-1])-ejeX(fila[i]);
  assert.ok(distancia>(fila[i-1].huella[0]+fila[i].huella[0])/2,`sin solape entre ${fila[i-1].id} y ${fila[i].id}`);
 }
 const [bodega]=fila,oficina=AREAS.find(a=>a.id==='area1');
 const haciaOficina=[oficina.pos[0]-bodega.pos[0],oficina.pos[1]-bodega.pos[1]];
 const frente=[Math.cos(bodega.giro),-Math.sin(bodega.giro)];
 assert.ok((frente[0]*haciaOficina[0]+frente[1]*haciaOficina[1])/Math.hypot(...haciaOficina)>.98);
 const torre=AREAS.find(a=>a.id==='torre'),quimicos=fila.at(-1);
 const delta=[quimicos.pos[0]-torre.pos[0],quimicos.pos[1]-torre.pos[1]];
 const profundidad=delta[0]*Math.sin(torre.giro)+delta[1]*Math.cos(torre.giro);
 assert.ok(-1.3-(profundidad+quimicos.huella[1]/2)>3,'torre separada de químicos');
});
test('modelo integrado: GLB comprimido, sectores Revit y alineación de torre',async()=>{
 const {readFile}=await import('node:fs/promises');
 const a=AREAS.find(x=>x.id==='integrado');assert.ok(a,'en el menú');assert.equal(a.aparte,true);
 assert.match(a.modelo,/planta-integrada\.glb$/);
 const glb=await readFile(new URL(`./public${a.modelo}`,import.meta.url));
 assert.equal(glb.toString('ascii',0,4),'glTF');assert.ok(glb.length>1e6&&glb.length<12e6,'peso razonable: '+glb.length);
 assert.ok(glb.includes('EXT_meshopt_compression'),'usa meshopt (el visor lo decodifica)');
 const app=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
 assert.match(app,/new GLTFLoader\(\)\.setMeshoptDecoder\(MeshoptDecoder\)\.loadAsync\(area\.modelo\)/);
 assert.match(app,/id==='planta'\?!AREA\(k\)\?\.aparte:k===id/,'oculto en la vista general');
 const info=JSON.parse(await readFile(new URL('./public/modelos/planta-integrada.json',import.meta.url),'utf8'));
 const {SECTORES_INT,SIEMPRE,CUBIERTA,torreAIntegrado,visibleCon,cajaSector}=await import('./public/planta-integrada.js');
 // Cada sector del FBX pertenece a un sector del menú (o es piso/cubierta).
 for(const k of Object.keys(info.sectores))assert.ok(SIEMPRE.includes(k)||k===CUBIERTA||SECTORES_INT.some(s=>s.sectores.includes(k)),'sector sin asignar: '+k);
 // Tanques se incorpora desde el sector existente en tiempo de ejecución; su caja y separación se comprueban en test-planta-individual.
 for(const s of SECTORES_INT.filter(s=>s.id!=='tanques'))assert.ok(cajaSector(info,s.id),'caja de '+s.id);
 assert.equal(visibleCon(CUBIERTA,'torre'),false);assert.equal(visibleCon('Suelo VOCATUS','torre'),true);assert.equal(visibleCon('REF Fermentacion','torre'),false);
 // Alineación de la torre: muchas piezas en común y error chico; las bombas caen dentro de la losa DUSA.
 assert.ok(info.torre.piezas>50&&info.torre.errorMedio<1,JSON.stringify(info.torre));
 const losa=info.sectores['DUSA'];
 for(const p of torrePumps){const [x,,z]=torreAIntegrado(info.torre,p.x,.3,p.z);
  assert.ok(x>losa.min[0]-1&&x<losa.max[0]+1&&z>losa.min[2]-1&&z<losa.max[2]+1,`${p.tag} dentro de la torre: ${x.toFixed(1)},${z.toFixed(1)}`);}
 assert.ok(info.bombas.length>=10,'bombas sin ficha señaladas');
});
test('el simulador funciona con las bombas de la torre',()=>{
 for(const p of torrePumps){const P=simParams(p);assert.ok(P,p.tag);const M=createPumpModel(P);let s=M.initialState(),i={...M.defaults(),running:true};for(let k=0;k<3000;k++)s=M.step(s,i,.1);assert.ok(Number.isFinite(M.derive(s,i).q));}
});
test('el servidor entrega y lee las bombas de la torre',async()=>{
 const p=await readPump('B11');assert.equal(p.data.areaId,'torre');assert.equal(p.data.servicio,'Mosto - Vinaza');
 const req=Readable.from([]);req.url='/api/bootstrap';req.method='GET';req.headers={host:'127.0.0.1:8766'};
 const res={writeHead(st){this.status=st;},end(raw){this.raw=raw;}};await handler(req,res);
 const boot=JSON.parse(res.raw);assert.equal(boot.sectorPumps.length,28);assert.equal(boot.sectorPumps.filter(p=>p.areaId==='torre').length,16);
});
test('fotos del expediente: guarda, sustituye y conserva la anterior en el historial',async()=>{
 const {mkdtemp}=await import('node:fs/promises');const os=await import('node:os');const path=await import('node:path');
 const {pumpPhotoStore}=await import('./pump-photos.mjs');
 const dir=await mkdtemp(path.join(os.tmpdir(),'vocatus-fotos-'));const store=pumpPhotoStore(dir);
 const jpg=Buffer.from([0xFF,0xD8,0xFF,0xE0,1,2,3]).toString('base64');
 await store.save('B11','placa1',jpg);await store.save('B11','placa1',jpg);
 const list=await store.list('B11');assert.ok(list.placa1.url.includes('slot=placa1'));assert.equal(await store.historial('B11'),1);
 await assert.rejects(store.save('B11','otra',jpg));await assert.rejects(store.save('../x','placa1',jpg));
 await assert.rejects(store.save('B11','bomba',Buffer.from('hola').toString('base64')));
});
test('el expediente de la torre trae las fotos del Excel Libro1.bombas_3',async()=>{
 const {expediente}=await import('./public/expediente.js');
 for(const t of ['B3','B5','B11','B17','B21'])assert.ok(expediente[t].fotos.length&&expediente[t].placas.length,t);
});

test('mover/intercambiar bombas de la torre en una bóveda de prueba',async()=>{
 const {mkdtemp,mkdir,copyFile,readFile:rf}=await import('node:fs/promises');
 const os=await import('node:os');const path=await import('node:path');
 const {equipmentStore}=await import('./equipment.mjs');
 const dir=await mkdtemp(path.join(os.tmpdir(),'boveda-prueba-'));await mkdir(path.join(dir,'00-Proyecto/equipos'),{recursive:true});
 for(const t of ['B4','B5','B30'])await copyFile(new URL(`../00-Proyecto/equipos/${t}.md`,import.meta.url),path.join(dir,'00-Proyecto/equipos',t+'.md'));
 const eq=equipmentStore(dir,plantPumps),who={date:'2026-10-13',author:'Prueba'};
 await eq.move('B4',{...who,x:4,z:18,rotation:90});
 assert.match(await rf(path.join(dir,'00-Proyecto/equipos/B4.md'),'utf8'),/posicion_z: 18/);
 await assert.rejects(eq.move('B4',{...who,x:4,z:30}),/fuera de la torre/);
 await eq.swap('B4','B5',who);
 await assert.rejects(eq.swap('B4','B30',who),/misma área/);
});

test('temperatura de trabajo: rango por TAG, fuente y actualización en bóveda de prueba',async()=>{
 const {mkdtemp,mkdir,copyFile,readFile:rf}=await import('node:fs/promises');
 const os=await import('node:os');const path=await import('node:path');
 const {equipmentStore}=await import('./equipment.mjs');
 assert.equal(temperaturaTrabajo(photoPumps.find(p=>p.tag==='B30')),'Por confirmar');
 assert.equal(rangoTemperaturaTrabajo({temperatura_trabajo_min_c:80,temperatura_trabajo_max_c:40}),null);
 const dir=await mkdtemp(path.join(os.tmpdir(),'vocatus-temp-'));await mkdir(path.join(dir,'00-Proyecto/equipos'),{recursive:true});
 const file=path.join(dir,'00-Proyecto/equipos/B30.md');
 await copyFile(new URL('../00-Proyecto/equipos/B30.md',import.meta.url),file);
 const eq=equipmentStore(dir,plantPumps);
 await assert.rejects(eq.temperature('B30',{min:90,max:50,source:'Medición',author:'Prueba'}),/mínimo/);
 await assert.rejects(eq.temperature('B30',{min:30,max:50,source:'',author:'Prueba'}),/fuente/);
 await eq.temperature('B30',{min:30,max:50,source:'Medición en campo',author:'Prueba'});
 const text=await rf(file,'utf8');
 assert.match(text,/temperatura_trabajo_min_c: 30/);
 assert.match(text,/temperatura_trabajo_max_c: 50/);
 assert.match(text,/temperatura_trabajo_fuente: "Medición en campo"/);
 assert.match(text,/## Cambios de temperatura de trabajo/);
 assert.match(text,/caudal_gpm: "8"/);
 assert.equal(temperaturaTrabajo({documental:{temperatura_trabajo_min_c:30,temperatura_trabajo_max_c:50}}),'30 a 50 °C');
 await eq.replace('B30',{date:'2026-10-14',author:'Prueba',fields:{marca:'Otra marca',modelo:'Otro modelo'}});
 const replaced=await rf(file,'utf8');
 assert.match(replaced,/temperatura_trabajo_min_c: ""/);
 assert.match(replaced,/temperatura_trabajo_max_c: ""/);
 assert.match(replaced,/se archivó el rango anterior 30 a 50 °C/);
});

test('rendimiento: cada bomba se dibuja con una malla por material sin cambiar su forma',async()=>{
 const {exterior}=await import('./public/sector-fotos.js');
 const {compactar}=await import('./public/compactar.js');
 const cuenta=g=>{let n=0;g.traverse(o=>{if(o.isMesh)n++;});return n;};
 const a=exterior(THREE,.72,'lf'),b=compactar(THREE,exterior(THREE,.72,'lf'));
 const ba=new THREE.Box3().setFromObject(a),bb=new THREE.Box3().setFromObject(b);
 assert.ok(cuenta(b)<=8&&cuenta(a)>40,`${cuenta(a)} → ${cuenta(b)} mallas`);
 assert.ok(ba.min.distanceTo(bb.min)<1e-6&&ba.max.distanceTo(bb.max)<1e-6,'misma caja');
});
