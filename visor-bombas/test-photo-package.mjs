import test from 'node:test';
import assert from 'node:assert/strict';
import {makePhotoPackage, readPhotoPackage, MAX_PHOTOS, MAX_PHOTO_BYTES, MAX_PACKAGE_BYTES} from './public/photo-package-core.js';

const JPG = Buffer.from([255, 216, 255, 224, 0, 3, 1, 2, 255, 217]);
const PNG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 1, 2]);
const photo = (changes = {}) => ({tag: 'B32', slot: 'sello', fecha: '2026-10-28T20:00:00.000Z', base64: JPG.toString('base64'), ...changes});

test('traslada TAG, categoría, fecha y bytes exactos de JPG y PNG sin modificar entradas', () => {
 const entries = [photo(), photo({tag: 'P-1462A', slot: 'placa1', base64: PNG.toString('base64')})];
 const snapshot = structuredClone(entries);
 const pkg = makePhotoPackage(entries);
 assert.equal(pkg.formato, 'vocatus-pump-photos');
 assert.equal(pkg.version, 1);
 assert.equal(new Date(pkg.creado).toISOString(), pkg.creado);
 const loaded = readPhotoPackage(JSON.stringify(pkg));
 assert.deepEqual(loaded, snapshot);
 assert.deepEqual(entries, snapshot);
 assert.deepEqual(Buffer.from(loaded[0].base64, 'base64'), JPG);
 assert.deepEqual(Buffer.from(loaded[1].base64, 'base64'), PNG);
 loaded[0].tag = 'B1';
 assert.equal(pkg.photos[0].tag, 'B32');
});

test('rechaza formato, versión, JSON y fechas inválidos', () => {
 const good = makePhotoPackage([photo()]);
 for (const changes of [{formato: 'levantamiento-vocatus'}, {version: 2}, {creado: '2026-02-31T00:00:00.000Z'}]) assert.throws(() => readPhotoPackage({...good, ...changes}));
 assert.throws(() => readPhotoPackage('{no-json'), /JSON/);
 assert.throws(() => makePhotoPackage([photo({fecha: '2026-02-31T00:00:00.000Z'})]), /Fecha/);
 assert.throws(() => makePhotoPackage([photo({fecha: ''})]), /Fecha/);
});

test('valida todo el paquete antes de devolver fotos: TAG, categoría y duplicados', () => {
 const good = makePhotoPackage([photo()]);
 for (const bad of [photo({tag: '../B32'}), photo({tag: 'B0'}), photo({slot: 'desconocida'}), photo({tag: 'P-1'})]) {
  assert.throws(() => readPhotoPackage({...good, photos: [photo(), bad]}));
 }
 assert.throws(() => makePhotoPackage([photo(), photo()]), /repite/);
 assert.doesNotThrow(() => makePhotoPackage([photo(), photo({slot: 'bomba'}), photo({tag: 'B33'})]));
 assert.throws(() => makePhotoPackage([]), /entre 1 y 200/);
 assert.throws(() => makePhotoPackage(Array.from({length: MAX_PHOTOS + 1}, (_, index) => photo({tag: 'B' + (index + 1)}))), /entre 1 y 200/);
});

test('rechaza base64 malformado, no canónico y firmas falsas', () => {
 for (const base64 of ['', '***=', JPG.toString('base64') + '\n', 'data:image/jpeg;base64,' + JPG.toString('base64'), Buffer.from('foto falsa').toString('base64'), '/9j/', '/9j/4AADBQI/2R==']) {
  assert.throws(() => makePhotoPackage([photo({base64})]));
 }
});

test('limita foto y paquete antes de aceptar contenido sobredimensionado', () => {
 assert.throws(() => makePhotoPackage([photo({base64: 'A'.repeat(Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 4)})]), /8 MB/);
 assert.throws(() => readPhotoPackage(' '.repeat(MAX_PACKAGE_BYTES + 1)), /50 MB/);
});
