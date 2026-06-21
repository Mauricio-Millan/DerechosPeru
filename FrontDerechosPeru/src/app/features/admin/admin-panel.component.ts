import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface AdminCard {
  title: string;
  description: string;
  icon: string;
  link?: string;
  badge?: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-panel">
      <header class="admin-panel__header">
        <div class="admin-panel__header-content">
          <a routerLink="/constitucion/estructura" class="admin-panel__back">
            ← Volver al portal
          </a>
          <div class="admin-panel__title-wrap">
            <h1 class="admin-panel__title">Panel de Administración</h1>
            <p class="admin-panel__subtitle">Gestiona el portal de la Constitución Política del Perú</p>
          </div>
          <div class="admin-panel__user-badge">
            <span class="admin-panel__role">Admin</span>
            <span class="admin-panel__email">{{ auth.user()?.email }}</span>
          </div>
        </div>
      </header>

      <main class="admin-panel__main">
        <section class="admin-panel__section">
          <h2 class="admin-panel__section-title">Gestión</h2>
          <div class="admin-panel__grid">
            @for (card of gestionCards; track card.title) {
              @if (card.link) {
                <a [routerLink]="card.link" class="admin-card">
                  <div class="admin-card__icon" [innerHTML]="card.icon"></div>
                  <div class="admin-card__body">
                    <h3 class="admin-card__title">{{ card.title }}</h3>
                    <p class="admin-card__desc">{{ card.description }}</p>
                  </div>
                  <span class="admin-card__arrow">→</span>
                </a>
              } @else {
                <div class="admin-card admin-card--disabled">
                  <div class="admin-card__icon" [innerHTML]="card.icon"></div>
                  <div class="admin-card__body">
                    <h3 class="admin-card__title">{{ card.title }}</h3>
                    <p class="admin-card__desc">{{ card.description }}</p>
                  </div>
                  @if (card.badge) {
                    <span class="admin-card__badge">{{ card.badge }}</span>
                  }
                </div>
              }
            }
          </div>
        </section>

        <section class="admin-panel__section">
          <h2 class="admin-panel__section-title">Próximamente</h2>
          <div class="admin-panel__grid">
            @for (card of proximamenteCards; track card.title) {
              <div class="admin-card admin-card--disabled">
                <div class="admin-card__icon" [innerHTML]="card.icon"></div>
                <div class="admin-card__body">
                  <h3 class="admin-card__title">{{ card.title }}</h3>
                  <p class="admin-card__desc">{{ card.description }}</p>
                </div>
                <span class="admin-card__badge">{{ card.badge }}</span>
              </div>
            }
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as v;

    .admin-panel {
      min-height: 100vh;
      background: v.$color-bg-subtle;

      &__header {
        background: v.$color-primary;
        padding: v.$spacing-xl;
      }

      &__header-content {
        max-width: 960px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: v.$spacing-sm;
      }

      &__back {
        color: rgba(255,255,255,0.7);
        font-size: v.$font-size-sm;
        text-decoration: none;
        width: fit-content;

        &:hover { color: white; }
      }

      &__title-wrap {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      &__title {
        font-family: v.$font-family-base;
        font-size: v.$font-size-2xl;
        font-weight: 700;
        color: white;
        margin: 0;
      }

      &__subtitle {
        margin: 0;
        font-size: v.$font-size-sm;
        color: rgba(255,255,255,0.65);
      }

      &__user-badge {
        display: flex;
        align-items: center;
        gap: v.$spacing-sm;
        margin-top: v.$spacing-xs;
      }

      &__role {
        padding: 2px 8px;
        border-radius: v.$radius-pill;
        background: v.$color-gold;
        color: v.$color-primary;
        font-size: v.$font-size-xs;
        font-weight: 700;
        text-transform: uppercase;
      }

      &__email {
        font-size: v.$font-size-sm;
        color: rgba(255,255,255,0.75);
      }

      &__main {
        max-width: 960px;
        margin: 0 auto;
        padding: v.$spacing-xl;
        display: flex;
        flex-direction: column;
        gap: v.$spacing-xl;
      }

      &__section-title {
        font-size: v.$font-size-base;
        font-weight: 600;
        color: v.$color-text-muted;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin: 0 0 v.$spacing-md;
        font-family: v.$font-family-ui;
      }

      &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: v.$spacing-md;
      }

      @media (max-width: 600px) {
        &__header { padding: v.$spacing-md; }
        &__main { padding: v.$spacing-md; }
        &__grid { grid-template-columns: 1fr; }
      }
    }

    .admin-card {
      background: white;
      border: 1px solid v.$color-border;
      border-radius: v.$radius-lg;
      padding: v.$spacing-lg;
      display: flex;
      flex-direction: column;
      gap: v.$spacing-sm;
      text-decoration: none;
      color: inherit;
      transition: all v.$transition-fast;
      position: relative;
      box-shadow: v.$shadow-card;

      &:not(&--disabled):hover {
        border-color: v.$color-primary;
        box-shadow: v.$shadow-card-hover;
        transform: translateY(-2px);
      }

      &--disabled {
        opacity: 0.6;
        cursor: default;
      }

      &__icon {
        width: 44px;
        height: 44px;
        border-radius: v.$radius-md;
        background: v.$color-primary-bg;
        display: flex;
        align-items: center;
        justify-content: center;
        color: v.$color-primary;
        flex-shrink: 0;

        svg { width: 22px; height: 22px; }
      }

      &__body {
        flex: 1;
      }

      &__title {
        margin: 0 0 4px;
        font-size: v.$font-size-base;
        font-weight: 600;
        color: v.$color-text-primary;
      }

      &__desc {
        margin: 0;
        font-size: v.$font-size-sm;
        color: v.$color-text-secondary;
        line-height: 1.4;
      }

      &__arrow {
        position: absolute;
        top: v.$spacing-lg;
        right: v.$spacing-lg;
        font-size: v.$font-size-lg;
        color: v.$color-text-muted;
        transition: transform v.$transition-fast;
      }

      &:not(&--disabled):hover &__arrow {
        transform: translateX(3px);
        color: v.$color-primary;
      }

      &__badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: v.$radius-pill;
        background: v.$color-bg-subtle;
        border: 1px solid v.$color-border;
        font-size: v.$font-size-xs;
        font-weight: 600;
        color: v.$color-text-muted;
        width: fit-content;
      }
    }
  `],
})
export class AdminPanelComponent {
  readonly auth = inject(AuthService);

  readonly gestionCards: AdminCard[] = [
    {
      title: 'Gestión de Usuarios',
      description: 'Consulta todos los usuarios registrados y asigna roles (ciudadano, redactor, experto, editor, admin).',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
               <circle cx="9" cy="7" r="4"/>
               <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
               <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
             </svg>`,
      link: '/admin/usuarios',
    },
  ];

  readonly proximamenteCards: AdminCard[] = [
    {
      title: 'Moderación de Contenido',
      description: 'Revisa y modera hilos del foro, elimina contenido inapropiado y gestiona reportes de usuarios.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
             </svg>`,
      badge: 'Sprint 5',
    },
    {
      title: 'Métricas de Uso',
      description: 'Estadísticas de visitas, artículos más consultados, actividad del foro y participación ciudadana.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
               <line x1="6" y1="20" x2="6" y2="14"/>
             </svg>`,
      badge: 'Sprint 5',
    },
    {
      title: 'Gestión de Contenido',
      description: 'Publica actualizaciones constitucionales, gestiona versiones y administra taxonomías de categorías.',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
               <polyline points="14 2 14 8 20 8"/>
               <line x1="16" y1="13" x2="8" y2="13"/>
               <line x1="16" y1="17" x2="8" y2="17"/>
               <polyline points="10 9 9 9 8 9"/>
             </svg>`,
      badge: 'Sprint 6',
    },
  ];
}
