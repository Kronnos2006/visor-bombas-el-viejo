-- Ampliación aditiva: no modifica fotos, versiones, miembros ni datos existentes.
create table public.vocatus_work_orders (
 id uuid primary key,
 tag text not null check(tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'),
 revision integer not null check(revision > 0),
 data jsonb not null check(jsonb_typeof(data)='object' and data->>'id'=id::text and data->>'tag'=tag and data->>'status' in ('pendiente','en-curso','completada')),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id)
);
create index vocatus_work_orders_tag_idx on public.vocatus_work_orders(tag,updated_at desc);
create index vocatus_work_orders_updated_by_idx on public.vocatus_work_orders(updated_by);
create table public.vocatus_work_reports (
 tag text not null check(tag ~ '^(B[1-9][0-9]{0,3}|P-[0-9]{4}[A-Z]?)$'),
 source_id text not null check(length(source_id) between 1 and 100),
 work_order_id uuid references public.vocatus_work_orders(id),
 data jsonb not null check(jsonb_typeof(data)='object' and data->>'tag'=tag and data->>'id'=source_id),
 created_at timestamptz not null default now(),
 created_by uuid not null references auth.users(id),
 archived_at timestamptz,
 primary key(tag,source_id)
);
create index vocatus_work_reports_order_idx on public.vocatus_work_reports(work_order_id);
create index vocatus_work_reports_created_by_idx on public.vocatus_work_reports(created_by);
alter table public.vocatus_work_orders enable row level security;
alter table public.vocatus_work_reports enable row level security;
revoke all on public.vocatus_work_orders, public.vocatus_work_reports from public,anon,authenticated;
grant select,insert,update on public.vocatus_work_orders to authenticated;
grant select,insert on public.vocatus_work_reports to authenticated;
grant update(archived_at) on public.vocatus_work_reports to authenticated;
create policy work_orders_read on public.vocatus_work_orders for select to authenticated using((select vocatus_auth.photo_access(false)));
create policy work_orders_insert on public.vocatus_work_orders for insert to authenticated with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
create policy work_orders_update on public.vocatus_work_orders for update to authenticated using((select vocatus_auth.photo_access(true))) with check((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid()));
create policy work_reports_read on public.vocatus_work_reports for select to authenticated using((select vocatus_auth.photo_access(false)));
create policy work_reports_insert on public.vocatus_work_reports for insert to authenticated with check((select vocatus_auth.photo_access(true)) and created_by=(select auth.uid()));
create policy work_reports_update on public.vocatus_work_reports for update to authenticated using((select vocatus_auth.photo_access(true))) with check((select vocatus_auth.photo_access(true)));

create function public.vocatus_save_work_order(p_input jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
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
end; $$;
revoke all on function public.vocatus_save_work_order(jsonb) from public,anon;
grant execute on function public.vocatus_save_work_order(jsonb) to authenticated;

create function public.vocatus_save_work_report(p_input jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
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
end; $$;
revoke all on function public.vocatus_save_work_report(jsonb) from public,anon;
grant execute on function public.vocatus_save_work_report(jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('vocatus-maintenance','vocatus-maintenance',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']);
create policy maintenance_files_read on storage.objects for select to authenticated using(bucket_id='vocatus-maintenance' and (select vocatus_auth.photo_access(false)));
create policy maintenance_files_insert on storage.objects for insert to authenticated with check(bucket_id='vocatus-maintenance' and (select vocatus_auth.photo_access(true)) and (storage.foldername(name))[1]='reports' and (storage.foldername(name))[2]=(select auth.uid())::text);
-- Archivos inmutables: sin UPDATE ni DELETE; cada contenido tiene su propio SHA-256.
