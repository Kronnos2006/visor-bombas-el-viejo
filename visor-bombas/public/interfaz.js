// Presentación del expediente. No escribe fichas ni intervenciones.
export function createInspectorUI({getSelection,onPart,onSummary}){
 const inspector=document.querySelector('.inspector'),panel=document.getElementById('panel');
 const mobile=matchMedia('(max-width:900px)');let lastSelection='',sheet='closed';
 const bar=document.createElement('div');bar.className='sheet-bar';bar.innerHTML='<button type="button" data-sheet="open">Resumen</button><button type="button" data-sheet="folded">Ver el 3D</button><button type="button" data-sheet="closed" aria-label="Volver a la lista de bombas">Lista</button>';
 inspector.prepend(bar);
 const preview=document.createElement('div');preview.className='sheet-preview';bar.after(preview);
 const reopen=document.createElement('button');reopen.type='button';reopen.className='sheet-reopen';reopen.textContent='Resumen';reopen.hidden=true;document.body.append(reopen);
 const fichaTab=document.querySelector('#tabs [data-tab=ficha]'),originalTab=fichaTab.innerHTML;
 const setSheet=value=>{sheet=value;inspector.dataset.sheet=value;document.body.classList.toggle('sheet-open',mobile.matches&&value==='open');document.body.classList.toggle('sheet-preview-open',mobile.matches&&value==='folded');inspector.inert=mobile.matches&&value==='closed';reopen.hidden=!(mobile.matches&&value==='closed'&&getSelection());bar.querySelector('[data-sheet="open"]').setAttribute('aria-expanded',String(value==='open'));window.dispatchEvent(new Event('resize'));};
 function openSummary(){
  onSummary?.();setSheet('open');
  const summary=panel.querySelector('#pump-resumen')||panel.querySelector('.block:not(.edit-equipment)');
  summary?.querySelectorAll('details.exp-section').forEach(el=>el.open=true);
  panel.scrollTo({top:0,behavior:'auto'});
 }
 bar.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>b.dataset.sheet==='open'?openSummary():setSheet(b.dataset.sheet));reopen.onclick=openSummary;
 function adapt(){fichaTab.innerHTML=mobile.matches?'<b aria-hidden="true">📄</b>Resumen':originalTab;document.querySelectorAll('.secondary-menu').forEach(menu=>menu.open=!mobile.matches);setSheet(sheet);}
 mobile.addEventListener('change',adapt);
 fichaTab.addEventListener('click',()=>{if(mobile.matches)openSummary();});
 function enhance(){
  const selection=getSelection(),key=selection?.tag||selection?.pending?.nombre||'';
  const changed=key!==lastSelection;
  if(changed){lastSelection=key;setSheet(key?(mobile.matches?'open':'folded'):'closed');panel.scrollTop=0;}
  const tag=selection?.tag||'equipo';
  bar.querySelector('[data-sheet=open]').textContent='Resumen · '+tag;reopen.textContent='Resumen · '+tag;
  preview.replaceChildren();
  const data=selection?.data||{};
  for(const [label,value] of [['Servicio',data.servicio||data.fluido],['Caudal',(data.specs||[]).find(([name])=>name==='Caudal')?.[1]||(data.caudal_m3h!=null?data.caudal_m3h+' m³/h':'')],['Ubicación',data.nombre||data.ubicacion]]){
   const item=document.createElement('span');const title=document.createElement('b');title.textContent=label+': ';item.append(title,document.createTextNode(String(value||'Por confirmar')));preview.append(item);
  }
  const candidates=[...panel.querySelectorAll('.block,.rs-card')].reverse();
  observer.disconnect();
  for(const block of candidates){
   if(block.dataset.collapsible)continue;
   const heading=[...block.children].find(n=>/^H[34]$/.test(n.tagName));if(!heading)continue;
   block.dataset.collapsible='true';
   const title=heading.textContent.trim(),storageKey='vocatus-seccion:'+key+':'+title;
   const details=document.createElement('details');details.className='exp-section';
   const summary=document.createElement('summary');summary.append(heading);details.append(summary);
   const body=document.createElement('div');body.className='exp-section-body';
   while(block.firstChild)body.append(block.firstChild);details.append(body);block.append(details);
   let saved;try{saved=sessionStorage.getItem(storageKey);}catch{}
   details.open=mobile.matches&&/Resumen de la bomba|Componentes críticos/.test(title)?true:saved===null||saved===undefined?/Resumen de la bomba|Datos registrados|Información del fabricante|Sello|Sellado|O-rings/.test(title):saved==='open';
   details.ontoggle=()=>{try{sessionStorage.setItem(storageKey,details.open?'open':'closed');}catch{}};
   if(block.classList.contains('interactive-part-block')){
    block.onclick=null;
    const button=document.createElement('button');button.type='button';button.textContent='Ver en 3D';button.className='section-part';button.onclick=e=>{e.preventDefault();e.stopPropagation();onPart(Number(block.dataset.part));};summary.append(button);
   }
  }
  observer.observe(panel,{childList:true,subtree:true});
 }
 const observer=new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('.block,.rs-card')||n.querySelector?.('.block,.rs-card')))))enhance();});
 observer.observe(panel,{childList:true,subtree:true});
 const show=element=>{setSheet('open');if(element){const own=element.querySelector(':scope > details');if(own)own.open=true;let n=element;while(n&&n!==panel){if(n.tagName==='DETAILS')n.open=true;n=n.parentElement;}element.scrollIntoView({block:'nearest',behavior:'auto'});element.querySelector('input,button,textarea')?.focus({preventScroll:true});}};
 adapt();return {enhance,show,openSummary,close:()=>setSheet('closed')};
}
