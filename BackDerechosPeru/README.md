# BackDerechosPeru — API (FastAPI + Supabase/pgvector)

Backend del Portal de Gestión del Conocimiento sobre la Constitución Política del Perú.
Primer entregable: **carga organizada y categorizada de la Constitución** + **Consulta Guiada con IA**.

## Estructura del proyecto

```
BackDerechosPeru/
├── app/
│   ├── main.py                 # FastAPI app, CORS, routers
│   ├── core/
│   │   ├── config.py           # Settings desde .env (pydantic-settings)
│   │   └── database.py         # Engine async SQLAlchemy -> Supabase
│   ├── models/
│   │   └── constitution.py     # ORM: version, category, titulo, capitulo, articulo, consulta_log
│   ├── schemas/
│   │   └── constitution.py     # Contratos Pydantic (entrada/salida)
│   ├── services/
│   │   ├── embeddings.py        # Proveedor de embeddings (openai/local/fake)
│   │   └── consulta_service.py  # Consulta guiada (búsqueda vectorial)
│   └── api/routes/
│       ├── estructura.py        # RF-01  GET /api/estructura
│       ├── articulos.py         # RF-02/03 GET /api/articulos, /categorias, /articulos/{n}
│       └── consulta.py          # RF-04  POST /api/consulta
├── scripts/
│   └── seed_constitucion.py     # Carga constitucion.json + embeddings
├── sql/
│   ├── 01_extensions.sql        # vector, unaccent, pg_trgm
│   ├── 02_schema.sql            # tablas + índices + función match_articulos
│   └── 03_rls.sql               # políticas de lectura pública
├── Dockerfile
├── requirements.txt
└── .env.example
```

## Modelo de datos (resumen)

```
constitution_version 1───* titulo 1───* capitulo 1───* articulo *───1 category
                                                          │
                                                          ├─ search_tsv  (full-text español, RF-02)
                                                          └─ embedding    vector(1536) (RF-04)
consulta_log   (bitácora de consultas guiadas, RF-16)
```

- **`articulo.embedding`** → búsqueda semántica (pgvector, índice HNSW coseno).
- **`articulo.search_tsv`** → búsqueda léxica (índice GIN). Búsqueda híbrida.
- **`category`** → los chips de la pantalla "Buscar / Filtrar".
- **`constitution_version`** → base para el control de versiones (1979, reformas) a futuro.

## Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) y guarda la contraseña de la BD.
2. **SQL Editor** → ejecuta en orden:
   - `sql/01_extensions.sql`  (activa **pgvector**, unaccent, pg_trgm)
   - `sql/02_schema.sql`
   - `sql/03_rls.sql`
3. **Project Settings → Database → Connection string → Connection pooler** (puerto 6543).
   Copia la cadena y cambia el driver a `postgresql+asyncpg://...` en tu `.env`.

> La dimensión del vector está en **1536** (text-embedding-3-small de OpenAI/Azure OpenAI).
> Si usas un modelo local de otra dimensión, ajusta `vector(1536)` en `02_schema.sql`,
> la función `match_articulos`, y `EMBEDDING_DIM` en `.env`.

## Ejecutar en local

```bash
# entorno conda ya configurado (fastapi + uvicorn)
pip install -r requirements.txt

cp .env.example .env        # y completa DATABASE_URL + OPENAI_API_KEY

# Cargar la Constitución + generar embeddings
python -m scripts.seed_constitucion --reset

# Levantar la API
uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/docs
- Health:     http://localhost:8000/health

> Para probar sin claves ni costo de embeddings, usa `EMBEDDING_PROVIDER=fake`
> (la consulta guiada devolverá resultados, aunque sin relevancia semántica real).

## Endpoints del primer entregable

| Método | Ruta | Vista / RF |
|---|---|---|
| GET  | `/api/estructura`            | Por estructura (RF-01) |
| GET  | `/api/categorias`            | Chips de categoría (RF-03) |
| GET  | `/api/articulos?q=&categoria=` | Buscar / Filtrar (RF-02/03) |
| GET  | `/api/articulos/{numero}`    | Detalle de artículo |
| POST | `/api/consulta`              | Consulta guiada con IA (RF-04) |

Ejemplo de consulta guiada:

```bash
curl -X POST http://localhost:8000/api/consulta \
  -H "Content-Type: application/json" \
  -d '{"texto": "Me despidieron sin causa justificada y no me pagaron mis beneficios"}'
```

## Desplegar en Azure

1. Construir y subir imagen a **Azure Container Registry**:
   ```bash
   az acr build --registry <acr> --image backderechos:latest .
   ```
2. Crear **Azure Container App** apuntando a la imagen; configurar las variables
   de entorno (`DATABASE_URL`, `OPENAI_API_KEY`, etc.) como secrets.
3. El frontend Angular se despliega aparte en **Azure Static Web Apps** y apunta a
   la URL pública de la Container App (recuerda agregarla a `CORS_ORIGINS`).
