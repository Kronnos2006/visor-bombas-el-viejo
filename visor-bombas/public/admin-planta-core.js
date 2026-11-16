import {categoriasDe,repuestosDe} from './estadisticas.js';

const text=value=>Array.isArray(value)?value.map(text).filter(Boolean).join(', '):typeof value==='string'?value.trim():value==null?'':String(value);
const date=value=>text(value).slice(0,10);
const key=value=>text(value).toUpperCase();
const tagOf=value=>/^(B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(key(value))?key(value):'';
const negative=value=>value===false||/^(no|false|0)$/i.test(text(value));
const positive=value=>value===true||/^(s[ií]|true|1)$/i.test(text(value));
const compare=(a,b)=>a.localeCompare(b,'es',{numeric:true});
function counts(values){
 const totals=new Map();
 for(const value of values)totals.set(value,(totals.get(value)||0)+1);
 return [...totals].sort((a,b)=>b[1]-a[1]||compare(a[0],b[0]));
}

export function summarizePlant({catalog={},plates={},reports=[],orders=[],incidents=[],overrides=[]},{from='',until='',today=''}={}){
 const edits=new Map(overrides.map(row=>[tagOf(text(row.reference_key).replace(/^tag:/i,'')),row.data]));
 const equipment=new Map();
 function addPump(tag,row={}){
  if(!tag||equipment.has(tag))return;
  const data=edits.get(tag)||{};
  const absent=plates[tag]?.fuente==='Fuera de la lista';
  equipment.set(tag,{
   tag,name:text(data.ubicacion||row.nombre),area:text(data.area||row.area)||'Sin área',
   liquid:text(data.fluido||data.liquido||row.liquido)||'Sin especificar',
   model:text([data.marca,data.modelo].filter(Boolean).join(' ')||text(row.bomba).split(' · ')[0]),
   size:text(data.tamano||row.tamano),
   outside:absent?(/no instalada/i.test(text(plates[tag]?.placa))?'No instalada':'Fuera de lista'):'',
  });
 }
 for(const [tag,row] of Object.entries(catalog))addPump(tagOf(tag),row);
 for(const tag of edits.keys())addPump(tag);
 for(const record of [...reports,...orders,...incidents])addPump(tagOf(record.tag||record.data?.tag));
 const inventory=[...equipment.values()].sort((a,b)=>compare(a.tag,b.tag));
 const inside=value=>!from&&!until||!!value&&(!from||value>=from)&&(!until||value<=until);
 const cases=new Map();
 function addCase(source,id,order,tag,day,description){
  if(!description)return;
  const caseId=order?'orden:'+order:source+':'+tag+':'+id;
  const item=cases.get(caseId)||{id:caseId,tag,dates:[],descriptions:new Set(),sources:new Set()};
  if(!item.tag&&tag)item.tag=tag;
  if(day)item.dates.push(day);
  item.descriptions.add(description);item.sources.add(source);
  cases.set(caseId,item);
 }
 const reportRows=[],orderRows=[],incidentRows=[];
 for(const row of reports){
  if(row.archived_at)continue;
  const d=row.data||{},tag=tagOf(row.tag||d.tag),day=date(d.date||row.created_at);
  const title=text(d.title||d.problema),symptoms=text(d.symptoms),details=text(d.text||d.comentario);
  const parts=repuestosDe(d.parts);
  if(inside(day))reportRows.push({tag,day,title,symptoms,details,parts,author:text(d.author),operating:negative(d.operativo)?'No':positive(d.operativo)?'Sí':'',removed:positive(d.retirado||d.retiro)?'Sí':'',order:text(row.work_order_id||d.workOrderId)});
  if(symptoms||negative(d.operativo)||positive(d.retirado||d.retiro)||/\b(falla|aver[ií]a|fuga|cavitaci[oó]n|se detuvo|no funciona)\b/i.test(title)){
   addCase('Informe',row.source_id||d.id,row.work_order_id||d.workOrderId,tag,day,[title,symptoms,details].filter(Boolean).join(' · '));
  }
 }
 for(const row of orders){
  if(row.archived_at)continue;
  const d=row.data||row,tag=tagOf(row.tag||d.tag),day=date(d.created||row.updated_at);
  const order={id:text(row.id||d.id),tag,day,title:text(d.title),part:text(d.component),type:text(d.type),status:text(d.status),due:date(d.due),assignee:text(d.assignee)};
  if(inside(day))orderRows.push(order);
  if(order.type==='correctivo')addCase('Orden correctiva',order.id,order.id,tag,day,[order.title,order.part].filter(Boolean).join(' · '));
 }
 for(const row of incidents){
  const tag=tagOf(row.tag),day=date(row.created_at),title=text(row.title),details=text(row.details);
  if(inside(day))incidentRows.push({id:text(row.id),tag,day,title,details,place:text(row.place),severity:text(row.severity),status:text(row.status),order:text(row.order_id)});
  if(tag||row.order_id)addCase('Aviso',row.id,row.order_id,tag,day,[title,details].filter(Boolean).join(' · '));
 }
 const events=[...cases.values()].map(item=>{
  const day=item.dates.sort()[0]||'',description=[...item.descriptions].join(' | ');
  return {id:item.id,tag:item.tag||'Sin TAG',day,description,categories:categoriasDe(description),sources:[...item.sources].join(', ')};
 }).filter(item=>inside(item.day)).sort((a,b)=>b.day.localeCompare(a.day)||compare(a.tag,b.tag));
 const tally=new Map(events.filter(e=>e.tag!=='Sin TAG').map(e=>[e.tag,0]));
 for(const event of events)if(tally.has(event.tag))tally.set(event.tag,tally.get(event.tag)+1);
 const regular=inventory.filter(p=>!p.outside);
 const liquids=new Map();
 for(const {liquid} of regular){
  const id=liquid.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/\s+/g,' ');
  const item=liquids.get(id)||[liquid,0];item[1]++;liquids.set(id,item);
 }
 return {inventory:inventory.map(p=>({...p,failures:tally.get(p.tag)||0})),
  events,reportRows,orderRows,incidentRows,from,until,
  liquids:[...liquids.values()].sort((a,b)=>b[1]-a[1]||compare(a[0],b[0])),
  categories:counts(events.flatMap(e=>e.categories)),
  frequent:counts(events.filter(e=>e.tag!=='Sin TAG').map(e=>e.tag)),
  monthly:counts(events.map(e=>e.day.slice(0,7)||'Sin fecha')).sort((a,b)=>a[0].localeCompare(b[0])),
  parts:counts(reportRows.flatMap(r=>r.parts)),
  tracked:regular.length,outside:inventory.length-regular.length,
  open:orderRows.filter(o=>o.status!=='completada').length,
  late:orderRows.filter(o=>o.status!=='completada'&&o.due&&o.due<today).length,
 };
}

export function plantSheets(s){
 return {
  Resumen:[['Indicador','Valor'],['Desde',s.from||'Todo'],['Hasta',s.until||'Actualidad'],['Bombas en catálogo',s.tracked],['Fuera de lista o sin instalar',s.outside],['Eventos de falla',s.events.length],['Informes',s.reportRows.length],['Órdenes abiertas del período',s.open],['Órdenes vencidas del período',s.late]],
  Bombas:[['TAG','Nombre','Área','Líquido','Modelo registrado','Tamaño','Situación','Eventos de falla'],...s.inventory.map(p=>[p.tag,p.name,p.area,p.liquid,p.model,p.size,p.outside||'En catálogo',p.failures])],
  Líquidos:[['Líquido','Bombas'],...s.liquids],
  'Tipos de falla':[['Categoría','Registros'],...s.categories],
  Frecuencia:[['TAG','Eventos'],...s.frequent,[],['Mes','Eventos'],...s.monthly],
  Fallas:[['Fecha','TAG','Categorías','Descripción','Origen','Referencia'],...s.events.map(e=>[e.day,e.tag,e.categories.join(', '),e.description,e.sources,e.id])],
  Repuestos:[['Repuesto','Veces anotado'],...s.parts],
  Informes:[['Fecha','TAG','Título','Síntomas','Detalle','Repuestos','Responsable','Quedó operativa','Retirada','Orden'],...s.reportRows.map(r=>[r.day,r.tag,r.title,r.symptoms,r.details,r.parts.join(', '),r.author,r.operating,r.removed,r.order])],
  Órdenes:[['Fecha','TAG','Título','Componente','Tipo','Estado','Vence','Asignada a','ID'],...s.orderRows.map(o=>[o.day,o.tag,o.title,o.part,o.type,o.status,o.due,o.assignee,o.id])],
  Avisos:[['Fecha','TAG','Título','Detalle','Lugar','Gravedad','Estado','Orden','ID'],...s.incidentRows.map(i=>[i.day,i.tag,i.title,i.details,i.place,i.severity,i.status,i.order,i.id])],
 };
}
