// Firma ilustrativa de Vocatus: no representa niveles ni equipos medidos en planta.
const clamp=x=>Math.max(0,Math.min(1,x));
const phase=(t,start,duration)=>clamp((t-start)/duration);
export function secuenciaCabecera(t,count){
 const end=.85+count*.4;
 return {deposit:phase(t,0,.75),letters:Array.from({length:count},(_,i)=>({feed:phase(t,.85+i*.4,.12),fill:phase(t,.97+i*.4,.28)})),
  middle:phase(t,end,.25),pump:phase(t,end+.25,.35),outlet:phase(t,end+.6,.65),plant:phase(t,end+1.25,1),end:end+2.25};
}
const wave=(x,y,width,amplitude,time)=>{let d=`M${x} ${y}`;for(let i=0;i<=20;i++){const u=i/20;d+=`L${x+u*width} ${y+Math.sin(u*12-time*2)*amplitude+Math.sin(u*23+time*1.5)*amplitude*.25}`;}return d+`V96H${x}Z`;};
const plantShapes='<path d="M1 62L73 69L99 58L26 51Z"/><path d="M8 53V29L27 23L46 29V58Z"/><path d="M51 60V25Q60 17 69 25V62Z"/><path d="M73 58V7H85V60Z"/><path d="M87 57V34Q93 28 99 34V58Z"/>';
const plantLines='<path d="M1 62L73 69L99 58L26 51ZM8 53V29L27 23L46 29V58M8 29L27 35L46 29M27 35V56M8 42L27 48L46 42M15 31V54M38 32V56M51 60V25Q60 17 69 25V62M51 25Q60 32 69 25M51 46Q60 53 69 46M73 58V7H85V60M71 7H87M73 19H85M73 31H85M73 43H85M87 57V34Q93 28 99 34V58M87 34Q93 39 99 34"/>';
export function crearFlujoCabecera(header,{onPause}={}){
 const button=document.createElement('button');button.type='button';button.id='cab-flujo';button.setAttribute('aria-pressed','false');
 button.innerHTML='<svg preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"></svg><span class="cab-pausa" aria-hidden="true">Ⅱ</span>';header.append(button);
 const svg=button.querySelector('svg'),brand=header.querySelector('.brand'),motion=matchMedia('(prefers-reduced-motion:reduce)');
 const depot=document.createElementNS('http://www.w3.org/2000/svg','svg');depot.classList.add('cab-deposito');depot.setAttribute('viewBox','0 0 72 80');depot.setAttribute('preserveAspectRatio','none');depot.setAttribute('aria-hidden','true');
 depot.innerHTML=`<defs><linearGradient id="cab-depot-ron" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1c675"/><stop offset=".4" stop-color="#bc741e"/><stop offset="1" stop-color="#4b2108"/></linearGradient><linearGradient id="cab-depot-glass"><stop stop-color="#d5eee5" stop-opacity=".35"/><stop offset=".45" stop-color="#b5c8be" stop-opacity=".03"/><stop offset="1" stop-color="#e7e6cc" stop-opacity=".18"/></linearGradient><clipPath id="cab-vat"><circle cx="36" cy="42" r="28"/></clipPath></defs>
  <path class="cab-vat-inlet" d="M36 0V14"/><circle class="cab-vat-body" cx="36" cy="42" r="30"/>
  <g clip-path="url(#cab-vat)"><path class="cab-vat-liquid"/><path class="cab-vat-surface"/></g>
  <circle class="cab-vat-rim" cx="36" cy="42" r="31"/><circle class="cab-vat-rim cab-vat-inner" cx="36" cy="42" r="27.5"/>
  <path class="cab-vat-glint" d="M18 24Q12 35 14 48M57 30Q61 42 57 51"/>
  <path class="cab-vat-outlet" d="M56 64H80"/><path class="cab-vat-stream" d="M56 64H80"/>
  <path class="cab-vat-foot" d="M19 69L16 77H56L53 69"/><g class="cab-vat-scale"><path d="M58 32H62M60 40H64M59 48H63M56 56H60"/></g>`;
 brand?.prepend(depot);brand?.classList.add('con-deposito');
 const vatLiquid=depot.querySelector('.cab-vat-liquid'),vatSurface=depot.querySelector('.cab-vat-surface'),vatInlet=depot.querySelector('.cab-vat-inlet'),vatStream=depot.querySelector('.cab-vat-stream');
 let section='Áreas',elapsed=0,last=0,frame=0,paused=false,parts=null,geometry=null,generation=0;
 const label=()=>{const text=paused?'Reanudar animación de cabecera':'Pausar animación de cabecera';button.title=text;button.setAttribute('aria-label',text);};label();
 function layout(){
  const width=Math.max(120,button.clientWidth),compact=width<420,plantWidth=width<220?26:compact?40:96,r=width<220?9:compact?12:21,x=compact?3:9,spacing=compact?.35:.7;
  let fontSize=compact?23:34;const chars=Array.from(section);
  svg.setAttribute('viewBox',`0 0 ${width} 90`);svg.innerHTML=`<text font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text>`;
  const measure=svg.querySelector('text');measure.textContent=section;
  const maxText=width-x-plantWidth-r*2-(compact?23:95);
  fontSize=Math.min(fontSize,fontSize*Math.max(1,maxText-spacing*(chars.length-1))/Math.max(1,measure.getComputedTextLength()));measure.setAttribute('font-size',fontSize);
  const glyphs=chars.map((char,i)=>{const left=x+(i?measure.getSubStringLength(0,i):0)+i*spacing,advance=measure.getSubStringLength(i,1);return {char,x:left,width:advance,center:left+advance/2};});
  const end=glyphs.at(-1).x+glyphs.at(-1).width,pumpX=end+(compact?18:63),plantX=width-plantWidth-2,plantY=compact?79-plantWidth*.69:10,plantScale=plantWidth/100;
  const text=(g,cls)=>`<text class="${cls}" x="${g.x}" y="44" font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text>`;
  const feeds=glyphs.map((g,i)=>i?`M${glyphs[i-1].center} 70H${g.center}V59`:`M-14 70H${g.center}V59`);
  const middle=`M${glyphs.at(-1).center} 70H${pumpX-r-7}Q${pumpX-r-2} 70 ${pumpX-r-2} 64V49H${pumpX-r}`;
  const plantEntry=plantY+plantScale*50;
  const outlet=`M${pumpX+5} ${49-r}V15Q${pumpX+5} 9 ${pumpX+11} 9H${Math.max(pumpX+12,plantX-12)}Q${plantX-6} 9 ${plantX-6} 17V${plantEntry-6}Q${plantX-6} ${plantEntry} ${plantX} ${plantEntry}H${plantX+plantWidth*.58}`;
  const pipe=(d,id)=>`<g class="cab-tramo"><path class="cab-vidrio" d="${d}"/><path class="cab-interior" d="${d}"/><path class="cab-liquido" data-reveal="${id}" pathLength="1" stroke-dasharray="1" d="${d}"/><path class="cab-reflejo" data-flow="${id}" d="${d}"/></g>`;
  svg.innerHTML=`<defs><linearGradient id="cab-ron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0"/><stop offset=".25" stop-color="#efb64e"/><stop offset=".7" stop-color="#a95713"/><stop offset="1" stop-color="#d68a27"/></linearGradient><linearGradient id="cab-cristal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f9e9bc" stop-opacity=".65"/><stop offset=".45" stop-color="#bc9459" stop-opacity=".15"/><stop offset="1" stop-color="#f6cc7b" stop-opacity=".45"/></linearGradient>
   ${glyphs.map((g,i)=>`<clipPath id="cab-letter-${i}">${text(g,'')}</clipPath>`).join('')}<clipPath id="cab-edificios">${plantShapes}</clipPath><clipPath id="cab-camara"><circle cx="${pumpX}" cy="49" r="${r-2}"/></clipPath></defs>
   ${glyphs.map((g,i)=>`<g data-letter="${i}" data-fill="0">${text(g,'cab-letra-seca')}<g clip-path="url(#cab-letter-${i})"><path class="cab-nivel" data-letter-wave="${i}"/><path class="cab-superficie" data-letter-crest="${i}"/></g>${text(g,'cab-letra-borde')}</g>`).join('')}
   ${feeds.map((d,i)=>pipe(d,'feed-'+i)).join('')}${pipe(middle,'middle')}${pipe(outlet,'outlet')}
   <g class="cab-bomba"><path class="cab-pie" d="M${pumpX-r-5} ${52+r}H${pumpX+r+5}M${pumpX-r+4} ${49+r}V${52+r}M${pumpX+r-4} ${49+r}V${52+r}"/><circle class="cab-caracol" cx="${pumpX}" cy="49" r="${r}"/><g clip-path="url(#cab-camara)"><path class="cab-nivel" data-wave="pump"/></g><circle class="cab-aro" cx="${pumpX}" cy="49" r="${r-4}"/><g class="cab-impulsor"><path d="M0 0L0 -${r*.65}Q${r*.7} -${r*.6} ${r*.48} -${r*.2}ZM0 0L${r*.65} 0Q${r*.6} ${r*.7} ${r*.2} ${r*.48}ZM0 0L0 ${r*.65}Q-${r*.7} ${r*.6} -${r*.48} ${r*.2}ZM0 0L-${r*.65} 0Q-${r*.6} -${r*.7} -${r*.2} -${r*.48}Z"/><circle r="${r*.13}"/></g></g>
   <g class="cab-planta" transform="translate(${plantX} ${plantY}) scale(${plantScale})"><g class="cab-edificio-seco">${plantShapes}</g><g clip-path="url(#cab-edificios)"><path class="cab-nivel" data-wave="plant"/><path class="cab-superficie" data-crest="plant"/></g><g class="cab-edificio-linea">${plantLines}</g></g>`;
  svg.querySelectorAll('clipPath[id^=cab-letter-]').forEach((el,i)=>el.querySelector('text').textContent=glyphs[i].char);
  svg.querySelectorAll('[data-letter]').forEach((el,i)=>el.querySelectorAll('text').forEach(text=>text.textContent=glyphs[i].char));
  parts={letters:[...svg.querySelectorAll('[data-letter]')].map((el,i)=>({el,wave:el.querySelector('[data-letter-wave]'),crest:el.querySelector('[data-letter-crest]'),...glyphs[i]})),reveal:[...svg.querySelectorAll('[data-reveal]')],flows:[...svg.querySelectorAll('[data-flow]')],plant:svg.querySelector('[data-wave=plant]'),plantCrest:svg.querySelector('[data-crest=plant]'),pump:svg.querySelector('[data-wave=pump]'),impeller:svg.querySelector('.cab-impulsor')};
  geometry={width,compact,fontSize,pumpX,r,count:glyphs.length};render(motion.matches?secuenciaCabecera(0,glyphs.length).end:elapsed);
 }
 function render(t){if(!parts)return;const g=geometry,p=secuenciaCabecera(t,g.count);
  const depositLevel=p.deposit*(.76-phase(t,.85,g.count*.4)*.16),depotWave=wave(6,72-depositLevel*59,60,1.1,t);
  vatLiquid.setAttribute('d',depotWave);vatSurface.setAttribute('d',depotWave);vatInlet.style.opacity=t<.8?'.8':'.25';vatStream.style.opacity=p.deposit===1?'.9':'0';vatStream.setAttribute('stroke-dashoffset',-t*28);depot.dataset.level=depositLevel.toFixed(3);
  const progress=id=>id.startsWith('feed-')?p.letters[Number(id.slice(5))].feed:p[id];
  parts.reveal.forEach(el=>el.setAttribute('stroke-dashoffset',1-progress(el.dataset.reveal)));
  parts.flows.forEach(el=>{el.style.opacity=progress(el.dataset.flow)===1?'.65':'0';el.setAttribute('stroke-dashoffset',-t*33);});
  parts.letters.forEach((part,i)=>{const f=p.letters[i].fill,y=52-f*(g.fontSize+12),d=wave(part.x-1,y,part.width+2,.7,t);part.wave.setAttribute('d',d);part.crest.setAttribute('d',d);part.wave.style.opacity=f>0?'1':'0';part.crest.style.opacity=f>0&&f<1?'.9':'0';part.el.dataset.fill=f.toFixed(3);});
  const plantWave=wave(-2,74-p.plant*77,105,1.2,t);parts.plant.setAttribute('d',plantWave);parts.plantCrest.setAttribute('d',plantWave);
  parts.pump.setAttribute('d',wave(g.pumpX-g.r,51+g.r-p.pump*(g.r*2+4),g.r*2,.8,t));
  parts.impeller.setAttribute('transform',`translate(${g.pumpX} 49) rotate(${Math.max(0,t-(.85+g.count*.4))*180})`);
  button.dataset.phase=t<.85?'deposito':p.letters.at(-1).fill<1?'letras':p.outlet<1?'bomba':p.plant<1?'planta':'lleno';button.dataset.fill=p.plant.toFixed(3);
 }
 function tick(now){frame=0;if(paused||motion.matches||document.hidden){last=0;return;}if(last&&now-last<30){frame=requestAnimationFrame(tick);return;}if(last)elapsed+=Math.min(.15,(now-last)/1000);last=now;render(elapsed);frame=requestAnimationFrame(tick);}
 const play=()=>{if(!frame&&!paused&&!motion.matches&&!document.hidden)frame=requestAnimationFrame(tick);};
 function restart(name){section=name||section;elapsed=0;last=0;generation++;button.dataset.sequence=String(generation);layout();if(paused){elapsed=secuenciaCabecera(0,geometry.count).end;render(elapsed);}play();}
 function setPaused(value){paused=Boolean(value);button.setAttribute('aria-pressed',String(paused));label();last=0;play();}
 button.onclick=()=>{setPaused(!paused);onPause?.(paused);};
 new ResizeObserver(()=>layout()).observe(button);motion.addEventListener('change',()=>{last=0;if(motion.matches)render(secuenciaCabecera(0,geometry?.count||5).end);else play();});document.addEventListener('visibilitychange',()=>{last=0;play();});document.fonts?.ready.then(()=>layout());
 const portada=document.getElementById('portada');if(portada)new MutationObserver(()=>{if(portada.hidden)restart(section);}).observe(portada,{attributes:true,attributeFilter:['hidden']});
 return {setSection:restart,setPaused,button};
}
