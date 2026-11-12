-- Pedidos de repuestos a bodega (reemplaza la solicitud que solo funcionaba en la versión de computadora).
-- Quien pide ve sus pedidos y puede cancelarlos mientras estén pendientes; los administradores ven todos
-- y los marcan como listos o entregados. Se avisa con la campana. Ampliación: no borra datos.
begin;

-- Nuevos tipos de aviso.
alter table public.vocatus_notifications drop constraint if exists vocatus_notifications_kind_check;
alter table public.vocatus_notifications add constraint vocatus_notifications_kind_check
 check(kind in ('orden','orden-cerrada','reporte','reporte-estado','repuestos','repuestos-estado'));

create table if not exists public.vocatus_parts_requests (
 id uuid primary key default gen_random_uuid(),
 order_id uuid references public.vocatus_work_orders(id),
 items jsonb not null check(jsonb_typeof(items)='array' and jsonb_array_length(items) between 1 and 40 and length(items::text)<=20000),
 note text not null default '' check(length(note)<=1000),
 status text not null default 'pendiente' check(status in ('pendiente','preparado','entregado','cancelado')),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_by_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz,
 updated_by uuid references auth.users(id)
);
create index if not exists vocatus_parts_requests_status_idx on public.vocatus_parts_requests(status,created_at desc);
create index if not exists vocatus_parts_requests_created_by_idx on public.vocatus_parts_requests(created_by);
create index if not exists vocatus_parts_requests_order_idx on public.vocatus_parts_requests(order_id);
create index if not exists vocatus_parts_requests_updated_by_idx on public.vocatus_parts_requests(updated_by);

alter table public.vocatus_parts_requests enable row level security;
revoke all on public.vocatus_parts_requests from public,anon,authenticated;
grant select on public.vocatus_parts_requests to authenticated;
grant insert(order_id,items,note) on public.vocatus_parts_requests to authenticated;
grant update(status) on public.vocatus_parts_requests to authenticated;
create policy parts_read on public.vocatus_parts_requests for select to authenticated
 using((select vocatus_access.allowed(false)) and (created_by=(select auth.uid()) or (select vocatus_access.current_is_admin())));
create policy parts_insert on public.vocatus_parts_requests for insert to authenticated
 with check((select vocatus_access.allowed(true)) and created_by=(select auth.uid()) and status='pendiente');
create policy parts_admin_update on public.vocatus_parts_requests for update to authenticated
 using((select vocatus_access.current_is_admin())) with check((select vocatus_access.current_is_admin()));
create policy parts_cancel_own on public.vocatus_parts_requests for update to authenticated
 using(created_by=(select auth.uid()) and status='pendiente' and (select vocatus_access.allowed(true)))
 with check(created_by=(select auth.uid()) and status='cancelado');

create or replace function vocatus_access.parts_before()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then new.created_by_name:=vocatus_access.account_name(new.created_by);new.created_at:=now();new.status:='pendiente';
 else new.updated_at:=now();new.updated_by:=auth.uid(); end if;
 return new;
end; $$;
create or replace function vocatus_access.parts_after()
returns trigger language plpgsql security definer set search_path='' as $$
declare equipos text; n int;
begin
 select string_agg(distinct coalesce(i->>'tag','—'),', '),count(*) into equipos,n from jsonb_array_elements(new.items) i;
 if tg_op='INSERT' then
  perform vocatus_access.notify_admins(new.created_by,'repuestos','Pedido de repuestos de '||new.created_by_name,
   n||' '||case when n=1 then 'repuesto' else 'repuestos' end||' · '||coalesce(equipos,'')||case when new.note<>'' then ' · '||new.note else '' end,new.id::text,null);
 elsif new.status is distinct from old.status and new.created_by<>coalesce(auth.uid(),'00000000-0000-0000-0000-000000000000'::uuid) then
  perform vocatus_access.notify(new.created_by,'repuestos-estado',
   case new.status when 'preparado' then 'Tus repuestos están listos para retirar' when 'entregado' then 'Tus repuestos fueron entregados' when 'cancelado' then 'Se canceló tu pedido de repuestos' else 'Tu pedido de repuestos cambió' end,
   n||' '||case when n=1 then 'repuesto' else 'repuestos' end||' · '||coalesce(equipos,''),new.id::text,null);
 end if;
 return null;
end; $$;
drop trigger if exists vocatus_parts_before on public.vocatus_parts_requests;
create trigger vocatus_parts_before before insert or update on public.vocatus_parts_requests for each row execute function vocatus_access.parts_before();
drop trigger if exists vocatus_parts_after on public.vocatus_parts_requests;
create trigger vocatus_parts_after after insert or update on public.vocatus_parts_requests for each row execute function vocatus_access.parts_after();

do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='vocatus_parts_requests') then
  alter publication supabase_realtime add table public.vocatus_parts_requests;
 end if;
end $$;

commit;
