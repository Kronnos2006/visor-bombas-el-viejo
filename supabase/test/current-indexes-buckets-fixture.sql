-- Configuración de esquema, sin fotos ni datos reales. Solo proyecto temporal.
begin;
CREATE INDEX vocatus_work_orders_updated_by_idx ON public.vocatus_work_orders USING btree (updated_by);
CREATE INDEX vocatus_work_orders_tag_idx ON public.vocatus_work_orders USING btree (tag, updated_at DESC);
CREATE INDEX vocatus_photos_updated_by_idx ON public.vocatus_photos USING btree (updated_by);
CREATE INDEX vocatus_work_reports_order_idx ON public.vocatus_work_reports USING btree (work_order_id);
CREATE INDEX vocatus_work_reports_created_by_idx ON public.vocatus_work_reports USING btree (created_by);
update storage.buckets set public=false,file_size_limit=8388608,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp']::text[] where id='vocatus-photos';
update storage.buckets set public=false,file_size_limit=10485760,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','application/pdf']::text[] where id='vocatus-maintenance';
commit;
