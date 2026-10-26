// Regresiones de la auditoría de la integración d41e5c8:
//  1. cambiar un dato invalida exactamente las verificaciones que ese campo declara;
//  2. Avance cuenta las fotos por categoría (placa de la bomba + foto de la bomba);
//  3. un fallo al sustituir una foto deja vigente la anterior.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, readFile, writeFile, readdir, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {surveyStore, splitNote, FIELDS} from './survey.mjs';
import {pumpPhotoStore} from './pump-photos.mjs';
import {verificationOf, VERIFICATION_SCOPES} from './public/verification-core.js';

const SCOPES = Object.keys(VERIFICATION_SCOPES);
const input = extra => ({date: '2026-10-26', author: 'Persona de prueba', ...extra});
const JPG = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 1, 2, 3, 4]), JPG2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 9, 9, 9, 9]);
const PNG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 5, 5]);
const b64 = b => b.toString('base64');

async function vaultWith(t, tag, extra = '') {
 const vault = await mkdtemp(path.join(os.tmpdir(), 'regresion-vocatus-'));
 t.after(() => rm(vault, {recursive: true, force: true}));
 const file = path.join(vault, '00-Proyecto', tag.startsWith('B') ? 'equipos' : 'bombas', tag + '.md');
 await mkdir(path.dirname(file), {recursive: true});
 await writeFile(file, `---\nid: ${tag}\norings: []\nfotos: []\n${extra}---\n# ${tag}\n`);
 return {vault, file, note: async () => splitNote(await readFile(file, 'utf8')).data};
}
const allVerified = {verification: {scopes: SCOPES, evidence: 'Evidencia inicial de prueba'}};
// Valor válido y distinto de vacío para cualquier campo del formulario.
const valueFor = f => f.options ? f.options[0] : (f.number || f.unit) ? '7' : 'VALOR-NUEVO';

// ---------- 1. Vigencia de las verificaciones ----------
test('cada campo declara explícitamente qué verificaciones invalida', () => {
 const sinDeclarar = FIELDS.filter(f => !Array.isArray(f.invalida) || !f.invalida.length || f.invalida.some(s => !SCOPES.includes(s)));
 assert.deepEqual(sinDeclarar.map(f => f.id), [], 'Campos sin declaración válida de invalidación');
});

test('cambiar cualquier campo invalida exactamente las verificaciones que declara', async t => {
 for (const tag of ['B32', 'P-1401']) for (const f of FIELDS) {
  if (!f[tag.startsWith('B') ? 'B' : 'P']) continue;
  const v = await vaultWith(t, tag), store = surveyStore(v.vault);
  await store.save(tag, input(allVerified));
  await store.save(tag, input({fields: {[f.id]: valueFor(f)}}));
  const scopes = verificationOf(await v.note()).scopes;
  for (const s of SCOPES) assert.equal(scopes[s].verified, !(f.invalida || []).includes(s), `${tag} · ${f.id} · ${s}`);
 }
});

test('caudal de 8 a 11 GPM deja la placa sin verificar', async t => {
 const v = await vaultWith(t, 'B32', 'caudal_gpm: 8\n'), store = surveyStore(v.vault);
 await store.save('B32', input(allVerified));
 await store.save('B32', input({fields: {caudal: '11'}}));
 const ver = verificationOf(await v.note());
 assert.equal(ver.scopes.placa.verified, false); assert.equal(ver.verified, false);
});

test('una verificación invalidada solo vuelve con selección explícita y evidencia nueva', async t => {
 const v = await vaultWith(t, 'B32'), store = surveyStore(v.vault);
 await store.save('B32', input(allVerified));
 await store.save('B32', input({fields: {caudal: '11'}}));
 await store.save('B32', input({observations: 'Revisión sin verificar'}));
 assert.equal(verificationOf(await v.note()).scopes.placa.verified, false, 'una observación no la revalida');
 await assert.rejects(store.save('B32', input({verification: {scopes: ['placa']}})), /evidencia/);
 await store.save('B32', input({verification: {scopes: ['placa'], evidence: 'Placa leída de nuevo tras el cambio de caudal'}}));
 const d = await v.note();
 assert.equal(verificationOf(d).scopes.placa.verified, true);
 assert.equal(d.verificaciones_campo.placa.evidence, 'Placa leída de nuevo tras el cambio de caudal');
});

// ---------- 2. Fotos en Avance ----------
const rowOf = async (vault, tag) => (await surveyStore(vault).progress()).rows.find(r => r.tag === tag);

test('Avance completa Fotos solo con placa de la bomba y foto de la bomba del editor', async t => {
 const v = await vaultWith(t, 'B32'), photos = pumpPhotoStore(v.vault);
 assert.equal((await rowOf(v.vault, 'B32')).checks.fotos, false);
 await photos.save('B32', 'placa1', b64(JPG));
 assert.equal((await rowOf(v.vault, 'B32')).checks.fotos, false, 'falta la foto de la bomba');
 await photos.save('B32', 'motor', b64(JPG)); await photos.save('B32', 'sello', b64(JPG));
 assert.equal((await rowOf(v.vault, 'B32')).checks.fotos, false, 'otras categorías no reemplazan a la foto de la bomba');
 await photos.save('B32', 'bomba', b64(JPG));
 const row = await rowOf(v.vault, 'B32');
 assert.equal(row.checks.fotos, true);
 assert.deepEqual({placa1: row.fotos.placa1, bomba: row.fotos.bomba}, {placa1: true, bomba: true});
 assert.equal(row.checks.verificado, false, 'completar Fotos no verifica el equipo');
});

test('fotos antiguas sin categoría quedan pendientes de clasificar y no se tocan', async t => {
 const v = await vaultWith(t, 'B32');
 const conLista = (await readFile(v.file, 'utf8')).replace('fotos: []', 'fotos:\n  - 00-Proyecto/fotos-campo/B32/B32_2026-10-01_aaaa.jpg\n  - ruta: 00-Proyecto/fotos-campo/B32/B32_2026-10-01_bbbb.jpg\n    nota: caja del sello');
 await writeFile(v.file, conLista);
 const row = await rowOf(v.vault, 'B32');
 assert.equal(row.checks.fotos, false, 'una foto sin categoría no completa Fotos');
 assert.equal(row.fotos.sinClasificar, 2);
 assert.equal(await readFile(v.file, 'utf8'), conLista, 'la ficha no cambia al consultar el avance');
});

// ---------- 3. Sustitución segura de fotos ----------
async function photoDir(t) {
 const vault = await mkdtemp(path.join(os.tmpdir(), 'regresion-fotos-'));
 t.after(() => rm(vault, {recursive: true, force: true}));
 return {vault, dir: path.join(vault, '00-Proyecto/fotos-campo/B32/expediente')};
}

test('si falla la escritura de la foto nueva, la anterior sigue vigente', async t => {
 const {vault, dir} = await photoDir(t), photos = pumpPhotoStore(vault);
 await photos.save('B32', 'sello', b64(JPG));
 await mkdir(path.join(dir, 'sello.png'));            // destino imposible de escribir
 await assert.rejects(photos.save('B32', 'sello', b64(PNG)));
 assert.deepEqual((await photos.read('B32', 'sello')).bytes, JPG);
 assert.ok((await photos.list('B32')).sello, 'la foto vigente sigue listada');
 assert.equal((await readdir(dir)).filter(n => n.endsWith('.tmp')).length, 0, 'sin temporales');
 assert.equal(await photos.historial('B32'), 0, 'sin copias huérfanas en el historial');
});

test('si falla cualquier paso antes de confirmar, la anterior sigue vigente', async t => {
 const {vault, dir} = await photoDir(t);
 await pumpPhotoStore(vault).save('B32', 'placa1', b64(JPG));
 const failing = pumpPhotoStore(vault, {antesDeConfirmar: async () => { throw new Error('Disco lleno simulado'); }});
 await assert.rejects(failing.save('B32', 'placa1', b64(JPG2)), /Disco lleno/);
 assert.deepEqual((await failing.read('B32', 'placa1')).bytes, JPG);
 assert.equal((await readdir(dir)).filter(n => n.endsWith('.tmp')).length, 0);
 assert.equal(await failing.historial('B32'), 0);
});

test('una sustitución correcta deja la nueva vigente y la anterior en el historial', async t => {
 const {vault} = await photoDir(t), photos = pumpPhotoStore(vault);
 await photos.save('B32', 'bomba', b64(JPG));
 await photos.save('B32', 'bomba', b64(PNG));
 assert.deepEqual((await photos.read('B32', 'bomba')).bytes, PNG);
 assert.equal(await photos.historial('B32'), 1);
});

test('un directorio con nombre de foto no se considera foto vigente', async t => {
 const {vault, dir} = await photoDir(t);
 await mkdir(path.join(dir, 'placa1.png'), {recursive: true});
 const photos = pumpPhotoStore(vault);
 assert.equal((await photos.list('B32')).placa1, undefined);
 await assert.rejects(photos.read('B32', 'placa1'), /Sin foto/);
});
