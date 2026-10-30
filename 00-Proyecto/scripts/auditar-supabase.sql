-- Solo lectura. Puede ejecutarse desde el SQL Editor o mediante el script de auditoria.
with current_missing as (
 select count(*) as n from public.vocatus_photos p
 where not exists(select 1 from storage.objects o where o.bucket_id='vocatus-photos' and o.name=p.object_path)
), versions_missing as (
 select count(*) as n from public.vocatus_photo_versions p
 where not exists(select 1 from storage.objects o where o.bucket_id='vocatus-photos' and o.name=p.object_path)
), version_mismatch as (
 select count(*) as n from public.vocatus_photos p
 where not exists(select 1 from public.vocatus_photo_versions v
  where (v.entity_key,v.slot,v.revision,v.object_path,v.mime,v.bytes,v.updated_by,v.updated_at)
   is not distinct from (p.entity_key,p.slot,p.revision,p.object_path,p.mime,p.bytes,p.updated_by,p.updated_at))
), metadata_mismatch as (
 select count(*) as n from public.vocatus_photo_versions p
 join storage.objects o on o.bucket_id='vocatus-photos' and o.name=p.object_path
 where p.bytes is distinct from (o.metadata->>'size')::bigint or p.mime is distinct from o.metadata->>'mimetype'
), orphans as (
 select count(*) as n from storage.objects o where o.bucket_id='vocatus-photos'
 and not exists(select 1 from public.vocatus_photos p where p.object_path=o.name)
 and not exists(select 1 from public.vocatus_photo_versions v where v.object_path=o.name)
), checks as (
 select 'archivos_actuales' as id, 'error' as severity, n=0 as ok, n as affected from current_missing
 union all select 'archivos_versiones','error',n=0,n from versions_missing
 union all select 'historial_actual','error',n=0,n from version_mismatch
 union all select 'metadatos_archivos','error',n=0,n from metadata_mismatch
 union all select 'archivos_sin_referencia','warning',n=0,n from orphans
 union all select 'bucket_privado','error',
  coalesce((select not public and file_size_limit=8388608
   and allowed_mime_types @> array['image/jpeg','image/png','image/webp']
   and allowed_mime_types <@ array['image/jpeg','image/png','image/webp']
   from storage.buckets where id='vocatus-photos'),false),null::bigint
 union all select 'realtime_fotos','error',exists(
  select 1 from pg_catalog.pg_publication_tables where pubname='supabase_realtime'
   and schemaname='public' and tablename='vocatus_photos'),null::bigint
 union all select 'rls_tablas','error',count(*)=4 and bool_and(c.relrowsecurity),null::bigint
 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace
 where (n.nspname,c.relname) in (('public','vocatus_photos'),('public','vocatus_photo_versions'),
  ('vocatus_auth','members'),('vocatus_private','project_info')) and c.relkind='r'
 union all select 'sin_escritura_directa','error',
  not (pg_catalog.has_table_privilege('authenticated','public.vocatus_photos','INSERT,UPDATE,DELETE')
   or pg_catalog.has_table_privilege('authenticated','public.vocatus_photo_versions','INSERT,UPDATE,DELETE')
   or pg_catalog.has_table_privilege('authenticated','vocatus_auth.members','SELECT,INSERT,UPDATE,DELETE')),null::bigint
 union all select 'sin_lectura_anonima','error',
  not (pg_catalog.has_table_privilege('anon','public.vocatus_photos','SELECT')
   or pg_catalog.has_table_privilege('anon','public.vocatus_photo_versions','SELECT')
   or pg_catalog.has_table_privilege('anon','vocatus_auth.members','SELECT')
   or pg_catalog.has_table_privilege('anon','vocatus_private.project_info','SELECT')),null::bigint
 union all select 'funciones_publicas_protegidas','error',
  not pg_catalog.has_function_privilege('anon','public.vocatus_publish_photo(text,text,bigint,text)','EXECUTE')
  and not pg_catalog.has_function_privilege('anon','public.vocatus_photo_permissions()','EXECUTE'),null::bigint
 union all select 'miembro_confirmado','error',exists(
  select 1 from vocatus_auth.members m join auth.users u on lower(u.email)=m.email
  where m.active and m.role in ('admin','editor') and u.email_confirmed_at is not null),null::bigint
)
select jsonb_build_object(
 'version',1,'captured_at',now(),
 'counts',jsonb_build_object('current',(select count(*) from public.vocatus_photos),
  'versions',(select count(*) from public.vocatus_photo_versions),
  'objects',(select count(*) from storage.objects where bucket_id='vocatus-photos'),
  'storage_bytes',(select coalesce(sum((metadata->>'size')::bigint),0) from storage.objects where bucket_id='vocatus-photos')),
 'checks',(select jsonb_agg(to_jsonb(c) order by id) from checks c),
 'limits',jsonb_build_array('No prueba clics ni sincronizacion real entre dispositivos.',
  'No comprueba contrasenas filtradas, SMTP ni URLs de Auth.',
  'No descarga imagenes ni acredita un respaldo restaurable.')
) as audit;
