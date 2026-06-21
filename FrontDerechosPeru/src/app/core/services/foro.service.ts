import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Thread, ThreadDetail, Post, Annotation } from '../models/foro.models';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly http = inject(HttpClient);

  listThreads(articuloId?: number, categoryId?: number, limit?: number, offset?: number): Observable<Thread[]> {
    let params = new HttpParams();
    if (articuloId !== undefined && articuloId !== null) {
      params = params.set('articulo_id', articuloId.toString());
    }
    if (categoryId !== undefined && categoryId !== null) {
      params = params.set('category_id', categoryId.toString());
    }
    if (limit !== undefined && limit !== null) {
      params = params.set('limit', limit.toString());
    }
    if (offset !== undefined && offset !== null) {
      params = params.set('offset', offset.toString());
    }

    return this.http.get<Thread[]>(`${API_BASE}/foro/threads`, { params });
  }

  getThread(id: number): Observable<ThreadDetail> {
    return this.http.get<ThreadDetail>(`${API_BASE}/foro/threads/${id}`);
  }

  createThread(body: { titulo: string; contenido: string; articulo_id?: number | null; category_id?: number | null }): Observable<Thread> {
    return this.http.post<Thread>(`${API_BASE}/foro/threads`, body);
  }

  addRespuesta(threadId: number, contenido: string): Observable<Post> {
    return this.http.post<Post>(`${API_BASE}/foro/threads/${threadId}/respuestas`, { contenido });
  }

  votar(postId: number, value: number): Observable<{ votos: number; mi_voto: number }> {
    return this.http.post<{ votos: number; mi_voto: number }>(`${API_BASE}/foro/respuestas/${postId}/voto`, { value });
  }

  verificar(postId: number): Observable<Post> {
    return this.http.patch<Post>(`${API_BASE}/foro/respuestas/${postId}/verificar`, {});
  }

  cerrar(threadId: number): Observable<Thread> {
    return this.http.patch<Thread>(`${API_BASE}/foro/threads/${threadId}/cerrar`, {});
  }

  mejorRespuesta(threadId: number, postId: number): Observable<Thread> {
    return this.http.patch<Thread>(`${API_BASE}/foro/threads/${threadId}/mejor-respuesta`, { post_id: postId });
  }

  borrarHilo(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/foro/threads/${id}`);
  }

  borrarRespuesta(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/foro/respuestas/${id}`);
  }

  getAnotaciones(articuloId: number): Observable<Annotation[]> {
    return this.http.get<Annotation[]>(`${API_BASE}/articulos/${articuloId}/anotaciones`);
  }

  addAnotacion(articuloId: number, contenido: string): Observable<Annotation> {
    return this.http.post<Annotation>(`${API_BASE}/articulos/${articuloId}/anotaciones`, { contenido });
  }

  borrarAnotacion(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/anotaciones/${id}`);
  }
}
