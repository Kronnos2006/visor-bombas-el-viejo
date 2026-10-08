import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {unlink} from 'node:fs/promises';
process.env.VOCATUS_DEMO='1';
const {handler,readPump,safeVaultFile}=await import('./server.mjs');
async function request(url,body,token){const req=Readable.from(body?[Buffer.from(JSON.stringify(body))]:[]);req.method=body?'POST':'GET';req.url=url;req.headers={host:'127.0.0.1:8766','x-local-token':token||''};const res={writeHead(s){this.status=s;},end(b){this.data=JSON.parse(b);}};await handler(req,res);return res;}
const boot=await request('/api/bootstrap');assert.equal(boot.status,200);assert.equal(boot.data.demo,true);assert.deepEqual(boot.data.pumps.map(p=>p.tag),['P-9001','P-9002']);assert.equal(boot.data.errors.length,0);
const stale=await request('/api/pump?tag=P-1463');assert.equal(stale.status,409);assert.equal(stale.data.code,'PUMP_NOT_AVAILABLE');assert.ok(!stale.data.error.includes('ENOENT'));
const p=await readPump('P-9002');assert.equal(p.data.demostracion,true);assert.match(p.history,/ficticia/);assert.ok(p.files[0].exists);
const saved=await request('/api/maintenance',{tag:'P-9001',date:'2026-10-06',title:'PRUEBA AUTOMÁTICA TEMPORAL',author:'Prueba de software',details:'Verificación de persistencia; se elimina al terminar.'},boot.data.token);assert.equal(saved.status,201);
try{const pump=await readPump('P-9001');const report=pump.reports.find(r=>r.file===saved.data.file);assert.ok(report);assert.match(report.text,/demostracion: true/);assert.match(report.text,/PRUEBA AUTOMÁTICA TEMPORAL/);}finally{await unlink(safeVaultFile(saved.data.file));}
console.log('OK: dos bombas demo, documento vinculado y creación/lectura de informe aislado. Registro temporal eliminado.');
