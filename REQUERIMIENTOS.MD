# Portal de Gestión del Conocimiento — Constitución Política del Perú

> Documento de requerimientos. Proyecto del curso **Gestión del Conocimiento** (Semana 12: Auditoría de la Información y del Conocimiento).

## 1. Visión y encuadre de Gestión del Conocimiento

El portal transforma la Constitución Política del Perú (un activo **explícito** y estructurado) en una plataforma de conocimiento **centrada en el usuario**, evitando el síndrome del "vertedero digital" (documentos huérfanos e inconexos). Se aplican los dos diagnósticos vistos en clase:

- **Auditoría de la Información (AI)** → define la *arquitectura* del portal: inventario de los 206 artículos, taxonomías (categorías por poder/derecho), metadatos (título, capítulo, sumilla) y un buscador inteligente.
- **Auditoría del Conocimiento (AC)** → define la *experiencia y captación de saber tácito*: la consulta guiada traduce el lenguaje del ciudadano al articulado, y el **foro de expertos** convierte conocimiento tácito (interpretación, jurisprudencia, experiencia) en explícito.

**Posición en la pirámide DIKW:** el texto constitucional es *Información*; las interpretaciones de expertos, la consulta guiada y las versiones históricas elevan el portal hacia *Conocimiento* y *Sabiduría* (decisión: "¿qué artículo me protege?").

## 2. Historias de usuario (semilla original) → trazabilidad

| # | Historia de usuario | Requerimiento formal |
|---|---|---|
| 1 | Como consultor con conocimiento de la constitución quiero revisar los capítulos y artículos de la constitución actual. | RF-01, RF-02, RF-03 |
| 2 | Como consultor sin conocimiento quiero consultar mi situación y recibir orientación de qué puedo hacer. | RF-04 |
| 3 | Como administrador quiero ver qué consultas son las más realizadas. | RF-16 |
| 4 | Como usuario quiero registrarme para guardar mis consultas. | RF-15, RF-05 |
| 5 | Como usuario quiero iniciar sesión para guardar mis consultas. | RF-15, RF-05 |
| 6 | Como consultor quiero ver foros abiertos sobre una situación o artículo. | RF-09 |
| 7 | Como consultor quiero crear foros de discusión sobre una situación o artículo. | RF-09, RF-10 |

> **Brechas detectadas en la semilla** (añadidas como nuevos requerimientos): no contemplaba **control de versiones** de constituciones anteriores (RF-06/07/08, pedido explícito del proyecto), **rol de experto verificado** (RF-10/11) para que el foro realmente "capte conocimiento de expertos", **taxonomía/filtros** (RF-03), ni **persistencia de marcadores** vista en la pantalla "Guardados" (RF-05).

## 3. Alcance del dato base (`constitucion.json`)

| Colección | Cantidad | Campos |
|---|---|---|
| `titulos` | 6 | `numero_romano`, `denominacion` |
| `capitulos` | 26 | `titulo_romano`, `numero_romano`, `denominacion` |
| `articulos` | 206 | `titulo_romano`, `capitulo_romano`, `numero`, `sumilla`, `contenido` |
| `disposiciones_finales` | 16 | texto |
| `disposiciones_especiales` | 3 | texto |
| `preambulo`, `declaracion` | — | texto |

> La UI actual muestra "75 artículos" (subconjunto curado); el dato base tiene **206**. Definir si la v1 publica el subconjunto o el articulado completo (RF-12). Varias `sumilla` son nulas → requieren curaduría.

## 4. Roles de usuario

| Rol | Capacidades |
|---|---|
| **Visitante (anónimo)** | Navegar, buscar, filtrar, consulta guiada, leer foro. |
| **Ciudadano registrado** | + guardar marcadores, abrir/responder hilos del foro, votar. |
| **Experto verificado** | + respuestas marcadas como "verificadas" y anotaciones de interpretación sobre artículos. |
| **Revisor de contenido** | Ingestar una constitución (ETL), revisarla contra el PDF artículo por artículo y aprobarla para publicación (RF-17/18/19). |
| **Administrador / Editor** | Gestionar artículos, categorías, versiones, moderar foro, verificar expertos, publicar constituciones, ver métricas. |

## 5. Requerimientos funcionales

### Navegación y consulta (Auditoría de Información)
- **RF-01 — Vista "Por estructura":** árbol Título → Capítulo → Artículo con contadores; al expandir un artículo, contenido completo + cita (`Art. N · Categoría · Constitución 1993`).
- **RF-02 — Búsqueda directa:** por número, título o contenido (full-text, insensible a acentos/mayúsculas) con resaltado de coincidencias.
- **RF-03 — Filtro por categoría/taxonomía:** chips (Derechos Fundamentales, Estado y Nación, Economía, Régimen Político, Poder Legislativo/Ejecutivo/Judicial, Descentralización, Garantías Constitucionales, Reforma Constitucional). Combinable con la búsqueda; "Limpiar filtros" y contador de resultados.
- **RF-04 — Consulta guiada:** el usuario describe su problema en lenguaje natural y el sistema devuelve los artículos que lo protegen, ordenados por relevancia, con explicación breve y ejemplos preescritos de partida. Incluye **aviso legal** (orientativo, no sustituye asesoría legal).
- **RF-05 — Marcadores ("Guardados"):** guardar/quitar con el ícono de marcador; vista dedicada con estado vacío. Local para anónimos, en cuenta para registrados.

### Control de versiones (pedido explícito del proyecto)
- **RF-06 — Catálogo de versiones:** registrar constituciones históricas (1993 vigente, 1979, reformas). Selector de versión en la cabecera.
- **RF-07 — Comparación de versiones (diff):** ante un artículo/tema equivalente entre dos versiones, resaltar diferencias (agregado/eliminado/modificado) y la norma/fecha de reforma.
- **RF-08 — Historial de artículo:** línea de tiempo de reformas que modificaron un artículo, con la norma que originó cada cambio.

### Captación de conocimiento tácito (Auditoría del Conocimiento)
- **RF-09 — Foro por artículo/tema:** crear y ver hilos asociados a un artículo o categoría (cubre historias 6 y 7).
- **RF-10 — Respuestas de expertos verificadas:** distintivo, marca "respuesta verificada", votación (útil/no útil), "mejor respuesta".
- **RF-11 — Anotaciones de expertos:** notas de interpretación/jurisprudencia asociadas a un artículo, separadas del texto oficial.

### Gestión y administración
- **RF-12 — Curaduría de articulado:** administrar subconjunto publicado vs. completo; editar sumillas y categorías.
- **RF-13 — Gestión de taxonomía:** CRUD de categorías y reasignación masiva.
- **RF-14 — Moderación del foro:** aprobar/ocultar/eliminar, verificar expertos, reportes de abuso.
- **RF-15 — Autenticación y perfiles:** registro/login (recomendado Supabase Auth), gestión de rol (cubre historias 4 y 5).

### Ingesta y publicación de constituciones (Módulo ETL — M8)
- **RF-17 — Ingesta ETL:** un administrador sube el texto fuente de una constitución (.md/.txt); el sistema lo parsea con una máquina de estados (títulos, capítulos, artículos, disposiciones) y genera la estructura, sin publicarla aún (estado *borrador*). Reutiliza la lógica de `etl/etlconstitucion.py`.
- **RF-18 — Revisión asistida contra el PDF:** vista de doble panel (PDF fuente a la izquierda / contenido extraído a la derecha) para verificar capítulo por capítulo y artículo por artículo. El revisor marca cada artículo como *verificado* o *observado*, puede corregir el texto/sumilla, y se muestra el progreso (p. ej. 150/206 verificados). Incluye validación automática estilo `etl/verify_json.py` (conteos, jerarquía, numeración completa) como reporte de QA.
- **RF-19 — Flujo de publicación:** una constitución transita por estados `borrador → en_revisión → publicada → archivada`. Solo puede **publicarse** cuando el 100% de sus artículos está *verificado* y pasa el QA. Al publicar, se generan los embeddings y queda visible en el portal (y disponible para el control de versiones, RF-06).

### Apoyo a la auditoría del conocimiento (diferencial académico)
- **RF-16 — Métricas y Gap Analysis:** panel con consultas guiadas más frecuentes (historia 3), **búsquedas sin resultados** (brechas de contenido), artículos más consultados/guardados y preguntas del foro sin responder (cuellos de botella / silos). Sustenta las "medidas correctivas" de la Semana 12.

## 6. Requerimientos no funcionales
- **RNF-01 Rendimiento:** búsqueda/filtro < 300 ms (206 artículos).
- **RNF-02 Usabilidad/Accesibilidad:** responsive; WCAG AA (contraste, teclado, lectores de pantalla) por ser contenido cívico.
- **RNF-03 Trazabilidad de cita:** todo artículo mostrado debe ser citable (número, título, versión).
- **RNF-04 i18n:** preparado para variantes de idioma (español; potencial quechua/aimara).
- **RNF-05 Seguridad:** RLS en Supabase, validación de entrada, control de rol en backend, anti-spam en foro.
- **RNF-06 Despliegue:** Frontend y Backend en Azure; BD en Supabase.
- **RNF-07 Observabilidad:** logging y métricas para alimentar RF-16.

## 7. Arquitectura tecnológica
- **Frontend:** Angular 20 (`FrontDerechosPeru`) → Azure Static Web Apps.
- **Backend:** API REST (ver §8) → Azure Container Apps o App Service (contenedor Docker).
- **Base de datos:** **Supabase** (Postgres) con Auth, Storage y **pgvector** (clave para RF-04). Realtime opcional para el foro.
- **Consulta guiada (RF-04):** embeddings de los artículos en `pgvector` + full-text search de Postgres → **búsqueda híbrida** (semántica + léxica) ordenada por relevancia.

## 8. Decisión de backend (recomendación)
**Recomendado: FastAPI (Python).** Razón principal: RF-04 (consulta guiada por similitud semántica con embeddings/pgvector) es directo en el ecosistema Python; desarrollo ágil para equipo académico; OpenAPI automático para generar el cliente Angular; despliegue simple en Azure Container Apps. **Alternativa: Spring Boot (Java)** si el curso exige arquitectura en capas tipada y se prioriza el estándar empresarial sobre el componente de IA.

## 9. Fuera de alcance (v1)
- Asesoría legal vinculante (portal orientativo — incluir aviso legal).
- Generación automática de documentos legales.
- App móvil nativa.

## 10. Riesgos
- **Precisión de la consulta guiada:** un mapeo erróneo problema→artículo desinforma → disclaimers, validación de expertos y umbral de confianza.
- **Calidad del dato:** sumillas nulas → curaduría (RF-12).
- **Moderación del foro:** spam/desinformación → RF-14.
