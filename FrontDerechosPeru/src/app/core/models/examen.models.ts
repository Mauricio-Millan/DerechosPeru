export interface PreguntaExamen {
  id: number;
  pregunta: string;
  opciones: string[];
}

export interface RespuestaIn {
  pregunta_id: number;
  opcion: number;
}

export interface DetalleRespuesta {
  pregunta_id: number;
  opcion_elegida: number;
  correcta: boolean;
  opcion_correcta: number;
}

export interface ResultadoExamen {
  puntaje: number;
  total: number;
  aprobado: boolean;
  medalla: string;
  promovido: boolean;
  nuevo_rol: string | null;
  detalle: DetalleRespuesta[];
}

export interface NivelProgreso {
  nivel: number;
  aprobado: boolean;
  puntaje: number;
  total: number;
  medalla: string;
  completado_at: string;
}

export interface ProgresoExamen {
  niveles: NivelProgreso[];
  es_experto: boolean;
}
