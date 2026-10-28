// Circuito ilustrativo de marca. No representa niveles ni estado real de la planta.
export function crearFlujoCabecera(header,{onPause}={}) {
 const button=document.createElement('button');button.type='button';button.id='cab-flujo';button.setAttribute('aria-pressed','false');
 button.innerHTML='<svg preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"></svg><span class="cab-pausa" aria-hidden="true">Ⅱ</span>';
 header.append(button);const svg=button.querySelector('svg'),motion=matchMedia('(prefers-reduced-motion:reduce)');
 let section='Áreas',elapsed=0,last=0,frame=0,paused=false,parts=null,geometry=null,generation=0;
 const clamp=x=>Math.max(0,Math.min(1,x)),phase=(t,start,duration)=>clamp((t-start)/duration);
 const label=()=>{const text=paused?'Reanudar animación de cabecera':'Pausar animación de cabecera';button.title=text;button.setAttribute('aria-label',text);};label();
 const plantShapes='<path d="M1 62L73 69L99 58L26 51Z"/><path d="M8 53V29L27 23L46 29V58Z"/><path d="M51 60V25Q60 17 69 25V62Z"/><path d="M73 58V7H85V60Z"/><path d="M87 57V34Q93 28 99 34V58Z"/>';
 const plantLines='<path d="M1 62L73 69L99 58L26 51ZM8 53V29L27 23L46 29V58M8 29L27 35L46 29M27 35V56M8 42L27 48L46 42M15 31V54M38 32V56M51 60V25Q60 17 69 25V62M51 25Q60 32 69 25M51 46Q60 53 69 46M73 58V7H85V60M71 7H87M73 19H85M73 31H85M73 43H85M87 57V34Q93 28 99 34V58M87 34Q93 39 99 34"/>';
 const wave=(x,y,width,amplitude,time)=>{let d=`M${x} ${y}`;for(let i=0;i<=24;i++){const u=i/24;d+=`L${x+u*width} ${y+Math.sin(u*13-time*2.3)*amplitude+Math.sin(u*25+time*1.4)*amplitude*.3}`;}return d+`V85H${x}Z`;};
 function layout(){
  const width=Math.max(120,button.clientWidth),compact=width<420,plantWidth=width<230?34:compact?52:96,r=compact?11:21,x=compact?5:12;
  let fontSize=compact?23:34;
  svg.setAttribute('viewBox',`0 0 ${width} 76`);
  svg.innerHTML=`<text id="cab-measure" x="${x}" y="49" font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text>`;
  const measure=svg.querySelector('text');measure.textContent=section;
  const maxText=width-x-plantWidth-r*2-(compact?29:90);
  const natural=measure.getComputedTextLength();fontSize=Math.min(fontSize,fontSize*Math.max(1,maxText)/Math.max(1,natural));measure.setAttribute('font-size',fontSize);
  const textWidth=measure.getComputedTextLength(),end=x+textWidth,pumpX=end+(compact?21:65),plantX=width-plantWidth-3,plantY=compact?63-plantWidth*.69:4,plantScale=plantWidth/100;
  const inlet=`M-16 48H${x-3}Q${x+2} 48 ${x+2} 42V12Q${x+2} 7 ${x+7} 7H${x+12}V${24}`;
  const middle=`M${end+2} 50H${pumpX-r-9}Q${pumpX-r-3} 50 ${pumpX-r-3} 44V38H${pumpX-r}`;
  const plantEntry=plantY+plantScale*50;
  const outlet=`M${pumpX+5} ${38-r}V12Q${pumpX+5} 6 ${pumpX+11} 6H${Math.max(pumpX+12,plantX-15)}Q${plantX-8} 6 ${plantX-8} 14V${plantEntry-6}Q${plantX-8} ${plantEntry} ${plantX-2} ${plantEntry}H${plantX+plantWidth*.58}`;
  geometry={width,compact,x,textWidth,fontSize,plantX,plantY,plantScale,pumpX,r};
  const pipe=(d,id)=>`<g><path class="cab-vidrio" d="${d}"/><path class="cab-interior" d="${d}"/><path class="cab-liquido" data-reveal="${id}" pathLength="1" stroke-dasharray="1" d="${d}"/><path class="cab-reflejo" data-flow="${id}" d="${d}"/></g>`;
  svg.innerHTML=`<defs>
   <linearGradient id="cab-ron" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3a0"/><stop offset=".25" stop-color="#efb64e"/><stop offset=".7" stop-color="#a95713"/><stop offset="1" stop-color="#d68a27"/></linearGradient>
   <linearGradient id="cab-cristal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f9e9bc" stop-opacity=".65"/><stop offset=".45" stop-color="#bc9459" stop-opacity=".15"/><stop offset="1" stop-color="#f6cc7b" stop-opacity=".45"/></linearGradient>
   <clipPath id="cab-letras"><text x="${x}" y="49" font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text></clipPath>
   <clipPath id="cab-edificios">${plantShapes}</clipPath><clipPath id="cab-camara"><circle cx="${pumpX}" cy="38" r="${r-2}"/></clipPath>
  </defs>
  ${pipe(inlet,'inlet')}<path class="cab-chorro"/>
  <g class="cab-letras"><text class="cab-letra-seca" x="${x}" y="49" font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text><g clip-path="url(#cab-letras)"><path class="cab-nivel" data-wave="text"/><path class="cab-superficie" data-crest="text"/></g><text class="cab-letra-borde" x="${x}" y="49" font-size="${fontSize}" font-family="Fraunces,Georgia,serif" font-weight="600"></text></g>
  ${pipe(middle,'middle')}${pipe(outlet,'outlet')}
  <g class="cab-bomba"><path class="cab-pie" d="M${pumpX-r-5} ${41+r}H${pumpX+r+5}M${pumpX-r+4} ${38+r}V${41+r}M${pumpX+r-4} ${38+r}V${41+r}"/><circle class="cab-caracol" cx="${pumpX}" cy="38" r="${r}"/><g clip-path="url(#cab-camara)"><path class="cab-nivel" data-wave="pump"/></g><circle class="cab-aro" cx="${pumpX}" cy="38" r="${r-4}"/><g class="cab-impulsor"><path d="M0 0L0 -${r*.65}Q${r*.7} -${r*.6} ${r*.48} -${r*.2}ZM0 0L${r*.65} 0Q${r*.6} ${r*.7} ${r*.2} ${r*.48}ZM0 0L0 ${r*.65}Q-${r*.7} ${r*.6} -${r*.48} ${r*.2}ZM0 0L-${r*.65} 0Q-${r*.6} -${r*.7} -${r*.2} -${r*.48}Z"/><circle r="${r*.13}"/></g></g>
  <g class="cab-planta" transform="translate(${plantX} ${plantY}) scale(${plantScale})"><g class="cab-edificio-seco">${plantShapes}</g><g clip-path="url(#cab-edificios)"><path class="cab-nivel" data-wave="plant"/><path class="cab-superficie" data-crest="plant"/></g><g class="cab-edificio-linea">${plantLines}</g></g>`;
  svg.querySelectorAll('text').forEach(el=>el.textContent=section);
  parts={jet:svg.querySelector('.cab-chorro'),reveal:[...svg.querySelectorAll('[data-reveal]')],flows:[...svg.querySelectorAll('[data-flow]')],text:svg.querySelector('[data-wave=text]'),textCrest:svg.querySelector('[data-crest=text]'),plant:svg.querySelector('[data-wave=plant]'),plantCrest:svg.querySelector('[data-crest=plant]'),pump:svg.querySelector('[data-wave=pump]'),impeller:svg.querySelector('.cab-impulsor')};
  render(motion.matches?6:elapsed);
 }
 function render(t){if(!parts)return;const g=geometry,p={inlet:phase(t,0,.45),text:phase(t,.3,1.45),middle:phase(t,1.25,.4),pump:phase(t,1.45,.6),outlet:phase(t,1.8,.8),plant:phase(t,2.4,1.45)};
  parts.reveal.forEach(el=>el.setAttribute('stroke-dashoffset',1-p[el.dataset.reveal]));
  parts.flows.forEach(el=>{el.style.opacity=p[el.dataset.flow]===1?'.75':'0';el.setAttribute('stroke-dashoffset',-t*36);});
  const textLevel=56-p.text*(g.fontSize+12),textWave=wave(g.x-1,textLevel,g.textWidth+3,1.3,t);
  parts.jet.setAttribute('d',`M${g.x+12} 24V${Math.max(24,textLevel)}`);parts.jet.style.opacity=p.inlet===1&&p.text<1?'.85':'0';
  parts.text.setAttribute('d',textWave);parts.textCrest.setAttribute('d',textWave);parts.text.style.opacity=p.text>0?'1':'0';parts.textCrest.style.opacity=p.text>0&&p.text<1?'.9':'0';
  const plantWave=wave(-2,74-p.plant*77,105,1.6,t);parts.plant.setAttribute('d',plantWave);parts.plantCrest.setAttribute('d',plantWave);
  parts.pump.setAttribute('d',wave(g.pumpX-g.r,40+g.r-p.pump*(g.r*2+4),g.r*2,1,t));
  parts.impeller.setAttribute('transform',`translate(${g.pumpX} 38) rotate(${Math.max(0,t-1.3)*180})`);
  button.dataset.phase=t<.3?'logo':t<1.75?'letras':t<2.4?'bomba':t<3.85?'planta':'lleno';button.dataset.fill=p.plant.toFixed(3);
 }
 function tick(now){frame=0;if(paused||motion.matches||document.hidden){last=0;return;}if(last)elapsed+=Math.min(.1,(now-last)/1000);last=now;render(elapsed);frame=requestAnimationFrame(tick);}
 const play=()=>{if(!frame&&!paused&&!motion.matches&&!document.hidden)frame=requestAnimationFrame(tick);};
 function restart(name){section=name||section;elapsed=0;last=0;generation++;button.dataset.sequence=String(generation);layout();play();}
 function setPaused(value){paused=Boolean(value);button.setAttribute('aria-pressed',String(paused));label();last=0;play();}
 button.onclick=()=>{setPaused(!paused);onPause?.(paused);};
 new ResizeObserver(()=>layout()).observe(button);
 motion.addEventListener('change',()=>{last=0;if(motion.matches)render(6);else play();});document.addEventListener('visibilitychange',()=>{last=0;play();});
 document.fonts?.ready.then(()=>layout());
 const portada=document.getElementById('portada');if(portada)new MutationObserver(()=>{if(portada.hidden)restart(section);}).observe(portada,{attributes:true,attributeFilter:['hidden']});
 return {setSection:restart,setPaused,button};
}
