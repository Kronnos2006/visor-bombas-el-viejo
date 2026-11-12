-- Posiciones de las bombas movidas por el administrador arrastrándolas en el 3D (Administración de bombas).
-- key: lugar de la bomba (misma clave que las fotos y los datos) o «cuerpo:Bxx»; x,z: centro en el mundo; giro: grados.
-- Las leen todas las cuentas aprobadas; solo un administrador las guarda. Ampliación: no borra datos.
begin;

create table if not exists public.vocatus_pump_positions (
 key text primary key check(length(key) between 1 and 300),
 x double precision not null check(abs(x)<=5000),
 z double precision not null check(abs(z)<=5000),
 giro double precision not null default 0 check(giro between -180 and 180),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index if not exists vocatus_pump_positions_updated_by_idx on public.vocatus_pump_positions(updated_by);

alter table public.vocatus_pump_positions enable row level security;
revoke all on public.vocatus_pump_positions from public,anon,authenticated;
grant select,insert,update on public.vocatus_pump_positions to authenticated;
create policy pump_positions_read on public.vocatus_pump_positions for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy pump_positions_insert on public.vocatus_pump_positions for insert to authenticated
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
create policy pump_positions_update on public.vocatus_pump_positions for update to authenticated
 using((select vocatus_access.current_is_admin()))
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));

do $$
begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='vocatus_pump_positions') then
  alter publication supabase_realtime add table public.vocatus_pump_positions;
 end if;
end $$;

commit;
