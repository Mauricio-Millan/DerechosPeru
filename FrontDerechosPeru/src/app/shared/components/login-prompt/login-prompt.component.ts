import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginPromptService } from '../../../core/services/login-prompt.service';

const MENSAJES = {
  chat: {
    icono: '🤖',
    titulo: 'Chat con IA constitucional',
    desc: 'Para conversar con el asistente de inteligencia artificial y recibir orientación sobre la Constitución necesitas una cuenta gratuita.',
  },
  foro: {
    icono: '💬',
    titulo: 'Participar en el foro',
    desc: 'Para crear hilos de discusión, responder preguntas y votar en el foro necesitas una cuenta gratuita.',
  },
  '': {
    icono: '🔒',
    titulo: 'Inicio de sesión requerido',
    desc: 'Esta función está disponible para usuarios registrados. Crear una cuenta es gratuito y solo toma un momento.',
  },
};

@Component({
  selector: 'app-login-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (prompt.visible()) {
      <div class="lp-overlay" (click)="prompt.hide()" role="dialog" aria-modal="true" [attr.aria-label]="msg().titulo">
        <div class="lp-card" (click)="$event.stopPropagation()">
          <span class="lp-icono">{{ msg().icono }}</span>
          <h2 class="lp-titulo">{{ msg().titulo }}</h2>
          <p class="lp-desc">{{ msg().desc }}</p>
          <div class="lp-actions">
            <button class="lp-btn lp-btn--primary" (click)="irLogin()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
              </svg>
              Iniciar sesión
            </button>
            <button class="lp-btn lp-btn--ghost" (click)="prompt.hide()">Cancelar</button>
          </div>
          <p class="lp-footer">¿No tienes cuenta? El registro también está disponible en esa pantalla.</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .lp-overlay {
      position: fixed; inset: 0; z-index: 1100;
      background: rgba(0,0,0,0.55);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: lp-fade 0.15s ease;
    }

    .lp-card {
      background: white; border-radius: 16px;
      padding: 36px 32px 28px;
      width: 100%; max-width: 420px;
      text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.25);
      animation: lp-pop 0.2s cubic-bezier(0.34,1.56,0.64,1);
      font-family: system-ui, sans-serif;
    }

    .lp-icono { font-size: 48px; display: block; margin-bottom: 16px; line-height: 1; }

    .lp-titulo {
      font-size: 20px; font-weight: 800; color: #1e293b;
      margin: 0 0 10px; line-height: 1.3;
    }

    .lp-desc {
      font-size: 14px; color: #64748b; line-height: 1.6;
      margin: 0 0 24px;
    }

    .lp-actions { display: flex; flex-direction: column; gap: 10px; }

    .lp-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 20px; border-radius: 10px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      font-family: inherit; border: none; transition: all 0.15s;

      &--primary {
        background: #2563eb; color: white;
        &:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35); }
      }
      &--ghost {
        background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;
        &:hover { background: #e2e8f0; }
      }
    }

    .lp-footer {
      margin: 16px 0 0; font-size: 12px; color: #94a3b8;
    }

    @keyframes lp-fade { from { opacity: 0; } to { opacity: 1; } }
    @keyframes lp-pop  {
      from { opacity: 0; transform: scale(0.88) translateY(16px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    @media (prefers-color-scheme: dark) {
      .lp-card { background: #1e293b; }
      .lp-titulo { color: #f1f5f9; }
      .lp-desc { color: #94a3b8; }
      .lp-btn--ghost { background: #334155; color: #94a3b8; border-color: #475569; &:hover { background: #475569; } }
      .lp-footer { color: #64748b; }
    }
  `],
})
export class LoginPromptComponent {
  readonly prompt = inject(LoginPromptService);
  private readonly router = inject(Router);

  msg() { return MENSAJES[this.prompt.feature()]; }

  irLogin(): void {
    this.prompt.hide();
    this.router.navigate(['/auth']);
  }
}
