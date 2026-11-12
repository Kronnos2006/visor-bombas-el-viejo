// Reparaciones y trabajos en Pendientes: qué bomba se repara más, qué problemas se repiten,
// repuestos más usados y trabajos por mes. Datos: informes, órdenes y avisos de planta (Supabase).
import {surveyConnection} from './cloud-surveys.js';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

// ---------- Cálculos (sin pantalla; se prueban) ----------
const sinTildes=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
export const CATEGORIAS=[
 ['Sello / fuga',/sello|fuga|gotea|goteo|escurre|derrame/],
 ['Rodamientos',/rodamiento|balero|cojinete/],
 ['Motor / eléctrico',/motor|electric|bobina|quemad|breaker|contactor|termico|amperaje|cable|voltaje|fase/],
 ['Vibración / ruido',/vibra|ruido|suena|golpe|zumb/],
 ['Acople / alineación',/acople|alinea|matrimonio|cople|desalin/],
 ['Impulsor / cavitación',/impulsor|cavita|rodete|no bombea|caudal|presion/],
 ['Empaque / O-ring',/empaque|o-?ring|junta|empaquetadura|prensaestopa/],
 ['Temperatura',/caliente|calienta|temperatura|sobrecalent/],
];
export function categoriasDe(texto){
 const t=sinTildes(texto),hits=CATEGORIAS.filter(([,re])=>re.test(t)).map(([n])=>n);
 return hits.length?hits:['Otro'];
}
const contar=(items,clave)=>{const m=new Map();for(const it of items){const k=clave(it);if(k)m.set(k,(m.get(k)||0)+1);}return [...m].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0]),'es',{numeric:true}));};
const fechaDe=r=>String(r.data?.date||r.created_at||'').slice(0,10);
// Los informes guardados en la nube usan title/symptoms/text; los del formulario, problema/comentario.
const textoDe=d=>[d?.title,d?.symptoms,d?.problema,d?.text,d?.comentario].map(x=>Array.isArray(x)?x.join(' '):typeof x==='string'?x:'').join(' ');
const si=v=>v===true||/^(si|sí|true|1)$/i.test(String(v??'').trim());
const no=v=>v===false||/^(no|false|0)$/i.test(String(v??'').trim());
// Repuestos: lista [{code,name}] o texto «Código 456875 · sello; …».
export function repuestosDe(parts){
 const lista=Array.isArray(parts)?parts.map(p=>typeof p==='string'?p:(p?.name||p?.code||'')):typeof parts==='string'?parts.split(/[;\n]+/):[];
 return lista.map(x=>String(x).split('·').pop().replace(/^\s*c[oó]digo\s*\S+\s*/i,'').trim().replace(/\s+/g,' ')).filter(x=>x.length>1);
}
export function calcular({reports=[],orders=[],incidents=[]},{desde=null,hoy=new Date().toISOString().slice(0,10)}={}){
 const dentro=f=>!desde||(f&&f>=desde);
 const informes=reports.filter(r=>!r.archived_at&&dentro(fechaDe(r)));
 const ordenes=orders.filter(o=>!o.archived_at).map(o=>o.data||o);
 const avisos=incidents.filter(i=>dentro(String(i.created_at||'').slice(0,10)));
 const ordenesPeriodo=ordenes.filter(o=>dentro(String(o.created||o.due||'').slice(0,10)));
 // Problemas: lo que dicen informes, avisos y órdenes correctivas (cada registro cuenta una vez por categoría).
 const textos=[...informes.map(r=>textoDe(r.data)),...avisos.map(i=>`${i.title} ${i.details||''}`),...ordenesPeriodo.filter(o=>o.type==='correctivo').map(o=>`${o.title} ${o.component||''}`)];
 const problemas=contar(textos.flatMap(t=>categoriasDe(t).map(c=>({c}))),x=>x.c);
 const bombas=contar([...informes.map(r=>r.tag),...avisos.map(i=>i.tag)].map(t=>({t})),x=>x.t);
 const repuestos=contar(informes.flatMap(r=>repuestosDe(r.data?.parts).map(n=>({n}))),x=>x.n.toLowerCase().replace(/^./,c=>c.toUpperCase()));
 // Trabajos por mes: últimos 6 meses (siempre los 6, aunque tengan 0).
 const meses=[];const base=new Date(hoy+'T12:00:00Z');for(let i=5;i>=0;i--){const d=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()-i,1));meses.push([d.toISOString().slice(0,7),0]);}
 for(const r of reports.filter(r=>!r.archived_at)){const m=fechaDe(r).slice(0,7),fila=meses.find(x=>x[0]===m);if(fila)fila[1]++;}
 // Atención: último informe de cada bomba dice que no quedó funcionando o que se retiró.
 const ultimo=new Map();for(const r of reports.filter(r=>!r.archived_at))if(!ultimo.has(r.tag)||fechaDe(r)>fechaDe(ultimo.get(r.tag)))ultimo.set(r.tag,r);
 const retirada=d=>si(d?.retiro)||si(d?.retirado);
 const atencion=[...ultimo.values()].filter(r=>no(r.data?.operativo)||retirada(r.data)).map(r=>({tag:r.tag,fecha:fechaDe(r),sinFuncionar:no(r.data?.operativo),retirada:retirada(r.data),problema:(r.data?.title||r.data?.problema||textoDe(r.data)).trim()})).sort((a,b)=>b.fecha.localeCompare(a.fecha));
 const abiertas=ordenes.filter(o=>o.status!=='completada');
 return {trabajos:informes.length,abiertas:abiertas.length,vencidas:abiertas.filter(o=>o.due&&o.due<hoy).length,avisosAbiertos:incidents.filter(i=>i.status!=='resuelto').length,
  bombas:bombas.slice(0,8),problemas:problemas.slice(0,8),repuestos:repuestos.slice(0,8),meses,atencion,
  tipos:contar(ordenesPeriodo.map(o=>({t:o.type||'inspeccion'})),x=>x.t)};
}

// ---------- Pantalla ----------
let datos={reports:[],orders:[],incidents:[]},periodo='90',cargando=false,error='';
function desdePeriodo(){if(periodo==='todo')return null;const d=new Date();d.setDate(d.getDate()-Number(periodo));return d.toISOString().slice(0,10);}
async function cargar(){
 if(cargando)return;cargando=true;error='';
 try{
  const c=await surveyConnection();if(!c){error='Entrá con tu cuenta para ver las estadísticas.';return;}
  const leer=async(tabla,campos)=>{const r=await c.client.from(tabla).select(campos).limit(2000);if(r.error)throw r.error;return r.data||[];};
  const [reports,orders]=await Promise.all([leer('vocatus_work_reports','tag,data,created_at,archived_at'),leer('vocatus_work_orders','data,archived_at')]);
  let incidents=[];try{incidents=await leer('vocatus_incidents','tag,title,details,severity,status,created_at');}catch{}
  datos={reports,orders,incidents};
 }catch(e){error='No se pudieron leer los trabajos. Reintentá con Actualizar.';}
 finally{cargando=false;pintar();}
}
// Barras horizontales: una sola serie (sin leyenda; el título la nombra), número visible y tabla opcional.
function barras(titulo,ayuda,filas,unidad,vacio){
 if(!filas.length)return `<section class="est-grafico"><h3>${esc(titulo)}</h3><p class="est-ayuda">${esc(ayuda)}</p><p class="tel-vacio">${esc(vacio)}</p></section>`;
 const max=Math.max(...filas.map(f=>f[1]));
 return `<section class="est-grafico"><h3>${esc(titulo)}</h3><p class="est-ayuda">${esc(ayuda)}</p><ol class="est-barras">${filas.map(([k,v])=>`<li title="${esc(k)}: ${v} ${esc(unidad)}"><span class="est-etiqueta">${esc(k)}</span><span class="est-pista"><i style="width:${Math.max(4,v/max*100).toFixed(1)}%"></i></span><b>${v}</b></li>`).join('')}</ol>
 <details class="est-tabla"><summary>Ver como tabla</summary><table><thead><tr><th>${esc(titulo)}</th><th>${esc(unidad)}</th></tr></thead><tbody>${filas.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('')}</tbody></table></details></section>`;
}
function columnasMes(meses){
 const max=Math.max(1,...meses.map(m=>m[1]));
 const nombre=m=>MESES[Number(m.slice(5,7))-1]+' '+m.slice(2,4);
 return `<section class="est-grafico"><h3>Trabajos por mes</h3><p class="est-ayuda">Informes de trabajo registrados en los últimos 6 meses.</p>
 <div class="est-columnas">${meses.map(([m,v])=>`<div title="${nombre(m)}: ${v} trabajos"><b>${v||''}</b><span class="est-col"><i style="height:${v?Math.max(4,v/max*100).toFixed(1):0}%"></i></span><small>${nombre(m)}</small></div>`).join('')}</div>
 <details class="est-tabla"><summary>Ver como tabla</summary><table><thead><tr><th>Mes</th><th>Trabajos</th></tr></thead><tbody>${meses.map(([m,v])=>`<tr><td>${nombre(m)}</td><td>${v}</td></tr>`).join('')}</tbody></table></details></section>`;
}
const TIPO={preventivo:'Preventivo',correctivo:'Correctivo',inspeccion:'Inspección'};
function pintar(){
 const caja=$('#pend-lista');if(!caja)return;
 let r;try{r=calcular(datos,{desde:desdePeriodo()});}catch(e){console.warn('Estadísticas',e);r=calcular({},{});error='Algún registro tiene un formato raro; se muestra lo que se pudo leer.';}
 const filtro=`<div class="est-periodo" role="group" aria-label="Período">${[['30','Último mes'],['90','3 meses'],['180','6 meses'],['todo','Todo']].map(([v,t])=>`<button type="button" data-periodo="${v}" aria-pressed="${v===periodo}">${t}</button>`).join('')}<button type="button" data-est-actualizar>↻ Actualizar</button></div>`;
 const atencion=r.atencion.length?`<div class="est-atencion">${r.atencion.map(a=>`<div class="est-alerta"><span aria-hidden="true">⚠</span><div><strong>${esc(a.tag)}</strong> · ${a.retirada?'Retirada de su lugar':'Quedó sin funcionar'}<small>${esc(a.fecha)}${a.problema?' · '+esc(a.problema.slice(0,120)):''}</small></div></div>`).join('')}</div>`
  :'<p class="tel-vacio">Ninguna bomba quedó sin funcionar ni retirada en su último informe.</p>';
 caja.innerHTML=`<section class="estadisticas"><div class="orden-heading"><div><span class="orden-kicker">ANÁLISIS</span><h2>Reparaciones y trabajos</h2></div></div>${filtro}
 ${error?`<p class="tel-nota">${esc(error)}</p>`:''}${cargando&&!datos.reports.length?'<p class="tel-nota">Cargando trabajos…</p>':''}
 <div class="est-tiles"><div><b>${r.trabajos}</b><span>Trabajos registrados</span></div><div><b>${r.abiertas}</b><span>Órdenes abiertas</span></div><div><b>${r.vencidas}</b><span>Órdenes vencidas</span></div><div><b>${r.avisosAbiertos}</b><span>Avisos sin resolver</span></div></div>
 <h3 class="est-sub">Atención ahora</h3>${atencion}
 <div class="est-grilla">
 ${barras('Bombas con más reparaciones','Informes de trabajo y avisos de planta por bomba.',r.bombas,'registros','Todavía no hay trabajos en este período.')}
 ${barras('Problemas que más se repiten','Según lo escrito en informes, avisos y órdenes correctivas.',r.problemas,'veces','Todavía no hay problemas registrados en este período.')}
 ${barras('Repuestos más usados','Repuestos anotados en los informes de trabajo.',r.repuestos,'veces','Todavía no se anotaron repuestos en este período.')}
 ${barras('Órdenes por tipo','Órdenes creadas en el período.',r.tipos.map(([k,v])=>[TIPO[k]||k,v]),'órdenes','No se crearon órdenes en este período.')}
 ${columnasMes(r.meses)}
 </div></section>`;
 caja.querySelectorAll('[data-periodo]').forEach(b=>b.onclick=()=>{periodo=b.dataset.periodo;pintar();});
 caja.querySelector('[data-est-actualizar]').onclick=cargar;
}

let iniciado=false;
export function iniciarEstadisticas(){
 if(iniciado||typeof document==='undefined')return;iniciado=true;
 pintar();cargar();
 document.addEventListener('vocatus:informe-guardado',()=>setTimeout(cargar,500));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')cargar();});
 document.addEventListener('click',e=>{if(e.target.closest?.('#ordenes-actualizar'))setTimeout(cargar,300);});
 setInterval(()=>{if(document.visibilityState==='visible'&&document.body.dataset.telSeccion==='pendientes')cargar();},120000);
}
