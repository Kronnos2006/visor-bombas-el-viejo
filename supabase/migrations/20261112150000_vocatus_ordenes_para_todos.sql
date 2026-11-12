-- Órdenes «Para todos»: el administrador publica la orden sin responsable; se avisa a todas las cuentas
-- activas y la primera que la acepta queda como responsable. Ampliación: no borra datos.
begin;

create or replace function vocatus_access.notify_all(p_except uuid,p_kind text,p_title text,p_body text,p_ref text,p_tag text)
returns void language sql security definer set search_path='' as $$
 insert into public.vocatus_notifications(user_id,kind,title,body,ref_id,tag)
 select a.id,p_kind,left(p_title,200),left(coalesce(p_body,''),1000),p_ref,p_tag
 from vocatus_access.accounts a
 where a.status='approved' and a.active and a.id is distinct from p_except;
$$;
revoke all on function vocatus_access.notify_all(uuid,text,text,text,text,text) from public,anon,authenticated;

create or replace function public.vocatus_save_work_order(p_input jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare previous public.vocatus_work_orders; result jsonb; order_id uuid; due_date date; state text; stamp timestamptz:=now(); entry jsonb; tag text;
 admin boolean:=vocatus_access.current_is_admin(); assignee_id uuid; assignee_name text; abierta boolean:=false;
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
  if previous.data->>'abierta'='true' then raise exception 'Primero aceptá la orden con «Aceptar orden».' using errcode='42501'; end if;
  if coalesce(p_input->>'status','')<>'en-curso' then raise exception 'Solo un administrador puede editar órdenes.' using errcode='42501'; end if;
  p_input:=jsonb_build_object('id',order_id,'tag',tag,'version',previous.revision,'status','en-curso');
 end if;
 result:=coalesce(previous.data,'{}'::jsonb)||p_input;
 if admin and coalesce(p_input->>'abierta','')='true' then
  -- «Para todos»: sin responsable hasta que alguien la acepte.
  abierta:=true;assignee_id:=null;result:=result||jsonb_build_object('assignee','Para todos');
 elsif admin and nullif(result->>'assigneeId','') is not null then
  assignee_id:=(result->>'assigneeId')::uuid;
  assignee_name:=vocatus_access.active_account_name(assignee_id);
  if assignee_name is null then raise exception 'El responsable elegido no es una cuenta activa.'; end if;
  result:=result||jsonb_build_object('assignee',assignee_name);
 else assignee_id:=nullif(previous.data->>'assigneeId','')::uuid;abierta:=coalesce(previous.data->>'abierta','')='true'; end if;
 if length(trim(coalesce(result->>'title',''))) not between 1 and 200 or length(trim(coalesce(result->>'assignee',''))) not between 1 and 100 or length(coalesce(result->>'details',''))>3000 or length(coalesce(result->>'component',''))>100 then raise exception 'Revisá trabajo, responsable y alcance'; end if;
 if coalesce(result->>'due','') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida'; end if;
 due_date:=(result->>'due')::date;
 if pg_catalog.to_char(due_date,'YYYY-MM-DD')<>result->>'due' then raise exception 'Fecha inválida'; end if;
 if coalesce(result->>'priority','media') not in ('alta','media','baja') or coalesce(result->>'type','inspeccion') not in ('preventivo','correctivo','inspeccion') then raise exception 'Prioridad o tipo inválido'; end if;
 state:=coalesce(result->>'status','pendiente');
 if state not in ('pendiente','en-curso') or previous.data->>'status'='en-curso' and state='pendiente' then raise exception 'Completá la orden mediante su informe'; end if;
 entry:=jsonb_build_object('at',stamp,'type',case when previous.id is null then 'creada' when previous.data->>'status'<>state then 'iniciada' else 'editada' end,'by',vocatus_access.account_name(auth.uid()));
 result:=jsonb_build_object('id',order_id,'code',coalesce(previous.data->>'code','OT-'||to_char(due_date,'YYYYMMDD')||'-'||upper(left(order_id::text,6))),'tag',tag,'title',trim(result->>'title'),'assignee',trim(result->>'assignee'),'assigneeId',assignee_id,'abierta',abierta,'details',coalesce(result->>'details',''),'component',coalesce(result->>'component',''),'due',due_date::text,'priority',coalesce(result->>'priority','media'),'type',coalesce(result->>'type','inspeccion'),'status',state,'version',coalesce(previous.revision,0)+1,'created',coalesce(previous.data->>'created',stamp::text),'createdBy',coalesce(previous.data->>'createdBy',auth.uid()::text),'updated',stamp,'events',coalesce(previous.data->'events','[]'::jsonb)||jsonb_build_array(entry));
 insert into public.vocatus_work_orders(id,tag,revision,data,updated_at,updated_by) values(order_id,tag,(result->>'version')::integer,result,stamp,auth.uid()) on conflict(id) do update set revision=excluded.revision,data=excluded.data,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 return result;
end; $$;
revoke all on function public.vocatus_save_work_order(jsonb) from public,anon;
grant execute on function public.vocatus_save_work_order(jsonb) to authenticated;

-- Aceptar una orden «Para todos». Bloquea la fila: si dos personas aceptan a la vez, solo una gana.
create or replace function public.vocatus_accept_work_order(p_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.vocatus_work_orders; nombre text; result jsonb; stamp timestamptz:=now();
begin
 if not vocatus_auth.photo_access(true) then raise exception 'WORK_ACCESS_DENIED' using errcode='42501'; end if;
 select * into o from public.vocatus_work_orders where id=p_id for update;
 if not found or o.archived_at is not null then raise exception 'La orden no existe o fue borrada.'; end if;
 if o.data->>'status'='completada' then raise exception 'La orden ya está completada.'; end if;
 if coalesce(o.data->>'abierta','')<>'true' then raise exception 'Esta orden ya la aceptó otra persona.'; end if;
 nombre:=vocatus_access.active_account_name(auth.uid());
 if nombre is null then raise exception 'Tu cuenta no está activa.' using errcode='42501'; end if;
 result:=o.data||jsonb_build_object('abierta',false,'assigneeId',auth.uid(),'assignee',nombre,'version',o.revision+1,'updated',stamp,
  'events',coalesce(o.data->'events','[]'::jsonb)||jsonb_build_array(jsonb_build_object('at',stamp,'type','aceptada','by',nombre)));
 update public.vocatus_work_orders set revision=o.revision+1,data=result,updated_at=stamp,updated_by=auth.uid() where id=p_id;
 return result;
end; $$;
revoke all on function public.vocatus_accept_work_order(uuid) from public,anon;
grant execute on function public.vocatus_accept_work_order(uuid) to authenticated;

-- Avisos: publicada para todos → a todas las cuentas; aceptada → a los administradores.
create or replace function vocatus_access.work_order_after()
returns trigger language plpgsql security definer set search_path='' as $$
declare nuevo text:=nullif(new.data->>'assigneeId',''); antes text:=case when tg_op='UPDATE' then nullif(old.data->>'assigneeId','') end;
 etiqueta text:=coalesce(new.data->>'code','')||' · '||new.tag;
 abierta boolean:=coalesce(new.data->>'abierta','')='true'; abiertaAntes boolean:=tg_op='UPDATE' and coalesce(old.data->>'abierta','')='true';
begin
 if tg_op='UPDATE' and new.archived_at is not null and old.archived_at is null then
  if nuevo is not null and nuevo<>coalesce(auth.uid()::text,'') then
   perform vocatus_access.notify(nuevo::uuid,'orden','Se borró la orden: '||coalesce(new.data->>'title',''),etiqueta||' · ya no hay que hacerla',new.id::text,new.tag);
  end if;
  return null;
 end if;
 if abierta and not abiertaAntes then
  perform vocatus_access.notify_all(auth.uid(),'orden','Orden disponible para todos: '||coalesce(new.data->>'title',''),
   etiqueta||' · para el '||coalesce(new.data->>'due','')||' · tocá «Aceptar orden» si la podés hacer',new.id::text,new.tag);
 elsif abiertaAntes and not abierta and nuevo is not null and nuevo=coalesce(auth.uid()::text,'') then
  perform vocatus_access.notify_admins(auth.uid(),'orden',vocatus_access.account_name(auth.uid())||' aceptó la orden: '||coalesce(new.data->>'title',''),etiqueta,new.id::text,new.tag);
 elsif nuevo is not null and nuevo is distinct from antes and nuevo<>coalesce(auth.uid()::text,'') then
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

commit;
