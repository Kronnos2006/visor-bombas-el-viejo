-- Órdenes asignadas por administradores, reportes de planta y avisos.
-- Ampliación: no borra datos. Las órdenes existentes siguen igual (su responsable en texto se conserva).
begin;

-- Misma función que en SQL anteriores; se repite por si aquellos no se corrieron.
create or replace function vocatus_access.current_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and vocatus_access.is_admin(auth.uid());
$$;
revoke all on function vocatus_access.current_is_admin() from public,anon;
grant execute on function vocatus_access.current_is_admin() to authenticated;

-- 1. Equipo: cuentas aprobadas y activas, para elegir el responsable de una orden.
create or replace function public.vocatus_team()
returns jsonb language sql stable security definer set search_path='' as $$
 select case when vocatus_access.allowed(false) then coalesce((
  select jsonb_agg(jsonb_build_object('id',a.id,'username',a.username,'name',a.name,'role',a.role) order by a.name)
  from vocatus_access.accounts a where a.status='approved' and a.active),'[]'::jsonb) else '[]'::jsonb end;
$$;
revoke all on function public.vocatus_team() from public,anon;
grant execute on function public.vocatus_team() to authenticated;

-- Nombre visible de una cuenta (para avisos y reportes).
create or replace function vocatus_access.account_name(p_id uuid)
returns text language sql stable security definer set search_path='' as $$
 select coalesce((select a.name from vocatus_access.accounts a where a.id=p_id),'Usuario');
$$;
revoke all on function vocatus_access.account_name(uuid) from public,anon;
grant execute on function vocatus_access.account_name(uuid) to authenticated;
-- Nombre solo si la cuenta está aprobada y activa (para validar el responsable de una orden).
create or replace function vocatus_access.active_account_name(p_id uuid)
returns text language sql stable security definer set search_path='' as $$
 select a.name from vocatus_access.accounts a where a.id=p_id and a.status='approved' and a.active and vocatus_access.allowed(false);
$$;
revoke all on function vocatus_access.active_account_name(uuid) from public,anon;
grant execute on function vocatus_access.active_account_name(uuid) to authenticated;

-- 2. Avisos: cada persona ve solo los suyos. Solo los crea la base (disparadores).
create table if not exists public.vocatus_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 kind text not null check(kind in ('orden','orden-cerrada','reporte','reporte-estado')),
 title text not null check(length(title) between 1 and 200),
 body text not null default '' check(length(body)<=1000),
 ref_id text check(length(ref_id)<=100),
 tag text check(length(tag)<=20),
 created_at timestamptz not null default now(),
 read_at timestamptz
);
create index if not exists vocatus_notifications_user_idx on public.vocatus_notifications(user_id,created_at desc);
alter table public.vocatus_notifications enable row level security;
revoke all on public.vocatus_notifications from public,anon,authenticated;
grant select on public.vocatus_notifications to authenticated;
grant update(read_at) on public.vocatus_notifications to authenticated;
create policy notifications_read on public.vocatus_notifications for select to authenticated
 using(user_id=(select auth.uid()) and (select vocatus_access.allowed(false)));
create policy notifications_mark on public.vocatus_notifications for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create or replace function vocatus_access.notify(p_user uuid,p_kind text,p_title text,p_body text,p_ref text,p_tag text)
returns void language sql security definer set search_path='' as $$
 insert into public.vocatus_notifications(user_id,kind,title,body,ref_id,tag)
 values(p_user,p_kind,left(p_title,200),left(coalesce(p_body,''),1000),p_ref,p_tag);
$$;
revoke all on function vocatus_access.notify(uuid,text,text,text,text,text) from public,anon,authenticated;

create or replace function vocatus_access.notify_admins(p_except uuid,p_kind text,p_title text,p_body text,p_ref text,p_tag text)
returns void language sql security definer set search_path='' as $$
 insert into public.vocatus_notifications(user_id,kind,title,body,ref_id,tag)
 select a.id,p_kind,left(p_title,200),left(coalesce(p_body,''),1000),p_ref,p_tag
 from vocatus_access.accounts a
 where a.role='admin' and a.status='approved' and a.active and a.id is distinct from p_except;
$$;
revoke all on function vocatus_access.notify_admins(uuid,text,text,text,text,text) from public,anon,authenticated;

-- 3. Reportes de planta: cualquier cuenta con permiso de escritura avisa un problema.
-- Quien lo envía ve los suyos; los administradores ven todos y los atienden.
create table if not exists public.vocatus_incidents (
 id uuid primary key default gen_random_uuid(),
 tag text check(tag is null or tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'),
 place text not null default '' check(length(place)<=120),
 title text not null check(length(trim(title)) between 3 and 200),
 details text not null default '' check(length(details)<=3000),
 severity text not null default 'media' check(severity in ('alta','media','baja')),
 status text not null default 'abierto' check(status in ('abierto','visto','resuelto')),
 order_id uuid references public.vocatus_work_orders(id),
 created_by uuid not null default auth.uid() references auth.users(id),
 created_by_name text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz,
 updated_by uuid references auth.users(id)
);
create index if not exists vocatus_incidents_status_idx on public.vocatus_incidents(status,created_at desc);
create index if not exists vocatus_incidents_created_by_idx on public.vocatus_incidents(created_by);
alter table public.vocatus_incidents enable row level security;
revoke all on public.vocatus_incidents from public,anon,authenticated;
grant select on public.vocatus_incidents to authenticated;
grant insert(tag,place,title,details,severity) on public.vocatus_incidents to authenticated;
grant update(status,order_id,updated_at,updated_by) on public.vocatus_incidents to authenticated;
create policy incidents_read on public.vocatus_incidents for select to authenticated
 using((select vocatus_access.allowed(false)) and (created_by=(select auth.uid()) or (select vocatus_access.current_is_admin())));
create policy incidents_insert on public.vocatus_incidents for insert to authenticated
 with check((select vocatus_access.allowed(true)) and created_by=(select auth.uid()) and status='abierto' and order_id is null);
create policy incidents_update on public.vocatus_incidents for update to authenticated
 using((select vocatus_access.current_is_admin()))
 with check((select vocatus_access.current_is_admin()) and updated_by=(select auth.uid()));

create or replace function vocatus_access.incident_before()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then new.created_by_name:=vocatus_access.account_name(new.created_by);new.created_at:=now();
 else new.updated_at:=now();new.updated_by:=auth.uid(); end if;
 return new;
end; $$;
create or replace function vocatus_access.incident_after()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  perform vocatus_access.notify_admins(new.created_by,'reporte',
   'Reporte de '||new.created_by_name||': '||new.title,
   concat_ws(' · ',coalesce(new.tag,nullif(new.place,'')),'Gravedad '||new.severity,nullif(new.details,'')),new.id::text,new.tag);
 elsif new.status is distinct from old.status and new.created_by<>auth.uid() then
  perform vocatus_access.notify(new.created_by,'reporte-estado',
   'Tu reporte «'||left(new.title,120)||'» '||case new.status when 'visto' then 'fue revisado' when 'resuelto' then 'quedó resuelto' else 'se reabrió' end,
   case when new.order_id is not null then 'Se creó una orden de trabajo.' else '' end,new.id::text,new.tag);
 end if;
 return null;
end; $$;
drop trigger if exists vocatus_incident_before on public.vocatus_incidents;
create trigger vocatus_incident_before before insert or update on public.vocatus_incidents for each row execute function vocatus_access.incident_before();
drop trigger if exists vocatus_incident_after on public.vocatus_incidents;
create trigger vocatus_incident_after after insert or update on public.vocatus_incidents for each row execute function vocatus_access.incident_after();

-- Borrar orden (solo administrador): se archiva y deja de verse; no se pierde el historial ni sus informes.
alter table public.vocatus_work_orders add column if not exists archived_at timestamptz;
alter table public.vocatus_work_orders add column if not exists archived_by uuid references auth.users(id);
create or replace function public.vocatus_delete_work_order(p_id uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if not vocatus_access.current_is_admin() then raise exception 'Solo un administrador puede borrar órdenes.' using errcode='42501'; end if;
 update public.vocatus_work_orders set archived_at=now(),archived_by=auth.uid() where id=p_id and archived_at is null;
 if not found then raise exception 'La orden no existe o ya fue borrada.'; end if;
end; $$;
revoke all on function public.vocatus_delete_work_order(uuid) from public,anon;
grant execute on function public.vocatus_delete_work_order(uuid) to authenticated;

-- 4. Órdenes: solo un administrador crea o edita y elige el responsable entre las cuentas activas.
-- El responsable (u otra cuenta, si la orden es antigua y no tiene responsable de la lista) puede iniciarla.
-- Cerrar sigue siendo con el informe (vocatus_save_work_report), sin cambios.
create or replace function public.vocatus_save_work_order(p_input jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare previous public.vocatus_work_orders; result jsonb; order_id uuid; due_date date; state text; stamp timestamptz:=now(); entry jsonb; tag text;
 admin boolean:=vocatus_access.current_is_admin(); assignee_id uuid; assignee_name text;
begin
 if not vocatus_auth.photo_access(true) then raise exception 'WORK_ACCESS_DENIED' using errcode='42501'; end if;
 tag:=p_input->>'tag';
 if tag is null or tag !~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$' then raise exception 'Equipo inválido'; end if;
 if nullif(p_input->>'id','') is not null then
  order_id:=(p_input->>'id')::uuid;
  select * into previous from public.vocatus_work_orders where id=order_id for update;
  if not found or previous.tag<>tag then raise exception 'Orden no encontrada para este equipo'; end if;
  if previous.archived_at is not null then raise exception 'La orden fue borrada'; end if;
  if previous.data->>'status'='completada' then raise exception 'La orden ya está completada'; end if;
  if (p_input->>'version')::integer is distinct from previous.revision then raise exception 'La orden cambió en otra ventana. Actualizá antes de editar.'; end if;
 else order_id:=pg_catalog.gen_random_uuid(); end if;
 if not admin then
  -- Sin ser administrador solo se puede iniciar una orden existente.
  if previous.id is null then raise exception 'Solo un administrador puede crear órdenes. Usá «Avisar un problema».' using errcode='42501'; end if;
  if nullif(previous.data->>'assigneeId','') is not null and previous.data->>'assigneeId'<>auth.uid()::text then raise exception 'Esta orden está asignada a otra persona.' using errcode='42501'; end if;
  if coalesce(p_input->>'status','')<>'en-curso' then raise exception 'Solo un administrador puede editar órdenes.' using errcode='42501'; end if;
  p_input:=jsonb_build_object('id',order_id,'tag',tag,'version',previous.revision,'status','en-curso');
 end if;
 result:=coalesce(previous.data,'{}'::jsonb)||p_input;
 if admin and nullif(result->>'assigneeId','') is not null then
  assignee_id:=(result->>'assigneeId')::uuid;
  assignee_name:=vocatus_access.active_account_name(assignee_id);
  if assignee_name is null then raise exception 'El responsable elegido no es una cuenta activa.'; end if;
  result:=result||jsonb_build_object('assignee',assignee_name);
 else assignee_id:=nullif(previous.data->>'assigneeId','')::uuid; end if;
 if length(trim(coalesce(result->>'title',''))) not between 1 and 200 or length(trim(coalesce(result->>'assignee',''))) not between 1 and 100 or length(coalesce(result->>'details',''))>3000 or length(coalesce(result->>'component',''))>100 then raise exception 'Revisá trabajo, responsable y alcance'; end if;
 if coalesce(result->>'due','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida'; end if;
 due_date:=(result->>'due')::date;
 if pg_catalog.to_char(due_date,'YYYY-MM-DD')<>result->>'due' then raise exception 'Fecha inválida'; end if;
 if coalesce(result->>'priority','media') not in ('alta','media','baja') or coalesce(result->>'type','inspeccion') not in ('preventivo','correctivo','inspeccion') then raise exception 'Prioridad o tipo inválido'; end if;
 state:=coalesce(result->>'status','pendiente');
 if state not in ('pendiente','en-curso') or previous.data->>'status'='en-curso' and state='pendiente' then raise exception 'Completá la orden mediante su informe'; end if;
 entry:=jsonb_build_object('at',stamp,'type',case when previous.id is null then 'creada' when previous.data->>'status'<>state then 'iniciada' else 'editada' end,'by',vocatus_access.account_name(auth.uid()));
 result:=jsonb_build_object('id',order_id,'code',coalesce(previous.data->>'code','OT-'||to_char(due_date,'YYYYMMDD')||'-'||upper(left(order_id::text,6))),'tag',tag,'title',trim(result->>'title'),'assignee',trim(result->>'assignee'),'assigneeId',assignee_id,'details',coalesce(result->>'details',''),'component',coalesce(result->>'component',''),'due',due_date::text,'priority',coalesce(result->>'priority','media'),'type',coalesce(result->>'type','inspeccion'),'status',state,'version',coalesce(previous.revision,0)+1,'created',coalesce(previous.data->>'created',stamp::text),'createdBy',coalesce(previous.data->>'createdBy',auth.uid()::text),'updated',stamp,'events',coalesce(previous.data->'events','[]'::jsonb)||jsonb_build_array(entry));
 insert into public.vocatus_work_orders(id,tag,revision,data,updated_at,updated_by) values(order_id,tag,(result->>'version')::integer,result,stamp,auth.uid()) on conflict(id) do update set revision=excluded.revision,data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 return result;
end; $$;
revoke all on function public.vocatus_save_work_order(jsonb) from public,anon;
grant execute on function public.vocatus_save_work_order(jsonb) to authenticated;

-- Avisos de órdenes: al asignar → al responsable; al iniciar o cerrar → a los administradores.
create or replace function vocatus_access.work_order_after()
returns trigger language plpgsql security definer set search_path='' as $$
declare nuevo text:=nullif(new.data->>'assigneeId',''); antes text:=case when tg_op='UPDATE' then nullif(old.data->>'assigneeId','') end;
 etiqueta text:=coalesce(new.data->>'code','')||' · '||new.tag;
begin
 if tg_op='UPDATE' and new.archived_at is not null and old.archived_at is null then
  if nuevo is not null and nuevo<>coalesce(auth.uid()::text,'') then
   perform vocatus_access.notify(nuevo::uuid,'orden','Se borró la orden: '||coalesce(new.data->>'title',''),etiqueta||' · ya no hay que hacerla',new.id::text,new.tag);
  end if;
  return null;
 end if;
 if nuevo is not null and nuevo is distinct from antes and nuevo<>coalesce(auth.uid()::text,'') then
  perform vocatus_access.notify(nuevo::uuid,'orden','Te asignaron una orden: '||coalesce(new.data->>'title',''),
   etiqueta||' · para el '||coalesce(new.data->>'due','')||' · prioridad '||coalesce(new.data->>'priority','media'),new.id::text,new.tag);
 end if;
 if tg_op='UPDATE' and new.data->>'status' is distinct from old.data->>'status' and new.data->>'status' in ('en-curso','completada') then
  perform vocatus_access.notify_admins(auth.uid(),case when new.data->>'status'='completada' then 'orden-cerrada' else 'orden' end,
   case when new.data->>'status'='completada' then 'Orden cerrada: ' else 'Orden iniciada: ' end||coalesce(new.data->>'title',''),
   etiqueta||' · por '||vocatus_access.account_name(auth.uid()),new.id::text,new.tag);
 end if;
 return null;
end; $$;
drop trigger if exists vocatus_work_order_after on public.vocatus_work_orders;
create trigger vocatus_work_order_after after insert or update on public.vocatus_work_orders for each row execute function vocatus_access.work_order_after();

-- Tiempo real para avisos, reportes y órdenes (respeta los permisos de arriba).
do $$
declare t text;
begin
 foreach t in array array['vocatus_notifications','vocatus_incidents','vocatus_work_orders'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
   execute format('alter publication supabase_realtime add table public.%I',t);
  end if;
 end loop;
end $$;

commit;
