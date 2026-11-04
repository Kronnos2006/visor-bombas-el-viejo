-- Levantamientos de campo compartidos. Ampliación aditiva: no modifica datos ni tablas existentes.
-- Cada envío es un registro nuevo e inmutable: dos personas en la misma bomba no se sobrescriben.
-- Las fotos usan el bucket y las reglas ya existentes de vocatus-maintenance (reports/<usuario>/...).
begin;

create table public.vocatus_field_surveys (
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
create index vocatus_field_surveys_tag_idx on public.vocatus_field_surveys(tag,created_at desc);
create index vocatus_field_surveys_created_by_idx on public.vocatus_field_surveys(created_by);

alter table public.vocatus_field_surveys enable row level security;
revoke all on public.vocatus_field_surveys from public,anon,authenticated;
-- Sin UPDATE ni DELETE: lo enviado desde el campo no se altera desde el navegador.
grant select,insert on public.vocatus_field_surveys to authenticated;

create policy field_surveys_read on public.vocatus_field_surveys for select to authenticated
 using((select vocatus_auth.photo_access(false)));
create policy field_surveys_insert on public.vocatus_field_surveys for insert to authenticated
 with check((select vocatus_auth.photo_access(true)) and created_by=(select auth.uid()));
-- Igual que las demás tablas: también exige una cuenta aprobada y activa.
create policy vocatus_account_read on public.vocatus_field_surveys as restrictive for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy vocatus_account_insert on public.vocatus_field_surveys as restrictive for insert to authenticated
 with check((select vocatus_access.allowed(true)));

commit;
