import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

const STORAGE_KEY = 'dpu_bienvenida_vista';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="wm-overlay" (click)="cerrar()" role="dialog" aria-modal="true" aria-labelledby="wm-title">
        <div class="wm-modal" (click)="$event.stopPropagation()">

          <button class="wm-close" (click)="cerrar()" aria-label="Cerrar">✕</button>

          <div class="wm-header">
            <div class="wm-logo">
              <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#C9A84C"/>
                <path d="M18 8C18 8 12 12 12 18C12 22 14.5 25 18 26C21.5 25 24 22 24 18C24 12 18 8 18 8Z" fill="#8B2020"/>
                <path d="M14 20L18 16L22 20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 22H21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="wm-title" id="wm-title">Bienvenido al Portal Constitucional</h2>
            <p class="wm-subtitle">Tu guía digital de la Constitución Política del Perú</p>
          </div>

          <div class="wm-steps">
            <div class="wm-step">
              <div class="wm-step__icon wm-step__icon--estructura">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <path d="M3 6h18M3 12h18M3 18h12"/>
                </svg>
              </div>
              <div class="wm-step__body">
                <strong>Estructura</strong>
                <span>Navega la Constitución por Títulos y Capítulos. Expande cada artículo para leer su contenido.</span>
              </div>
            </div>

            <div class="wm-step">
              <div class="wm-step__icon wm-step__icon--buscar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div class="wm-step__body">
                <strong>Buscar</strong>
                <span>Encuentra artículos por número, palabras clave o tema. Usa la consulta guiada por IA para resolver dudas concretas.</span>
              </div>
            </div>

            <div class="wm-step">
              <div class="wm-step__icon wm-step__icon--guardados">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="wm-step__body">
                <strong>Guardados</strong>
                <span>Marca los artículos de tu interés con el ícono 🔖. Si inicias sesión, tus guardados se sincronizan entre dispositivos.</span>
              </div>
            </div>

            <div class="wm-step">
              <div class="wm-step__icon wm-step__icon--foro">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="wm-step__body">
                <strong>Foro</strong>
                <span>Participa en debates y consultas ciudadanas. Registrate para crear hilos, responder y votar. Los expertos verifican las mejores respuestas.</span>
              </div>
            </div>
          </div>

          <div class="wm-footer">
            <p class="wm-tip">💡 En móvil, usa el botón <strong>"Ver índice"</strong> para navegar la estructura.</p>
            <button class="wm-btn" (click)="cerrar()">Empezar a explorar →</button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .wm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: v.$spacing-md;
      backdrop-filter: blur(2px);
      animation: fadeIn 0.2s ease;
    }

    .wm-modal {
      background: white;
      border-radius: v.$radius-lg;
      max-width: 520px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.25s ease;
    }

    .wm-close {
      position: absolute;
      top: v.$spacing-md;
      right: v.$spacing-md;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid v.$color-border;
      background: v.$color-bg-subtle;
      color: v.$color-text-muted;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all v.$transition-fast;
      z-index: 1;

      &:hover {
        background: v.$color-border;
        color: v.$color-text-primary;
      }
    }

    .wm-header {
      background: v.$color-primary;
      padding: v.$spacing-xl v.$spacing-xl v.$spacing-lg;
      text-align: center;
      border-radius: v.$radius-lg v.$radius-lg 0 0;
    }

    .wm-logo {
      display: flex;
      justify-content: center;
      margin-bottom: v.$spacing-sm;
    }

    .wm-title {
      font-family: v.$font-family-base;
      font-size: v.$font-size-xl;
      font-weight: 700;
      color: white;
      margin: 0 0 v.$spacing-xs;
    }

    .wm-subtitle {
      font-size: v.$font-size-sm;
      color: rgba(255, 255, 255, 0.75);
      margin: 0;
    }

    .wm-steps {
      padding: v.$spacing-lg v.$spacing-xl;
      display: flex;
      flex-direction: column;
      gap: v.$spacing-md;
    }

    .wm-step {
      display: flex;
      gap: v.$spacing-md;
      align-items: flex-start;

      &__icon {
        width: 40px;
        height: 40px;
        border-radius: v.$radius-md;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &--estructura { background: rgba(139, 32, 32, 0.1); color: v.$color-primary; }
        &--buscar     { background: rgba(41, 128, 185, 0.1); color: #2980b9; }
        &--guardados  { background: rgba(201, 168, 76, 0.15); color: #8B6914; }
        &--foro       { background: rgba(39, 174, 96, 0.1); color: #1a7a40; }
      }

      &__body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-top: 4px;

        strong {
          font-size: v.$font-size-sm;
          font-weight: 700;
          color: v.$color-text-primary;
        }

        span {
          font-size: v.$font-size-sm;
          color: v.$color-text-secondary;
          line-height: 1.5;
        }
      }
    }

    .wm-footer {
      padding: v.$spacing-md v.$spacing-xl v.$spacing-xl;
      border-top: 1px solid v.$color-border-light;
      display: flex;
      flex-direction: column;
      gap: v.$spacing-md;
      align-items: center;
    }

    .wm-tip {
      margin: 0;
      font-size: v.$font-size-xs;
      color: v.$color-text-muted;
      text-align: center;
      background: v.$color-bg-subtle;
      padding: v.$spacing-sm v.$spacing-md;
      border-radius: v.$radius-md;
      border: 1px solid v.$color-border;
      width: 100%;
    }

    .wm-btn {
      background: v.$color-primary;
      color: white;
      border: none;
      padding: 12px v.$spacing-xl;
      border-radius: v.$radius-md;
      font-size: v.$font-size-base;
      font-weight: 600;
      font-family: v.$font-family-ui;
      cursor: pointer;
      transition: background v.$transition-fast;
      width: 100%;

      &:hover { background: v.$color-primary-dark; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 540px) {
      .wm-header { padding: v.$spacing-lg v.$spacing-md v.$spacing-md; }
      .wm-steps { padding: v.$spacing-md; }
      .wm-footer { padding: v.$spacing-sm v.$spacing-md v.$spacing-lg; }
    }
  `],
})
export class WelcomeModalComponent implements OnInit {
  readonly visible = signal(false);

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
      this.visible.set(true);
    }
  }

  cerrar(): void {
    this.visible.set(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, '1');
    }
  }
}
