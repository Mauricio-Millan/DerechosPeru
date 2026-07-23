# Sprint Backlog — Portal Constitucional del Perú
**Gestión del Conocimiento · UTP Lima Sur**
Stack: FastAPI + SQLAlchemy async · Angular 20 signals · Supabase/Postgres · Azure

---

## Sprint 1 — Fundación del proyecto
**Commit base:** `9d24bc5`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 1.1 | Estructura base FastAPI con CORS, prefijo `/api` y health check | Backend | ✅ |
| 1.2 | Modelos SQLAlchemy: `ConstitutionVersion`, `Titulo`, `Capitulo`, `Articulo`, `Category` | Backend | ✅ |
| 1.3 | Conexión async a Supabase/Postgres con pgvector (384 dim) | Backend | ✅ |
| 1.4 | Layout Angular con navegación principal y diseño responsivo | Frontend | ✅ |
| 1.5 | Endpoint `GET /api/estructura` — árbol jerárquico por versión vigente | Backend | ✅ |
| 1.6 | Vista "Por estructura" con títulos, capítulos y artículos expandibles | Frontend | ✅ |
| 1.7 | CI/CD: GitHub Actions → Azure Container Apps (back) + Static Web Apps (front) | DevOps | ✅ |
| 1.8 | Imagen Docker CPU-only (PyTorch sin CUDA, ~1.5 GB) | DevOps | ✅ |

---

## Sprint 2 — Identidad, Marcadores y RBAC (M3)
**Commit:** `6a98e5c`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 2.1 | Autenticación con Supabase Auth (JWT ES256/HS256 vía JWKS) | Backend | ✅ |
| 2.2 | Modelo `Profile` con rol RBAC: `ciudadano`, `redactor`, `experto`, `editor`, `admin` | Backend | ✅ |
| 2.3 | Dependencies reutilizables: `get_current_user`, `get_optional_user`, `require_role()` | Backend | ✅ |
| 2.4 | Modelo `Bookmark` — marcadores persistentes por usuario | Backend | ✅ |
| 2.5 | Endpoints CRUD de bookmarks (`GET/POST/DELETE /api/bookmarks`) | Backend | ✅ |
| 2.6 | Componente de login/registro con Supabase Auth en Angular | Frontend | ✅ |
| 2.7 | Guards de ruta: `authGuard`, `adminGuard`, `staffGuard` | Frontend | ✅ |
| 2.8 | Vista "Guardados" con artículos marcados por el usuario | Frontend | ✅ |
| 2.9 | Stats bar con contadores globales (títulos, capítulos, artículos, guardados) | Frontend | ✅ |

---

## Sprint 3 — Foro y Conocimiento Experto (M5)
**Commit:** `bfbed3e`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 3.1 | Modelos: `ForumThread`, `ForumPost`, `PostVote`, `ExpertAnnotation` | Backend | ✅ |
| 3.2 | Endpoints de foro: crear hilo, responder, votar útil/no-útil | Backend | ✅ |
| 3.3 | Marcar respuesta "mejor respuesta" (autor del hilo) | Backend | ✅ |
| 3.4 | Marcar respuesta "verificada" por experto/editor/admin | Backend | ✅ |
| 3.5 | Anotaciones de experto sobre artículos específicos | Backend | ✅ |
| 3.6 | Vista del foro con lista de hilos y paginación | Frontend | ✅ |
| 3.7 | Vista de hilo individual con respuestas y votación | Frontend | ✅ |
| 3.8 | Indicador visual de respuestas verificadas y mejor respuesta | Frontend | ✅ |

---

## Sprint 4 — Comparador Semántico
**Commit:** `6a8d161`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 4.1 | Embeddings por artículo (384 dim) generados al publicar una versión | Backend | ✅ |
| 4.2 | `GET /api/compare?base=&target=` — comparación por similitud coseno (pgvector) | Backend | ✅ |
| 4.3 | Clasificación automática: `identico`, `modificado`, `sin_equivalente`, `nuevo` | Backend | ✅ |
| 4.4 | `GET /api/versions` — versiones publicadas para los selectores | Backend | ✅ |
| 4.5 | Resumen estadístico de la comparación (idénticos, modificados, etc.) | Backend | ✅ |
| 4.6 | Vista "Comparador" con selectores de versión y tabla de diferencias | Frontend | ✅ |
| 4.7 | Sidebar deslizable en móvil y modal de bienvenida | Frontend | ✅ |

---

## Sprint 5 — Área Admin, Analítica, Búsqueda y UX
**Commits:** `95513b9`, `93487a8`, `8719da6`, `498a76a`, `5b67b71`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 5.1 | Panel admin protegido por rol (`editor`, `admin`) | Frontend | ✅ |
| 5.2 | Dashboard de analítica: artículos más consultados, búsquedas frecuentes | Frontend | ✅ |
| 5.3 | `GET /api/analytics/...` — endpoints de métricas desde `ConsultaLog` | Backend | ✅ |
| 5.4 | Editor Markdown en el panel de revisión de artículos | Frontend | ✅ |
| 5.5 | Búsqueda flexible `ILIKE` por término + full-text search (`tsvector`) | Backend | ✅ |
| 5.6 | Vista "Buscar / Filtrar" con filtros por versión y categoría | Frontend | ✅ |
| 5.7 | Registro de búsquedas en `ConsultaLog` para analítica | Backend | ✅ |
| 5.8 | Apartado de Novedades/Changelog visible en el frontend | Frontend | ✅ |
| 5.9 | Estado de carga skeleton en vista de estructura | Frontend | ✅ |
| 5.10 | Panel admin de gestión de usuarios con cambio de rol | Frontend | ✅ |

---

## Sprint 6 — Ingesta de PDFs y Revisión (M8)
**Commits:** `9c4d491`, `a307d4f`, `5637456`, `87570e8`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 6.1 | ETL: extracción de texto PDF con `pymupdf4llm`/`pypdf` + parser de jerarquía | Backend | ✅ |
| 6.2 | Parser regex para `Art. N°`, `Tít. I`, `Cap. I` (abreviaturas reales de PDFs) | Backend | ✅ |
| 6.3 | `POST /admin/ingest` — sube PDF, extrae, crea versión `borrador` | Backend | ✅ |
| 6.4 | Almacenamiento del PDF fuente en Supabase Storage (bucket privado) | Backend | ✅ |
| 6.5 | QA estructural automático al ingerir (`validate_structure`) | Backend | ✅ |
| 6.6 | `GET /admin/versions/{id}/articulos` — artículos del borrador para revisión | Backend | ✅ |
| 6.7 | `GET /admin/versions/{id}/pdf` — URL firmada del PDF fuente (expira en 1h) | Backend | ✅ |
| 6.8 | `PATCH /admin/articulos/{id}/review` — verificar / observar / editar artículo | Backend | ✅ |
| 6.9 | `POST /admin/versions/{id}/publish` — publica si 100% verificado (genera embeddings) | Backend | ✅ |
| 6.10 | Panel doble: PDF a la izquierda + lista de artículos a la derecha | Frontend | ✅ |
| 6.11 | Barra de progreso de revisión (verificados / total) | Frontend | ✅ |
| 6.12 | Pestaña "Estructura" en el panel de revisión — CRUD de títulos y capítulos | Frontend | ✅ |
| 6.13 | Reasignación masiva de artículos a capítulo/título mediante casillas | Frontend | ✅ |
| 6.14 | `DELETE /admin/versions/{id}` — borrar versión (cascade BD + PDF en Storage) | Backend | ✅ |
| 6.15 | `POST /admin/versions/{id}/articulos` — agregar artículo manual si ETL falla | Backend | ✅ |
| 6.16 | `DELETE /admin/articulos/{id}` — eliminar artículo mal extraído | Backend | ✅ |
| 6.17 | Botón "Eliminar" por versión en la lista de ingesta (con confirmación) | Frontend | ✅ |
| 6.18 | Formulario "+ Agregar artículo" y botón ✕ por artículo en panel de revisión | Frontend | ✅ |

---

## Sprint 7 — Chat IA Constitucional (Groq)
**Commits:** `3434a78`, `934512c`, `1e19359`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 7.1 | Integración con Groq SDK (`llama-3.3-70b-versatile`) | Backend | ✅ |
| 7.2 | RAG: primera pregunta → búsqueda semántica + log en `ConsultaLog` | Backend | ✅ |
| 7.3 | Historial conversacional: siguientes mensajes reusan artículos del contexto | Backend | ✅ |
| 7.4 | Citas como `[Art. N]` — el modelo cita artículos y argumenta con ellos | Backend | ✅ |
| 7.5 | `POST /api/consulta/chat` — requiere sesión válida (ciudadano+) | Backend | ✅ |
| 7.6 | Pestaña "Chat con IA" dentro de la consulta guiada | Frontend | ✅ |
| 7.7 | Chips de artículos clicables `[Art. N]` → abren modal con texto completo | Frontend | ✅ |
| 7.8 | Disclaimer orientativo ("la IA no brinda asesoramiento legal") | Frontend | ✅ |
| 7.9 | Estado de escritura con animación de tres puntos (typing indicator) | Frontend | ✅ |

---

## Sprint 8 — Historia Constitucional
**Commits:** `a186ab1`, `28c397b`, `a6ed329`, `c9148e6`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 8.1 | Línea de tiempo de 12 constituciones peruanas (1823–1993) | Frontend | ✅ |
| 8.2 | Panel de detalle: promulgador, cargo, vigencia (años en vigor), contexto histórico | Frontend | ✅ |
| 8.3 | Modal de congresistas constituyentes con facciones políticas para siglo XX (1920, 1933, 1979, 1993) | Frontend | ✅ |
| 8.4 | Codificación visual por ideología política (color por facción) | Frontend | ✅ |
| 8.5 | Líderes de bancada marcados con ★ | Frontend | ✅ |
| 8.6 | Videos YouTube incrustados (16:9) para constituciones 1920, 1933, 1979, 1993 | Frontend | ✅ |
| 8.7 | Disclaimer de créditos para material audiovisual externo | Frontend | ✅ |
| 8.8 | Datos completamente hardcodeados en TypeScript (sin backend, sin migraciones) | Frontend | ✅ |

---

## Sprint 9 — Examen Constitucional con Medallas
**Commits:** `ab57aa2`, `e3c4a13`

| # | Funcionalidad | Área | Estado |
|---|---|---|---|
| 9.1 | Banco de 30 preguntas fijas (10 por nivel: básico, intermedio, avanzado) | Backend | ✅ |
| 9.2 | `GET /api/examen/preguntas/{nivel}` — preguntas mezcladas sin revelar respuesta | Backend | ✅ |
| 9.3 | `POST /api/examen/enviar` — corrección, puntaje y guardado en `examen_resultado` | Backend | ✅ |
| 9.4 | Promoción automática de rol `ciudadano` → `experto` al aprobar nivel 3 | Backend | ✅ |
| 9.5 | `GET /api/examen/mi-progreso` — medallas y niveles completados del usuario | Backend | ✅ |
| 9.6 | Tabla `examen_resultado` en Supabase (nivel, puntaje, aprobado, timestamp) | Base de datos | ✅ |
| 9.7 | Landing `/examen` con 3 cards de nivel (básico 🥉, intermedio 🥈, avanzado 🥇) | Frontend | ✅ |
| 9.8 | Niveles bloqueados progresivamente (nivel 2 requiere aprobar nivel 1, etc.) | Frontend | ✅ |
| 9.9 | Quiz pregunta a pregunta con barra de progreso y navegación anterior/siguiente | Frontend | ✅ |
| 9.10 | Bloqueo de envío hasta responder las 10 preguntas | Frontend | ✅ |
| 9.11 | Pantalla de resultado con medalla, puntaje y revisión detallada por pregunta | Frontend | ✅ |
| 9.12 | Banner "Experto Constitucional ⭐" al completar los 3 niveles | Frontend | ✅ |
| 9.13 | Puntaje mínimo de aprobación: 7/10 (70%) | Backend | ✅ |

---

## Arquitectura técnica de referencia

### Backend (FastAPI)
- **Auth:** Supabase JWT (ES256 vía JWKS, fallback HS256). Rol leído de tabla `profile` en cada request → cambio de rol efectivo sin re-login.
- **Embeddings:** `all-MiniLM-L6-v2` (384 dim) vía `sentence-transformers`. Generados al publicar.
- **Búsqueda semántica:** pgvector coseno (`Articulo.embedding.cosine_distance(query_vec)`).
- **LLM:** Groq `llama-3.3-70b-versatile` en capa gratuita.
- **Storage:** Supabase Storage (bucket privado `constituciones`), URLs firmadas de 1h.

### Frontend (Angular 20)
- Componentes standalone con signals (`signal`, `computed`, `viewChild`).
- Lazy loading por ruta.
- SCSS con variables centralizadas en `styles/variables.scss`.
- `DomSanitizer.bypassSecurityTrustResourceUrl` para iframes YouTube.

### Base de datos (Supabase/Postgres)
| Tabla | Descripción |
|---|---|
| `constitution_version` | Versiones ingresadas (borrador → publicada) |
| `titulo` / `capitulo` / `articulo` | Jerarquía constitucional con embeddings |
| `profile` | Extensión de `auth.users` con rol RBAC |
| `bookmark` | Artículos guardados por usuario |
| `forum_thread` / `forum_post` / `post_vote` | Foro comunitario |
| `expert_annotation` | Anotaciones de expertos sobre artículos |
| `source_document` | Metadatos del PDF fuente por versión |
| `ingest_job` | Historial de ingestas con estadísticas |
| `consulta_log` | Log de búsquedas semánticas para analítica |
| `examen_resultado` | Resultados del examen por usuario y nivel |
