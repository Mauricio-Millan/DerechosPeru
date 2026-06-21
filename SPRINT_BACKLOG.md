# Sprint Backlog — Portal de Conocimiento Constitucional

> Documento de control de desarrollo. Deriva de [REQUERIMIENTOS.MD](REQUERIMIENTOS.MD).
> **Stack:** Angular 20 (front) · FastAPI + Python (back) · Supabase/Postgres + pgvector (BD) · Azure (despliegue).
> **Leyenda de estado:** ✅ Hecho · 🟡 En progreso · ⬜ Pendiente · 🔒 Bloqueado

---

## 1. Mapa de módulos

| Módulo | Nombre | Requerimientos | Capa |
|---|---|---|---|
| **M0** | Infraestructura & Setup | RNF-06, RNF-07 | DevOps / BD |
| **M1** | Núcleo Constitucional (estructura, búsqueda, filtros) | RF-01, RF-02, RF-03 | Back + Front |
| **M2** | Consulta Guiada con IA | RF-04 | Back (IA) + Front |
| **M3** | Identidad & Marcadores | RF-15, RF-05 | Back + Front + Supabase Auth |
| **M4** | Control de Versiones | RF-06, RF-07, RF-08 | Back + Front |
| **M5** | Foro & Conocimiento Experto | RF-09, RF-10, RF-11 | Back + Front |
| **M6** | Administración & Curaduría | RF-12, RF-13, RF-14 | Back + Front |
| **M7** | Métricas & Gap Analysis | RF-16 | Back + Front |
| **M8** | Ingesta ETL, Revisión vs PDF y Publicación | RF-17, RF-18, RF-19 | Back (ETL) + Front + Storage |

---

## 2. Roadmap de Sprints

| Sprint | Objetivo (incremento entregable) | Módulos |
|---|---|---|
| **Sprint 1** | **Primer entregable:** Constitución cargada, organizada y categorizada + Consulta Guiada IA, navegable desde el front. | M0, M1, M2 |
| **Sprint 2** | Cuentas de usuario y marcadores persistentes. | M3 |
| **Sprint 3** | Foro y captación de conocimiento experto. | M5 |
| **Sprint 4** | Control de versiones (1979 / reformas) + comparador. | M4 |
| **Sprint 5** | Panel de administración, curaduría y métricas (Gap Analysis). | M6, M7 |
| **Sprint 6** | Ingesta de constituciones por ETL, revisión asistida contra PDF y publicación controlada. | M8 |

---

## 3. Esquema de Base de Datos y cómo funciona

### 3.1 Diagrama de entidades (Sprint 1)

```
constitution_version 1───* titulo 1───* capitulo 1───* articulo *───1 category
                                                          │
                                                          ├─ search_tsv   (tsvector, full-text español)
                                                          └─ embedding     (vector(384), pgvector)
consulta_log   (bitácora de consultas guiadas → alimenta M7)
```

### 3.2 Tablas (Sprint 1 — ya creadas en `sql/02_schema.sql`)

| Tabla | Rol | Campos clave |
|---|---|---|
| `constitution_version` | Versión de la Constitución (1993 vigente; base para M4) | `year`, `is_current` |
| `category` | Taxonomía → chips de "Buscar / Filtrar" | `slug`, `name`, `color` |
| `titulo` | Títulos (6) | `numero_romano`, `version_id` |
| `capitulo` | Capítulos (26) | `titulo_id`, `numero_romano` |
| `articulo` | Artículos (206), contenido + vectores | `numero`, `contenido`, `search_tsv`, `embedding`, `category_id` |
| `consulta_log` | Cada consulta guiada (analítica) | `query_text`, `matched_article_ids`, `result_count` |

### 3.3 Tablas futuras (por sprint)

| Tabla | Sprint | Para |
|---|---|---|
| `profile` (extiende `auth.users` de Supabase) | S2 | Rol del usuario (enum de 5: `ciudadano`/`redactor`/`experto`/`editor`/`admin` — ver [ROLES.md](ROLES.md)) |
| `bookmark` | S2 | Marcadores (`user_id`, `articulo_id`) |
| `forum_thread`, `forum_post`, `post_vote` | S3 | Foro y votación |
| `expert_annotation` | S3 | Anotaciones de expertos sobre artículos |
| `version_article_map`, `reform` | S4 | Equivalencias entre versiones + reformas |
| `ingest_job`, `source_document` | S6 | Trabajo de ingesta ETL + PDF fuente (Storage) |
| `article_review` (o campos en `articulo`) | S6 | Estado de revisión por artículo (verificado/observado) |

> **Estados nuevos para M8:** `constitution_version.status` (`borrador → en_revisión → publicada → archivada`) y `articulo.review_status` (`pendiente / verificado / observado`) con `reviewer_id` y `reviewed_at`.

### 3.4 Cómo funciona la búsqueda (núcleo del proyecto)

**Búsqueda directa (RF-02/03) — léxica:**
```
texto → plainto_tsquery('spanish') → match contra articulo.search_tsv (índice GIN) → ts_rank
```

**Consulta guiada (RF-04) — semántica:**
```
"me despidieron sin pago"
   → embed_query()  [modelo local multilingüe, 384 dims]
   → vector
   → pgvector: articulo.embedding <=> vector  (distancia coseno, índice HNSW)
   → top-N artículos ordenados por similitud
   → se registra en consulta_log (para M7)
```

> **Híbrido:** a futuro se combina el `ts_rank` léxico con la `similarity` semántica para ordenar mejor.

---

## 4. Sprint 1 — Primer entregable (DETALLE)

**Meta:** un usuario abre el portal, navega la Constitución por estructura, busca/filtra artículos y hace una consulta en lenguaje natural que devuelve artículos relevantes.

### M0 · Infraestructura & Setup
| ID | Tarea | Func. backend / DevOps | Estado |
|---|---|---|---|
| T0.1 | Entorno conda `fastapi-DerechosPeru` con dependencias | — | ✅ |
| T0.2 | Estructura del proyecto FastAPI (core/models/schemas/services/api) | Arquitectura base | ✅ |
| T0.3 | Scripts SQL (extensiones, schema, RLS) | `sql/01..03` | ✅ |
| T0.4 | Crear proyecto Supabase y ejecutar los 3 SQL (activar pgvector) | Provisión BD | ⬜ |
| T0.5 | Crear `.env` con `DATABASE_URL` (connection pooler 6543) | Config conexión | ⬜ |
| T0.6 | Embeddings locales gratuitos (sentence-transformers, 384) | `services/embeddings.py` | ✅ |
| T0.7 | Dockerfile para despliegue en Azure Container Apps | DevOps | ✅ |

### M1 · Núcleo Constitucional
| ID | Tarea | Func. backend | Endpoint | Estado |
|---|---|---|---|---|
| T1.1 | Modelo ORM (version, category, titulo, capitulo, articulo) | `models/constitution.py` | — | ✅ |
| T1.2 | Seed: cargar `constitucion.json` + categorizar + embeddings | `scripts/seed_constitucion.py` | — | ✅ (código) / ⬜ ejecutar |
| T1.3 | Vista "Por estructura" (árbol con contadores) | `routes/estructura.py` | `GET /api/estructura` | ✅ |
| T1.4 | Listar categorías (chips) | `routes/articulos.py` | `GET /api/categorias` | ✅ |
| T1.5 | Búsqueda directa + filtro por categoría (full-text) | `routes/articulos.py` | `GET /api/articulos?q=&categoria=` | ✅ |
| T1.6 | Detalle de artículo | `routes/articulos.py` | `GET /api/articulos/{numero}` | ✅ |
| T1.7 | Curaduría inicial de `sumilla` (títulos cortos) | Datos (RF-12) | — | ⬜ |

### M2 · Consulta Guiada con IA
| ID | Tarea | Func. backend | Endpoint | Estado |
|---|---|---|---|---|
| T2.1 | Servicio de embeddings (proveedor intercambiable) | `services/embeddings.py` | — | ✅ |
| T2.2 | Búsqueda vectorial + umbral de similitud | `services/consulta_service.py` | — | ✅ |
| T2.3 | Endpoint de consulta + aviso legal | `routes/consulta.py` | `POST /api/consulta` | ✅ |
| T2.4 | Registro en `consulta_log` (para M7) | `services/consulta_service.py` | — | ✅ |
| T2.5 | (Opcional) Redacción con LLM gratuito (Groq) sobre los artículos hallados | `services/llm.py` (nuevo) | — | ⬜ |

### Front (Angular) — Sprint 1
| ID | Tarea | Componente / Servicio | Estado |
|---|---|---|---|
| TF1.1 | `ConstitucionService` (HttpClient → API) | `core/services` | ⬜ |
| TF1.2 | Configurar `environment.ts` con `apiUrl` | config | ⬜ |
| TF1.3 | Vista "Por estructura" (árbol Título/Capítulo/Artículo) | componente | ⬜ |
| TF1.4 | Vista "Buscar / Filtrar" (input + chips + resultados) | componente | ⬜ |
| TF1.5 | Vista "Consulta guiada" (textarea + ejemplos + resultados) | componente | ⬜ |
| TF1.6 | Tarjeta de artículo reutilizable (expandible + cita) | componente | ⬜ |

### Definición de Hecho (DoD) — Sprint 1
- [ ] Los 3 SQL ejecutados en Supabase; pgvector activo.
- [ ] Seed cargó 206 artículos con embeddings (`select count(*) from articulo where embedding is not null`).
- [ ] `GET /api/estructura`, `/api/articulos`, `/api/consulta` responden desde el front desplegado en local.
- [ ] Consulta "me despidieron sin pago" devuelve artículos laborales coherentes.
- [ ] CORS permite el origen del front (`http://localhost:4200`).

---

## 5. Conexión Backend ↔ Frontend

### 5.1 Contrato (endpoints Sprint 1)
| Vista del front | Método | Ruta |
|---|---|---|
| Por estructura | GET | `/api/estructura` |
| Chips de categoría | GET | `/api/categorias` |
| Buscar / Filtrar | GET | `/api/articulos?q=&categoria=&limit=&offset=` |
| Detalle artículo | GET | `/api/articulos/{numero}` |
| Consulta guiada | POST | `/api/consulta` body `{ "texto": "..." }` |

### 5.2 Pasos de integración
1. **CORS** (back): `CORS_ORIGINS` ya incluye `http://localhost:4200`; añadir la URL de producción al desplegar.
2. **environment** (front): definir `apiUrl` en `src/environments/environment.ts` (`http://localhost:8000/api`) y el de producción.
3. **Servicio Angular**: un `ConstitucionService` con `HttpClient` que consuma cada endpoint y tipe las respuestas según los `schemas` de Pydantic.
4. **(Recomendado) Cliente tipado automático**: FastAPI expone OpenAPI en `/openapi.json`; se puede generar el cliente TypeScript con `openapi-generator` para no escribir interfaces a mano y mantener sincronía con el back.
5. **Manejo de estados**: loading / vacío / error en cada vista (la pantalla "Guardados" ya tiene su estado vacío en el diseño).

### 5.3 Flujo de una request (ejemplo consulta guiada)
```
Angular (Consulta guiada)
  → POST http://localhost:8000/api/consulta { texto }
    → FastAPI routes/consulta.py
      → consulta_service.consultar()
        → embeddings.embed_query()  (modelo local)
        → pgvector (Supabase)  busca vecinos
        → consulta_log INSERT
      ← [ artículos + similarity + aviso_legal ]
  ← render de tarjetas de artículo
```

---

## 6. Backlog de Sprints siguientes (resumen)

### Sprint 2 — M3 · Identidad, Marcadores & fundación RBAC
> Roles canónicos: ver [ROLES.md](ROLES.md). Alcance: fundación mínima (sin guards especulativos).
| ID | Tarea | Func. backend | Estado |
|---|---|---|---|
| T3.1 | Tabla `profile` + `bookmark` + trigger + RLS por usuario | `sql/04_auth.sql` | ✅ (código) / ⬜ ejecutar en Supabase |
| T3.2 | Verificación de JWT de Supabase + `require_role()` reutilizable | `core/auth.py` | ✅ |
| T3.3 | Endpoints de marcadores (`GET/POST/DELETE /api/bookmarks`) + `GET /api/me` | `routes/bookmarks.py`, `routes/cuenta.py` | ✅ |
| T3.4 | Endpoint admin de asignación de rol (`GET`/`PATCH /api/admin/usuarios`) | `routes/admin.py` | ✅ |
| T3.5 | Front: login/registro, sesión en header, interceptor JWT | `auth.service`, `auth.interceptor`, `features/auth` | ✅ |
| T3.6 | Front: "Guardados" persistente (migra localStorage→backend con fallback) | `guardados.service` | ✅ |
| T3.7 | Front: vista admin `admin/usuarios` + guard de ruta | `features/admin`, `core/guards` | ✅ |
| T3.8 | Configurar `SUPABASE_JWT_SECRET` en `.env` y en el Container App | Config/DevOps | ⬜ |

### Sprint 3 — M5 · Foro & Conocimiento Experto
> Detalle ejecutable: [SPRINT3_FORO.md](SPRINT3_FORO.md) (doc de delegación).
> Alcance: M5 **sin moderación de terceros** (RF-14 → Sprint 5). Actualización por **polling ligero** (no SSE/Realtime).
| ID | Tarea | Func. backend | Estado |
|---|---|---|---|
| T5.1 | Tablas `forum_thread`, `forum_post`, `post_vote`, `expert_annotation` | `sql/05_foro.sql` | ⬜ |
| T5.2 | CRUD de hilos y respuestas (`/api/foro/...`) | `routes/forum.py` | ⬜ |
| T5.3 | Respuesta verificada (`require_role` experto+) + votación útil/no-útil + "mejor respuesta" | `routes/forum.py` | ⬜ |
| T5.4 | Anotaciones de expertos por artículo (`/api/articulos/{id}/anotaciones`) | `routes/annotations.py` | ⬜ |
| T5.5 | Front: vista foro (lista), hilo (detalle + polling), editor de respuesta | `features/foro` | ⬜ |
| T5.6 | Front: anotaciones de expertos en la tarjeta de artículo | `shared/article-card` | ⬜ |
| T5.7 | Test `test_foro.py` (toggle de voto + guard de `verificar`) | `tests/` | ⬜ |

### Sprint 4 — M4 · Control de Versiones
| ID | Tarea | Func. backend | Estado |
|---|---|---|---|
| T4.1 | Cargar Constitución de 1979 como nueva `constitution_version` | seed adicional | ⬜ |
| T4.2 | Tabla `version_article_map` + `reform` | SQL | ⬜ |
| T4.3 | Endpoint de comparación (diff de artículos equivalentes) | `routes/versiones.py` | ⬜ |
| T4.4 | Historial de artículo (timeline de reformas) | `routes/versiones.py` | ⬜ |
| T4.5 | Front: selector de versión + vista comparador (diff) | Angular | ⬜ |

### Sprint 5 — M6 · Administración + M7 · Métricas
| ID | Tarea | Func. backend | Estado |
|---|---|---|---|
| T6.1 | CRUD de artículos, categorías, publicación (RF-12/13) | `routes/admin.py` | ⬜ |
| T6.2 | Moderación del foro + verificación de expertos (RF-14) | `routes/admin.py` | ⬜ |
| T7.1 | Endpoint de métricas: consultas frecuentes, búsquedas sin resultados | `routes/metrics.py` | ⬜ |
| T7.2 | Gap Analysis: artículos más consultados/guardados, hilos sin responder | `services/metrics_service.py` | ⬜ |
| T7.3 | Front: dashboard de administración | Angular | ⬜ |

### Sprint 6 — M8 · Ingesta ETL, Revisión vs PDF y Publicación

**Meta:** un revisor sube el texto + PDF de una constitución, el sistema la extrae a *borrador*, el revisor la verifica artículo por artículo contra el PDF y, cuando está 100% revisada y pasa el QA, la publica.

**Flujo del módulo:**
```
Subir .md/.txt + PDF
  → POST /api/admin/ingest        (parser ETL)  → versión en estado 'borrador'
  → GET  /api/admin/ingest/{id}/qa (validación)  → reporte (conteos, jerarquía, 1..N completo)
  → Revisión doble panel (PDF | extraído)
       marca artículo verificado / observado, corrige texto
  → cuando 100% verificado y QA OK:
  → POST /api/admin/versions/{id}/publish  → genera embeddings + status 'publicada'
```

| ID | Tarea | Func. backend / Front | Estado |
|---|---|---|---|
| T8.1 | Refactor de `etl/etlconstitucion.py` a función pura `parse_constitution(text) -> dict` (sin I/O de archivos, encoding parametrizable) | `etl/` | ⬜ |
| T8.2 | Refactor de `etl/verify_json.py` a `validate(data) -> reporte` (sin `sys.exit`, devuelve errores estructurados) | `etl/` | ⬜ |
| T8.3 | Tablas/estados: `constitution_version.status`, `articulo.review_status` + `reviewer_id`/`reviewed_at`, `source_document`, `ingest_job` | SQL | ⬜ |
| T8.4 | Storage del PDF fuente en Supabase Storage (subida + URL firmada) | `services/storage.py` | ⬜ |
| T8.5 | Endpoint de ingesta (multipart: texto + PDF) → crea versión 'borrador' | `POST /api/admin/ingest` | ⬜ |
| T8.6 | Endpoint de reporte QA de una versión en borrador | `GET /api/admin/ingest/{id}/qa` | ⬜ |
| T8.7 | Endpoint para marcar revisión por artículo (verificado/observado + edición) | `PATCH /api/admin/articulos/{id}/review` | ⬜ |
| T8.8 | Endpoint de progreso de revisión (verificados/total) | `GET /api/admin/versions/{id}/progress` | ⬜ |
| T8.9 | Endpoint de publicación (valida 100% + QA → embeddings → status 'publicada') | `POST /api/admin/versions/{id}/publish` | ⬜ |
| T8.10 | Front: asistente de ingesta (subir archivos + ver reporte QA) | Angular | ⬜ |
| T8.11 | Front: **vista de revisión doble panel** (visor PDF + lista de artículos extraídos, marcar/editar, barra de progreso) | Angular (visor PDF, p. ej. `ngx-extended-pdf-viewer`) | ⬜ |
| T8.12 | Front: botón "Publicar" habilitado solo al 100% verificado | Angular | ⬜ |

**Definición de Hecho (DoD) — Sprint 6**
- [ ] Subir el texto de la Constitución de 1979 genera una versión en 'borrador' sin afectar la vigente.
- [ ] El reporte QA detecta huecos/duplicados en la numeración de artículos.
- [ ] La vista doble panel permite ver el PDF y el artículo extraído lado a lado y marcarlo verificado.
- [ ] No se puede publicar hasta que el 100% de artículos esté verificado.
- [ ] Al publicar, se generan embeddings y la versión aparece en el selector de versiones (RF-06).

> **Nota de viabilidad:** el parser actual es específico del formato de 1993 (regex `TITULO/CAPITULO/Artículo N.-`). Para otras constituciones (1979) se deberán ajustar los patrones; por eso la revisión asistida (T8.11) y el QA son imprescindibles antes de publicar.

---

## 6.bis Despliegue en Azure (monorepo)

El repositorio es un **monorepo**: un solo repo con dos proyectos desplegables por separado.

```
DerechosPeru/                 (raíz del repo / monorepo)
├── BackDerechosPeru/         → API FastAPI  → Azure Container Apps (contenedor)
├── FrontDerechosPeru/        → SPA Angular  → Azure Static Web Apps
└── (Supabase: BD gestionada, fuera de Azure)
```

### Topología de despliegue
```
Usuario ─► Azure Static Web Apps (Angular)
               │  llama por HTTPS a
               ▼
          Azure Container Apps (FastAPI, scale-to-zero)
               │  conexión 6543 (Supavisor, modo transacción)
               ▼
          Supabase (Postgres + pgvector)
```

### Backend → Azure Container Apps
| ID | Tarea | Detalle | Estado |
|---|---|---|---|
| TA.1 | Build de imagen desde `BackDerechosPeru/Dockerfile` | `az acr build --registry <acr> --image backderechos:latest BackDerechosPeru` | ⬜ |
| TA.2 | Crear Container App (plan Consumo) | `min-replicas 0` (scale-to-zero, gratis) · `max-replicas` bajo | ⬜ |
| TA.3 | Variables de entorno como **secrets** | `DATABASE_URL` (6543), `EMBEDDING_*`, `CORS_ORIGINS` con la URL del front | ⬜ |
| TA.4 | Verificar cold start con modelo local | 1ª request tras reposo carga torch+modelo (lento, normal) | ⬜ |
| TA.5 | Exponer ingress público (HTTPS) | Target port = `$PORT` (el Dockerfile ya lo respeta) | ⬜ |

### Frontend → Azure Static Web Apps
| ID | Tarea | Detalle | Estado |
|---|---|---|---|
| TA.6 | Crear Static Web App apuntando al monorepo | `app_location: FrontDerechosPeru` · `output_location: dist/<app>/browser` | ⬜ |
| TA.7 | `environment.prod.ts` con `apiUrl` de la Container App | reemplaza `localhost:8000` | ⬜ |
| TA.8 | Agregar el dominio del front a `CORS_ORIGINS` del backend | evita bloqueo CORS en producción | ⬜ |

### CI/CD del monorepo (clave por ser monorepo)
| ID | Tarea | Detalle | Estado |
|---|---|---|---|
| TA.9 | Workflow backend con filtro de ruta | GitHub Actions `on: push: paths: ['BackDerechosPeru/**']` → solo redepliega el back si cambió el back | ⬜ |
| TA.10 | Workflow frontend con filtro de ruta | `paths: ['FrontDerechosPeru/**']` → solo redepliega el front | ⬜ |
| TA.11 | Guardar secretos en GitHub Actions / Azure | nunca commitear `.env`; usar secrets del repo y de la Container App | ⬜ |

> **Por qué los filtros de ruta:** en un monorepo, sin `paths:` cada push redesplegaría **ambos** proyectos aunque solo tocaras uno. Los filtros hacen que cada cambio dispare solo el pipeline correcto.

> **Costo (capa gratuita):** Static Web Apps tiene un tier gratuito; Container Apps con `min-replicas 0` solo consume cuando hay tráfico. Supabase free aparte. Total ≈ 0 mientras el uso sea bajo.

---

## 7. Estado global (resumen ejecutivo)

| Módulo | Avance |
|---|---|
| M0 Infraestructura | 🟡 (SQL aplicado en Supabase ✅; `.env` creado — falta `DATABASE_URL` real) |
| M1 Núcleo Constitucional | 🟡 (backend listo; falta ejecutar seed + front) |
| M2 Consulta Guiada IA | 🟡 (backend listo y verificado; falta front) |
| M3 Identidad, Marcadores & RBAC | 🟡 (código back+front listo; falta ejecutar `04_auth.sql` y configurar `SUPABASE_JWT_SECRET`) |
| M4–M7 | ⬜ Pendientes |
| M8 Ingesta ETL + Revisión vs PDF | ⬜ Pendiente (scripts base ya en `etl/`) |

**Próximo paso crítico:** completar **T0.4 + T0.5 + T1.2** (Supabase + `.env` + seed) para tener datos reales, y luego arrancar el front (TF1.x).
