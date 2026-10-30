import test from 'node:test';import assert from 'node:assert/strict';
import {createWorkflowTransport} from './public/cloud-workflow.js';
test('sin sesión no inventa órdenes y un lector no puede guardar',async()=>{
 const empty=createWorkflowTransport(async()=>null);assert.deepEqual(await empty.orders(),{orders:[],writable:false,cloud:true,connected:false});await assert.rejects(()=>empty.saveOrder({}),/Conectá/);
 const viewer=createWorkflowTransport(async()=>({writable:false,userId:'reader'}));await assert.rejects(()=>viewer.saveOrder({}),/consulta/);
});
test('adjuntos inmutables, reintento verificado y lectura del informe con evidencia',async()=>{
 const files=new Map(),saved=new Map(),calls=[];let writes=0;
 const connection={userId:'user-test',writable:true,client:{
  storage:{from(){return {async upload(path,bytes,options){assert.equal(options.upsert,false);if(files.has(path))return {error:{statusCode:409}};files.set(path,new Blob([bytes],{type:options.contentType}));writes++;return {};},async download(path){return files.has(path)?{data:files.get(path)}:{error:Error('Falta archivo')};}};}},
  async rpc(name,{p_input}){calls.push({name,p_input});if(name==='vocatus_save_work_report'){saved.set(p_input.id,p_input);return {data:{...p_input,source:'supabase'}};}return {data:p_input};},
  from(table){const chain={select(){return chain;},eq(){return chain;},is(){return chain;},order(){return chain;},async range(){return {data:[...saved.values()].map(data=>({data,source_id:data.id,created_at:'2026-10-30T12:00:00Z'}))};}};return chain;}
 }};
 const transport=createWorkflowTransport(async()=>connection),record={id:'local-report-1',tag:'B33',date:'2026-10-30',author:'Prueba',title:'Prueba',text:'Registro aislado',evidence:[{name:'evidencia.jpg',mime:'image/jpeg',base64:'/9j/AA=='}]};
 const first=await transport.saveReport(record);await transport.saveReport(record);assert.equal(writes,1);assert.equal(first.source,'supabase');assert.equal(record.evidence[0].base64,'/9j/AA==');
 assert.match(calls[0].p_input.evidence[0].path,/^reports\/user-test\/[a-f0-9]{64}\/[a-f0-9]{64}\.jpg$/);
 const reports=await transport.reports('B33');assert.equal(reports[0].evidence[0].base64,record.evidence[0].base64);
 const pathname=calls[0].p_input.evidence[0].path;files.set(pathname,new Blob(['contenido diferente']));await assert.rejects(()=>transport.saveReport(record),/otro contenido/);
});
test('lee todas las páginas y evita entregar datos de una cuenta que cambió',async()=>{
 let page=0;const connection={userId:'one',writable:true,client:{from(){const q={select(){return q;},order(){return q;},async range(){page++;return {data:Array.from({length:page===1?200:1},(_,i)=>({data:{id:page+'-'+i}}))};}};return q;}}};
 const transport=createWorkflowTransport(async()=>connection);const r=await transport.orders();assert.equal(r.orders.length,201);assert.equal(page,2);
 let calls=0;const changed=createWorkflowTransport(async()=>({...connection,userId:++calls<3?'one':'two'}));page=0;await assert.rejects(()=>changed.orders(),/cuenta cambió/);
});
