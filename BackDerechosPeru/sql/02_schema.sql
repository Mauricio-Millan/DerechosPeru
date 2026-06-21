-- ============================================================
-- 02_schema.sql
-- Modelo de datos del Portal de Conocimiento Constitucional
-- Primer entregable: estructura + categorías + consulta IA
--
-- Nota sobre la dimensión del vector:
--   Configurado en vector(384) para el modelo LOCAL y gratuito
--   paraphrase-multilingual-MiniLM-L12-v2 (sentence-transformers).
--   Si migras a text-embedding-3-small (OpenAI/Azure), usa
--   vector(1536) aquí y en match_articulos, y EMBEDDING_DIM=1536.
-- ============================================================

-- ----------------------------------------------------------------
-- Versiones de la Constitución (Control de versiones - RF-06)
-- ----------------------------------------------------------------
create table if not exists constitution_version (
    id              serial primary key,
    label           text not null,                 -- 'Constitución Política del Perú de 1993'
    year            int  not null,                 -- 1993, 1979, ...
    promulgated_on  date,                           -- 1993-12-29
    is_current      boolean not null default false, -- versión vigente
    notes           text,
    created_at      timestamptz not null default now()
);

-- Solo una versión vigente a la vez
create unique index if not exists uq_version_current
    on constitution_version (is_current) where is_current;

-- ----------------------------------------------------------------
-- Taxonomía / Categorías (RF-03) — chips de la pantalla "Buscar / Filtrar"
-- ----------------------------------------------------------------
create table if not exists category (
    id              serial primary key,
    slug            text unique not null,          -- 'derechos-fundamentales'
    name            text not null,                 -- 'Derechos Fundamentales'
    color           text,                           -- color del chip en el front
    display_order   int not null default 0
);

-- ----------------------------------------------------------------
-- Títulos
-- ----------------------------------------------------------------
create table if not exists titulo (
    id              serial primary key,
    version_id      int  not null references constitution_version(id) on delete cascade,
    numero_romano   text not null,                 -- 'I', 'II', ...
    denominacion    text not null,                 -- 'DE LA PERSONA Y DE LA SOCIEDAD'
    display_order   int,
    unique (version_id, numero_romano)
);

-- ----------------------------------------------------------------
-- Capítulos
-- ----------------------------------------------------------------
create table if not exists capitulo (
    id              serial primary key,
    version_id      int  not null references constitution_version(id) on delete cascade,
    titulo_id       int  not null references titulo(id) on delete cascade,
    numero_romano   text not null,                 -- 'I', 'II', ...
    denominacion    text not null,
    display_order   int,
    unique (version_id, titulo_id, numero_romano)
);

-- ----------------------------------------------------------------
-- Artículos (núcleo del contenido)
-- ----------------------------------------------------------------
create table if not exists articulo (
    id              serial primary key,
    version_id      int  not null references constitution_version(id) on delete cascade,
    titulo_id       int  references titulo(id) on delete set null,
    capitulo_id     int  references capitulo(id) on delete set null,
    category_id     int  references category(id) on delete set null,
    numero          int  not null,                 -- número del artículo (1..206)
    sumilla         text,                           -- título corto curado (RF-12)
    contenido       text not null,                  -- texto del artículo

    -- Búsqueda léxica full-text en español (RF-02)
    search_tsv      tsvector generated always as (
                        to_tsvector('spanish',
                            coalesce(sumilla, '') || ' ' || coalesce(contenido, ''))
                    ) stored,

    -- Búsqueda semántica para la Consulta Guiada (RF-04)
    embedding       vector(384),

    is_published    boolean not null default true,  -- subconjunto publicado (RF-12)
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    unique (version_id, numero)
);

-- Índice léxico
create index if not exists idx_articulo_tsv
    on articulo using gin (search_tsv);

-- Índice semántico (HNSW, distancia coseno) para vecinos más cercanos
create index if not exists idx_articulo_embedding
    on articulo using hnsw (embedding vector_cosine_ops);

-- Acceso rápido por versión/número
create index if not exists idx_articulo_version_numero
    on articulo (version_id, numero);

create index if not exists idx_articulo_category
    on articulo (category_id);

create index if not exists idx_articulo_titulo
    on articulo (titulo_id);

-- ----------------------------------------------------------------
-- Bitácora de consultas guiadas (RF-16 — Gap Analysis / métricas)
-- Permite ver consultas más frecuentes y búsquedas sin resultados.
-- ----------------------------------------------------------------
create table if not exists consulta_log (
    id                  bigserial primary key,
    query_text          text not null,
    matched_article_ids int[],                      -- artículos devueltos
    top_score           real,                        -- mejor similitud
    result_count        int  not null default 0,
    created_at          timestamptz not null default now()
);

create index if not exists idx_consulta_log_created
    on consulta_log (created_at desc);

-- ----------------------------------------------------------------
-- Función RPC para búsqueda semántica (usada por el backend o por
-- el cliente Supabase). Recibe un embedding y devuelve los artículos
-- más cercanos de la versión vigente.
-- ----------------------------------------------------------------
create or replace function match_articulos(
    query_embedding vector(384),
    match_count     int default 5,
    min_similarity  real default 0.0,
    p_version_id    int default null
)
returns table (
    id          int,
    numero      int,
    sumilla     text,
    contenido   text,
    category_id int,
    similarity  real
)
language sql stable
as $$
    select
        a.id,
        a.numero,
        a.sumilla,
        a.contenido,
        a.category_id,
        1 - (a.embedding <=> query_embedding) as similarity
    from articulo a
    where a.is_published
      and a.embedding is not null
      and (p_version_id is null or a.version_id = p_version_id)
      and (1 - (a.embedding <=> query_embedding)) >= min_similarity
    order by a.embedding <=> query_embedding
    limit match_count;
$$;
