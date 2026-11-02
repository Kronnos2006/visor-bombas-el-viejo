-- Recuperación puntual por el propietario; NO ejecutar sin revisión/aprobación específica.
-- No sustituye el rollback completo inicial. No elimina perfiles, bitácora ni filas históricas.
-- Solo para un miembro importado en la instalación, activo y confirmado en members/Auth.
-- Mantiene rol, must_change y revoked_before: NO revive sesiones ni evita cambiar contraseña.
-- Completar el UUID y confirmar que la pérdida de acceso no fue una revocación intencional.
begin;
do $$
declare
 member_id uuid := null;
 confirmed_unintentional_loss boolean := false;
begin
 if member_id is null or not confirmed_unintentional_loss then
  raise exception 'Requiere UUID del miembro y aprobación explícita del propietario';
 end if;
 if not exists(
  select 1 from vocatus_access.accounts a cross join vocatus_access.installation i
  join auth.users u on u.id=a.id join vocatus_auth.members m on m.email=lower(u.email)
  where a.id=member_id and a.created_at=i.installed_at and m.active
   and u.email_confirmed_at is not null
 ) then raise exception 'No es un miembro inicial activo confirmado; no recuperar automáticamente'; end if;
 update vocatus_access.accounts set active=true,status='approved' where id=member_id;
 insert into vocatus_access.audit(action,target,detail)
 values('owner_recovers_initial_member_access',member_id,'{"sessions_restored":false,"role_changed":false}');
end $$;
commit;
-- El miembro debe iniciar sesión de nuevo. Si falla por otra causa, no quitar guardias globales:
-- detener el Preview, conservar el respaldo y revisar esa causa antes de cualquier otro SQL.
