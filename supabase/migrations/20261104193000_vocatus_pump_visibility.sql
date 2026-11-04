-- Bombas ocultas o quitadas por un administrador. Aditivo: no borra fichas, fotos ni informes.
begin;

create table public.vocatus_pump_visibility (
 reference_key text primary key check(length(reference_key) between 1 and 300),
 state text not null check(state in ('oculta','quitada')),
 updated_at timestamptz not null default now(),
 updated_by uuid not null default auth.uid() references auth.users(id)
);
create index vocatus_pump_visibility_updated_by_idx on public.vocatus_pump_visibility(updated_by);

create function vocatus_access.current_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and vocatus_access.is_admin(auth.uid());
$$;
revoke all on function vocatus_access.current_is_admin() from public,anon;
grant execute on function vocatus_access.current_is_admin() to authenticated;

alter table public.vocatus_pump_visibility enable row level security;
revoke all on public.vocatus_pump_visibility from public,anon,authenticated;
grant select,insert,update,delete on public.vocatus_pump_visibility to authenticated;

create policy pump_visibility_read on public.vocatus_pump_visibility for select to authenticated
 using((select vocatus_access.allowed(false)));
create policy pump_visibility_insert on public.vocatus_pump_visibility for insert to authenticated
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
create policy pump_visibility_update on public.vocatus_pump_visibility for update to authenticated
 using((select vocatus_access.current_is_admin()))
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));
create policy pump_visibility_delete on public.vocatus_pump_visibility for delete to authenticated
 using((select vocatus_access.current_is_admin()));

commit;
