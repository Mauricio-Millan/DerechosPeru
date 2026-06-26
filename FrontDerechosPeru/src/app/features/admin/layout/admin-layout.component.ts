import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="adm" [class.adm--nav-open]="navOpen()">
      <header class="adm__topbar">
        <button class="adm__burger" (click)="navOpen.set(!navOpen())" aria-label="Menú">☰</button>
        <a routerLink="/constitucion/estructura" class="adm__back">← Volver al portal</a>
        <div class="adm__spacer"></div>
        <span class="adm__role">{{ auth.rol() }}</span>
        <span class="adm__email">{{ auth.user()?.email }}</span>
        <button class="adm__logout" (click)="logout()">Salir</button>
      </header>

      <div class="adm__body">
        @if (navOpen()) { <div class="adm__overlay" (click)="navOpen.set(false)"></div> }
        <nav class="adm__nav" (click)="navOpen.set(false)">
          <span class="adm__nav-title">Administración</span>
          <a routerLink="/admin" routerLinkActive="adm__link--active" [routerLinkActiveOptions]="{ exact: true }" class="adm__link">
            Dashboard
          </a>
          <a routerLink="/admin/ingesta" routerLinkActive="adm__link--active" class="adm__link">
            Ingesta de constituciones
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin/usuarios" routerLinkActive="adm__link--active" class="adm__link">
              Usuarios y roles
            </a>
          }
        </nav>

        <main class="adm__main">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .adm { min-height: 100vh; display: flex; flex-direction: column; background: v.$color-bg-subtle; }

    .adm__topbar {
      display: flex; align-items: center; gap: v.$spacing-md;
      padding: v.$spacing-sm v.$spacing-lg; background: v.$color-primary; color: white;
    }
    .adm__burger { display: none; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; }
    .adm__back { color: rgba(255,255,255,0.85); text-decoration: none; font-size: v.$font-size-sm; font-weight: 600; }
    .adm__back:hover { color: white; }
    .adm__spacer { flex: 1; }
    .adm__role { padding: 2px 8px; border-radius: v.$radius-pill; background: v.$color-gold; color: v.$color-primary; font-size: v.$font-size-xs; font-weight: 700; text-transform: uppercase; }
    .adm__email { font-size: v.$font-size-sm; color: rgba(255,255,255,0.8); }
    .adm__logout { background: rgba(255,255,255,0.15); border: none; color: white; padding: 5px 12px; border-radius: v.$radius-sm; font-size: v.$font-size-sm; cursor: pointer; font-family: inherit; }
    .adm__logout:hover { background: rgba(255,255,255,0.25); }

    .adm__body { flex: 1; display: grid; grid-template-columns: 220px 1fr; min-height: 0; }

    .adm__nav { background: white; border-right: 1px solid v.$color-border; padding: v.$spacing-md; display: flex; flex-direction: column; gap: 2px; }
    .adm__nav-title { font-size: v.$font-size-xs; text-transform: uppercase; letter-spacing: 0.06em; color: v.$color-text-muted; font-weight: 600; padding: v.$spacing-sm; }
    .adm__link { padding: v.$spacing-sm v.$spacing-md; border-radius: v.$radius-md; color: v.$color-text-secondary; text-decoration: none; font-size: v.$font-size-sm; font-weight: 600; }
    .adm__link:hover { background: v.$color-bg-subtle; color: v.$color-text-primary; }
    .adm__link--active { background: v.$color-primary-bg; color: v.$color-primary; }

    .adm__main { overflow-y: auto; min-width: 0; }
    .adm__overlay { display: none; }

    @media (max-width: 768px) {
      .adm__burger { display: block; }
      .adm__email { display: none; }
      .adm__body { grid-template-columns: 1fr; }
      .adm__nav {
        position: fixed; top: 0; left: 0; bottom: 0; width: 240px; z-index: 50;
        transform: translateX(-100%); transition: transform 0.25s ease;
      }
      .adm--nav-open .adm__nav { transform: translateX(0); }
      .adm--nav-open .adm__overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 40; }
    }
  `],
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  readonly navOpen = signal(false);

  logout(): void {
    void this.auth.logout();
  }
}
