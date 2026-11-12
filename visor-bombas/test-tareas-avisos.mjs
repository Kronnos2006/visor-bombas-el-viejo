// Tareas y avisos: validación en pantalla y reglas de la base (sin red ni base real).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tagsDisponibles,limpiarReporte} from './public/tareas-avisos.js';
const sql=await readFile(new URL('../supabase/migrations/20261112120000_vocatus_tareas_y_avisos.sql',import.meta.url),'utf8');

test('la lista de equipos junta bombas con ficha y bombas del 3D, sin repetir y en orden',()=>{
 const t=tagsDisponibles([{tag:'B12',nombre:'A'},{tag:'B2',nombre:'B'}],[{tagAsignado:'B44',excel:{nombre:'Agua'}},{tagAsignado:'B2'},{tagAsignado:''}]);
 assert.deepEqual(t.map(x=>x[0]),['B2','B12','B44']);assert.equal(t[2][1],'Agua');
});
test('un reporte necesita qué pasó y un equipo o lugar',()=>{
 assert.throws(()=>limpiarReporte({title:'ok',tag:'B1'}),/qué pasó/);
 assert.throws(()=>limpiarReporte({title:'Gotea agua'}),/equipo o escribí el lugar/);
 assert.deepEqual(limpiarReporte({title:' Gotea agua ',tag:'B14',place:'x',severity:'alta'}),{tag:'B14',place:'',title:'Gotea agua',details:'',severity:'alta'});
 const libre=limpiarReporte({title:'Fuga de vapor',tag:'',place:'Calderas',severity:'rara'});
 assert.equal(libre.tag,null);assert.equal(libre.place,'Calderas');assert.equal(libre.severity,'media');
});
test('solo el administrador crea o edita órdenes; los demás solo inician la suya',()=>{
 assert.match(sql,/if not admin then[\s\S]*Solo un administrador puede crear órdenes[\s\S]*asignada a otra persona[\s\S]*'status','en-curso'/);
 assert.match(sql,/active_account_name\(assignee_id\)/);
});
test('los avisos solo los crea la base y cada persona ve los suyos',()=>{
 assert.match(sql,/grant select on public\.vocatus_notifications to authenticated/);
 assert.doesNotMatch(sql,/grant[^;]*insert[^;]*vocatus_notifications/i);
 assert.match(sql,/notifications_read[\s\S]*user_id=\(select auth\.uid\(\)\)/);
});
test('los reportes los ve quien los envió o un administrador; solo el administrador cambia su estado',()=>{
 assert.match(sql,/incidents_read[\s\S]*created_by=\(select auth\.uid\(\)\) or \(select vocatus_access\.current_is_admin\(\)\)/);
 assert.match(sql,/incidents_update[\s\S]*current_is_admin/);
 assert.doesNotMatch(sql,/grant[^;]*\bdelete\s*(,|on)/i);
});
test('reporte nuevo avisa a los administradores y orden asignada avisa al responsable',()=>{
 assert.match(sql,/incident_after[\s\S]*notify_admins\(new\.created_by,'reporte'/);
 assert.match(sql,/work_order_after[\s\S]*notify\(nuevo::uuid,'orden'/);
 assert.match(sql,/supabase_realtime/);
});
test('la funcion de órdenes no lee la tabla de cuentas directamente (corre con permisos del usuario)',()=>{
 const f=sql.slice(sql.indexOf('create or replace function public.vocatus_save_work_order'),sql.indexOf('grant execute on function public.vocatus_save_work_order'));
 assert.doesNotMatch(f,/from vocatus_access\.accounts/);
});
test('solo el administrador borra órdenes; se archivan y el responsable recibe aviso',async()=>{
 assert.match(sql,/function public\.vocatus_delete_work_order[\s\S]*current_is_admin[\s\S]*archived_at=now\(\)/);
 assert.match(sql,/new\.archived_at is not null and old\.archived_at is null[\s\S]*Se borró la orden/);
 assert.match(sql,/previous\.archived_at is not null then raise exception 'La orden fue borrada'/);
 const wf=await readFile(new URL('./public/cloud-workflow.js',import.meta.url),'utf8');
 assert.match(wf,/filter\(r=>!r\.archived_at\)/);
});
