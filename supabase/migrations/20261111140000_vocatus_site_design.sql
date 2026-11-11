-- Diseño editable del visor (colores, textos, mostrar/ocultar, orden, logo y botones del menú).
-- Lo leen todas las cuentas aprobadas; solo un administrador lo puede guardar. Ampliación aditiva.
begin;

-- Misma función que en vocatus_pump_visibility; se repite por si ese SQL todavía no se corrió.
create or replace function vocatus_access.current_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and vocatus_access.is_admin(auth.uid());
$$;
revoke all on function vocatus_access.current_is_admin() from public,anon;
grant execute on function vocatus_access.current_is_admin() to authenticated;

create table if not exists public.vocatus_site_design (
 id text primary key check(id='principal'),
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and length(data::text)<=20000),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);

alter table public.vocatus_site_design enable row level security;
revoke all on public.vocatus_site_design from public,anon,authenticated;
grant select,insert,update on public.vocatus_site_design to authenticated;

create policy site_design_read on public.vocatus_site_design for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy site_design_insert on public.vocatus_site_design for insert to authenticated
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
create policy site_design_update on public.vocatus_site_design for update to authenticated
 using((select vocatus_access.current_is_admin()))
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));

do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='vocatus_site_design') then
  alter publication supabase_realtime add table public.vocatus_site_design;
 end if;
end $$;

commit;
