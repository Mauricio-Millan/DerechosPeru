export interface VersionPublica {
  id: number;
  label: string;
  year: number;
  promulgated_on: string | null;
}

export interface ArtLado {
  id: number;
  numero: number;
  sumilla: string | null;
  contenido: string;
}

export type EstadoComparacion = 'identico' | 'modificado' | 'sin_equivalente' | 'nuevo';

export interface FilaComparacion {
  base: ArtLado | null;
  target: ArtLado | null;
  similarity: number;
  estado: EstadoComparacion;
}

export interface ResumenComparacion {
  identicos: number;
  modificados: number;
  sin_equivalente: number;
  nuevos: number;
}

export interface Comparacion {
  base: VersionPublica;
  target: VersionPublica;
  filas: FilaComparacion[];
  resumen: ResumenComparacion;
}
