-- PROPUESTA PARA REVISIÓN. NO APLICADA.
-- Base exclusiva: gtfqhljbxyanfyrarykw / visor-bombas-el-viejo.
-- Ejecutar completa en una transacción, solo tras aprobación del propietario.
begin;
create schema vocatus_access;
revoke all on schema vocatus_access from public, anon, authenticated;
grant usage on schema vocatus_access to authenticated, service_role;

create table vocatus_access.accounts (
 id uuid primary key references auth.users(id),
 username text not null unique check (username ~ '^[a-z0-9._-]{3,40}$'),
 name text not null check (length(name) between 1 and 80),
 role text not null default 'usuario' check (role in ('usuario','admin')),
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 active boolean not null default true,
 must_change boolean not null default false,
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id),
 revoked_before timestamptz
);
create table vocatus_access.audit (
 id bigint generated always as identity primary key,
 at timestamptz not null default now(),
 actor uuid references auth.users(id),
 action text not null,
 target uuid references auth.users(id),
 detail jsonb not null default '{}'::jsonb
);
-- Referencia de reversión específica de esta instalación, sin correos ni filas históricas.
create table vocatus_access.installation (
 singleton boolean primary key default true check(singleton),
 members_md5 text not null,
 installed_at timestamptz not null default now()
);
insert into vocatus_access.installation(members_md5)
select md5(coalesce(string_agg(to_jsonb(m)::text,'' order by email),'')) from vocatus_auth.members m;
alter table vocatus_access.installation enable row level security;
alter table vocatus_access.accounts enable row level security;
alter table vocatus_access.audit enable row level security;
revoke all on all tables in schema vocatus_access from public,anon,authenticated;
-- Las tablas privadas no se exponen: solo funciones con argumentos y roles limitados.

-- Incorporar solo miembros ya autorizados y confirmados. No cambia miembros ni Auth.
insert into vocatus_access.accounts(id,username,name,role,status,active)
select u.id,left(regexp_replace(lower(split_part(u.email,'@',1)),'[^a-z0-9._-]','','g'),25)||'-'||left(u.id::text,8),
 left(split_part(u.email,'@',1),80),case when m.role='admin' then 'admin' else 'usuario' end,'approved',m.active
from auth.users u join vocatus_auth.members m on m.email=lower(u.email)
where u.email_confirmed_at is not null;

do $$ begin
 if not exists(select 1 from vocatus_access.accounts where role='admin' and status='approved' and active)
 then raise exception 'No hay administrador confirmado existente. No aplicar sin plan de bootstrap aprobado.'; end if;
end $$;

-- Una renovación del JWT conserva session_id/created_at: no puede reabrir una sesión revocada.
create function vocatus_access.session_allowed(p_revoked_before timestamptz)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from auth.sessions sess where sess.id::text=auth.jwt()->>'session_id' and sess.user_id=auth.uid()
  and (p_revoked_before is null or sess.created_at>p_revoked_before)
 );
$$;
revoke all on function vocatus_access.session_allowed(timestamptz) from public,anon;
grant execute on function vocatus_access.session_allowed(timestamptz) to authenticated;

create function vocatus_access.allowed(p_write boolean default false)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists (
  select 1 from auth.users u join vocatus_auth.members m on m.email=lower(u.email)
  left join vocatus_access.accounts a on a.id=u.id
  where u.id=auth.uid() and u.email_confirmed_at is not null and m.active
   and vocatus_access.session_allowed(a.revoked_before)
   and (not p_write or m.role in ('admin','editor'))
   and (a.id is null or (a.status='approved' and a.active and not a.must_change))
 );
$$;
revoke all on function vocatus_access.allowed(boolean) from public,anon;
grant execute on function vocatus_access.allowed(boolean) to authenticated;

create function vocatus_access.is_admin(p_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from vocatus_access.accounts a join auth.users u on u.id=a.id
 join vocatus_auth.members m on m.email=lower(u.email)
 where a.id=p_id and a.role='admin' and a.status='approved' and a.active and not a.must_change
 and m.active and u.email_confirmed_at is not null);
$$;
revoke all on function vocatus_access.is_admin(uuid) from public,anon,authenticated;
grant execute on function vocatus_access.is_admin(uuid) to service_role;

-- Identidad propia: accesible a pendientes para mostrar su estado, sin devolver datos del visor.
create function vocatus_access.self_account()
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',a.id,'username',a.username,'name',a.name,'email',u.email,
 'role',a.role,'status',a.status,'active',a.active,'mustChange',a.must_change,
 'createdAt',a.created_at,'sessionValid',vocatus_access.session_allowed(a.revoked_before))
 from vocatus_access.accounts a join auth.users u on u.id=a.id where a.id=auth.uid();
$$;
revoke all on function vocatus_access.self_account() from public,anon;
grant execute on function vocatus_access.self_account() to authenticated;
create function public.vocatus_account() returns jsonb language sql stable security invoker set search_path='' as $$
 select vocatus_access.self_account();
$$;
revoke all on function public.vocatus_account() from public,anon;
grant execute on function public.vocatus_account() to authenticated;

-- El solicitante solo puede crear su perfil pendiente. Nunca puede escribir rol/aprobación.
create function vocatus_access.request(p_username text,p_name text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); uname text:=lower(trim(p_username)); person text:=trim(p_name); membership text;
begin
 if uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if uname !~ '^[a-z0-9._-]{3,40}$' or length(person) not between 1 and 80 then raise exception 'Datos de solicitud inválidos'; end if;
 if exists(select 1 from vocatus_access.accounts where id=uid) then
  return vocatus_access.self_account();
 end if;
 -- Mantener el acceso de miembros activos incorporados después de la migración.
 select m.role into membership from vocatus_auth.members m join auth.users u on m.email=lower(u.email)
 where u.id=uid and m.active and u.email_confirmed_at is not null;
 if membership='viewer' then
  raise exception 'Tu membresía de consulta sigue vigente. Pedí a un administrador que revise tu perfil antes de solicitar permisos de escritura.' using errcode='42501';
 elsif membership in ('admin','editor') then
  insert into vocatus_access.accounts(id,username,name,role,status)
  values(uid,uname,person,case when membership='admin' then 'admin' else 'usuario' end,'approved');
  insert into vocatus_access.audit(actor,action,target) values(uid,'existing_member_profile_restored',uid);
 else
  insert into vocatus_access.accounts(id,username,name) values(uid,uname,person);
  insert into vocatus_access.audit(actor,action,target) values(uid,'access_requested',uid);
 end if;
 return vocatus_access.self_account();
end;
$$;
revoke all on function vocatus_access.request(text,text) from public,anon;
grant execute on function vocatus_access.request(text,text) to authenticated;
create function public.vocatus_request_access(p_username text,p_name text)
returns jsonb language sql security invoker set search_path='' as $$
 select vocatus_access.request(p_username,p_name);
$$;
revoke all on function public.vocatus_request_access(text,text) from public,anon;
grant execute on function public.vocatus_request_access(text,text) to authenticated;

-- Servicio: el servidor valida el JWT con Auth y pasa exclusivamente su UUID verificado.
-- Ninguna llamada desde navegador tiene EXECUTE de estas funciones.
create function vocatus_access.manage(p_actor uuid,p_action text,p_target uuid,p_input jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare target vocatus_access.accounts; result jsonb; admins integer; mail text; action text:=p_action;
begin
 -- Serializa aprobaciones, cambios de rol y desactivaciones para proteger el último admin.
 perform pg_catalog.pg_advisory_xact_lock(18033,20261102);
 if not vocatus_access.is_admin(p_actor) then raise exception 'ADMIN_ONLY' using errcode='42501'; end if;
 if action='list' then
  return (select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'username',a.username,'name',a.name,
   'email',u.email,'role',a.role,'status',a.status,'active',a.active,'mustChange',a.must_change,'createdAt',a.created_at)
   order by a.created_at),'[]'::jsonb) from vocatus_access.accounts a join auth.users u on u.id=a.id);
 end if;
 if action='audit' then
  return (select coalesce(jsonb_agg(x order by x.id desc),'[]'::jsonb) from
   (select l.id,l.at,coalesce(a.username,l.actor::text) actor,l.action,l.detail::text detail
    from vocatus_access.audit l left join vocatus_access.accounts a on a.id=l.actor order by l.id desc limit 200) x);
 end if;
 select * into target from vocatus_access.accounts where id=p_target for update;
 if not found then raise exception 'Cuenta no encontrada'; end if;
 if action in ('approve','reject') then
  if p_actor=p_target then raise exception 'No podés revisar tu propia solicitud' using errcode='42501'; end if;
  if target.status<>'pending' then raise exception 'La solicitud ya fue revisada'; end if;
  if action='approve' then
   select email into mail from auth.users where id=p_target and email_confirmed_at is not null;
   if mail is null then raise exception 'El correo todavía no fue confirmado'; end if;
   -- Solo añade miembros NUEVOS. Nunca cambia el rol o estado de un miembro existente.
   if exists(select 1 from vocatus_auth.members where email=lower(mail) and (not active or role='viewer'))
   then raise exception 'Existe una membresía restringida: requiere revisión del propietario'; end if;
   insert into vocatus_auth.members(email,role,active) values(lower(mail),'editor',true) on conflict(email) do nothing;
  end if;
  update vocatus_access.accounts set status=case when action='approve' then 'approved' else 'rejected' end,
   reviewed_at=now(),reviewed_by=p_actor where id=p_target;
 elsif action='update' then
  if p_actor=p_target then raise exception 'No podés cambiar tu propio rol ni estado' using errcode='42501'; end if;
  if p_input ? 'role' and p_input->>'role' not in ('admin','usuario') then raise exception 'Rol inválido'; end if;
  if p_input ? 'active' and jsonb_typeof(p_input->'active')<>'boolean' then raise exception 'Estado inválido'; end if;
  if target.role='admin' and target.active and target.status='approved' and
   (coalesce(p_input->>'role',target.role)<>'admin' or not coalesce((p_input->>'active')::boolean,target.active)) then
   select count(*) into admins from vocatus_access.accounts a where vocatus_access.is_admin(a.id);
   if admins<=1 then raise exception 'Tiene que quedar al menos un administrador activo'; end if;
  end if;
  update vocatus_access.accounts set role=coalesce(p_input->>'role',role),
   active=coalesce((p_input->>'active')::boolean,active),
   revoked_before=case when p_input->>'active'='false' then now() else revoked_before end where id=p_target;
 elsif action='reset_begin' then
  -- Cierra las sesiones anteriores antes de restablecer Auth. Un fallo de Auth no deja acceso abierto.
  if p_actor=p_target then raise exception 'Usá cambiar contraseña para tu propia cuenta'; end if;
  if target.role='admin' and target.active then
   select count(*) into admins from vocatus_access.accounts a where vocatus_access.is_admin(a.id);
   if admins<=1 then raise exception 'No se puede bloquear al último administrador'; end if;
  end if;
  update vocatus_access.accounts set must_change=true,revoked_before=now() where id=p_target;
 else raise exception 'Acción no permitida'; end if;
 insert into vocatus_access.audit(actor,action,target,detail) values(p_actor,action,p_target,
  case when action='update' then jsonb_build_object('role',p_input->>'role','active',p_input->'active') else '{}'::jsonb end);
 select to_jsonb(a) into result from vocatus_access.accounts a where id=p_target;
 return result;
end;
$$;
revoke all on function vocatus_access.manage(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function vocatus_access.manage(uuid,text,uuid,jsonb) to service_role;
create function public.vocatus_manage_account(p_actor uuid,p_action text,p_target uuid,p_input jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$
 select vocatus_access.manage(p_actor,p_action,p_target,p_input);
$$;
revoke all on function public.vocatus_manage_account(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.vocatus_manage_account(uuid,text,uuid,jsonb) to service_role;

create function vocatus_access.lookup(p_identifier text)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('email',u.email) from vocatus_access.accounts a join auth.users u on u.id=a.id
 where a.username=lower(trim(p_identifier));
$$;
revoke all on function vocatus_access.lookup(text) from public,anon,authenticated;
grant execute on function vocatus_access.lookup(text) to service_role;
create function public.vocatus_account_email(p_identifier text)
returns jsonb language sql stable security invoker set search_path='' as $$ select vocatus_access.lookup(p_identifier); $$;
revoke all on function public.vocatus_account_email(text) from public,anon,authenticated;
grant execute on function public.vocatus_account_email(text) to service_role;

create function vocatus_access.register_managed(p_actor uuid,p_target uuid,p_username text,p_name text)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(18033,20261102);
 if not vocatus_access.is_admin(p_actor) or p_actor=p_target then raise exception 'ADMIN_ONLY' using errcode='42501'; end if;
 insert into vocatus_access.accounts(id,username,name) values(p_target,lower(trim(p_username)),trim(p_name));
 insert into vocatus_access.audit(actor,action,target) values(p_actor,'account_created',p_target);
end;
$$;
revoke all on function vocatus_access.register_managed(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function vocatus_access.register_managed(uuid,uuid,text,text) to service_role;
create function public.vocatus_register_managed(p_actor uuid,p_target uuid,p_username text,p_name text)
returns void language sql security invoker set search_path='' as $$ select vocatus_access.register_managed(p_actor,p_target,p_username,p_name); $$;
revoke all on function public.vocatus_register_managed(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.vocatus_register_managed(uuid,uuid,text,text) to service_role;

-- Registro de acciones delicadas del servidor; exige administrador actual.
create function vocatus_access.record_action(p_actor uuid,p_action text,p_detail jsonb)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not vocatus_access.is_admin(p_actor) then raise exception 'ADMIN_ONLY' using errcode='42501'; end if;
 if length(p_action) not between 1 and 300 or pg_column_size(p_detail)>4096 then raise exception 'Entrada de bitácora inválida'; end if;
 insert into vocatus_access.audit(actor,action,detail) values(p_actor,p_action,p_detail);
end;
$$;
revoke all on function vocatus_access.record_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function vocatus_access.record_action(uuid,text,jsonb) to service_role;
create function public.vocatus_record_action(p_actor uuid,p_action text,p_detail jsonb default '{}'::jsonb)
returns void language sql security invoker set search_path='' as $$ select vocatus_access.record_action(p_actor,p_action,p_detail); $$;
revoke all on function public.vocatus_record_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.vocatus_record_action(uuid,text,jsonb) to service_role;

-- Solo después de verificar contraseña actual y actualización en Auth desde el servidor.
create function vocatus_access.password_changed(p_actor uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 update vocatus_access.accounts set must_change=false,revoked_before=now() where id=p_actor;
 if not found then raise exception 'Cuenta no encontrada'; end if;
 insert into vocatus_access.audit(actor,action,target) values(p_actor,'password_changed',p_actor);
end;
$$;
revoke all on function vocatus_access.password_changed(uuid) from public,anon,authenticated;
grant execute on function vocatus_access.password_changed(uuid) to service_role;
create function public.vocatus_password_changed(p_actor uuid)
returns void language sql security invoker set search_path='' as $$ select vocatus_access.password_changed(p_actor); $$;
revoke all on function public.vocatus_password_changed(uuid) from public,anon,authenticated;
grant execute on function public.vocatus_password_changed(uuid) to service_role;

-- Guardia adicional para la función SECURITY DEFINER de publicación de fotos existente.
create function vocatus_access.guard_photo_write()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if auth.uid() is not null and not vocatus_access.allowed(true) then
  raise exception 'ACCOUNT_ACCESS_DENIED' using errcode='42501';
 end if;
 return new;
end;
$$;
revoke all on function vocatus_access.guard_photo_write() from public,anon;
grant execute on function vocatus_access.guard_photo_write() to authenticated;
create trigger vocatus_account_photo_guard before insert or update on public.vocatus_photos
for each row execute function vocatus_access.guard_photo_write();
create trigger vocatus_account_version_guard before insert on public.vocatus_photo_versions
for each row execute function vocatus_access.guard_photo_write();

-- Políticas RESTRICTIVE: complementan, sin reemplazar, la autorización de fotos y trabajos.
do $$ declare tbl text; begin
 foreach tbl in array array['vocatus_photos','vocatus_photo_versions','vocatus_work_orders','vocatus_work_reports'] loop
  execute format('create policy vocatus_account_read on public.%I as restrictive for select to authenticated using ((select vocatus_access.allowed(false)))',tbl);
  execute format('create policy vocatus_account_insert on public.%I as restrictive for insert to authenticated with check ((select vocatus_access.allowed(true)))',tbl);
  execute format('create policy vocatus_account_update on public.%I as restrictive for update to authenticated using ((select vocatus_access.allowed(true))) with check ((select vocatus_access.allowed(true)))',tbl);
 end loop;
end $$;
create policy vocatus_account_storage_read on storage.objects as restrictive for select to authenticated
using (bucket_id not in ('vocatus-photos','vocatus-maintenance') or (select vocatus_access.allowed(false)));
create policy vocatus_account_storage_insert on storage.objects as restrictive for insert to authenticated
with check (bucket_id not in ('vocatus-photos','vocatus-maintenance') or (select vocatus_access.allowed(true)));

-- Solo admin archiva informes. No restringe las actualizaciones operativas del cierre de órdenes.
create function vocatus_access.guard_report_archive()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if (to_jsonb(new)-'archived_at') is distinct from (to_jsonb(old)-'archived_at') then
  raise exception 'Los informes guardados son inmutables' using errcode='42501';
 end if;
 if new.archived_at is distinct from old.archived_at then
  if not vocatus_access.allowed(true) or not vocatus_access.is_admin(auth.uid()) then
   raise exception 'ADMIN_ONLY' using errcode='42501';
  end if;
  insert into vocatus_access.audit(actor,action,detail) values(auth.uid(),'report_archive',
   jsonb_build_object('tag',old.tag,'source_id',old.source_id));
 end if;
 return new;
end;
$$;
revoke all on function vocatus_access.guard_report_archive() from public,anon,authenticated;
create trigger vocatus_account_report_guard before update on public.vocatus_work_reports
for each row execute function vocatus_access.guard_report_archive();

insert into vocatus_access.audit(action,detail) values('access_schema_initialized','{"source":"existing_authorized_members"}');
commit;
