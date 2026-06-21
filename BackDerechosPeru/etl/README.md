# ETL — Ingesta de constituciones

Scripts de extracción y validación que convierten el texto fuente de una
constitución en la estructura JSON que consume la base de datos.

## Pipeline actual (manual)

```
constitucion.md (UTF-16)
   → etlconstitucion.py   extrae y estructura  → constitucion.json
   → verify_json.py       valida (QA)
   → scripts/seed_constitucion.py   carga a Supabase + embeddings
```

## Archivos

| Archivo | Función |
|---|---|
| `etlconstitucion.py` | Parser por máquina de estados (PREAMBULO → BODY → DISPOSICIONES → DECLARACION). Detecta `TITULO`, `CAPITULO`, `Artículo N`, disposiciones con regex; limpia texto y reconstruye párrafos. Emite el JSON con la estructura de las tablas. |
| `verify_json.py` | Control de calidad: cuenta elementos (206 artículos, 16 disp. finales, 3 especiales), verifica jerarquía (capítulo→título, artículo→capítulo) y numeración completa 1..206 sin huecos ni duplicados. |

## Uso manual

```bash
# desde BackDerechosPeru/, con el .md fuente junto al script
python -m etl.etlconstitucion   # genera constitucion.json
python -m etl.verify_json       # valida
```

## Hacia el Módulo M8 (Sprint 6)

Estos scripts son la **base del servicio de ingesta in-app**. El plan (ver
[SPRINT_BACKLOG.md](../../SPRINT_BACKLOG.md), Sprint 6):

- **T8.1** — `etlconstitucion.py` → función pura `parse_constitution(text) -> dict`
  (sin leer/escribir archivos; encoding parametrizable).
- **T8.2** — `verify_json.py` → `validate(data) -> reporte` (devuelve errores
  estructurados, sin `sys.exit`).
- Se exponen vía endpoints de administración para: subir texto + PDF → extraer a
  *borrador* → **revisar artículo por artículo contra el PDF** (RF-18) → publicar
  cuando esté 100% verificado (RF-19).

> ⚠️ El parser asume el formato de la Constitución de 1993. Para otras
> constituciones (p. ej. 1979) hay que ajustar los patrones regex; por eso la
> revisión asistida y el QA son obligatorios antes de publicar.
