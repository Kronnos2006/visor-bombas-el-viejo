-- ESQUEMA DE PRUEBA: solo DDL/grants, sin filas ni datos reales.
-- Ejecutar exclusivamente en el proyecto temporal de pruebas.
begin;
create schema vocatus_auth;
revoke all on schema vocatus_auth from public,anon;
grant usage on schema vocatus_auth to authenticated,service_role;
create table "vocatus_auth"."members" (
 "email" text not null,
 "role" text not null,
 "active" boolean default true not null,
 constraint "members_email_check" CHECK ((email = lower(email))),
 constraint "members_pkey" PRIMARY KEY (email),
 constraint "members_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text])))
);
alter table "vocatus_auth"."members" enable row level security;
revoke all on "vocatus_auth"."members" from public,anon,authenticated,service_role;
create table "public"."vocatus_photos" (
 "entity_key" text not null,
 "slot" text not null,
 "revision" bigint not null,
 "object_path" text not null,
 "mime" text not null,
 "bytes" integer not null,
 "updated_at" timestamp with time zone default now() not null,
 "updated_by" uuid not null,
 constraint "vocatus_photos_bytes_check" CHECK (((bytes >= 1) AND (bytes <= 8388608))),
 constraint "vocatus_photos_entity_key_check" CHECK (((length(entity_key) >= 2) AND (length(entity_key) <= 2000))),
 constraint "vocatus_photos_mime_check" CHECK ((mime = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
 constraint "vocatus_photos_object_path_check" CHECK ((object_path ~~ 'vocatus/%'::text)),
 constraint "vocatus_photos_pkey" PRIMARY KEY (entity_key, slot),
 constraint "vocatus_photos_revision_check" CHECK ((revision > 0)),
 constraint "vocatus_photos_slot_check" CHECK ((slot = ANY (ARRAY['placa1'::text, 'placa2'::text, 'bomba'::text, 'posicion'::text, 'motor'::text, 'sello'::text, 'empaque'::text, 'orings'::text, 'rodamientos'::text, 'acople'::text]))),
 constraint "vocatus_photos_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
alter table "public"."vocatus_photos" enable row level security;
revoke all on "public"."vocatus_photos" from public,anon,authenticated,service_role;
create table "public"."vocatus_photo_versions" (
 "entity_key" text not null,
 "slot" text not null,
 "revision" bigint not null,
 "object_path" text not null,
 "mime" text not null,
 "bytes" integer not null,
 "updated_at" timestamp with time zone default now() not null,
 "updated_by" uuid not null,
 constraint "vocatus_photo_versions_pkey" PRIMARY KEY (entity_key, slot, revision),
 constraint "vocatus_photos_bytes_check" CHECK (((bytes >= 1) AND (bytes <= 8388608))),
 constraint "vocatus_photos_entity_key_check" CHECK (((length(entity_key) >= 2) AND (length(entity_key) <= 2000))),
 constraint "vocatus_photos_mime_check" CHECK ((mime = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text]))),
 constraint "vocatus_photos_object_path_check" CHECK ((object_path ~~ 'vocatus/%'::text)),
 constraint "vocatus_photos_revision_check" CHECK ((revision > 0)),
 constraint "vocatus_photos_slot_check" CHECK ((slot = ANY (ARRAY['placa1'::text, 'placa2'::text, 'bomba'::text, 'posicion'::text, 'motor'::text, 'sello'::text, 'empaque'::text, 'orings'::text, 'rodamientos'::text, 'acople'::text])))
);
alter table "public"."vocatus_photo_versions" enable row level security;
revoke all on "public"."vocatus_photo_versions" from public,anon,authenticated,service_role;
create table "public"."vocatus_work_orders" (
 "id" uuid not null,
 "tag" text not null,
 "revision" integer not null,
 "data" jsonb not null,
 "updated_at" timestamp with time zone default now() not null,
 "updated_by" uuid not null,
 constraint "vocatus_work_orders_check" CHECK (((jsonb_typeof(data) = 'object'::text) AND ((data ->> 'id'::text) = (id)::text) AND ((data ->> 'tag'::text) = tag) AND ((data ->> 'status'::text) = ANY (ARRAY['pendiente'::text, 'en-curso'::text, 'completada'::text])))),
 constraint "vocatus_work_orders_pkey" PRIMARY KEY (id),
 constraint "vocatus_work_orders_revision_check" CHECK ((revision > 0)),
 constraint "vocatus_work_orders_tag_check" CHECK ((tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'::text)),
 constraint "vocatus_work_orders_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
alter table "public"."vocatus_work_orders" enable row level security;
revoke all on "public"."vocatus_work_orders" from public,anon,authenticated,service_role;
create table "public"."vocatus_work_reports" (
 "tag" text not null,
 "source_id" text not null,
 "work_order_id" uuid,
 "data" jsonb not null,
 "created_at" timestamp with time zone default now() not null,
 "created_by" uuid not null,
 "archived_at" timestamp with time zone,
 constraint "vocatus_work_reports_check" CHECK (((jsonb_typeof(data) = 'object'::text) AND ((data ->> 'tag'::text) = tag) AND ((data ->> 'id'::text) = source_id))),
 constraint "vocatus_work_reports_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id),
 constraint "vocatus_work_reports_pkey" PRIMARY KEY (tag, source_id),
 constraint "vocatus_work_reports_source_id_check" CHECK (((length(source_id) >= 1) AND (length(source_id) <= 100))),
 constraint "vocatus_work_reports_tag_check" CHECK ((tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'::text)),
 constraint "vocatus_work_reports_work_order_id_fkey" FOREIGN KEY (work_order_id) REFERENCES vocatus_work_orders(id)
);
alter table "public"."vocatus_work_reports" enable row level security;
revoke all on "public"."vocatus_work_reports" from public,anon,authenticated,service_role;
CREATE OR REPLACE FUNCTION vocatus_auth.photo_access(p_write boolean DEFAULT false)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select (select auth.uid()) is not null and exists (
   select 1 from vocatus_auth.members m
   join auth.users u on u.id = (select auth.uid())
   where m.email = lower(u.email) and u.email_confirmed_at is not null
     and m.active and (not p_write or m.role in ('admin','editor'))
 );
$function$
;
CREATE OR REPLACE FUNCTION vocatus_auth.publish_photo(p_entity text, p_slot text, p_expected bigint, p_path text)
 RETURNS SETOF vocatus_photos
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare asset record; photo public.vocatus_photos;
begin
 if not vocatus_auth.photo_access(true) then raise exception 'PHOTO_ACCESS_DENIED' using errcode='42501'; end if;
 if p_expected < 0 or p_path not like 'vocatus/'||auth.uid()::text||'/%' then
   raise exception 'PHOTO_INVALID_VERSION_OR_PATH' using errcode='22023';
 end if;
 select o.metadata into asset from storage.objects o
 where o.bucket_id='vocatus-photos' and o.name=p_path and o.owner_id=auth.uid()::text;
 if not found then raise exception 'PHOTO_UPLOAD_NOT_CONFIRMED' using errcode='22023'; end if;
 if p_expected=0 then
   insert into public.vocatus_photos(entity_key,slot,revision,object_path,mime,bytes,updated_by)
   values(p_entity,p_slot,1,p_path,asset.metadata->>'mimetype',(asset.metadata->>'size')::integer,auth.uid())
   on conflict (entity_key,slot) do nothing returning * into photo;
 else
   update public.vocatus_photos set revision=revision+1,object_path=p_path,
     mime=asset.metadata->>'mimetype',bytes=(asset.metadata->>'size')::integer,
     updated_at=now(),updated_by=auth.uid()
   where entity_key=p_entity and slot=p_slot and revision=p_expected returning * into photo;
 end if;
 if photo.entity_key is null then raise exception 'PHOTO_CONFLICT' using errcode='PT409'; end if;
 insert into public.vocatus_photo_versions select photo.*;
 return next photo;
end;
$function$
;
CREATE OR REPLACE FUNCTION public.vocatus_photo_permissions()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$ select jsonb_build_object('read',vocatus_auth.photo_access(false),'write',vocatus_auth.photo_access(true)); $function$
;
CREATE OR REPLACE FUNCTION public.vocatus_publish_photo(p_entity text, p_slot text, p_expected bigint, p_path text)
 RETURNS SETOF vocatus_photos
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select * from vocatus_auth.publish_photo(p_entity,p_slot,p_expected,p_path); $function$
;
CREATE OR REPLACE FUNCTION public.vocatus_save_work_order(p_input jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare previous public.vocatus_work_orders; result jsonb; order_id uuid; due_date date; state text; stamp timestamptz:=now(); entry jsonb; tag text;
begin
 if not vocatus_auth.photo_access(true) then raise exception 'WORK_ACCESS_DENIED' using errcode='42501'; end if;
 tag:=p_input->>'tag';
 if tag is null or tag !~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$' then raise exception 'Equipo inválido'; end if;
 if nullif(p_input->>'id','') is not null then
  order_id:=(p_input->>'id')::uuid;
  select * into previous from public.vocatus_work_orders where id=order_id for update;
  if not found or previous.tag<>tag then raise exception 'Orden no encontrada para este equipo'; end if;
  if previous.data->>'status'='completada' then raise exception 'La orden ya está completada'; end if;
  if (p_input->>'version')::integer is distinct from previous.revision then raise exception 'La orden cambió en otra ventana. Actualizá antes de editar.'; end if;
 else order_id:=pg_catalog.gen_random_uuid(); end if;
 result:=coalesce(previous.data,'{}'::jsonb)||p_input;
 if length(trim(coalesce(result->>'title',''))) not between 1 and 200 or length(trim(coalesce(result->>'assignee',''))) not between 1 and 100 or length(coalesce(result->>'details',''))>3000 or length(coalesce(result->>'component',''))>100 then raise exception 'Revisá trabajo, responsable y alcance'; end if;
 if coalesce(result->>'due','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida'; end if;
 due_date:=(result->>'due')::date;
 if pg_catalog.to_char(due_date,'YYYY-MM-DD')<>result->>'due' then raise exception 'Fecha inválida'; end if;
 if coalesce(result->>'priority','media') not in ('alta','media','baja') or coalesce(result->>'type','inspeccion') not in ('preventivo','correctivo','inspeccion') then raise exception 'Prioridad o tipo inválido'; end if;
 state:=coalesce(result->>'status','pendiente');
 if state not in ('pendiente','en-curso') or previous.data->>'status'='en-curso' and state='pendiente' then raise exception 'Completá la orden mediante su informe'; end if;
 entry:=jsonb_build_object('at',stamp,'type',case when previous.id is null then 'creada' when previous.data->>'status'<>state then 'iniciada' else 'editada' end,'by',trim(result->>'assignee'));
 result:=jsonb_build_object('id',order_id,'code',coalesce(previous.data->>'code','OT-'||to_char(due_date,'YYYYMMDD')||'-'||upper(left(order_id::text,6))),'tag',tag,'title',trim(result->>'title'),'assignee',trim(result->>'assignee'),'details',coalesce(result->>'details',''),'component',coalesce(result->>'component',''),'due',due_date::text,'priority',coalesce(result->>'priority','media'),'type',coalesce(result->>'type','inspeccion'),'status',state,'version',coalesce(previous.revision,0)+1,'created',coalesce(previous.data->>'created',stamp::text),'updated',stamp,'events',coalesce(previous.data->'events','[]'::jsonb)||jsonb_build_array(entry));
 insert into public.vocatus_work_orders(id,tag,revision,data,updated_at,updated_by) values(order_id,tag,(result->>'version')::integer,result,stamp,auth.uid()) on conflict(id) do update set revision=excluded.revision,data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 return result;
end; $function$
;
CREATE OR REPLACE FUNCTION public.vocatus_save_work_report(p_input jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
<<workflow_report>>
declare prior public.vocatus_work_reports; work public.vocatus_work_orders; result jsonb; tag text:=p_input->>'tag'; source text:=p_input->>'id'; oid uuid:=nullif(p_input->>'workOrderId','')::uuid; evidence jsonb:=coalesce(p_input->'evidence','[]'::jsonb); item jsonb; stamp timestamptz:=now();
begin
 if not vocatus_auth.photo_access(true) then raise exception 'WORK_ACCESS_DENIED' using errcode='42501'; end if;
 if tag is null or tag !~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$' or source is null or length(source) not between 1 and 100 then raise exception 'Identificador de informe inválido'; end if;
 if coalesce(p_input->>'date','') !~ '^\d{4}-\d{2}-\d{2}$' or to_char((p_input->>'date')::date,'YYYY-MM-DD')<>p_input->>'date' then raise exception 'Fecha inválida'; end if;
 if length(trim(coalesce(p_input->>'title',''))) not between 1 and 200 or length(trim(coalesce(p_input->>'author',''))) not between 1 and 100 or length(coalesce(p_input->>'text',''))>8000 or length(coalesce(p_input->>'parts',''))>4000 or length(coalesce(p_input->>'symptoms',''))>4000 then raise exception 'Revisá título, responsable y contenido'; end if;
 if coalesce(p_input->>'operativo','') not in ('','si','no') then raise exception 'Estado del equipo inválido'; end if;
 if jsonb_typeof(evidence)<>'array' or jsonb_array_length(evidence)>4 then raise exception 'Máximo cuatro fotos'; end if;
 for item in select value from jsonb_array_elements(evidence) loop
  if coalesce(item->>'path','') not like 'reports/'||auth.uid()::text||'/%' or item->>'mime' not in ('image/jpeg','image/png','image/webp') then raise exception 'Ruta de evidencia inválida'; end if;
 end loop;
 if p_input->'pdf' is not null and p_input->'pdf'<>'null'::jsonb and coalesce(p_input#>>'{pdf,path}','') not like 'reports/'||auth.uid()::text||'/%' then raise exception 'Ruta de PDF inválida'; end if;
 result:=jsonb_build_object('id',source,'tag',tag,'date',p_input->>'date','title',trim(p_input->>'title'),'author',trim(p_input->>'author'),'text',coalesce(p_input->>'text',''),'parts',coalesce(p_input->>'parts',''),'symptoms',coalesce(p_input->>'symptoms',''),'operativo',p_input->>'operativo','retirado',coalesce((p_input->>'retirado')::boolean,false),'evidence',evidence,'pdf',p_input->'pdf','mediciones',p_input->'mediciones')||case when oid is not null then jsonb_build_object('workOrderId',oid) else '{}'::jsonb end;
 -- El mismo equipo se bloquea para evitar importaciones simultáneas duplicadas.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tag||':'||source,0));
 select * into prior from public.vocatus_work_reports where vocatus_work_reports.tag=workflow_report.tag and source_id=workflow_report.source;
 if found then
  if prior.data<>result then raise exception 'Este identificador ya existe con otro contenido. Se conservó el informe anterior.'; end if;
  return prior.data||jsonb_build_object('created',extract(epoch from prior.created_at)*1000,'source','supabase');
 end if;
 if oid is not null then
  select * into work from public.vocatus_work_orders where id=oid for update;
  if not found or work.tag<>tag then raise exception 'La orden pertenece a otro equipo'; end if;
  if work.data->>'status'='completada' then raise exception 'La orden ya tiene un informe de cierre'; end if;
 end if;
 insert into public.vocatus_work_reports(tag,source_id,work_order_id,data,created_by) values(tag,source,oid,result,auth.uid());
 if oid is not null then
  update public.vocatus_work_orders set data=data||jsonb_build_object('status','completada','reportId',source,'reportDate',p_input->>'date','updated',stamp,'version',revision+1,'events',(data->'events')||jsonb_build_array(jsonb_build_object('at',stamp,'type','completada','by',p_input->>'author','reportId',source))),revision=revision+1,updated_at=stamp,updated_by=auth.uid() where id=oid;
 end if;
 return result||jsonb_build_object('created',extract(epoch from stamp)*1000,'source','supabase');
end; $function$
;
revoke all on function "vocatus_auth"."photo_access"(p_write boolean) from public,anon,authenticated,service_role;
grant execute on function "vocatus_auth"."photo_access"(p_write boolean) to "postgres";
grant execute on function "vocatus_auth"."photo_access"(p_write boolean) to "authenticated";
revoke all on function "vocatus_auth"."publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) from public,anon,authenticated,service_role;
grant execute on function "vocatus_auth"."publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) to "postgres";
grant execute on function "vocatus_auth"."publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) to "authenticated";
revoke all on function "public"."vocatus_photo_permissions"() from public,anon,authenticated,service_role;
grant execute on function "public"."vocatus_photo_permissions"() to "postgres";
grant execute on function "public"."vocatus_photo_permissions"() to "authenticated";
revoke all on function "public"."vocatus_publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) from public,anon,authenticated,service_role;
grant execute on function "public"."vocatus_publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) to "postgres";
grant execute on function "public"."vocatus_publish_photo"(p_entity text, p_slot text, p_expected bigint, p_path text) to "authenticated";
revoke all on function "public"."vocatus_save_work_order"(p_input jsonb) from public,anon,authenticated,service_role;
grant execute on function "public"."vocatus_save_work_order"(p_input jsonb) to "postgres";
grant execute on function "public"."vocatus_save_work_order"(p_input jsonb) to "authenticated";
revoke all on function "public"."vocatus_save_work_report"(p_input jsonb) from public,anon,authenticated,service_role;
grant execute on function "public"."vocatus_save_work_report"(p_input jsonb) to "postgres";
grant execute on function "public"."vocatus_save_work_report"(p_input jsonb) to "authenticated";
grant TRUNCATE on "public"."vocatus_work_orders" to "service_role";
grant REFERENCES on "public"."vocatus_work_orders" to "service_role";
grant TRIGGER on "public"."vocatus_work_orders" to "service_role";
grant INSERT on "public"."vocatus_work_orders" to "authenticated";
grant SELECT on "public"."vocatus_work_orders" to "authenticated";
grant UPDATE on "public"."vocatus_work_orders" to "authenticated";
grant TRUNCATE on "public"."vocatus_work_reports" to "service_role";
grant REFERENCES on "public"."vocatus_work_reports" to "service_role";
grant TRIGGER on "public"."vocatus_work_reports" to "service_role";
grant INSERT on "public"."vocatus_work_reports" to "authenticated";
grant SELECT on "public"."vocatus_work_reports" to "authenticated";
grant TRUNCATE on "public"."vocatus_photos" to "service_role";
grant REFERENCES on "public"."vocatus_photos" to "service_role";
grant TRIGGER on "public"."vocatus_photos" to "service_role";
grant SELECT on "public"."vocatus_photos" to "authenticated";
grant TRUNCATE on "public"."vocatus_photo_versions" to "service_role";
grant REFERENCES on "public"."vocatus_photo_versions" to "service_role";
grant TRIGGER on "public"."vocatus_photo_versions" to "service_role";
grant SELECT on "public"."vocatus_photo_versions" to "authenticated";
grant update("archived_at") on "public"."vocatus_work_reports" to "authenticated";
create policy "maintenance_files_insert" on "storage"."objects" as PERMISSIVE for INSERT to "authenticated" with check (((bucket_id = 'vocatus-maintenance'::text) AND ( SELECT vocatus_auth.photo_access(true) AS photo_access) AND ((storage.foldername(name))[1] = 'reports'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));
create policy "maintenance_files_read" on "storage"."objects" as PERMISSIVE for SELECT to "authenticated" using (((bucket_id = 'vocatus-maintenance'::text) AND ( SELECT vocatus_auth.photo_access(false) AS photo_access)));
create policy "vocatus_photo_objects_upload" on "storage"."objects" as PERMISSIVE for INSERT to "authenticated" with check (((bucket_id = 'vocatus-photos'::text) AND ( SELECT vocatus_auth.photo_access(true) AS photo_access) AND ((storage.foldername(name))[1] = 'vocatus'::text) AND ((storage.foldername(name))[2] = (( SELECT auth.uid() AS uid))::text)));
create policy "vocatus_photo_objects_read" on "storage"."objects" as PERMISSIVE for SELECT to "authenticated" using (((bucket_id = 'vocatus-photos'::text) AND ( SELECT vocatus_auth.photo_access(false) AS photo_access)));
create policy "work_orders_update" on "public"."vocatus_work_orders" as PERMISSIVE for UPDATE to "authenticated" using (( SELECT vocatus_auth.photo_access(true) AS photo_access)) with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (updated_by = ( SELECT auth.uid() AS uid))));
create policy "work_orders_insert" on "public"."vocatus_work_orders" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (updated_by = ( SELECT auth.uid() AS uid))));
create policy "work_orders_read" on "public"."vocatus_work_orders" as PERMISSIVE for SELECT to "authenticated" using (( SELECT vocatus_auth.photo_access(false) AS photo_access));
create policy "work_reports_update" on "public"."vocatus_work_reports" as PERMISSIVE for UPDATE to "authenticated" using (( SELECT vocatus_auth.photo_access(true) AS photo_access)) with check (( SELECT vocatus_auth.photo_access(true) AS photo_access));
create policy "work_reports_insert" on "public"."vocatus_work_reports" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (created_by = ( SELECT auth.uid() AS uid))));
create policy "work_reports_read" on "public"."vocatus_work_reports" as PERMISSIVE for SELECT to "authenticated" using (( SELECT vocatus_auth.photo_access(false) AS photo_access));
create policy "photo_team_update" on "public"."vocatus_photos" as PERMISSIVE for UPDATE to "authenticated" using (( SELECT vocatus_auth.photo_access(true) AS photo_access)) with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (updated_by = ( SELECT auth.uid() AS uid)) AND (object_path ~~ (('vocatus/'::text || (( SELECT auth.uid() AS uid))::text) || '/%'::text))));
create policy "photo_team_insert" on "public"."vocatus_photos" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (updated_by = ( SELECT auth.uid() AS uid)) AND (object_path ~~ (('vocatus/'::text || (( SELECT auth.uid() AS uid))::text) || '/%'::text))));
create policy "photo_team_read" on "public"."vocatus_photos" as PERMISSIVE for SELECT to "authenticated" using (( SELECT vocatus_auth.photo_access(false) AS photo_access));
create policy "photo_versions_insert" on "public"."vocatus_photo_versions" as PERMISSIVE for INSERT to "authenticated" with check ((( SELECT vocatus_auth.photo_access(true) AS photo_access) AND (updated_by = ( SELECT auth.uid() AS uid)) AND (object_path ~~ (('vocatus/'::text || (( SELECT auth.uid() AS uid))::text) || '/%'::text))));
create policy "photo_versions_read" on "public"."vocatus_photo_versions" as PERMISSIVE for SELECT to "authenticated" using (( SELECT vocatus_auth.photo_access(false) AS photo_access));
insert into storage.buckets(id,name,public) values('vocatus-photos','vocatus-photos',false),('vocatus-maintenance','vocatus-maintenance',false);
commit;
