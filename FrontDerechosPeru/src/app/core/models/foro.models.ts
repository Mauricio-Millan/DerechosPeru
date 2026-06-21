export interface Thread {
  id: number;
  titulo: string;
  contenido: string;
  articulo_id: number | null;
  category_id: number | null;
  author_id: string;
  author_name: string | null;
  is_closed: boolean;
  best_post_id: number | null;
  total_respuestas: number;
  created_at: string;
}

export interface Post {
  id: number;
  thread_id: number;
  contenido: string;
  author_id: string;
  author_name: string | null;
  is_verified: boolean;
  votos: number;
  mi_voto: number;
  created_at: string;
}

export interface ThreadDetail extends Thread {
  respuestas: Post[];
}

export interface Annotation {
  id: number;
  articulo_id: number;
  contenido: string;
  author_id: string;
  author_name: string | null;
  created_at: string;
}
