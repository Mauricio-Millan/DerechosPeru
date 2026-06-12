import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const STORAGE_KEY = 'constitucion-guardados';

@Injectable({ providedIn: 'root' })
export class GuardadosService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly _guardados = signal<Set<number>>(this.loadFromStorage());

  readonly guardados = this._guardados.asReadonly();
  readonly cantidad = computed(() => this._guardados().size);

  isGuardado(articuloId: number): boolean {
    return this._guardados().has(articuloId);
  }

  toggleGuardado(articuloId: number): void {
    this._guardados.update(set => {
      const next = new Set(set);
      if (next.has(articuloId)) {
        next.delete(articuloId);
      } else {
        next.add(articuloId);
      }
      this.saveToStorage(next);
      return next;
    });
  }

  getIds(): number[] {
    return Array.from(this._guardados());
  }

  private loadFromStorage(): Set<number> {
    if (!isPlatformBrowser(this.platformId)) return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      return new Set<number>(JSON.parse(raw));
    } catch {
      return new Set();
    }
  }

  private saveToStorage(set: Set<number>): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      // localStorage no disponible
    }
  }
}
