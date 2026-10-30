import {aplicarCambiosCampo,cubiertaFotografica} from './cambios-campo.js?v=borde-pdf-20261029e';
import {savedSurveyHTML} from './survey-view.js';
import {evidenceMarkup,bindEvidenceGallery} from './evidence-ui.js';
import {normalizeSearch,searchPump,completeness,verificationOf,verificationText,storageDescription} from './interfaz-core.js';
import {createFirstFloorView} from './primera-planta.js';
import {createInspectorUI} from './interfaz.js';
import {cargarModeloPlanta, prepararBombasBlender, alinearInfoBlender, alturaPiso} from './blender-local.js';
import {cajaVisible,extraerBomba} from './planta-encuadre.js';
import {abrirFichaPendiente,clavePendiente} from './ficha-pendiente.js';
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import {compactar} from './compactar.js';
import { aplicarRealismo } from './realismo.js';
import {photoPumps, plantPumps, plateEvidence, photoURL, photo3URL, exterior, sector} from './sector-fotos.js';
import {torreSinTag} from './equipos-torre.js';
import {buildTorre, aplicarSeccion, dentroDeSeccion, rangoSeccion, SECCIONES, VISTAS, EJES_X, EJES_Z, CENTRO, LIMITES} from './torre-model.js';
import {GLTFLoader} from '/vendor/GLTFLoader.js';
import {MeshoptDecoder} from '/vendor/meshopt_decoder.module.js';
import {AREAS, PENDIENTES, sueloSitio, ubicar, pxAMundo} from './planta-general.js';
import {INFO_URL,SECTORES_INT,visibleCon,torreAIntegrado,cajaSector,sectorDe,ubicarTanques} from './planta-integrada.js';
import {fotosActualizadas, guardarFoto, originales, htmlFotos, bindPhotoTransfers, photoTransferHTML} from './fotos-bomba.js';
import {photoInputStarted,setPhotoInputStatus} from './fotos-bomba.js';
import {componentRows, sectorCorners} from './equipos-sector.js';
import { plantLayout } from './plant-layout.js';
import {expediente, expedienteDe, enlaces, linksBomba, linkPieza} from './expediente.js';
import {sealTitle, sealRecord, sealReference} from './sellos-fabricante.js';
import {rangoTemperaturaTrabajo, formatoRangoTemperatura} from './temperatura-trabajo.js';
import {listReports, addReport, deleteReport, configureReports, reportsInObsidian, importReports} from './reportes.js';
import {reportMeasurements} from './measurements.js';
import {renderRechartsHistory} from './vendor/history-chart.js';
import {demoReadings} from './historial-demo.js';
import {createAnatomyView,labelPositions} from './anatomy-view.js';
import {buildPumpModel} from './pump-model.js';
import {createPumpModel,simParams} from './pump-sim.js';
import {createSimRig,simPanelHTML,updateSimPanel,drawSimChart} from './sim-view.js';

const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const primeraPlanta=createFirstFloorView(THREE);
const state={primeraPlanta:false,area:'integrado',seccion:null,filtroInt:null,existente:false,techo:true,sector:true,detail:'exterior',pumps:[],pump:null,tab:'ficha',part:null,token:'',configured:false,model:'',answers:{},view:'plant',explode:0,loading:0};
const inspectorUI=createInspectorUI({getSelection:()=>state.pump,onPart:index=>selectPart(index),onSummary:()=>{state.tab="ficha";renderPanel();},onLayout:()=>renderPanel()});
const extraReferences=[];
let detailOrigin=null,detailFlightTicket=null,bombaResaltada=null;
function transitionToPump(ticket,world,show){
 detailFlightTicket=ticket;
 const finish=()=>{if(ticket!==state.loading)return;show();setTimeout(()=>{if(detailFlightTicket===ticket)detailFlightTicket=null;},reducedMotion.matches?20:1120);};
 if(plant?.visible&&world){const duration=reducedMotion.matches?1:600;fly([world.x+3,world.y+6,world.z+5],[world.x,world.y+1,world.z],duration);setTimeout(finish,reducedMotion.matches?2:620);}else finish();
}
function fitPumpMinimum(box){const size=box.getSize(new THREE.Vector3()).length();if(size>0)controls.minDistance=Math.max(.05,Math.min(4,size*.12));}
function detailRailFraction(){
 const rail=$('#parts-rail');if(!rail||rail.hidden||!viewport.clientWidth)return 0;
 const r=rail.getBoundingClientRect(),v=viewport.getBoundingClientRect();
 // A bottom rail on mobile does not occupy the right-hand viewing column.
 if(!r.width||!r.height||r.width>v.width*.55||r.right<=v.left||r.left>=v.right||r.bottom<=v.top||r.top>=v.bottom)return 0;
 return Math.max(0,Math.min(.45,(v.right-Math.max(v.left,r.left))/v.width));
}


function rememberDetailOrigin(){
 if(detailOrigin||state.view!=='plant'||!camera||!controls)return;
 detailOrigin={area:state.area,filtroInt:state.filtroInt,seccion:state.seccion,position:camera.position.toArray(),target:controls.target.toArray(),aspect:camera.aspect,minDistance:controls.minDistance,maxDistance:controls.maxDistance,top:$('#top').classList.contains('active')};
}
function areaName(id){return SECTORES_INT.find(s=>s.id===id)?.nombre||AREA(id)?.nombre||id;}
function chooseArea(id){
 if(id==='tanques'||id==='torre')id='sector:'+id;
 if(state.view!=='plant'||state.pump)$('#back').click();
 if(id.startsWith('sector:')){setArea('integrado',false);state.filtroInt=id.slice(7)||null;aplicarFiltroInt();applyArea();if($('#area'))$('#area').value=state.filtroInt?'sector:'+state.filtroInt:'integrado';renderList();flyIntegrado();return;}
 if(id==='integrado'){state.filtroInt=null;aplicarFiltroInt();}
 setArea(id);
}
let busyAI=false;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,4500);}
async function api(route,body){const r=await fetch(route,body?{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':state.token},body:JSON.stringify(body)}:{});let data;try{data=await r.json();}catch{throw new Error(r.status===504||r.status===500?'El servidor tardó demasiado o falló al responder. Probá de nuevo en un momento.':`Respuesta inesperada del servidor (HTTP ${r.status}).`);}if(!r.ok){const error=new Error(data.error||'No se pudo completar la acción.');error.code=data.code;throw error;}return data;}
const NORMA='ANSI/ASME B73.1 · bomba centrífuga horizontal de proceso, desarme posterior (back pull-out).';
const parts=[
 {name:'Carcasa (voluta)',pieza:'Casing',desc:'Succión axial y descarga a línea de centros, con bridas y patas integradas. En B73.1 la carcasa queda fija: todo el resto del conjunto sale por atrás sin desconectar la tubería.',ref:'La designación de placa (1X1.5-8, 3X4X8G) es descarga × succión \u2212 diámetro nominal de impulsor.',fields:[['Succión DN','succion_dn'],['Descarga DN','descarga_dn'],['Modelo','modelo'],['Marca','marca']]},
 {name:'Empaque de carcasa',pieza:'Casing gasket · o-ring confinado',desc:'Junta confinada entre carcasa y tapa de carcasa. Es la junta que se cambia en cada desarme; su medida sale del corte del fabricante, no del modelo.',ref:'En la familia 2196/4196 va alojada en ranura: la medida depende del tamaño de carcasa.',orings:true},
 {name:'Impulsor abierto',pieza:'Impeller',desc:'Impulsor abierto, roscado al eje. El tercer número de la designación es el diámetro nominal; el recorte real lo da la placa de cada equipo.',ref:'Placa 210775-2: impulsor 200 mm, máximo 215 mm.',fields:[['Tipo de bomba','tipo_bomba'],['Velocidad (rpm)','rpm'],['Caudal (m³/h)','caudal_m3h'],['Altura (m)','altura_m']]},
 {name:'Tapa de carcasa',pieza:'Casing cover',desc:'Cierra la voluta y sostiene la cámara de sello. Se desmonta con el conjunto rotativo completo; es la pieza que define el plano de junta.',ref:'La intercambiabilidad no está confirmada por estas fotografías.',fields:[['Marca','marca'],['Modelo','modelo'],['Presión (bar)','presion_bar'],['Temperatura (°C)','temperatura_c']]},
 {name:'Cámara de sello',pieza:'Seal chamber · big bore',desc:'Alojamiento del sello con conexiones de flush y venteo. La cámara y la compatibilidad del sello deben verificarse con el corte del fabricante.',ref:'El diámetro de eje en la cámara depende del grupo de potencia (LF / S / M / L), no del modelo comercial.',fields:[['Tipo de sellado','tipo_sellado'],['Diámetro de eje (mm)','diametro_eje_mm'],['Fluido','fluido'],['Temperatura (°C)','temperatura_c']]},
 {name:'Sello mecánico',pieza:'Mechanical seal',desc:'Representación del conjunto de sellado. El tipo y diámetro registrados se muestran debajo; las piezas internas y los materiales requieren el corte del fabricante.',ref:'Consultar la ficha específica de esta bomba; los campos vacíos siguen pendientes.',fields:[['Tipo de sellado','tipo_sellado'],['Marca','sello_marca'],['Modelo','sello_modelo'],['Tipo','sello_tipo'],['Diámetro (mm)','sello_diametro_mm'],['Cara rotativa','sello_cara_rotativa'],['Cara estática','sello_cara_estatica'],['Elastómero','sello_elastomero'],['Resorte','sello_resorte'],['Empaque · sección (mm)','empaque_seccion_mm'],['Empaque · anillos','empaque_anillos']]},
 {name:'Eje',pieza:'Shaft',desc:'Eje escalonado: tramo fino bajo el sello, tramo grueso entre rodamientos. Puede llevar camisa de desgaste si el equipo trabaja con empaquetadura.',ref:'Verificar el eje y el conjunto de sellado con el fabricante.',fields:[['Diámetro de eje (mm)','diametro_eje_mm'],['Velocidad (rpm)','rpm'],['Potencia (kW)','potencia_kw']]},
 {name:'Bancada de rodamientos',pieza:'Bearing frame · power end',desc:'Soporte del conjunto rotativo. La configuración de rodamientos y lubricación debe verificarse para la familia representada.',ref:'El grupo de potencia (LF / S / M / L) fija el diámetro de eje y el tamaño de rodamientos. Falta leerlo del sufijo de placa.',fields:[['Marca','marca'],['Modelo','modelo'],['Código de bodega','codigo_bodega'],['Proveedor','proveedor']]},
 {name:'Acople espaciador',pieza:'Spacer coupling',desc:'Acople de espaciador: al retirarlo queda el hueco necesario para sacar el conjunto rotativo sin mover el motor. Es la razón de ser del desarme posterior.',ref:'El elemento elástico y la longitud del espaciador siguen por confirmar.',fields:[['Potencia (kW)','potencia_kw'],['Velocidad (rpm)','rpm']]},
 {name:'Motor eléctrico',pieza:'JM-flange motor',desc:'Motor del equipo seleccionado. El montaje y los datos se consultan por modelo.',ref:'Placa leída: 7.5 HP, 1750 rpm, 230/460 V, 19.6/9.8 A, carcasa 213JM, TEFC, clase F. Rodamientos 6309-2Z-J/C3 y 6308-2Z-J/C3.',fields:[['Potencia registrada (kW)','potencia_kw'],['Velocidad registrada (rpm)','rpm']]}
];
function partName(index,p=state.pump?.data){
 if(index!==5)return parts[index].name;
 return sealTitle(p);
}
const viewport=$('#viewport');
// En pantallas angostas el panel de bombas de la torre empieza plegado para no tapar el modelo.
if(innerWidth<700)state.pumpRailCollapsed=true;
let renderer,scene,camera,controls,plant,pumpGroup,photoDetail;
const pickables=[],areaPickables=[],markers=[],componentGroups=[];let cameraFlight=null,render3D=null;let solModo=null,solCaja=null;
let anatomy=null;
let simRig=null;const sims={};
let areaGroups={},torre=null;const pumpObjects={};
let plantRequested=false;
function needsPlant(){const params=new URLSearchParams(location.search),section=document.body.dataset.telSeccion||params.get('s')||'areas';const directHistory=section==='historial'&&plantPumps.some(p=>p.tag===location.hash.slice(1).toUpperCase());return params.get('vista')==='clasica'||(['areas','historial'].includes(section)&&!directHistory)||document.body.classList.contains('tel-eligiendo')||document.body.classList.contains('tel-3d');}
function ensurePlant(){if(!plant||plantRequested)return;plantRequested=true;rebuildPlant();}
let integrado=null;const pumpObjectsInt={}; // modelo integrado de Revit: bombas con ficha ubicadas sobre él
const areaOf=p=>p?.areaId||'tanques',AREA=id=>AREAS.find(a=>a.id===id);
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const raycaster=new THREE.Raycaster();
function material(color,metalness=.35,roughness=.45){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function box(w,h,d,color){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));}
function cyl(radius,length,color,axis='x'){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,40),material(color));if(axis==='x')m.rotation.z=Math.PI/2;return m;}
function ring(radius,tube,color){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,48),material(color,.5,.32));m.rotation.y=Math.PI/2;return m;}
function add(parent,obj,x=0,y=0,z=0){obj.position.set(x,y,z);parent.add(obj);return obj;}
function marker(obj,text,kind,id){const el=document.createElement('button');el.className='label'+(kind==='part'?' part-label':'');el.textContent=text;el.title=kind==='part'?partName(id):text;el.setAttribute('aria-label',kind==='part'?'Seleccionar '+partName(id):'Acercarse a '+text);el.onclick=()=>kind==='part'?selectPart(id):selectPump(id);$('#labels').append(el);let leader=null;if(kind==='part'){leader=document.createElement('div');leader.className='part-leader';leader.hidden=true;$('#labels').append(leader);}markers.push({obj,el,kind,id,leader});}
function clearGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();});group.clear();}
function rebuildPlant(){
 clearGroup(plant);pickables.length=0;areaPickables.length=0;
 for(let i=markers.length-1;i>=0;i--)if(markers[i].kind!=='part'){markers[i].el.remove();markers[i].leader?.remove();markers.splice(i,1);}
 if(state.sector){
  const placed=state.pumps.length?state.pumps:plantPumps; // posiciones de la ficha si la bomba se movió
  const suelo=sueloSitio(THREE);suelo.userData.sitio=true;plant.add(suelo);
  const tq=ubicar(new THREE.Group(),AREA('tanques')),tr=ubicar(new THREE.Group(),AREA('torre'));
  areaGroups={tanques:tq,torre:tr};plant.add(tq,tr);
  for(const area of AREAS.filter(a=>a.modelo)){
   const g=ubicar(new THREE.Group(),area);g.name=area.nombre;areaGroups[area.id]=g;plant.add(g);if(area.aparte)reportModelProgress({loaded:0,total:0});
   (area.aparte&&new URLSearchParams(location.search).get('modelo')!=='original'?cargarModeloPlanta({GLTFLoader,MeshoptDecoder,area,onProgress:reportModelProgress}):new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(area.modelo)).then(glb=>{
    if(g.parent!==plant)return;
    glb.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(area.aparte)return;o.userData.areaId=area.id;areaPickables.push(o);}});
    g.add(glb.scene);if(area.aparte){$('#model-load').hidden=true;$('#scene-error').hidden=true;}
    if(area.aparte)montarIntegrado(g,glb.scene,placed);
    if(state.view==='plant'&&state.area===area.id)flyArea(area.id);
   }).catch(err=>{if(area.aparte)show3DError(err);else console.warn('No se cargó '+area.nombre,err);});
  }
  tq.add(sector(THREE,placed.filter(p=>areaOf(p)==='tanques')));
  torre=buildTorre(THREE,{cargar:url=>new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url),alCargar:()=>{performance.mark('torre-cargada');if(typeof applyArea==='function')applyArea();}});tr.add(torre.root);
  for(const k in pumpObjects)delete pumpObjects[k];
  for(const p of placed){const parent=areaGroups[areaOf(p)]||tq;const ext=exterior(THREE,p.scale,p.variant);if(areaOf(p)==='tanques')cubiertaFotografica(THREE,ext);const g=compactar(THREE,ext);g.position.set(p.x,p.y??.3,p.z);g.rotation.y=p.rotation;g.userData.tag=p.tag;g.userData.section='n1';parent.add(g);pumpObjects[p.tag]=g;if(areaOf(p)==='torre'){const hit=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.4,3.3),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(0,1,.1);hit.userData.hitProxy=true;g.add(hit);}g.traverse(o=>{if(o.isMesh){o.userData.tag=p.tag;pickables.push(o);}});const a=new THREE.Object3D();a.position.set(0,2.2,0);g.add(a);marker(a,p.tag,'pump',p.tag);markers.at(-1).area=areaOf(p);}
  extraReferences.length=0;
  for(const [index,s] of torreSinTag.entries()){const g=compactar(THREE,exterior(THREE,.72,'lf'));g.position.set(s.x,.3,s.z);tr.add(g);g.updateWorldMatrix(true,true);const box=new THREE.Box3().setFromObject(g),reference={sector:'torre',nombre:'Torre · referencia sin TAG '+(index+1),nota:s.nota,min:box.min.toArray(),max:box.max.toArray(),standalone:true};extraReferences.push(reference);g.traverse(o=>{if(o.isMesh){o.userData.pending=reference;pickables.push(o);}});const a=new THREE.Object3D();a.position.set(0,2.2,0);g.add(a);const el=document.createElement('button');el.className='label pending-label';el.textContent='Sin TAG';el.title=s.nota;el.setAttribute('aria-label','Bomba sin ficha: '+reference.nombre);el.onclick=()=>selectPendingPump(reference);$('#labels').append(el);markers.push({obj:a,el,kind:'pump',area:'torre'});}
  for(const corner of sectorCorners){const anchor=new THREE.Object3D();anchor.position.set(corner.x,1.1,corner.z);tq.add(anchor);etiqueta(anchor,corner.name,'corner-label','tanques');}
  for(const [k,x] of Object.entries(EJES_X)){const a=new THREE.Object3D();a.position.set(x,.4,-2.6);tr.add(a);etiqueta(a,k,'axis-label','torre');}
  for(const [k,z] of Object.entries(EJES_Z)){const a=new THREE.Object3D();a.position.set(-3,.4,z);tr.add(a);etiqueta(a,k,'axis-label','torre');}
  for(const area of AREAS.filter(a=>a.id!=='planta'&&!a.aparte)){const g=areaGroups[area.id],a=new THREE.Object3D();a.position.set(...(area.id==='torre'?[CENTRO.x,30,CENTRO.z]:area.modelo?[0,area.huella[2]+1,0]:[0,9,-3]));g.add(a);
   const el=document.createElement('button');el.className='label area-label '+area.estado;
   const nombres={tanques:'Tanques',torre:'Torre',area1:'1 · Oficina',area7:'7 · Bodega',area4:'4 · Baños',area5:'5 · Eléctrico',area6:'6 · Químicos'};
   el.textContent=nombres[area.id]||area.corto;el.title=area.nombre;el.setAttribute('aria-label','Ver '+area.nombre);
   el.onclick=()=>setArea(area.id);$('#labels').append(el);markers.push({obj:a,el,kind:'area',area:'planta'});}
  for(const p of PENDIENTES){const [x,z]=pxAMundo(p.px,p.py),a=new THREE.Object3D();a.position.set(x,1,z);plant.add(a);etiqueta(a,`Área ${p.n} · por modelar`,'pending-area','planta');}
  document.querySelector('.sidebar footer p').textContent=`${placed.filter(p=>areaOf(p)==='tanques').length} en el sector de tanques · ${placed.filter(p=>areaOf(p)==='torre').length} en la torre de destilación.`;
  applyArea();
  if(render3D)render3D.refrescar();return;
 }
 const slab=add(plant,box(30,.12,24,0x233538),0,-.12,0);
 const grid=new THREE.GridHelper(30,30,0x526b67,0x304744);grid.position.y=.01;plant.add(grid);
 const layout=plantLayout(state.pumps,state.demo);
 for(let a=0;a<2;a++){
  const x=a?7:-7;
  add(plant,box(12,.03,20,a?0x243b35:0x263a43),x,.04,0);
  for(const position of layout.tanks.filter(t=>t.side===Boolean(a))){
   const z=position.z; const tank=cyl(a?1.15:1.5,a?4.7:2.3,a?0x48645a:0x3d5b64,'y');add(plant,tank,x-2,a?2.35:1.15,z);
   add(plant,cyl(a?1.22:1.56,.13,0x6c8275,'y'),x-2,a?4.76:2.36,z);
  }
 }
 layout.pumps.forEach(p=>{
  const {x,z,tank}=p;
  const points=[[tank.x+tank.radius,.7,tank.z],[tank.x+tank.radius+.4,.7,tank.z],[tank.x+tank.radius+.4,.7,z+1.2],[x-1.05,.7,z+1.2],[x-1.05,.7,z],[x-.72,.7,z]];
  for(let i=1;i<points.length;i++){
   const start=new THREE.Vector3(...points[i-1]),end=new THREE.Vector3(...points[i]),direction=end.clone().sub(start);
   if(direction.length()<.001)continue;
   const pipe=cyl(.07,direction.length(),p.side?0x9eae82:0x83aeba,'y');pipe.position.copy(start.clone().add(end).multiplyScalar(.5));pipe.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());plant.add(pipe);
  }
  add(plant,box(2.15,.10,1.25,0x84908a),x,.1,z);
  const g=new THREE.Group();g.position.set(x,.25,z);plant.add(g);g.userData.tag=p.tag;
  add(g,box(1.7,.2,.9,0x5c7068),0,0,0);
  add(g,cyl(.37,.55,0x8faa96),-.45,.45,0);add(g,cyl(.26,.7,0x567f77),.4,.4,0);
  g.traverse(o=>{if(o.isMesh){o.userData.tag=p.tag;pickables.push(o);}});
  const anchor=new THREE.Object3D();anchor.position.set(0,1.25,0);g.add(anchor);marker(anchor,p.tag,'pump',p.tag);
 });
 if(render3D)render3D.refrescar();
}
function buildPump(variant='lf'){
 const model=buildPumpModel(THREE,variant);
 while(model.root.children.length)pumpGroup.add(model.root.children[0]);
 componentGroups.push(...model.components);simRig=createSimRig(THREE,model.components);
 for(const group of componentGroups){const index=group.userData.index;const anchor=new THREE.Object3D();anchor.position.set(0,index===0?1.75:1.12,0);group.add(anchor);marker(anchor,String(index+1).padStart(2,'0'),'part',index);}
 render3D?.refrescar();anatomy?.register(componentGroups);
}
function fly(pos,target,duration=1100){cameraFlight={start:performance.now(),duration:reducedMotion.matches?1:duration,from:camera.position.clone(),to:new THREE.Vector3(...pos),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...target)};}
// Controles equivalentes al arrastre y recuperación sin modificar datos de equipos.
function reportModelProgress(event){
 const box=$('#model-load'),progress=$('#model-progress'),label=$('#model-progress-label');box.hidden=false;
 if(event.total>0){const percent=Math.min(100,Math.round(event.loaded/event.total*100));progress.value=percent;label.textContent=percent+'%'+(percent===100?' · Preparando modelo':' · Descargando modelo');}
 else{progress.removeAttribute('value');label.textContent=event.loaded?'Descargando modelo · '+(event.loaded/1e6).toFixed(1)+' MB':'Preparando descarga del modelo';}
}
function show3DError(error){
 $('#model-load').hidden=true;$('#scene-error').hidden=false;
 $('#scene-error-text').textContent='No se pudo cargar el 3D. Las fichas siguen disponibles. '+(error?.message||error||'');
}
$('#scene-retry').onclick=()=>{
 document.body.classList.remove('fichas-only');$('#scene-error').hidden=true;
 if(!renderer||!scene||!plant){
  renderer?.setAnimationLoop(null);controls?.dispose();renderer?.dispose();renderer?.domElement?.remove();
  renderer=null;camera=null;scene=null;plant=null;pumpGroup=null;anatomy=null;render3D=null;
  markers.forEach(m=>{m.el.remove();m.leader?.remove();});markers.length=0;componentGroups.length=0;
  initScene();
 }
 if(renderer&&plant){integrado=null;reportModelProgress({loaded:0,total:0});rebuildPlant();}
};
$('#scene-sheets').onclick=()=>{document.body.classList.add('fichas-only');$('#scene-error-text').textContent='Modo fichas: elegí un equipo en el explorador. Podés reintentar el 3D cuando quieras.';};
document.querySelectorAll('#camera-tools [data-camera]').forEach(button=>button.onclick=()=>{
 if(!camera||!controls){toast('El 3D no está disponible; podés seguir consultando fichas.');return;}
 const action=button.dataset.camera,offset=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(offset);
 if(action==='in'||action==='out')spherical.radius=THREE.MathUtils.clamp(spherical.radius*(action==='in'?.8:1.25),controls.minDistance,controls.maxDistance);
 else spherical.theta+=(action==='left'?1:-1)*Math.PI/12;
 const position=new THREE.Vector3().setFromSpherical(spherical).add(controls.target);fly(position.toArray(),controls.target.toArray(),250);
});

function initScene(){
 try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,logarithmicDepthBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);renderer.localClippingEnabled=true;if(new URLSearchParams(location.search).has('medir'))window.__visor={renderer,get scene(){return scene;},get camera(){return camera;}};viewport.prepend(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,1,.1,600);camera.position.set(-18,85,80);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=190;controls.maxPolarAngle=Math.PI*.49;controls.target.set(-18,0,8);controls.addEventListener('start',()=>cameraFlight=null);
 scene.add(new THREE.HemisphereLight(0xd8efe6,0x263c40,2.5));const light=new THREE.DirectionalLight(0xffecd5,3.5);light.position.set(-5,12,8);scene.add(light);const rim=new THREE.DirectionalLight(0x95bcde,2);rim.position.set(5,3,-7);scene.add(rim);
 plant=new THREE.Group();pumpGroup=new THREE.Group();scene.add(plant,pumpGroup);pumpGroup.visible=false;buildPump();
 try{render3D=aplicarRealismo({THREE,renderer,scene,camera});}catch(err){console.warn('Realismo no aplicado:',err.message);}
 anatomy=createAnatomyView({THREE,root:pumpGroup,renderer});anatomy.register(componentGroups);
 let resizeTimer=null,previousSize=null;const observer=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;const changed=previousSize&&(previousSize[0]!==w||previousSize[1]!==h);previousSize=[w,h];renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(changed){clearTimeout(resizeTimer);resizeTimer=setTimeout(refitCurrentView,120);}});observer.observe(viewport);
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
  const hits=raycaster.intersectObjects(state.view==='plant'?[...pickables,...areaPickables]:(state.sector&&state.detail==='exterior'?[]:componentGroups),true);
  const visibleHits=hits.filter(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return state.view==='plant'||anatomy.visibleHit(h);});if(visibleHits.length){const o=visibleHits[0].object;if(state.view==='plant'){if(o.userData.pending)selectPendingPump(o.userData.pending);else if(o.userData.areaId)setArea(o.userData.areaId);else if(o.userData.tag)selectPump(o.userData.tag);}else if(o.userData.part!==undefined)selectPart(o.userData.part,o.userData.subcomponent||null);}
 });
 renderer.setAnimationLoop(()=>{
  if(document.hidden||!viewport.clientWidth||!viewport.clientHeight)return;
  if(cameraFlight){const f=cameraFlight,t=Math.min(1,(performance.now()-f.start)/f.duration),ease=t*t*(3-2*t);camera.position.lerpVectors(f.from,f.to,ease);controls.target.lerpVectors(f.fromTarget,f.toTarget,ease);if(t===1)cameraFlight=null;}
  componentGroups.forEach((g,i)=>{const x=g.userData.base+(i-4.5)*state.explode*.017;g.position.x=reducedMotion.matches?x:g.position.x+(x-g.position.x)*.12;});
  controls.update();solSegunVista();renderer.render(scene,camera);
  const partLabels=[],pumpLabels=[];
  for(const m of markers){if(m.leader)m.leader.hidden=true;const show=m.kind!=='part'?state.view==='plant'&&markerInArea(m):state.view==='pump'&&m.obj.parent.visible&&(!state.sector||state.detail==='schematic');m.el.hidden=!show;if(!show)continue;const v=m.obj.getWorldPosition(new THREE.Vector3()).project(camera);m.el.hidden=v.z>1||v.z< -1||Math.abs(v.x)>1||Math.abs(v.y)>1;const x=(v.x+1)/2*viewport.clientWidth,y=(-v.y+1)/2*viewport.clientHeight;m.el.style.left=x+'px';m.el.style.top=y+'px';if(m.kind==='part'&&!m.el.hidden)partLabels.push({marker:m,x,y,anchorY:y});if(m.kind==='pump'&&(m.area==='torre'||m.area==='integrado')&&!m.el.hidden)pumpLabels.push({m,x,y});}
  separarEtiquetas(pumpLabels);
  for(const label of labelPositions(partLabels,viewport.clientWidth,viewport.clientHeight)){const m=label.marker;m.el.hidden=!!label.hidden;if(label.hidden)continue;m.el.style.top=label.y+'px';m.leader.hidden=!label.offset;m.leader.style.left=label.x+'px';m.leader.style.top=Math.min(label.y,label.anchorY)+'px';m.leader.style.height=Math.abs(label.offset)+'px';}
 });
 }catch(e){show3DError(e);}
}
function normalize(s){return normalizeSearch(s); }
function renderList(){const q=normalize($('#search').value),area=state.area,tipo=$('#tipo').value,marca=$('#marca').value;const selectedArea=area;const list=state.pumps.filter(p=>(state.area!=='integrado'||!state.filtroInt||areaOf(p)===state.filtroInt)&&(!selectedArea||areaOf(p)===selectedArea||selectedArea==='integrado')&&(!tipo||tipoDe(p).includes(tipo))&&(!marca||p.marca===marca)&&searchPump(p,q));$('#pump-list').innerHTML=list.map(p=>`<button class="pump-row ${state.pump?.tag===p.tag?'active':''}" data-tag="${esc(p.tag)}"><i>↗</i><strong>${esc(p.tag)}</strong><small>${esc(p.nombre||p.servicio)} · ${esc(areaName(areaOf(p)))}</small></button>`).join('')||`<p class="muted">${area&&AREA(area)?.modelo?'No hay bombas registradas en esta área.':'No hay coincidencias.'}</p>`;const pendientes=(state.area==='integrado'?integrado?.references||[]:[]).filter(p=>(!state.filtroInt||sectorDe(p.sector)===state.filtroInt)&&(!tipo&&!marca)&&normalize(`${p.nombre} ${SECTORES_INT.find(x=>x.id===sectorDe(p.sector))?.nombre||''}`).includes(q));
 if(pendientes.length){if(!list.length)$('#pump-list').innerHTML='';$('#pump-list').insertAdjacentHTML('beforeend',pendientes.map(p=>`<button class="pump-row ${state.pump?.pending===p?'active':''}" data-pending="${integrado.references.indexOf(p)}"><i>↗</i><strong>Bomba ${p.numero}</strong><small>${esc(SECTORES_INT.find(x=>x.id===sectorDe(p.sector))?.nombre)} · sin TAG</small></button>`).join(''));$('#pump-list').querySelectorAll('[data-pending]').forEach(b=>b.onclick=()=>selectPendingPump(integrado.references[Number(b.dataset.pending)]));}
 $('#count').textContent=`${list.length+pendientes.length} de ${state.pumps.length+(state.area==='integrado'?(integrado?.references.length||0):0)}`;$('#count').title=state.pumps.length+' equipos con TAG'+(state.area==='integrado'?' + '+(integrado?.references.length||0)+' referencias 3D sin TAG':'');$('#count-breakdown').textContent=list.length+' con TAG + '+pendientes.length+' referencias sin TAG en esta vista';$('#clear-filters').hidden=!(q||tipo||marca||state.filtroInt||state.area!=='integrado');$('#pump-list').querySelectorAll('button[data-tag]').forEach(b=>b.onclick=()=>selectPump(b.dataset.tag));document.dispatchEvent(new CustomEvent('vocatus:lista'));}
async function selectPump(tag){
 if(state.sector)return selectPhotoPump(tag);
 rememberDetailOrigin();
 const ticket=++state.loading;
 try{const p=await api('/api/pump?tag='+encodeURIComponent(tag));if(ticket!==state.loading)return;state.pump=p;state.part=null;state.view='pump';state.explode=0;$('#explode').value=0;$('#percent').textContent='0%';$('#explode').disabled=false;$('#explode-all').disabled=false;$('#back').hidden=false;
 $('#selected-tag').textContent=p.tag;$('#selected-name').textContent=p.data.nombre||p.data.servicio||'';$('#source-status').textContent=state.demo?'DEMOSTRACIÓN · DATOS FICTICIOS':'FICHA LEÍDA DE OBSIDIAN · '+(p.data.confianza||'sin verificar').toUpperCase();$('#scene-title').textContent=p.tag+' · Exploración';$('#breadcrumb').textContent='PLANTA / '+(p.data.area||'ÁREA')+' / '+p.tag;
 $('#scene-badge').textContent='DESPIECE ANSI/ASME B73.1 · MEDIDAS PENDIENTES';$('#scene-help').textContent='Arrastrá para girar · Rueda para acercarte · Tocá una pieza';$('#parts-title').textContent='Despiece normalizado B73.1';$('#part-count').textContent=parts.length+' piezas de norma · medidas por levantar';
 $('#parts').innerHTML=parts.map((p,i)=>`<button class="part-button" data-part="${i}"><span>${String(i+1).padStart(2,'0')}</span>${p.name}</button>`).join('');$('#parts').querySelectorAll('button').forEach(b=>b.onclick=()=>selectPart(Number(b.dataset.part)));
 if(plant){
  const enteringFromPlant=plant.visible;
  const target=plant.children.find(o=>o.userData.tag===tag);
  if(enteringFromPlant&&target){
   state.view='plant';const v=target.position;
   fly([v.x+3,v.y+7,v.z+5],[v.x,v.y,v.z],700);
   setTimeout(()=>{if(ticket!==state.loading)return;state.view='pump';plant.visible=false;pumpGroup.visible=true;camera.position.set(5,4,8);controls.target.set(0,0,0);fly([8,7,12],[0,0,0],700);},720);
  }else{plant.visible=false;pumpGroup.visible=true;fly([8,7,12],[0,0,0]);}
 }setViewButtons(false);renderList();selectPart(null);
 }catch(e){if(e.code==='PUMP_NOT_AVAILABLE'){state.pump=null;await refresh();if(state.pumps.length)await selectPump(state.pumps[0].tag);toast('Lista actualizada al modo activo.');}else toast(e.message);}
}
function selectPart(index,subcomponent=null){
 if(index!==null&&state.sector&&state.detail==='exterior'){
  setPhotoDetail(true);
 }
 if(anatomy&&!anatomy.set({selected:index,subcomponent})){toast('Esa pieza no está representada para esta familia.');return;}
 state.part=index;syncAnatomyTools();
 markers.forEach(m=>{
  if(m.kind==='part'){
   m.el.classList.toggle('selected-marker',m.id===index);
  }
 });
 document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('active',Number(b.dataset.part)===index));
 if(index!==null&&componentGroups[index]&&camera){
  const posX=componentGroups[index].position.x;
  fly([posX+(index===2?-4:4),3.2,7.5],[posX,0.3,0],550);
 }
 if(index!==null)state.tab='ficha';
 renderRail();
 renderPanel();
 if(state.sector&&index!==null)requestAnimationFrame(()=>{
  const panel=$('#panel'),detail=$('#component-detail');
  panel?.scrollTo({top:0,behavior:'smooth'});
  detail?.focus({preventScroll:true});
 });
}
function fields(entries){return '<dl class="fields">'+entries.map(([label,key])=>{const v=state.pump.data[key],missing=v===undefined||v===null||v==='';return `<div class="field"><dt>${esc(label)}</dt><dd class="${missing?'missing':''}">${missing?'Sin levantar':esc(typeof v==='object'?JSON.stringify(v):v)}</dd></div>`;}).join('')+'</dl>';}
window.addEventListener('pageshow',event=>{if(event.persisted&&state.pump)renderPanel();});
window.addEventListener('storage',event=>{if(state.pump&&event.key==='vocatus-survey-local-v1:'+state.pump.tag)renderPanel();});
function renderPanel(){
 const previousLinks=$("#pump-links");if(previousLinks&&$("#panel").contains(previousLinks))$("#source-status").after(previousLinks);
 const requestLink=document.querySelector('header a[href^="/solicitud.html"]');if(requestLink)requestLink.href="/solicitud.html"+(state.pump?.tag?"?tag="+encodeURIComponent(state.pump.tag):"");
 renderPanelContent();
 const p=state.pump?.data;
 if(p&&state.sector&&!state.pump.pending){
  if(state.tab==='ficha'){paintPumpSummary(p);$('#panel').prepend($('#pump-resumen'));} const meta=$('#pump-meta');if(meta){const copy=document.createElement('div');copy.className='mobile-pump-meta';copy.innerHTML=meta.innerHTML;$('#panel').prepend(copy);}
  else $('#pump-resumen')?.remove();
 }
 renderEditingAccess();
 if(matchMedia("(max-width:900px)").matches&&state.tab==="ficha"&&$("#pump-resumen"))$("#panel").prepend($("#pump-resumen"));
 if(matchMedia('(max-width:900px)').matches&&$('#pump-links')){
  const actions=document.createElement('section');actions.id='mobile-actions';actions.className='block';
  const heading=document.createElement('h3');heading.textContent='Qué querés hacer con esta bomba';actions.append(heading,$('#pump-links'));
  const summary=$('#pump-resumen .rs-card');if(summary)summary.after(actions);else $('#panel').append(actions);
 }
 const editAccess=$('#editar-equipo');if(editAccess)$('#panel').prepend(editAccess);
 if(p&&!state.pump.pending&&['ficha','historial'].includes(state.tab)){const local=savedSurveyHTML(state.pump.tag);if(local){if(editAccess)editAccess.insertAdjacentHTML('afterend',local);else $('#panel').insertAdjacentHTML('afterbegin',local);}}
 inspectorUI.enhance();
}
function renderPanelContent(){
 if(state.pump?.pending){renderPendingPanel();return;}
 if(state.sector){renderPhotoPanel();return;}
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));const p=state.pump;
 if(!p){$('#panel').innerHTML='<div class="empty-state"><div class="symbol">◎</div>Elegí una bomba en el mapa o en el explorador para abrir su expediente.</div>';return;}
 if(state.tab==='sim'){renderSimPanel(p.data?{...p.data,tag:p.tag}:p);return;}
 if(state.tab==='ficha'){
  const part=parts[state.part];const noteURI='obsidian://open?'+new URLSearchParams({vault:state.vaultName||'autocad el vieno vovatus',file:p.source});
  $('#panel').innerHTML=`<div class="notice">${state.demo?'PROPUESTA: datos e historial ficticios. Las medidas no son especificaciones de compra. ':''}${part?'Despiece según ANSI/ASME B73.1: la arquitectura es la de la norma, verificada contra las placas. Es una visualización de mantenimiento, no es plano de taller. Las medidas de cada pieza siguen pendientes del catálogo del fabricante.':'Ubicación y geometría de demostración. La ficha aporta los datos registrados; no confirma la construcción del modelo.'}</div>${part?`<div class="block"><p class="eyebrow">COMPONENTE ${String(state.part+1).padStart(2,'0')}</p><h2>${esc(part.name)}</h2><p class="eyebrow">${esc(part.pieza)}</p><p class="muted">${esc(part.desc)}</p>${part.ref?`<p class="norma">${esc(part.ref)}</p>`:''}${part.orings?renderOrings():fields(part.fields)}</div>`:`<div class="block"><h3>Identificación</h3>${fields([['Marca','marca'],['Modelo','modelo'],['Serie','serie'],['Tipo de bomba','tipo_bomba'],['Fluido','fluido'],['Confianza registrada','confianza']])}</div><div class="block"><h3>Sellado y repuestos</h3>${fields([['Tipo de sellado','tipo_sellado'],['Sello · modelo','sello_modelo'],['Sello · diámetro (mm)','sello_diametro_mm'],['Elastómero','sello_elastomero'],['Empaque · sección (mm)','empaque_seccion_mm']])}${renderOrings()}</div>`}<div class="block"><h3>Planos vinculados</h3>${p.files.map(f=>f.exists?`<a class="doc" href="/api/document?${new URLSearchParams({tag:p.tag,path:f.path})}">↓ ${esc(f.path.split('/').pop())}</a>`:`<p class="doc muted">${esc(f.path.split('/').pop())} · no encontrado</p>`).join('')||'<p class="muted">Sin archivos vinculados.</p>'}<p class="muted">Láminas: ${esc((Array.isArray(p.data.pid)?p.data.pid:[]).join(' · '))}</p></div><div class="source">${part?esc(NORMA)+'<br>':''}Fuente: ${esc(p.source)}<br>${esc(p.data.fuente_datos||'Fuente por verificar')}</div><div class="panel-actions">${state.demo?'<span class="muted">Ficha local de demostración</span>':`<a href="${esc(noteURI)}">Abrir ficha en Obsidian ↗</a>`}<button type="button" id="download-summary-pdf" class="primary pdf-btn">📄 Descargar resumen PDF</button><button id="print">Imprimir ficha</button></div>`;
  $('#print').onclick=()=>window.print();
  $('#download-summary-pdf')?.addEventListener('click',()=>downloadPumpPDF(p.tag));
 }else if(state.tab==='historial'){
  const rows=p.history.split('\n').filter(l=>/^\|/.test(l)&&!/^\|[\s|:-]+$/.test(l)&&!/^\|\s*Fecha/i.test(l));
  $('#panel').innerHTML=`<p class="eyebrow">REGISTROS DOCUMENTALES</p><h2>${p.reports.length+rows.length} registros encontrados</h2><p class="muted">Se lee el historial de la ficha y los informes de 00-Proyecto/Mantenimiento.</p><div id="chart-mount"></div><button class="primary wide" id="new-report">＋ Registrar mantenimiento</button>${rows.length?`<div class="block"><h3>Historial de la ficha</h3><pre class="markdown-text">${esc(p.history)}</pre></div>`:''}${p.reports.map(r=>`<details class="record"><summary>${esc(r.text.match(/^# (.+)$/m)?.[1]||r.file)}</summary><pre>${esc(r.text)}</pre><span class="source">${esc(r.file)}</span></details>`).join('')}${!p.reports.length&&!rows.length?'<div class="empty-state"><div class="symbol">◷</div>Todavía no hay intervenciones registradas.<br>Esto no significa que la bomba no haya fallado.</div>':''}<div class="block"><h3>Fallas observadas en la ficha</h3><pre class="markdown-text">${esc(p.failures||'Sin fallas documentadas.')}</pre></div><button class="wide" id="analyze">Analizar registros con Gemini ↗</button><button class="wide" id="print-history">Imprimir historial</button>`;
  mountHistoryChart(p);
  $('#new-report').onclick=()=>{const d=new Date();$('#report-form [name=date]').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);$('#report-error').textContent='';$('#report-dialog').showModal();};$('#analyze').onclick=()=>{state.tab='ia';renderPanel();$('#question').value='Analizá el historial de esta bomba. Separá hechos documentados, posibles fallas por verificar y datos que hacen falta.';};$('#print-history').onclick=()=>{document.querySelectorAll('.record').forEach(e=>e.open=true);window.print();};
 }else{
  $('#panel').innerHTML=`<p class="eyebrow">GEMINI / CONTEXTO: ${esc(p.tag)}</p><h2>Consultá tu equipo</h2><p class="muted">Respuestas basadas en la ficha y los informes. Las posibles fallas se presentan como hipótesis para verificar.</p><div class="notice ${state.configured?'green':''}">${state.configured?'Gemini configurado. La consulta enviará los registros de esta bomba a Google.':'Falta conectar tu clave API. No se generan respuestas simuladas.'}</div><button id="configure" class="wide">${state.configured?'Configurar Gemini':'Conectar Gemini'}</button><div class="suggestions"><button data-question="¿Qué medidas de o-rings y qué sello están documentados? Indicá los datos faltantes.">¿Qué sello y o-rings usa? ↗</button><button data-question="Resumí los informes de mantenimiento de esta bomba con fechas y fuentes.">Resumir el mantenimiento ↗</button><button data-question="Con los registros disponibles, ¿qué posibles fallas conviene investigar? Separá evidencia, hipótesis y comprobaciones.">Analizar posibles fallas ↗</button></div><form id="ask-form"><textarea id="question" placeholder="Ej. ¿Qué revisamos si aparece una fuga?" maxlength="4000" required aria-label="Pregunta para Gemini"></textarea><button class="primary wide" ${busyAI?'disabled':''}>${busyAI?'Consultando…':'Consultar Gemini →'}</button></form><div id="ai-output"></div>`;
  $('#configure').onclick=()=>{$('#config-form [name=model]').value=state.model;$('#settings').showModal();};document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;$('#question').focus();});$('#ask-form').onsubmit=ask;
  const answer=state.answers[p.tag];if(answer)showAnswer(answer);
 }
}
function renderOrings(){const rings=state.pump.data.orings;return Array.isArray(rings)&&rings.length?'<div class="block"><h3>O-rings registrados</h3>'+rings.map(o=>`<div class="record"><strong>${esc(o.posicion||'Posición no registrada')}</strong><p class="muted">Medida: ${esc(o.medida||'Sin levantar')}<br>Material: ${esc(o.material||'Sin levantar')}<br>Cantidad: ${esc(o.cantidad??'Sin levantar')}<br>Código: ${esc(o.codigo||'Sin levantar')}</p></div>`).join('')+'</div>':'<p class="notice">No hay medidas de o-rings registradas.</p>';}
function showAnswer(item){const target=$('#ai-output');if(target)target.innerHTML=`<p class="answer-caption">PREGUNTA: ${esc(item.question)}</p><div class="ai-answer">${esc(item.answer)}</div><p class="source">${esc(item.source)}</p>`;}
async function ask(e){e.preventDefault();if(busyAI)return;const tag=state.pump.tag,question=$('#question').value;busyAI=true;const btn=$('#ask-form button');btn.disabled=true;btn.textContent='Consultando…';try{let reportes=[];try{let left=22000;reportes=(await listReports(tag)).map(r=>{const t=(r.text||'').slice(0,Math.min(3000,left));left-=t.length;return{fecha:r.date,titulo:r.title,texto:t,pdf:r.pdf?r.pdf.name+' (PDF adjunto: su contenido no se envía a Gemini)':''};});}catch{}
 const response=await api('/api/ask',{tag,question,component:anatomy?.state.subcomponent||parts[state.part]?.name||'',reportes,notaExpediente:expedienteDe(state.pump?.data?.tag===tag?state.pump.data:{tag}).nota||''});state.answers[tag]={...response,question};if(state.pump?.tag===tag&&state.tab==='ia')showAnswer(state.answers[tag]);}catch(error){if(state.pump?.tag===tag&&$('#ai-output'))$('#ai-output').innerHTML=`<p class="error">${esc(error.message)}</p>`;else toast(error.message);}finally{busyAI=false;if($('#ask-form button')){$('#ask-form button').disabled=false;$('#ask-form button').textContent='Consultar Gemini →';}}}
function setViewButtons(top){$('#top').classList.toggle('active',top);$('#iso').classList.toggle('active',!top);}
function setExplosion(value){state.explode=Number(value);$('#explode').value=value;$('#percent').textContent=value+'%';if(state.sector&&state.detail==='schematic')$('#explode-all').textContent=state.explode>50?'Juntar piezas':'Separar piezas ↗';if(camera)fly([state.explode>30?10:8,8,state.explode>30?21:12],[0,0,0],650);}
$('#explode').oninput=e=>{if(state.sector&&state.detail==='exterior')setPhotoDetail(true);setExplosion(e.target.value);};$('#explode-all').onclick=()=>{if(state.sector&&state.pump&&state.detail==='exterior'){setPhotoDetail(true);setExplosion(100);renderPanel();return;}setExplosion(state.explode>50?0:100);$('#explode-all').textContent=state.explode>50?'Juntar piezas':'Separar piezas ↗';};
function toggleFullscreenInspector(force){
 const inspector=document.querySelector('.inspector');
 if(!inspector) return;
 const isFull=typeof force==='boolean'?force:!inspector.classList.contains('is-fullscreen');
 inspector.classList.toggle('is-fullscreen',isFull);
 const btn=$('#expand-inspector');
 if(btn){
  btn.textContent=isFull?'✕ Salir':'⛶ Pantalla completa';
  btn.title=isFull?'Salir de pantalla completa (Esc)':'Ver ficha en pantalla completa';
  btn.setAttribute('aria-label',isFull?'Salir de pantalla completa':'Pantalla completa');
  btn.setAttribute('aria-pressed',String(isFull));
  btn.classList.toggle('active',isFull);
 }
}
const expBtn=$('#expand-inspector');
if(expBtn) expBtn.onclick=()=>toggleFullscreenInspector();
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&document.querySelector('.inspector.is-fullscreen')){
  toggleFullscreenInspector(false);
 }
});

$('#back').onclick=()=>{
 ++state.loading;
 history.replaceState(null,'',location.pathname+location.search);
 if(photoDetail)photoDetail.visible=false;
 state.view='plant';
 const origin=detailOrigin;detailOrigin=null;
 if(origin){state.area=origin.area;state.filtroInt=origin.filtroInt;state.seccion=origin.seccion;}
 state.pump=null;
 selectPart(null);
 if(pumpGroup){clearGroup(pumpGroup);componentGroups.length=0;}
 if(plant){plant.visible=true;pumpGroup.visible=false;if(origin){controls.minDistance=origin.minDistance;controls.maxDistance=origin.maxDistance;if(Math.abs(origin.aspect-camera.aspect)<.01)fly(origin.position,origin.target);else setTimeout(()=>{if(state.view==='plant')refitCurrentView();},0);}else if(state.area==='integrado')flyIntegrado();else flyArea(state.area);}
 $('#back').hidden=true;
 $('#explode').disabled=true;
 $('#explode-all').disabled=true;
 $('#explode').value=0;
 $('#percent').textContent='0%';
 state.explode=0;
  aplicarFiltroInt();applyArea();
 if($('#area'))$('#area').value=state.area==='integrado'&&state.filtroInt?'sector:'+state.filtroInt:state.area;
 $('#scene-help').textContent='Seleccioná una bomba para acercarte';
 setViewButtons(origin?origin.top:true);
 $('#selected-tag').textContent='Seleccioná una bomba';
 $('#selected-name').textContent='Ficha, componentes e historial en un mismo lugar.';
 $('#source-status').textContent='Esperando selección';
 $('#parts-title').textContent='De la planta al componente';
 $('#part-count').textContent='Seleccioná un equipo';
 $('#parts').innerHTML='<p class="muted">Acercate a una bomba y explorá sus componentes. Las medidas se consultan en la ficha, no se deducen del dibujo.</p>';
 paintPumpLinks(null);
 renderRail();
 renderList();
 renderPanel();
 toggleFullscreenInspector(false);
};
$('#breadcrumb').onclick=()=>{if(!$('#back').hidden)$('#back').click();};
$('#top').onclick=()=>{if(camera){if(state.view==='plant')flyArea(state.area,'superior');else fly([0,25,.1],[0,0,0]);}setViewButtons(true);};$('#iso').onclick=()=>{if(camera){if(state.view==='plant')flyArea(state.area);else fly([10,8,state.explode>30?21:12],[0,0,0]);}setViewButtons(false);};
$('#clear-filters').onclick=()=>{$('#search').value='';$('#tipo').value='';$('#marca').value='';chooseArea('integrado');renderList();$('#search').focus();};
$('#search').oninput=renderList;$('#area').onchange=()=>chooseArea($('#area').value||'planta');for(const id of ['#tipo','#marca'])$(id).onchange=renderList;document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderPanel();});
$('#close-settings').onclick=()=>$('#settings').close();$('#close-report').onclick=()=>$('#report-dialog').close();
$('#config-form').onsubmit=async e=>{e.preventDefault();const form=e.target;try{const r=await api('/api/config',Object.fromEntries(new FormData(form)));state.configured=r.configured;state.model=r.model;form.elements.apiKey.value='';$('#settings').close();renderPanel();toast('Clave guardada solo durante esta sesión.');}catch(e){$('#config-error').textContent=e.message;}};
$('#report-form').onsubmit=async e=>{e.preventDefault();const tag=state.pump.tag,form=e.target,button=form.querySelector('button.primary');button.disabled=true;try{await api('/api/maintenance',{...Object.fromEntries(new FormData(form)),tag});$('#report-dialog').close();form.reset();if(state.pump?.tag===tag)state.pump=await api('/api/pump?tag='+encodeURIComponent(tag));renderPanel();toast(state.demo?'Informe de prueba guardado en la carpeta de demostración.':'Informe guardado en Obsidian.');}catch(e){$('#report-error').textContent=e.message;}finally{button.disabled=false;}};
async function refresh(){try{const r=await api('/api/bootstrap');state.pumps=state.sector?r.sectorPumps:r.pumps;state.demo=r.demo;state.vaultName=r.vaultName;state.token=r.token;state.writable=r.maintenanceWritable;configureReports({writable:r.maintenanceWritable,token:r.token});document.dispatchEvent(new CustomEvent('vocatus:listo'));if(state.pump&&state.sector){const current=state.pumps.find(p=>p.tag===state.pump.tag);if(current)state.pump={...state.pump,data:current};}fillFilters();document.querySelector('.local').textContent=r.maintenanceWritable?'● OBSIDIAN · '+r.vaultName:'● DEMO · REPORTES EN ESTE NAVEGADOR';$('#report-dialog .muted').textContent=r.maintenanceWritable?'Se guardará en la bóveda '+r.vaultName+'.':'Este alojamiento no guarda informes en Obsidian.';state.configured=r.geminiConfigured;state.model=r.model;renderList();if(plant){if(plantRequested)rebuildPlant();else if(needsPlant())ensurePlant();}if(state.pump)renderPanel();if(r.errors.length)console.warn('Fichas antiguas con YAML inválido:',r.errors);}catch(e){toast(e.message);$('#panel').innerHTML=`<p class="error">${esc(e.message)}</p>`;}}
$('#refresh').onclick=async()=>{await refresh();toast('Expedientes actualizados.');};
function setPhotoDetail(schematic){
 state.detail=schematic?'schematic':'exterior';state.part=null;state.explode=0;$('#explode').value=0;$('#percent').textContent='0%';
 if(schematic)anatomy?.set({selected:null,subcomponent:null,isolate:false});else anatomy?.reset();
 if(controls)controls.minDistance=schematic?1:4;
 $('#scene-title').textContent=state.pump.tag+(schematic?' · Anatomía':' · Exterior');
 if(plant)plant.visible=false;if(pumpGroup)pumpGroup.visible=schematic;if(photoDetail)photoDetail.visible=!schematic;
 $('#explode').disabled=!schematic;$('#explode-all').disabled=false;$('#explode-all').textContent=schematic?(state.explode>50?'Juntar piezas':'Separar piezas ↗'):'Ver vista explosionada ↗';
 const identity=state.pump?.data?`${state.pump.data.marca} ${state.pump.data.modelo}`:'bomba seleccionada';
 $('#scene-badge').textContent=state.pump?.pending?(schematic?'ANATOMÍA ILUSTRATIVA · NO IDENTIFICA EL TIPO INSTALADO':state.pump.geometriaIntegrada?'GEOMETRÍA DEL MODELO INTEGRADO · ESCALA CONSERVADA · IDENTIFICACIÓN PENDIENTE':'BOMBA DE REFERENCIA · TIPO Y DIMENSIONES POR CONFIRMAR'):state.pump?.data?.inactive?'EXTERIOR ILUSTRATIVO · SIN USO · MODELO SIN IDENTIFICAR':schematic?`DESPIECE DE REFERENCIA · ${identity.toUpperCase()} · NO ES CAD DEL FABRICANTE`:`EXTERIOR ${identity.toUpperCase()} · BASADO EN FOTOS`;
 $('#parts-title').textContent=schematic?`Despiece de ${identity}`:'Conjunto exterior';$('#part-count').textContent=schematic?(state.pump?.data?.variant==='goulds'?'8':'10')+' componentes de referencia · ficha individual':'Carcasa · guarda · motor · cubierta';
 const componentButtons=schematic?parts.map((part,index)=>state.pump?.data?.variant==='goulds'&&(index===7||index===8)?'':`<button class="part-button" data-part="${index}"><span>${String(index+1).padStart(2,'0')}</span>${esc(partName(index))}</button>`).join(''):'';
 $('#parts').innerHTML='<button id="switch-detail">'+(schematic?'← Volver al exterior de esta bomba':'Ver vista explosionada de esta bomba ↗')+'</button>'+componentButtons;
 $('#switch-detail').onclick=()=>{setPhotoDetail(!schematic);renderPanel();};if(state.pump?.data?.inactive){$('#switch-detail').disabled=true;$('#explode').disabled=true;$('#explode-all').disabled=true;}document.querySelectorAll('#parts [data-part]').forEach(button=>button.onclick=()=>selectPart(Number(button.dataset.part)));syncAnatomyTools();renderRail();if(camera){const box=schematic?anatomy?.bounds():photoDetail?cajaVisible(THREE,photoDetail,{incluirReferencia:true}):null;if(box&&!box.isEmpty()){fitPumpMinimum(box);const [pos,obj]=encuadrar(box,new THREE.Vector3(...(schematic?[-8,7,12]:[5,4,7])),1.15,detailRailFraction());fly(pos,obj);}else fly(schematic?[-8,7,12]:[5,4,7],[0,schematic?0:1,0]);}syncAnatomyTools();renderRail();
}
function syncAnatomyTools(){
 const available=!!anatomy&&!!state.pump&&!state.pump.data.inactive&&state.view==='pump';
 $('#anatomy-tools').hidden=!available;
 const mode=anatomy?.state||{};
 for(const [id,key] of [['anatomy-cut','cutaway'],['anatomy-transparent','transparent'],['anatomy-isolate','isolate']])$('#'+id).setAttribute('aria-pressed',String(!!mode[key]));
 $('#anatomy-cut').textContent=mode.cutaway?'Reponer 1/4':'Retirar 1/4';
 $('#anatomy-isolate').disabled=state.part===null||!available;
 $('#anatomy-status').textContent=state.detail==='exterior'?'Abrí el conjunto o retirale 1/4 a la carcasa para ver el interior.':state.part!==null?`Pieza ${String(state.part+1).padStart(2,'0')} · ${mode.subcomponent||partName(state.part)}${mode.isolate?' · aislada':''}. Su información está en la ficha.`:mode.cutaway?'Se retiró 1/4 de las cubiertas: podés ver el impulsor, eje, sello y el interior del motor. Pulsá Reponer 1/4 para cerrar.':'Conjunto armado. Retirá 1/4 o separá las piezas para ver su interior.';
}
function ensureAnatomy(){
 if(!state.pump||state.pump.data.inactive||!anatomy)return false;
 if(state.detail!=='schematic'){setPhotoDetail(true);renderPanel();}
 return true;
}
function fitAnatomy(){
 if(!camera||!anatomy)return;
 const bounds=anatomy.bounds();if(bounds.isEmpty())return;fitPumpMinimum(bounds);
 const [position,target]=encuadrar(bounds,new THREE.Vector3(state.part===9?8:-8,6,12),1.15,detailRailFraction());
 fly(position,target,500);
}
$('#anatomy-cut').onclick=()=>{if(!ensureAnatomy())return;anatomy.set({cutaway:!anatomy.state.cutaway});syncAnatomyTools();fitAnatomy();};
$('#anatomy-transparent').onclick=()=>{if(!ensureAnatomy())return;anatomy.set({transparent:!anatomy.state.transparent});syncAnatomyTools();};
$('#anatomy-isolate').onclick=()=>{if(!ensureAnatomy()||state.part===null)return;anatomy.set({isolate:!anatomy.state.isolate});syncAnatomyTools();fitAnatomy();};
$('#anatomy-fit').onclick=()=>{if(ensureAnatomy())fitAnatomy();};
function refitCurrentView(){
 if(!camera||!controls||(detailFlightTicket!==null&&detailFlightTicket===state.loading))return;
 if(state.view==='plant'){if(state.area==='integrado'&&state.filtroInt)flyIntegrado();else flyArea(state.area,$('#top').classList.contains('active')?'superior':undefined);return;}
 const box=state.detail==='schematic'?anatomy?.bounds():photoDetail?cajaVisible(THREE,photoDetail,{incluirReferencia:true}):null;
 if(!box||box.isEmpty())return;const direction=camera.position.clone().sub(controls.target);if(direction.lengthSq()<1e-6)direction.set(5,4,7);const [pos,obj]=encuadrar(box,direction,1.15,detailRailFraction());fly(pos,obj);
}
function resetAnatomy(){
 if(!ensureAnatomy())return;anatomy.reset();state.part=null;setExplosion(0);selectPart(null);syncAnatomyTools();fitAnatomy();
}
$('#anatomy-reset').onclick=resetAnatomy;
$('#anatomy-assembled').onclick=resetAnatomy;
function selectPhotoPump(tag){
 const p=state.pumps.find(p=>p.tag===tag);if(!p)return;const tip=$('#part-tip');if(tip)tip.hidden=true;resaltarBomba(null);rememberDetailOrigin();const ticket=++state.loading;
 history.replaceState(null,'','#'+p.tag);
 state.pump={tag,data:p,photo:true};document.dispatchEvent(new CustomEvent('vocatus:bomba',{detail:tag}));
 document.querySelectorAll('#area-menu [data-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.area==='sector:'+areaOf(p))));
 state.tab=state.tab==='sim'?'sim':'ficha';state.part=null;
 api('/api/pump?tag='+encodeURIComponent(tag)).then(current=>{if(ticket!==state.loading)return;state.pump={...current,photo:true};renderPanel();}).catch(error=>{if(ticket===state.loading)toast(error.message);});
 $('#selected-tag').textContent=tag;$('#selected-name').textContent=`${p.marca} ${p.modelo} · ${p.nombre}`;$('#source-status').textContent=p.inactive?'SIN USO · SIN DATOS TÉCNICOS':'DATOS APORTADOS · GEOMETRÍA APROXIMADA';
 $('#scene-title').textContent=tag+' · Exterior';$('#breadcrumb').textContent='PLANTA / '+areaName(state.area==='integrado'?(state.filtroInt||areaOf(p)):areaOf(p)).toUpperCase()+' / '+tag;$('#back').hidden=false;
 $('#scene-help').textContent='Arrastrá para girar · Rueda para acercarte';
 const show=()=>{if(ticket!==state.loading)return;state.view='pump';if($('#torre-planta-tools'))$('#torre-planta-tools').hidden=true;if(pumpGroup){clearGroup(pumpGroup);componentGroups.length=0;for(let i=markers.length-1;i>=0;i--)if(markers[i].kind==='part'){markers[i].el.remove();markers[i].leader?.remove();markers.splice(i,1);}buildPump(p.variant);}if($('#torre-tools'))$('#torre-tools').hidden=true;if($('#integrado-tools'))$('#integrado-tools').hidden=true;if(scene){if(photoDetail){clearGroup(photoDetail);scene.remove(photoDetail);}photoDetail=exterior(THREE,p.scale*1.7,p.variant);if(areaOf(p)==='tanques')cubiertaFotografica(THREE,photoDetail);scene.add(photoDetail);}setPhotoDetail(false);renderPanel();};
 if(plant?.visible&&areaOf(p)!==state.area&&state.area!=='planta'&&state.area!=='integrado')setArea(areaOf(p),false);transitionToPump(ticket,pumpWorld(p.tag)||new THREE.Vector3(p.x,0,p.z),show);renderList();renderPanel();setViewButtons(false);

}

async function downloadPumpPDF(tag){
 if(!tag) return;
 const btns=[$('#download-summary-pdf-header'),$('#download-summary-pdf-bottom'),$('#download-summary-pdf')].filter(Boolean);
 btns.forEach(b=>{b.disabled=true;b.dataset.prevText=b.textContent;b.textContent='Generando PDF…';});
 toast('Generando resumen técnico en PDF…');
 try{
  let reportes=[];
  try{reportes=await listReports(tag);}catch{}
  const res=await fetch('/api/pump-summary-pdf',{
   method:'POST',
   headers:{'Content-Type':'application/json','X-Local-Token':state.token},
   body:JSON.stringify({tag,reportes})
  });
  if(!res.ok){
   const errData=await res.json().catch(()=>({}));
   throw new Error(errData.error||`Error ${res.status} al generar el PDF.`);
  }
  const blob=await res.blob();
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`Resumen_Tecnico_${tag}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  toast(`Resumen técnico de ${tag} descargado.`);
 }catch(e){
  toast('Error al descargar PDF: '+e.message);
 }finally{
  btns.forEach(b=>{b.disabled=false;if(b.dataset.prevText)b.textContent=b.dataset.prevText;});
 }
}

// Resumen rápido en la cabecera del expediente: datos de operación y componentes críticos.
function demoTemperature(tag){
 try{return rangoTemperaturaTrabajo(JSON.parse(localStorage.getItem('vocatus-temperatura-demo-'+tag)||'null')||{});}catch{return null;}
}
function paintPumpSummary(p){
 let el=document.getElementById('pump-resumen');
 if(!el){el=document.createElement('div');el.id='pump-resumen';$('#source-status').after(el);}
 if(!p){el.hidden=true;el.innerHTML='';return;}
 const ok=v=>v!=null&&String(v).trim()!==''&&!/^(por confirmar|sin dato)/i.test(String(v).trim());
 const spec=k=>(p.specs||[]).find(([n])=>n===k)?.[1];
 const fila=(k,v,part)=>`<div class="rs-row${part!=null?' rs-link':''}"${part!=null?` data-part="${part}" title="Ver ${esc(k.toLowerCase())} en el 3D"`:''}><dt>${esc(k)}</dt><dd${ok(v)?'':' class="rs-pend"'}>${ok(v)?esc(v):'Por confirmar'}</dd></div>`;
 const m=p.motor||{},se=p.seal||{},ro=p.rodamientos||{};
 const motor=[m.marca,m.potencia,m.rpm].filter(ok).join(' · ');
 const sello=[se.tipo,ok(se.diametro)?'eje '+se.diametro:''].filter(ok).join(' · ');
 const recorded=rangoTemperaturaTrabajo(p),temperature=state.demo?demoTemperature(p.tag)||recorded:recorded;
 const tempNote=state.demo?'DEMO · Guardado solo en este navegador; esta edición no aparece en el PDF.':temperature?.fuente?`Fuente declarada: ${esc(temperature.fuente)} · Ficha ${esc(p.tag)}.`:`Sin rango documentado para ${esc(p.tag)}.`;
 const tempEditor=`<div class="rs-temperature"><button type="button" class="rs-edit" data-temp-edit aria-expanded="false">${temperature?'Actualizar':'Agregar'} rango de temperatura</button><form class="rs-temp-form" hidden><label>Mínima °C<input name="min" type="number" step="any" min="-273.15" value="${temperature?.min??''}" required></label><label>Máxima °C<input name="max" type="number" step="any" min="-273.15" value="${temperature?.max??''}" required></label><label>Fuente del dato<input name="source" maxlength="160" value="${esc(temperature?.fuente||'')}" placeholder="Medición, informe o placa" required></label><label>Registrado por<input name="author" maxlength="100" placeholder="Nombre" required></label><p class="rs-temp-error" role="alert"></p><button type="submit" class="primary">Guardar rango</button></form><p class="rs-src">${tempNote}</p></div>`;
 el.hidden=false;
 el.innerHTML=`<div class="rs-card"><h4>Resumen de la bomba${p.enUso===false||p.inactive?' <span class="rs-off">SIN USO</span>':''}</h4><dl>${fila('Servicio',p.servicio)}${fila('Ubicación',p.nombre)}${fila('Tamaño',p.size)}${fila('Caudal',spec('Caudal'))}${fila('Altura',spec('Altura'))}${fila('Velocidad',spec('Velocidad de bomba'))}${fila('Impulsor',spec('Impulsor'))}${fila('Temperatura de trabajo',formatoRangoTemperatura(temperature))}${fila('Motor',motor,9)}</dl>${tempEditor}</div><div class="rs-card"><h4>Componentes críticos</h4><dl>${fila('Sello mecánico',sello,5)}${fila('Elastómero eje (acople)',p.acople,8)}${fila('Rol delantero',ro.delantero,7)}${fila('Rol trasero',ro.trasero,7)}${ok(p.observaciones)?fila('Observaciones',p.observaciones):''}</dl><p class="rs-src">Componentes según la ficha y el Excel; los campos vacíos siguen pendientes.</p></div>`;
 el.querySelectorAll('[data-part]').forEach(r=>r.onclick=()=>{if(typeof selectPart==='function')selectPart(Number(r.dataset.part));});
 const edit=el.querySelector('[data-temp-edit]'),form=el.querySelector('.rs-temp-form');
 const tempField=name=>form.elements.namedItem(name);
 edit.onclick=()=>{form.hidden=!form.hidden;edit.setAttribute('aria-expanded',String(!form.hidden));if(!form.hidden)tempField('min').focus();};
 form.onsubmit=async event=>{
  event.preventDefault();const error=form.querySelector('.rs-temp-error'),submit=form.querySelector('[type=submit]');error.textContent='';
  const min=Number(tempField('min').value),max=Number(tempField('max').value);
  if(!Number.isFinite(min)||!Number.isFinite(max)||min>max||min< -273.15){error.textContent='Revisá el rango: la mínima debe ser menor o igual a la máxima.';return;}
  const update={tag:p.tag,min,max,source:tempField('source').value.trim(),author:tempField('author').value.trim()};
  submit.disabled=true;
  try{
   if(state.demo){localStorage.setItem('vocatus-temperatura-demo-'+p.tag,JSON.stringify({temperatura_trabajo_min_c:min,temperatura_trabajo_max_c:max,temperatura_trabajo_fuente:update.source,author:update.author}));paintPumpSummary(p);toast('Rango DEMO guardado en este navegador.');}
   else{await api('/api/temperature-range',update);await refresh();toast('Rango guardado en la ficha '+p.tag+'.');}
  }catch(e){error.textContent=e.message||'No se pudo guardar el rango.';submit.disabled=false;}
 };
}
function paintPumpLinks(p){
 let el=document.getElementById('pump-links');
 if(!el){el=document.createElement('div');el.id='pump-links';$('#source-status').after(el);}
 if(!p){el.hidden=true;el.innerHTML='';$('#pump-meta')?.remove();return;}
 paintPumpMeta(p);
 el.hidden=false;const L=linksBomba(p),familia=L?.alcance==='familia'?' · familia':'';
 el.innerHTML=`<nav class="quick-actions" aria-label="Acciones de la bomba"><button type="button" data-quick="locate">📍 Ubicar</button><button type="button" data-quick="photos">📷 Fotos</button>${L?`<a href="${esc(L.manual.u)}" target="_blank" rel="noopener noreferrer" title="${esc(L.nota||L.manual.t)}">📘 Manual${familia}</a>`:'<button type="button" disabled>📘 Manual pendiente</button>'}<button type="button" data-quick="maintenance">🛠 Mantenimiento</button></nav><details class="secondary-menu" open><summary>Más acciones</summary><div class="secondary-actions"><a href="/levantamiento.html?tag=${encodeURIComponent(p.tag)}#editar-general">Actualizar datos</a><button type="button" id="download-summary-pdf-header">Resumen PDF</button>${L?`<a href="${esc(L.planos.u)}" target="_blank" rel="noopener noreferrer">Planos${familia}</a>`:''}<a href="/solicitud.html?tag=${encodeURIComponent(p.tag)}">Pedir a bodega</a><a href="/equipo.html?tag=${encodeURIComponent(p.tag)}">Mover o cambiar</a></div></details>`;
 el.querySelector('[data-quick=locate]').onclick=locateSelectedPump;
 el.querySelector('[data-quick=photos]').onclick=()=>{state.tab='ficha';renderPanel();inspectorUI.show($('#fuentes-'+p.tag));};
 el.querySelector('[data-quick=maintenance]').onclick=()=>{state.tab='historial';renderPanel();inspectorUI.show($('#rep-form')||$('#new-report'));};
 $('#download-summary-pdf-header').onclick=()=>downloadPumpPDF(p.tag);
}
function paintPumpMeta(p){
 let el=$('#pump-meta');if(!el){el=document.createElement('div');el.id='pump-meta';$('#source-status').after(el);}
 const c=completeness(p),v=verificationOf(p);
 const doc=p.documental||p,enRep=doc.estado_operativo==='en_reparacion';
 el.innerHTML=`${enRep?`<span class="chip no reparacion">En reparación desde ${esc(doc.reparacion_desde||'—')}: ${esc(doc.reparacion_motivo||'')}</span>`:''}<span class="chip">Completos ${c.done}/${c.total}</span><span class="chip ${v.verified?'ok':'no'}">${esc((state.demo?'DEMO · ':'')+verificationText(v))}</span><p class="storage-note">${esc(storageDescription(state))}</p>`;
}
function locateSelectedPump(){
 const p=state.pump?.data;if(!p)return;
 ++state.loading;detailFlightTicket=null;detailOrigin=null;state.view='plant';state.tab='ficha';state.explode=0;
 if(photoDetail)photoDetail.visible=false;
 if(plant&&camera){plant.visible=true;pumpGroup.visible=false;state.area=pumpObjectsInt[p.tag]?'integrado':areaOf(p);state.filtroInt=state.area==='integrado'?areaOf(p):null;aplicarFiltroInt();applyArea();const w=pumpWorld(p.tag);if(w){controls.minDistance=.5;fly([w.x+5,w.y+7,w.z+6],[w.x,w.y+1,w.z],600);resaltarBomba(p.tag);}}
 $('#explode').disabled=true;$('#explode-all').disabled=true;$('#back').hidden=false;
 markers.forEach(m=>m.el.classList.toggle('located',m.kind==='pump'&&m.id===p.tag));
 renderList();renderPanel();toast(p.tag+' ubicada; su ficha permanece abierta.');
}
function showHistoryLoadError(error,tag){
 if(state.tab!=='historial'||state.pump?.tag!==tag)return;
 const mount=$('#chart-mount');if(!mount)return;
 let notice=$('#history-load-error');
 if(!notice){notice=document.createElement('section');notice.id='history-load-error';notice.className='notice';notice.setAttribute('role','alert');notice.innerHTML='<p class="form-error"></p><button type="button" class="wide">Reintentar cargar historial</button>';mount.before(notice);}
 notice.querySelector('p').textContent=error.message||'No se pudo leer el historial. Tus reportes se conservan.';
 notice.querySelector('button').onclick=()=>{notice.remove();const pump=state.pump;if(pump?.tag!==tag||state.tab!=='historial')return;if($('#rep-list'))refreshPhotoHistory(pump);else mountHistoryChart(pump);};
}
function refreshPhotoHistory(pump){
 $('#history-load-error')?.remove();
 const reports=listReports(pump.tag||pump.data?.tag);
 return Promise.all([mountHistoryChart(pump,reports),paintReports(pump.tag||pump.data?.tag,reports)]);
}
document.addEventListener('vocatus:storage-ready',()=>{if($('#history-load-error')&&state.tab==='historial'&&state.pump){if($('#rep-list'))refreshPhotoHistory(state.pump);else{$('#history-load-error').remove();mountHistoryChart(state.pump);}}});
async function mountHistoryChart(pump,reports){
 const mount=document.getElementById('chart-mount');
 if(!mount) return;
 const tag=pump.tag||pump.data?.tag||'EQUIPO';
 const pData=pump.data||pump;
 // Referencia de diseño: solo la que figura en la ficha. Nunca se muestra como lectura.
 let nominalFlow=null,nominalPressure=null;
 if(Array.isArray(pData.specs)){
  const flowRow=pData.specs.find(([k])=>/caudal/i.test(k));
  const m=flowRow?.[1]?.match(/(\d+(?:[.,]\d+)?)/);
  if(m){const val=parseFloat(m[1].replace(',','.'));nominalFlow=/gpm/i.test(flowRow[1])?Number((val*0.227124707).toFixed(1)):val;}
 }
 if(pData.caudal_m3h) nominalFlow=parseFloat(pData.caudal_m3h);
 if(pData.presion_bar) nominalPressure=parseFloat(pData.presion_bar);
 if(pData.inactive){mount.innerHTML='<p class="muted">Equipo SIN USO: sin lecturas de presión ni caudal para graficar.</p>';return;}
 // Serie DEMO (ver historial-demo.js): solo en modo demostración y rotulada como tal.
 const records=state.demo&&!pump.photo?demoReadings(pData,nominalPressure||2.1,nominalFlow||12.5).map(r=>({...r,demo:true,origen:'demo'})):[];
 let ambiguos=0;
 try{
  for(const r of await (reports||listReports(tag))){
   const m=reportMeasurements(r);
   if(m.origen.pressure==='ambiguo'||m.origen.flow==='ambiguo')ambiguos++;
   if(m.pressure===null&&m.flow===null)continue;
   const origen=[m.origen.pressure,m.origen.flow].includes('registro')?'registro':'texto';
   records.push({fecha:r.date||'Sin fecha',tipo:r.demonstration?'Informe DEMO':'Informe de mantenimiento',demo:!!r.demonstration,origen,
    presion:m.pressure,caudal:m.flow,detalle:r.title||'Informe sin título',responsable:r.author||''});
  }
 }catch(error){if(mount.isConnected&&state.pump?.tag===tag){mount.replaceChildren();showHistoryLoadError(error,tag);}return;}
 records.sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
 if(!mount.isConnected||state.pump?.tag!==tag)return;
 renderRechartsHistory(mount,{pumpTag:tag,records,nominalPressure,nominalFlow,ambiguos});
}

function reportUI(){return `<div id="rep-list" class="report-history-list"></div><section class="block report-box" id="report-box"><h3>Agregar reporte</h3><form id="rep-form" autocomplete="off"><label>Fecha<input type="date" name="date" required></label><label>Responsable<input name="author" maxlength="200" ${reportsInObsidian()?'required':''}></label><label>Título<input name="title" maxlength="160" placeholder="Ej. cambio de sello mecánico" required></label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><label>Presión medida (bar)<input name="pressure" type="number" step="0.1" placeholder="Ej. 2.1"></label><label>Caudal medido (m³/h)<input name="flow" type="number" step="0.1" placeholder="Ej. 18.0"></label></div><label>Reporte<textarea name="text" rows="5" maxlength="7500" placeholder="Observaciones, trabajo realizado, repuestos y pendientes…"></textarea></label><label>o subir un PDF<input type="file" name="file" accept="application/pdf,.pdf"></label><p class="muted">${reportsInObsidian()?'Se guarda en Obsidian, en '+esc(state.vaultName)+'. El PDF queda adjunto al informe.':'Se guarda en este navegador. Los reportes no se comparten entre equipos.'}${state.demo?' Registro marcado DEMO.':''}</p><p id="rep-error" class="form-error" role="alert"></p><button class="primary wide">${reportsInObsidian()?'Guardar en Obsidian':'Guardar en este navegador'}</button></form></section>`;}
async function paintReports(tag,reports){
 const box=$('#rep-list');if(!box)return;
 let items=[];try{items=await (reports||listReports(tag));}catch(e){if(box.isConnected&&state.pump?.tag===tag){box.replaceChildren();showHistoryLoadError(e,tag);}return;}
 if(!box.isConnected||state.pump?.tag!==tag)return;
 box.innerHTML=(reportsInObsidian()&&items.some(r=>r.source==='browser')?'<button class="wide" id="import-reports">Importar reportes del navegador a Obsidian</button>':'')+(items.length?`<h4>Reportes de campo (${items.length})</h4>`+items.map(r=>`<article class="record" data-id="${esc(r.id)}"><strong>${esc(r.date)} · ${esc(r.title)}</strong><small>${r.source==='obsidian'?'Obsidian':'Solo en este navegador'}${r.demonstration?' · DEMO':''}${r.author?' · '+esc(r.author):''}</small>${r.text?`<p class="report-text">${esc(r.text)}</p>`:''}${evidenceMarkup(r.evidence||[])}${r.pdf?`<p><a class="doc" href="#" data-pdf="${esc(r.id)}">📄 ${esc(r.pdf.name)} · ${(r.pdf.size/1024).toFixed(0)} KB</a></p>`:''}<button type="button" class="link-btn" data-del="${esc(r.id)}">Eliminar reporte</button></article>`).join(''):'<p class="muted">Todavía no hay reportes de campo para esta bomba.</p>');
 const importButton=box.querySelector('#import-reports');if(importButton)importButton.onclick=async()=>{importButton.disabled=true;try{const count=await importReports(tag);toast(count+' reportes importados a Obsidian.');await paintReports(tag);}catch(e){toast(e.message);importButton.disabled=false;}};
 box.querySelectorAll('.record[data-id]').forEach(el=>bindEvidenceGallery(el,items.find(r=>r.id===el.dataset.id)?.evidence||[]));
 box.querySelectorAll('[data-pdf]').forEach(a=>a.onclick=e=>{e.preventDefault();const r=items.find(x=>x.id===a.dataset.pdf);if(r?.pdf?.url){const link=document.createElement('a');link.href=r.pdf.url;link.download=r.pdf.name;link.click();return;}if(r?.pdf?.blob){const u=URL.createObjectURL(r.pdf.blob);const link=document.createElement('a');link.href=u;link.download=r.pdf.name||'documento.pdf';link.target='_blank';link.rel='noopener';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(u),60000);}});
 box.querySelectorAll('[data-del]').forEach(b=>b.onclick=async()=>{try{const record=items.find(r=>r.id===b.dataset.del);await deleteReport(record);toast(record.source==='obsidian'?'Informe enviado a la papelera de Obsidian.':'Reporte eliminado del navegador.');await paintReports(tag);if(state.pump?.tag===tag)mountHistoryChart(state.pump);}catch(e){toast(e.message);}});
}
function initReports(tag,load=true){
 const f=$('#rep-form');if(!f)return;const d=new Date();f.date.value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
 f.onsubmit=async e=>{e.preventDefault();const err=$('#rep-error');err.textContent='';const btn=f.querySelector('button');btn.disabled=true;
  const pres=f.pressure?.value?f.pressure.value+' bar':'';
  const flow=f.flow?.value?f.flow.value+' m3/h':'';
  const extra=[pres&&`Presión: ${pres}`,flow&&`Caudal: ${flow}`].filter(Boolean).join(' · ');
  const fullText=[f.text.value,extra].filter(Boolean).join('\n\n');
  try{await addReport({tag,date:f.date.value,title:f.title.value,author:f.author.value,text:fullText,file:f.file.files[0]||null,pressure:f.pressure?.value,flow:f.flow?.value});f.title.value='';f.text.value='';f.file.value='';if(f.pressure)f.pressure.value='';if(f.flow)f.flow.value='';toast(reportsInObsidian()?'Informe guardado en Obsidian.':'Reporte guardado en este navegador.');await paintReports(tag);if(state.pump)mountHistoryChart(state.pump);}
  catch(x){err.textContent=x.message||'No se pudo guardar el reporte.';}finally{btn.disabled=false;}};
 if(load)paintReports(tag);
}
async function renderHistoryPhotos(p){
 const root=$('#history-photos');if(!root)return;const target=root.querySelector('[data-history-images]'),tag=p.tag;
 const paint=async()=>{try{const act=await fotosActualizadas(tag,{writable:!!state.writable});if(!root.isConnected||state.pump?.tag!==tag)return;const orig=originales(p,expedienteDe(p));const labels={placa1:'Placa de la bomba',placa2:'Placa del motor',bomba:'Foto de la bomba',posicion:'Posición',motor:'Motor',sello:'Sello mecánico',empaque:'Empaque',orings:'O-rings',rodamientos:'Rodamientos',acople:'Acople'};const entries=Object.entries(labels).flatMap(([slot,label])=>{const a=act[slot],o=orig[slot],src=a?.url||o?.src;if(!src)return[];return`<figure><a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(label)} de ${esc(tag)}" loading="lazy"></a><figcaption>${esc(label)}<small>${a?(a.cloud?'Compartida en línea':a.local?'Guardada en este navegador':'Obsidian'):'Original del expediente · asociación por revisar'}</small></figcaption></figure>`;});target.innerHTML=entries.length?'<div class="history-photo-grid">'+entries.join('')+'</div>':'<p>No hay fotos asociadas en este navegador. Si las tomaste en el teléfono, descargalas allí y cargá el archivo aquí.</p>';if(act.warning){const warning=document.createElement('p');warning.className='form-error';warning.textContent=act.warning;target.prepend(warning);}}catch(error){if(root.isConnected){target.replaceChildren();const text=document.createElement('p');text.className='form-error';text.textContent=error.message;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=paint;target.append(text,retry);}}};
 bindPhotoTransfers(root,tag,{writable:!!state.writable,token:state.token},paint);await paint();
}
function representedSubparts(index){
 const names=componentGroups[index]?.userData.subcomponents||[];
 return names.length?'<div class="block"><h3>Componentes representados en 3D</h3><div class="subcomponent-list">'+names.map(name=>'<button type="button" data-subcomponent="'+esc(name)+'" aria-pressed="'+String(anatomy?.state.subcomponent===name)+'">'+esc(name)+'</button>').join('')+'</div><p class="muted">Elegí un componente para resaltarlo y aislarlo. Detalle visual de referencia; verificar el despiece del equipo instalado.</p></div>':'';
}
function renderPhotoPanel(){
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
 const p=state.pump?.data;
 paintPumpLinks(p);
 if(!p&&state.area==='integrado'){$('#panel').innerHTML='<p class="eyebrow">PLANTA COMPLETA</p><h2>Seleccioná un sector y una bomba</h2><p class="notice">Cada bomba tiene su selección individual, incluso cuando hay varias juntas. Elegí un sector para ver sus etiquetas, o buscá una bomba en el explorador.</p><p>Las fichas existentes conservan sus datos. En los equipos pendientes, los campos e imágenes quedan vacíos para completar el levantamiento.</p>';return;}
 if(!p){$('#panel').innerHTML=`<p class="eyebrow">SECTOR FOTOGRAFIADO · 07 OCT 2026</p><h2>Seleccioná una bomba</h2><p class="notice">El expediente mostrará únicamente la bomba elegida. Los datos de sellos, o-rings e historial están preparados para la demostración y se distinguen de la evidencia real.</p><img src="${photo3URL('142609')}" alt="Vista elevada de los tanques del sector"><p class="muted">Referencia utilizada para orientar y completar los tanques del render.</p>`;return;}

 const demo=state.demo?'<span class="demo-chip">DEMO · POR CONFIRMAR</span>':'<span class="demo-chip">DATOS DOCUMENTALES / POR CONFIRMAR</span>';
 const fieldRows=rows=>'<dl class="fields">'+rows.map(([key,value])=>`<div class="field"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')+'</dl>';
 if(state.tab==='historial'){
  $('#panel').innerHTML=`<p class="eyebrow">HISTORIAL · ${esc(p.tag)}</p><h2>${esc(p.tag)} · ${esc(p.marca)} ${esc(p.modelo)}</h2><nav class="history-nav" aria-label="Apartados de la bomba"><button type="button" data-history-jump="history-equipment">Ficha</button><button type="button" data-history-jump="rep-list">Registros</button><button type="button" data-history-jump="history-photos">Fotos</button></nav><p class="notice">${reportsInObsidian()?'Ficha e intervenciones guardadas en Obsidian.':'Ficha documental y reportes guardados en este navegador; no se sincronizan entre equipos.'} No se presentan ejemplos como intervenciones de esta bomba.</p><section class="history-equipment" id="history-equipment"><h3>Ficha de ${esc(p.tag)}</h3>${fieldRows([['Ubicación',p.nombre||p.ubicacion||'Por confirmar'],['Fabricante',p.marca||'Por confirmar'],['Modelo',p.modelo||'Por confirmar'],['Serie',p.serie||'Por confirmar'],['Servicio',p.servicio||p.fluido||'Por confirmar'],...(p.specs||[])])}<a class="button-link" href="/levantamiento.html?tag=${encodeURIComponent(p.tag)}">Actualizar datos y componentes</a><button type="button" class="wide" id="history-model">${document.body.classList.contains('hist-model-open')?'Volver a la ficha':'Ver despiece 3D'}</button></section>${state.pump.history?.trim()?'<section class="history-note"><h3>Historial escrito en la ficha</h3><pre class="markdown-text">'+esc(state.pump.history)+'</pre><small>Fuente: '+esc(state.pump.source||'Ficha del equipo')+'</small></section>':''}${reportUI()}<section class="history-photos" id="history-photos"><h3>Fotos de ${esc(p.tag)}</h3><div data-history-images>Leyendo fotos guardadas…</div><a class="button-link" href="/levantamiento.html?tag=${encodeURIComponent(p.tag)}#editar-fotos">Actualizar fotos y componentes</a>${photoTransferHTML(p.tag,{writable:!!state.writable})}</section><details class="history-measurements"><summary>Ver gráfico de mediciones registradas</summary><div id="chart-mount"></div></details><div class="block"><h3>Posibles fallas a vigilar ${demo}</h3><ul><li>Fuga progresiva en el sello mecánico.</li><li>Elastómero hinchado, endurecido o incompatible con el fluido.</li><li>Vibración por desalineación del acople.</li><li>Ruido de cavitación por restricción en succión.</li><li>Temperatura anormal en rodamientos.</li></ul></div>`;initReports(p.tag,false);refreshPhotoHistory(state.pump);renderHistoryPhotos(p);$('#panel').querySelectorAll('[data-history-jump]').forEach(button=>button.onclick=()=>document.getElementById(button.dataset.historyJump)?.scrollIntoView({block:'start',behavior:'auto'}));const modelButton=$('#history-model');if(modelButton)modelButton.onclick=()=>{const open=!document.body.classList.contains('hist-model-open');document.body.classList.toggle('hist-model-open',open);window.vocatus.explode(open?100:0);window.dispatchEvent(new Event('resize'));};return;
 }
 if(state.tab==='ia'){
  $('#panel').innerHTML=`<p class="eyebrow">GEMINI / CONTEXTO: ${esc(p.tag)}</p><h2>${esc(p.marca)} ${esc(p.modelo)}</h2><p class="notice">Gemini analiza solamente el expediente de esta bomba seleccionada. Distingue los datos aportados de los ejemplos DEMO y de los campos pendientes.</p>${fieldRows([['Fluido registrado',p.servicio],['Sellado',p.seal.tipo],['Elastómero',p.seal.elastomero],['Registros de demo',String(p.history.length)]])}<div class="notice ${state.configured?'green':''}">${state.configured?'Gemini configurado. La consulta enviará a Google el expediente de esta bomba, con los ejemplos DEMO identificados.':'Falta conectar tu clave API. No se generan respuestas simuladas.'}</div><button id="configure" class="wide">${state.configured?'Configurar Gemini':'Conectar Gemini'}</button><div class="suggestions"><button data-question="¿Qué sello y o-rings aparecen en este expediente y qué datos faltan confirmar?">¿Qué sello y o-rings usa? ↗</button><button data-question="Resumí el historial DEMO de esta bomba, separado por fechas.">Resumir el mantenimiento ↗</button><button data-question="¿Qué posibles fallas conviene investigar? Separá evidencia, hipótesis y comprobaciones.">Analizar posibles fallas ↗</button></div><form id="ask-form"><textarea id="question" placeholder="Ej. ¿Qué revisamos si aparece una fuga?" maxlength="4000" required aria-label="Pregunta para Gemini"></textarea><button class="primary wide" ${busyAI?'disabled':''}>${busyAI?'Consultando…':'Consultar Gemini →'}</button></form><div id="ai-output"></div>`;
  $('#configure').onclick=()=>{$('#config-form [name=model]').value=state.model;$('#settings').showModal();};document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;$('#question').focus();});$('#ask-form').onsubmit=ask;const answer=state.answers[p.tag];if(answer)showAnswer(answer);return;
 }
 if(state.tab==='sim'){renderSimPanel(p);return;}
 const rings=p.orings.map(r=>`<div class="record"><strong>${esc(r.posicion)}</strong>${fieldRows([[state.demo?'Medida de demo':'Medida registrada',r.medida],[state.demo?'Material de demo':'Material registrado',r.material],['Cantidad',String(r.cantidad)],[state.demo?'Código de demo':'Código registrado',r.codigo]])}</div>`).join('');
 const linkRows=list=>list.map(l=>`<li><a href="${l.u}" target="_blank" rel="noopener noreferrer">${esc(l.t)} ↗</a>${l.k?` <span class="kind">${esc(l.k)}</span>`:''}${l.nota?`<small>${esc(l.nota)}</small>`:''}</li>`).join('');
 const seal=sealRecord(p),ref=sealReference(p);
 const sealInfo=`<h3>Datos registrados de ${esc(p.tag)}</h3>${seal.rows.length?fieldRows(seal.rows):'<p>La fuente de este equipo no identifica su sellado.</p>'}${seal.pending.length?`<p class="notice"><strong>POR CONFIRMAR</strong> · ${esc(seal.pending.join(' · '))}. Se completa con la identificación del sello o el registro de mantenimiento de esta bomba.</p>`:''}${ref?`<div class="block manufacturer-reference"><p class="eyebrow">REFERENCIA DEL FABRICANTE · NO ES IDENTIFICACIÓN DEL EQUIPO</p><h3>${esc(ref.title)}</h3><p>${esc(ref.scope)}</p>${fieldRows(ref.rows)}<ul class="doc-links">${linkRows(ref.links)}</ul><p class="muted">Los materiales son opciones de catálogo. La combinación instalada y su compatibilidad con el servicio requieren confirmación.</p></div>`:''}`;
 const componentCard=state.part!==null?`<section id="component-detail" class="component-focus" tabindex="-1"><p class="eyebrow">PIEZA ${String(state.part+1).padStart(2,'0')} SELECCIONADA</p><h2>${esc(anatomy?.state.subcomponent||partName(state.part,p))}</h2><p>${esc(parts[state.part].desc)}</p>${state.part===5?sealInfo:fieldRows(componentRows(p,state.part))}${representedSubparts(state.part)}<div class="block part-docs"><h3>${state.part===5?'Documentación de la bomba':'Información del fabricante · '+esc(partName(state.part,p))}</h3><ul class="doc-links">${linkRows(linkPieza(p,state.part).filter(l=>state.part!==5||!ref?.links.some(r=>r.u===l.u)))}</ul></div><p class="muted">Fuente: ${esc(p.source)}. La geometría es ilustrativa; los datos pendientes no se deducen del dibujo.</p></section>`:'';
 const exp=expedienteDe(p);
 const figs=(items,vacio)=>items.length?`<div class="exp-grid">${items.map(i=>`<figure><a href="${i.src}" target="_blank" rel="noopener"><img src="${i.src}" alt="${esc(i.t)}" loading="lazy"></a><figcaption>${esc(i.t)}${i.serie?` · serie leída: <b>${esc(i.serie)}</b> (verificar)`:''}<small>${esc(i.ref)}</small></figcaption></figure>`).join('')}</div>`:`<p class="muted">${vacio}</p>`;
 const docLinks=[...(exp.fab||[]).flatMap(k=>k==='weg'&&p.motor?.catalogo!=='00218XT3E145T'?[enlaces.weg[0]]:enlaces[k]||[]),...(exp.rod||[]).map(k=>enlaces.skf[k]).filter(Boolean).map(l=>({...l,k:'rodamiento · CAD'}))];
 const imagenes=`<div class="block exp-block" id="fuentes-${esc(p.tag)}"><h3>Imágenes del equipo</h3>${exp.pendiente?`<p class="notice pending-source"><strong>PENDIENTE · ${esc(p.tag)}</strong><br>${esc(exp.pendiente)}</p>`:''}<p><a class="doc" href="/#${esc(p.tag)}">Vínculo directo al expediente ${esc(p.tag)}</a></p><p class="eyebrow">PLACA DE CARACTERÍSTICAS</p>${figs(exp.placas,'Sin foto de placa asociada en el Excel.')}<p class="eyebrow">FOTO DE LA BOMBA</p>${figs(exp.fotos,'Sin foto individual en el Excel; ver referencia del lado.')}${exp.nota?`<p class="notice">${esc(exp.nota)}</p>`:''}<p class="muted">Imágenes tomadas de “Libro1 bomba2.xlsx”, asociadas por la fila donde estaban ancladas. Cada pie conserva su fila de origen; no se asignan placas por semejanza.</p></div>`;
 const documentos=`<div class="block exp-block"><h3>Catálogos, fichas y CAD del fabricante</h3>${docLinks.length?`<ul class="doc-links">${linkRows(docLinks)}</ul>`:'<p class="muted">Sin fabricante identificado: no hay documentación asociada.</p>'}<p class="muted">Enlaces públicos a fabricantes y distribuidores. “CAD” = ficha de producto donde el fabricante lo ofrece; el despiece 3D de esta app no es CAD del fabricante.</p></div>`;
 const photos=`<div class="photo-pair"><figure><figcaption>Referencia del lado · ${esc(p.area)}</figcaption><img src="${p.photo}" alt="Vista del lado donde se ubica ${esc(p.tag)}"></figure></div><p class="muted">Foto de contexto del PDF (lado donde está la bomba). Placa y foto propias de la bomba, más abajo en “Imágenes del equipo”.</p>`;
 $('#panel').innerHTML=`${componentCard}<p class="eyebrow">EXPEDIENTE DE ${esc(p.tag)}</p><h2>${p.inactive?'B22 · SIN USO':esc(p.marca)+' '+esc(p.modelo)}</h2>${p.enUso===false?'<p class="notice warn"><strong>Sin uso.</strong> Está instalada en la torre pero no opera (confirmado por el usuario, 13-oct-2026). Los datos son los de su placa.</p>':''}<p class="notice">${p.inactive?'Equipo marcado SIN USO en el Excel. Exterior ilustrativo de bomba azul con cubierta roja, según la foto asociada a la fila 25. Modelo, dimensiones y componentes sin identificar; se conserva la posición aproximada existente.':'Datos del Excel y confirmaciones del usuario. Las proporciones 3D son aproximadas; los ejemplos de o-rings e historial están marcados DEMO.'}</p>${photos}${imagenes}${fieldRows([['Ubicación (tanque conectado)',p.nombre],['Lado',p.area],['Fabricante',p.marca],['Modelo',p.modelo],['Tamaño',p.size],['Fluido',p.servicio],['Fuente',p.source],...p.specs])}<div class="block interactive-part-block" data-part="9" title="Ver motor eléctrico en el 3D"><h3>Motor <span class="part-badge">Pieza 10 ↗</span></h3>${fieldRows(componentRows(p,9))}</div><div class="block interactive-part-block" data-part="5" title="Ver sello mecánico en el 3D"><h3>${esc(sealTitle(p))} <span class="part-badge">Pieza 06 ↗</span></h3>${state.part===5?'<p>Datos y referencias en la pieza seleccionada, arriba.</p>':sealInfo}</div><div class="block interactive-part-block" data-part="7" title="Ver rodamientos y bancada en el 3D"><h3>Rodamientos registrados <span class="part-badge">Pieza 08 ↗</span></h3>${fieldRows(componentRows(p,7))}</div><div class="block interactive-part-block" data-part="8" title="Ver acople en el 3D"><h3>Acople <span class="part-badge">Pieza 09 ↗</span></h3>${fieldRows(componentRows(p,8))}</div><div class="block"><h3>O-rings ${demo}</h3>${rings||'<p>Sin datos.</p>'}</div>${documentos}<div class="block"><div class="panel-actions"><button type="button" id="download-summary-pdf-bottom" class="primary wide pdf-btn">📄 Descargar resumen técnico de ${esc(p.tag)} (PDF)</button></div></div>`;
 $('#panel').querySelectorAll('.interactive-part-block').forEach(b=>b.onclick=()=>selectPart(Number(b.dataset.part)));
 $('#panel').querySelectorAll('[data-subcomponent]').forEach(b=>b.onclick=()=>{selectPart(state.part,b.dataset.subcomponent);fitAnatomy();});
 $('#download-summary-pdf-bottom')?.addEventListener('click',()=>downloadPumpPDF(p.tag));

}
document.querySelector('.compass').textContent='LADOS FIJOS · Frontal B–C · Izquierdo C–D · Trasero D–A · Derecho A–B';
// No mantener dos escenas WebGL activas durante la bienvenida.
const welcome=document.getElementById('portada');
if(welcome&&!welcome.hidden)await new Promise(resolve=>{window.addEventListener('vocatus:entered',resolve,{once:true});if(welcome.hidden)resolve();});
initScene();renderPanel();await refresh();
function selectFromHash(){const tag=location.hash.slice(1).toUpperCase();if(plantPumps.some(p=>p.tag===tag))selectPhotoPump(tag);}
window.addEventListener('hashchange',selectFromHash);selectFromHash();

// Riel de piezas: siempre visible junto al 3D cuando hay una bomba abierta.
function railParts(){
 if(state.view!=='pump'||!state.pump||state.pump.data?.inactive)return [];
 return parts.map((part,index)=>({index,name:partName(index)})).filter(({index})=>!(state.pump?.data?.variant==='goulds'&&(index===7||index===8)));
}
function renderRail(){
 const rail=$('#parts-rail');if(!rail)return;
 if(state.view==='plant'){renderPumpRail(rail);return;}
 rail.classList.remove('pump-rail');
 const items=railParts();rail.hidden=!items.length;if(!items.length)return;
 const exterior=state.sector&&state.detail==='exterior';
 rail.classList.toggle('collapsed',!!state.railCollapsed);
 rail.innerHTML=`<button type="button" class="rail-head" aria-expanded="${!state.railCollapsed}"><span>🔧 Piezas de la bomba</span><b>${state.railCollapsed?'▸':'▾'}</b></button><div class="rail-body">${exterior?'<p class="rail-hint">Tocá una pieza para abrir la bomba y verla por dentro.</p>':''}${items.map(({index,name})=>`<button type="button" class="rail-item ${state.part===index?'active':''}" data-rail="${index}"><span>${String(index+1).padStart(2,'0')}</span>${esc(name)}</button>`).join('')}${!exterior&&state.part!==null?'<button type="button" class="rail-item rail-clear" data-rail-clear>✕ Ver la bomba completa</button>':''}</div>`;
 rail.querySelector('.rail-head').onclick=()=>{state.railCollapsed=!state.railCollapsed;renderRail();};
 rail.querySelectorAll('[data-rail]').forEach(b=>{
  const index=Number(b.dataset.rail);
  b.onclick=()=>{selectPart(index);if(state.detail==='schematic')fitAnatomy();};
  b.onmouseenter=()=>markers.forEach(m=>m.kind==='part'&&m.el.classList.toggle('hover-marker',m.id===index));
  b.onmouseleave=()=>markers.forEach(m=>m.el.classList.remove('hover-marker'));
 });
 rail.querySelector('[data-rail-clear]')?.addEventListener('click',()=>{selectPart(null);fitAnatomy();});
 rail.querySelector('.rail-item.active')?.scrollIntoView({block:'nearest'});
}
// Nombre de la pieza al pasar el mouse por el modelo 3D.
(function partHover(){
 const tip=$('#part-tip');if(!renderer||!tip)return;
 let frame=0;
 renderer.domElement.addEventListener('pointermove',e=>{
  if(frame)return;frame=requestAnimationFrame(()=>{frame=0;
   const active=state.view==='pump'&&(!state.sector||state.detail==='schematic');
   if(!active||e.pointerType==='touch'){tip.hidden=true;renderer.domElement.style.cursor='';return;}
   const r=renderer.domElement.getBoundingClientRect();
   raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
   const hit=raycaster.intersectObjects(componentGroups,true).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return anatomy?anatomy.visibleHit(h):true;});
   const part=hit?.object.userData.part;
   if(part===undefined){tip.hidden=true;renderer.domElement.style.cursor='';return;}
   tip.textContent=`${String(part+1).padStart(2,'0')} · ${hit.object.userData.subcomponent||partName(part)}`;
   tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';tip.hidden=false;renderer.domElement.style.cursor='pointer';
  });
 });
 renderer.domElement.addEventListener('pointerleave',()=>{tip.hidden=true;});
})();


// Bomba sin TAG del modelo integrado: se simula con lo que se haya anotado en su ficha pendiente
// (caudal, altura, rpm, potencia, servicio). Lo que falta se estima y el simulador lo avisa.
function pumpPendienteParaSimular(reference){
 let d={};try{d=JSON.parse(localStorage.getItem(clavePendiente(reference)))||{};}catch{}
 const kw=parseFloat(String(d.potencia||'').replace(',','.')),specs=[];
 if(d.caudal)specs.push(['Caudal',d.caudal+' gpm']);if(d.altura)specs.push(['Altura',String(d.altura)]);
 const tag='Pendiente · '+reference.nombre;state.pump.simTag=tag;
 const sinDatos=!d.caudal&&!d.altura&&!d.rpm&&!kw;
 return {tag,nombre:reference.nombre,servicio:d.servicio||'',size:d.size||'',variant:'lf',specs,motor:{rpm:d.rpm||'',potencia:kw?String(kw*1.341):''},inactive:sinDatos};
}

// Simulador de operación por bomba (guía HIDROMAC 2196 ajustada a cada placa).
function getSim(p){
 if(!p)return null;
 if(!sims[p.tag]){const params=simParams(p);if(!params)return null;const model=createPumpModel(params);sims[p.tag]={model,inputs:model.defaults(),state:model.initialState(),paused:false,speed:1,showFlow:true,log:[],lastLog:-1};}
 return sims[p.tag];
}
function showInside(){
 if(!ensureAnatomy())return;
 if(!anatomy.state.cutaway)anatomy.set({cutaway:true});
 if(state.explode>0)setExplosion(0);
 syncAnatomyTools();fitAnatomy();
}
function renderSimPanel(p){
 const panel=$('#panel');
 const sim=getSim(p);if(!sim){panel.innerHTML='<p class="notice">Faltan datos de placa para simular esta bomba.</p>';return;}
 panel.innerHTML=simPanelHTML(p,sim);
 const q=id=>panel.querySelector('#sim-'+id),refresh=()=>{const d=sim.model.derive(sim.state,sim.inputs);updateSimPanel(panel,sim,d);drawSimChart(q('chart'),sim,d);};
 q('run').onclick=()=>{sim.inputs.running=!sim.inputs.running;q('run').textContent=sim.inputs.running?'■ Parar bomba':'▶ Arrancar bomba';if(sim.inputs.running&&state.detail==='exterior')showInside();refresh();};
 q('pause').onclick=()=>{sim.paused=!sim.paused;q('pause').textContent=sim.paused?'Continuar':'Pausar';refresh();};
 q('speed').onclick=()=>{sim.speed=sim.speed===1?.25:sim.speed===.25?4:1;q('speed').textContent='Tiempo ×'+String(sim.speed).replace('.',',');};
 q('reset').onclick=()=>{sim.inputs=sim.model.defaults();sim.state=sim.model.initialState();sim.paused=false;sim.speed=1;sim.log=[];sim.lastLog=-1;renderSimPanel(p);toast('Simulador de '+p.tag+' restablecido.');};
 const ranges={freq:v=>sim.inputs.frequency=v,valve:v=>sim.inputs.valve=v/100,suction:v=>sim.inputs.suction=v,temp:v=>sim.inputs.temperature=v,oil:v=>sim.inputs.oil=v/100};
 for(const [id,set] of Object.entries(ranges))if(q(id))q(id).oninput=e=>{set(Number(e.target.value));refresh();};
 q('fluid').onchange=e=>{sim.inputs.fluid=e.target.value;refresh();};
 for(const id of ['power','primed','cooling','flow']){const b=q(id);if(!b)continue;b.onclick=()=>{if(id==='flow')sim.showFlow=!sim.showFlow;else sim.inputs[id]=!sim.inputs[id];b.setAttribute('aria-pressed',String(id==='flow'?sim.showFlow:sim.inputs[id]));refresh();};}
 q('inside').onclick=showInside;
 q('save').onclick=()=>{const d=sim.model.derive(sim.state,sim.inputs),blob=new Blob([JSON.stringify({bomba:p.tag,generado:new Date().toISOString(),aviso:'Modelo reducido con curva sintética ajustada a la placa. No son mediciones.',parametros:sim.model.params,entradas:sim.inputs,actual:d,lecturas:sim.log},null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`simulacion_${p.tag}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),20000);};
 refresh();
}
(function simLoop(){
 let last=performance.now(),ui=0,chart=0;
 function tick(now){
  const dt=Math.min(.25,(now-last)/1000);last=now;
  for(const sim of Object.values(sims)){
   if(sim.paused)continue;let left=dt*sim.speed;while(left>1e-6){const h=Math.min(.1,left);sim.state=sim.model.step(sim.state,sim.inputs,h);left-=h;}
   const second=Math.floor(sim.state.time);if(second!==sim.lastLog&&(sim.inputs.running||sim.state.rpm>1)){sim.lastLog=second;const d=sim.model.derive(sim.state,sim.inputs);sim.log.push({t:second,rpm:Math.round(d.rpm),caudal_m3h:+(d.q*3600).toFixed(3),altura_m:+d.H.toFixed(2),potencia_kW:+(d.electric/1000).toFixed(3),corriente_A:+d.current.toFixed(2),npsha_m:+d.npsha.toFixed(2),fase:d.phase});if(sim.log.length>900)sim.log.shift();}
  }
  const cur=state.view==='pump'&&state.pump?sims[state.pump.simTag||state.pump.tag]:null,d=cur?cur.model.derive(cur.state,cur.inputs):null;
  simRig?.update(cur,d,cur&&!cur.paused?dt*cur.speed:0,{reduced:reducedMotion.matches,showFlow:cur?.showFlow,exploded:state.explode>0});
  if(cur&&state.tab==='sim'){const panel=$('#panel');if(now-ui>150){ui=now;updateSimPanel(panel,cur,d);}if(now-chart>300){chart=now;drawSimChart(panel.querySelector('#sim-chart'),cur,d);}}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
})();

// Áreas de la planta: plano de sitio, sector de tanques y torre de destilación.
function etiqueta(obj,text,cls,area,title=''){const el=document.createElement('span');el.className='label '+cls;el.textContent=text;if(title)el.title=title;$('#labels').append(el);markers.push({obj,el,kind:'corner',area});}
function markerInArea(m){
 if(!m.area)return true;
 if(m.kind==='area'||m.area==='planta')return state.area==='planta';
 if(state.area==='planta')return false;
 if(m.area!==state.area)return false;
 if(m.area==='integrado'&&state.filtroInt&&m.sectorInt!==state.filtroInt)return false;
 if(m.area==='integrado'&&!state.filtroInt&&m.kind==='pump')return false;
 if(m.area==='integrado'&&state.filtroInt==='torre'&&state.primeraPlanta&&!primeraPlanta.contains(m.obj.getWorldPosition(new THREE.Vector3()).y))return false;
 if(m.kind==='pump'&&m.area==='torre'&&state.seccion!=='n1')return false; // en la torre se eligen desde el panel o al pasar el mouse
 if(m.kind==='corner'&&m.area==='torre'&&m.el.classList.contains('pending-label')&&state.seccion!=='n1')return false;
 if(m.kind==='corner'&&m.area==='torre'&&state.seccion&&state.seccion!=='n1')return false;
 return true;
}
function torreFila(p){return [...plantPumps].filter(q=>q.areaId==='torre'&&Math.abs(q.z-p.z)<.5).sort((a,b)=>a.x-b.x).findIndex(q=>q.tag===p.tag);}
function pumpWorld(tag){const g=(state.area==='integrado'&&pumpObjectsInt[tag])||pumpObjects[tag];return g?g.getWorldPosition(new THREE.Vector3()):null;}
const tipoDe=p=>{const s=normalize(p.servicio);return [/alcohol/.test(s)&&'alcohol',/agua/.test(s)&&'agua',/mosto|vinaza/.test(s)&&'mosto',(/sin uso/.test(s)||p.enUso===false)&&'sin-uso'].filter(Boolean);};
function fillFilters(){
 const area=$('#area').value,marca=$('#marca').value;
 $('#area').innerHTML='<option value="">Todas las áreas</option>'+AREAS.filter(a=>a.id!=='planta').map(a=>`<option value="${a.id}">${esc(a.nombre)}</option>`).join('');for(const sector of SECTORES_INT){const option=document.createElement('option');option.value='sector:'+sector.id;option.textContent='Planta completa · '+sector.nombre;$('#area').append(option);}$('#area').value=state.area==='integrado'&&state.filtroInt?'sector:'+state.filtroInt:state.area;
 $('#area').value=state.area==='integrado'&&state.filtroInt?'sector:'+state.filtroInt:state.area==='planta'?'':state.area;
 const marcas=[...new Set(state.pumps.map(p=>p.marca).filter(m=>m&&!/sin dato|por confirmar/i.test(m)))].sort();
 $('#marca').innerHTML='<option value="">Todas las marcas</option>'+marcas.map(m=>`<option>${esc(m)}</option>`).join('');$('#marca').value=marcas.includes(marca)?marca:'';
}
// Encuadre a los límites reales: la caja entra completa en la vista según el campo de visión y la
// proporción actual de la pantalla (también en teléfonos). dir: desde el objetivo hacia la cámara.
function encuadrar(box,dir,margen=1.08,correrX=0){
 const c=box.getCenter(new THREE.Vector3()),d0=dir.clone().normalize(),fwd=d0.clone().negate();
 let right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0));if(right.lengthSq()<1e-6)right.set(1,0,0);right.normalize();
 const up=new THREE.Vector3().crossVectors(right,fwd).normalize(),asp=viewport.clientWidth&&viewport.clientHeight?viewport.clientWidth/viewport.clientHeight:camera.aspect,tv=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),th=tv*asp;
 let d=0;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new THREE.Vector3(x,y,z).sub(c);const k=v.dot(d0);d=Math.max(d,Math.abs(v.dot(right))/(th*Math.max(.55,1-correrX))+k,Math.abs(v.dot(up))/tv+k);}
 d=Math.max(controls.minDistance,d*margen);controls.maxDistance=Math.max(190,d*1.6);
 // correrX: fracción del ancho que tapa un panel a la derecha; el contenido se centra en lo visible.
 const t=c.clone().addScaledVector(right,d*th*correrX);
 return [t.clone().addScaledVector(d0,d).toArray(),t.toArray()];
}
// Sombras en la planta: la luz principal (realismo.js) se reubica sobre el área que se mira, con su
// cámara de sombra ajustada a esa área. En la vista de una bomba vuelve a su posición original.
function ajustarSol(box){solCaja=box.clone();solModo=null;}
function solSegunVista(){
 const L=render3D?.clave;if(!L)return;
 const modo=state.view==='plant'&&solCaja?'planta:'+solCaja.min.toArray().join():'bomba';if(modo===solModo)return;solModo=modo;
 const c=L.shadow.camera;L.userData.orig??={pos:L.position.clone(),obj:L.target.position.clone(),cam:[c.left,c.right,c.top,c.bottom,c.near,c.far],i:L.intensity,env:scene.environmentIntensity??1};
 if(modo==='bomba'){const o=L.userData.orig;L.position.copy(o.pos);L.target.position.copy(o.obj);[c.left,c.right,c.top,c.bottom,c.near,c.far]=o.cam;L.intensity=o.i;scene.environmentIntensity=o.env;}
 else{const centro=solCaja.getCenter(new THREE.Vector3()),r=solCaja.getSize(new THREE.Vector3()).length()/2;
  L.target.position.copy(centro);L.position.copy(centro).addScaledVector(new THREE.Vector3(-.55,1,.42).normalize(),r+30);
  c.left=c.bottom=-r;c.right=c.top=r;c.near=1;c.far=2*r+60;
  // sol de exterior: más luz directa y menos luz ambiente, para que se lean las sombras
  L.intensity=3.6;scene.environmentIntensity=.45;}
 if(!L.target.parent)scene.add(L.target);L.target.updateMatrixWorld();c.updateProjectionMatrix();L.shadow.needsUpdate=true;
}
function cajaTorre(seccion){
 const g=areaGroups.torre;if(!g)return new THREE.Box3();g.updateMatrixWorld(true);const r=seccion?rangoSeccion(seccion):null;
 const y0=r?Math.max(LIMITES.min[1],r[0]):LIMITES.min[1],y1=r?Math.min(LIMITES.max[1],r[1]):LIMITES.max[1],b=new THREE.Box3();
 for(const x of [LIMITES.min[0],LIMITES.max[0]])for(const y of [y0,y1])for(const z of [LIMITES.min[2],LIMITES.max[2]])b.expandByPoint(g.localToWorld(new THREE.Vector3(x,y,z)));
 return b;
}
// Modelo integrado: bombas de la torre con ficha (misma posición que en la vista de la torre, llevada al
// modelo con la alineación calculada) y etiquetas «Sin ficha» para las bombas modeladas sin TAG.
function selectPendingPump(reference){
 rememberDetailOrigin();
 const ticket=++state.loading;history.replaceState(null,'',location.pathname+location.search);
 state.pump={tag:'Sin TAG',pending:reference,data:{variant:'lf',marca:'',modelo:'',seal:{},orings:[],history:[]}};
 state.part=null;state.tab='ficha';
 document.dispatchEvent(new CustomEvent('vocatus:referencia',{detail:reference}));
 $('#selected-tag').textContent='Sin TAG';$('#selected-name').textContent=reference.nombre;
 $('#source-status').textContent='IDENTIFICACIÓN PENDIENTE · GEOMETRÍA DE REFERENCIA';
 $('#breadcrumb').textContent='PLANTA / '+(SECTORES_INT.find(x=>x.id===sectorDe(reference.sector))?.nombre||reference.sector);
 $('#back').hidden=false;
 const show=()=>{if(ticket!==state.loading)return;state.view='pump';$('#torre-planta-tools').hidden=true;$('#torre-tools').hidden=true;$('#integrado-tools').hidden=true;
 if(pumpGroup){clearGroup(pumpGroup);componentGroups.length=0;for(let i=markers.length-1;i>=0;i--)if(markers[i].kind==='part'){markers[i].el.remove();markers[i].leader?.remove();markers.splice(i,1);}buildPump('lf');}
 if(photoDetail){clearGroup(photoDetail);scene.remove(photoDetail);}
 photoDetail=!reference.standalone&&integrado?.escena?extraerBomba(THREE,integrado.escena,reference):null;state.pump.geometriaIntegrada=!!photoDetail;if(!photoDetail)photoDetail=exterior(THREE,1.2,'lf');scene.add(photoDetail);setPhotoDetail(false);
 $('#scene-badge').textContent=state.pump.geometriaIntegrada?'GEOMETRÍA DEL MODELO INTEGRADO · ESCALA CONSERVADA · IDENTIFICACIÓN PENDIENTE':'BOMBA DE REFERENCIA · TIPO Y DIMENSIONES POR CONFIRMAR';
 $('#scene-help').textContent='Arrastrá para girar · Abrí Piezas de la bomba para ver el despiece';
 setViewButtons(false);renderList();renderPanel();
 };
 const center=new THREE.Vector3(...reference.min).add(new THREE.Vector3(...reference.max)).multiplyScalar(.5);if(!reference.standalone&&integrado?.g){integrado.g.updateMatrixWorld(true);integrado.g.localToWorld(center);}transitionToPump(ticket,center,show);renderList();renderPanel();
}
function renderPendingPanel(){
 const reference=state.pump.pending;
 const simTab=state.tab==='sim';document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===(simTab?'sim':'ficha')));
 $('#pump-links')?.remove();$('#pump-resumen')?.remove();$('#pump-meta')?.remove();
 if(simTab){renderSimPanel(pumpPendienteParaSimular(reference));return;}
 abrirFichaPendiente($('#panel'),reference).catch(e=>toast(e.message));
 if(state.part!==null){const part=parts[state.part];$('#panel').insertAdjacentHTML('afterbegin',`<section class="block component-focus" id="component-detail" tabindex="-1"><p class="eyebrow">PIEZA ${state.part+1} · REFERENCIA</p><h2>${esc(part.name)}</h2><p>Geometría ilustrativa. Identificación y medidas del componente instalado pendientes de levantamiento.</p></section>`);}
}
function montarIntegrado(g,escena,placed){
 integrado={g,escena,info:null,references:[]};for(const k in pumpObjectsInt)delete pumpObjectsInt[k];
 Promise.all([fetch(INFO_URL).then(r=>r.json()),fetch('/modelos/bombas-individuales.json').then(r=>{if(!r.ok)throw new Error('No se pudo cargar la identificación individual de bombas');return r.json();})]).then(([info,grupos])=>{
  if(g.parent!==plant)return;integrado.info=info;
  const alineado=escena.userData.blenderLocal?alinearInfoBlender(THREE,escena,info,grupos):null;integrado.desplazamientoBlender=alineado?.d||null;
  if(info.torre)for(const p of placed.filter(p=>areaOf(p)==='torre')){
   const b=compactar(THREE,exterior(THREE,p.scale,p.variant)),[x,y,z]=torreAIntegrado(info.torre,p.x,p.y??.3,p.z);
   b.position.set(x,y,z);b.rotation.y=p.rotation+info.torre.giro;b.userData.tag=p.tag;b.userData.sectorInt='torre';g.add(b);pumpObjectsInt[p.tag]=b;
   if(alineado){b.updateMatrixWorld(true);const caja=new THREE.Box3().setFromObject(b).applyMatrix4(new THREE.Matrix4().copy(g.matrixWorld).invert()),c=caja.getCenter(new THREE.Vector3());
    const piso=alturaPiso(alineado.pisos,c.x,c.z,caja.min.y+.5);if(piso!==null)b.position.y+=piso-caja.min.y;}
   b.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.tag=p.tag;pickables.push(o);}});
   const a=new THREE.Object3D();a.position.set(0,2.2,0);b.add(a);marker(a,p.tag,'pump',p.tag);Object.assign(markers.at(-1),{area:'integrado',sectorInt:'torre'});
  }
  if(escena.userData.blenderLocal){
   const enlaces=prepararBombasBlender(THREE,escena,{sector,exterior,photoPumps,grupos});
   for(const [tag,body] of Object.entries(enlaces)){
    body.userData.sectorInt='tanques';pumpObjectsInt[tag]=body;
    body.traverse(o=>{if(o.isMesh){o.userData.tag=tag;pickables.push(o);}});
    const anchor=new THREE.Object3D();anchor.position.set(0,2.2,0);body.add(anchor);marker(anchor,tag,'pump',tag);Object.assign(markers.at(-1),{area:'integrado',sectorInt:'tanques'});
   }
   window.__blenderIntegrado={bombas:Object.keys(enlaces),modelo:escena};
  }else{
  const tankPumps=placed.filter(p=>areaOf(p)==='tanques');
  const tanques=sector(THREE,tankPumps);tanques.userData.sector='Sector de tanques';g.add(tanques);integrado.tanques=tanques;
  for(const p of tankPumps){const body=compactar(THREE,exterior(THREE,p.scale,p.variant));body.position.set(p.x,p.y??.3,p.z);body.rotation.y=p.rotation;body.userData.tag=p.tag;body.userData.sectorInt='tanques';tanques.add(body);pumpObjectsInt[p.tag]=body;
   body.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.tag=p.tag;pickables.push(o);}});
   const anchor=new THREE.Object3D();anchor.position.set(0,2.2,0);body.add(anchor);marker(anchor,p.tag,'pump',p.tag);Object.assign(markers.at(-1),{area:'integrado',sectorInt:'tanques'});
  }
  tanques.updateMatrixWorld(true);const local=new THREE.Box3().setFromObject(tanques);
  const placement=ubicarTanques(info,AREA('tanques'),AREA('torre'),{min:local.min.toArray(),max:local.max.toArray()});
  tanques.position.set(placement.x,placement.y,placement.z);tanques.rotation.y=placement.giro;tanques.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(tanques);info.sectores['Sector de tanques']={min:bounds.min.toArray(),max:bounds.max.toArray()};
  const labelAnchor=new THREE.Object3D();labelAnchor.position.set(0,local.max.y+1,-1);tanques.add(labelAnchor);
  const label=document.createElement('button');label.className='label area-label';label.textContent='Sector de tanques';label.setAttribute('aria-label','Ver sector de tanques en la planta completa');
  label.onclick=()=>{state.filtroInt='tanques';aplicarFiltroInt();applyArea();if($('#area'))$('#area').value=state.filtroInt?'sector:'+state.filtroInt:'integrado';renderList();flyIntegrado();};$('#labels').append(label);markers.push({obj:labelAnchor,el:label,kind:'corner',area:'integrado',sectorInt:'tanques'});

  }
  const tankBodies=Object.fromEntries(Object.entries(pumpObjectsInt).filter(([,body])=>body.userData.sectorInt==='tanques'));
  const cambios=aplicarCambiosCampo(THREE,{scene:escena,grupos,tankBodies,desplazamiento:alineado?.d,info,exterior,photoPumps});
  const retirados=new Set(cambios.removedMeshes);for(let i=pickables.length-1;i>=0;i--)if(retirados.has(pickables[i]))pickables.splice(i,1);
  for(const body of Object.values(tankBodies))body.traverse(o=>{if(o.isMesh&&!pickables.includes(o))pickables.push(o);});
  window.__cambiosCampo={...cambios,removedMeshes:undefined};
  const numeracion={};
  for(const grupo of grupos)for(const [indice,caja] of grupo.bombas.entries()){
   const s={...caja,sector:grupo.sector,nombre:grupo.bombas.length>1?`${grupo.nombre} · Bomba ${indice+1}`:grupo.nombre,grupo:grupo.nombre,nota:grupo.nota||'',indice:indice+1};
   s.numero=(numeracion[sectorDe(s.sector)]=(numeracion[sectorDe(s.sector)]||0)+1);integrado.references.push(s);
   const a=new THREE.Object3D();a.position.set((s.min[0]+s.max[0])/2,s.max[1]+1.2,(s.min[2]+s.max[2])/2);g.add(a);
   const el=document.createElement('button');el.className='label pending-label sin-ficha';el.textContent=`Bomba ${s.numero} · ${SECTORES_INT.find(x=>x.id===sectorDe(s.sector))?.nombre||s.sector}`;el.title=s.nombre;
   el.setAttribute('aria-label','Bomba sin ficha: '+s.nombre);
   el.onclick=()=>{selectPendingPump(s);};
   $('#labels').append(el);markers.push({obj:a,el,kind:'pump',area:'integrado',sectorInt:sectorDe(s.sector)});
   const size=s.max.map((v,i)=>v-s.min[i]);
   const hit=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],size[2]),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
   hit.position.set(...s.min.map((v,i)=>(v+s.max[i])/2));hit.userData.pending=s;hit.userData.sector=s.sector;hit.userData.hitProxy=true;g.add(hit);pickables.push(hit);
  }
  document.dispatchEvent(new Event('vocatus:referencias'));aplicarFiltroInt();renderList();if(state.area==='integrado'&&state.view==='plant'&&detailFlightTicket!==state.loading)flyIntegrado();
 }).catch(err=>console.warn('Sin datos del modelo integrado',err));
}
function aplicarFiltroInt(){
 primeraPlanta.reset();
 const f=state.filtroInt||null;
 document.querySelectorAll('#integrado-sectores [data-sector]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.sector||null)===f)));
 const s=SECTORES_INT.find(x=>x.id===f);
 if($('#integrado-status'))$('#integrado-status').textContent=s?`${s.nombre} aislado. Los pisos quedan como referencia y la cubierta común se oculta.`:'Toda la planta. Elegí un sector para aislarlo; tocá una bomba o referencia para abrir su ficha y completar datos e imágenes.';
 if(!integrado)return;
 integrado.g.traverse(o=>{if(o.userData.sector)o.visible=visibleCon(o.userData.sector,f);});
 for(const b of Object.values(pumpObjectsInt))b.visible=!f||b.userData.sectorInt===f;
 if(f==='torre'&&state.primeraPlanta&&integrado.info?.torre){
  const localY=integrado.info.torre.y+rangoSeccion('n1')[1];
  const limit=integrado.g.localToWorld(new THREE.Vector3(0,localY,0)).y;
  primeraPlanta.apply(integrado.g,limit,SECTORES_INT.find(s=>s.id==='torre').sectores);
 }
}
function flyIntegrado(){
 const a=AREA('integrado'),g=areaGroups.integrado,c=state.filtroInt&&integrado?.info&&cajaSector(integrado.info,state.filtroInt);
 if(!g||!c)return flyArea('integrado');
 g.updateMatrixWorld(true);let box=cajaVisible(THREE,g);if(box.isEmpty())box=new THREE.Box3(new THREE.Vector3(...c.min),new THREE.Vector3(...c.max)).applyMatrix4(g.matrixWorld);if(state.filtroInt==='torre'&&state.primeraPlanta&&primeraPlanta.height!==null)box.max.y=Math.min(box.max.y,primeraPlanta.height);ajustarSol(box);
 const [pos,obj]=encuadrar(box,new THREE.Vector3(...a.camara.pos).sub(new THREE.Vector3(...a.camara.obj)),1.15);fly(pos,obj,900);
}
function cajaEdificio(area){
 const [w,d,h]=area.huella,r=Math.hypot(w,d)/2;
 // El modelo integrado no gira (giro 0): su caja es la huella exacta y el encuadre queda más cerca.
 if(area.aparte)return new THREE.Box3(new THREE.Vector3(area.pos[0]-w/2,0,area.pos[1]-d/2),new THREE.Vector3(area.pos[0]+w/2,h,area.pos[1]+d/2));
 return new THREE.Box3(new THREE.Vector3(area.pos[0]-r,0,area.pos[1]-r),new THREE.Vector3(area.pos[0]+r,h,area.pos[1]+r));
}
function flyArea(id,vista){
 if(id==='planta')id='integrado';
 if(!camera||!plantRequested)return;
 const dirLocal=(g,from,to)=>g.localToWorld(new THREE.Vector3(...from)).sub(g.localToWorld(new THREE.Vector3(...to)));
 if(id==='planta'||!areaGroups[id]){
  const b=cajaTorre(null).union(new THREE.Box3().setFromObject(areaGroups.tanques||plant));
  for(const area of AREAS.filter(a=>a.modelo&&!a.aparte))b.union(cajaEdificio(area));
  ajustarSol(b);const [pos,obj]=encuadrar(b,vista==='superior'?new THREE.Vector3(0,1,.02):new THREE.Vector3(0,85,72),1.12);fly(pos,obj,900);return;
 }
 const g=areaGroups[id],a=AREA(id);g.updateMatrixWorld(true);
 if(id==='torre'){
  const panel=(!state.seccion||state.seccion==='n1')&&!state.pumpRailCollapsed&&viewport.clientWidth>=700;
  ajustarSol(cajaTorre(null));
  const v=VISTAS[vista||'iso'],[pos,obj]=encuadrar(cajaTorre(state.seccion),dirLocal(g,v.pos,[CENTRO.x,CENTRO.y,CENTRO.z]),panel?1.15:1.08,panel?.14:0);
  fly(pos,obj,900);return;
 }
 let caja=cajaVisible(THREE,g);if(caja.isEmpty())caja=a.modelo?cajaEdificio(a):new THREE.Box3().setFromObject(g);ajustarSol(caja);
 const [pos,obj]=encuadrar(caja,vista==='superior'?new THREE.Vector3(0,1,.02):dirLocal(g,a.camara.pos,a.camara.obj));
 fly(pos,obj,900);
}
function setArea(id,volar=true){
 if(id==='integrado'){state.filtroInt=null;aplicarFiltroInt();}
 if(id.startsWith('sector:')){state.filtroInt=id.slice(7)||null;id='integrado';aplicarFiltroInt();}
 if(id==='planta'){id='integrado';state.filtroInt=null;aplicarFiltroInt();}
 state.area=id;if(id!=='torre')state.seccion=null;
 if($('#area'))$('#area').value=id==='planta'?'':id;
 applyArea();renderList();
 if(volar&&state.view==='plant')flyArea(id);
}
function applyArea(){
 const id=state.area,a=AREA(id);
 for(const [k,g] of Object.entries(areaGroups))g.visible=id==='planta'?!AREA(k)?.aparte:k===id;
 for(const o of plant?.children||[])if(o.userData.sitio)o.visible=!a?.aparte;
 if(torre){aplicarSeccion(torre.objetos,id==='torre'?state.seccion:null,{existente:id==='torre'&&state.existente,techo:state.techo});
  for(const g of Object.values(pumpObjects))if(g.parent===areaGroups.torre)g.visible=!state.seccion||state.seccion==='n1';}
  renderRail();
 document.querySelectorAll('#area-menu [data-area]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.area===(id==='integrado'&&state.filtroInt?'sector:'+state.filtroInt:id))));
 const floorTools=$('#torre-planta-tools');if(floorTools){floorTools.hidden=!(id==='integrado'&&state.filtroInt==='torre'&&state.view==='plant');floorTools.querySelectorAll('[data-primera-planta]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.primeraPlanta==='si')===state.primeraPlanta)));}
 const tools=$('#torre-tools');if(tools)tools.hidden=!(id==='torre'&&state.view==='plant');
 const toolsInt=$('#integrado-tools');if(toolsInt)toolsInt.hidden=!(a?.aparte&&state.view==='plant');
 document.querySelectorAll('#torre-tools [data-seccion]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.seccion||null)===(state.seccion||null)||(!b.dataset.seccion&&!state.seccion))));
 $('#torre-existente')?.setAttribute('aria-pressed',String(state.existente));$('#torre-techo')?.setAttribute('aria-pressed',String(state.techo));
 const s=SECCIONES.find(x=>x.id===state.seccion);
 if($('#torre-status'))$('#torre-status').textContent=s?`${s.nombre} aislado · ${s.detalle}. Los demás pisos se ocultan para no tapar la vista.${s.id==='n1'?' Única planta con bombas (nota de la lámina A07).':' Esta planta no tiene bombas: solo estructura y equipos.'}`:'Toda la torre. Elegí una planta para aislarla o una vista (frontal, derecha, trasera, izquierda).';
 if(state.view==='plant'){
  $('#scene-title').textContent=a?.nombre||'Planta general';
  $('#breadcrumb').textContent=id==='planta'?'PLANTA / VISTA GENERAL':'PLANTA / '+a.nombre.toUpperCase()+(s?' / '+s.nombre.toUpperCase():'');
  $('#scene-badge').textContent=id==='planta'?'PLANO DE SITIO · ÁREAS MODELADAS SOBRE EL PLANO · POSICIONES RELATIVAS APROXIMADAS':id==='torre'?'TORRE DE DESTILACIÓN · MODELO DUSA 3D (FBX) · BOMBAS SEGÚN CROQUIS':a?.aparte?'MODELO INTEGRADO · 1 UNIDAD = 1 m · TANQUES: UBICACIÓN PROVISIONAL · MEDIDAS Y COLORES ILUSTRATIVOS':a?.modelo?`${a.nombre.toUpperCase()} · MODELO FBX · ASIGNACIÓN Y POSICIÓN APROXIMADAS`:'SECTOR FOTOGRAFIADO · POSICIONES APROXIMADAS';
  $('#scene-help').textContent=id==='planta'?'Tocá un área o una bomba · Arrastrá para girar':a?.aparte?'Tocá una bomba o referencia para abrir su ficha · Elegí un sector abajo para aislarlo':a?.modelo?'Arrastrá para girar · confirmar área, ubicación y orientación en campo':'Seleccioná una bomba para acercarte';
 }
}
(function areaUI(){
 const menu=$('#area-menu');if(!menu)return;
 menu.innerHTML=AREAS.filter(a=>['integrado','torre','tanques'].includes(a.id)).sort((a,b)=>(b.id==='integrado')-(a.id==='integrado')).map(a=>`<button type="button" data-area="${['tanques','torre'].includes(a.id)?'sector:'+a.id:a.id}" class="${a.estado}" aria-pressed="${a.id===state.area}">${esc(a.id==='integrado'?'Toda la planta':a.corto)}${a.estado==='nueva'?'<i>nueva</i>':''}</button>`).join('')+PENDIENTES.map(p=>`<button type="button" disabled title="Área ${p.n} del plano de sitio: falta modelarla">Área ${p.n}</button>`).join('');
 menu.insertAdjacentHTML('beforeend',SECTORES_INT.filter(s=>!['tanques','torre'].includes(s.id)).map(s=>`<button type="button" data-area="sector:${s.id}" aria-pressed="false">${esc(s.nombre)}</button>`).join(''));
 menu.querySelectorAll('[data-area]').forEach(b=>b.onclick=()=>chooseArea(b.dataset.area));
 document.querySelectorAll('[data-primera-planta]').forEach(b=>b.onclick=()=>{state.primeraPlanta=b.dataset.primeraPlanta==='si';aplicarFiltroInt();applyArea();renderList();flyIntegrado();});
 const toolsInt=$('#integrado-tools');
 if(toolsInt){$('#integrado-sectores').innerHTML=`<button type="button" data-sector="">Toda la planta</button>`+SECTORES_INT.map(s=>`<button type="button" data-sector="${s.id}">${esc(s.nombre)}</button>`).join('');
  toolsInt.querySelectorAll('[data-sector]').forEach(b=>b.onclick=()=>{state.filtroInt=b.dataset.sector||null;aplicarFiltroInt();applyArea();if($('#area'))$('#area').value=state.filtroInt?'sector:'+state.filtroInt:'integrado';renderList();flyIntegrado();});aplicarFiltroInt();}
 const tools=$('#torre-tools');if(!tools)return;
 $('#torre-secciones').innerHTML=`<button type="button" data-seccion="">Toda la torre</button>`+SECCIONES.map(s=>`<button type="button" data-seccion="${s.id}" title="${esc(s.detalle)}">${s.nombre}${s.id==='n1'?' · bombas':''}</button>`).join('');
 $('#torre-vistas').innerHTML=Object.entries(VISTAS).map(([k,v])=>`<button type="button" data-vista="${k}">${v.nombre}</button>`).join('');
 tools.querySelectorAll('[data-seccion]').forEach(b=>b.onclick=()=>{state.seccion=b.dataset.seccion||null;applyArea();flyArea('torre');});
 tools.querySelectorAll('[data-vista]').forEach(b=>b.onclick=()=>flyArea('torre',b.dataset.vista));
 $('#torre-existente').onclick=()=>{state.existente=!state.existente;applyArea();};
 if($('#torre-techo'))$('#torre-techo').onclick=()=>{state.techo=!state.techo;applyArea();};
})();
setTimeout(()=>{if(state.view==='plant'&&!location.hash)flyArea(state.area);},50);

// Etiquetas de bombas de la torre: si dos chocan se oculta una (se elige desde el panel o con el mouse).
function separarEtiquetas(items){
 const puestos=[];
 for(const it of items.sort((a,b)=>b.y-a.y)){
  if(puestos.some(p=>Math.abs(p.x-it.x)<40&&Math.abs(p.y-it.y)<20)){it.m.el.hidden=true;continue;}
  puestos.push({x:it.x,y:it.y});
 }
}
// Panel «Bombas de la torre»: elegir sin saturar el 3D. Agrupadas por fila según el croquis.
function renderPumpRail(rail){
 const lista=state.area==='torre'&&(!state.seccion||state.seccion==='n1')?state.pumps.filter(p=>areaOf(p)==='torre'):[];
 rail.hidden=!lista.length;rail.classList.add('pump-rail');if(!lista.length)return;
 const filas=[['Fila eje C',p=>p.z<12.5],['Centro (C–D)',p=>p.z>=12.5&&p.z<18],['Eje E',p=>p.z>=18]];
 rail.classList.toggle('collapsed',!!state.pumpRailCollapsed);
 rail.innerHTML=`<button type="button" class="rail-head" aria-expanded="${!state.pumpRailCollapsed}"><span>⚙ Bombas del Nivel 1 · ${lista.length}</span><b>${state.pumpRailCollapsed?'▸':'▾'}</b></button><div class="rail-body">${filas.map(([t,f])=>{const g=lista.filter(f).sort((a,b)=>a.x-b.x);return g.length?`<p class="rail-group">${t}</p><div class="rail-chips">${g.map(p=>`<button type="button" class="rail-chip${p.enUso===false?' off':''}" data-pump="${esc(p.tag)}" title="${esc(p.nombre)}${p.enUso===false?' · sin uso':''}">${esc(p.tag)}${p.enUso===false?' · sin uso':''}</button>`).join('')}</div>`:'';}).join('')}</div>`;
 rail.querySelector('.rail-head').onclick=()=>{state.pumpRailCollapsed=!state.pumpRailCollapsed;renderPumpRail(rail);};
 rail.querySelectorAll('[data-pump]').forEach(b=>{b.onmouseenter=()=>resaltarBomba(b.dataset.pump);b.onmouseleave=()=>resaltarBomba(null);b.onclick=()=>{resaltarBomba(null);selectPhotoPump(b.dataset.pump);};});
}
function resaltarBomba(tag){
 if(bombaResaltada===tag)return;
 const set=(t,on)=>pumpObjects[t]?.traverse(o=>{if(o.isMesh&&o.material.emissive){if(on){o.userData.em??=o.material.emissive.getHex();o.material.emissive.setHex(0x8fdc3a);o.material.emissiveIntensity=.6;}else if(o.userData.em!==undefined){o.material.emissive.setHex(o.userData.em);o.material.emissiveIntensity=1;}}});
 if(bombaResaltada)set(bombaResaltada,false);bombaResaltada=tag;if(tag)set(tag,true);
 if(!resaltarBomba.faro){const f=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,6,24,1,true),new THREE.MeshBasicMaterial({color:0x8fdc3a,transparent:true,opacity:.35,depthWrite:false,side:THREE.DoubleSide}));f.raycast=()=>{};f.renderOrder=5;resaltarBomba.faro=f;scene.add(f);}
 const w=tag&&pumpWorld(tag);resaltarBomba.faro.visible=!!w&&state.view==='plant';if(w)resaltarBomba.faro.position.set(w.x,w.y+3,w.z);
 document.querySelectorAll('#parts-rail [data-pump]').forEach(b=>b.classList.toggle('active',b.dataset.pump===tag));
}
// Al pasar el mouse por una bomba en el mapa: nombre y resaltado.
(function pumpHover(){
 const tip=$('#part-tip');if(!renderer||!tip)return;let frame=0;
 renderer.domElement.addEventListener('pointermove',e=>{
  if(frame||state.view!=='plant'||state.pump||e.pointerType==='touch')return;
  frame=requestAnimationFrame(()=>{frame=0;
   if(state.view!=='plant'||state.pump){tip.hidden=true;resaltarBomba(null);return;}
   const r=renderer.domElement.getBoundingClientRect();
   raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
   const hit=raycaster.intersectObjects(pickables,false).find(h=>{let o=h.object;while(o){if(!o.visible)return false;o=o.parent;}return true;});
   const pendiente=hit?.object.userData.pending;if(pendiente){tip.textContent=pendiente.nombre+' · sin TAG';tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';tip.hidden=false;renderer.domElement.style.cursor='pointer';resaltarBomba(null);return;}
   const tag=hit?.object.userData.tag||null;resaltarBomba(tag);
   if(!tag){
    const eq=state.area==='torre'&&torre?raycaster.intersectObjects(torre.objetos.filter(o=>o.visible&&o.userData.nombre),false).find(h=>dentroDeSeccion(state.seccion,h.point.y)):null;
    if(eq){tip.textContent=eq.object.userData.nombre;tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';tip.hidden=false;renderer.domElement.style.cursor='';return;}
    tip.hidden=true;renderer.domElement.style.cursor='';return;}
   const p=state.pumps.find(x=>x.tag===tag);tip.textContent=`${tag} · ${p?.nombre||''}${p?.enUso===false?' · SIN USO':''}`;tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top+14)+'px';tip.hidden=false;renderer.domElement.style.cursor='pointer';
  });
 });
})();

// Sección «Actualizar fotos» dentro del expediente de cada bomba.
async function montarFotos(p,exp){
 const anchor=document.getElementById('fuentes-'+p.tag);if(!anchor)return;
 const tag=p.tag,orig=originales(p,exp),pintar=async()=>{
  let act={},photoError='';try{act=await fotosActualizadas(tag,{writable:!!state.writable});photoError=act.warning||'';}catch(error){photoError=error.message;}
  if(state.pump?.tag!==tag||document.getElementById('fuentes-'+tag)!==anchor)return;
  document.getElementById('fotos-actualizar')?.remove();
  document.getElementById('fuentes-'+tag).insertAdjacentHTML('afterend',htmlFotos(p,orig,act,{writable:!!state.writable}));
  const photoRoot=document.getElementById('fotos-actualizar');bindPhotoTransfers(photoRoot,tag,{writable:!!state.writable,token:state.token},pintar);if(photoError){photoRoot.querySelector('#fotos-error').textContent=photoError;const retry=document.createElement('button');retry.type='button';retry.textContent='Reintentar leer fotos';retry.onclick=pintar;photoRoot.querySelector('#fotos-error').after(retry);}
  if(act.posicion){const ref=document.querySelector('#panel .photo-pair img');if(ref)ref.src=act.posicion.url;}

  document.querySelectorAll('#fotos-actualizar input[data-slot]').forEach(input=>input.onchange=async()=>{
   const file=input.files?.[0];if(!file)return;const label=input.closest('label');label.classList.add('saving');
   try{input.disabled=true;await photoInputStarted(input);await guardarFoto(tag,input.dataset.slot,file,{writable:!!state.writable,token:state.token});toast(state.writable?'Foto guardada en Obsidian para '+tag+'.':'Foto guardada en este dispositivo para '+tag+'. Revisá su confirmación en línea.');await pintar();}
   catch(e){setPhotoInputStatus(input,e.message,true);const err=document.getElementById('fotos-error');if(err)err.textContent=e.message;}finally{input.disabled=false;input.value='';label.classList.remove('saving');}
  });
 };
 await pintar();
}

function renderEditingAccess(){
 const selection=state.pump;if(!selection||selection.pending||state.tab!=='ficha')return;
 const tag=selection.tag;if(!/^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(tag))return;
 const href=group=>'/levantamiento.html?tag='+encodeURIComponent(tag)+'#editar-'+group;
 const groups=[['general','Datos de la bomba'],['placa','Placa'],['motor','Motor'],['sello','Sello'],['empaque','Empaque'],['componentes','Rodamientos y acople'],['orings','O-rings'],['fotos','Fotos y componentes']];
 $('#panel').insertAdjacentHTML('afterbegin','<section class="edit-equipment" id="editar-equipo" aria-label="Actualizar '+esc(tag)+'"><h3>Datos y fotos de '+esc(tag)+'</h3><nav class="equipment-primary-actions" aria-label="Editar '+esc(tag)+'"><a href="'+href('general')+'">Editar datos de '+esc(tag)+'</a><a href="'+href('fotos')+'">Editar fotos de '+esc(tag)+'</a></nav><details class="equipment-components"><summary>Ir a un componente</summary><div class="edit-equipment-links">'+groups.filter(([group])=>!['general','fotos'].includes(group)).map(([group,label])=>'<a href="'+href(group)+'">'+label+'</a>').join('')+'</div></details></section>');
 const group={5:'sello',7:'componentes',8:'componentes',9:'motor'}[state.part];
 if(group&&$('#component-detail'))$('#component-detail').insertAdjacentHTML('afterbegin','<a class="button-link" href="'+href(group)+'">Actualizar datos de este componente</a>');
 if(!$('#fuentes-'+tag))$('#panel').insertAdjacentHTML('beforeend','<div class="block" id="fuentes-'+tag+'"><h3>Imágenes del equipo</h3></div>');
 montarFotos({...selection.data,tag},expedienteDe({...selection.data,tag}));
}

// Puente para la app de teléfono (telefono-app.js). Solo expone acciones que el visor ya hace.
window.vocatus={
 get references(){return [...(integrado?.references||[]),...extraReferences];},
 get pumps(){return state.pumps;},get pump(){return state.pump;},get token(){return state.token;},get writable(){return !!state.writable;},get demo(){return !!state.demo;},
 select:tag=>selectPhotoPump(tag),
 selectReference:reference=>selectPendingPump(reference),
 tab:name=>{state.tab=name;renderPanel();},
 explode:value=>{if(Number(value)>0&&state.sector&&state.pump&&state.detail==='exterior'){setPhotoDetail(true);setExplosion(value);renderPanel();}else setExplosion(value);if(camera&&Number(value)>30&&document.body.classList.contains('app-tel'))fly([15,12,32],[0,0,0],650);},
 locate:()=>locateSelectedPump(),
 back:()=>{if(state.view!=='plant'||state.pump)$('#back').click();},
 chooseArea:id=>chooseArea(id),elegirArea:id=>chooseArea(id),
 get area(){return state.area==='integrado'?(state.filtroInt||'planta'):state.area;},
 get explosion(){return state.explode;},
 get listo(){return state.view==='pump'&&detailFlightTicket!==state.loading;},
 corte:()=>$('#anatomy-cut').click(),transparente:()=>$('#anatomy-transparent').click(),get anatomia(){return anatomy?{...anatomy.state}:{};},
 vista:t=>{if(!camera||state.view==='plant')return;const ex=state.explode>30,k=document.body.classList.contains('app-tel')&&ex?1.5:1;const P={tres:[10,8,ex?21:12],frente:[0,1.2,ex?22:13],arriba:[0,ex?30:22,.1]}[t];if(P)fly(P.map(v=>v*k),[0,0,0],650);},
 areaDe:p=>areaOf(p),areaNombre:id=>areaName(id),tipos:p=>tipoDe(p),
 ensure3D:ensurePlant,api
};
document.dispatchEvent(new Event('vocatus:listo'));
