export interface Novedad {
  version: string;
  fecha: string; // YYYY-MM-DD
  cambios: string[];
}

// Changelog visible para todos. Agrega una entrada nueva al inicio en cada
// despliegue con mejoras relevantes. NOVEDADES[0] se considera la más reciente.
export const NOVEDADES: Novedad[] = [
  {
    version: 'v1.4',
    fecha: '2026-06-25',
    cambios: [
      'Panel de analítica para administradores: artículos más consultados y vacíos de conocimiento.',
      'Área de administración reorganizada por roles (editor y admin).',
      'Editor de contenido con formato Markdown y vista previa.',
      'Búsqueda directa más flexible: encuentra coincidencias parciales, no solo términos exactos.',
    ],
  },
  {
    version: 'v1.3',
    fecha: '2026-06-25',
    cambios: [
      'Comparador de versiones: compara dos constituciones lado a lado por similitud de contenido.',
      'Ingesta de constituciones por PDF para administradores.',
      'Carga inicial más clara cuando el servidor está despertando.',
    ],
  },
  {
    version: 'v1.2',
    fecha: '2026-06-24',
    cambios: [
      'Foro de consultas con respuestas verificadas por expertos.',
      'Modal de bienvenida con guía de uso.',
      'Índice lateral deslizable en móvil.',
    ],
  },
];
