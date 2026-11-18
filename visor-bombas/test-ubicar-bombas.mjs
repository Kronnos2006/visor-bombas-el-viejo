import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialState,validateState,mergeNewPoints,assign,addPump,changes} from './public/ubicar-bombas-core.js';
import {leerCajasGLB} from './tools/cajas-glb.mjs';
import {medirDesplazamiento} from './public/blender-local.js';
const data=JSON.parse(await readFile(new URL('./public/modelos/plano-bombas.json',import.meta.url)));
const map=JSON.parse(await readFile(new URL('./public/modelos/asignacion-bombas.json',import.meta.url)));
const editor=await readFile(new URL('./tools/ubicar-bombas.template.html',import.meta.url),'utf8');
const modelView=await readFile(new URL('./public/ubicar-bombas-modelo3d.js',import.meta.url),'utf8');
const viewer=await readFile(new URL('./public/app.js',import.meta.url),'utf8');
const start=()=>validateState(initialState(data,map),data);
test('el plano conserva catálogo y asignaciones actuales, sin inventar conversión 3D',()=>{
 const s=start();assert.equal(s.catalog.length,90);assert.equal(s.points.length,data.P.length);
 assert.equal(s.points.find(p=>p.id==='tag:B2').tag,'B3');
 assert.ok(s.points.every(p=>p.x>=0&&p.x<=2800&&p.y>=0&&p.y<=2504));
});
test('posiciones definitivas (18-nov): B72-B76 en su nuevo lugar y los borradores antiguos conservan sus cambios',()=>{
 const s=start(),newPumps=['B72','B73','B74','B75','B76'].map(tag=>s.points.find(p=>p.tag===tag&&!p.removed));
 assert.ok(newPumps.every(p=>p&&p.origen==='registro-definitivo'));
 assert.deepEqual(newPumps.map(p=>[p.x,p.y]),[[1733,573],[1736,534],[1737,492],[1736,454],[1740,405]]);
 assert.ok(['tag:B72','tag:B73','tag:B74','tag:B75','tag:B76'].every(id=>s.points.find(p=>p.id===id).removed));
 const oldData={...data,P:data.P.filter(p=>p.origen!=='registro-definitivo')};
 const old=validateState(initialState(oldData,map),oldData);old.points.find(p=>p.tag==='B13').x=601;
 const merged=validateState(mergeNewPoints(old, data),data);
 assert.equal(merged.points.find(p=>p.tag==='B13').x,601);
 assert.ok(['B84','B85','B86','B87','B88','B89'].every(tag=>merged.points.some(p=>p.tag===tag)));
});
test('el fondo superior carga el modelo FBX optimizado, las bombas añadidas y los detalles de calderas',()=>{
 assert.match(editor,/id="fondo-3d"/);assert.match(editor,/id="fondo-2d"/);assert.match(editor,/id="fondo-modelo"/);
 assert.match(editor,/<script type="importmap">\{"imports":\{"three":"\/vendor\/three\.module\.js"\}\}<\/script>/);
 for(const asset of ['/modelos/planta-integrada.glb','/modelos/bombas-campo.glb','/modelos/detalles-fbx-capturas.glb'])assert.ok(modelView.includes(asset),asset+' debe estar en el fondo 3D');
 assert.ok(modelView.includes('/modelos/blender-local/planta-blender-local.glb.gz'),'el mapa debe cargar los tanques del modelo de alta definición');assert.ok(modelView.includes("name==='Sector de tanques'"));assert.ok(modelView.includes('medirDesplazamiento(boxes,info)'));
 assert.ok(modelView.includes('function project(point)'),'las etiquetas deben proyectarse desde las coordenadas reales del FBX');assert.ok(modelView.includes('const extraTags='));
 assert.ok(modelView.includes("o.userData?.sector==='REF Cubierta comun'"));
 assert.ok(modelView.includes("o.userData?.sector==='REF Detalle'&&o.userData?.cat==='lamina'"),'la cubierta de calderas debe volverse casi invisible');assert.ok(modelView.includes('roofBoilers ? .04 : .12'));
 assert.ok(viewer.includes("o.userData.sector==='REF Cubierta comun'"),'el visor también debe transparentar las cubiertas del GLB');
 assert.ok(viewer.includes("o.userData.sector==='REF Detalle'&&o.userData.cat==='lamina'"),'el visor debe transparentar el techo de calderas');
});
test('el modelo detallado aporta los 808 componentes del sector de tanques en las coordenadas de la planta',async()=>{
 const local=leerCajasGLB(new URL('./public/modelos/blender-local/planta-blender-local.glb',import.meta.url));
 assert.equal(local.nodos.filter(n=>n.sector==='Sector de tanques').length,808);
 const info=JSON.parse(await readFile(new URL('./public/modelos/planta-integrada.json',import.meta.url),'utf8'));
 const aligned=medirDesplazamiento(local.sectores,info);assert.ok(aligned.residuo<.25);
 const source=local.sectores['Sector de tanques'],target=info.sectores['Sector de tanques'];
 for(let i=0;i<3;i++){assert.ok(Math.abs(source.min[i]-aligned.d[i]-target.min[i])<.01);assert.ok(Math.abs(source.max[i]-aligned.d[i]-target.max[i])<.01);}
});
test('el registro incluye las bombas ya colocadas aunque no haya cambios',()=>{
 const s=start(),report=changes(s,structuredClone(s));
 const placed=s.points.filter(p=>!p.removed&&p.tag);
 assert.ok(placed.length>0);
 for(const p of placed)assert.ok(report.includes(`POSICIÓN ${p.tag}${p.name?' · '+p.name:''} · px ${Math.round(p.x)},${Math.round(p.y)}`),p.tag+' debe figurar con su posición');
 assert.match(report,/Sin cambios respecto al mapa de referencia/);
 const removed=s.points.find(p=>p.tag==='B3');removed.removed=true;
 assert.doesNotMatch(changes(s,start()),/POSICIÓN B3 ·/);
});
test('añadir y reubicar una bomba no duplica TAG ni intercambia otra bomba',()=>{
 const s=start(),original=structuredClone(s);assert.equal(addPump(s,{tag:'B91',nombre:'Bomba adicional',area:'Prueba'}),'B91');
 assert.throws(()=>addPump(s,{tag:'B91',nombre:'Otra',area:'Prueba'}),/ya está/);
 assert.throws(()=>addPump(s,{tag:'B084',nombre:'Otra',area:'Prueba'}),/TAG/);
 assert.throws(()=>addPump(s,{tag:'B12345',nombre:'Otra',area:'Prueba'}),/TAG/);
 assign(s,s.points[0].id,'B91');assign(s,s.points[1].id,'B91');
 assert.equal(s.points.filter(p=>p.tag==='B91').length,1);assert.equal(s.points[0].tag,null);
 const restored=validateState(JSON.parse(JSON.stringify(s)),data);assert.deepEqual(restored,s);
 assert.match(changes(restored,original),/CATÁLOGO B91/);assert.match(changes(restored,original),/UBICAR B91/);
});
test('los respaldos rechazan TAG duplicados, coordenadas inválidas y pérdida de puntos',()=>{
 const s=start();s.points[1].tag=s.points[0].tag;assert.throws(()=>validateState(s,data),/más de una posición/);
 const outside=start();outside.points[0].x=2801;assert.throws(()=>validateState(outside,data),/fuera/);
 const missing=start();missing.points.pop();assert.throws(()=>validateState(missing,data),/Faltan puntos/);
 const catalog=start();catalog.catalog.pop();assert.throws(()=>validateState(catalog,data),/catálogo original/);
 const model=start();model.points[0].model={x:1,y:2,z:3};assert.deepEqual(validateState(model,data).points[0].model,{x:1,y:2,z:3});model.points[0].model=null;assert.equal(validateState(model,data).points[0].model,null);model.points[0].model={x:1001,y:0,z:0};assert.throws(()=>validateState(model,data),/posición 3D inválida/);
 const longTag=start();longTag.catalog.push({tag:'B12345',nombre:'Otra',area:'Prueba'});assert.throws(()=>validateState(longTag,data),/TAG/);
 const malformed=start();malformed.points[0].id='__proto__';assert.throws(()=>validateState(malformed,data),/identificadores/);
});
