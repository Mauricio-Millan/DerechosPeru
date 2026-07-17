import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-chat-fab',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!cerrado() && !enBuscar()) {
      <div class="fab" role="complementary" aria-label="Acceso rápido al asistente constitucional">
        <button class="fab__close" (click)="cerrado.set(true)" aria-label="Cerrar atajo de chat">×</button>
        <button class="fab__btn" (click)="abrir()" aria-label="Abrir chat con IA sobre la Constitución del Perú">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span class="fab__label">Chat IA</span>
        </button>
      </div>
    }
  `,
  styles: [`
    .fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 900;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      animation: fab-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .fab__close {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,0.35);
      background: rgba(0,0,0,0.4);
      color: white;
      font-size: 15px;
      line-height: 1;
      cursor: pointer;
      display: grid;
      place-items: center;
      opacity: 0.7;
      transition: opacity 0.15s;
      &:hover { opacity: 1; }
    }

    .fab__btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 20px;
      border-radius: 50px;
      border: none;
      background: linear-gradient(135deg, #1a56db, #2563eb);
      color: white;
      font-size: 14px;
      font-weight: 700;
      font-family: system-ui, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(37, 99, 235, 0.45);
      transition: transform 0.15s, box-shadow 0.15s;
      white-space: nowrap;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(37, 99, 235, 0.55);
      }
      &:active { transform: translateY(0); }
    }

    .fab__label { letter-spacing: 0.01em; }

    @keyframes fab-in {
      from { opacity: 0; transform: scale(0.7) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    @media (max-width: 480px) {
      .fab { bottom: 16px; right: 16px; }
      .fab__label { display: none; }
      .fab__btn { padding: 14px; border-radius: 50%; }
    }
  `],
})
export class ChatFabComponent {
  private readonly router = inject(Router);
  readonly cerrado = signal(false);
  readonly enBuscar = signal(false);

  constructor() {
    this.enBuscar.set(this.router.url.includes('/constitucion/buscar'));
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.enBuscar.set(e.urlAfterRedirects.includes('/constitucion/buscar'));
      });
  }

  abrir(): void {
    this.router.navigate(['/constitucion/buscar'], {
      queryParams: { modo: 'guiada', tab: 'chat', voz: '1' },
    });
  }
}
