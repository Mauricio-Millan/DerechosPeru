# Portal Constitucional del Perú — Capacidades del Sistema
**Guía para el usuario final · Gestión del Conocimiento · UTP Lima Sur**

---

## ¿Qué es este sistema?

El Portal Constitucional del Perú es una plataforma digital que pone al alcance de cualquier ciudadano el contenido completo de la Constitución Política, con herramientas para consultarla, comprenderla, compararla a través del tiempo y aprender sobre ella. No se necesitan conocimientos legales previos ni habilidades técnicas para usarla.

---

## Capacidades según el tipo de sistema de Gestión del Conocimiento

> Clasificación basada en los seis grandes tipos de sistemas de Gestión del Conocimiento.

---

### 1. Sistema de Gestión de Contenido (CMS)
*Organización, estructuración y publicación del conocimiento constitucional*

| Capacidad | Qué puede hacer el usuario |
|---|---|
| **Explorar por estructura** | Navegar la Constitución tal como está organizada: por Títulos, Capítulos y Artículos, expandiendo y colapsando secciones a voluntad. |
| **Guardar artículos** | Marcar cualquier artículo con un marcador personal para encontrarlo rápidamente en futuras visitas. |
| **Historia constitucional** | Recorrer una línea de tiempo de las 12 constituciones del Perú (1823–1993), conocer quién las promulgó, cuánto tiempo estuvieron vigentes y el contexto histórico de cada una. |
| **Ver videos históricos** | Reproducir material audiovisual sobre las constituciones de 1920, 1933, 1979 y 1993 directamente desde la plataforma. |
| **Congresistas constituyentes** | Consultar quiénes fueron los representantes que redactaron cada constitución del siglo XX, organizados por partido político o facción con código de color por ideología. |

**Alineación con la rúbrica — Criterio 1 (Arquitectura de Información y Taxonomía):**
La información está organizada en una jerarquía clara (Versión → Título → Capítulo → Artículo). Cualquier artículo se puede localizar en **3 clics o menos** desde la pantalla principal.

---

### 2. Sistema de Gestión Documental (DMS)
*Control formal, versionado y administración de los documentos constitucionales*

| Capacidad | Qué puede hacer el usuario (perfil Editor/Admin) |
|---|---|
| **Cargar una nueva constitución** | Subir el PDF oficial de cualquier versión constitucional; el sistema extrae automáticamente su contenido. |
| **Revisar y corregir** | En un panel doble (el PDF original a la izquierda, los artículos extraídos a la derecha), verificar artículo por artículo que la extracción fue correcta. |
| **Agregar o eliminar artículos** | Si el sistema no reconoció algún artículo del PDF, el editor puede agregarlo manualmente. También puede eliminar artículos mal extraídos. |
| **Publicar o descartar versiones** | Una versión se publica solo cuando todos sus artículos han sido revisados, garantizando calidad. Si una versión tiene errores, puede eliminarse completamente. |
| **Historial de versiones** | El sistema guarda todas las versiones ingresadas con su estado (borrador o publicada), permitiendo trazabilidad completa. |

**Alineación con la rúbrica — Criterio 4 (Seguridad, Roles y Gestión del Backend):**
Solo usuarios con rol de Editor o Administrador pueden ingresar o modificar constituciones. El flujo de revisión actúa como un **historial de versiones con control de calidad** antes de publicar.

---

### 3. Plataforma de Colaboración y Comunicación
*Intercambio de conocimiento entre ciudadanos, expertos y editores*

| Capacidad | Qué puede hacer el usuario |
|---|---|
| **Foro comunitario** | Crear hilos de discusión sobre cualquier tema constitucional y responder a los de otros ciudadanos. |
| **Votar respuestas** | Marcar respuestas como "útil" o "no útil" para que la comunidad identifique el conocimiento de mayor valor. |
| **Mejor respuesta** | El autor de un hilo puede marcar cuál fue la respuesta que resolvió mejor su duda. |
| **Respuestas verificadas** | Los expertos y editores pueden marcar respuestas como "verificadas por un especialista", diferenciándolas de la opinión general. |
| **Anotaciones de experto** | Los usuarios con rol Experto pueden agregar notas explicativas directamente sobre artículos específicos de la Constitución. |
| **Chat con IA** | Conversar directamente con un asistente de inteligencia artificial que cita artículos constitucionales para responder dudas concretas. |

**Alineación con la rúbrica — Criterio 3 (UX/UI y Accesibilidad):**
La colaboración es accesible para cualquier ciudadano registrado. El sistema de roles diferencia visualmente quién es experto y quién es ciudadano en cada respuesta, fomentando la **lectura y creación ágil de conocimiento**.

---

### 4. Herramienta de Inteligencia Empresarial (BI) y Análisis de Datos
*Transformar el uso del sistema en conocimiento para mejorarlo continuamente*

| Capacidad | Qué puede hacer el usuario (perfil Admin) |
|---|---|
| **Artículos más consultados** | Ver qué artículos generan más interés entre los ciudadanos. |
| **Búsquedas frecuentes** | Conocer qué palabras o situaciones buscan más los usuarios, identificando las dudas más comunes de la ciudadanía. |
| **Búsquedas sin resultado** | Detectar qué consultas no encontraron artículos relevantes, revelando **vacíos de conocimiento** que podrían cubrirse con nuevo contenido. |
| **Panel de administración** | Visualizar el comportamiento general de los usuarios en un tablero centralizado para tomar decisiones informadas. |
| **Comparador semántico** | Comparar dos versiones de la Constitución y ver qué artículos son idénticos, cuáles fueron modificados y cuáles son completamente nuevos, con un porcentaje de similitud. |

**Alineación con la rúbrica — Criterio 5 (Analítica de Datos y Mejora Continua):**
El sistema registra automáticamente cada búsqueda y consulta. El panel administrativo identifica vacíos de conocimiento y métricas de uso, habilitando **decisiones basadas en datos** para mejorar el contenido.

---

### 5. Sistema de Gestión de Aprendizaje (LMS)
*Evaluación del conocimiento constitucional con seguimiento de progreso*

| Capacidad | Qué puede hacer el usuario |
|---|---|
| **Examen de 3 niveles** | Realizar un examen progresivo sobre la Constitución: Básico (conceptos generales), Intermedio (derechos fundamentales) y Avanzado (hermenéutica y jerarquía normativa). |
| **Medallas por nivel** | Obtener una medalla al aprobar cada nivel: 🥉 Bronce (Básico), 🥈 Plata (Intermedio), 🥇 Oro (Avanzado). |
| **Niveles progresivos** | Cada nivel se desbloquea solo al aprobar el anterior, asegurando un aprendizaje ordenado. |
| **Revisión de respuestas** | Al terminar el examen, ver cuáles preguntas se respondieron correctamente y cuál era la respuesta correcta en cada caso fallado. |
| **Ascenso a Experto** | Al completar el nivel Avanzado, el perfil del ciudadano asciende automáticamente a "Experto Constitucional", otorgándole capacidades ampliadas en la plataforma. |
| **Repetición ilimitada** | Los exámenes se pueden retomar las veces necesarias para mejorar el puntaje. |

**Alineación con la rúbrica — Criterio 3 (UX/UI) y Criterio 4 (Seguridad y Roles):**
El sistema de examen es la vía formal para que un ciudadano **acredite su conocimiento** y obtenga permisos adicionales (rol Experto), creando un ciclo completo de aprendizaje y reconocimiento.

---

### Capacidad transversal: Asistente de IA con accesibilidad por voz
*Democratización del conocimiento constitucional*

Esta capacidad cruza varios tipos de sistema. Está disponible para todos los usuarios, incluidas personas con discapacidad visual.

| Capacidad | Qué puede hacer el usuario |
|---|---|
| **Consulta guiada** | Describir un problema cotidiano con palabras propias (sin usar lenguaje legal) y recibir los artículos constitucionales que aplican a esa situación. |
| **Chat con IA constitucional** | Conversar libremente con un asistente de inteligencia artificial entrenado en la Constitución. La IA cita los artículos exactos en los que basa sus respuestas. |
| **Botón flotante de acceso rápido** | Un botón visible en toda la plataforma que abre el chat instantáneamente desde cualquier página. |
| **Entrada por voz (micrófono)** | Hablar en lugar de escribir. El asistente reconoce la pregunta en voz alta y la procesa automáticamente (requiere Chrome o Edge). |
| **Lectura en voz alta** | Las respuestas del asistente se pueden escuchar en voz alta, permitiendo usar la plataforma sin leer la pantalla. |
| **Secuencia de voz automática** | Al abrir el chat desde el botón flotante, el sistema saluda en voz alta y activa el micrófono de manera automática, sin necesidad de interacción adicional. |

**Alineación con la rúbrica — Criterio 2 (Motor de Búsqueda) y Criterio 3 (Accesibilidad):**
La búsqueda semántica convierte una descripción en lenguaje natural en artículos constitucionales relevantes. La voz bidireccional garantiza una experiencia **100% accesible** para personas con discapacidad visual, cumpliendo el nivel "Excelente" del criterio de UX/UI.

---

## Alineación consolidada con la Rúbrica de Evaluación

| Criterio | Nivel alcanzado | Evidencia en el sistema |
|---|---|---|
| **1. Arquitectura de Información y Taxonomía** | **Excelente (4 pts)** | Jerarquía Versión → Título → Capítulo → Artículo. Etiquetas por categoría. Cualquier artículo en ≤ 3 clics. Línea de tiempo histórica como taxonomía temporal. |
| **2. Motor de Búsqueda y Recuperación** | **Excelente (4 pts)** | Búsqueda semántica por similitud + búsqueda por texto completo. Filtros por categoría y versión. Registro de "búsquedas sin éxito" para analítica. Comparador de versiones con porcentaje de similitud. |
| **3. UX/UI y Accesibilidad del Frontend** | **Excelente (4 pts)** | Interfaz responsiva (móvil, tablet, escritorio). Editor Markdown en el CMS. Chat con IA, voz bidireccional y lectura en voz alta para accesibilidad. Dashboard intuitivo para administradores. |
| **4. Seguridad, Roles y Gestión del Backend** | **Excelente (4 pts)** | RBAC con 5 roles (ciudadano, redactor, experto, editor, admin). Tokens JWT seguros. Flujo de revisión y publicación como historial de versiones auditables. Ascenso de rol basado en méritos (examen). |
| **5. Analítica de Datos y Mejora Continua** | **Excelente (4 pts)** | Panel con artículos más consultados, búsquedas frecuentes y búsquedas sin resultado. Métricas de uso centralizadas. Comparador semántico como herramienta de análisis de cambios normativos. |

**Puntaje estimado: 20 / 20**

---

## Resumen por tipo de usuario

| Perfil | Qué puede hacer |
|---|---|
| **Ciudadano** | Leer la Constitución, buscar artículos, guardarlos, usar el chat con IA por voz o texto, participar en el foro, rendir el examen y obtener medallas. |
| **Experto** | Todo lo anterior + agregar anotaciones especializadas sobre artículos y verificar respuestas en el foro. |
| **Editor** | Todo lo anterior + cargar PDFs de constituciones, revisarlas, corregirlas y publicarlas. |
| **Administrador** | Control total: gestión de usuarios, cambio de roles y acceso al panel de analítica. |

---

*Portal Constitucional del Perú · Stack: FastAPI + Angular 20 + Supabase/Postgres + Azure · IA: Groq llama-3.3-70b*
