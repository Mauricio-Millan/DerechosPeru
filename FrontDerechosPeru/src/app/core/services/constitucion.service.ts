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
} from '../models/constitucion.models';

const API_BASE = '/api';

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

  getArticulosByIds(ids: number[]): Observable<Articulo[]> {
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<Articulo[]>(`${API_BASE}/articulos`, { params });
  }

  buscarArticulos(filtros: FiltroArticulos): Observable<ArticulosResponse> {
    let params = new HttpParams();
    if (filtros.query) params = params.set('query', filtros.query);
    if (filtros.categoria) params = params.set('categoria', filtros.categoria);
    return this.http.get<ArticulosResponse>(`${API_BASE}/articulos`, { params });
  }

  getEstadisticas(): Observable<EstadisticasConstitucion> {
    return this.http.get<EstadisticasConstitucion>(`${API_BASE}/estadisticas`);
  }
}
