// Modelos de la ingesta de constituciones (Sprint 6 — M8). snake_case = JSON del backend.

export interface ConstitutionVersion {
  id: number;
  label: string;
  year: number;
  status: 'borrador' | 'en_revision' | 'publicada' | 'archivada';
  is_current: boolean;
  promulgated_on: string | null;
  total_articulos: number;
  verificados: number;
}

export interface QAReport {
  ok: boolean;
  errors: string[];
  counts: Record<string, number>;
}

export interface IngestResult {
  version_id: number;
  label: string;
  year: number;
  stats: Record<string, number>;
  qa: QAReport;
}

export interface DraftArticulo {
  id: number;
  numero: number;
  sumilla: string | null;
  contenido: string;
  review_status: 'pendiente' | 'verificado' | 'observado';
  titulo?: string | null;
  capitulo?: string | null;
}

export interface Progreso {
  total: number;
  verificados: number;
  observados: number;
  pendientes: number;
  pct: number;
}

export interface TituloDraft {
  id: number;
  numero_romano: string;
  denominacion: string;
  display_order: number | null;
  total_capitulos: number;
  total_articulos: number;
}

export interface CapituloDraft {
  id: number;
  titulo_id: number;
  numero_romano: string;
  denominacion: string;
  display_order: number | null;
  total_articulos: number;
}

export interface ArticuloEstructura {
  id: number;
  numero: number;
  sumilla: string | null;
  titulo_id: number | null;
  capitulo_id: number | null;
  review_status: 'pendiente' | 'verificado' | 'observado';
}

export interface Estructura {
  titulos: TituloDraft[];
  capitulos: CapituloDraft[];
  articulos: ArticuloEstructura[];
}
