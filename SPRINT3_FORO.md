# Sprint 3 — Foro & Conocimiento Experto (M5) · Documento de delegación

> **Para la IA ejecutora:** este proyecto ya tiene Sprints 1-2 **en producción**. **Reutiliza los patrones existentes** — no inventes arquitectura nueva. Cada sección dice qué archivo espejar. No toques `.env` (está en `.gitignore`). Al terminar, el usuario ejecuta el SQL y hace `git push` (el CI/CD despliega). Stack: FastAPI + SQLAlchemy async + Pydantic v2 (back) · Angular 20 standalone + signals (front) · Supabase/Postgres (BD).
>
> **Qué construyes (RF-09/10/11):** foro de hilos por artículo/tema, respuestas con votación útil/no-útil, respuestas "verificadas" por expertos, "mejor respuesta", y anotaciones de expertos sobre artículos. **Fuera de alcance:** moderación de contenido ajeno (RF-14 → Sprint 5).

---

## 0. Reglas de oro (leer primero)
- **Backend usa `service_role`** → ignora RLS. La seguridad real es el filtro por `user_id`/rol **en código** (mira `app/api/routes/bookmarks.py`).
- **Auth ya existe:** reutiliza de `app/core/auth.py` → `get_current_user`, `get_optional_user`, `require_role(*roles)`, `CurrentUser(id, role)`. NO los reescribas.
- **Roles** (ver `ROLES.md`): `ciudadano`, `redactor`, `experto`, `editor`, `admin`.
- **Registrar routers** en `app/main.py` igual que los demás (`app.include_router(x.router, prefix=settings.API_PREFIX)`).
- **Exportar modelos** en `app/models/__init__.py`.
- Mantén el estilo: type hints, async/await, comentarios breves en español.

## 1. Matriz RBAC del Sprint 3 (quién puede qué)
| Acción | Quién | Dependency |
|---|---|---|
| Leer foro / hilos / anotaciones | cualquiera (anónimo incluido) | `get_optional_user` o ninguno |
| Crear hilo / responder / votar | autenticado | `get_current_user` |
| Borrar hilo/respuesta propios | autor | `get_current_user` + check `author_id == user.id` |
| Cerrar hilo / marcar "mejor respuesta" | autor del hilo | `get_current_user` + check autor |
| Marcar respuesta "verificada" | experto/editor/admin | `require_role("experto","editor","admin")` |
| Crear anotación de experto | experto/editor/admin | `require_role("experto","editor","admin")` |
| Borrar anotación | autor de la anotación | `get_current_user` + check autor |
| Moderar contenido ajeno | **DIFERIDO a Sprint 5** | — |

## 2. Base de datos — crear `BackDerechosPeru/sql/05_foro.sql`
> Ejecutar en el SQL Editor de Supabase DESPUÉS de `01..04`. Espeja el estilo y los comentarios de `sql/04_auth.sql`.

```sql
-- ============================================================
-- 05_foro.sql (Sprint 3 — M5: Foro & Conocimiento Experto)
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
```

## 3. Backend

### 3.1 Modelos — crear `app/models/forum.py`
Espeja `app/models/auth.py` (usa `Uuid`, `BigInteger`, `ForeignKey`, `Mapped`, `mapped_column`). Clases: `ForumThread`, `ForumPost`, `PostVote`, `ExpertAnnotation` con las columnas del SQL de arriba. Exporta las 4 en `app/models/__init__.py` (añádelas a la lista de imports y a `__all__`).

### 3.2 Schemas — crear `app/schemas/forum.py`
Espeja `app/schemas/auth.py`. Define (Pydantic v2):
- `ThreadCreate`: `titulo: str` (min 5, max 200), `contenido: str` (min 5), `articulo_id: int | None = None`, `category_id: int | None = None`.
- `ThreadOut`: `id, titulo, contenido, articulo_id, category_id, author_id: uuid, author_name: str | None, is_closed: bool, best_post_id: int | None, total_respuestas: int, created_at`.
- `PostOut`: `id, thread_id, contenido, author_id, author_name, is_verified, votos: int` (suma neta), `mi_voto: int` (−1/0/1), `created_at`.
- `ThreadDetailOut`: igual que `ThreadOut` + `respuestas: list[PostOut]`.
- `PostCreate`: `contenido: str` (min 1).
- `VoteIn`: `value: int` (validar que sea −1 o 1, con `field_validator` como en `RolUpdate`).
- `MejorRespuestaIn`: `post_id: int`.
- `AnnotationCreate`: `contenido: str` (min 5).
- `AnnotationOut`: `id, articulo_id, contenido, author_id, author_name, created_at`.

`author_name` sale de `profile.display_name` (LEFT JOIN con `Profile`). Puede ser `None`.

### 3.3 Rutas del foro — crear `app/api/routes/forum.py`
`router = APIRouter(prefix="/foro", tags=["foro"])`. Espeja la estructura de `bookmarks.py` (commit + selectinload donde aplique).

| Método y ruta | Auth | Comportamiento |
|---|---|---|
| `GET /api/foro/threads?articulo_id=&category_id=&limit=20&offset=0` | ninguno | Lista hilos (filtros opcionales), orden `created_at desc`. Incluye `total_respuestas` (count de `forum_post`) y `author_name` (join `Profile`). |
| `POST /api/foro/threads` | `get_current_user` | Crea hilo con `author_id=user.id`. Devuelve `ThreadOut`. |
| `GET /api/foro/threads/{id}` | `get_optional_user` | Hilo + `respuestas` ordenadas: **verificadas primero, luego por `votos` desc, luego `created_at` asc**. Si hay usuario, calcula `mi_voto`. |
| `POST /api/foro/threads/{id}/respuestas` | `get_current_user` | Crea respuesta. Si `thread.is_closed` → 409. |
| `PATCH /api/foro/threads/{id}/cerrar` | `get_current_user` | Solo autor del hilo (si no, 403). Alterna `is_closed`. |
| `PATCH /api/foro/threads/{id}/mejor-respuesta` | `get_current_user` | Solo autor del hilo. Body `MejorRespuestaIn`. Valida que el post pertenezca al hilo; set `best_post_id`. |
| `DELETE /api/foro/threads/{id}` | `get_current_user` | Solo autor (si no, 403). Cascade borra respuestas/votos. 204. |
| `POST /api/foro/respuestas/{id}/voto` | `get_current_user` | Upsert en `post_vote`. **Si ya existe el mismo `value` → lo borra (toggle); si existe distinto → lo actualiza; si no existe → inserta.** Devuelve `{votos, mi_voto}`. |
| `PATCH /api/foro/respuestas/{id}/verificar` | `require_role("experto","editor","admin")` | Alterna `is_verified`; al activar set `verified_by=user.id`, `verified_at=now()`. |
| `DELETE /api/foro/respuestas/{id}` | `get_current_user` | Solo autor. 204. |

**Cálculo de votos (hazlo simple y correcto):** para el detalle del hilo, tras cargar las respuestas, ejecuta UNA query agrupada: `select post_id, coalesce(sum(value),0) from post_vote where post_id in (:ids) group by post_id` → dict `{post_id: votos}`. Para `mi_voto`: `select post_id, value from post_vote where user_id=:uid and post_id in (:ids)`.

### 3.4 Anotaciones — crear `app/api/routes/annotations.py`
`router = APIRouter(tags=["anotaciones"])`.

| Método y ruta | Auth | Comportamiento |
|---|---|---|
| `GET /api/articulos/{articulo_id}/anotaciones` | ninguno | Lista anotaciones del artículo (con `author_name`), orden `created_at desc`. |
| `POST /api/articulos/{articulo_id}/anotaciones` | `require_role("experto","editor","admin")` | Crea anotación con `author_id=user.id`. |
| `DELETE /api/anotaciones/{id}` | `get_current_user` | Solo autor. 204. |

### 3.5 Registrar routers
En `app/main.py` añade los imports y `app.include_router(forum.router, prefix=settings.API_PREFIX)` y lo mismo para `annotations.router`.

### 3.6 Test mínimo — crear `tests/test_foro.py`
Espeja `tests/test_auth.py` (sin DB). Prueba la **lógica de toggle de voto** como función pura: extrae la decisión (insertar/actualizar/borrar) a una pequeña función `decidir_voto(actual: int | None, nuevo: int) -> str` (úsala dentro del endpoint de voto) y testea los 3 casos:
- `decidir_voto(None, 1) == "insertar"`
- `decidir_voto(1, 1) == "borrar"`
- `decidir_voto(1, -1) == "actualizar"`

Y un check de que `verificar` rechaza a un `ciudadano` (usa `require_role("experto","editor","admin")` directamente con un `CurrentUser` falso, como en `test_auth.py`).

## 4. Frontend (Angular 20, standalone, signals)

### 4.1 Modelos — `src/app/core/models/foro.models.ts`
Interfaces `Thread`, `ThreadDetail`, `Post`, `Annotation` con los **mismos nombres de campo que devuelve el JSON del backend** (snake_case tal cual: `author_name`, `is_verified`, `mi_voto`, `total_respuestas`, `best_post_id`).

### 4.2 Servicio — `src/app/core/services/foro.service.ts`
Espeja `core/services/constitucion.service.ts` (inject `HttpClient`, `API_BASE = environment.apiUrl`). Métodos: `listThreads(articuloId?, categoryId?, limit?, offset?)`, `getThread(id)`, `createThread(body)`, `addRespuesta(threadId, contenido)`, `votar(postId, value)`, `verificar(postId)`, `cerrar(threadId)`, `mejorRespuesta(threadId, postId)`, `borrarHilo(id)`, `borrarRespuesta(id)`, `getAnotaciones(articuloId)`, `addAnotacion(articuloId, contenido)`, `borrarAnotacion(id)`. El interceptor JWT (`core/interceptors/auth.interceptor.ts`, ya existe) adjunta el token solo.

### 4.3 Helpers de rol en `auth.service.ts` (modificar, mínimo)
Añade el computed `canVerify = computed(() => ['experto','editor','admin'].includes(this._rol()))` y exponlo como readonly. Úsalo en la UI. Ya existen `isLoggedIn`, `user`, `rol`, `isAdmin`.

### 4.4 Vistas/rutas
Monta el foro como hijos de `/constitucion` (reutiliza el layout con header/stats). En `app.routes.ts`, dentro de `children` de `constitucion`, añade:
- `foro` → `ForoComponent` (lista de hilos + botón "Nuevo hilo" si `isLoggedIn`).
- `foro/:id` → `HiloComponent` (detalle).

Componentes (espeja el patrón de `features/auth/auth.component.ts`: standalone, template inline, signals, `FormsModule`):
- **`features/foro/foro.component.ts`**: carga `listThreads()`, lista con `total_respuestas`, link a cada hilo. Formulario "nuevo hilo" (título + contenido + opcional artículo) visible si `auth.isLoggedIn()`.
- **`features/foro/hilo.component.ts`**: muestra hilo + respuestas. Por cada respuesta: contenido, autor, badge **"✓ Verificada"** si `is_verified`, marca **"★ Mejor respuesta"** si `id === best_post_id`, botones de voto (▲/▼ con `votos`, resaltando `mi_voto`). Acciones condicionales:
  - Responder (textarea) si `isLoggedIn` y no `is_closed`.
  - "Verificar" en cada respuesta si `auth.canVerify()`.
  - "Marcar mejor" / "Cerrar hilo" si el usuario es autor del hilo (`auth.user()?.id === thread.author_id`).
  - **Polling:** recarga el hilo cada ~12 s. Usa rxjs:
    ```ts
    timer(0, 12000).pipe(
      switchMap(() => this.foro.getThread(this.id)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(t => this.thread.set(t));
    ```
    (inyecta `DestroyRef`). Recarga también tras votar/responder/verificar.

### 4.5 Anotaciones de expertos en la tarjeta de artículo
Modifica `shared/components/article-card/article-card.component.ts` y su `.html`: añade una sección expandible **"Anotaciones de expertos"** que llama `foroService.getAnotaciones(articulo.id)` al expandir. Si `auth.canVerify()`, muestra un formulario para `addAnotacion`. Sepáralas visualmente del texto oficial (RF-11: "separadas del texto oficial"). Reusa el patrón de `expandido` signal ya presente.

### 4.6 Navegación
Añade una pestaña/enlace **"Foro"** junto a Estructura / Buscar / Guardados. Busca el componente que renderiza esos enlaces (revisa `features/constitucion/layout/` y `features/constitucion/estructura/sidebar/`) y añade el link a `/constitucion/foro` de la misma forma.

## 5. Pasos manuales del usuario (NO los hace la IA)
1. Ejecutar `BackDerechosPeru/sql/05_foro.sql` en el SQL Editor de Supabase.
2. `git push` a `main` (el CI/CD construye y despliega back y front automáticamente).
3. Para probar como experto: asignar rol `experto` a un usuario en `/admin/usuarios` (panel del Sprint 2).

## 6. Verificación end-to-end
- [ ] SQL ejecutado; 4 tablas creadas; FK circular `best_post_id` ok.
- [ ] `python -m tests.test_foro` pasa y `python -c "import app.main"` no falla.
- [ ] `npm run build` (en `FrontDerechosPeru`) compila sin errores.
- [ ] Anónimo: ve lista de hilos y un hilo con sus respuestas (lectura pública).
- [ ] Ciudadano: crea hilo, responde, vota (toggle quita el voto; cambiar de ▲ a ▼ actualiza).
- [ ] Autor del hilo: marca "mejor respuesta" y cierra el hilo; en hilo cerrado no se puede responder (409).
- [ ] Experto: "Verificar" una respuesta → aparece badge y sube al tope del orden. Crea una anotación en un artículo.
- [ ] Ciudadano intentando `PATCH .../verificar` → **403**. Sin token, crear hilo → **401**.
- [ ] Polling: con dos pestañas en el mismo hilo, una responde y la otra lo ve en ≤12 s.

## 7. Definición de Hecho (DoD)
- Tablas, endpoints, vistas y test creados siguiendo los patrones de Sprints 1-2.
- El foro capta conocimiento experto: respuestas verificadas destacan y las anotaciones aparecen junto al artículo, separadas del texto oficial.
- Sin guards especulativos de moderación (eso es Sprint 5).
- Backlog actualizado (marca T5.1-T5.7 como hechas al cerrar).
