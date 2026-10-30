-- Exportacion logica de la aplicacion; no incluye sesiones, claves ni contrasenas.
select jsonb_build_object(
 'project','gtfqhljbxyanfyrarykw','exported_at',now(),
 'vocatus_photos',(select coalesce(jsonb_agg(to_jsonb(t) order by t.entity_key,t.slot),'[]'::jsonb) from public.vocatus_photos t),
 'vocatus_photo_versions',(select coalesce(jsonb_agg(to_jsonb(t) order by t.entity_key,t.slot,t.revision),'[]'::jsonb) from public.vocatus_photo_versions t),
 'members',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from vocatus_auth.members t),
 'project_info',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from vocatus_private.project_info t),
 'storage_buckets',(select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) from storage.buckets t where id='vocatus-photos'),
 'storage_objects',(select coalesce(jsonb_agg(to_jsonb(t) order by t.name),'[]'::jsonb) from storage.objects t where bucket_id='vocatus-photos'),
 'structure',jsonb_build_object(
  'columns',(select jsonb_agg(to_jsonb(t)) from (select table_schema,table_name,column_name,ordinal_position,data_type,udt_schema,udt_name,column_default,is_nullable from information_schema.columns where table_schema in ('public','vocatus_auth','vocatus_private') order by table_schema,table_name,ordinal_position) t),
  'constraints',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'name',con.conname,'definition',pg_catalog.pg_get_constraintdef(con.oid,true))) from pg_catalog.pg_constraint con join pg_catalog.pg_class c on c.oid=con.conrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','vocatus_auth','vocatus_private')),
  'functions',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',p.proname,'definition',pg_catalog.pg_get_functiondef(p.oid),'acl',p.proacl)) from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','vocatus_auth','vocatus_private') and p.prokind='f'),
  'indexes',(select jsonb_agg(to_jsonb(t)) from pg_catalog.pg_indexes t where schemaname in ('public','vocatus_auth','vocatus_private')),
  'policies',(select jsonb_agg(to_jsonb(t)) from pg_catalog.pg_policies t where schemaname in ('public','vocatus_auth','vocatus_private','storage')),
  'tables',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'name',c.relname,'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,'acl',c.relacl)) from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','vocatus_auth','vocatus_private') and c.relkind='r'),
  'grants',(select jsonb_agg(to_jsonb(t)) from information_schema.role_table_grants t where table_schema in ('public','vocatus_auth','vocatus_private')),
  'triggers',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'definition',pg_catalog.pg_get_triggerdef(t.oid))) from pg_catalog.pg_trigger t join pg_catalog.pg_class c on c.oid=t.tgrelid join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','vocatus_auth','vocatus_private') and not t.tgisinternal)
 )
) as backup;
