import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {Readable} from 'node:stream';
import {workOrderStore} from './work-orders.mjs';
import {fieldReportPackage,parseFieldReportPackage} from './public/field-report-core.js';
const root=await mkdtemp(path.join(tmpdir(),'vocatus-planificacion-'));
process.env.OBSIDIAN_VAULT=root;
for(const key of ['VERCEL','VOCATUS_DEMO','VOCATUS_CLOUD_DEV','CODESPACES'])delete process.env[key];
await mkdir(path.join(root,'00-Proyecto/equipos'),{recursive:true});await mkdir(path.join(root,'00-Proyecto/bombas'),{recursive:true});
for(const tag of ['B33','B36'])await writeFile(path.join(root,'00-Proyecto/equipos',tag+'.md'),'---\nid: '+tag+'\nubicacion: Equipo de prueba\n---\n# Equipo');
const {handler}=await import('./server.mjs');
async function request(url,{method='GET',body,token='',origin}={}){const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);req.url=url;req.method=method;req.headers={host:'127.0.0.1:8878','x-local-token':token,...(origin?{origin}:{})};const res={writeHead(status){this.status=status;},end(raw){try{this.data=JSON.parse(raw);}catch{this.raw=raw;}}};await handler(req,res);return res;}
test.after(async()=>{assert.ok(root.startsWith(path.join(tmpdir(),'vocatus-planificacion-')));await rm(root,{recursive:true,force:true});});
const base={tag:'B33',title:'Prueba aislada',assignee:'Verificación',due:'2026-10-30',type:'inspeccion',priority:'media'};
test('órdenes validan fechas, guardan concurrencia y rechazan sobrescritura obsoleta',async()=>{
 const store=workOrderStore(root);const [one,two]=await Promise.all([store.save(base),store.save({...base,tag:'B36'})]);
 assert.equal((await store.list()).length,2);const updated=await store.save({...one,status:'en-curso'});assert.equal(updated.version,2);
 await assert.rejects(()=>store.save({...one,title:'Cambio antiguo'}),/otra ventana/);
 await assert.rejects(()=>store.save({...updated,tag:'B36'}),/otro equipo/);
 await assert.rejects(()=>store.save({...base,due:'2026-02-30'}),/Fecha/);
 await assert.rejects(()=>store.save({...updated,status:'completada'}),/informe/);
 assert.equal((await workOrderStore(root).list()).find(o=>o.id===two.id).tag,'B36');
});
test('API conserva vínculo orden → informe, cierre idempotente y control de acceso',async()=>{
 const boot=await request('/api/bootstrap'),token=boot.data.token;
 assert.equal((await request('/api/work-orders',{method:'POST',body:base})).status,403);
 assert.equal((await request('/api/work-orders',{method:'POST',body:base,token,origin:'https://otro.example'})).status,403);
 const created=await request('/api/work-orders',{method:'POST',body:base,token});assert.equal(created.status,201);const order=created.data.order;
 const body={tag:'B33',sourceId:'prueba-orden-aislada',date:'2026-10-30',title:'Inspección realizada',author:'Verificación',details:'Se documenta el trabajo de prueba.',operativo:'si',workOrderId:order.id};
 assert.equal((await request('/api/maintenance',{method:'POST',body:{...body,tag:'B36'},token})).status,400);
 const saved=await request('/api/maintenance',{method:'POST',body,token});assert.equal(saved.status,201);assert.equal(saved.data.report.workOrderId,order.id);
 const closed=(await request('/api/work-orders')).data.orders.find(o=>o.id===order.id);assert.equal(closed.status,'completada');assert.equal(closed.reportId,saved.data.report.id);
 assert.equal((await request('/api/maintenance',{method:'POST',body,token})).status,201);
 const duplicate=await request('/api/maintenance',{method:'POST',body:{...body,sourceId:'otro-informe'},token});assert.equal(duplicate.status,400);
 assert.equal((await request('/api/reports?tag=B33')).data.reports.filter(r=>r.workOrderId===order.id).length,1);
 const second=(await request('/api/work-orders',{method:'POST',body:base,token})).data.order;assert.equal((await request('/api/maintenance',{method:'POST',body:{...body,workOrderId:second.id},token})).status,400);assert.equal((await request('/api/work-orders')).data.orders.find(o=>o.id===second.id).status,'pendiente');
});
test('paquetes del teléfono preservan orden y siguen aceptando informes sin orden',()=>{
 const report={id:'prueba-portatil',tag:'B33',date:'2026-10-30',author:'Verificación',title:'Inspección',symptoms:'Revisión',text:'Trabajo realizado',parts:'',operativo:'si',retirado:false};
 assert.equal(parseFieldReportPackage(JSON.stringify(fieldReportPackage([report])))[0].workOrderId,undefined);
 const id='12345678-1234-1234-1234-123456789abc';assert.equal(parseFieldReportPackage(JSON.stringify(fieldReportPackage([{...report,workOrderId:id}])))[0].workOrderId,id);
 assert.throws(()=>fieldReportPackage([{...report,workOrderId:'../../otro'}]),/Orden/);
});
