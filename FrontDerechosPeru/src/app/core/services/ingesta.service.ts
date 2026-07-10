import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConstitutionVersion,
  DraftArticulo,
  IngestResult,
  Progreso,
  QAReport,
  Estructura,
  TituloDraft,
  CapituloDraft,
} from '../models/ingesta.models';

const API = `${environment.apiUrl}/admin`;

@Injectable({ providedIn: 'root' })
export class IngestaService {
  private readonly http = inject(HttpClient);

  ingest(file: File, label: string, year: number, promulgatedOn?: string): Observable<IngestResult> {
    const form = new FormData();
    form.append('file', file);
    form.append('label', label);
    form.append('year', String(year));
    if (promulgatedOn) form.append('promulgated_on', promulgatedOn);
    return this.http.post<IngestResult>(`${API}/ingest`, form);
  }

  getVersiones(): Observable<ConstitutionVersion[]> {
    return this.http.get<ConstitutionVersion[]>(`${API}/versions`);
  }

  getQA(versionId: number): Observable<QAReport> {
    return this.http.get<QAReport>(`${API}/versions/${versionId}/qa`);
  }

  getArticulos(versionId: number): Observable<DraftArticulo[]> {
    return this.http.get<DraftArticulo[]>(`${API}/versions/${versionId}/articulos`);
  }

  getPdfUrl(versionId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${API}/versions/${versionId}/pdf`);
  }

  revisar(articuloId: number, reviewStatus: string, contenido?: string): Observable<DraftArticulo> {
    return this.http.patch<DraftArticulo>(`${API}/articulos/${articuloId}/review`, {
      review_status: reviewStatus,
      contenido,
    });
  }

  getProgreso(versionId: number): Observable<Progreso> {
    return this.http.get<Progreso>(`${API}/versions/${versionId}/progress`);
  }

  publicar(versionId: number): Observable<ConstitutionVersion> {
    return this.http.post<ConstitutionVersion>(`${API}/versions/${versionId}/publish`, {});
  }

  // --- Revisión de estructura ---
  getEstructura(versionId: number): Observable<Estructura> {
    return this.http.get<Estructura>(`${API}/versions/${versionId}/estructura`);
  }

  crearTitulo(versionId: number, numero_romano: string, denominacion: string): Observable<TituloDraft> {
    return this.http.post<TituloDraft>(`${API}/versions/${versionId}/titulos`, { numero_romano, denominacion });
  }

  editarTitulo(id: number, cambios: Partial<{ numero_romano: string; denominacion: string }>): Observable<TituloDraft> {
    return this.http.patch<TituloDraft>(`${API}/titulos/${id}`, cambios);
  }

  borrarTitulo(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/titulos/${id}`);
  }

  crearCapitulo(versionId: number, titulo_id: number, numero_romano: string, denominacion: string): Observable<CapituloDraft> {
    return this.http.post<CapituloDraft>(`${API}/versions/${versionId}/capitulos`, { titulo_id, numero_romano, denominacion });
  }

  editarCapitulo(id: number, cambios: Partial<{ numero_romano: string; denominacion: string; titulo_id: number }>): Observable<CapituloDraft> {
    return this.http.patch<CapituloDraft>(`${API}/capitulos/${id}`, cambios);
  }

  borrarCapitulo(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/capitulos/${id}`);
  }

  asignarArticulosACapitulo(capituloId: number, articulo_ids: number[]): Observable<void> {
    return this.http.post<void>(`${API}/capitulos/${capituloId}/asignar-articulos`, { articulo_ids });
  }

  asignarArticulosATitulo(tituloId: number, articulo_ids: number[]): Observable<void> {
    return this.http.post<void>(`${API}/titulos/${tituloId}/asignar-articulos`, { articulo_ids });
  }

  asignarCapitulosATitulo(tituloId: number, capitulo_ids: number[]): Observable<void> {
    return this.http.post<void>(`${API}/titulos/${tituloId}/asignar-capitulos`, { capitulo_ids });
  }

  borrarVersion(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/versions/${id}`);
  }

  crearArticulo(versionId: number, data: { numero: number; contenido: string; sumilla?: string | null; titulo_id?: number | null; capitulo_id?: number | null }): Observable<DraftArticulo> {
    return this.http.post<DraftArticulo>(`${API}/versions/${versionId}/articulos`, data);
  }

  borrarArticulo(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/articulos/${id}`);
  }
}
