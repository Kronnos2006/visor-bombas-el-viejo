begin;
insert into auth.users(id,email,email_confirmed_at,aud,role) values
 ('00000000-0000-4000-8000-000000000101','vocatus-writer@example.invalid',now(),'authenticated','authenticated'),
 ('00000000-0000-4000-8000-000000000102','vocatus-reader@example.invalid',now(),'authenticated','authenticated'),
 ('00000000-0000-4000-8000-000000000103','vocatus-outsider@example.invalid',now(),'authenticated','authenticated');
insert into vocatus_auth.members(email,role) values ('vocatus-writer@example.invalid','editor'),('vocatus-reader@example.invalid','viewer');
insert into storage.objects(bucket_id,name,owner_id,metadata) values
 ('vocatus-photos','vocatus/00000000-0000-4000-8000-000000000101/test-a.jpg','00000000-0000-4000-8000-000000000101','{"mimetype":"image/jpeg","size":8}'),
 ('vocatus-photos','vocatus/00000000-0000-4000-8000-000000000101/test-b.jpg','00000000-0000-4000-8000-000000000101','{"mimetype":"image/jpeg","size":8}');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000101',true);
do $$ begin
 if not vocatus_auth.photo_access(true) then raise exception 'editor blocked'; end if;
 if has_table_privilege('authenticated','public.vocatus_photos','UPDATE') or has_table_privilege('authenticated','public.vocatus_photos','INSERT') then raise exception 'direct writes allowed';end if;
 if has_table_privilege('authenticated','vocatus_auth.members','SELECT') then raise exception 'roster exposed';end if;
 perform public.vocatus_publish_photo('B30','bomba',0,'vocatus/00000000-0000-4000-8000-000000000101/test-a.jpg');
 begin
 perform public.vocatus_publish_photo('B30','bomba',0,'vocatus/00000000-0000-4000-8000-000000000101/test-b.jpg');
 raise exception 'stale revision accepted';
 exception when sqlstate 'PT409' then null; end;
 perform public.vocatus_publish_photo('B30','bomba',1,'vocatus/00000000-0000-4000-8000-000000000101/test-b.jpg');
 if (select count(*) from public.vocatus_photo_versions where entity_key='B30')<>2 then raise exception 'versions lost';end if;
 if exists(select 1 from public.vocatus_photos where entity_key='B31') then raise exception 'cross entity leak';end if;
 end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000102',true);
do $$ begin
 if not vocatus_auth.photo_access(false) or vocatus_auth.photo_access(true) then raise exception 'viewer permissions wrong';end if;
 if (select count(*) from public.vocatus_photos)<>1 then raise exception 'viewer cannot see shared photo';end if;
 begin perform public.vocatus_publish_photo('B31','bomba',0,'vocatus/00000000-0000-4000-8000-000000000101/test-a.jpg');raise exception 'viewer wrote photo';exception when insufficient_privilege then null;end;
 end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000103',true);
do $$ begin
 if vocatus_auth.photo_access(false) then raise exception 'outsider allowed';end if;
 if exists(select 1 from public.vocatus_photos) or exists(select 1 from storage.objects where bucket_id='vocatus-photos') then raise exception 'private photos exposed';end if;
 end $$;
reset role;
do $$ begin
 if (select public from storage.buckets where id='vocatus-photos') then raise exception 'bucket public';end if;
 if has_table_privilege('anon','public.vocatus_photos','SELECT') then raise exception 'anonymous access';end if;
 end $$;
rollback;
select 'PASS: editor, viewer, outsider, CAS conflict, versions, identity isolation, private bucket, no direct writes; fixtures rolled back' as verification;
