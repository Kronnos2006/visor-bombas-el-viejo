-- Índices sugeridos por el asesor de rendimiento de Supabase (9-nov-2026).
-- Seguro de repetir. Ejecutar en el SQL Editor solo con aprobación.
create index if not exists accounts_reviewed_by_idx on vocatus_access.accounts (reviewed_by);
create index if not exists audit_actor_idx on vocatus_access.audit (actor);
create index if not exists audit_target_idx on vocatus_access.audit (target);
