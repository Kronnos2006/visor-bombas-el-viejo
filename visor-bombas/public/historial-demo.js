// Historial de DEMOSTRACIÓN para los gráficos de presión y caudal.
// No son mediciones de la planta: sirven para ver cómo se comporta el gráfico
// con un año de rondas. Cada registro lleva "DEMO" en el tipo y en el detalle.
// La serie es fija por bomba (misma semilla = mismos valores en cada visita).

const hash=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;};
function rng(seed){let a=seed||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

// Rondas mensuales del 15-oct-2025 al 15-sep-2026.
const MONTHS=Array.from({length:12},(_,i)=>{const d=new Date(Date.UTC(2025,9+i,15));return d.toISOString().slice(0,10);});

// Tres escenarios para que no todas las bombas se vean iguales.
const SCENARIOS=[
 {nombre:'estable',
  presion:()=>1,caudal:()=>1,
  eventos:{5:['Mantenimiento preventivo','Revisión de acople y lubricación de rodamientos; parámetros dentro de lo esperado.']}},
 {nombre:'desgaste del sello',
  presion:m=>m<=8?1-0.014*m:0.985,caudal:m=>m<=8?1-0.012*m:0.99,
  eventos:{6:['Inspección por goteo','Goteo leve en el sello; se programa el cambio.'],8:['Cambio de sello mecánico','Sello sustituido; presión y caudal vuelven a la referencia.']}},
 {nombre:'restricción en succión',
  presion:m=>m===6?0.9:m===7?0.95:1,caudal:m=>m===6?0.86:m===7?0.93:1,
  eventos:{6:['Caída de caudal','Ruido de cavitación y caudal bajo; filtro de succión sucio.'],7:['Limpieza de filtro de succión','Filtro limpio; el caudal se recupera.']}}
];

export function demoReadings(p,basePres,baseFlow){
 if(!p||p.inactive||!basePres||!baseFlow)return [];
 const seed=hash(p.tag),r=rng(seed),sc=SCENARIOS[seed%SCENARIOS.length];
 const noise=amp=>1+(r()*2-1)*amp;
 return MONTHS.map((fecha,m)=>{
  const ev=sc.eventos[m];
  return{
   fecha,
   tipo:'DEMO · '+(ev?ev[0]:'Lectura de ronda'),
   presion:Number((basePres*sc.presion(m)*noise(0.018)).toFixed(2)),
   caudal:Number((baseFlow*sc.caudal(m)*noise(0.022)).toFixed(baseFlow<10?2:1)),
   detalle:'Dato de demostración ('+sc.nombre+'). '+(ev?ev[1]:'Lectura mensual de presión de descarga y caudal.')
  };
 });
}
