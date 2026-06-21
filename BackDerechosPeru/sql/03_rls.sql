-- ============================================================
-- 03_rls.sql
-- Row Level Security (defensa en profundidad).
--
-- IMPORTANTE: el backend FastAPI se conecta con la cadena
-- directa de Postgres (rol postgres / service_role), que
-- IGNORA RLS. Estas políticas protegen el caso en que el
-- frontend Angular consulte Supabase directamente con la
-- anon key (solo lectura de contenido publicado).
-- ============================================================

alter table constitution_version enable row level security;
alter table category             enable row level security;
alter table titulo               enable row level security;
alter table capitulo             enable row level security;
alter table articulo             enable row level security;
alter table consulta_log         enable row level security;

-- Lectura pública del contenido constitucional ------------------
create policy "public read versions"
    on constitution_version for select using (true);

create policy "public read categories"
    on category for select using (true);

create policy "public read titulos"
    on titulo for select using (true);

create policy "public read capitulos"
    on capitulo for select using (true);

create policy "public read articulos publicados"
    on articulo for select using (is_published = true);

-- Bitácora: cualquiera puede insertar una consulta, nadie la lee
-- con anon key (solo el backend con service_role).
create policy "anon insert consulta_log"
    on consulta_log for insert with check (true);
