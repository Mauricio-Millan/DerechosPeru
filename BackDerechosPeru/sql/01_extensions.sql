-- ============================================================
-- 01_extensions.sql
-- Extensiones requeridas en Supabase (Postgres)
-- Ejecutar en: Supabase Studio -> SQL Editor
-- ============================================================

-- Búsqueda semántica (embeddings) para la Consulta Guiada (RF-04)
create extension if not exists vector;

-- Búsqueda léxica insensible a acentos / mayúsculas (RF-02)
create extension if not exists unaccent;

-- Búsqueda difusa por similitud de texto (tolerante a typos) - opcional
create extension if not exists pg_trgm;
