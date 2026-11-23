import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNote, readPump, safeVaultFile, section } from './server.mjs';
import { handler } from './server.mjs';
import { Readable } from 'node:stream';
async function request(url,{method='GET',body,token,host='127.0.0.1:8766'}={}){
 const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);req.url=url;req.method=method;req.headers={host,'x-local-token':token||''};
 const res={writeHead(status,headers){this.status=status;this.headers=headers;},end(raw){this.raw=raw;}};await handler(req,res);
 let data=null;try{data=JSON.parse(res.raw);}catch{}
 return {status:res.status,data,raw:res.raw,headers:res.headers};
}
test('interpreta listas de o-rings sin ejecutar etiquetas YAML',()=>{
 const note=parseNote('---\ntag: P-1401\nsello_diametro_mm: ""\norings:\n  - posicion: tapa\n    medida: 45 x 3 mm\n    cantidad: 1\n---\n## Historial de intervenciones\nSin registros.');
 assert.equal(note.data.orings[0].cantidad,1);assert.equal(note.data.sello_diametro_mm,'');
 assert.throws(()=>parseNote('---\nx: !!js/function function(){}\n---\n'));
});
test('separa historial del ejemplo de sellado',()=>{
 const body='## Sellado — resumen rápido\nEjemplo ficticio 35 mm\n## Historial de intervenciones\nSin registros\n## Observaciones\nOtra sección';
 assert.equal(section(body,'Historial de intervenciones'),'Sin registros');
});
test('rechaza rutas fuera de la bóveda y TAG malicioso',async()=>{
 assert.throws(()=>safeVaultFile('../privado.txt'));assert.throws(()=>safeVaultFile('C:/Windows/win.ini'));await assert.rejects(readPump('../archivo'));
});
test('lee la ficha real sin convertir un ejemplo en un dato',async()=>{
 const p=await readPump('P-1401');assert.equal(p.tag,'P-1401');assert.equal(p.data.sello_diametro_mm,'');assert.deepEqual(p.data.orings,[]);assert.ok(!p.history.includes('35 mm'));
});
test('carga las 15 fichas y bloquea mutaciones sin token',async()=>{
 const boot=await request('/api/bootstrap');assert.equal(boot.status,200);assert.equal(boot.data.pumps.length,15);assert.deepEqual(boot.data.errors,[]);
 const refused=await request('/api/config',{method:'POST',body:{apiKey:'fake'}});assert.equal(refused.status,403);
 const badReport=await request('/api/maintenance',{method:'POST',token:boot.data.token,body:{tag:'P-1401'}});assert.equal(badReport.status,400);
 const badHost=await request('/api/bootstrap',{host:'malicious.example'});assert.equal(badHost.status,403);
 if(!boot.data.geminiConfigured){const missingKey=await request('/api/ask',{method:'POST',token:boot.data.token,body:{tag:'P-1401',question:'¿Qué sello usa?'}});assert.equal(missingKey.status,409);}
});
test('genera resumen en PDF para bombas del sector y de la bóveda',async()=>{
 const pdfB33=await request('/api/pump-summary-pdf?tag=B33');
 assert.equal(pdfB33.status,200);
 assert.ok(pdfB33.raw.toString().startsWith('%PDF-'));

 const pdfP1401=await request('/api/pump-summary-pdf?tag=P-1401');
 assert.equal(pdfP1401.status,200);
 assert.ok(pdfP1401.raw.toString().startsWith('%PDF-'));
});

test('Gemini reintenta una saturación temporal y conserva los errores de credenciales',async t=>{
 const boot=await request('/api/bootstrap');
 const config=apiKey=>request('/api/config',{method:'POST',token:boot.data.token,body:{apiKey}});
 const configured=await config('clave-ficticia-para-prueba');
 assert.equal(configured.status,200);
 t.after(()=>config(process.env.GEMINI_API_KEY||''));
 const ask=()=>request('/api/ask',{method:'POST',token:boot.data.token,body:{tag:'P-1401',question:'Prueba sintética'}});
 let calls=0,statuses=[503,200];
 t.mock.method(globalThis,'fetch',async url=>{
  assert.match(url,/^https:\/\/generativelanguage\.googleapis\.com\//);
  const status=statuses[calls++];
  assert.ok(status,'se hizo un reintento adicional');
  return Response.json(status===200?{candidates:[{content:{parts:[{text:'OK'}]}}]}:{error:{code:status}},{status});
 });
 const recovered=await ask();
 assert.equal(recovered.status,200);
 assert.equal(recovered.data.answer,'OK');
 assert.equal(calls,2);
 statuses=[503,503];calls=0;
 const busy=await ask();
 assert.equal(busy.status,503);
 assert.equal(calls,2);
 statuses=[403];calls=0;
 assert.equal((await ask()).status,502);
 assert.equal(calls,1);
});
