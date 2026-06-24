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
}
