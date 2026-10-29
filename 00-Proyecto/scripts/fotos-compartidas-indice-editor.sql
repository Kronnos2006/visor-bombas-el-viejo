-- Migración separada: un bloqueo del índice no revierte la reparación de PT409.
set local lock_timeout='3s';
create index if not exists vocatus_photos_updated_by_idx on public.vocatus_photos(updated_by);
