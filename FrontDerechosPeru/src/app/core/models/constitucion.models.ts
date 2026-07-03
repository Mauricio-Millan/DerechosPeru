export type CategoriaArticulo =
  | 'Derechos Fundamentales'
  | 'Estado y Nación'
  | 'Economía'
  | 'Régimen Político'
  | 'Poder Legislativo'
  | 'Poder Ejecutivo'
  | 'Poder Judicial'
  | 'Descentralización'
  | 'Garantías Constitucionales'
  | 'Reforma Constitucional';

export const CATEGORIAS: CategoriaArticulo[] = [
  'Derechos Fundamentales',
  'Estado y Nación',
  'Economía',
  'Régimen Político',
  'Poder Legislativo',
  'Poder Ejecutivo',
  'Poder Judicial',
  'Descentralización',
  'Garantías Constitucionales',
  'Reforma Constitucional',
];

export interface Articulo {
  id: number;
  numero: number;
  titulo: string;
  contenido: string;
  categoria: CategoriaArticulo;
  capituloId: number;
  tituloId: number;
}

export interface Capitulo {
  id: number;
  numero: number;
  nombre: string;
  tituloId: number;
  totalArticulos?: number;
  articulos?: Articulo[];
}

export interface Titulo {
  id: number;
  numero: number;
  nombre: string;
  totalCapitulos?: number;
  totalArticulos?: number;
  capitulos?: Capitulo[];
}

export interface EstadisticasConstitucion {
  totalTitulos: number;
  totalCapitulos: number;
  totalArticulos: number;
}

export interface FiltroArticulos {
  query?: string;
  categoria?: CategoriaArticulo | null;
  limit?: number;
  offset?: number;
}

export interface ArticulosResponse {
  data: Articulo[];
  total: number;
}

export interface ConsultaResultado {
  id: number;
  numero: number;
  titulo: string;
  contenido: string;
  categoria: string;
  similarity: number;
}

export interface ConsultaResponse {
  query: string;
  resultados: ConsultaResultado[];
  aviso_legal: string;
}

export interface FuenteChat {
  numero: number;
  sumilla: string;
  similarity: number;
}

export interface ChatResponse {
  respuesta: string;
  fuentes: FuenteChat[];
}

export interface MensajeChat {
  rol: 'user' | 'bot';
  texto: string;
  fuentes?: FuenteChat[];
}
