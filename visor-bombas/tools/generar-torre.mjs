// Genera public/equipos-torre.js a partir de las fichas 00-Proyecto/equipos/Bxx.md.
// Posiciones: croquis anotado del usuario (PDF «Torre», lámina A07, Nivel 1) y fotos de las
// páginas 16–17. Coordenadas locales de la torre en metros: x desde el eje 1 hacia el 5,
// z desde el eje A hacia el E. Uso: node tools/generar-torre.mjs [carpeta-boveda]
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseNote} from '../server.mjs';
import {equipmentData} from '../vault.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const vault = path.resolve(process.argv[2] || path.join(here, '..', '..'));
// Distribución ampliada (pedido del usuario: bombas menos pegadas y fáciles de tocar). Se respeta
// el orden y la fila de cada bomba en el croquis anotado; la separación es de presentación.
// Filas ajustadas al modelo DUSA 3D (FBX): la fila C queda delante de las columnas y pilares del eje C.
const ROW = 10.3, MID = 15.0, BACK = 20.3;
const fotos = {fila: '/referencias/torre/b3-b6.jpg', batch: '/referencias/torre/b7-b12.jpg', praj: '/referencias/torre/b17-b19.jpg', fondo: '/referencias/torre/b20-b21.jpg', b2: '/referencias/torre/b2.jpg'};
const fila = ['B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'];
// B9: confirmada por el usuario el 13-oct: está en la torre pero sin uso.
const SIN_USO = new Set(['B9']);
const notaFila = {B2: 'Croquis: primera posición de la fila del eje C', B10: 'Nota del croquis: «las bombas a la derecha no están en el plano»', B11: 'Nota del croquis: «las bombas a la derecha no están en el plano»', B9: 'Confirmado por el usuario (13-oct): está en la fila del eje C, sin uso', B12: 'Nota del croquis: «las bombas a la derecha no están en el plano»'};
// [tag, x, z, foto, nota de ubicación]
const placa = [
 ...fila.map((tag, i) => [tag, +(0.9 + i * 1.42).toFixed(2), ROW, tag === 'B2' ? fotos.b2 : i <= 4 ? fotos.fila : fotos.batch, notaFila[tag] || 'Croquis: fila del eje C']),
 ['B17', 6.2, MID, fotos.praj, 'Croquis: símbolo central izquierdo entre ejes C y D'],
 ['B18', 9.2, MID, fotos.praj, 'Croquis: símbolo central entre ejes C y D'],
 ['B19', 12.2, MID, fotos.praj, 'Croquis: símbolo central derecho entre ejes C y D'],
 ['B20', 6.2, BACK, fotos.fondo, 'Croquis: eje E, junto a la columna 2–3'],
 ['B21', 9.2, BACK, fotos.fondo, 'Croquis: eje E, centro']
];
const variant = size => /MTO/i.test(size) ? 'mto' : /STO|ST\b/i.test(size) ? 'sto' : 'lf';
const out = [];
for (const [tag, x, z, photo, ubicacionCroquis] of placa) {
 const note = parseNote(await readFile(path.join(vault, '00-Proyecto/equipos', tag + '.md'), 'utf8')).data;
 const base = {tag, areaId: 'torre', zona: 'Torre de destilación', area: 'Torre · Nivel 1', grupo: 'torre', x, z, y: .3, rotation: 0, scale: .72,
  variant: variant(note.tamano || ''), inactive: false, photo, ubicacionCroquis, posicion: 'aproximada según croquis', enUso: !SIN_USO.has(tag)};
 const data = equipmentData(base, note);
 delete data.documental;
 out.push({...data, enUso: base.enUso, area: base.area, zona: base.zona, areaPlanta: note.area || '', orings: [], history: []});
}
// Tercera cubierta del fondo (foto pág. 16): «se supone… para agregar». Sin TAG: no abre expediente.
const sinTag = [{x: 12.2, z: BACK, nota: 'Posición marcada con X en el croquis y tercera cubierta de la foto de la página 16; sin TAG asignado.'}];
const source = `// GENERADO por tools/generar-torre.mjs desde 00-Proyecto/equipos/Bxx.md. No editar a mano.
// Torre de destilación · Nivel 1. Posiciones aproximadas según el croquis anotado (lámina A07).
export const torrePumps = ${JSON.stringify(out, null, 1)};
export const torreSinTag = ${JSON.stringify(sinTag)};
`;
await writeFile(path.join(here, '..', 'public', 'equipos-torre.js'), source);
console.log(`equipos-torre.js: ${out.length} bombas (${out.map(p => p.tag).join(', ')})`);
