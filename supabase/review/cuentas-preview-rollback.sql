-- REVERSIÓN PROPUESTA; requiere aprobación independiente antes de ejecutar.
-- Base: gtfqhljbxyanfyrarykw. Primero deshabilitar el Preview o limitar su acceso.
-- Exportar vocatus_access.accounts y vocatus_access.audit a un respaldo PRIVADO.
-- Esta reversión SOLO es válida antes de solicitudes, aprobaciones o cambios de cuentas.
-- Si ya hay actividad, ABORTA y se diseña otra reversión sin perder cuentas ni bitácora.
begin;
do $$ begin
 if (select md5(coalesce(string_agg(to_jsonb(m)::text,'' order by email),'')) from vocatus_auth.members m)
 is distinct from (select members_md5 from vocatus_access.installation where singleton) then
  raise exception 'Miembros cambiaron: no revertir automáticamente';
 end if;
 if exists(select 1 from vocatus_access.audit where action<>'access_schema_initialized') then
  raise exception 'Hay actividad de cuentas: conservar perfiles y bitácora, diseñar reversión específica';
 end if;
end $$;
drop trigger vocatus_account_report_guard on public.vocatus_work_reports;
drop trigger vocatus_account_version_guard on public.vocatus_photo_versions;
drop trigger vocatus_account_photo_guard on public.vocatus_photos;
do $$ declare tbl text; begin
 foreach tbl in array array['vocatus_photos','vocatus_photo_versions','vocatus_work_orders','vocatus_work_reports'] loop
  execute format('drop policy vocatus_account_read on public.%I',tbl);
  execute format('drop policy vocatus_account_insert on public.%I',tbl);
  execute format('drop policy vocatus_account_update on public.%I',tbl);
 end loop;
end $$;
drop policy vocatus_account_storage_read on storage.objects;
drop policy vocatus_account_storage_insert on storage.objects;
drop function public.vocatus_account();
drop function public.vocatus_request_access(text,text);
drop function public.vocatus_manage_account(uuid,text,uuid,jsonb);
drop function public.vocatus_account_email(text);
drop function public.vocatus_register_managed(uuid,uuid,text,text);
drop function public.vocatus_record_action(uuid,text,jsonb);
drop function public.vocatus_password_changed(uuid);
-- Solo objetos del esquema NUEVO. No toca los esquemas public, auth, storage o vocatus_auth.
drop schema vocatus_access cascade;
commit;
