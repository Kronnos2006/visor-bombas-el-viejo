// Levantamiento de campo, avance y solicitud a bodega. Usa una bóveda temporal: nunca toca fichas reales.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { passwordOk } from './password.mjs';
import { normalizeRequest } from './parts-request.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const vault = await mkdtemp(path.join(root, '.test-vault-'));
process.env.OBSIDIAN_VAULT = vault;
delete process.env.VOCATUS_DEMO; delete process.env.VOCATUS_CLOUD_DEV; delete process.env.CODESPACES; delete process.env.VERCEL;
await mkdir(path.join(vault, '00-Proyecto/bombas'), {recursive: true});
await mkdir(path.join(vault, '00-Proyecto/equipos'), {recursive: true});
const fichaP = path.join(vault, '00-Proyecto/bombas/P-1311.md');
await writeFile(fichaP, '---\ntipo: bomba\ntag: P-1311\narea: Fermentación\nservicio: "Recirculación"\n\nmarca: "Hidromac"\nmodelo: ""\nserie: ""\ntipo_sellado: ""\nsello_modelo: ""\nsello_diametro_mm: ""\nsello_elastomero: ""\n\norings: []\n\ncodigo_bodega: ""\nfotos: []\nverificado_por: ""\nfecha_verificacion: ""\n---\n\n# P-1311\n\n## Historial de intervenciones\nSin registros.\n');
await writeFile(path.join(vault, '00-Proyecto/equipos/B33.md'), '---\ntipo: equipo\nid: B33\n\n# PROCEDENCIA\nasociacion_placa: sin_asociar\nplaca_serie: ""\nplaca_nota: ""\nubicacion: "Alimentación"\nmarca: "HIDROMAC"\nmodelo: "2196"\ntipo_sellado: "sello mecanico"\nsello_tipo: "Tipo 1"\nsello_eje_pulg: "1.3/8"\nsello_elastomero: ""\norings: []\n---\n# B33\n');
const {handler} = await import('./server.mjs');
async function request(url, {method = 'GET', body, token} = {}) {
 const req = Readable.from(body ? [Buffer.from(JSON.stringify(body))] : []);
 req.method = method; req.url = url; req.headers = {host: '127.0.0.1:8766', 'x-local-token': token || ''};
 const res = {writeHead(s, h) { this.status = s; this.headers = h; }, end(raw) { this.raw = raw; }};
 await handler(req, res); let data; try { data = JSON.parse(res.raw); } catch {} return {...res, data};
}
test.after(async () => { assert.ok(vault.startsWith(path.join(root, '.test-vault-'))); await rm(vault, {recursive: true, force: true}); });

test('el avance marca lo que falta en cada ficha', async () => {
 const r = await request('/api/progress'); assert.equal(r.status, 200);
 const p = r.data.rows.find(x => x.tag === 'P-1311'), b = r.data.rows.find(x => x.tag === 'B33');
 assert.equal(p.checks.placa, false); assert.equal(p.checks.sello, false); assert.equal(p.done, 0);
 assert.equal(b.checks.empaque, null, 'con sello mecánico el empaque no aplica');
 assert.ok(r.data.token && r.data.writable);
});
test('el levantamiento escribe la ficha sin borrar datos y sin token se rechaza', async () => {
 const {data: {token}} = await request('/api/progress');
 const jpg = Buffer.concat([Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]), Buffer.from('foto de prueba')]).toString('base64');
 const body = {tag: 'P-1311', date: '2026-10-12', author: 'Técnico de prueba', fields: {modelo: '2196', serie: '210771-1', marca: '', tipo_sellado: 'sello mecanico', sello_tipo: 'Tipo 21', sello_diametro: '35', sello_elastomero: 'Viton', sello_codigo: 'SM-35'}, orings: [{posicion: 'tapa', medida: '45 x 3 mm', material: 'Viton', cantidad: '2'}, {posicion: 'vacío'}], photos: [{name: 'placa.jpg', base64: jpg}], observations: 'Placa legible: "ok"\nSegunda línea'};
 assert.equal((await request('/api/survey', {method: 'POST', body})).status, 403);
 const r = await request('/api/survey', {method: 'POST', token, body}); assert.equal(r.status, 201, JSON.stringify(r.data));
 const text = await readFile(fichaP, 'utf8');
 assert.match(text, /^marca: "Hidromac"$/m, 'un campo vacío no borra el dato');
 assert.match(text, /^modelo: "2196"$/m); assert.match(text, /^sello_diametro_mm: 35$/m); assert.match(text, /^sello_codigo: "SM-35"$/m);
 assert.match(text, /^verificado_por: "Técnico de prueba"$/m);
 assert.match(text, /## Levantamiento de campo\n- 2026-10-12 · Técnico de prueba/);
 const pump = (await request('/api/pump?tag=P-1311')).data;
 assert.equal(pump.data.orings.length, 1); assert.equal(pump.data.orings[0].cantidad, 2); assert.equal(pump.data.fotos.length, 1);
 assert.equal((await readdir(path.join(vault, '00-Proyecto/fotos-campo/P-1311'))).length, 1);
 assert.equal(r.data.progress.checks.placa, true); assert.equal(r.data.progress.checks.sello, true); assert.equal(r.data.progress.checks.verificado, true);
 // segundo levantamiento: los o-rings se agregan, el resto de la ficha se conserva
 const again = await request('/api/survey', {method: 'POST', token, body: {tag: 'P-1311', date: '2026-10-13', author: 'Otro', orings: [{medida: '30 x 2 mm'}]}});
 assert.equal(again.status, 201); assert.equal((await request('/api/pump?tag=P-1311')).data.data.orings.length, 2);
 assert.match(await readFile(fichaP, 'utf8'), /## Levantamiento de campo\n- 2026-10-13 · Otro: 1 o-ring\(s\)\n- 2026-10-12/);
});
test('el levantamiento de un Bxx del sector asocia la placa y valida entradas', async () => {
 const {data: {token}} = await request('/api/progress');
 const r = await request('/api/survey', {method: 'POST', token, body: {tag: 'B33', date: '2026-10-12', author: 'K', fields: {serie: '220105-1', sello_diametro: '1.3/8'}}});
 assert.equal(r.status, 201); const text = await readFile(path.join(vault, '00-Proyecto/equipos/B33.md'), 'utf8');
 assert.match(text, /^placa_serie: "220105-1"$/m); assert.match(text, /^asociacion_placa: confirmada_en_campo$/m); assert.match(text, /^# PROCEDENCIA$/m, 'conserva los comentarios');
 assert.equal((await request('/api/survey', {method: 'POST', token, body: {tag: 'B33', date: '2026-10-12', author: 'K'}})).status, 400, 'sin datos nuevos');
 assert.equal((await request('/api/survey', {method: 'POST', token, body: {tag: '../x', date: '2026-10-12', author: 'K', fields: {marca: 'x'}}})).status, 400);
 assert.equal((await request('/api/survey', {method: 'POST', token, body: {tag: 'P-9999', date: '2026-10-12', author: 'K', fields: {marca: 'x'}}})).status, 409);
 assert.equal((await request('/api/survey', {method: 'POST', token, body: {tag: 'B33', date: '2026-10-12', author: 'K', photos: [{base64: Buffer.from('<svg/>').toString('base64')}]}})).status, 400, 'solo JPG o PNG');
});
test('la solicitud a bodega genera un PDF y exige datos', async () => {
 const {data: {token}} = await request('/api/progress');
 const pdf = await request('/api/parts-request', {method: 'POST', token, body: {solicitante: 'Kensy', fecha: '2026-10-12', items: [{tag: 'B33', pieza: 'Sello mecánico', detalle: 'Tipo 1 — eje 1.3/8"', cantidad: 1}, {tag: 'B33', pieza: 'O-ring', codigo: 'OR-45', cantidad: 2}]}});
 assert.equal(pdf.status, 200); assert.ok(Buffer.from(pdf.raw).subarray(0, 5).toString() === '%PDF-');
 assert.equal((await request('/api/parts-request', {method: 'POST', token, body: {solicitante: 'K', items: []}})).status, 400);
 assert.equal((await request('/api/parts-request', {method: 'POST', body: {solicitante: 'K', items: [{pieza: 'x'}]}})).status, 403);
 assert.equal(normalizeRequest({solicitante: 'K', items: [{pieza: 'x', cantidad: '5000'}]}).items[0].cantidad, 999);
});
test('la contraseña de Vercel solo se exige si está configurada', () => {
 const basic = p => 'Basic ' + btoa('cualquiera:' + p);
 assert.equal(passwordOk('', ''), true); assert.equal(passwordOk(undefined, undefined), true);
 assert.equal(passwordOk('', 'clave'), false); assert.equal(passwordOk(basic('otra'), 'clave'), false);
 assert.equal(passwordOk(basic('clave'), 'clave'), true); assert.equal(passwordOk(basic('cla:ve'), 'cla:ve'), true);
 assert.equal(passwordOk('Basic %%%', 'clave'), false);
});
