import test from 'node:test';
import assert from 'node:assert/strict';
import {configureReports, reportsInObsidian, addReport, listReports, deleteReport} from './public/reportes.js';

test('cliente guarda B33 y su PDF en Obsidian y usa el token de la sesión',async t=>{
 configureReports({writable:true,token:'sesion-de-prueba'});assert.equal(reportsInObsidian(),true);
 const requests=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  requests.push({url,options});return new Response(JSON.stringify({report:{id:'B33_informe.md',tag:'B33',source:'obsidian'}}),{status:201});
 });
 const saved=await addReport({tag:'B33',date:'2026-10-11',title:'Revisión',author:'Técnico',text:'Sin mediciones.',file:new File(['%PDF-1.4\nPRUEBA'],'informe.pdf',{type:'application/pdf'})});
 assert.equal(saved.source,'obsidian');assert.equal(requests.length,1);
 const body=JSON.parse(requests[0].options.body);
 assert.equal(body.tag,'B33');assert.equal(body.author,'Técnico');assert.equal(body.details,'Sin mediciones.');assert.equal(body.attachment.name,'informe.pdf');assert.ok(Buffer.from(body.attachment.base64,'base64').toString().startsWith('%PDF-'));
 assert.equal(requests[0].options.headers['X-Local-Token'],'sesion-de-prueba');
});
test('fallo del servidor se informa y no se convierte en un guardado local',async t=>{
 configureReports({writable:true,token:'sesion-de-prueba'});
 t.mock.method(globalThis,'fetch',async()=>new Response(JSON.stringify({error:'No se pudo escribir la bóveda.'}),{status:400}));
 await assert.rejects(addReport({tag:'B33',date:'2026-10-11',title:'Revisión',author:'Técnico',text:'Prueba'}),/No se pudo escribir/);
 await assert.rejects(listReports('B33'),/No se pudo escribir/);
});
test('eliminar un informe de Obsidian usa DELETE con su equipo e identificador',async t=>{
 configureReports({writable:true,token:'sesion-de-prueba'});
 let request;
 t.mock.method(globalThis,'fetch',async(url,options)=>{request=options;return new Response(JSON.stringify({removed:true}));});
 await deleteReport({source:'obsidian',tag:'B33',id:'B33_informe.md'});
 assert.equal(request.method,'DELETE');assert.deepEqual(JSON.parse(request.body),{tag:'B33',id:'B33_informe.md'});
});


test('almacenamiento bloqueado conserva una apertura y permite recuperar informes al liberarse',async t=>{
 const previousWindow=globalThis.window,previousIDB=globalThis.indexedDB,previousDocument=globalThis.document;
 t.after(()=>{if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;if(previousIDB===undefined)delete globalThis.indexedDB;else globalThis.indexedDB=previousIDB;if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;});
 let opens=0,recovered=0,request;
 globalThis.document=new EventTarget();globalThis.document.addEventListener('vocatus:storage-ready',()=>recovered++);
 globalThis.window={indexedDB:true};
 globalThis.indexedDB={open(){opens++;request={};return request;}};
 const client=await import('./public/reportes.js?blocked-regression');
 const first=client.listReports('B4');request.onblocked();
 await assert.rejects(client.listReports('B4'),/Cerrá las otras pestañas/);
 await assert.rejects(first,/Cerrá las otras pestañas/);
 const saved={id:'anterior',tag:'B4',title:'Informe conservado',date:'2026-10-28',created:1};
 request.result={transaction(){const tx={objectStore(){return{index(){return{getAll(){queueMicrotask(()=>tx.oncomplete());return{result:[saved]};}};}};}};return tx;},close(){}};
 request.onsuccess();
 assert.equal(opens,1);assert.equal(recovered,1);assert.deepEqual((await client.listReports('B4')).map(x=>x.id),['anterior']);
});
