export interface Resumen {
  total_usuarios: number;
  total_consultas: number;
  consultas_fallidas: number;
  total_hilos: number;
  respuestas_verificadas: number;
  total_guardados: number;
}

export interface RolCount {
  rol: string;
  total: number;
}

export interface TopArticulo {
  id: number;
  numero: number;
  sumilla: string | null;
  consultas: number;
}

export interface BusquedaFallida {
  query_text: string;
  created_at: string;
}

export interface ForoStats {
  hilos: number;
  respuestas: number;
  verificadas: number;
}

export interface Analytics {
  resumen: Resumen;
  usuarios_por_rol: RolCount[];
  top_articulos: TopArticulo[];
  busquedas_fallidas: BusquedaFallida[];
  total_fallidas: number;
  foro: ForoStats;
}
