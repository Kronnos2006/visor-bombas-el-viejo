-- Prepara la base para las bombas. Se puede ejecutar más de una vez; no borra datos.
begin;
-- Levantamientos de campo compartidos. Ampliación aditiva: no modifica datos ni tablas existentes.
-- Cada envío es un registro nuevo e inmutable: dos personas en la misma bomba no se sobrescriben.
-- Las fotos usan el bucket y las reglas ya existentes de vocatus-maintenance (reports/<usuario>/...).


create table if not exists public.vocatus_field_surveys (
 id uuid primary key,
 tag text not null check(tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'),
 data jsonb not null check(
  jsonb_typeof(data)='object'
  and data->>'id'=id::text
  and data->>'tag'=tag
  and jsonb_typeof(data->'photos')='array'
  and jsonb_array_length(data->'photos')<=8
  and pg_column_size(data)<=262144
 ),
 created_at timestamptz not null default now(),
 created_by uuid not null default auth.uid() references auth.users(id)
);
create index if not exists vocatus_field_surveys_tag_idx on public.vocatus_field_surveys(tag,created_at desc);
create index if not exists vocatus_field_surveys_created_by_idx on public.vocatus_field_surveys(created_by);

alter table public.vocatus_field_surveys enable row level security;
revoke all on public.vocatus_field_surveys from public,anon,authenticated;
-- Sin UPDATE ni DELETE: lo enviado desde el campo no se altera desde el navegador.
grant select,insert on public.vocatus_field_surveys to authenticated;

drop policy if exists field_surveys_read on public.vocatus_field_surveys;
create policy field_surveys_read on public.vocatus_field_surveys for select to authenticated
 using((select vocatus_auth.photo_access(false)));
drop policy if exists field_surveys_insert on public.vocatus_field_surveys;
create policy field_surveys_insert on public.vocatus_field_surveys for insert to authenticated
 with check((select vocatus_auth.photo_access(true)) and created_by=(select auth.uid()));
-- Igual que las demás tablas: también exige una cuenta aprobada y activa.
drop policy if exists vocatus_account_read on public.vocatus_field_surveys;
create policy vocatus_account_read on public.vocatus_field_surveys as restrictive for select to authenticated
 using((select vocatus_access.allowed(false)));
drop policy if exists vocatus_account_insert on public.vocatus_field_surveys;
create policy vocatus_account_insert on public.vocatus_field_surveys as restrictive for insert to authenticated
 with check((select vocatus_access.allowed(true)));


-- Nombre o código editable de las bombas del modelo 3D. Ampliación aditiva: no toca datos existentes.


create table if not exists public.vocatus_pump_names (
 reference_key text primary key check(length(reference_key) between 1 and 300),
 name text not null check(length(name)<=120),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index if not exists vocatus_pump_names_updated_by_idx on public.vocatus_pump_names(updated_by);

alter table public.vocatus_pump_names enable row level security;
revoke all on public.vocatus_pump_names from public,anon,authenticated;
grant select,insert,update on public.vocatus_pump_names to authenticated;

drop policy if exists pump_names_read on public.vocatus_pump_names;
create policy pump_names_read on public.vocatus_pump_names for select to authenticated
 using((select vocatus_auth.photo_access(false)));
drop policy if exists pump_names_insert on public.vocatus_pump_names;
create policy pump_names_insert on public.vocatus_pump_names for insert to authenticated
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
drop policy if exists pump_names_update on public.vocatus_pump_names;
create policy pump_names_update on public.vocatus_pump_names for update to authenticated
 using((select vocatus_auth.photo_access(true)))
 with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
-- Igual que las demás tablas: también exige una cuenta aprobada y activa.
drop policy if exists vocatus_account_read on public.vocatus_pump_names;
create policy vocatus_account_read on public.vocatus_pump_names as restrictive for select to authenticated
 using((select vocatus_access.allowed(false)));
drop policy if exists vocatus_account_insert on public.vocatus_pump_names;
create policy vocatus_account_insert on public.vocatus_pump_names as restrictive for insert to authenticated
 with check((select vocatus_access.allowed(true)));
drop policy if exists vocatus_account_update on public.vocatus_pump_names;
create policy vocatus_account_update on public.vocatus_pump_names as restrictive for update to authenticated
 using((select vocatus_access.allowed(true))) with check((select vocatus_access.allowed(true)));


-- Bombas ocultas o quitadas por un administrador. Aditivo: no borra fichas, fotos ni informes.


create table if not exists public.vocatus_pump_visibility (
 reference_key text primary key check(length(reference_key) between 1 and 300),
 state text not null check(state in ('oculta','quitada')),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index if not exists vocatus_pump_visibility_updated_by_idx on public.vocatus_pump_visibility(updated_by);

create or replace function vocatus_access.current_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and vocatus_access.is_admin(auth.uid());
$$;
revoke all on function vocatus_access.current_is_admin() from public,anon;
grant execute on function vocatus_access.current_is_admin() to authenticated;

alter table public.vocatus_pump_visibility enable row level security;
revoke all on public.vocatus_pump_visibility from public,anon,authenticated;
grant select,insert,update,delete on public.vocatus_pump_visibility to authenticated;

drop policy if exists pump_visibility_read on public.vocatus_pump_visibility;
create policy pump_visibility_read on public.vocatus_pump_visibility for select to authenticated
 using((select vocatus_access.allowed(false)));
drop policy if exists pump_visibility_insert on public.vocatus_pump_visibility;
create policy pump_visibility_insert on public.vocatus_pump_visibility for insert to authenticated
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
drop policy if exists pump_visibility_update on public.vocatus_pump_visibility;
create policy pump_visibility_update on public.vocatus_pump_visibility for update to authenticated
 using((select vocatus_access.current_is_admin()))
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
drop policy if exists pump_visibility_delete on public.vocatus_pump_visibility;
create policy pump_visibility_delete on public.vocatus_pump_visibility for delete to authenticated
 using((select vocatus_access.current_is_admin()));



commit;
