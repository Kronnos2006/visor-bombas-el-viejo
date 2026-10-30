import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {validCalendarDate} from './public/verification-core.js';

export function workOrderStore(vault){
 const directory=path.join(vault,'00-Proyecto','Ordenes'),file=path.join(directory,'ordenes.json');
 let queue=Promise.resolve();
 async function list(){try{const data=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(data))throw Error('El archivo de órdenes no es válido.');return data;}catch(e){if(e.code==='ENOENT')return [];throw e;}}
 function transaction(update){
  const operation=queue.then(async()=>{const orders=await list(),result=await update(orders);await mkdir(directory,{recursive:true});const temporary=file+'.'+randomUUID()+'.tmp';await writeFile(temporary,JSON.stringify(orders,null,2),'utf8');await rename(temporary,file);return result;});
  queue=operation.catch(()=>{});return operation;
 }
 async function save(input){return transaction(orders=>{
  const existing=input.id?orders.find(o=>o.id===input.id):null;
  if(input.id&&!existing)throw Error('Orden no encontrada.');
  if(existing&&existing.tag!==input.tag)throw Error('La orden pertenece a otro equipo.');
  if(existing?.status==='completada')throw Error('La orden está completada; su registro se conserva.');
  if(existing&&input.version!==existing.version)throw Error('La orden cambió en otra ventana. Actualizá antes de editar.');
  if(!/^(?:B[1-9]\d{0,3}|P-\d{4}[A-Z]?)$/.test(input.tag||''))throw Error('Equipo inválido.');
  const text=(key,max,required=false)=>{const v=String(input[key]??existing?.[key]??'').trim();if(v.length>max||required&&!v)throw Error('Revisá el campo '+key+'.');return v;};
  const title=text('title',200,true),assignee=text('assignee',100,true),details=text('details',3000),due=text('due',10,true),priority=text('priority',10)||'media',type=text('type',20)||'inspeccion',component=text('component',100);
  if(!validCalendarDate(due))throw Error('Fecha programada inválida.');
  if(!['alta','media','baja'].includes(priority)||!['preventivo','correctivo','inspeccion'].includes(type))throw Error('Prioridad o tipo inválido.');
  const status=input.status||existing?.status||'pendiente';
  if(!['pendiente','en-curso'].includes(status)||existing?.status==='en-curso'&&status==='pendiente')throw Error('La orden solo se completa con un informe de trabajo.');
  const now=new Date().toISOString(),id=existing?.id||randomUUID();
  const event={at:now,type:existing?(existing.status!==status?'iniciada':'editada'):'creada',by:assignee};
  const result={id,code:existing?.code||'OT-'+due.replaceAll('-','')+'-'+id.slice(0,6).toUpperCase(),tag:input.tag,title,assignee,details,due,priority,type,component,status,version:(existing?.version||0)+1,created:existing?.created||now,updated:now,events:[...(existing?.events||[]),event]};
  if(existing)orders[orders.indexOf(existing)]=result;else orders.push(result);return result;
 });}
 async function find(id,tag){const order=(await list()).find(o=>o.id===id);if(!order||order.tag!==tag)throw Error('La orden no corresponde a este equipo.');return order;}
 async function complete(id,tag,report){return transaction(orders=>{const order=orders.find(o=>o.id===id&&o.tag===tag);if(!order)throw Error('Orden no encontrada para este equipo.');if(order.status==='completada'){if(order.reportId!==report.id)throw Error('La orden ya tiene un informe de cierre.');return order;}const now=new Date().toISOString();Object.assign(order,{status:'completada',reportId:report.id,reportDate:report.date,updated:now,version:order.version+1});order.events.push({at:now,type:'completada',by:report.author,reportId:report.id});return order;});}
 return {list,save,find,complete};
}
