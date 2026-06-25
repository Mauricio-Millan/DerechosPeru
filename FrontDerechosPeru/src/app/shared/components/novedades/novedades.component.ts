import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NOVEDADES } from '../../../core/data/novedades';

const STORAGE_KEY = 'dpu_novedades_vista';

@Component({
  selector: 'app-novedades',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="nov__btn" (click)="toggle()" aria-label="Novedades del proyecto">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
      <span class="nov__btn-label">Novedades</span>
      @if (hayNueva()) { <span class="nov__dot" aria-hidden="true"></span> }
    </button>

    @if (abierto()) {
      <div class="nov__overlay" (click)="cerrar()"></div>
      <div class="nov__panel" role="dialog" aria-label="Novedades">
        <div class="nov__panel-head">
          <strong>Novedades</strong>
          <button type="button" class="nov__close" (click)="cerrar()" aria-label="Cerrar">×</button>
        </div>
        <ul class="nov__list">
          @for (n of novedades; track n.version) {
            <li class="nov__item">
              <div class="nov__item-head">
                <span class="nov__version">{{ n.version }}</span>
                <span class="nov__fecha">{{ n.fecha }}</span>
              </div>
              <ul class="nov__cambios">
                @for (c of n.cambios; track c) { <li>{{ c }}</li> }
              </ul>
            </li>
          }
        </ul>
      </div>
    }
  `,
  styles: [`
    :host { position: relative; display: inline-flex; }
    .nov__btn {
      position: relative; display: inline-flex; align-items: center; gap: 6px;
      background: transparent; border: 1px solid rgba(255,255,255,0.35);
      color: #fff; font-family: inherit; font-size: 0.8125rem; font-weight: 600;
      padding: 6px 12px; border-radius: 999px; cursor: pointer; transition: background 150ms ease;
    }
    .nov__btn:hover { background: rgba(255,255,255,0.12); }
    .nov__dot {
      position: absolute; top: 2px; right: 4px; width: 8px; height: 8px;
      background: #C9A84C; border-radius: 50%; box-shadow: 0 0 0 2px #8B2020;
    }
    .nov__overlay { position: fixed; inset: 0; z-index: 40; }
    .nov__panel {
      position: absolute; top: calc(100% + 8px); right: 0; z-index: 50;
      width: 320px; max-width: 90vw; max-height: 70vh; overflow-y: auto;
      background: #fff; color: #1A1A1A; border: 1px solid #E8E2DA;
      border-radius: 12px; box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    }
    .nov__panel-head {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-bottom: 1px solid #F0EBE4; position: sticky; top: 0; background: #fff;
    }
    .nov__close { background: none; border: none; font-size: 1.3rem; line-height: 1; color: #888; cursor: pointer; }
    .nov__list { list-style: none; margin: 0; padding: 8px 0; }
    .nov__item { padding: 10px 16px; border-bottom: 1px solid #F0EBE4; }
    .nov__item:last-child { border-bottom: none; }
    .nov__item-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
    .nov__version { font-weight: 700; color: #8B2020; font-size: 0.875rem; }
    .nov__fecha { font-size: 0.75rem; color: #888; }
    .nov__cambios { margin: 0; padding-left: 18px; }
    .nov__cambios li { font-size: 0.8125rem; color: #555; line-height: 1.5; margin-bottom: 3px; }
    @media (max-width: 600px) { .nov__btn-label { display: none; } }
  `],
})
export class NovedadesComponent {
  readonly novedades = NOVEDADES;
  readonly abierto = signal(false);
  readonly hayNueva = signal(this.calcularNueva());

  private calcularNueva(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) !== (NOVEDADES[0]?.version ?? '');
  }

  toggle(): void {
    this.abierto.update(v => !v);
    if (this.abierto() && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, NOVEDADES[0]?.version ?? '');
      this.hayNueva.set(false);
    }
  }

  cerrar(): void {
    this.abierto.set(false);
  }
}
