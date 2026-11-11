-- Datos de máquina que los usuarios escriben en la ficha. Ampliación aditiva: no toca datos existentes.
-- También activa el tiempo real para datos y nombres, para que todos vean los cambios al instante.
begin;

create table if not exists public.vocatus_pump_data (
 reference_key text primary key check(length(reference_key) between 1 and 300),
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and length(data::text)<=20000),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index if not exists vocatus_pump_data_updated_by_idx on public.vocatus_pump_data(updated_by);

alter table public.vocatus_pump_data enable row level security;
revoke all on public.vocatus_pump_data from public,anon,authenticated;
grant select,insert,update on public.vocatus_pump_data to authenticated;

create policy pump_data_read on public.vocatus_pump_data for select to authenticated
 using((select vocatus_auth.photo_access(false)));
create policy pump_data_insert on public.vocatus_pump_data for insert to authenticated
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
create policy pump_data_update on public.vocatus_pump_data for update to authenticated
 using((select vocatus_auth.photo_access(true)))
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
-- Igual que las demás tablas: también exige una cuenta aprobada y activa.
create policy vocatus_account_read on public.vocatus_pump_data as restrictive for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy vocatus_account_insert on public.vocatus_pump_data as restrictive for insert to authenticated
 with check((select vocatus_access.allowed(true)));
create policy vocatus_account_update on public.vocatus_pump_data as restrictive for update to authenticated
 using((select vocatus_access.allowed(true))) with check((select vocatus_access.allowed(true)));

-- Tiempo real (respeta los permisos de arriba). Solo agrega si todavía no está.
do $$
declare t text;
begin
 foreach t in array array['vocatus_pump_data','vocatus_pump_names'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
   execute format('alter publication supabase_realtime add table public.%I',t);
  end if;
 end loop;
end $$;

commit;
