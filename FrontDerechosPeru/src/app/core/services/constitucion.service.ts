import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Titulo,
  Capitulo,
  Articulo,
  EstadisticasConstitucion,
  FiltroArticulos,
  ArticulosResponse,
  ConsultaResponse,
  ChatResponse,
} from '../models/constitucion.models';
import { VersionPublica, Comparacion } from '../models/comparador.models';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ConstitucionService {
  private readonly http = inject(HttpClient);

  getTitulos(): Observable<Titulo[]> {
    return this.http.get<Titulo[]>(`${API_BASE}/titulos`);
  }

  getCapitulosByTitulo(tituloId: number): Observable<Capitulo[]> {
    return this.http.get<Capitulo[]>(`${API_BASE}/titulos/${tituloId}/capitulos`);
  }

  getArticulosByCapitulo(capituloId: number): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${API_BASE}/capitulos/${capituloId}/articulos`);
  }

  getArticulosByTitulo(tituloId: number): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${API_BASE}/titulos/${tituloId}/articulos`);
  }

  getArticulosByIds(ids: number[]): Observable<Articulo[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<Articulo[]>(`${API_BASE}/articulos`, { params });
  }

  buscarArticulos(filtros: FiltroArticulos): Observable<ArticulosResponse> {
    let params = new HttpParams();
    if (filtros.query) params = params.set('query', filtros.query);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    if (filtros.limit != null) params = params.set('limit', filtros.limit);
    if (filtros.offset != null) params = params.set('offset', filtros.offset);
    return this.http.get<ArticulosResponse>(`${API_BASE}/articulos`, { params });
  }

  getEstadisticas(): Observable<EstadisticasConstitucion> {
    return this.http.get<EstadisticasConstitucion>(`${API_BASE}/estadisticas`);
  }

  consultarGuiada(texto: string): Observable<ConsultaResponse> {
    return this.http.post<ConsultaResponse>(`${API_BASE}/consulta`, { texto });
  }

  chatConstitucional(payload: {
    mensaje: string;
    historial: { rol: string; texto: string }[];
    articulos_ids?: number[];
  }): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${API_BASE}/consulta/chat`, payload);
  }

  getVersionesPublicadas(): Observable<VersionPublica[]> {
    return this.http.get<VersionPublica[]>(`${API_BASE}/versions`);
  }

  comparar(baseId: number, targetId: number): Observable<Comparacion> {
    const params = new HttpParams().set('base', baseId).set('target', targetId);
    return this.http.get<Comparacion>(`${API_BASE}/compare`, { params });
  }
}
