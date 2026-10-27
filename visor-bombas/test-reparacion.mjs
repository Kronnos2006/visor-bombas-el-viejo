// Reparación (la bomba sale de su lugar) y estado del equipo al terminar un mantenimiento.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, readdir, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {equipmentStore} from './equipment.mjs';
import {maintenanceStore} from './maintenance.mjs';
import {splitNote} from './survey.mjs';

const raw = tag => `---\nid: ${tag}\nmarca: HIDROMAC\nmodelo: "2196"\n---\n# ${tag}\n`;
async function vault(t, tag = 'B32') {
 const dir = await mkdtemp(path.join(os.tmpdir(), 'vocatus-reparacion-'));
 t.after(() => rm(dir, {recursive: true, force: true}));
 const file = path.join(dir, '00-Proyecto', tag.startsWith('B') ? 'equipos' : 'bombas', tag + '.md');
 await mkdir(path.dirname(file), {recursive: true}); await writeFile(file, raw(tag));
 return {dir, file, store: equipmentStore(dir, []), data: async () => splitNote(await readFile(file, 'utf8')).data, text: () => readFile(file, 'utf8')};
}
const input = extra => ({date: '2026-10-27', author: 'Técnico de prueba', ...extra});

test('llevar una bomba a reparar deja la ficha En reparación, con motivo, reporte y respaldo exacto', async t => {
 const v = await vault(t);
 const out = await v.store.repair('B32', input({reason: 'Sello con fuga', report: 'Se retiró al taller.\nSe envía con acople.'}));
 const d = await v.data();
 assert.equal(d.estado_operativo, 'en_reparacion'); assert.equal(d.reparacion_desde, '2026-10-27'); assert.equal(d.reparacion_motivo, 'Sello con fuga');
 const text = await v.text();
 assert.match(text, /## Reparaciones/); assert.match(text, /Motivo: Sello con fuga/); assert.match(text, /> Se envía con acople\./);
 assert.equal(await readFile(path.join(v.dir, out.backup), 'utf8'), raw('B32'));
 assert.deepEqual(await v.store.repairs(), [{tag: 'B32', desde: '2026-10-27', motivo: 'Sello con fuga'}]);
});

test('reparación exige motivo, fecha real y responsable; no se registra dos veces', async t => {
 const v = await vault(t);
 for (const bad of [{reason: ''}, {reason: 'x', date: '2026-02-31'}, {reason: 'x', author: ''}]) {
  await assert.rejects(v.store.repair('B32', input(bad))); assert.equal(await v.text(), raw('B32'));
 }
 await v.store.repair('B32', input({reason: 'Ruido en rodamientos'}));
 const before = await v.text();
 await assert.rejects(v.store.repair('B32', input({reason: 'Otra vez'})), /ya figura en reparación/);
 assert.equal(await v.text(), before);
});

test('al volver, la bomba queda en servicio y el historial conserva la salida y el regreso', async t => {
 const v = await vault(t, 'P-1401');
 await assert.rejects(v.store.repairReturn('P-1401', input({})), /no figura en reparación/);
 await v.store.repair('P-1401', input({reason: 'Cambio de impulsor'}));
 await assert.rejects(v.store.repairReturn('P-1401', input({date: '2026-10-20'})), /anterior a la salida/);
 await v.store.repairReturn('P-1401', input({date: '2026-10-30', reason: 'Instalada y probada'}));
 const d = await v.data(), text = await v.text();
 assert.equal(d.estado_operativo, 'en_servicio'); assert.equal(d.reparacion_desde, ''); assert.equal(d.ultima_reparacion, '2026-10-27 a 2026-10-30');
 assert.match(text, /retirada de su lugar para reparación\. Motivo: Cambio de impulsor/); assert.match(text, /volvió a su lugar \(en reparación desde 2026-10-27\)\. Nota: Instalada y probada/);
 assert.deepEqual(await v.store.repairs(), []);
 const backups = await readdir(path.join(v.dir, '00-Proyecto/Respaldos/fichas'));
 assert.equal(backups.length, 2);
});

test('el reporte de mantenimiento registra si el equipo quedó funcionando', async t => {
 const v = await vault(t);
 const store = maintenanceStore(v.dir, false);
 const base = {date: '2026-10-27', title: 'Cambio de sello', author: 'Técnico de prueba', details: 'Se cambió el sello.', parts: 'SM-35 · Sello mecánico'};
 await store.save('B32', {...base, operativo: 'si'});
 await store.save('B32', {...base, operativo: 'no'});
 await store.save('B32', {...base});
 const texts = (await store.list('B32')).map(r => r.text);
 assert.equal(texts.filter(x => /equipo_funcional: true/.test(x) && /quedó funcionando/.test(x)).length, 1);
 assert.equal(texts.filter(x => /equipo_funcional: false/.test(x) && /no quedó funcionando/.test(x)).length, 1);
 assert.equal(texts.filter(x => !/equipo_funcional/.test(x)).length, 1);
 await assert.rejects(store.save('B32', {...base, operativo: 'tal vez'}), /quedó funcionando/);
});

test('pendientes: el último informe de cada equipo dice si quedó sin funcionar', async t => {
 const v = await vault(t);
 const store = maintenanceStore(v.dir, false);
 const base = {title: 'Revisión', author: 'Técnico de prueba', details: 'Revisión general.'};
 await store.save('B32', {...base, date: '2026-10-20', operativo: 'no'});
 await store.save('B32', {...base, date: '2026-10-27', operativo: 'si'});
 await store.save('B33', {...base, date: '2026-10-25', operativo: 'si'});
 await store.save('B33', {...base, date: '2026-10-26', operativo: 'no'});
 await store.save('B34', {...base, date: '2026-10-26'});
 const st = await store.latestStatus();
 assert.deepEqual(st.map(r => [r.tag, r.date, r.funcional]), [['B32', '2026-10-27', true], ['B33', '2026-10-26', false], ['B34', '2026-10-26', null]]);
});
