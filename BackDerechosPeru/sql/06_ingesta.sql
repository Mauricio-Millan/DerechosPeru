-- ============================================================
-- 06_ingesta.sql (Sprint 6 — M8: Ingesta ETL, Revisión vs PDF y Publicación)
--
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de 01..05.
-- Crea estados de versión/artículo y tablas de auditoría de ingesta.
-- ============================================================

-- 1. Estado del ciclo de vida de cada versión de la Constitución.
--    Las versiones existentes (1993) quedan 'publicada' por el default.
alter table constitution_version
    add column if not exists status text not null default 'publicada'
        check (status in ('borrador', 'en_revision', 'publicada', 'archivada'));

-- 2. Estado de revisión por artículo (verificado vs PDF fuente).
--    Los artículos existentes quedan 'verificado' por el default (ya curados).
alter table articulo
    add column if not exists review_status text not null default 'verificado'
        check (review_status in ('pendiente', 'verificado', 'observado'));
alter table articulo add column if not exists reviewer_id uuid references auth.users(id) on delete set null;
alter table articulo add column if not exists reviewed_at timestamptz;

-- 3. PDF fuente subido para una versión (persistido en Supabase Storage).
create table if not exists source_document (
    id                bigint generated always as identity primary key,
    version_id        int  not null references constitution_version(id) on delete cascade,
    storage_path      text not null,                 -- ruta dentro del bucket privado 'constituciones'
    original_filename text,
    content_type      text,
    size_bytes        bigint,
    uploaded_by       uuid references auth.users(id) on delete set null,
    created_at        timestamptz not null default now()
);

-- 4. Bitácora de cada trabajo de ingesta (extracción del PDF).
create table if not exists ingest_job (
    id          bigint generated always as identity primary key,
    version_id  int  references constitution_version(id) on delete cascade,
    status      text not null default 'procesando'
                    check (status in ('procesando', 'extraido', 'fallido')),
    filename    text,
    stats       jsonb,                               -- conteos: titulos/capitulos/articulos
    error       text,
    created_by  uuid references auth.users(id) on delete set null,
    created_at  timestamptz not null default now()
);

create index if not exists ix_source_doc_version on source_document (version_id);
create index if not exists ix_ingest_job_version on ingest_job (version_id);
create index if not exists ix_articulo_review     on articulo (version_id, review_status);

-- RLS: tablas internas de back-office. Solo el backend (service_role) las usa;
-- ninguna lectura pública. Sin políticas → con RLS activo nadie más accede.
alter table source_document enable row level security;
alter table ingest_job      enable row level security;
