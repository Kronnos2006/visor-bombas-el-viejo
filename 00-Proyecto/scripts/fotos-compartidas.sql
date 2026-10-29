-- Fotografías del equipo VOCATUS. No contiene correos ni claves de acceso.
create schema if not exists vocatus_auth;
revoke all on schema vocatus_auth from public, anon;
grant usage on schema vocatus_auth to authenticated;

create table vocatus_auth.members (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('admin','editor','viewer')),
  active boolean not null default true
);
alter table vocatus_auth.members enable row level security;
revoke all on vocatus_auth.members from public, anon, authenticated;

-- Esta función no expone filas de auth.users ni de la lista de miembros.
-- El privilegio elevado solo permite consultar identidad confirmada y autorización.
create function vocatus_auth.photo_access(p_write boolean default false)
returns boolean language sql stable security definer set search_path = ''
as $$
 select (select auth.uid()) is not null and exists (
   select 1 from vocatus_auth.members m
   join auth.users u on u.id = (select auth.uid())
   where m.email = lower(u.email) and u.email_confirmed_at is not null
     and m.active and (not p_write or m.role in ('admin','editor'))
 );
$$;
revoke all on function vocatus_auth.photo_access(boolean) from public, anon;
grant execute on function vocatus_auth.photo_access(boolean) to authenticated;

create table public.vocatus_photos (
  entity_key text not null check (length(entity_key) between 2 and 500),
  slot text not null check (slot in ('placa1','placa2','bomba','posicion','motor','sello','empaque','orings','rodamientos','acople')),
  revision bigint not null check (revision > 0),
  object_path text not null check (object_path like 'vocatus/%'),
  mime text not null check (mime in ('image/jpeg','image/png','image/webp')),
  bytes integer not null check (bytes between 1 and 8388608),
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id),
  primary key (entity_key,slot)
);
create table public.vocatus_photo_versions (like public.vocatus_photos including defaults including constraints);
alter table public.vocatus_photo_versions add primary key (entity_key,slot,revision);
alter table public.vocatus_photos enable row level security;
alter table public.vocatus_photo_versions enable row level security;
revoke all on public.vocatus_photos,public.vocatus_photo_versions from public,anon,authenticated;
grant select,insert,update on public.vocatus_photos to authenticated;
grant select,insert on public.vocatus_photo_versions to authenticated;
create policy photo_team_read on public.vocatus_photos for select to authenticated
 using ((select vocatus_auth.photo_access(false)));
create policy photo_team_insert on public.vocatus_photos for insert to authenticated
 with check ((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid())
   and object_path like 'vocatus/'||(select auth.uid())::text||'/%');
create policy photo_team_update on public.vocatus_photos for update to authenticated
 using ((select vocatus_auth.photo_access(true)))
 with check ((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid())
   and object_path like 'vocatus/'||(select auth.uid())::text||'/%');
create policy photo_versions_read on public.vocatus_photo_versions for select to authenticated
 using ((select vocatus_auth.photo_access(false)));
create policy photo_versions_insert on public.vocatus_photo_versions for insert to authenticated
 with check ((select vocatus_auth.photo_access(true)) and updated_by=(select auth.uid())
   and object_path like 'vocatus/'||(select auth.uid())::text||'/%');

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('vocatus-photos','vocatus-photos',false,8388608,array['image/jpeg','image/png','image/webp']);
create policy vocatus_photo_objects_read on storage.objects for select to authenticated
 using (bucket_id='vocatus-photos' and (select vocatus_auth.photo_access(false)));
create policy vocatus_photo_objects_upload on storage.objects for insert to authenticated
 with check (bucket_id='vocatus-photos' and (select vocatus_auth.photo_access(true))
   and (storage.foldername(name))[1]='vocatus'
   and (storage.foldername(name))[2]=(select auth.uid())::text);
-- No hay UPDATE ni DELETE de archivos: cada reemplazo conserva la versión anterior.

create function public.vocatus_publish_photo(p_entity text,p_slot text,p_expected bigint,p_path text)
returns setof public.vocatus_photos language plpgsql security invoker set search_path = ''
as $$
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
 if photo.entity_key is null then raise exception 'PHOTO_CONFLICT' using errcode='40001'; end if;
 insert into public.vocatus_photo_versions select photo.*;
 return next photo;
end;
$$;
revoke all on function public.vocatus_publish_photo(text,text,bigint,text) from public,anon;
grant execute on function public.vocatus_publish_photo(text,text,bigint,text) to authenticated;

create function public.vocatus_photo_permissions()
returns jsonb language sql stable security invoker set search_path=''
as $$ select jsonb_build_object('read',vocatus_auth.photo_access(false),'write',vocatus_auth.photo_access(true)); $$;
revoke all on function public.vocatus_photo_permissions() from public,anon;
grant execute on function public.vocatus_photo_permissions() to authenticated;

alter publication supabase_realtime add table public.vocatus_photos;
