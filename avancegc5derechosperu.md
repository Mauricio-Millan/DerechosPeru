Facultad de Ingeniería
Carrera Profesional de Ingeniería de Sistemas e Informática
Sistema de Gestión del Conocimiento de la Constitución del Perú
Integrantes del Grupo N°01:
U24254087 - MILLAN PARIONA, MAURICIO LEANDRO
U22247181 - GARCÍA BALCÁZAR, JOAQUÍN ENMANUEL
U22211130 - AROTINCO HUALPA, OSCAR MANUEL
Profesor: JULIO FERNANDO ARBOLEDA HUAMAN
Curso: Gestión del Conocimiento
Sección: 36623
Año: 2026
Lima – Perú

Fase 1:Planificación y Estratégia (El Propósito)
1. Definición de Objetivos y Alcance
Vacíos de Conocimiento a Resolver (Brechas Epistémicas)
Esta plataforma resolverá tres asimetrías cognitivas críticas presentes en el ecosistema ciudadano:
1. Indeterminación de Mecanismos de Defensa Prescriptivos: Los ciudadanos desconocen
los canales procesales inmediatos para activar las garantías constitucionales ante una
vulneración de derechos primarios.
2. Barrera de Extracción Semántica: Los buscadores indexados del Estado requieren la
coincidencia exacta de términos jurídicos (keyword matching), anulando el acceso a usuarios
que emplean lenguaje natural coloquial o ambiguo.
3. Desconexión de la Norma con el Hecho Real: El texto constitucional abstracto no
proporciona contextos de aplicación fáctica. El sistema cerrará esta brecha proveyendo
respuestas sintéticas fundamentadas en el articulado vigente.
2. Segmentación de la Audiencia
El sistema se define unívocamente como una Base de Conocimiento Abierta (Pública) orientada al
ciudadano peruano, priorizando la accesibilidad universal sobre los entornos corporativos cerrados.

Estos seis segmentos representan la audiencia objetivo de la plataforma, teniendo como centro al
ciudadano peruano y priorizando la accesibilidad universal.
Estudiantes escolares y universitarios
● Aprenden sobre derechos y mecanismos constitucionales.
Profesionales y trabajadores
● Buscan orientación sobre derechos laborales y otros derechos constitucionales.
Ciudadanos en general
● Personas que necesitan información clara sobre sus derechos y cómo ejercerlos.
Población rural y vulnerable
● Acceso simplificado y adaptado a sus necesidades.

Organizaciones y sociedad civil
● Requieren información para defender y promover derechos fundamentales.
Abogados y especialistas jurídicos
● Consultan normativa, jurisprudencia y herramientas avanzadas.
Modelo DIKW:
1. Transformación de Datos a Información (Resolviendo la Barrera de Extracción
Semántica): El sistema toma el dato (artículo legal) y lo convierte en información
estructurada mediante un modelo de lenguaje (LLM o VSM - Vector Space Model). Esto
permite que, ante una consulta coloquial ("¿qué hago si me despiden sin causa?"), el sistema
traduzca la intención del usuario a la estructura semántica de la ley.
2. Transformación de Información a Conocimiento (Resolviendo la Desconexión
Norma-Hecho): Aquí el sistema realiza una inferencia relacional. Al procesar el hecho real
narrado por el ciudadano, la base de conocimiento filtra la normativa abstracta para ofrecer
una respuesta sintética y aplicada. El ciudadano ya no recibe un "muro de texto", sino un
extracto relevante a su caso.
3. Transformación de Conocimiento a Sabiduría (Resolviendo la Indeterminación de
Mecanismos): Es el nivel superior del modelo DIKW. El sistema actúa como un clasificador
semántico de precisión que vincula los hechos del usuario con flujos procedimentales e
institucionales indexados, validados y estáticos (habeas corpus-data-amparo), garantizando el
determinismo técnico.

2. Auditoría del Capital Intelectual.
Se realizará una auditoría para identificar y analizar las fuentes de conocimiento que alimentarán el
Sistema de Gestión del Conocimiento de la Constitución del Perú. Para ello, se recopiló el
conocimiento explícito presente en documentos oficiales, como la Constitución Política del Perú,
leyes, jurisprudencia y publicaciones del Estado. Asimismo, se identificará el conocimiento tácito
aportado por especialistas en derecho constitucional y expertos jurídicos. Esta auditoría permitirá
determinar dónde se encuentra el conocimiento, quiénes lo poseen y cómo será organizado e integrado
en la plataforma para brindar información clara, confiable y accesible a los ciudadanos.

Conocimiento Explícito
Corresponde a toda la información documentada y disponible públicamente que servirá como fuente
principal del sistema:
● Constitución Política del Perú vigente.
● Leyes y normas complementarias relacionadas con derechos fundamentales.
● Sentencias y jurisprudencia del Tribunal Constitucional.
● Publicaciones oficiales del Estado peruano.
● Manuales, guías y materiales educativos sobre ciudadanía y derechos constitucionales.
● Glosarios jurídicos y diccionarios de términos legales.
Conocimiento Tácito
Es el conocimiento que poseen especialistas y que será utilizado para interpretar y explicar la
normativa de manera sencilla:
● Abogados constitucionalistas.
● Docentes universitarios de Derecho.
● Investigadores jurídicos.
● Especialistas en gestión del conocimiento.
● Expertos en experiencia de usuario (UX) y accesibilidad digital.
● Funcionarios con experiencia en procedimientos constitucionales.

Fase 2: Diseño de la Arquitectura de Información
(La Estructura)
3. Modelado y Taxonomía
Para organizar el conocimiento de forma intuitiva, el sistema adopta una estructura
jerárquica clara:
● Metáfora de Navegación: Se utiliza el modelo jerárquico de Libro, Títulos y
Artículos, como se observa en la parte superior de nuestro prototipo, donde se
indica claramente que el sistema gestiona "206 Artículos" y "6 Títulos".
● Sistema de Metadatos y Etiquetas (Tags): Se implementa un sistema de
clasificación estandarizado que permite filtrar la Constitución según las necesidades
del ciudadano:
○ Categorías Principales: Las etiquetas visibles en el prototipo (ej. Derechos
Fundamentales, Poder Legislativo, Garantías Constitucionales, Reforma
Constitucional) actúan como metadatos para organizar el conocimiento
explícito.
○ Funcionalidad: Este etiquetado estandarizado es el motor que facilita que el
buscador recupere la información pertinente al usuario.

4. Diseño de Experiencia de Usuario (UX/UI)
El diseño se centra en eliminar barreras de acceso y simplificar la interacción legal:
● Centralidad del Buscador: En coherencia con la propuesta de diseño, la barra de
búsqueda es el elemento predominante y más accesible, ubicada en el centro de la
pantalla en el prototipo, permitiendo la búsqueda directa por "número de artículo,
título o contenido".

● Invitación a la Lectura:
○ Estructura de Resultados: Los resultados se despliegan en formato de
"Cards" o tarjetas, lo que permite una lectura rápida y escaneable de los
artículos (como el artículo 90 mostrado en el prototipo).
○ Reducción de Complejidad: El diseño permite limpiar filtros fácilmente y
navegar entre secciones (Títulos, Capítulos, Artículos, Guardados),
asegurando que el ciudadano encuentre la respuesta específica sin
enfrentarse a un "muro de texto".

Prototipo:

Fase 3: Selección del Stack Tecnológico y
Desarrollo (La Infraestructura)
5. Selección del Software (KMS)
Para el Sistema de Gestión del Conocimiento de la Constitución del Perú, la selección
tecnológica parte de tres criterios determinantes: accesibilidad pública universal, soberanía
de datos jurídicos sensibles, y la capacidad de integrar un motor de búsqueda semántica
con lenguaje natural. Tras evaluar las alternativas del mercado, se adopta una arquitectura
híbrida basada en tecnologías open source.
5.1. Evaluación Comparativa de Plataformas
Criterio de Evaluación Decisión para el Proyecto
Tipo de acceso Base de conocimiento pública (ciudadano
abierto)
Soberanía de datos Open Source — control total del contenido
jurídico
Búsqueda semántica / lenguaje natural Requerida — integración con LLM/RAG
Escalabilidad Arquitectura en contenedores (Docker)
Costo de mantenimiento Bajo — servidores propios o nube pública
Plataforma base seleccionada BookStack + Motor RAG personalizado

5.2. Stack Tecnológico Seleccionado
El sistema se construye sobre cuatro capas tecnológicas complementarias:
Capa Tecnología Función
Frontend / UI React.js + Tailwind CSS Interfaz ciudadana accesible y
responsiva
Backend / API FastAPI (Python) Orquestación de consultas y lógica
de negocio
Base de conocimiento BookStack (PHP/Laravel) Gestión jerárquica: Libro → Título
→ Artículo
Motor semántico LlamaIndex + ChromaDB Búsqueda RAG con lenguaje
natural coloquial
Base de datos PostgreSQL Almacenamiento relacional de
artículos y metadatos
Búsqueda full-text Elasticsearch Indexación y recuperación de texto
jurídico
Contenedores Docker + Docker Compose Despliegue reproducible y portable
LLM de inferencia Claude API (Anthropic) Generación de respuestas
constitucionales
La elección de BookStack como plataforma base responde directamente a la taxonomía
diseñada en la Fase 2: su metáfora nativa de Libro → Capítulos → Páginas es isomórfica al
modelo Constitución → Títulos → Artículos definido en el prototipo. Esto elimina la
necesidad de forzar la estructura jurídica en una plataforma diseñada para otro propósito.

6. Configuración del Entorno y Seguridad
La arquitectura de despliegue garantiza tanto la disponibilidad pública del sistema como la
integridad del contenido jurídico. El control de accesos sigue el modelo RBAC (Role-Based
Access Control) con tres niveles operativos diferenciados:
6.1. Arquitectura de Despliegue
Componentes del entorno de infraestructura:
● Servidor de aplicaciones: VPS o instancia cloud (AWS/GCP) con Ubuntu 22.04
LTS.
● Contenedores Docker: BookStack, PostgreSQL, Elasticsearch y el motor RAG
corren en contenedores aislados orquestados con Docker Compose.
● Proxy inverso: Nginx como reverse proxy con certificado SSL/TLS (Let's Encrypt)
para conexiones HTTPS cifradas.
● CDN: Distribución de activos estáticos mediante Cloudflare para reducir la latencia a
ciudadanos de regiones remotas del Perú.
● Backups automatizados: Copias diarias de la base de datos PostgreSQL y el
índice vectorial de ChromaDB hacia almacenamiento S3-compatible.
6.2. Control de Accesos (RBAC)
Rol Permisos Actor responsable
Ciudadano / Visitante Solo lectura — búsqueda y Público general (sin registro)
consulta de artículos
Redactor Colaborativo Crear borradores, proponer Investigadores / Docentes
actualizaciones
Revisor Jurídico Revisar, comentar y validar Abogados constitucionalistas
contenido propuesto

Administrador de Contenido Publicar, archivar, gestionar Equipo editorial del proyecto
taxonomía y tags
Administrador del Sistema Control total: servidores, usuarios, Equipo técnico de sistemas
respaldos
El principio de mínimo privilegio rige la asignación de roles: ningún actor posee más
permisos de los estrictamente necesarios para su función. El contenido jurídico solo se
publica tras pasar por el ciclo Redacción → Revisión Jurídica → Aprobación, garantizando
la veracidad del conocimiento expuesto al ciudadano.
6.3. Diagrama de Flujo de Seguridad
→ → → →
🌐 Ciudadano 🔒 Nginx SSL + ⚡ FastAPI 🗄 PostgreSQL + 🤖 LLM
Consulta web Cloudflare Motor RAG ChromaDB Respuesta

Fase 4: Poblamiento y Activación del Ciclo del
Conocimiento (El Contenido)
Esta fase es el núcleo operativo del sistema: es donde el conocimiento abstracto de la
Constitución se transforma en un activo digital consultable y útil para el ciudadano peruano.
Se aplica la reconfiguración del Modelo SECI para activar el ciclo de conversión del
conocimiento.
7. Migración e Ingesta de Datos Masivos
La migración se ejecuta en tres etapas secuenciales. El objetivo es poblar el sistema con la
totalidad de los 206 artículos de la Constitución Política del Perú (promulgada el 29 de
diciembre de 1993), sus 6 Títulos, y la jurisprudencia complementaria del Tribunal
Constitucional.
7.1. Etapa 1 — Depuración y Estructuración de Fuentes
Antes de cargar cualquier contenido al sistema, se realiza un proceso de curación editorial:
● Recopilación de fuentes primarias: Texto íntegro de la Constitución desde el portal
oficial del Congreso de la República (congreso.gob.pe), sentencias del Tribunal
Constitucional (tc.gob.pe) y glosarios jurídicos validados.
● Normalización del texto: Eliminación de artefactos de digitalización (OCR errors),
estandarización de mayúsculas/minúsculas en términos jurídicos, y conversión al
formato UTF-8 para compatibilidad con el motor de búsqueda.

● Asignación de metadatos: Cada artículo recibe su conjunto mínimo de metadatos:
número de artículo, título al que pertenece, capítulo, tags temáticos (Derechos
Fundamentales, Poder Legislativo, etc.), y fecha de última modificación
constitucional.
7.2. Etapa 2 — Carga Masiva al Sistema
La ingesta masiva se realiza mediante un script Python (bulk_ingest.py) que consume la API
REST de BookStack y el indexador de ChromaDB en paralelo:
Pipeline de ingesta automatizada:
● Paso 1 — Parser constitucional: Script en Python que lee el PDF/XML oficial y
extrae cada artículo como objeto JSON con sus campos de metadatos.
● Paso 2 — Carga en BookStack: Los artículos se crean automáticamente en la
estructura Libro (Constitución) → Shelf (Título) → Book (Capítulo) → Page (Artículo)
mediante la API de BookStack.
● Paso 3 — Generación de embeddings: Cada artículo se vectoriza usando el
modelo text-embedding-3-small de OpenAI y se almacena en ChromaDB para
habilitar la búsqueda semántica.
● Paso 4 — Indexación en Elasticsearch: Los artículos se indexan también para
búsqueda full-text exacta por número de artículo, palabras clave y términos jurídicos.
● Paso 5 — Validación de integridad: Script de verificación que confirma que los 206
artículos fueron cargados correctamente y sus embeddings generados.
7.3. Etapa 3 — Integración con Repositorios Dinámicos (Big Data)

El sistema implementa conectores API para mantener el conocimiento jurídico actualizado
de forma automatizada:
Fuente de Datos Mecanismo de Actualización
Tribunal Constitucional (tc.gob.pe) Web scraper semanal — detecta nuevas
sentencias relevantes
Congreso de la República API REST — monitoreo de reformas
constitucionales
Sistema Peruano de Información Jurídica Integración vía API MINJUS — leyes
(SPIJ) complementarias
Defensoría del Pueblo RSS Feed — informes sobre vulneraciones
de derechos
8. Establecimiento del Flujo de Trabajo (Workflow de Calidad)
El flujo de trabajo de calidad es la traducción operativa del Modelo SECI al ciclo de vida del
contenido dentro del sistema. Ningún artículo, explicación o guía procesal puede publicarse
sin pasar por este circuito de validación.
8.1. Ciclo SECI Aplicado al Workflow
Fase SECI Actividad Actor Entregable
Socializació El experto jurídico identifica una Abogado Solicitud de nuevo
n brecha de conocimiento constitucionalist artículo/guía
a

ciudadano (ej. proceso de hábeas
corpus)
Exteriorizac El redactor documenta el Redactor Borrador en estado
ión conocimiento tácito: redacta el colaborativo "Pendiente de
artículo explicativo en lenguaje revisión"
ciudadano
Combinació El revisor jurídico valida la Revisor jurídico Artículo validado o
n precisión legal, cruza con devuelto con
jurisprudencia y aprueba o comentarios
devuelve con observaciones
Interiorizaci El artículo aprobado se publica, Administrador Artículo publicado +
ón se vectoriza y el ciudadano lo de contenido embedding
consulta, cerrando el ciclo de actualizado en
aprendizaje ChromaDB
8.2. Estados del Contenido en el Sistema
El sistema implementa un flujo de estados para cada pieza de contenido que garantiza la
trazabilidad completa desde su creación hasta su publicación:
📝 Borrador → 🔍 En Revisión → ✅ Aprobado → 🌐 Publicado → 🔄
Actualización Pendiente

Fase 5: Lanzamiento, Adopción y Gobernanza (La
Cultura)
El éxito de un Sistema de Gestión del Conocimiento depende en un 80% de la cultura
organizacional y ciudadana, y únicamente un 20% de la tecnología implementada. En el
contexto de la Constitución del Perú, esto implica garantizar que el ciudadano confíe en el
sistema, lo use activamente y contribuya a mejorarlo.
9. Capacitación y Gestión del Cambio
La estrategia de adopción se articula en torno a tres ejes: capacitación por segmentos de
audiencia, comunicación del valor ciudadano, y destrucción de las barreras que
históricamente han mantenido la Constitución como un documento inaccesible para la
mayoría de peruanos.
9.1. Plan de Capacitación por Segmento
Segmento Modalidad de Objetivo de Adopción
Capacitación
Estudiantes escolares y Talleres presenciales y Integrar el sistema como
universitarios tutoriales en video (YouTube herramienta de estudio
/ TikTok) cívico
Ciudadanos en general Guías visuales Autonomía para consultar
simplificadas, chatbot de derechos sin intermediarios
onboarding en la app

Profesionales y trabajadores  Webinars  temáticos  sobre  Resolver  dudas  sin
| derechos          | laborales  | depender de asesoría legal  |     |
| ----------------- | ---------- | --------------------------- | --- |
| constitucionales  |            | pagada                      |     |
Población rural y vulnerable  Versión  offline  descargable  Acceso  sin  requisitos  de
| +   | alianzas  | con  conectividad continua  |     |
| --- | --------- | --------------------------- | --- |
municipalidades
Abogados y especialistas  Documentación  técnica  de  Usar  el  sistema  como
| la  API              | +  sandbox  | de  herramienta         | de  |
| -------------------- | ----------- | ----------------------- | --- |
| consultas avanzadas  |             | investigación jurídica  |     |
Organizaciones y sociedad  Kit  de  integración  Embeber el sistema en sus
civil  institucional  +  sesiones  de  plataformas de defensa de
| personalización  |     | derechos  |     |
| ---------------- | --- | --------- | --- |

9.2. Estrategia de Comunicación y Difusión
La gestión del cambio requiere una estrategia comunicacional que rompa la percepción de
que la Constitución es un "documento de abogados". Las iniciativas concretas incluyen:
●  Campaña de lanzamiento nacional: Campaña de lanzamiento nacional: Alianza
con el Ministerio de Educación para presentar el sistema como herramienta oficial de
educación cívica.
●  Presencia en redes sociales: Presencia en redes sociales: Publicación semanal de
"El artículo del día" en redes sociales, explicando un artículo constitucional con
casos reales cotidianos.
●  QR en espacios públicos: QR en espacios públicos: Códigos QR en comisarías,
hospitales, municipalidades y UGEL que direccionan directamente al sistema con un
mensaje claro: "¿Vulneran tus derechos? Consulta aquí qué dice la Constitución."

● Alianza con Defensoría del Pueblo: Alianza con Defensoría del Pueblo:
Co-branding con la Defensoría para dar respaldo institucional al sistema y aumentar
la confianza ciudadana.
● Premio al conocimiento constitucional: Premio al conocimiento constitucional:
Concurso universitario anual de casos resueltos con el sistema, incentivando la
adopción en el ecosistema académico.
9.3. Métricas de Adopción
Se definen indicadores clave de adopción (KPIs) medidos mensualmente:
Indicador (KPI) Meta al mes 6 de operación
Usuarios únicos mensuales > 10,000 ciudadanos
Consultas realizadas por búsqueda > 5,000 / mes
semántica
Tasa de retorno de usuarios (sesiones > 30%
recurrentes)
Artículos más consultados (Top 10 100% de artículos consultados al menos 1
identificados) vez
Tiempo promedio de sesión > 3 minutos
Satisfacción del ciudadano (NPS) > 60 puntos
10. Auditoría, Analítica y Mejora Continua
La Fase 5 no culmina con el lanzamiento: es el inicio de un ciclo perpetuo de mejora basado
en datos de uso real. El sistema incorpora un dashboard analítico interno accesible para los
administradores de contenido y el equipo técnico.

10.1. Sistema de Analítica Web Integrado
Se implementa una capa de analítica compuesta por dos herramientas complementarias
que garantizan privacidad ciudadana sin cookies de rastreo:
Herramientas de analítica implementadas:
● Plausible Analytics: Alternativa open source a Google Analytics, sin cookies,
cumple con GDPR/LOPD. Registra páginas vistas, artículos más consultados y flujos
de navegación.
● Elasticsearch Kibana: Para analizar los patrones de búsqueda — qué términos
ingresan los ciudadanos, qué resultados obtienen y qué consultas no devuelven
resultados (vacíos de conocimiento).
● Dashboard de vacíos de conocimiento: Panel dedicado que lista semanalmente
los términos buscados sin resultados relevantes, activando automáticamente una
solicitud de nuevo contenido al equipo editorial.
10.2. Indicadores de Calidad del Conocimiento
El sistema mide permanentemente la calidad del conocimiento publicado mediante los
siguientes indicadores:
Dimensión Indicador Frecuencia de revisión
Veracidad % de artículos validados por Mensual
revisor jurídico

| Actualidad  | % de artículos con fecha de  | Bimestral  |
| ----------- | ---------------------------- | ---------- |
revisión > 6 meses
| Relevancia  | Tasa de clics en resultados  | Semanal  |
| ----------- | ---------------------------- | -------- |
de búsqueda (CTR)
| Completitud  | % de artículos  | Trimestral  |
| ------------ | --------------- | ----------- |
constitucionales con
explicación ciudadana
| Accesibilidad  | Puntaje de legibilidad  | Semestral  |
| -------------- | ----------------------- | ---------- |
Flesch-Kincaid de artículos
| Satisfacción  | Calificación ciudadana  | Continuo  |
| ------------- | ----------------------- | --------- |
(👍/👎) por artículo

10.3. Ciclo de Mejora Continua (Plan-Do-Check-Act)
El sistema operativo de mejora continua sigue el ciclo PDCA adaptado al contexto del KMS
constitucional:

PLAN  Analizar el dashboard de vacíos de conocimiento. Priorizar los 10 términos
más buscados sin resultado. Planificar la creación de contenido del siguiente
sprint quincenal.
DO  El equipo editorial redacta los nuevos artículos o actualiza los existentes. El
revisor jurídico valida el contenido. El administrador publica y actualiza los
embeddings en ChromaDB.

CHECK Verificar si los nuevos artículos reducen el porcentaje de búsquedas sin
resultado. Medir el NPS ciudadano post-publicación. Revisar KPIs de adopción
vs. metas establecidas.
ACT Estandarizar los formatos editoriales exitosos. Ajustar la taxonomía de tags si
emergen nuevas categorías de búsqueda. Escalar la infraestructura si el
crecimiento de usuarios supera los umbrales de capacidad.
10.4. Gobernanza del Sistema
Para garantizar la sostenibilidad del sistema más allá del proyecto académico, se propone
un modelo de gobernanza institucional:
● Comité Editorial Jurídico: Comité Editorial Jurídico: Reunión mensual con
especialistas constitucionales para revisar la relevancia y actualidad del contenido
publicado.
● Política de obsolescencia: Política de obsolescencia: Todo artículo sin revisión en
más de 12 meses se marca automáticamente como "En revisión" y se notifica al
equipo editorial.
● Repositorio de cambios constitucionales: Repositorio de cambios
constitucionales: El sistema monitorea automáticamente el Diario Oficial El Peruano
para detectar reformas constitucionales y activar alertas de actualización de
contenido.
● Informe trimestral público: Informe trimestral público: Publicación de métricas de
uso, artículos más consultados y plan de mejora, generando transparencia y
confianza ciudadana en el sistema.
● Modelo de sostenibilidad: Modelo de sostenibilidad: Alianza con universidades de
Derecho para que estudiantes de últimos ciclos aporten como redactores
colaborativos bajo supervisión de docentes revisores.