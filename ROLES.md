# Modelo de Roles (RBAC) — referencia canónica

> Reconcilia CONTEXTO.md, REQUERIMIENTOS.MD y SPRINT_BACKLOG.md en un único set.
> Visitante anónimo = **sin cuenta / sin JWT** (no es un valor del enum).

| slug (DB / enum) | Nombre (CONTEXTO.md) | Permiso documentado | Guard se activa en |
|---|---|---|---|
| `ciudadano` *(default)* | Ciudadano / Visitante registrado | leer, buscar, marcadores, participar en foro | **Sprint 2** (marcadores) · S3 (foro) |
| `redactor` | Redactor Colaborativo | crear borradores, proponer actualizaciones | S6 (M8) |
| `experto` | Revisor Jurídico / Experto verificado | respuestas verificadas + anotaciones; validar contenido; revisión vs PDF | S3 (M5) · S6 (M8) |
| `editor` | Administrador de Contenido | publicar, archivar, taxonomía/tags, moderar foro, verificar expertos, métricas | S5 (M6/M7) · S6 |
| `admin` | Administrador del Sistema | usuarios, **roles**, respaldos, logs | **Sprint 2** (asignar rol) · S5 |

## Cómo funciona

- **Supabase Auth** emite y firma el JWT (HS256). El backend FastAPI **solo lo verifica**
  (`app/core/auth.py`) y carga el rol desde la tabla `profile` (fuente de verdad).
- El rol se cambia sin re-loguear: vive en `profile`, no en el token.
- Nuevos registros = `ciudadano` (trigger `handle_new_user` en `sql/04_auth.sql`).
- Roles elevados se asignan en `/admin/usuarios` (solo `admin`) o por SQL en Supabase.

## Alcance por sprint

Sprint 2 construye la **fundación**: enum de roles, `profile.role`, verificación de JWT,
el dependency reutilizable `require_role(...)` y el endpoint admin de asignación.
**No** se agregan guards a funciones que aún no existen — cada sprint futuro engancha
`require_role(...)` a sus propios endpoints nuevos.

## Decisiones de reconciliación

- `Visitante (anónimo)` → no es rol almacenado; es ausencia de sesión.
- `Revisor de contenido` (REQ) = `Revisor Jurídico` (CONTEXTO) = `Experto verificado` (REQ) → un solo `experto`.
- `Administrador de Contenido` y `Administrador del Sistema` se mantienen separados (mínimo privilegio).
- El antiguo `(ciudadano/experto/admin)` del backlog queda reemplazado por este enum de 5.
