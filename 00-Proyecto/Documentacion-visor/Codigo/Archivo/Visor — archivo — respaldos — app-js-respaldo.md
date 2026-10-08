# Visor/archivo/respaldos/app.js.respaldo

Archivo del visor: archivo/respaldos/app.js.respaldo

**Categoría:** Archivo. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/visor-bombas/archivo/respaldos/app.js.respaldo>).

SHA-256: `1268b52d4d27a7d93255f454307f6ed06a6ec5ef23b38c2525a7348f6e8b70e2`

Esta es una copia documental. Código histórico; no ejecutar ni reponer sobre la aplicación actual.

````javascript
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={pumps:[],pump:null,tab:'ficha',part:null,token:'',configured:false,model:'',answers:{},view:'plant',explode:0,loading:0};
let busyAI=false;
function toast(text){$('#toast').textContent=text;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,4500);}
async function api(route,body){const r=await fetch(route,body?{method:'POST',headers:{'Content-Type':'application/json','X-Local-Token':state.token},body:JSON.stringify(body)}:{});const data=await r.json();if(!r.ok)throw new Error(data.error||'No se pudo completar la acción.');return data;}
const parts=[
 {name:'Carcasa',desc:'Cuerpo de la bomba y conexiones al proceso.',fields:[['Succión DN','succion_dn'],['Descarga DN','descarga_dn'],['Modelo','modelo']]},
 {name:'O-ring de carcasa',desc:'Junta ilustrativa. La posición y la medida reales deben figurar en la ficha.',orings:true},
 {name:'Impulsor',desc:'Elemento hidráulico ilustrativo. Su geometría depende del fabricante.',fields:[['Tipo de bomba','tipo_bomba'],['Diámetro de eje','diametro_eje_mm']]},
 {name:'Tapa posterior',desc:'Soporte posterior ilustrativo del conjunto hidráulico.',fields:[['Marca','marca'],['Modelo','modelo']]},
 {name:'Sello mecánico',desc:'Alternativa de sellado ilustrativa; confirmar si el equipo usa sello o empaquetadura.',fields:[['Tipo de sellado','tipo_sellado'],['Marca','sello_marca'],['Modelo','sello_modelo'],['Diámetro (mm)','sello_diametro_mm'],['Cara rotativa','sello_cara_rotativa'],['Cara estática','sello_cara_estatica'],['Elastómero','sello_elastomero']]},
 {name:'Camisa y eje',desc:'Transmite el movimiento. Dimensiones reales pendientes de documentación.',fields:[['Diámetro de eje (mm)','diametro_eje_mm'],['Velocidad (rpm)','rpm']]},
 {name:'Rodamiento',desc:'Soporte giratorio ilustrativo. El código debe verificarse contra el fabricante.',fields:[['Modelo de bomba','modelo'],['Código de bodega','codigo_bodega']]},
 {name:'Soporte',desc:'Soporte del eje ilustrativo; no representa un despiece de fabricación.',fields:[['Marca','marca'],['Modelo','modelo']]},
 {name:'Acople',desc:'Conecta el accionamiento con la bomba. Tipo y elastómero por confirmar.',fields:[['Potencia (kW)','potencia_kw'],['Velocidad (rpm)','rpm']]},
 {name:'Motor',desc:'Accionamiento ilustrativo. Consultar la placa del motor para sus especificaciones.',fields:[['Potencia registrada (kW)','potencia_kw'],['Velocidad registrada (rpm)','rpm']]}
];
const viewport=$('#viewport');
let renderer,scene,camera,controls,plant,pumpGroup;
const pickables=[],markers=[],componentGroups=[];let cameraFlight=null;
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
 const slab=add(plant,box(30,.12,24,0x233538),0,-.12,0);
 const grid=new THREE.GridHelper(30,30,0x526b67,0x304744);grid.position.y=.01;plant.add(grid);
 for(let a=0;a<2;a++){
  const x=a?7:-7;
  add(plant,box(12,.03,20,a?0x243b35:0x263a43),x,.04,0);
  for(let i=0;i<3;i++){
   const z=-7+i*7; const tank=cyl(a?1.15:1.5,a?4.7:2.3,a?0x48645a:0x3d5b64,'y');add(plant,tank,x-2,a?2.35:1.15,z);
   add(plant,cyl(a?1.22:1.56,.13,0x6c8275,'y'),x-2,a?4.76:2.36,z);
   const line=box(1.8,.18,.18,0x7c9c8a);add(plant,line,x-.2,.4,z);
  }
 }
 state.pumps.forEach((p,i)=>{
  const dist=normalize(p.area)==='destilacion',group=state.pumps.filter(p2=>(normalize(p2.area)==='destilacion')===dist),index=group.indexOf(p);
  const x=(dist?5.5:-8)+(index%3)*2.6,z=-6+Math.floor(index/3)*5.4;
  const g=new THREE.Group();g.position.set(x,.25,z);plant.add(g);g.userData.tag=p.tag;
  add(g,box(1.7,.2,.9,0x5c7068),0,0,0);
  add(g,cyl(.37,.55,0x8faa96),-.45,.45,0);add(g,cyl(.26,.7,0x567f77),.4,.4,0);
  g.traverse(o=>{if(o.isMesh){o.userData.tag=p.tag;pickables.push(o);}});
  const anchor=new THREE.Object3D();anchor.position.set(0,1.25,0);g.add(anchor);marker(anchor,p.tag,'pump',p.tag);
 });
}
function buildPump(){
 const steel=0xa6b9b7,green=0x608d7e,dark=0x42595c,orange=0xe7a269;
 for(let i=0;i<10;i++){
  const g=new THREE.Group();g.userData.index=i;g.userData.base=[-2.8,-2.2,-1.95,-1.65,-1.25,-.4,.4,.8,1.65,2.55][i];g.position.x=g.userData.base;pumpGroup.add(g);componentGroups.push(g);
  if(i===0){add(g,cyl(1.05,.55,green));add(g,cyl(.4,.6,green),-.5,0,0);add(g,ring(.43,.085,steel),-.85,0,0);add(g,cyl(.32,.8,green,'y'),0,.9,.35);add(g,cyl(.46,.12,steel,'y'),0,1.36,.35);add(g,box(.7,.3,1.8,dark),0,-1,0);}
  if(i===1)add(g,ring(.84,.045,orange));
  if(i===2){add(g,cyl(.76,.12,steel));add(g,cyl(.23,.35,steel));for(let k=0;k<7;k++){const vane=box(.12,.52,.095,0xc2cec9);vane.rotation.x=k*Math.PI*2/7;vane.position.set(.1,Math.cos(k*Math.PI*2/7)*.39,Math.sin(k*Math.PI*2/7)*.39);g.add(vane);}}
  if(i===3){add(g,cyl(.9,.17,green));for(let k=0;k<8;k++){add(g,cyl(.05,.23,steel),.1,Math.cos(k*Math.PI/4)*.78,Math.sin(k*Math.PI/4)*.78);}}
  if(i===4){add(g,ring(.29,.11,orange));add(g,cyl(.29,.2,steel),.15);for(let j=0;j<6;j++)add(g,ring(.19,.019,steel),.27+j*.035);}
  if(i===5){add(g,cyl(.12,1.75,steel));add(g,cyl(.2,.8,0xc2d0c7));}
  if(i===6){add(g,ring(.36,.095,steel));add(g,ring(.21,.04,dark));for(let k=0;k<10;k++){add(g,new THREE.Mesh(new THREE.SphereGeometry(.053,10,8),material(steel)),0,Math.cos(k*Math.PI/5)*.29,Math.sin(k*Math.PI/5)*.29);}}
  if(i===7){add(g,cyl(.56,.7,green));add(g,box(.8,.65,.9,dark),0,-.55,0);}
  if(i===8){add(g,cyl(.38,.16,steel),-.13);add(g,cyl(.31,.18,orange),.03);add(g,cyl(.38,.16,steel),.2);}
  if(i===9){add(g,cyl(.66,1.2,green));for(let k=0;k<12;k++){const fin=box(1.05,.13,.09,0x83a596);fin.position.set(0,Math.cos(k*Math.PI/6)*.65,Math.sin(k*Math.PI/6)*.65);fin.rotation.x=k*Math.PI/6;g.add(fin);}add(g,cyl(.67,.15,dark),.7);add(g,box(.6,.28,.45,dark),0,.7,0);add(g,box(1.1,.19,1.5,dark),0,-.73,0);}
  g.traverse(o=>{if(o.isMesh)o.userData.part=i;});
  const anchor=new THREE.Object3D();anchor.position.set(0,i===0?1.7:1.15,0);g.add(anchor);marker(anchor,String(i+1).padStart(2,'0'),'part',i);
 }
 const axis=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11,0,0),new THREE.Vector3(11,0,0)]),new THREE.LineDashedMaterial({color:0x678b7a,dashSize:.13,gapSize:.15,transparent:true,opacity:.45}));axis.computeLineDistances();pumpGroup.add(axis);
 const base=add(pumpGroup,box(7,.16,2.3,0x263d3b),0,-1.3,0);base.userData.isBase=true;
}
function fly(pos,target,duration=1100){cameraFlight={start:performance.now(),duration,from:camera.position.clone(),to:new THREE.Vector3(...pos),fromTarget:controls.target.clone(),toTarget:new THREE.Vector3(...target)};}
function initScene(){
 try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0,0);viewport.prepend(renderer.domElement);
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,1,.1,200);camera.position.set(0,39,9);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=65;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,0,0);controls.addEventListener('start',()=>cameraFlight=null);
 scene.add(new THREE.HemisphereLight(0xd8efe6,0x263c40,2.5));const light=new THREE.DirectionalLight(0xffecd5,3.5);light.position.set(-5,12,8);scene.add(light);const rim=new THREE.DirectionalLight(0x95bcde,2);rim.position.set(5,3,-7);scene.add(rim);
 plant=new THREE.Group();pumpGroup=new THREE.Group();scene.add(plant,pumpGroup);pumpGroup.visible=false;buildPump();
 const observer=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});observer.observe(viewport);
 let down=null;renderer.domElement.addEventListener('pointerdown',e=>down=[e.clientX,e.clientY]);renderer.domElement.addEventListener('pointerup',e=>{
  if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;
  const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
  const hits=raycaster.intersectObjects(state.view==='plant'?pickables:componentGroups,true);
  if(hits.length){const o=hits[0].object;if(state.view==='plant')selectPump(o.userData.tag);else if(o.userData.part!==undefined)selectPart(o.userData.part);}
 });
 renderer.setAnimationLoop(()=>{
  if(cameraFlight){const f=cameraFlight,t=Math.min(1,(performance.now()-f.start)/f.duration),ease=t*t*(3-2*t);camera.position.lerpVectors(f.from,f.to,ease);controls.target.lerpVectors(f.fromTarget,f.toTarget,ease);if(t===1)cameraFlight=null;}
  componentGroups.forEach((g,i)=>{const x=g.userData.base+(i-4.5)*state.explode*.017;g.position.x+=(x-g.position.x)*.12;});
  controls.update();renderer.render(scene,camera);
  for(const m of markers){const show=(m.kind==='pump')===(state.view==='plant');m.el.hidden=!show;if(!show)continue;const v=m.obj.getWorldPosition(new THREE.Vector3()).project(camera);m.el.hidden=v.z>1||v.z< -1||Math.abs(v.x)>1||Math.abs(v.y)>1;m.el.style.left=(v.x+1)/2*viewport.clientWidth+'px';m.el.style.top=(-v.y+1)/2*viewport.clientHeight+'px';}
 });
 }catch(e){$('#scene-error').hidden=false;$('#scene-error').textContent='No se pudo iniciar el visor 3D. Las fichas siguen disponibles. Detalle: '+e.message;}
}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function renderList(){const q=normalize($('#search').value),area=normalize($('#area').value);const list=state.pumps.filter(p=>(!area||normalize(p.area)===area)&&normalize(`${p.tag} ${p.nombre} ${p.servicio}`).includes(q));$('#pump-list').innerHTML=list.map(p=>`<button class="pump-row ${state.pump?.tag===p.tag?'active':''}" data-tag="${esc(p.tag)}"><i>↗</i><strong>${esc(p.tag)}</strong><small>${esc(p.nombre||p.servicio)}</small></button>`).join('')||'<p class="muted">No hay coincidencias.</p>';$('#count').textContent=state.pumps.length;$('#pump-list').querySelectorAll('button').forEach(b=>b.onclick=()=>selectPump(b.dataset.tag));}
async function selectPump(tag){
 const ticket=++state.loading;
 try{const p=await api('/api/pump?tag='+encodeURIComponent(tag));if(ticket!==state.loading)return;state.pump=p;state.part=null;state.view='pump';state.explode=0;$('#explode').value=0;$('#percent').textContent='0%';$('#explode').disabled=false;$('#explode-all').disabled=false;$('#back').hidden=false;
 $('#selected-tag').textContent=p.tag;$('#selected-name').textContent=p.data.nombre||p.data.servicio||'';$('#source-status').textContent='FICHA LEÍDA DE OBSIDIAN · '+(p.data.confianza||'sin verificar').toUpperCase();$('#scene-title').textContent=p.tag+' · Exploración';$('#breadcrumb').textContent='PLANTA / '+(p.data.area||'ÁREA')+' / '+p.tag;
 $('#scene-badge').textContent='MODELO GENÉRICO · NO ES EL DESPIECE DEL FABRICANTE';$('#scene-help').textContent='Arrastrá para girar · Rueda para acercarte · Tocá una pieza';$('#parts-title').textContent='Componentes ilustrativos';$('#part-count').textContent=parts.length+' piezas · validar contra equipo real';
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
 }catch(e){toast(e.message);}
}
function selectPart(index){state.part=index;componentGroups.forEach((g,i)=>g.traverse(o=>{if(o.isMesh)o.material.emissive.setHex(i===index?0x324a1d:0);}));document.querySelectorAll('[data-part]').forEach(b=>b.classList.toggle('active',Number(b.dataset.part)===index));if(index!==null)state.tab='ficha';renderPanel();}
function fields(entries){return '<dl class="fields">'+entries.map(([label,key])=>{const v=state.pump.data[key],missing=v===undefined||v===null||v==='';return `<div class="field"><dt>${esc(label)}</dt><dd class="${missing?'missing':''}">${missing?'Sin levantar':esc(typeof v==='object'?JSON.stringify(v):v)}</dd></div>`;}).join('')+'</dl>';}
function renderPanel(){
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));const p=state.pump;
 if(!p){$('#panel').innerHTML='<div class="empty-state"><div class="symbol">◎</div>Elegí una bomba en el mapa o en el explorador para abrir su expediente.</div>';return;}
 if(state.tab==='ficha'){
  const part=parts[state.part];const noteURI='obsidian://open?'+new URLSearchParams({vault:'autocad el vieno vovatus',file:p.source});
  $('#panel').innerHTML=`<div class="notice">${part?'La pieza seleccionada es ilustrativa. Confirmá su existencia y configuración en la bomba real.':'Ubicación y geometría de demostración. La ficha aporta los datos registrados; no confirma la construcción del modelo.'}</div>${part?`<div class="block"><p class="eyebrow">COMPONENTE ${String(state.part+1).padStart(2,'0')}</p><h2>${esc(part.name)}</h2><p class="muted">${esc(part.desc)}</p>${part.orings?renderOrings():fields(part.fields)}</div>`:`<div class="block"><h3>Identificación</h3>${fields([['Marca','marca'],['Modelo','modelo'],['Serie','serie'],['Tipo de bomba','tipo_bomba'],['Fluido','fluido'],['Confianza registrada','confianza']])}</div><div class="block"><h3>Sellado y repuestos</h3>${fields([['Tipo de sellado','tipo_sellado'],['Sello · modelo','sello_modelo'],['Sello · diámetro (mm)','sello_diametro_mm'],['Elastómero','sello_elastomero'],['Empaque · sección (mm)','empaque_seccion_mm']])}${renderOrings()}</div>`}<div class="block"><h3>Planos vinculados</h3>${p.files.map(f=>f.exists?`<a class="doc" href="/api/document?${new URLSearchParams({tag:p.tag,path:f.path})}">↓ ${esc(f.path.split('/').pop())}</a>`:`<p class="doc muted">${esc(f.path.split('/').pop())} · no encontrado</p>`).join('')||'<p class="muted">Sin archivos vinculados.</p>'}<p class="muted">Láminas: ${esc((Array.isArray(p.data.pid)?p.data.pid:[]).join(' · '))}</p></div><div class="source">Fuente: ${esc(p.source)}<br>${esc(p.data.fuente_datos||'Fuente por verificar')}</div><div class="panel-actions"><a href="${esc(noteURI)}">Abrir ficha en Obsidian ↗</a><button id="print">Imprimir ficha</button></div>`;
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
function setExplosion(value){state.explode=Number(value);$('#explode').value=value;$('#percent').textContent=value+'%';if(camera)fly([state.explode>30?10:8,8,state.explode>30?21:12],[0,0,0],650);}
$('#explode').oninput=e=>setExplosion(e.target.value);$('#explode-all').onclick=()=>setExplosion(state.explode>50?0:100);
$('#back').onclick=()=>{++state.loading;state.view='plant';if(plant){plant.visible=true;pumpGroup.visible=false;fly([0,39,9],[0,0,0]);}$('#back').hidden=true;$('#explode').disabled=true;$('#explode-all').disabled=true;$('#scene-title').textContent='Mapa de equipos';$('#breadcrumb').textContent='PLANTA / VISTA GENERAL';$('#scene-badge').textContent='VISTA SUPERIOR · DISTRIBUCIÓN ILUSTRATIVA';$('#scene-help').textContent='Seleccioná una bomba para acercarte';setViewButtons(true);};
$('#top').onclick=()=>{if(camera)fly(state.view==='plant'?[0,39,.1]:[0,25,.1],[0,0,0]);setViewButtons(true);};$('#iso').onclick=()=>{if(camera)fly(state.view==='plant'?[25,29,29]:[10,8,state.explode>30?21:12],[0,0,0]);setViewButtons(false);};
$('#search').oninput=renderList;$('#area').onchange=renderList;document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;renderPanel();});
$('#close-settings').onclick=()=>$('#settings').close();$('#close-report').onclick=()=>$('#report-dialog').close();
$('#config-form').onsubmit=async e=>{e.preventDefault();const form=e.target;try{const r=await api('/api/config',Object.fromEntries(new FormData(form)));state.configured=r.configured;state.model=r.model;form.elements.apiKey.value='';$('#settings').close();renderPanel();toast('Clave guardada solo durante esta sesión.');}catch(e){$('#config-error').textContent=e.message;}};
$('#report-form').onsubmit=async e=>{e.preventDefault();const tag=state.pump.tag,form=e.target,button=form.querySelector('button.primary');button.disabled=true;try{await api('/api/maintenance',{...Object.fromEntries(new FormData(form)),tag});$('#report-dialog').close();form.reset();if(state.pump?.tag===tag)state.pump=await api('/api/pump?tag='+encodeURIComponent(tag));renderPanel();toast('Informe guardado en Obsidian.');}catch(e){$('#report-error').textContent=e.message;}finally{button.disabled=false;}};
async function refresh(){try{const r=await api('/api/bootstrap');state.pumps=r.pumps;state.token=r.token;state.configured=r.geminiConfigured;state.model=r.model;renderList();if(plant)rebuildPlant();if(state.pump){state.pump=await api('/api/pump?tag='+encodeURIComponent(state.pump.tag));renderPanel();}if(r.errors.length)toast('Hay fichas con YAML inválido: '+r.errors.map(e=>e.file).join(', '));}catch(e){toast(e.message);$('#panel').innerHTML=`<p class="error">${esc(e.message)}</p>`;}}
$('#refresh').onclick=async()=>{await refresh();toast('Lectura de fichas actualizada.');};
initScene();renderPanel();await refresh();

````
