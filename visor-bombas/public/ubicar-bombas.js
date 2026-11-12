import {CACHE,WIDTH,HEIGHT,clamp,initialState,validateState,assign,addPump,changes} from './ubicar-bombas-core.js';
const $=id=>document.getElementById(id),copy=v=>structuredClone(v);
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let D,base,state,history=[],sector='toda',zoom=1,selected=null,tag=null,adding=false,missing=false,ignoreClickUntil=0,movingId=null;
const error=e=>{$('error').textContent=e?.message||String(e);};
const status=t=>{$('estado').textContent=t;};
const active=()=>state.points.filter(p=>!p.removed),located=t=>active().find(p=>p.tag===t);
const sectorName=s=>D.SEC[s]||'Toda la planta';
const inside=(s,x,y)=>{const [x0,y0,w,h]=D.V[s]||D.V.toda;return x>=x0&&x<=x0+w&&y>=y0&&y<=y0+h;};
const destinationSector=(x,y,previous)=>sector!=='toda'&&inside(sector,x,y)?sector:previous&&inside(previous,x,y)?previous:'toda';
function clearModes(){selected=null;tag=null;adding=false;movingId=null;}
function save(){try{localStorage.setItem(CACHE,JSON.stringify({version:1,state}));$('error').textContent='';$('guardado').textContent='Posiciones guardadas en este navegador · '+new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit',second:'2-digit'});return true;}catch{$('guardado').textContent='Posiciones pendientes de guardar.';error('No se pudo guardar en este navegador. Descarga un respaldo antes de salir.');return false;}}
function commit(change){const before=copy(state);try{change();state=validateState(state,D);}catch(e){state=before;error(e);return false;}history.push(before);history=history.slice(-100);save();render();return true;}
function place(t,id){if(commit(()=>assign(state,id,t))){tag=null;selected=id;movingId=null;render();}}
function addPoint(x,y){
 const t=tag,previous=movingId||(t?located(t)?.id:null),id=previous||'nuevo:'+crypto.randomUUID();
 if(commit(()=>{
  if(previous){const p=state.points.find(p=>p.id===previous);Object.assign(p,{x:Math.round(clamp(x,WIDTH)),y:Math.round(clamp(y,HEIGHT)),sec:destinationSector(x,y,p.sec)});}
  else state.points.push({id,x:Math.round(clamp(x,WIDTH)),y:Math.round(clamp(y,HEIGHT)),sec:sector,num:'N'+(state.points.filter(p=>p.nuevo).length+1),n:'Punto nuevo',name:'',tag:null,nuevo:true});
  if(t)assign(state,id,t);
 })){adding=false;selected=id;tag=null;movingId=null;render();}
}
function coordinates(e){const r=$('plano').getBoundingClientRect(),[x,y,w,h]=D.V[sector];return {x:clamp(x+(e.clientX-r.left)/r.width*w,WIDTH),y:clamp(y+(e.clientY-r.top)/r.height*h,HEIGHT)};}
function selectPoint(p){if(movingId)addPoint(p.x,p.y);else if(tag)place(tag,p.id);else{selected=p.id;adding=false;render();}}
function focusPoint(p){
 selected=p.id;tag=null;adding=false;movingId=null;
 if(!inside(sector,p.x,p.y)){sector=inside(p.sec,p.x,p.y)?p.sec:'toda';zoom=1;}
 render();
 requestAnimationFrame(()=>{const b=[...$('plano').querySelectorAll('.lugar')].find(b=>b.dataset.point===p.id);b?.scrollIntoView({block:'nearest',inline:'nearest'});});
}
function removeSelected(){const id=selected;if(!id)return;if(commit(()=>{const p=state.points.find(p=>p.id===id);p.removed=true;})){selected=null;tag=null;movingId=null;render();status('Bomba eliminada del plano. Puedes deshacer o restaurarla.');}}
function persistEditor(){
 const p=active().find(p=>p.id===selected);if(!p)return true;
 if(!$('editor').reportValidity())return false;
 const name=$('ed-nombre').value.trim(),t=$('ed-tag').value||null,x=$('ed-x').valueAsNumber,y=$('ed-y').valueAsNumber;
 if(p.name===name&&p.tag===t&&p.x===x&&p.y===y)return true;
 return commit(()=>{assign(state,p.id,t);Object.assign(p,{name,x,y,sec:destinationSector(x,y,p.sec)});});
}
function drawMap(){
 const [x0,y0,w,h]=D.V[sector],pl=$('plano'),width=$('marco').clientWidth*zoom;
 pl.style.width=width+'px';pl.style.height=width*h/w+'px';
 const f=$('fondo');f.style.width=WIDTH/w*100+'%';f.style.left=-x0/w*100+'%';f.style.top=-y0/h*100+'%';
 pl.querySelectorAll('.lugar').forEach(e=>e.remove());
 for(const p of active()){
  if(p.x<x0||p.x>x0+w||p.y<y0||p.y>y0+h)continue;
  const b=document.createElement('button');b.type='button';b.dataset.point=p.id;
  const before=base.points.find(q=>q.id===p.id),changed=!before||['tag','name','x','y','removed'].some(k=>p[k]!==before[k]);
  b.className='lugar'+(!p.tag?' sin':'')+(changed?' cambio':'')+(p.nuevo?' nuevo':'')+(selected===p.id?' elegido':'');
  b.style.left=(p.x-x0)/w*100+'%';b.style.top=(p.y-y0)/h*100+'%';b.textContent=p.name||p.tag||'?';b.title=(p.tag||'Sin TAG')+' · '+(p.name||p.n||sectorName(p.sec));b.setAttribute('aria-label',b.title);
  let start=null,moved=false;
  b.onpointerdown=e=>{if(e.button!==0)return;e.stopPropagation();start={x:e.clientX,y:e.clientY};moved=false;b.setPointerCapture(e.pointerId);};
  b.onpointermove=e=>{if(!start)return;if(!moved&&Math.hypot(e.clientX-start.x,e.clientY-start.y)<8)return;moved=true;const q=coordinates(e);b.style.left=(q.x-x0)/w*100+'%';b.style.top=(q.y-y0)/h*100+'%';};
  b.onpointercancel=()=>{start=null;drawMap();};
  b.onpointerup=e=>{if(!start)return;start=null;ignoreClickUntil=Date.now()+400;if(moved){const q=coordinates(e);selected=p.id;movingId=null;tag=null;commit(()=>Object.assign(p,{x:Math.round(q.x),y:Math.round(q.y),sec:destinationSector(q.x,q.y,p.sec)}));}else selectPoint(p);};
  b.onclick=e=>e.stopPropagation();
  b.onkeydown=e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();selectPoint(p);return;}
   const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
   if(delta){e.preventDefault();const step=e.shiftKey?10:1;commit(()=>{p.x=clamp(p.x+delta[0]*step,WIDTH);p.y=clamp(p.y+delta[1]*step,HEIGHT);p.sec=destinationSector(p.x,p.y,p.sec);});[...pl.querySelectorAll('.lugar')].find(b=>b.dataset.point===p.id)?.focus();}
  };
  pl.append(b);
 }
}
function drawTags(){
 const q=normalize($('filtro-texto').value.trim()),area=$('filtro-area').value;
 const rows=state.catalog.filter(t=>(!area||t.area===area)&&normalize(t.tag+' '+t.nombre).includes(q)&&(!missing||!located(t.tag)));
 $('tags').replaceChildren(...rows.map(t=>{
  const p=located(t.tag),b=document.createElement('button');b.type='button';b.draggable=true;const chosen=tag===t.tag||p?.id===selected;b.className='tag'+(!p?' falta':'')+(chosen?' elegido':'');b.dataset.tag=t.tag;b.setAttribute('aria-pressed',String(chosen));
  const code=document.createElement('b');code.textContent=t.tag;const span=document.createElement('span');span.textContent=t.nombre;const em=document.createElement('em');em.textContent=p?`Colocada · X ${Math.round(p.x)}, Y ${Math.round(p.y)} · ${sectorName(p.sec)}`:'Sin posición: selecciona y toca el plano';span.append(em);b.append(code,span);
  b.ondragstart=e=>e.dataTransfer.setData('text/plain',t.tag);
  b.onclick=()=>{if(p)focusPoint(p);else{tag=t.tag;selected=null;movingId=null;adding=false;render();}};return b;
 }));
 if(!rows.length){const p=document.createElement('p');p.textContent='No hay bombas con estos filtros.';$('tags').append(p);}
}
function render(){
 $('sectores').replaceChildren(...['toda',...Object.keys(D.SEC)].map(s=>{const b=document.createElement('button');b.type='button';b.textContent=sectorName(s);b.setAttribute('aria-pressed',String(sector===s));b.onclick=()=>{sector=s;zoom=1;render();$('marco').scrollTo(0,0);};return b;}));
 const filter=$('filtro-area'),previous=filter.value;filter.replaceChildren(new Option('Todas las áreas',''),...[...new Set(state.catalog.map(t=>t.area))].map(a=>new Option(a,a)));filter.value=previous;
 drawMap();drawTags();
 const placed=state.catalog.filter(t=>located(t.tag)).length;
 $('resumen').textContent=`Catálogo: ${state.catalog.length} · Con lugar: ${placed} · Faltan: ${state.catalog.length-placed} · Puntos libres: ${active().filter(p=>!p.tag).length}`;
 status(movingId?'Toca la nueva posición de la bomba seleccionada.':adding?'Toca el plano para añadir un punto.':tag?'Ahora toca dónde va '+tag+'.':'Selecciona una bomba para ver, mover o eliminar su posición.');
 const p=active().find(p=>p.id===selected);$('editor').hidden=!p;
 if(p){$('editor-titulo').textContent=(p.tag||p.name||'Punto sin TAG')+' · '+sectorName(p.sec);$('posicion-elegida').textContent=`Posición registrada: X ${Math.round(p.x)}, Y ${Math.round(p.y)} px`;$('ed-x').value=Math.round(p.x);$('ed-y').value=Math.round(p.y);$('ed-nombre').value=p.name||'';$('ed-tag').replaceChildren(new Option('Sin TAG',''),...state.catalog.map(t=>new Option(t.tag+' · '+t.nombre,t.tag)));$('ed-tag').value=p.tag||'';}
 $('eliminar-bomba').disabled=!p;$('mover-bomba').disabled=!p;
 $('eliminar-bomba').textContent=p?.tag?'Eliminar '+p.tag:'Eliminar bomba';$('mover-bomba').textContent=p?.tag?'Mover '+p.tag:'Mover bomba';
 $('detalle').textContent=p?'Referencia: '+(p.n||p.id):'';
 $('lista').value=changes(state,base);$('deshacer').disabled=!history.length;$('agregar').setAttribute('aria-pressed',String(adding));
 $('restaurar').hidden=!state.points.some(p=>p.removed);$('restaurar').textContent='Restaurar puntos quitados';
 document.querySelectorAll('[data-zoom]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.zoom===zoom)));
}
async function init(){
 const fetchJson=async u=>{const r=await fetch(u);if(!r.ok)throw Error('No se pudo cargar '+u+'. Recarga la página.');return r.json();};
 [D,base]=await Promise.all([fetchJson('/modelos/plano-bombas.json'),fetchJson('/modelos/asignacion-bombas.json')]);base=validateState(initialState(D,base),D);state=copy(base);
 try{const saved=JSON.parse(localStorage.getItem(CACHE)||'null');if(saved){if(saved.version!==1)throw Error('Versión de respaldo desconocida.');state=validateState(saved.state,D);$('guardado').textContent='Posiciones guardadas recuperadas de este navegador.';}else $('guardado').textContent='Posiciones de la imagen cargadas. Los cambios se guardan automáticamente.';}catch(e){error('No se pudo abrir el borrador guardado; se conserva sin sobrescribir. '+e.message);}
 $('plano').onclick=e=>{if(Date.now()<ignoreClickUntil||e.target.closest('.lugar'))return;if(adding||tag||movingId){const q=coordinates(e);addPoint(q.x,q.y);}else{selected=null;render();}};
 $('plano').onkeydown=e=>{if(e.target!==$('plano')||e.key!=='Enter'||!adding&&!tag&&!movingId)return;e.preventDefault();const [x,y,w,h]=D.V[sector];addPoint(x+w/2,y+h/2);};
 $('plano').ondragover=e=>e.preventDefault();$('plano').ondrop=e=>{e.preventDefault();const t=e.dataTransfer.getData('text/plain');if(!state.catalog.some(v=>v.tag===t))return;movingId=null;tag=t;const q=coordinates(e);addPoint(q.x,q.y);};
 $('filtro-texto').oninput=drawTags;$('filtro-area').onchange=drawTags;
 $('solo-faltan').onclick=e=>{missing=!missing;e.currentTarget.setAttribute('aria-pressed',String(missing));drawTags();};
 document.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{zoom=+b.dataset.zoom;render();});
 $('agregar').onclick=()=>{adding=!adding;tag=null;selected=null;movingId=null;render();if(adding)$('plano').focus();};
 $('editor').onsubmit=e=>{e.preventDefault();persistEditor();};
 $('ed-quitar').onclick=removeSelected;$('eliminar-bomba').onclick=removeSelected;
 $('mover-bomba').onclick=()=>{movingId=selected;tag=null;adding=false;render();$('plano').focus();};
 $('guardar-posiciones').onclick=()=>{if(persistEditor())save();};
 $('anadir-bomba').onclick=()=>{const show=$('alta-bomba').hidden;$('alta-bomba').hidden=!show;$('anadir-bomba').setAttribute('aria-expanded',String(show));if(show){$('nuevo-tag').value='B'+(Math.max(...state.catalog.map(t=>Number(t.tag.slice(1))))+1);$('nuevo-area').value=sectorName(sector);$('alta-bomba').scrollIntoView({block:'nearest'});$('nuevo-nombre').focus();}};
 $('cancelar-alta').onclick=()=>{$('alta-bomba').hidden=true;$('anadir-bomba').setAttribute('aria-expanded','false');};
 $('nueva-bomba').onsubmit=e=>{e.preventDefault();let t;if(commit(()=>{t=addPump(state,{tag:$('nuevo-tag').value,nombre:$('nuevo-nombre').value,area:$('nuevo-area').value});})){tag=t;selected=null;adding=false;movingId=null;e.target.reset();$('alta-bomba').hidden=true;$('anadir-bomba').setAttribute('aria-expanded','false');render();$('plano').focus();}};
 $('deshacer').onclick=()=>{if(!history.length)return;state=history.pop();selected=null;tag=null;adding=false;movingId=null;save();render();};
 $('restaurar').onclick=()=>{clearModes();commit(()=>{const used=new Set(active().map(p=>p.tag).filter(Boolean));for(const p of state.points.filter(p=>p.removed)){if(p.tag&&used.has(p.tag))p.tag=null;if(p.tag)used.add(p.tag);p.removed=false;}});};
 $('borrar-todas').onclick=()=>{if(confirm('¿Dejar todas las bombas sin posición? Puedes deshacerlo.')){clearModes();commit(()=>{for(const p of state.points)p.tag=null;});}};
 $('reiniciar').textContent='Restaurar mapa de referencia';$('reiniciar').onclick=()=>{if(confirm('¿Restaurar el mapa y catálogo de referencia? Puedes deshacerlo.')){clearModes();commit(()=>{state=copy(base);});}};
 $('copiar').onclick=async()=>{if(!persistEditor())return;try{await navigator.clipboard.writeText($('lista').value);status('Lista copiada. Pégala en el chat para aplicar la distribución.');}catch{$('lista').focus();$('lista').select();status('Copia la lista seleccionada.');}};
 $('descargar').onclick=()=>{if(!persistEditor())return;const blob=new Blob([JSON.stringify({version:1,state},null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='vocatus-ubicaciones-bombas.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 $('importar').onclick=()=>$('archivo').click();$('archivo').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>2_000_000)throw Error('El respaldo supera 2 MB.');const raw=JSON.parse(await file.text());if(raw.version!==1)throw Error('Versión de respaldo desconocida.');const next=validateState(raw.state,D);if(confirm('¿Cargar este respaldo en lugar del borrador actual? Puedes deshacerlo.')){clearModes();commit(()=>{state=next;});}}catch(e){error(e);}finally{$('archivo').value='';}};
 addEventListener('keydown',e=>{if(e.key==='Escape'){selected=null;tag=null;adding=false;movingId=null;render();}});addEventListener('resize',drawMap);
 render();
}
init().catch(e=>{error(e);status('No se cargó el plano.');});
