// Simulador reducido por bomba. Toma las funciones de la guía HIDROMAC 2196
// (defaults, initialState, step, derive, normalize, vaporPressure) y las ajusta
// con la placa de cada equipo. Curvas sintéticas: no son datos del fabricante.
const G=9.80665, GPM=6.30902e-5, HP=745.7, CV=735.499;
// Potencia de placa en vatios según la unidad escrita (HP, CV o kW). Sin unidad no se adivina:
// se devuelve null para que el simulador lo informe como estimado.
export function powerW(text){
 const v=num(text);if(v===null||!(v>0))return null;
 const t=String(text);
 if(/\bkw\b/i.test(t))return v*1000;
 if(/\b(hp|bhp)\b/i.test(t))return v*HP;
 if(/\bcv\b/i.test(t))return v*CV;
 if(/\bw\b/i.test(t))return v;
 return null;
}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

export const FLUIDS={
 agua:{nombre:'Agua',rho:998,antoine:[8.07131,1730.63,233.426]},
 etanol:{nombre:'Alcohol etílico',rho:789,antoine:[8.20417,1642.89,230.300]}
};

function num(text){const m=String(text??'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;}
function spec(p,re){const row=(p.specs||[]).find(([k])=>re.test(k));return row?row[1]:null;}
function inches(text){const t=String(text).trim(),m=t.match(/^(\d+)(?:\s+(\d+)\/(\d+))?$/)||t.match(/^(\d*\.?\d+)$/);if(!m)return null;return Number(m[1])+(m[2]?Number(m[2])/Number(m[3]):0);}
// "1X1.5-8 LF" → descarga 1 in, succión 1.5 in, impulsor nominal 8 in.
export function parseSize(size){
 const m=String(size||'').toUpperCase().match(/^\s*(\d+(?:\.\d+)?(?:\s+\d\/\d)?)\s*X\s*(\d+(?:\.\d+)?(?:\s+\d\/\d)?)\s*[-X]\s*(\d+)/);
 if(!m)return null;return {descarga:inches(m[1]),succion:inches(m[2]),impulsor:Number(m[3])};
}
function flow(text){const v=num(text);if(v===null)return null;return /gpm/i.test(text)?v*GPM:/l\/s/i.test(text)?v/1000:v/3600;}

// Parámetros por bomba a partir de la ficha. Lo que falta se estima y se informa.
export function simParams(p){
 if(!p)return null;
 const estimados=p.inactive?['equipo SIN USO o sin placa: todo el comportamiento es supuesto']:[],size=parseSize(p.size)||{descarga:1.5,succion:2,impulsor:8};
 const nMotor=num(p.motor?.rpm)||num(spec(p,/velocidad/i))||1750;
 let n0=num(spec(p,/velocidad de bomba/i)),Qd=flow(spec(p,/caudal/i)),Hd=num(spec(p,/altura/i));
 const prated=powerW(p.motor?.potencia)??(estimados.push(num(p.motor?.potencia)?'potencia del motor sin unidad clara (se usó 2 HP)':'potencia del motor (se usó 2 HP)'),2*HP);
 if(!n0){n0=nMotor;estimados.push('velocidad de curva = velocidad del motor');}
 if(!Hd){const u=Math.PI*size.impulsor*.0254*n0/60;Hd=Math.round(.42*u*u/G);estimados.push('altura por diámetro nominal y velocidad');}
 if(!Qd){Qd=.62*prated/(FLUIDS.agua.rho*G*Hd);estimados.push('caudal por potencia del motor');}
 const D=num(spec(p,/^impulsor$/i)),Dmax=num(spec(p,/impulsor m[aá]x/i));
 const qh=Qd*3600,etaMax=clamp(.25+.12*Math.log(Math.max(1,qh)),.2,.8);
 const H0=1.25*Hd,A=(H0-Hd)/(Qd*Qd),Hs=.25*Hd,K=(Hd-Hs)/(Qd*Qd),Kv=K/(5+1/(.72*.72)),Nd=(1+.04*qh)*Math.pow(n0/1750,4/3);
 const motorEta=prated<3000?.855:.917,pf=prated<3000?.8:.84,voltage=460;
 const shaftD=FLUIDS.agua.rho*G*Qd*Hd/etaMax;
 const fluid=/alcohol|etanol|aldeh|cabezas/i.test(`${p.servicio} ${p.nombre}`)?'etanol':'agua';
 return {tag:p.tag,familia:p.variant,closeCoupled:p.variant==='goulds',n0,nMotor,Qd,Hd,H0,A,Hs,Kp:5*Kv,Kv,Ksuc:.6/(Qd*Qd),N0:.35*Nd,Nq:.65*Nd/(Qd*Qd),etaMax,Qbep:Qd,P0:.35*shaftD,aux:.03*prated,
  prated,motorEta,pf,voltage,motorK:55/(prated*(1/motorEta-1)),dDescarga:size.descarga*.0254,dSuccion:size.succion*.0254,D,Dmax,fluid,estimados};
}

// Parámetros exactos de la guía HIDROMAC 2196 (para verificar la generalización).
export const GUIDE={tag:'GUIA',n0:1750,nMotor:1750,Qd:.007,Hd:13.18,H0:22,A:180000,Hs:3,Kp:150000,Kv:30000,Ksuc:45000,N0:.8,Nq:35000,etaMax:.72,Qbep:.006,P0:130,aux:180,
 prated:2238,motorEta:.88,pf:.82,voltage:460,motorK:.045,dDescarga:.038,dSuccion:.038,fluid:'agua',estimados:[],guide:true};

export function createPumpModel(P){
 const defaults=()=>({running:false,power:true,primed:true,frequency:60,valve:.72,suction:1,temperature:25,oil:1,cooling:false,fluid:P.fluid});
 const initialState=()=>({time:0,rpm:0,oilTemp:25,sealTemp:25,motorTemp:25});
 function normalize(i){return {...i,frequency:clamp(+i.frequency||0,0,60),valve:clamp(+i.valve||0,0,1),suction:clamp(+i.suction||0,-8,4),temperature:clamp(+i.temperature||0,5,90),oil:P.closeCoupled?1:clamp(+i.oil||0,0,1),cooling:!P.closeCoupled&&!!i.cooling,fluid:FLUIDS[i.fluid]?i.fluid:P.fluid};}
 function vaporPressure(t,fluid=P.fluid){const [a,b,c]=FLUIDS[fluid].antoine;return 133.322368*Math.pow(10,a-b/(c+t));}
 function derive(s,raw){
  const i=normalize(raw),F=FLUIDS[i.fluid],rho=F.rho,r=Math.max(0,s.rpm)/P.n0,pv=vaporPressure(i.temperature,i.fluid),K=P.Kp+P.Kv/Math.max(.0025,i.valve*i.valve),Hs=P.Hs;
  const npsh=q=>({available:(101325-pv)/(rho*G)+i.suction-P.Ksuc*q*q,required:P.N0*r*r+P.Nq*q*q});
  const head=q=>{const n=npsh(q),deficit=n.required>1e-8?Math.max(0,(n.required-n.available)/n.required):0;return Math.max(0,P.H0*r*r-P.A*q*q)*clamp(1-.45*deficit,.4,1);};
  let q=0;if(i.primed&&i.valve>.001&&head(0)>Hs){let a=0,b=Math.sqrt(P.H0/P.A)*r;for(let k=0;k<44;k++){const m=(a+b)/2;if(head(m)>Hs+K*m*m)a=m;else b=m;}q=(a+b)/2;}
  const H=i.primed?head(q):0,n=npsh(q),cavitation=q>1e-8&&n.available<n.required;
  const ratio=r>1e-8?q/(P.Qbep*r):0,eta=q>1e-8?clamp(P.etaMax*Math.exp(-.7*(ratio-1)**2),.12,P.etaMax):0;
  const hydraulic=rho*G*q*H,shaft=q>1e-8?hydraulic/eta:P.P0*r**3*(rho/998),electric=i.power&&i.running?(shaft/P.motorEta+P.aux*r*r):0,omega=s.rpm*Math.PI/30;
  const voltage=i.power?P.voltage:0,current=voltage&&r>1e-5?electric/(Math.sqrt(3)*voltage*P.pf):0,ratedCurrent=P.prated/P.motorEta/(Math.sqrt(3)*P.voltage*P.pf);
  const suctionAbs=101325+rho*G*(i.suction-P.Ksuc*q*q),pressure=rho*G*H,target=P.nMotor*i.frequency/60,load=shaft/P.prated;
  const phase=!i.power?'Sin alimentación':!i.running?(s.rpm>5?'Desacelerando':'Detenida'):s.rpm<5?'Esperando velocidad':!i.primed?'Marcha en seco':i.valve<.01?'Descarga cerrada':cavitation?'Riesgo de cavitación':s.rpm<target*.96?'Acelerando':'En servicio';
  const warnings=[];
  if(s.rpm>50){if(!i.primed)warnings.push('Sin cebado: sello sin película líquida.');if(i.valve<.05)warnings.push('Caudal casi nulo: recirculación y calentamiento.');if(cavitation)warnings.push('NPSH disponible menor que el requerido ilustrativo.');if(!P.closeCoupled&&i.oil<.3)warnings.push('Nivel de aceite insuficiente.');if(load>1)warnings.push('Potencia en el eje mayor que la nominal del motor.');if(r>.3&&q>0&&ratio<.3)warnings.push('Operando muy a la izquierda del punto de placa.');if(ratio>1.3)warnings.push('Operando a la derecha del punto de placa: más NPSH requerido.');}
  if(pv>101325*.9)warnings.push(F.nombre+' cerca de su punto de ebullición a esta temperatura.');
  return {rpm:s.rpm,target,r,q,H,K,Hs,pv,eta,hydraulic,shaft,electric,current,ratedCurrent,load,voltage,omega,torque:omega>1e-7?shaft/omega:0,pressure,suctionAbs,dischargeAbs:suctionAbs+pressure,npsha:n.available,npshr:n.required,cavitation,phase,warnings,oilTemp:s.oilTemp,sealTemp:s.sealTemp,motorTemp:s.motorTemp,velocity:q/(Math.PI*(P.dDescarga/2)**2),contactor:!!(i.power&&i.running),oilLevel:i.oil,rho};
 }
 function step(s,raw,dt){
  const i=normalize(raw);dt=clamp(dt,0,.1);
  const target=i.running&&i.power?P.nMotor*i.frequency/60:0,rpm=target+(s.rpm-target)*Math.exp(-dt/(target>s.rpm?2.5:4.5)),next={...s,rpm,time:s.time+dt},d=derive(next,i),r=rpm/P.n0;
  const oilTarget=25+(16+65*(1-i.oil))*r*r+(i.temperature-25)*.13-(i.cooling?10*r:0);
  const sealTarget=i.temperature+(i.primed?5:110)*r*r+(i.valve<.05?30*r:0);
  next.oilTemp=oilTarget+(s.oilTemp-oilTarget)*Math.exp(-dt/65);next.sealTemp=sealTarget+(s.sealTemp-sealTarget)*Math.exp(-dt/32);
  const motorHeat=P.motorK*Math.max(0,d.electric-d.shaft);next.motorTemp=25+motorHeat+(s.motorTemp-25-motorHeat)*Math.exp(-dt/90);return next;
 }
 // Curvas para la gráfica: bomba a la velocidad actual, instalación y NPSH.
 function curves(s,raw,points=40){
  const i=normalize(raw),r=Math.max(s.rpm,1)/P.n0,qmax=Math.sqrt(P.H0/P.A)*Math.max(r,.05),K=P.Kp+P.Kv/Math.max(.0025,i.valve*i.valve),out=[];
  for(let k=0;k<=points;k++){const q=qmax*k/points;out.push({q,pump:Math.max(0,P.H0*r*r-P.A*q*q),system:P.Hs+K*q*q});}
  return out;
 }
 return {params:P,defaults,initialState,step,derive,normalize,vaporPressure,curves};
}
