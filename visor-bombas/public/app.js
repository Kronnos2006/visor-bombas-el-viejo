import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { aplicarRealismo } from './realismo.js';
import {photoPumps, plateEvidence, photoURL, photo3URL, exterior, sector} from './sector-fotos.js';
import { plantLayout } from './plant-layout.js';

const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={sector:true,detail:'exterior',pumps:[],pump:null,tab:'ficha',part:null,token:'',configured:false,model:'',answers:{},view:'plant',explode:0,loading:0};
let busyAI=false;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,4500);}
async function api(route,body){const r=await fetch(route,body?{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':state.token},body:JSON.stringify(body)}:{});const data=await r.json();if(!r.ok){const error=new Error(data.error||'No se pudo completar la acción.');error.code=data.code;throw error;}return data;}
const NORMA='ANSI/ASME B73.1 · bomba centrífuga horizontal de proceso, desarme posterior (back pull-out).';
const parts=[
 {name:'Carcasa (voluta)',pieza:'Casing',desc:'Succión axial y descarga a línea de centros, con bridas y patas integradas. En B73.1 la carcasa queda fija: todo el resto del conjunto sale por atrás sin desconectar la tubería.',ref:'La designación de placa (1X1.5-8, 3X4X8G) es descarga × succión \u2212 diámetro nominal de impulsor.',fields:[['Succión DN','succion_dn'],['Descarga DN','descarga_dn'],['Modelo','modelo'],['Marca','marca']]},
 {name:'Empaque de carcasa',pieza:'Casing gasket · o-ring confinado',desc:'Junta confinada entre carcasa y tapa de carcasa. Es la junta que se cambia en cada desarme; su medida sale del corte del fabricante, no del modelo.',ref:'En la familia 2196/4196 va alojada en ranura: la medida depende del tamaño de carcasa.',orings:true},
 {name:'Impulsor abierto',pieza:'Impeller',desc:'Impulsor abierto, roscado al eje. El tercer número de la designación es el diámetro nominal; el recorte real lo da la placa de cada equipo.',ref:'Placa 210775-2: impulsor 200 mm, máximo 215 mm.',fields:[['Tipo de bomba','tipo_bomba'],['Velocidad (rpm)','rpm'],['Caudal (m³/h)','caudal_m3h'],['Altura (m)','altura_m']]},
 {name:'Tapa de carcasa',pieza:'Casing cover',desc:'Cierra la voluta y sostiene la cámara de sello. Se desmonta con el conjunto rotativo completo; es la pieza que define el plano de junta.',ref:'Interfaz normalizada con la bancada: por eso un sello de otra marca calza.',fields:[['Marca','marca'],['Modelo','modelo'],['Presión (bar)','presion_bar'],['Temperatura (°C)','temperatura_c']]},
 {name:'Cámara de sello',pieza:'Seal chamber · big bore',desc:'Alojamiento del sello con conexiones de flush y venteo. B73.1 fija su diámetro, por lo que el sello de cartucho es intercambiable entre marcas del mismo tamaño.',ref:'El diámetro de eje en la cámara depende del grupo de potencia (LF / S / M / L), no del modelo comercial.',fields:[['Tipo de sellado','tipo_sellado'],['Diámetro de eje (mm)','diametro_eje_mm'],['Fluido','fluido'],['Temperatura (°C)','temperatura_c']]},
 {name:'Sello mecánico de cartucho',pieza:'Cartridge mechanical seal',desc:'Camisa, cara rotativa, cara estática, resortes, placa prensa y sus dos o-rings. Alternativa: empaquetadura con prensa y anillo linterna. Hay que confirmar equipo por equipo cuál de las dos lleva.',ref:'Es el repuesto crítico del proyecto: la consulta del técnico termina en estos datos.',fields:[['Tipo de sellado','tipo_sellado'],['Marca','sello_marca'],['Modelo','sello_modelo'],['Tipo','sello_tipo'],['Diámetro (mm)','sello_diametro_mm'],['Cara rotativa','sello_cara_rotativa'],['Cara estática','sello_cara_estatica'],['Elastómero','sello_elastomero'],['Resorte','sello_resorte'],['Empaque · sección (mm)','empaque_seccion_mm'],['Empaque · anillos','empaque_anillos']]},
 {name:'Eje',pieza:'Shaft',desc:'Eje escalonado: tramo fino bajo el sello, tramo grueso entre rodamientos. Puede llevar camisa de desgaste si el equipo trabaja con empaquetadura.',ref:'El diámetro bajo el sello es el dato que determina qué cartucho pedir.',fields:[['Diámetro de eje (mm)','diametro_eje_mm'],['Velocidad (rpm)','rpm'],['Potencia (kW)','potencia_kw']]},
 {name:'Bancada de rodamientos',pieza:'Bearing frame · power end',desc:'Soporta el conjunto rotativo con un rodamiento radial del lado del sello y un par de empuje del lado del acople. Lleva baño de aceite con visor.',ref:'El grupo de potencia (LF / S / M / L) fija el diámetro de eje y el tamaño de rodamientos. Falta leerlo del sufijo de placa.',fields:[['Marca','marca'],['Modelo','modelo'],['Código de bodega','codigo_bodega'],['Proveedor','proveedor']]},
 {name:'Acople espaciador',pieza:'Spacer coupling',desc:'Acople de espaciador: al retirarlo queda el hueco necesario para sacar el conjunto rotativo sin mover el motor. Es la razón de ser del desarme posterior.',ref:'El elemento elástico y la longitud del espaciador siguen por confirmar.',fields:[['Potencia (kW)','potencia_kw'],['Velocidad (rpm)','rpm']]},
 {name:'Motor brida JM',pieza:'JM-flange motor',desc:'Motor de brida JM acoplado a la bancada. Única pieza del conjunto con repuestos ya confirmados por placa.',ref:'Placa leída: 7.5 HP, 1750 rpm, 230/460 V, 19.6/9.8 A, carcasa 213JM, TEFC, clase F. Rodamientos 6309-2Z-J/C3 y 6308-2Z-J/C3.',fields:[['Potencia registrada (kW)','potencia_kw'],['Velocidad registrada (rpm)','rpm']]}
];
const viewport=$('#viewport');
let renderer,scene,camera,controls,plant,pumpGroup,photoDetail;
const pickables=[],markers=[],componentGroups=[];let cameraFlight=null,render3D=null;
const raycaster=new THREE.Raycaster();
function material(color,metalness=.35,roughness=.45){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function box(w,h,d,color){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color));}
function cyl(radius,length,color,axis='x'){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,40),material(color));if(axis==='x')m.rotation.z=Math.PI/2;return m;}
function ring(radius,tube,color){const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,12,48),material(color,.5,.32));m.rotation.y=Math.PI/2;return m;}
function add(parent,obj,x=0,y=0,z=0){obj.position.set(x,y,z);parent.add(obj);return obj;}
function marker(obj,text,kind,id){const el=document.createElement('button');el.className='label'+(kind==='part'?' part-label':'');el.textContent=text;el.title=kind==='part'?parts[id].name:text;el.setAttribute('aria-label',kind==='part'?'Seleccionar '+parts[id].name:'Acercarse a '+text);el.onclick=()=>kind==='part'?selectPart(id):selectPump(id);$('#labels').append(el);markers.push({obj,el,kind});}
function clearGroup(group){group.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of(Array.isArray(o.material)?o.material:[o.material]))m.dispose();});group.clear();}
function rebuildPlant(){
 clearGroup(plant);pickables.length=0;
 for(let i=markers.length-1;i>=0;i--)if(markers[i].kind==='pump'){markers[i].el.remove();markers.splice(i,1);}
 if(state.sector){
  plant.add(sector(THREE));
  for(const p of photoPumps){const g=exterior(THREE,p.scale,p.variant);g.position.set(p.x,.3,p.z);g.rotation.y=p.rotation;g.userData.tag=p.tag;plant.add(g);g.traverse(o=>{if(o.isMesh){o.userData.tag=p.tag;pickables.push(o);}});const a=new THREE.Object3D();a.position.set(0,2.2,0);g.add(a);marker(a,p.tag,'pump',p.tag);}
  document.querySelector('.sidebar footer p').textContent='9 posiciones temporales: 3 al frente, 2 por cada lado y 2 atrás.';
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
function buildPump(){
 const steel=0xa6b9b7,green=0x608d7e,dark=0x42595c,orange=0xe7a269,mach=0xc6d2cd;
 const bases=[-2.95,-2.25,-2.05,-1.75,-1.3,-.9,-.05,.85,1.8,2.85];
 for(let i=0;i<10;i++){
  const g=new THREE.Group();g.userData.index=i;g.userData.base=bases[i];g.position.x=bases[i];pumpGroup.add(g);componentGroups.push(g);
  if(i===0){
   add(g,cyl(1.08,.6,green));add(g,cyl(1.14,.1,green),.3);
   add(g,cyl(.44,.72,green),-.58);add(g,cyl(.7,.1,steel),-.98);
   for(let k=0;k<8;k++)add(g,cyl(.05,.15,steel),-.98,Math.cos(k*Math.PI/4)*.56,Math.sin(k*Math.PI/4)*.56);
   add(g,cyl(.33,.92,green,'y'),0,.94,0);add(g,cyl(.54,.1,steel,'y'),0,1.45,0);
   for(let k=0;k<8;k++)add(g,cyl(.048,.15,steel,'y'),Math.cos(k*Math.PI/4)*.42,1.45,Math.sin(k*Math.PI/4)*.42);
   add(g,box(.34,.9,.32,dark),0,-.62,.78);add(g,box(.34,.9,.32,dark),0,-.62,-.78);
   add(g,box(.85,.2,2.05,dark),0,-1.08,0);
  }
  if(i===1)add(g,ring(1.1,.042,orange));
  if(i===2){
   add(g,cyl(.88,.1,mach),.13);add(g,cyl(.25,.4,mach),-.02);
   for(let k=0;k<6;k++){const a=k*Math.PI/3,v=box(.3,.55,.082,mach);v.position.set(-.12,Math.cos(a)*.45,Math.sin(a)*.45);v.rotation.x=a;v.rotation.y=.33;g.add(v);}
  }
  if(i===3){
   add(g,cyl(1.12,.15,green));add(g,cyl(.6,.3,green),.2);
   for(let k=0;k<10;k++)add(g,cyl(.048,.29,steel),.02,Math.cos(k*Math.PI/5)*.96,Math.sin(k*Math.PI/5)*.96);
  }
  if(i===4){
   add(g,cyl(.54,.46,green));add(g,cyl(.59,.09,steel),.26);
   add(g,cyl(.08,.3,dark,'y'),0,.6,0);add(g,cyl(.13,.07,dark,'y'),0,.76,0);
   for(let k=0;k<4;k++)add(g,cyl(.042,.2,steel),.26,Math.cos(k*Math.PI/2)*.45,Math.sin(k*Math.PI/2)*.45);
  }
  if(i===5){
   add(g,cyl(.19,.64,mach));
   add(g,cyl(.3,.09,0x9fb0ae),-.17);add(g,cyl(.3,.09,0x6c7d82),-.06);
   add(g,ring(.2,.034,orange),-.27);add(g,ring(.32,.034,orange),.21);
   for(let k=0;k<8;k++)add(g,cyl(.026,.2,steel),.07,Math.cos(k*Math.PI/4)*.235,Math.sin(k*Math.PI/4)*.235);
   add(g,cyl(.41,.1,steel),.27);
   for(let k=0;k<4;k++)add(g,cyl(.036,.26,steel),.3,Math.cos(k*Math.PI/2+.8)*.34,Math.sin(k*Math.PI/2+.8)*.34);
  }
  if(i===6){
   add(g,cyl(.11,1.45,mach),-.52);add(g,cyl(.142,.88,mach),.36);add(g,cyl(.172,.11,mach),.86);
  }
  if(i===7){
   add(g,cyl(.45,1.22,green));add(g,cyl(.51,.11,green),-.6);
   add(g,ring(.29,.072,steel),-.4);add(g,ring(.29,.072,steel),.4);add(g,ring(.29,.072,steel),.55);
   add(g,cyl(.29,.11,dark),.67);
   add(g,cyl(.09,.15,0xcfd8c9,'y'),0,.5,.34);
   add(g,box(.92,.72,.98,dark),0,-.7,0);add(g,box(1.12,.14,1.2,dark),0,-1.08,0);
  }
  if(i===8){
   add(g,cyl(.29,.17,mach),-.33);add(g,cyl(.21,.48,steel));add(g,cyl(.29,.17,mach),.33);
   add(g,ring(.25,.048,orange),-.19);add(g,ring(.25,.048,orange),.19);
  }
  if(i===9){
   add(g,cyl(.6,1.4,green));
   for(let k=0;k<14;k++){const fin=box(1.22,.11,.082,0x83a596);fin.position.set(0,Math.cos(k*Math.PI/7)*.62,Math.sin(k*Math.PI/7)*.62);fin.rotation.x=k*Math.PI/7;g.add(fin);}
   add(g,cyl(.64,.11,dark),-.78);add(g,cyl(.48,.16,dark),.8);
   add(g,box(.55,.3,.5,dark),0,.72,0);add(g,box(1.3,.18,1.3,dark),0,-.76,0);
  }
  g.traverse(o=>{if(o.isMesh)o.userData.part=i;});
  const anchor=new THREE.Object3D();anchor.position.set(0,i===0?1.85:(i===7?1:1.2),0);g.add(anchor);marker(anchor,String(i+1).padStart(2,'0'),'part',i);
 }
 const axis=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11,0,0),new THREE.Vector3(11,0,0)]),new THREE.LineDashedMaterial({color:0x678b7a,dashSize:.13,gapSize:.15,transparent:true,opacity:.45}));axis.computeLineDistances();pumpGroup.add(axis);
 const base=add(pumpGroup,box(7.6,.16,2.4,0x263d3b),0,-1.32,0);base.userData.isBase=true;
}
function fly(pos,target,duration=1100){cameraFlight={start:performance.now(),duration,from:camera.position.clone(),to:new THREE.Vector3(...pos),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...target)};}
function initScene(){
 try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);viewport.prepend(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,1,.1,200);camera.position.set(0,39,9);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,0,0);controls.addEventListener('start',()=>cameraFlight=null);
 scene.add(new THREE.HemisphereLight(0xd8efe6,0x263c40,2.5));const light=new THREE.DirectionalLight(0xffecd5,3.5);light.position.set(-5,12,8);scene.add(light);const rim=new THREE.DirectionalLight(0x95bcde,2);rim.position.set(5,3,-7);scene.add(rim);
 plant=new THREE.Group();pumpGroup=new THREE.Group();scene.add(plant,pumpGroup);pumpGroup.visible=false;buildPump();
 try{render3D=aplicarRealismo({THREE,renderer,scene,camera});}catch(err){console.warn('Realismo no aplicado:',err.message);}
 const observer=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(viewport);
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
  const hits=raycaster.intersectObjects(state.view==='plant'?pickables:(state.sector&&state.detail==='exterior'?[]:componentGroups),true);
  if(hits.length){const o=hits[0].object;if(state.view==='plant')selectPump(o.userData.tag);else if(o.userData.part!==undefined)selectPart(o.userData.part);}
 });
 renderer.setAnimationLoop(()=>{
  if(cameraFlight){const f=cameraFlight,t=Math.min(1,(performance.now()-f.start)/f.duration),ease=t*t*(3-2*t);camera.position.lerpVectors(f.from,f.to,ease);controls.target.lerpVectors(f.fromTarget,f.toTarget,ease);if(t===1)cameraFlight=null;}
  componentGroups.forEach((g,i)=>{const x=g.userData.base+(i-4.5)*state.explode*.017;g.position.x+=(x-g.position.x)*.12;});
  controls.update();renderer.render(scene,camera);
  for(const m of markers){const show=m.kind==='pump'?state.view==='plant':state.view==='pump'&&(!state.sector||state.detail==='schematic');m.el.hidden=!show;if(!show)continue;const v=m.obj.getWorldPosition(new THREE.Vector3()).project(camera);m.el.hidden=v.z>1||v.z< -1||Math.abs(v.x)>1||Math.abs(v.y)>1;m.el.style.left=(v.x+1)/2*viewport.clientWidth+'px';m.el.style.top=(-v.y+1)/2*viewport.clientHeight+'px';}
 });
 }catch(e){$('#scene-error').hidden=false;$('#scene-error').textContent='No se pudo iniciar el visor 3D. Las fichas siguen disponibles. Detalle: '+e.message;}
}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function renderList(){const q=normalize($('#search').value),area=normalize($('#area').value);const list=state.pumps.filter(p=>(!area||normalize(p.area)===area)&&normalize(`${p.tag} ${p.nombre} ${p.servicio}`).includes(q));$('#pump-list').innerHTML=list.map(p=>`<button class="pump-row ${state.pump?.tag===p.tag?'active':''}" data-tag="${esc(p.tag)}"><i>↗</i><strong>${esc(p.tag)}</strong><small>${esc(p.nombre||p.servicio)}</small></button>`).join('')||'<p class="muted">No hay coincidencias.</p>';$('#count').textContent=state.pumps.length;$('#pump-list').querySelectorAll('button').forEach(b=>b.onclick=()=>selectPump(b.dataset.tag));}
async function selectPump(tag){
 if(state.sector)return selectPhotoPump(tag);
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
function selectPart(index){state.part=index;componentGroups.forEach((g,i)=>g.traverse(o=>{if(o.isMesh)o.material.emissive.setHex(i===index?0x324a1d:0);}));document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('active',Number(b.dataset.part)===index));if(index!==null)state.tab='ficha';renderPanel();if(state.sector&&index!==null)requestAnimationFrame(()=>{const panel=$('#panel'),detail=$('#component-detail');panel?.scrollTo({top:0,behavior:'smooth'});detail?.focus({preventScroll:true});});}
function fields(entries){return '<dl class="fields">'+entries.map(([label,key])=>{const v=state.pump.data[key],missing=v===undefined||v===null||v==='';return `<div class="field"><dt>${esc(label)}</dt><dd class="${missing?'missing':''}">${missing?'Sin levantar':esc(typeof v==='object'?JSON.stringify(v):v)}</dd></div>`;}).join('')+'</dl>';}
function renderPanel(){
 if(state.sector){renderPhotoPanel();return;}
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));const p=state.pump;
 if(!p){$('#panel').innerHTML='<div class="empty-state"><div class="symbol">◎</div>Elegí una bomba en el mapa o en el explorador para abrir su expediente.</div>';return;}
 if(state.tab==='ficha'){
  const part=parts[state.part];const noteURI='obsidian://open?'+new URLSearchParams({vault:state.vaultName||'autocad el vieno vovatus',file:p.source});
  $('#panel').innerHTML=`<div class="notice">${state.demo?'PROPUESTA: datos e historial ficticios. Las medidas no son especificaciones de compra. ':''}${part?'Despiece según ANSI/ASME B73.1: la arquitectura es la de la norma, verificada contra las placas. Las medidas de cada pieza siguen pendientes del catálogo del fabricante.':'Ubicación y geometría de demostración. La ficha aporta los datos registrados; no confirma la construcción del modelo.'}</div>${part?`<div class="block"><p class="eyebrow">COMPONENTE ${String(state.part+1).padStart(2,'0')}</p><h2>${esc(part.name)}</h2><p class="eyebrow">${esc(part.pieza)}</p><p class="muted">${esc(part.desc)}</p>${part.ref?`<p class="norma">${esc(part.ref)}</p>`:''}${part.orings?renderOrings():fields(part.fields)}</div>`:`<div class="block"><h3>Identificación</h3>${fields([['Marca','marca'],['Modelo','modelo'],['Serie','serie'],['Tipo de bomba','tipo_bomba'],['Fluido','fluido'],['Confianza registrada','confianza']])}</div><div class="block"><h3>Sellado y repuestos</h3>${fields([['Tipo de sellado','tipo_sellado'],['Sello · modelo','sello_modelo'],['Sello · diámetro (mm)','sello_diametro_mm'],['Elastómero','sello_elastomero'],['Empaque · sección (mm)','empaque_seccion_mm']])}${renderOrings()}</div>`}<div class="block"><h3>Planos vinculados</h3>${p.files.map(f=>f.exists?`<a class="doc" href="/api/document?${new URLSearchParams({tag:p.tag,path:f.path})}">↓ ${esc(f.path.split('/').pop())}</a>`:`<p class="doc muted">${esc(f.path.split('/').pop())} · no encontrado</p>`).join('')||'<p class="muted">Sin archivos vinculados.</p>'}<p class="muted">Láminas: ${esc((Array.isArray(p.data.pid)?p.data.pid:[]).join(' · '))}</p></div><div class="source">${part?esc(NORMA)+'<br>':''}Fuente: ${esc(p.source)}<br>${esc(p.data.fuente_datos||'Fuente por verificar')}</div><div class="panel-actions">${state.demo?'<span class="muted">Ficha local de demostración</span>':`<a href="${esc(noteURI)}">Abrir ficha en Obsidian ↗</a>`}<button id="print">Imprimir ficha</button></div>`;
  $('#print').onclick=()=>window.print();
 }else if(state.tab==='historial'){
  const rows=p.history.split('\n').filter(l=>/^\|/.test(l)&&!/^\|[\s|:-]+$/.test(l)&&!/^\|\s*Fecha/i.test(l));
  $('#panel').innerHTML=`<p class="eyebrow">REGISTROS DOCUMENTALES</p><h2>${p.reports.length+rows.length} registros encontrados</h2><p class="muted">Se lee el historial de la ficha y los informes de 00-Proyecto/Mantenimiento.</p><button class="primary wide" id="new-report">＋ Registrar mantenimiento</button>${rows.length?`<div class="block"><h3>Historial de la ficha</h3><pre class="markdown-text">${esc(p.history)}</pre></div>`:''}${p.reports.map(r=>`<details class="record"><summary>${esc(r.text.match(/^# (.+)$/m)?.[1]||r.file)}</summary><pre>${esc(r.text)}</pre><span class="source">${esc(r.file)}</span></details>`).join('')}${!p.reports.length&&!rows.length?'<div class="empty-state"><div class="symbol">◷</div>Todavía no hay intervenciones registradas.<br>Esto no significa que la bomba no haya fallado.</div>':''}<div class="block"><h3>Fallas observadas en la ficha</h3><pre class="markdown-text">${esc(p.failures||'Sin fallas documentadas.')}</pre></div><button class="wide" id="analyze">Analizar registros con Gemini ↗</button><button class="wide" id="print-history">Imprimir historial</button>`;
  $('#new-report').onclick=()=>{const d=new Date();$('#report-form [name=date]').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);$('#report-error').textContent='';$('#report-dialog').showModal();};$('#analyze').onclick=()=>{state.tab='ia';renderPanel();$('#question').value='Analizá el historial de esta bomba. Separá hechos documentados, posibles fallas por verificar y datos que hacen falta.';};$('#print-history').onclick=()=>{document.querySelectorAll('.record').forEach(e=>e.open=true);window.print();};
 }else{
  $('#panel').innerHTML=`<p class="eyebrow">GEMINI / CONTEXTO: ${esc(p.tag)}</p><h2>Consultá tu equipo</h2><p class="muted">Respuestas basadas en la ficha y los informes. Las posibles fallas se presentan como hipótesis para verificar.</p><div class="notice ${state.configured?'green':''}">${state.configured?'Gemini configurado. La consulta enviará los registros de esta bomba a Google.':'Falta conectar tu clave API. No se generan respuestas simuladas.'}</div><button id="configure" class="wide">${state.configured?'Configurar Gemini':'Conectar Gemini'}</button><div class="suggestions"><button data-question="¿Qué medidas de o-rings y qué sello están documentados? Indicá los datos faltantes.">¿Qué sello y o-rings usa? ↗</button><button data-question="Resumí los informes de mantenimiento de esta bomba con fechas y fuentes.">Resumir el mantenimiento ↗</button><button data-question="Con los registros disponibles, ¿qué posibles fallas conviene investigar? Separá evidencia, hipótesis y comprobaciones.">Analizar posibles fallas ↗</button></div><form id="ask-form"><textarea id="question" placeholder="Ej. ¿Qué revisamos si aparece una fuga?" maxlength="4000" required aria-label="Pregunta para Gemini"></textarea><button class="primary wide" ${busyAI?'disabled':''}>${busyAI?'Consultando…':'Consultar Gemini →'}</button></form><div id="ai-output"></div>`;
  $('#configure').onclick=()=>{$('#config-form [name=model]').value=state.model;$('#settings').showModal();};document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;$('#question').focus();});$('#ask-form').onsubmit=ask;
  const answer=state.answers[p.tag];if(answer)showAnswer(answer);
 }
}
function renderOrings(){const rings=state.pump.data.orings;return Array.isArray(rings)&&rings.length?'<div class="block"><h3>O-rings registrados</h3>'+rings.map(o=>`<div class="record"><strong>${esc(o.posicion||'Posición no registrada')}</strong><p class="muted">Medida: ${esc(o.medida||'Sin levantar')}<br>Material: ${esc(o.material||'Sin levantar')}<br>Cantidad: ${esc(o.cantidad??'Sin levantar')}<br>Código: ${esc(o.codigo||'Sin levantar')}</p></div>`).join('')+'</div>':'<p class="notice">No hay medidas de o-rings registradas.</p>';}
function showAnswer(item){const target=$('#ai-output');if(target)target.innerHTML=`<p class="answer-caption">PREGUNTA: ${esc(item.question)}</p><div class="ai-answer">${esc(item.answer)}</div><p class="source">${esc(item.source)}</p>`;}
async function ask(e){e.preventDefault();if(busyAI)return;const tag=state.pump.tag,question=$('#question').value;busyAI=true;const btn=$('#ask-form button');btn.disabled=true;btn.textContent='Consultando…';try{const response=await api('/api/ask',{tag,question,component:parts[state.part]?.name||''});state.answers[tag]={...response,question};if(state.pump?.tag===tag&&state.tab==='ia')showAnswer(state.answers[tag]);}catch(error){if(state.pump?.tag===tag&&$('#ai-output'))$('#ai-output').innerHTML=`<p class="error">${esc(error.message)}</p>`;else toast(error.message);}finally{busyAI=false;if($('#ask-form button')){$('#ask-form button').disabled=false;$('#ask-form button').textContent='Consultar Gemini →';}}}
function setViewButtons(top){$('#top').classList.toggle('active',top);$('#iso').classList.toggle('active',!top);}
function setExplosion(value){state.explode=Number(value);$('#explode').value=value;$('#percent').textContent=value+'%';if(state.sector&&state.detail==='schematic')$('#explode-all').textContent=state.explode>50?'Juntar piezas':'Separar piezas ↗';if(camera)fly([state.explode>30?10:8,8,state.explode>30?21:12],[0,0,0],650);}
$('#explode').oninput=e=>{if(state.sector&&state.detail==='exterior')setPhotoDetail(true);setExplosion(e.target.value);};$('#explode-all').onclick=()=>{if(state.sector&&state.pump&&state.detail==='exterior'){setPhotoDetail(true);setExplosion(100);renderPanel();return;}setExplosion(state.explode>50?0:100);$('#explode-all').textContent=state.explode>50?'Juntar piezas':'Separar piezas ↗';};
$('#back').onclick=()=>{++state.loading;if(photoDetail)photoDetail.visible=false;state.view='plant';if(plant){plant.visible=true;pumpGroup.visible=false;fly([0,39,9],[0,0,0]);}$('#back').hidden=true;$('#explode').disabled=true;$('#explode-all').disabled=true;$('#scene-title').textContent='Mapa de equipos';$('#breadcrumb').textContent='PLANTA / VISTA GENERAL';$('#scene-badge').textContent=state.sector?'SECTOR FOTOGRAFIADO · POSICIONES APROXIMADAS':'VISTA SUPERIOR · DISTRIBUCIÓN ILUSTRATIVA';$('#scene-help').textContent='Seleccioná una bomba para acercarte';setViewButtons(true);};
$('#top').onclick=()=>{if(camera)fly(state.view==='plant'?[0,39,.1]:[0,25,.1],[0,0,0]);setViewButtons(true);};$('#iso').onclick=()=>{if(camera)fly(state.view==='plant'?[25,29,29]:[10,8,state.explode>30?21:12],[0,0,0]);setViewButtons(false);};
$('#search').oninput=renderList;$('#area').onchange=renderList;document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderPanel();});
$('#close-settings').onclick=()=>$('#settings').close();$('#close-report').onclick=()=>$('#report-dialog').close();
$('#config-form').onsubmit=async e=>{e.preventDefault();const form=e.target;try{const r=await api('/api/config',Object.fromEntries(new FormData(form)));state.configured=r.configured;state.model=r.model;form.elements.apiKey.value='';$('#settings').close();renderPanel();toast('Clave guardada solo durante esta sesión.');}catch(e){$('#config-error').textContent=e.message;}};
$('#report-form').onsubmit=async e=>{e.preventDefault();const tag=state.pump.tag,form=e.target,button=form.querySelector('button.primary');button.disabled=true;try{await api('/api/maintenance',{...Object.fromEntries(new FormData(form)),tag});$('#report-dialog').close();form.reset();if(state.pump?.tag===tag)state.pump=await api('/api/pump?tag='+encodeURIComponent(tag));renderPanel();toast(state.demo?'Informe de prueba guardado en la carpeta de demostración.':'Informe guardado en Obsidian.');}catch(e){$('#report-error').textContent=e.message;}finally{button.disabled=false;}};
async function refresh(){try{const r=await api('/api/bootstrap');state.pumps=state.sector?photoPumps:r.pumps;state.demo=r.demo;state.vaultName=r.vaultName;state.token=r.token;const area=$('#area').value;$('#area').innerHTML='<option value="">Todas las áreas</option>'+[...new Set(state.pumps.map(p=>p.area).filter(Boolean))].map(a=>`<option>${esc(a)}</option>`).join('');$('#area').value=state.pumps.some(p=>p.area===area)?area:'';document.querySelector('.local').textContent='● SECTOR · EXPEDIENTES INTEGRADOS';document.querySelector('.sidebar footer p').textContent='9 posiciones temporales con fotos, ficha, historial e IA.';$('#report-dialog .muted').textContent='Los registros de la propuesta deben conservar la identificación DEMO.';$('#scene-badge').textContent='SECTOR FOTOGRAFIADO · POSICIONES APROXIMADAS';state.configured=r.geminiConfigured;state.model=r.model;renderList();if(plant)rebuildPlant();if(state.pump)renderPanel();if(r.errors.length)console.warn('Fichas antiguas con YAML inválido:',r.errors);}catch(e){toast(e.message);$('#panel').innerHTML=`<p class="error">${esc(e.message)}</p>`;}}
$('#refresh').onclick=async()=>{await refresh();toast('Expedientes actualizados.');};
function setPhotoDetail(schematic){
 state.detail=schematic?'schematic':'exterior';state.part=null;state.explode=0;$('#explode').value=0;$('#percent').textContent='0%';
 if(plant)plant.visible=false;if(pumpGroup)pumpGroup.visible=schematic;if(photoDetail)photoDetail.visible=!schematic;
 $('#explode').disabled=!schematic;$('#explode-all').disabled=false;$('#explode-all').textContent=schematic?(state.explode>50?'Juntar piezas':'Separar piezas ↗'):'Ver vista explosionada ↗';
 const identity=state.pump?.data?`${state.pump.data.marca} ${state.pump.data.modelo}`:'bomba seleccionada';
 $('#scene-badge').textContent=schematic?`DESPIECE DEMO · ${identity.toUpperCase()} · MEDIDAS POR CONFIRMAR`:`EXTERIOR ${identity.toUpperCase()} · BASADO EN FOTOS`;
 $('#parts-title').textContent=schematic?`Despiece de ${identity}`:'Conjunto exterior';$('#part-count').textContent=schematic?'10 componentes · datos DEMO':'Carcasa · guarda · motor · cubierta';
 const componentButtons=schematic?parts.map((part,index)=>`<button class="part-button" data-part="${index}"><span>${String(index+1).padStart(2,'0')}</span>${esc(part.name)}</button>`).join(''):'';
 $('#parts').innerHTML='<button id="switch-detail">'+(schematic?'← Volver al exterior de esta bomba':'Ver vista explosionada de esta bomba ↗')+'</button>'+componentButtons;
 $('#switch-detail').onclick=()=>{setPhotoDetail(!schematic);renderPanel();};document.querySelectorAll('#parts [data-part]').forEach(button=>button.onclick=()=>selectPart(Number(button.dataset.part)));if(camera)fly(schematic?[8,7,12]:[5,4,7],[0,schematic?0:1,0]);
}
function selectPhotoPump(tag){
 const p=photoPumps.find(p=>p.tag===tag);if(!p)return;const ticket=++state.loading;
 state.pump={tag,data:p,photo:true};state.tab='ficha';state.part=null;
 $('#selected-tag').textContent=tag;$('#selected-name').textContent=`${p.marca} ${p.modelo} · ${p.nombre}`;$('#source-status').textContent='EXPEDIENTE DEMO · DATOS ILUSTRATIVOS';
 $('#scene-title').textContent=tag+' · Exterior';$('#breadcrumb').textContent='SECTOR FOTOGRAFIADO / '+tag;$('#back').hidden=false;
 $('#scene-help').textContent='Arrastrá para girar · Rueda para acercarte';
 const show=()=>{if(ticket!==state.loading)return;state.view='pump';if(scene){if(photoDetail){clearGroup(photoDetail);scene.remove(photoDetail);}photoDetail=exterior(THREE,p.scale*1.7,p.variant);scene.add(photoDetail);}setPhotoDetail(false);renderPanel();};
 if(plant?.visible){fly([p.x+3,6,p.z+5],[p.x,1,p.z],600);setTimeout(show,620);}else show();renderList();renderPanel();setViewButtons(false);
}
function renderPhotoPanel(){
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
 const p=state.pump?.data;
 if(!p){$('#panel').innerHTML=`<p class="eyebrow">SECTOR FOTOGRAFIADO · 07 OCT 2026</p><h2>Seleccioná una bomba</h2><p class="notice">El expediente mostrará únicamente la bomba elegida. Los datos de sellos, o-rings e historial están preparados para la demostración y se distinguen de la evidencia real.</p><img src="${photo3URL('142609')}" alt="Vista elevada de los tanques del sector"><p class="muted">Referencia utilizada para orientar y completar los tanques del render.</p>`;return;}
 const plate=plateEvidence.find(item=>item.serie===p.serie);
 const demo='<span class="demo-chip">DEMO · POR CONFIRMAR</span>';
 const fieldRows=rows=>'<dl class="fields">'+rows.map(([key,value])=>`<div class="field"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')+'</dl>';
 if(state.tab==='historial'){
  $('#panel').innerHTML=`<p class="eyebrow">HISTORIAL · ${esc(p.tag)}</p><h2>${esc(p.marca)} ${esc(p.modelo)}</h2><p class="notice">Historial ficticio preparado para presentar el flujo del sistema. No describe trabajos reales.</p>${p.history.map(item=>`<article class="record"><strong>${esc(item.fecha)} · ${esc(item.tipo)}</strong><p>${esc(item.detalle)}</p><small>${esc(item.responsable)}</small></article>`).join('')}<div class="block"><h3>Posibles fallas a vigilar ${demo}</h3><ul><li>Fuga progresiva en el sello mecánico.</li><li>Elastómero hinchado, endurecido o incompatible con el fluido.</li><li>Vibración por desalineación del acople.</li><li>Ruido de cavitación por restricción en succión.</li><li>Temperatura anormal en rodamientos.</li></ul></div>`;return;
 }
 if(state.tab==='ia'){
  $('#panel').innerHTML=`<p class="eyebrow">GEMINI / CONTEXTO: ${esc(p.tag)}</p><h2>${esc(p.marca)} ${esc(p.modelo)}</h2><p class="notice">Gemini analiza solamente el expediente DEMO de esta bomba seleccionada. TAG, placa, sellos y medidas deben confirmarse antes de cualquier uso real.</p>${fieldRows([['Servicio de demo',p.servicio],['Sellado',p.seal.tipo],['Elastómero',p.seal.elastomero],['Registros de demo',String(p.history.length)]])}<div class="notice ${state.configured?'green':''}">${state.configured?'Gemini configurado. La consulta enviará a Google el expediente DEMO de esta bomba.':'Falta conectar tu clave API. No se generan respuestas simuladas.'}</div><button id="configure" class="wide">${state.configured?'Configurar Gemini':'Conectar Gemini'}</button><div class="suggestions"><button data-question="¿Qué sello y o-rings aparecen en este expediente y qué datos faltan confirmar?">¿Qué sello y o-rings usa? ↗</button><button data-question="Resumí el historial DEMO de esta bomba, separado por fechas.">Resumir el mantenimiento ↗</button><button data-question="¿Qué posibles fallas conviene investigar? Separá evidencia, hipótesis y comprobaciones.">Analizar posibles fallas ↗</button></div><form id="ask-form"><textarea id="question" placeholder="Ej. ¿Qué revisamos si aparece una fuga?" maxlength="4000" required aria-label="Pregunta para Gemini"></textarea><button class="primary wide" ${busyAI?'disabled':''}>${busyAI?'Consultando…':'Consultar Gemini →'}</button></form><div id="ai-output"></div>`;
  $('#configure').onclick=()=>{$('#config-form [name=model]').value=state.model;$('#settings').showModal();};document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;$('#question').focus();});$('#ask-form').onsubmit=ask;const answer=state.answers[p.tag];if(answer)showAnswer(answer);return;
 }
 const rings=p.orings.map(r=>`<div class="record"><strong>${esc(r.posicion)}</strong>${fieldRows([['Medida de demo',r.medida],['Material de demo',r.material],['Cantidad',String(r.cantidad)],['Código de demo',r.codigo]])}</div>`).join('');
 const plateValue=label=>plate?.specs.find(([key])=>key===label)?.[1]||'Por confirmar';
 const componentRows=index=>[
  [['Función','Conducir el fluido y contener la presión'],['Familia',`${p.marca} ${p.modelo}`],['Tamaño',p.size],['Material de demo','Acero inoxidable 316']],
  [['Posición',p.orings[0].posicion],['Medida de demo',p.orings[0].medida],['Material',p.orings[0].material],['Código',p.orings[0].codigo]],
  [['Función','Transferir energía al fluido'],['Diámetro leído',plateValue('Impulsor')],['Tipo de demo','Impulsor abierto ANSI'],['Material de demo','Acero inoxidable 316']],
  [['Función','Cerrar la carcasa y alojar el sellado'],['Familia',p.variant.toUpperCase()],['Material de demo','Acero inoxidable 316'],['Estado','Medidas por confirmar']],
  [['Tipo',p.seal.tipo],['Diámetro',p.seal.diametro],['Caras',p.seal.caras],['Elastómero',p.seal.elastomero],['Código',p.seal.codigo]],
  [['Función','Transmitir el giro al impulsor'],['Diámetro de demo',p.seal.diametro],['Material de demo','Acero inoxidable 316'],['Estado','Medidas por confirmar']],
  [['Función','Soportar el eje en rotación'],['Código lado bomba de demo','6309-2Z-J/C3'],['Código lado opuesto de demo','6308-2Z-J/C3'],['Lubricación','Aceite']],
  [['Función','Alojar eje y rodamientos'],['Tamaño de bastidor',p.variant.toUpperCase()],['Lubricación','Aceite'],['Estado','Geometría ilustrativa']],
  [['Función','Unir motor y bomba'],['Tipo de demo','Acople flexible'],['Elemento de demo','NBR'],['Alineación','Verificar en campo']],
  [['Función','Accionar la bomba'],['Potencia de demo',p.variant==='mto'?'10 HP':'7.5 HP'],['Velocidad de demo','1750 rpm'],['Protección de demo','TEFC']]
 ][index]||[];
 const componentCard=state.part!==null?`<section id="component-detail" class="component-focus" tabindex="-1"><p class="eyebrow">PIEZA ${String(state.part+1).padStart(2,'0')} SELECCIONADA</p><h2>${esc(parts[state.part].name)}</h2><p>${esc(parts[state.part].desc)}</p>${demo}${fieldRows(componentRows(state.part))}<p class="muted">Información preparada para la demostración; confirmar medidas, material y código antes de intervenir o comprar.</p></section>`:'';
 const photos=`<div class="photo-pair"><figure><figcaption>Foto de la bomba</figcaption><img src="${photo3URL(p.foto3)}" alt="Bomba asociada a ${esc(p.tag)} en la demo"></figure>${plate?`<figure><figcaption>Foto de la placa</figcaption><img src="${photoURL(plate.foto)}" alt="Placa ${esc(plate.serie)}"></figure>`:''}</div><p class="muted">Las fotos son reales; la relación entre esta placa, esta posición y el TAG debe confirmarse.</p>`;
 $('#panel').innerHTML=`${componentCard}<p class="eyebrow">EXPEDIENTE DE ${esc(p.tag)}</p><h2>${esc(p.marca)} ${esc(p.modelo)}</h2><p class="notice">Expediente preparado para la presentación. La foto y la lectura de placa son evidencia; su asociación con esta posición y los datos de repuestos son DEMO.</p>${photos}${fieldRows([['Posición',p.nombre],['Fabricante',p.marca],['Modelo',p.modelo],['Serie asociada en demo',p.serie],['Tamaño',p.size],['Servicio de demo',p.servicio],['Estado de asociación',p.association]])}<div class="block"><h3>Sello mecánico ${demo}</h3>${fieldRows([['Tipo',p.seal.tipo],['Diámetro',p.seal.diametro],['Caras',p.seal.caras],['Elastómero',p.seal.elastomero],['Código',p.seal.codigo]])}</div><div class="block"><h3>O-rings ${demo}</h3>${rings}</div>`;
}
document.querySelector('.compass').textContent='EJE LOCAL ↑';
initScene();renderPanel();await refresh();
