import {summarizePlant,plantSheets} from './admin-planta-core.js';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const normalize=value=>String(value??'').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const filters=$('#filters'),out=$('#results'),status=$('#status'),refresh=$('#refresh'),exportButton=$('#export');
const notice=$('#report-notice'),markReports=$('#mark-reports'),month=$('#report-month');
const reviewedKey='vocatus-admin-reports-reviewed';
let data=null, summary=null, lastRecords='';
let reviewed=0;
try{reviewed=Number(localStorage.getItem(reviewedKey))||0;}catch{}

function updateNotices(){
 const received=data.reports.filter(row=>!row.archived_at&&Date.parse(row.created_at)>reviewed);
 markReports.disabled=received.length===0;
 notice.textContent=received.length
  ? `${received.length} ${received.length===1?'reporte por revisar':'reportes por revisar'}. Consultá Informes de trabajo y ajustá las fechas si el informe es de otro mes.`
  : 'Estás al día con los reportes recibidos.';
}

function applyMonth(){
 const value=month.value;
 const [year,number]=value.split('-').map(Number);
 filters.elements.from.value=value?`${value}-01`:'';
 filters.elements.until.value=value?`${value}-${new Date(Date.UTC(year,number,0)).getUTCDate()}`:'';
 render();
}

async function json(path){
 const response=await fetch(path,{cache:'no-store'});
 if(!response.ok)throw Error(response.status===403?'Esta sección es exclusiva para administradores.':'No se pudieron cargar los datos de la planta.');
 return response.json();
}
function table(headers,rows){
 if(!rows.length)return '<p class="aclaracion">Sin registros para mostrar.</p>';
 return `<div class="control-tabla" tabindex="0"><table><thead><tr>${headers.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(cell=>`<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const card=(title,content)=>`<section class="control-card"><h2>${escape(title)}</h2>${content}</section>`;
const detail=(title,rows)=>`<details class="control-card"><summary>${escape(title)} (${rows.length-1})</summary>${table(rows[0],rows.slice(1))}</details>`;

function render(){
 if(!data)return;
 const from=filters.elements.from.value,until=filters.elements.until.value;
 if(from&&until&&from>until){
  status.textContent='La fecha inicial debe ser anterior o igual a la final.';
  exportButton.disabled=true;out.hidden=true;summary=null;return;
 }
 const s=summary=summarizePlant(data,{from,until,today:today()});
 const search=normalize($('#search').value.trim());
 status.textContent='Las fechas filtran fallas y mantenimiento. Excel incluye el inventario completo y los registros del período.';
 const kpis=[[s.tracked,'Bombas en catálogo'],[s.outside,'Fuera de lista o sin instalar'],[s.events.length,'Eventos de falla'],[s.reportRows.length,'Informes'],[s.open,'Órdenes abiertas'],[s.late,'Órdenes vencidas']];
 const sheets=plantSheets(s);
 const [pumpHeaders,...pumpRows]=sheets.Bombas;
 out.innerHTML=`<div class="control-kpis">${kpis.map(([total,label])=>`<div><b>${total}</b><span>${escape(label)}</span></div>`).join('')}</div>
 <div class="control-grilla">
  ${card('Bombas por líquido',table(['Líquido','Bombas'],s.liquids))}
  ${card('Bombas con más fallas registradas',table(['TAG','Eventos'],s.frequent))}
  ${card('Fallas por componente o tipo',table(['Categoría','Eventos'],s.categories))}
  ${card('Frecuencia mensual',table(['Mes','Eventos'],s.monthly))}
 </div>
 <p class="aclaracion">Se agrupan los registros vinculados a la misma orden. Las categorías se infieren del texto y un evento puede entrar en varias.</p>
 ${card('Inventario de bombas',table(pumpHeaders,pumpRows.filter(row=>normalize(row.slice(0,6).join(' ')).includes(search))))}
 ${detail('Detalle de fallas',sheets.Fallas)}
 ${detail('Repuestos utilizados',sheets.Repuestos)}
 ${detail('Informes de trabajo',sheets.Informes)}
 ${detail('Órdenes de mantenimiento',sheets.Órdenes)}
 ${detail('Avisos de planta',sheets.Avisos)}`;
 out.hidden=false;
 exportButton.disabled=false;
}
async function load({background=false}={}){
 if(refresh.disabled)return;
 refresh.disabled=true;exportButton.disabled=true;
 if(!background)status.textContent='Cargando inventario e historial compartido…';
 try{
  const [records,inventory,plates]=await Promise.all([
   json('/api/admin/plant'),data?.catalog||json('/modelos/asignacion-bombas.json').then(value=>value.excel),data?.plates||json('/modelos/placas-bombas.json'),
  ]);
  const snapshot=JSON.stringify(records);
  const changed=!data||snapshot!==lastRecords;
  lastRecords=snapshot;
  data={...records,catalog:inventory,plates};
  updateNotices();
  if(!background||changed){
   const open=[...out.querySelectorAll('details')].map(element=>element.open);
   render();
   out.querySelectorAll('details').forEach((element,index)=>{element.open=Boolean(open[index]);});
  }else exportButton.disabled=!summary;
 }catch(error){
  data=null;summary=null;out.hidden=true;status.textContent=error.message;
  notice.textContent='No se pudieron consultar los reportes recibidos.';
  markReports.disabled=true;
 }
 finally{refresh.disabled=false;}
}
filters.addEventListener('submit',event=>event.preventDefault());
filters.addEventListener('input',event=>{
 if(event.target===month){applyMonth();return;}
 if(event.target.name==='from'||event.target.name==='until')month.value='';
 render();
});
markReports.onclick=()=>{
 for(const row of data.reports)reviewed=Math.max(reviewed,Date.parse(row.created_at)||0);
 try{localStorage.setItem(reviewedKey,String(reviewed));}catch{}
 updateNotices();
};
refresh.onclick=()=>load();
exportButton.onclick=async()=>{
 if(!summary)return;
 const snapshot=summary;
 exportButton.disabled=true;
 try{
  const {plantWorkbook}=await import('./admin-planta-xlsx.js');
  const url=URL.createObjectURL(plantWorkbook(plantSheets(snapshot)));
  const link=document.createElement('a');link.href=url;link.download='vocatus-mantenimiento-'+(month.value||today())+'.xlsx';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
 }catch{status.textContent='No se pudo generar el libro de Excel. Intentá de nuevo.';}
 finally{exportButton.disabled=!summary;}
};
month.value=today().slice(0,7);
applyMonth();
load();
setInterval(()=>{if(!document.hidden)void load({background:true});},60000);
