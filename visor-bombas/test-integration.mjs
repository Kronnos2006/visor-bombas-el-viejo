import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { maintenanceStore } from './maintenance.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const vault = await mkdtemp(path.join(root, '.test-vault-'));
process.env.OBSIDIAN_VAULT = vault;
delete process.env.VOCATUS_DEMO; delete process.env.VOCATUS_CLOUD_DEV; delete process.env.CODESPACES; delete process.env.VERCEL;
await mkdir(path.join(vault, '00-Proyecto/equipos'), {recursive: true});
await mkdir(path.join(vault, '00-Proyecto/bombas'), {recursive: true});
const ficha = path.join(vault, '00-Proyecto/equipos/B33.md');
await writeFile(ficha, '---\ntipo: equipo\nid: B33\nubicacion: Prueba\nmarca: Fabricante de prueba\nmodelo: Modelo documentado\nsello_tipo: ""\ncaudal_gpm: "8"\norings: []\n---\n# B33\n');
const {handler, readPump, parseNote} = await import('./server.mjs');
async function request(url, {method='GET', body, token, origin}={}) {
 const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);
 req.method=method; req.url=url; req.headers={host:'127.0.0.1:8766','x-local-token':token||'',...(origin?{origin}:{})};
 const res={writeHead(s,h){this.status=s;this.headers=h},end(raw){this.raw=raw}};
 await handler(req,res);let data;try{data=JSON.parse(res.raw)}catch{}return {...res,data};
}
test.after(async()=>{
 assert.ok(vault.startsWith(path.join(root,'.test-vault-')));
 await rm(vault,{recursive:true,force:true});
});
test('B33 lee datos actuales de Obsidian y conserva los campos vacíos',async()=>{
 const pump=await readPump('B33');assert.equal(pump.data.marca,'Fabricante de prueba');assert.equal(pump.data.seal.tipo,'Por confirmar');assert.deepEqual(pump.data.orings,[]);assert.deepEqual(pump.data.history,[]);
 await writeFile(ficha,(await readFile(ficha,'utf8')).replace('Modelo documentado','Cambio en Obsidian'));
 assert.equal((await request('/api/pump?tag=B33')).data.data.modelo,'Cambio en Obsidian');
 assert.equal((await request('/api/pump?tag=../../privado')).status,400);
 assert.equal((await request('/api/pump?tag=B999')).status,400);
});
test('B33 persiste informe y PDF, permite releerlos y elimina a papelera',async()=>{
 const bootstrap=await request('/api/bootstrap');const token=bootstrap.data.token;
 assert.equal(bootstrap.data.maintenanceWritable,true);assert.equal(bootstrap.data.sectorPumps.length,1);
 const body={tag:'B33',date:'2026-10-11',title:'Inspección "sello" # campo',author:'Técnico de prueba',details:'Presión: 2.1 bar\nNo se inventaron caudales.',sourceId:'importacion-unica',attachment:{name:'informe.pdf',base64:Buffer.from('%PDF-1.4\nPRUEBA').toString('base64')}};
 assert.equal((await request('/api/maintenance',{method:'POST',body})).status,403);
 assert.equal((await request('/api/maintenance',{method:'POST',token,body,origin:'https://malicious.example'})).status,403);
 assert.equal((await request('/api/maintenance',{method:'POST',token,body:{...body,date:'2026-02-30'}})).status,400);
 assert.equal((await request('/api/maintenance',{method:'POST',token,body:{...body,attachment:{name:'fake.pdf',base64:Buffer.from('no pdf').toString('base64')}}})).status,400);
 const saved=await request('/api/maintenance',{method:'POST',token,body});assert.equal(saved.status,201);
 const doc=parseNote(await readFile(path.join(vault,saved.data.file),'utf8'));
 assert.equal(doc.data.tag,'B33');assert.equal(doc.data.bomba,'B33');assert.equal(doc.data.responsable,body.author);assert.equal(doc.data.demostracion,false);assert.equal(doc.data.titulo,body.title);
 const reports=(await request('/api/reports?tag=B33')).data.reports;assert.equal(reports.length,1);assert.equal(reports[0].text,body.details);
 const retry=await request('/api/maintenance',{method:'POST',token,body});assert.equal(retry.data.report.id,reports[0].id);assert.equal((await request('/api/reports?tag=B33')).data.reports.length,1);
 const pdf=await request(reports[0].pdf.url);assert.equal(pdf.status,200);assert.ok(pdf.raw.toString().startsWith('%PDF-'));
 assert.equal((await request('/api/report-document?tag=B33&id=../../privado')).status,400);
 assert.equal((await request('/api/maintenance',{method:'DELETE',token,body:{tag:'B33',id:reports[0].id}})).status,200);
 assert.deepEqual((await request('/api/reports?tag=B33')).data.reports,[]);
 assert.equal((await readdir(path.join(vault,'.trash/Mantenimiento'))).length,1);
});
test('los informes de demostración quedan explícitamente marcados',async()=>{
 const store=maintenanceStore(vault,true);
 const report=await store.save('B33',{date:'2026-10-11',title:'Prueba DEMO',author:'Prueba',details:'No es intervención real.'});
 assert.equal(report.demonstration,true);
});
