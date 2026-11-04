-- Nombre o código editable de las bombas del modelo 3D. Ampliación aditiva: no toca datos existentes.
begin;

create table public.vocatus_pump_names (
 reference_key text primary key check(length(reference_key) between 1 and 300),
 name text not null check(length(name)<=120),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index vocatus_pump_names_updated_by_idx on public.vocatus_pump_names(updated_by);

alter table public.vocatus_pump_names enable row level security;
revoke all on public.vocatus_pump_names from public,anon,authenticated;
grant select,insert,update on public.vocatus_pump_names to authenticated;

create policy pump_names_read on public.vocatus_pump_names for select to authenticated
 using((select vocatus_auth.photo_access(false)));
create policy pump_names_insert on public.vocatus_pump_names for insert to authenticated
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
create policy pump_names_update on public.vocatus_pump_names for update to authenticated
 using((select vocatus_auth.photo_access(true)))
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
-- Igual que las demás tablas: también exige una cuenta aprobada y activa.
create policy vocatus_account_read on public.vocatus_pump_names as restrictive for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy vocatus_account_insert on public.vocatus_pump_names as restrictive for insert to authenticated
 with check((select vocatus_access.allowed(true)));
create policy vocatus_account_update on public.vocatus_pump_names as restrictive for update to authenticated
 using((select vocatus_access.allowed(true))) with check((select vocatus_access.allowed(true)));

commit;
