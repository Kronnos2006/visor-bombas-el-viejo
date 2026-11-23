-- Cierra la edición directa de órdenes de trabajo.
-- Antes: cualquier cuenta con escritura podía modificar vocatus_work_orders directo (REST), sin pasar por las reglas
-- de vocatus_save_work_order / vocatus_save_work_report (estado, versión, responsable).
-- Ahora: las órdenes solo cambian por las funciones (ya validan acceso con vocatus_auth.photo_access(true)).

-- 1. Las dos funciones corrían como quien llama (SECURITY INVOKER) y dependían de la política UPDATE.
--    Pasan a SECURITY DEFINER. Siguen usando auth.uid() (sale del token, no cambia) y search_path vacío.
alter function public.vocatus_save_work_order(jsonb) security definer;
alter function public.vocatus_save_work_report(jsonb) security definer;
alter function public.vocatus_save_work_order(jsonb) set search_path='';
alter function public.vocatus_save_work_report(jsonb) set search_path='';

-- 2. Quitar la escritura directa. Hay DOS políticas UPDATE (se suman): hay que quitar las dos.
drop policy if exists work_orders_update on public.vocatus_work_orders;
drop policy if exists vocatus_account_update on public.vocatus_work_orders;
revoke update on public.vocatus_work_orders from authenticated;

-- Sin cambios: leer (work_orders_read), borrar (vocatus_delete_work_order) y aceptar (vocatus_accept_work_order)
-- ya eran SECURITY DEFINER. El trigger vocatus_work_order_after también.
