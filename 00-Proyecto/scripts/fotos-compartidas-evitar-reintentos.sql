-- Conflictos de versión son decisiones de la aplicación, no fallos transitorios.
-- PT409 devuelve HTTP 409 sin activar el bucle de SQLSTATE 40001 en PostgREST 14.
set local lock_timeout='3s';
create or replace function vocatus_auth.publish_photo(p_entity text,p_slot text,p_expected bigint,p_path text)
returns setof public.vocatus_photos language plpgsql security definer set search_path = ''
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
 if photo.entity_key is null then raise exception 'PHOTO_CONFLICT' using errcode='PT409'; end if;
 insert into public.vocatus_photo_versions select photo.*;
 return next photo;
end;
$$;
