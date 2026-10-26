import path from 'node:path';
import { existsSync } from 'node:fs';

export function vaultConfiguration(root, env = process.env) {
 const cloud = env.CODESPACES === 'true' || env.VOCATUS_CLOUD_DEV === '1' || !!env.VERCEL;
 const demo = cloud || env.VOCATUS_DEMO === '1';
 const localVault = path.resolve(root, '../Vacatos');
 return {
  cloud, demo,
  vault: demo ? path.join(root, 'demo-vault') : path.resolve(env.OBSIDIAN_VAULT || (existsSync(path.join(localVault, '00-Proyecto')) ? localVault : path.join(root, '..'))),
  writable: !env.VERCEL
 };
}

// La ficha manda sobre los datos técnicos. El sector aporta solamente la geometría y las fotos.
export function equipmentData(base, note) {
 const number = key => note[key] === '' || note[key] == null || !Number.isFinite(Number(note[key])) ? null : Number(note[key]);
 // Posición cambiada desde «Mover o cambiar bomba»: la ficha manda sobre la posición del prototipo.
 const moved = number('posicion_x') !== null && number('posicion_z') !== null;
 const place = {...(moved ? {x: number('posicion_x'), z: number('posicion_z')} : {}), ...(number('rotacion_grados') !== null ? {rotation: number('rotacion_grados') * Math.PI / 180} : {})};
 const value = key => String(note[key] ?? '').trim() || 'Por confirmar';
 const units = (key, unit) => note[key] === '' || note[key] == null ? 'Por confirmar' : `${note[key]} ${unit}`;
 // Bomba reemplazada desde el visor: la forma 3D, las placas y las fotos del prototipo eran de la
 // bomba retirada. Se usa una representación genérica hasta levantar la nueva.
 const reemplazo = String(note.reemplazo_fecha || '').trim();
 const nueva = reemplazo ? {variant: 'lf', representacion: 'genérica', reemplazo, reemplazoArchivo: String(note.reemplazo_archivo || '')} : {};
 return {
  ...base, ...nueva, ...place, movido: moved, tag: note.id || base.tag, nombre: value('ubicacion'), servicio: value('liquido'),
  marca: value('marca'), modelo: value('modelo'), size: value('tamano'), serie: String(note.placa_serie || ''),
  source: `00-Proyecto/equipos/${base.tag}.md`, documentarySource: note.fuente || '',
  association: note.placa_nota || 'Asociación de placa por confirmar',
  specs: [['Caudal', units('caudal_gpm', 'GPM')], ['Altura', units('altura_m', 'm')], ['Velocidad de bomba', units('rpm', 'rpm')], ['Impulsor', units('impulsor_valor', note.impulsor_unidad || '')], ['Impulsor máximo', units('impulsor_max_valor', note.impulsor_max_unidad || '')]],
  motor: {marca: value('motor_marca'), catalogo: value('motor_catalogo'), potencia: note.motor_hp ? units('motor_hp', 'HP') : units('motor_kw', 'kW'), rpm: units('motor_rpm', 'rpm')},
  seal: {tipo: note.sello_tipo || note.tipo_sellado || 'Por confirmar', diametro: units('sello_eje_pulg', 'pulg'), caras: [note.sello_cara_rotativa, note.sello_cara_estatica].filter(Boolean).join(' / ') || 'Por confirmar', elastomero: value('sello_elastomero'), codigo: value('sello_codigo')},
  rodamientos: {delantero: value('rodamiento_delantero'), trasero: value('rodamiento_trasero'), conjunto: value('rodamientos_pertenecen_a')},
  acople: value('acople'), observaciones: String(note.observaciones_excel || '').trim(), orings: Array.isArray(note.orings) ? note.orings : [], history: [],
  documental: note, demonstracion: false
 };
}
