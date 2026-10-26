// Reemplazo, intercambio y respaldos de fichas. Usa una bóveda temporal con una copia de la
// ficha real de B33; nunca escribe en la bóveda real.
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {mkdtemp, mkdir, writeFile, readFile, readdir, rm, copyFile, access} from 'node:fs/promises';
import {equipmentStore} from './equipment.mjs';
import {splitNote} from './survey.mjs';
import {equipmentData} from './vault.mjs';
import {photoPumps} from './public/equipos-sector.js';
import {linksBomba, expedienteDe} from './public/expediente.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const real = path.join(root, '..', '00-Proyecto', 'equipos');
async function nuevaBoveda() {
 const vault = await mkdtemp(path.join(root, '.test-vault-'));
 await mkdir(path.join(vault, '00-Proyecto/equipos'), {recursive: true});
 for (const t of ['B32', 'B33']) await copyFile(path.join(real, `${t}.md`), path.join(vault, `00-Proyecto/equipos/${t}.md`));
 return vault;
}
const base = photoPumps.map(p => ({tag: p.tag, x: p.x, z: p.z, rotation: p.rotation, areaId: 'tanques'}));
const quien = {date: '2026-10-26', author: 'Prueba', reason: 'prueba automática'};
const leer = async (vault, tag) => splitNote(await readFile(path.join(vault, `00-Proyecto/equipos/${tag}.md`), 'utf8'));
const vacio = v => v === '' || v === false || (Array.isArray(v) && !v.length) || v == null;
const bovedas = [];
test.after(async () => { for (const v of bovedas) { assert.ok(v.startsWith(path.join(root, '.test-vault-'))); await rm(v, {recursive: true, force: true}); } });

test('reemplazar conserva la posición y no hereda datos de la bomba retirada', async () => {
 const vault = await nuevaBoveda(); bovedas.push(vault);
 const original = await readFile(path.join(vault, '00-Proyecto/equipos/B33.md'), 'utf8'), antes = splitNote(original).data;
 const fotos = path.join(vault, '00-Proyecto/fotos-campo/B33/expediente');
 await mkdir(fotos, {recursive: true}); await writeFile(path.join(fotos, 'bomba.jpg'), 'foto vieja'); await writeFile(path.join(fotos, 'posicion.jpg'), 'foto del lugar');
 const store = equipmentStore(vault, base);
 const out = await store.replace('B33', {...quien, fields: {marca: 'KSB', modelo: 'Etanorm 32-160', motor_hp: '3'}});
 const d = (await leer(vault, 'B33')).data;
 // Se conserva la posición
 for (const k of ['id', 'area', 'ubicacion', 'liquido']) assert.equal(d[k], antes[k], k + ' es de la posición');
 // Lo nuevo es lo indicado
 assert.equal(d.marca, 'KSB'); assert.equal(d.modelo, 'Etanorm 32-160'); assert.equal(String(d.motor_hp), '3');
 // Nada de la bomba retirada queda en la ficha
 for (const k of ['caudal_gpm', 'altura_m', 'impulsor_valor', 'impulsor_max_valor', 'tamano', 'rpm', 'rodamiento_delantero', 'rodamiento_trasero', 'acople', 'motor_marca', 'motor_catalogo', 'motor_rpm', 'texto_original_bomba', 'texto_original_motor', 'confianza_transcripcion', 'orings', 'sello_tipo'])
  assert.ok(vacio(d[k]), `${k} conserva "${d[k]}" de la bomba retirada`);
 assert.match(d.fuente, /Reemplazo registrado en el visor el 2026-10-26/);
 assert.equal(d.reemplazo_fecha, '2026-10-26');
 // Expediente archivado completo
 const archivo = splitNote(await readFile(path.join(vault, out.archive), 'utf8'));
 assert.equal(archivo.data.tipo, 'equipo-retirado'); assert.equal(archivo.data.caudal_gpm, antes.caudal_gpm); assert.equal(archivo.data.motor_catalogo, antes.motor_catalogo);
 assert.ok(archivo.body.includes(splitNote(original).body.trim().slice(0, 200)), 'el cuerpo de la ficha se archiva completo');
 // Respaldo idéntico al original
 assert.equal(await readFile(path.join(vault, out.backup), 'utf8'), original);
 // Fotos: la de la bomba pasa al historial, la de la posición se queda
 await access(path.join(fotos, 'posicion.jpg'));
 await assert.rejects(access(path.join(fotos, 'bomba.jpg')));
 assert.ok((await readdir(path.join(fotos, 'historial'))).some(n => n.startsWith('bomba_retirada_2026-10-26')));
 // El visor deja de mostrar forma, placas y documentos de la bomba anterior
 const datos = equipmentData(photoPumps.find(p => p.tag === 'B33'), d);
 assert.equal(datos.representacion, 'genérica'); assert.equal(datos.reemplazo, '2026-10-26');
 assert.ok(datos.specs.every(([, v]) => v === 'Por confirmar'), 'prestaciones de la bomba anterior en la ficha nueva');
 assert.equal(expedienteDe(datos).placas.length, 0);
 assert.equal(linksBomba(datos), null, 'KSB sin documentación asociada queda pendiente');
});

test('reemplazar confirmando el mismo sello conserva sello y o-rings', async () => {
 const vault = await nuevaBoveda(); bovedas.push(vault);
 const antes = (await leer(vault, 'B33')).data;
 await equipmentStore(vault, base).replace('B33', {...quien, clearSeal: false, fields: {marca: 'KSB', modelo: 'Etanorm'}});
 const d = (await leer(vault, 'B33')).data;
 assert.equal(d.sello_tipo, antes.sello_tipo); assert.equal(d.sello_eje_pulg, antes.sello_eje_pulg);
 assert.ok(vacio(d.caudal_gpm) && vacio(d.rodamiento_delantero));
});

test('un intercambio que falla a mitad no deja fichas inconsistentes', async () => {
 const vault = await nuevaBoveda(); bovedas.push(vault);
 const a0 = await readFile(path.join(vault, '00-Proyecto/equipos/B32.md'), 'utf8'), b0 = await readFile(path.join(vault, '00-Proyecto/equipos/B33.md'), 'utf8');
 const store = equipmentStore(vault, base, {antesDeEscribir: tag => { if (tag === 'B33') throw new Error('disco lleno (simulado)'); }});
 await assert.rejects(store.swap('B32', 'B33', quien), e => e.code === 'SWAP_FAILED' && /B32 volvió a su posición original/.test(e.message));
 assert.equal(await readFile(path.join(vault, '00-Proyecto/equipos/B32.md'), 'utf8'), a0, 'B32 quedó modificada');
 assert.equal(await readFile(path.join(vault, '00-Proyecto/equipos/B33.md'), 'utf8'), b0);
 assert.equal((await store.backups('B32')).length, 1); assert.equal((await store.backups('B33')).length, 1);
 // Un intercambio normal deja respaldo de ambas
 const ok = await equipmentStore(vault, base).swap('B32', 'B33', quien);
 assert.equal(ok.backups.length, 2);
 assert.notEqual(await readFile(path.join(vault, '00-Proyecto/equipos/B32.md'), 'utf8'), a0);
});

test('mover deja un respaldo recuperable', async () => {
 const vault = await nuevaBoveda(); bovedas.push(vault);
 const store = equipmentStore(vault, base), a0 = await readFile(path.join(vault, '00-Proyecto/equipos/B32.md'), 'utf8');
 const out = await store.move('B32', {...quien, x: 3, z: 1, rotation: 90});
 assert.equal(await readFile(path.join(vault, out.backup), 'utf8'), a0);
 await store.restore('B32', path.join(vault, out.backup));
 assert.equal(await readFile(path.join(vault, '00-Proyecto/equipos/B32.md'), 'utf8'), a0);
});

test('un informe guarda presión y caudal como campos con unidad y fecha', async () => {
 const {maintenanceStore} = await import('./maintenance.mjs');
 const vault = await nuevaBoveda(); bovedas.push(vault);
 const store = maintenanceStore(vault, false);
 const r = await store.save('B33', {date: '2026-10-26', title: 'Ronda', author: 'Prueba', details: 'Antes 2 bar; presión medida: 4 bar', measurements: {presion_bar: '4', caudal_m3h: ''}});
 assert.equal(r.mediciones.presion_bar, 4); assert.equal(r.mediciones.caudal_m3h, null);
 const raw = await readFile(path.join(vault, '00-Proyecto/Mantenimiento', r.id), 'utf8');
 assert.match(raw, /^medicion_presion_bar: 4$/m); assert.match(raw, /^medicion_fecha: "2026-10-26"$/m); assert.doesNotMatch(raw, /medicion_caudal_m3h/);
 await assert.rejects(store.save('B33', {date: '2026-10-26', title: 'x', author: 'y', details: 'z', measurements: {presion_bar: 'abc'}}), /número/);
});
