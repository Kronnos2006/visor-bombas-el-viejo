-- Solo lectura. Ejecutar cada sentencia por separado si el cliente devuelve
-- únicamente el último conjunto de resultados. No incluye secretos ni contraseñas.
select jsonb_build_object(
 'photos',(select jsonb_build_object('count',count(*),'metadata_md5',md5(coalesce(string_agg(to_jsonb(p)::text,'' order by entity_key,slot),''))) from public.vocatus_photos p),
 'versions',(select jsonb_build_object('count',count(*),'metadata_md5',md5(coalesce(string_agg(to_jsonb(p)::text,'' order by entity_key,slot,revision),''))) from public.vocatus_photo_versions p),
 'storage',(select jsonb_build_object('count',count(*),'metadata_md5',md5(coalesce(string_agg(to_jsonb(p)::text,'' order by bucket_id,name),''))) from storage.objects p),
 'orders',(select count(*) from public.vocatus_work_orders),
 'reports',(select count(*) from public.vocatus_work_reports)
) baseline;

select schemaname,tablename,policyname,roles,cmd,qual,with_check
from pg_policies where schemaname in ('public','vocatus_auth','storage')
order by schemaname,tablename,policyname;

select n.nspname,p.proname,p.prosecdef,p.proconfig,pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='vocatus_auth' or (n.nspname='public' and p.proname like 'vocatus%');
