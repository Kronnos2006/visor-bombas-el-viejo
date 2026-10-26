// Presentación del expediente. No escribe fichas ni intervenciones.
export function createInspectorUI({getSelection,onPart}){
 const inspector=document.querySelector('.inspector'),panel=document.getElementById('panel');
 const mobile=matchMedia('(max-width:900px)');let lastSelection='',sheet='closed';
 const bar=document.createElement('div');bar.className='sheet-bar';bar.innerHTML='<button type="button" data-sheet="open">Ver la ficha</button><button type="button" data-sheet="folded">Ver el 3D</button><button type="button" data-sheet="closed" aria-label="Cerrar ficha">✕</button>';
 inspector.prepend(bar);
 const reopen=document.createElement('button');reopen.type='button';reopen.className='sheet-reopen';reopen.textContent='Ver la ficha';reopen.hidden=true;document.body.append(reopen);
 const setSheet=value=>{sheet=value;inspector.dataset.sheet=value;inspector.inert=mobile.matches&&value==='closed';reopen.hidden=!(mobile.matches&&value==='closed'&&getSelection());bar.querySelector('[data-sheet="open"]').setAttribute('aria-expanded',String(value==='open'));window.dispatchEvent(new Event('resize'));};
 bar.querySelectorAll('[data-sheet]').forEach(b=>b.onclick=()=>setSheet(b.dataset.sheet));reopen.onclick=()=>setSheet('open');
 mobile.addEventListener('change',()=>setSheet(sheet));
 function enhance(){
  const selection=getSelection(),key=selection?.tag||selection?.pending?.nombre||'';
  if(key!==lastSelection){lastSelection=key;setSheet(key?'folded':'closed');}
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
   details.open=saved===null||saved===undefined?/Resumen de la bomba|Datos registrados|Información del fabricante/.test(title):saved==='open';
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
 setSheet('closed');return {enhance,show,close:()=>setSheet('closed')};
}
