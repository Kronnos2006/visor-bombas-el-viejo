from pathlib import Path
p=Path(__file__).resolve().parents[1]/'public'
f=p/'app.js';s=f.read_text(encoding='utf-8')
s=s.replace("import { plantLayout }", "import {photoPumps, plateEvidence, photoURL, exterior, sector} from './sector-fotos.js';\nimport { plantLayout }")
s=s.replace("const state={pumps:","const state={sector:true,detail:'exterior',pumps:")
s=s.replace('let renderer,scene,camera,controls,plant,pumpGroup;','let renderer,scene,camera,controls,plant,pumpGroup,photoDetail;')
s=s.replace(' const slab=add(plant,', ''' if(state.sector){
  plant.add(sector(THREE));
  for(const p of photoPumps){const g=exterior(THREE,p.scale);g.position.set(p.x,.3,p.z);g.userData.tag=p.tag;plant.add(g);g.traverse(o=>{if(o.isMesh){o.userData.tag=p.tag;pickables.push(o);}});const a=new THREE.Object3D();a.position.set(0,2.2,0);g.add(a);marker(a,p.tag,'pump',p.tag);}
  if(render3D)render3D.refrescar();return;
 }
 const slab=add(plant,''')
s=s.replace("const show=(m.kind==='pump')===(state.view==='plant');","const show=m.kind==='pump'?state.view==='plant':state.view==='pump'&&(!state.sector||state.detail==='schematic');")
s=s.replace("state.view==='plant'?pickables:componentGroups","state.view==='plant'?pickables:(state.sector&&state.detail==='exterior'?[]:componentGroups)")
s=s.replace('async function selectPump(tag){','async function selectPump(tag){\n if(state.sector)return selectPhotoPump(tag);')
s=s.replace("function renderPanel(){","function renderPanel(){\n if(state.sector){renderPhotoPanel();return;}")
s=s.replace("$('#back').onclick=()=>{++state.loading;","$('#back').onclick=()=>{++state.loading;if(photoDetail)photoDetail.visible=false;")
s=s.replace("$('#scene-badge').textContent='VISTA SUPERIOR · DISTRIBUCIÓN ILUSTRATIVA';","$('#scene-badge').textContent=state.sector?'SECTOR FOTOGRAFIADO · POSICIONES APROXIMADAS':'VISTA SUPERIOR · DISTRIBUCIÓN ILUSTRATIVA';")
s=s.replace("state.pumps=r.pumps;state.demo=r.demo;","state.pumps=state.sector?photoPumps:r.pumps;state.demo=r.demo;")
s=s.replace("[...new Set(r.pumps.map(p=>p.area).filter(Boolean))]","[...new Set(state.pumps.map(p=>p.area).filter(Boolean))]")
s=s.replace("if(state.pump){const selected=", "if(state.pump&&state.sector){renderPanel();}else if(state.pump){const selected=")
s=s.replace("state.configured=r.geminiConfigured;", "if(state.sector){document.querySelector('.local').textContent='● SECTOR · FOTOS REALES';document.querySelector('.sidebar footer p').textContent='5 posiciones temporales. Alcance parcial del sector; medidas aproximadas.';$('#scene-badge').textContent='SECTOR FOTOGRAFIADO · POSICIONES APROXIMADAS';}state.configured=r.geminiConfigured;")
s=s.replace("initScene();renderPanel();await refresh();", '''function setPhotoDetail(schematic){
 state.detail=schematic?'schematic':'exterior';state.part=null;state.explode=0;$('#explode').value=0;$('#percent').textContent='0%';
 if(plant)plant.visible=false;if(pumpGroup)pumpGroup.visible=schematic;if(photoDetail)photoDetail.visible=!schematic;
 $('#explode').disabled=!schematic;$('#explode-all').disabled=!schematic;
 $('#scene-badge').textContent=schematic?'DESPIECE GENÉRICO · INTERIORES NO VERIFICADOS':'EXTERIOR APROXIMADO A PARTIR DE FOTOS';
 $('#parts-title').textContent=schematic?'Componentes ilustrativos':'Conjunto exterior';$('#part-count').textContent=schematic?'No es el despiece del fabricante':'Carcasa · guarda · motor · cubierta';
 $('#parts').innerHTML='<button id="switch-detail">'+(schematic?'Volver al exterior fotografiado':'Ver despiece genérico ilustrativo')+'</button>';
 $('#switch-detail').onclick=()=>{setPhotoDetail(!schematic);renderPanel();};if(camera)fly(schematic?[8,7,12]:[5,4,7],[0,schematic?0:1,0]);
}
function selectPhotoPump(tag){
 const p=photoPumps.find(p=>p.tag===tag);if(!p)return;const ticket=++state.loading;
 state.pump={tag,data:{nombre:p.nombre},photo:true};state.tab='ficha';state.part=null;
 $('#selected-tag').textContent=tag;$('#selected-name').textContent=p.nombre;$('#source-status').textContent='POSICIÓN TEMPORAL · PLACA SIN ASOCIAR';
 $('#scene-title').textContent=tag+' · Exterior';$('#breadcrumb').textContent='SECTOR FOTOGRAFIADO / '+tag;$('#back').hidden=false;
 $('#scene-help').textContent='Arrastrá para girar · Rueda para acercarte';
 const show=()=>{if(ticket!==state.loading)return;state.view='pump';if(scene){if(photoDetail){clearGroup(photoDetail);scene.remove(photoDetail);}photoDetail=exterior(THREE,p.scale*1.7);scene.add(photoDetail);}setPhotoDetail(false);renderPanel();};
 if(plant?.visible){fly([p.x+3,6,p.z+5],[p.x,1,p.z],600);setTimeout(show,620);}else show();renderList();renderPanel();setViewButtons(false);
}
function renderPhotoPanel(){
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.tab));
 const evidence=plateEvidence.map(([serial,size,id])=>`<details class="record"><summary>Hidromac 2196 · ${esc(serial)}</summary><p>${esc(size)} · lectura de placa</p><a href="${photoURL(id)}" target="_blank" rel="noopener"><img loading="lazy" src="${photoURL(id)}" alt="Placa de serie ${esc(serial)}"></a><p class="muted">Pendiente de asociar a una posición del mapa.</p></details>`).join('');
 if(state.tab==='historial'){$('#panel').innerHTML='<h2>Sin historial vinculado</h2><p class="notice">Estos identificadores ubican conjuntos en una fotografía. Todavía no están asociados a las fichas oficiales. Los registros de mantenimiento se consultan en «Fichas de Obsidian».</p>';return;}
 if(state.tab==='ia'){$('#panel').innerHTML='<h2>Identificación pendiente</h2><p class="notice">Primero hay que asociar cada posición con su placa y TAG para consultar el historial correcto. Gemini sigue disponible en «Fichas de Obsidian».</p>';return;}
 $('#panel').innerHTML=`<p class="eyebrow">LEVANTAMIENTO FOTOGRÁFICO · 07 OCT 2026</p><h2>${state.pump?esc(state.pump.tag):'Frente de la escalera'}</h2><p class="notice">Cinco posiciones numeradas de izquierda a derecha en esta foto. No son TAG oficiales. Distribución y proporciones aproximadas; esta vista no representa todas las bombas del sector.</p><a href="${photoURL('111845')}" target="_blank" rel="noopener"><img class="photo-overview" src="${photoURL('111845')}" alt="Vista de los cinco conjuntos frente al muro y la escalera derecha"></a><p class="muted">Referencia compartida del frente. Ubicación exacta, fabricante por posición y conexiones por confirmar.</p><div class="block"><h3>Referencia de aspecto exterior</h3><img loading="lazy" src="${photoURL('110943')}" alt="Bombas azules con guardas naranjas y cubiertas rojizas"><p class="muted">Fotografía de referencia del sector; no atribuida a la posición seleccionada.</p></div>${state.part!==null?'<div class="notice">'+esc(parts[state.part].name)+': componente genérico ilustrativo. No se deducen medidas ni repuestos de este dibujo.</div>':''}<div class="block"><h3>Placas del sector · sin ubicar</h3>${evidence}</div>`;
}
$('#workspace-mode').onchange=async e=>{++state.loading;state.sector=e.target.value==='sector';state.pump=null;state.part=null;state.tab='ficha';state.view='plant';$('#search').value='';if(photoDetail)photoDetail.visible=false;if(plant){plant.visible=true;pumpGroup.visible=false;}$('#selected-tag').textContent='Seleccioná una bomba';$('#selected-name').textContent='';$('#source-status').textContent='Esperando selección';$('#parts').innerHTML='';$('#parts-title').textContent='Seleccioná un equipo';$('#part-count').textContent='';$('#back').click();await refresh();renderPanel();};
document.querySelector('.compass').textContent='EJE LOCAL ↑';
initScene();renderPanel();await refresh();''')
f.write_text(s,encoding='utf-8')
f=p/'index.html';s=f.read_text(encoding='utf-8');s=s.replace('<label class="search">','<label class="mode-label" for="workspace-mode">Vista de trabajo</label><select id="workspace-mode"><option value="sector">Sector fotografiado</option><option value="records">Fichas de Obsidian</option></select><label class="search">');s=s.replace('fichas de Obsidian<p>','equipos en esta vista<p>');f.write_text(s,encoding='utf-8')
with (p/'style.css').open('a',encoding='utf-8') as f:f.write('\n/* Evidencia fotográfica del sector */\n#panel img{display:block;width:100%;height:auto;border-radius:8px;margin:12px 0}.mode-label{display:block;font-size:11px;color:#9aaea4;margin-bottom:6px}#workspace-mode{margin-bottom:16px}.compass{font-size:10px;white-space:nowrap}#switch-detail{padding:12px 18px;border:1px solid #8fae90;border-radius:6px;cursor:pointer}\n')
print('Adaptación del sector aplicada.')
