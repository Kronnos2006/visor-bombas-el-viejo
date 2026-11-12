-- Rendimiento y mantenimiento automático de la base. No toca datos de bombas, fotos, órdenes ni informes.
begin;

-- 1. Índices que pidió el revisor de Supabase (relaciones sin índice).
create index if not exists vocatus_incidents_order_idx on public.vocatus_incidents(order_id);
create index if not exists vocatus_incidents_updated_by_idx on public.vocatus_incidents(updated_by);
create index if not exists vocatus_site_design_updated_by_idx on public.vocatus_site_design(updated_by);
create index if not exists vocatus_work_orders_archived_by_idx on public.vocatus_work_orders(archived_by);
create index if not exists vocatus_accounts_reviewed_by_idx on vocatus_access.accounts(reviewed_by);
create index if not exists vocatus_audit_actor_idx on vocatus_access.audit(actor);
create index if not exists vocatus_audit_target_idx on vocatus_access.audit(target);
-- La campana cuenta los avisos sin leer de cada persona: índice solo de esos.
create index if not exists vocatus_notifications_unread_idx on public.vocatus_notifications(user_id) where read_at is null;

-- 2. Limpieza automática de avisos viejos para que la tabla no crezca sin fin.
-- Se borran solo avisos (no órdenes ni informes): leídos hace más de 90 días, o cualquiera de más de un año.
-- Corre de vez en cuando al crearse avisos nuevos (1 de cada 20), sin tareas programadas extra.
create or replace function vocatus_access.limpiar_avisos()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if pg_catalog.random()<0.05 then
  delete from public.vocatus_notifications
  where (read_at is not null and read_at<now()-interval '90 days') or created_at<now()-interval '365 days';
 end if;
 return null;
end; $$;
revoke all on function vocatus_access.limpiar_avisos() from public,anon,authenticated;
drop trigger if exists vocatus_notifications_limpieza on public.vocatus_notifications;
create trigger vocatus_notifications_limpieza after insert on public.vocatus_notifications
 for each statement execute function vocatus_access.limpiar_avisos();

-- 3. Tiempo real también para informes: al cerrar un trabajo se actualizan las pantallas y los gráficos de todos.
do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='vocatus_work_reports') then
  alter publication supabase_realtime add table public.vocatus_work_reports;
 end if;
end $$;

commit;
