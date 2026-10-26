// Vista del simulador: giro de rotores, trazadores de flujo, panel e instrumentos.
// Los recorridos son ilustrativos (no CFD), igual que en la guía HIDROMAC 2196.
import {FLUIDS} from './pump-sim.js';

const SEAL_ROT=/Cara rotativa|Fuelle|Resorte|Retenedor|O-ring del eje/;
const MOTOR_ROT=/Rotor del motor|Eje del motor|Cubo del ventilador|Aspa del ventilador/;
const VISUAL=.025; // fracción de las rpm reales que se dibuja, para poder ver el giro

const firstName=o=>{if(o.isMesh)return o.name;let n='';o.traverse(c=>{if(!n&&c.isMesh)n=c.name;});return n;};

export function createSimRig(THREE,components){
 const spinners=[];
 const addSpin=o=>spinners.push({o,rx:o.rotation.x,y:o.position.y,z:o.position.z});
 components.forEach((g,i)=>{for(const child of g.children){const name=firstName(child);if(i===2||i===6||i===8||(i===5&&SEAL_ROT.test(name))||(i===9&&MOTOR_ROT.test(name)))addSpin(child);}});
 // Trazadores: succión axial → ojo del impulsor → espiral en la voluta → descarga superior.
 const casing=components[0],N=70,path=u=>{
  if(u<.3){const t=u/.3;return [-1.35+1.1*t,0,0];}
  if(u<.75){const t=(u-.3)/.45,r=.25+.68*t,a=-Math.PI/2+t*Math.PI*2.25;return [-.12,r*Math.cos(a),r*Math.sin(a)];}
  const t=(u-.75)/.25;return [.08,.93+.75*t,0];
 };
 const geometry=new THREE.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3),phase=Array.from({length:N},(_,k)=>k/N),jitter=Array.from({length:N},()=>[(Math.random()-.5)*.16,(Math.random()-.5)*.16]);
 geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));geometry.setAttribute('color',new THREE.BufferAttribute(col,3));
 const flow=new THREE.Points(geometry,new THREE.PointsMaterial({size:.11,vertexColors:true,transparent:true,opacity:.95,depthWrite:false}));
 flow.raycast=()=>{};flow.visible=false;flow.renderOrder=3;flow.name='Trazadores de flujo';casing?.add(flow);
 let angle=0;const water=new THREE.Color(0x4fc3f7),alcohol=new THREE.Color(0xffc56b),bubble=new THREE.Color(0xffffff);
 function update(sim,d,dt,{reduced,showFlow,exploded}){
  if(!reduced){angle+=(d?d.omega:0)*VISUAL*dt;for(const s of spinners){const c=Math.cos(angle),n=Math.sin(angle);s.o.rotation.x=s.rx+angle;s.o.position.y=s.y*c-s.z*n;s.o.position.z=s.y*n+s.z*c;}}
  const flowing=!!d&&d.q>1e-7&&showFlow&&!exploded;flow.visible=flowing;if(!flowing)return;
  const speed=reduced?0:.28*Math.min(2.2,d.q/sim.model.params.Qd),base=sim.inputs.fluid==='etanol'?alcohol:water;
  for(let k=0;k<N;k++){phase[k]=(phase[k]+speed*dt)%1;const [x,y,z]=path(phase[k]),[jy,jz]=jitter[k],axial=phase[k]<.3||phase[k]>=.75;
   pos[k*3]=x+(axial&&phase[k]>=.75?jy:0);pos[k*3+1]=y+(axial&&phase[k]<.3?jy:0);pos[k*3+2]=z+jz;
   const c=d.cavitation&&phase[k]>.25&&phase[k]<.45&&k%3===0?bubble:base;col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;}
  geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
 }
 function reset(){angle=0;for(const s of spinners){s.o.rotation.x=s.rx;s.o.position.y=s.y;s.o.position.z=s.z;}flow.visible=false;}
 return {update,reset,spinners};
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=(x,n=1)=>Number.isFinite(x)?x.toLocaleString('es-CR',{minimumFractionDigits:n,maximumFractionDigits:n}):'—';

export function simPanelHTML(p,sim){
 const P=sim.model.params,i=sim.inputs,cc=P.closeCoupled;
 const placa=[['Punto de placa',`${f(P.Qd*3600,2)} m³/h · ${f(P.Qd/6.30902e-5,0)} GPM · ${f(P.Hd,1)} m`],['Velocidad',`${f(P.n0,0)} rpm curva · ${f(P.nMotor,0)} rpm motor`],['Impulsor',P.D?`${f(P.D,0)} mm de ${f(P.Dmax,0)} mm máx.`:'Por confirmar'],['Motor',`${f(P.prated/1000,2)} kW (${f(P.prated/745.7,1)} HP) · ${P.voltage} V (supuesto) · In ≈ ${f(P.prated/P.motorEta/(Math.sqrt(3)*P.voltage*P.pf),1)} A`],['Bridas',`Succión ${f(P.dSuccion/.0254,1)} in · descarga ${f(P.dDescarga/.0254,1)} in`],['Arquitectura',cc?'Monobloque (motor acoplado directo): sin soporte con aceite ni acople':'Soporte de rodamientos con aceite y acople espaciador']];
 const range=(id,label,min,max,step,value,unit)=>`<label class="sim-range"><span>${label}<output id="sim-${id}-out"></output></span><input type="range" id="sim-${id}" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}"></label>`;
 const toggle=(id,label,on)=>`<button type="button" class="sim-toggle" id="sim-${id}" aria-pressed="${on}">${label}</button>`;
 return `<p class="eyebrow">SIMULADOR · ${esc(p.tag)}</p><h2>${esc(p.marca)} ${esc(p.modelo)} <small class="sim-size">${esc(p.size)}</small></h2>
<p class="notice">Modelo reducido con las mismas funciones de la guía HIDROMAC 2196, ajustado a la placa de ${esc(p.tag)}. La curva es <strong>sintética</strong>: pasa por el punto de placa, pero no es la curva del fabricante. Sirve para entender el comportamiento, no para dimensionar ni operar.</p>
${P.estimados.length?`<p class="notice pending-source"><strong>DATOS ESTIMADOS</strong> · ${esc(P.estimados.join(' · '))}. Completar con la placa de la bomba.</p>`:''}
<div class="sim-actions"><button type="button" class="primary" id="sim-run">${i.running?'■ Parar bomba':'▶ Arrancar bomba'}</button><button type="button" id="sim-pause">${sim.paused?'Continuar':'Pausar'}</button><button type="button" id="sim-speed">Tiempo ×${sim.speed}</button><button type="button" id="sim-reset" title="Restablecer el simulador" aria-label="Restablecer el simulador">↺</button></div>
<div class="sim-status"><span id="sim-phase" class="sim-phase">Detenida</span><span id="sim-time" class="muted"></span></div>
<ul id="sim-warnings" class="sim-warnings"></ul>
<div class="sim-grid" id="sim-readouts"></div>
<div class="block"><h3>Curva de la bomba e instalación</h3><canvas id="sim-chart" width="640" height="380" aria-label="Gráfica de altura contra caudal"></canvas><p class="muted sim-legend"><i class="lg pump"></i>Bomba a la velocidad actual <i class="lg sys"></i>Instalación con la válvula actual <i class="lg pt"></i>Punto de trabajo <i class="lg plate"></i>Punto de placa</p></div>
<div class="block"><h3>Operación</h3>
${range('freq','Frecuencia (variador hipotético)',0,60,1,i.frequency)}
${range('valve','Apertura de válvula de descarga',0,100,1,Math.round(i.valve*100))}
${range('suction','Nivel del tanque respecto al eje',-8,4,.1,i.suction)}
${range('temp','Temperatura del líquido',5,90,1,i.temperature)}
${cc?'':range('oil','Nivel de aceite del soporte',0,100,1,Math.round(i.oil*100))}
<label class="sim-select"><span>Líquido bombeado</span><select id="sim-fluid">${Object.entries(FLUIDS).map(([k,v])=>`<option value="${k}" ${k===i.fluid?'selected':''}>${v.nombre} · ${v.rho} kg/m³</option>`).join('')}</select></label>
<div class="sim-toggles">${toggle('power','Alimentación',i.power)}${toggle('primed','Bomba cebada',i.primed)}${cc?'':toggle('cooling','Enfriador de aceite',i.cooling)}${toggle('flow','Ver flujo',sim.showFlow)}</div>
<button type="button" class="wide" id="sim-inside">Ver el interior girando ↗</button></div>
<div class="block"><h3>Datos que usa el simulador</h3><dl class="fields">${placa.map(([k,v])=>`<div class="field"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
<p class="muted">Curva: H = ${f(P.H0,1)}·(n/${f(P.n0,0)})² − k·Q², cierre ≈ 125 % de la altura de placa. Instalación: ${f(P.Hs,1)} m estáticos más pérdidas que pasan por el punto de placa con la válvula al 72 %. Eficiencia máxima ilustrativa ${f(P.etaMax*100,0)} %. El alcohol se modela como etanol puro (densidad y presión de vapor); la viscosidad no se considera.</p>
<button type="button" class="wide" id="sim-save">Guardar lecturas (JSON)</button></div>`;
}

export function updateSimPanel(root,sim,d){
 const $=id=>root.querySelector('#sim-'+id);if(!$('readouts'))return;
 const P=sim.model.params,i=sim.inputs;
 $('phase').textContent=d.phase;$('phase').dataset.kind=d.warnings.length?'warn':d.phase==='En servicio'?'ok':'idle';
 $('time').textContent=`t = ${f(sim.state.time,0)} s${sim.paused?' · en pausa':''}`;
 const cells=[['Velocidad',f(d.rpm,0),'rpm'],['Caudal',f(d.q*3600,2),'m³/h',`${f(d.q/6.30902e-5,1)} GPM`],['Altura',f(d.H,1),'m'],['Incremento de presión (bomba)',f(d.pressure/1e5,2),'bar','descarga − succión'],['Presión de descarga',f((d.dischargeAbs-101325)/1e5,2),'bar man.','incluye la succión simulada'],['NPSH disponible',f(d.npsha,1),'m',`requerido ${f(d.npshr,1)} m`],['Eficiencia hidráulica',f(d.eta*100,0),'%'],['Potencia hidráulica',f(d.hydraulic/1000,2),'kW'],['Potencia en el eje',f(d.shaft/1000,2),'kW',`${f(d.load*100,0)} % del motor`],['Potencia eléctrica',f(d.electric/1000,2),'kW'],['Corriente',f(d.current,2),'A',`nominal ≈ ${f(d.ratedCurrent,1)} A`],['Velocidad en descarga',f(d.velocity,2),'m/s'],['Par en el eje',f(d.torque,1),'N·m'],...(P.closeCoupled?[]:[['Aceite',f(d.oilTemp,0),'°C']]),['Sello',f(d.sealTemp,0),'°C'],['Motor',f(d.motorTemp,0),'°C']];
 $('readouts').innerHTML=cells.map(([k,v,u,s])=>`<div class="sim-cell"><span>${k}</span><b>${v}<small> ${u}</small></b>${s?`<em>${s}</em>`:''}</div>`).join('');
 $('warnings').innerHTML=d.warnings.map(w=>`<li>${esc(w)}</li>`).join('');
 const out=(id,t)=>{const o=$(id+'-out');if(o)o.textContent=t;};
 out('freq',`${f(i.frequency,0)} Hz`);out('valve',`${f(i.valve*100,0)} %`);out('suction',`${i.suction>0?'+':''}${f(i.suction,1)} m`);out('temp',`${f(i.temperature,0)} °C`);out('oil',`${f(i.oil*100,0)} %`);
}

export function drawSimChart(canvas,sim,d){
 if(!canvas)return;const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height,P=sim.model.params,pad={l:52,r:14,t:16,b:40};
 const curve=sim.model.curves({...sim.state,rpm:Math.max(sim.state.rpm,P.nMotor*sim.inputs.frequency/60)},sim.inputs);
 const qmax=Math.max(P.Qd*1.6,curve.at(-1).q,d.q*1.1)*3600,hmax=Math.max(P.H0*1.1,P.Hd*1.3,d.H*1.1);
 const X=q=>pad.l+(q*3600)/qmax*(W-pad.l-pad.r),Y=h=>H-pad.b-h/hmax*(H-pad.t-pad.b);
 ctx.clearRect(0,0,W,H);ctx.font='13px Inter,Segoe UI,sans-serif';ctx.lineWidth=1;ctx.strokeStyle='#29373c';ctx.fillStyle='#829499';
 for(let k=0;k<=5;k++){const y=pad.t+(H-pad.t-pad.b)*k/5,x=pad.l+(W-pad.l-pad.r)*k/5;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();ctx.fillText(f(hmax*(1-k/5),0),8,y+4);ctx.fillText(f(qmax*k/5,qmax<10?1:0),x-8,H-pad.b+18);}
 ctx.fillText('Altura m',pad.l+6,pad.t+12);ctx.fillText('Caudal m³/h',W-pad.r-80,H-6);
 const line=(key,color,dash)=>{ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();let on=false;for(const c of curve){if(c[key]>hmax*1.02)break;const y=Y(c[key]);on?ctx.lineTo(X(c.q),y):ctx.moveTo(X(c.q),y);on=true;}ctx.stroke();ctx.setLineDash([]);};
 ctx.save();ctx.beginPath();ctx.rect(pad.l,pad.t,W-pad.l-pad.r,H-pad.t-pad.b);ctx.clip();line('pump','#c6ed86');line('system','#f5ae66',[7,5]);ctx.restore();
 ctx.strokeStyle='#dce6e8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(P.Qd),Y(P.Hd),7,0,Math.PI*2);ctx.stroke();
 if(d.rpm>5){ctx.fillStyle=d.cavitation?'#f3ac9d':'#4fc3f7';ctx.beginPath();ctx.arc(X(d.q),Y(d.H),7,0,Math.PI*2);ctx.fill();}
}
