-- ============================================================
-- 04_auth.sql  (Sprint 2 — M3: Identidad, Marcadores, RBAC)
--
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de 01..03.
-- Supabase Auth emite y firma los JWT (HS256); el backend solo
-- los verifica. Estas tablas extienden auth.users.
-- ============================================================

-- profile: extiende auth.users con el rol (RBAC) --------------
create table if not exists profile (
    id           uuid primary key references auth.users(id) on delete cascade,
    display_name text,
    role         text not null default 'ciudadano'
                 check (role in ('ciudadano','redactor','experto','editor','admin')),
    created_at   timestamptz not null default now()
);

-- bookmark: marcador por usuario ------------------------------
create table if not exists bookmark (
    id          bigint generated always as identity primary key,
    user_id     uuid not null references auth.users(id) on delete cascade,
    articulo_id int  not null references articulo(id)   on delete cascade,
    created_at  timestamptz not null default now(),
    unique (user_id, articulo_id)
);

create index if not exists ix_bookmark_user on bookmark (user_id);

-- Crea el profile automáticamente al registrarse -------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into profile (id, display_name)
    values (new.id, new.raw_user_meta_data->>'display_name')
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- RLS (defensa en profundidad). El backend usa service_role y la
-- IGNORA: la protección real es el filtro por user_id en código.
alter table profile  enable row level security;
alter table bookmark enable row level security;

create policy "user reads own profile"
    on profile for select using (auth.uid() = id);
create policy "user updates own profile"
    on profile for update using (auth.uid() = id);

create policy "user crud own bookmarks"
    on bookmark for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Sembrar el primer admin a mano tras registrarte:
--   update profile set role = 'admin' where id = '<tu-uuid>';
-- (el uuid sale de Authentication > Users en el dashboard)
-- ------------------------------------------------------------
