-- ============================================================
-- 05_foro.sql (Sprint 3 — M5: Foro & Conocimiento Experto)
--
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de 01..04.
-- ============================================================

create table if not exists forum_thread (
    id           bigint generated always as identity primary key,
    articulo_id  int  references articulo(id) on delete set null,   -- hilo sobre un artículo (opcional)
    category_id  int  references category(id) on delete set null,   -- o sobre una categoría/tema (opcional)
    author_id    uuid not null references auth.users(id) on delete cascade,
    titulo       text not null,
    contenido    text not null,
    is_closed    boolean not null default false,
    best_post_id bigint,                                            -- FK añadida abajo (circular)
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create table if not exists forum_post (
    id          bigint generated always as identity primary key,
    thread_id   bigint not null references forum_thread(id) on delete cascade,
    author_id   uuid   not null references auth.users(id) on delete cascade,
    contenido   text   not null,
    is_verified boolean not null default false,
    verified_by uuid   references auth.users(id) on delete set null,
    verified_at timestamptz,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

alter table forum_thread
    add constraint fk_best_post foreign key (best_post_id)
    references forum_post(id) on delete set null;

create table if not exists post_vote (
    id      bigint generated always as identity primary key,
    post_id bigint not null references forum_post(id) on delete cascade,
    user_id uuid   not null references auth.users(id) on delete cascade,
    value   smallint not null check (value in (-1, 1)),   -- útil / no útil
    unique (post_id, user_id)
);

create table if not exists expert_annotation (
    id          bigint generated always as identity primary key,
    articulo_id int  not null references articulo(id) on delete cascade,
    author_id   uuid not null references auth.users(id) on delete cascade,
    contenido   text not null,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index if not exists ix_thread_articulo on forum_thread (articulo_id);
create index if not exists ix_thread_category on forum_thread (category_id);
create index if not exists ix_post_thread     on forum_post (thread_id);
create index if not exists ix_vote_post       on post_vote (post_id);
create index if not exists ix_annot_articulo  on expert_annotation (articulo_id);

-- RLS (defensa en profundidad; el backend con service_role la ignora). Lectura pública.
alter table forum_thread      enable row level security;
alter table forum_post        enable row level security;
alter table post_vote         enable row level security;
alter table expert_annotation enable row level security;

create policy "public read threads" on forum_thread      for select using (true);
create policy "public read posts"   on forum_post        for select using (true);
create policy "public read annot"   on expert_annotation for select using (true);
create policy "user crud own votes" on post_vote for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
