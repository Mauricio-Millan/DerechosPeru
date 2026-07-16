import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PreguntaExamen, ProgresoExamen, ResultadoExamen, RespuestaIn } from '../models/examen.models';

const API = `${environment.apiUrl}/examen`;

@Injectable({ providedIn: 'root' })
export class ExamenService {
  private readonly http = inject(HttpClient);

  getPreguntas(nivel: number): Observable<PreguntaExamen[]> {
    return this.http.get<PreguntaExamen[]>(`${API}/preguntas/${nivel}`);
  }

  enviar(nivel: number, respuestas: RespuestaIn[]): Observable<ResultadoExamen> {
    return this.http.post<ResultadoExamen>(`${API}/enviar`, { nivel, respuestas });
  }

  getProgreso(): Observable<ProgresoExamen> {
    return this.http.get<ProgresoExamen>(`${API}/mi-progreso`);
  }
}
