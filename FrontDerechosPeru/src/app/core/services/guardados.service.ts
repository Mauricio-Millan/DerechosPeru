import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Articulo } from '../models/constitucion.models';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'constitucion-guardados';

/**
 * Marcadores con dos respaldos según la sesión:
 * - Anónimo: localStorage (como antes).
 * - Autenticado: backend (/api/bookmarks), persistente entre dispositivos.
 * Al iniciar sesión, fusiona los marcadores locales en la cuenta.
 * La API pública (isGuardado/toggleGuardado/getIds/cantidad) no cambia.
 */
@Injectable({ providedIn: 'root' })
export class GuardadosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly api = `${environment.apiUrl}/bookmarks`;

  private readonly _guardados = signal<Set<number>>(this.loadFromStorage());

  readonly guardados = this._guardados.asReadonly();
  readonly cantidad = computed(() => this._guardados().size);

  constructor() {
    // Reacciona al cambio de sesión: al loguear fusiona + carga del backend;
    // al desloguear vuelve a localStorage.
    effect(() => {
      if (this.auth.isLoggedIn()) {
        void this.syncOnLogin();
      } else {
        this._guardados.set(this.loadFromStorage());
      }
    });
  }

  isGuardado(articuloId: number): boolean {
    return this._guardados().has(articuloId);
  }

  toggleGuardado(articuloId: number): void {
    const has = this._guardados().has(articuloId);
    // Actualización optimista de la UI
    this._guardados.update(set => {
      const next = new Set(set);
      has ? next.delete(articuloId) : next.add(articuloId);
      if (!this.auth.isLoggedIn()) this.saveToStorage(next);
      return next;
    });
    if (this.auth.isLoggedIn()) {
      const req = has
        ? this.http.delete(`${this.api}/${articuloId}`)
        : this.http.post(this.api, { articulo_id: articuloId });
      req.subscribe({ error: () => this.reloadFromBackend() });
    }
  }

  getIds(): number[] {
    return Array.from(this._guardados());
  }

  // --- Backend (autenticado) ---

  private async syncOnLogin(): Promise<void> {
    const locales = this.loadFromStorage();
    try {
      // Sube los marcadores locales que aún no estén en la cuenta
      await Promise.all(
        Array.from(locales).map(id =>
          firstValueFrom(this.http.post(this.api, { articulo_id: id })),
        ),
      );
      this.clearStorage();
      await this.reloadFromBackend();
    } catch {
      // Si falla, deja lo que haya en memoria
    }
  }

  private async reloadFromBackend(): Promise<void> {
    try {
      const arts = await firstValueFrom(this.http.get<Articulo[]>(this.api));
      this._guardados.set(new Set(arts.map(a => a.id)));
    } catch {
      /* sin conexión: conserva el estado actual */
    }
  }

  // --- localStorage (anónimo) ---

  private loadFromStorage(): Set<number> {
    if (!isPlatformBrowser(this.platformId)) return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set<number>(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveToStorage(set: Set<number>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      /* localStorage no disponible */
    }
  }

  private clearStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }
}
