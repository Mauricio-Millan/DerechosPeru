import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IngestaService } from '../../../core/services/ingesta.service';
import { ConstitutionVersion, IngestResult } from '../../../core/models/ingesta.models';

@Component({
  selector: 'app-ingesta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="ingesta">
      <header class="ingesta__header">
        <a routerLink="/admin" class="ingesta__back">← Panel Admin</a>
        <h1 class="ingesta__title">Ingesta de Constituciones</h1>
        <p class="ingesta__subtitle">
          Sube el PDF de una constitución, revísalo contra el documento y publícalo como una versión comparable.
        </p>
      </header>

      <main class="ingesta__main">
        <!-- Formulario de subida -->
        <section class="card">
          <h2 class="card__title">Subir nueva constitución (PDF)</h2>
          <form class="form" (ngSubmit)="subir()">
            <label class="form__field">
              <span>Nombre / etiqueta *</span>
              <input [(ngModel)]="label" name="label" type="text"
                     placeholder="Ej. Constitución Política del Perú de 1979" required />
            </label>
            <div class="form__row">
              <label class="form__field">
                <span>Año *</span>
                <input [(ngModel)]="year" name="year" type="number" min="1800" max="2100" required />
              </label>
              <label class="form__field">
                <span>Promulgación (opcional)</span>
                <input [(ngModel)]="promulgatedOn" name="promulgatedOn" type="date" />
              </label>
            </div>
            <label class="form__field">
              <span>Archivo PDF *</span>
              <input type="file" accept="application/pdf" (change)="onFile($event)" required />
            </label>

            @if (error()) { <p class="form__error">{{ error() }}</p> }

            <div class="form__actions">
              <button type="submit" class="btn btn--primary" [disabled]="subiendo()">
                {{ subiendo() ? 'Procesando…' : 'Subir y extraer' }}
              </button>
            </div>
          </form>

          @if (resultado(); as r) {
            <div class="result" [class.result--warn]="!r.qa.ok">
              <h3 class="result__title">Extracción completada</h3>
              <p class="result__stats">
                {{ r.stats['titulos'] }} títulos · {{ r.stats['capitulos'] }} capítulos · {{ r.stats['articulos'] }} artículos
              </p>
              @if (r.qa.ok) {
                <p class="result__ok">✓ QA estructural sin observaciones</p>
              } @else {
                <p class="result__warn-title">⚠ QA detectó {{ r.qa.errors.length }} observación(es):</p>
                <ul class="result__errors">
                  @for (e of r.qa.errors; track e) { <li>{{ e }}</li> }
                </ul>
              }
              <a [routerLink]="['/admin/ingesta', r.version_id, 'revisar']" class="btn btn--primary">
                Revisar contra el PDF →
              </a>
            </div>
          }
        </section>

        <!-- Versiones existentes -->
        <section class="card">
          <h2 class="card__title">Versiones</h2>
          @if (cargando()) {
            <p class="muted">Cargando…</p>
          } @else if (versiones().length === 0) {
            <p class="muted">Todavía no hay versiones ingeridas.</p>
          } @else {
            <div class="versiones">
              @for (v of versiones(); track v.id) {
                <article class="version">
                  <div class="version__info">
                    <div class="version__head">
                      <span class="version__year">{{ v.year }}</span>
                      <span class="version__label">{{ v.label }}</span>
                      <span class="badge" [attr.data-status]="v.status">{{ v.status }}</span>
                      @if (v.is_current) { <span class="badge badge--current">vigente</span> }
                    </div>
                    @if (v.total_articulos > 0) {
                      <div class="version__progress">
                        <div class="bar"><div class="bar__fill" [style.width.%]="pct(v)"></div></div>
                        <span class="version__pct">{{ v.verificados }}/{{ v.total_articulos }} verificados</span>
                      </div>
                    }
                  </div>
                  <div class="version__actions">
                    @if (v.status !== 'publicada') {
                      <a [routerLink]="['/admin/ingesta', v.id, 'revisar']" class="btn btn--ghost">Revisar</a>
                    }
                    @if (!v.is_current) {
                      <button class="btn btn--danger" (click)="borrarVersion(v)">Eliminar</button>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </main>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .ingesta { min-height: 100vh; background: v.$color-bg-subtle; }

    .ingesta__header {
      background: v.$color-primary;
      padding: v.$spacing-xl;
      display: flex; flex-direction: column; gap: v.$spacing-xs;
    }
    .ingesta__back { color: rgba(255,255,255,0.7); font-size: v.$font-size-sm; text-decoration: none; width: fit-content; &:hover { color: white; } }
    .ingesta__title { margin: 0; color: white; font-family: v.$font-family-base; font-size: v.$font-size-2xl; font-weight: 700; }
    .ingesta__subtitle { margin: 0; color: rgba(255,255,255,0.7); font-size: v.$font-size-sm; max-width: 640px; }

    .ingesta__main {
      max-width: 860px; margin: 0 auto; padding: v.$spacing-xl;
      display: flex; flex-direction: column; gap: v.$spacing-lg;
    }

    .card {
      background: white; border: 1px solid v.$color-border; border-radius: v.$radius-lg;
      padding: v.$spacing-xl; box-shadow: v.$shadow-card;
      &__title { margin: 0 0 v.$spacing-lg; font-size: v.$font-size-lg; font-weight: 600; color: v.$color-text-primary; }
    }

    .form { display: flex; flex-direction: column; gap: v.$spacing-md; }
    .form__row { display: grid; grid-template-columns: 1fr 1fr; gap: v.$spacing-md; @media (max-width: 540px) { grid-template-columns: 1fr; } }
    .form__field { display: flex; flex-direction: column; gap: v.$spacing-xs;
      span { font-size: v.$font-size-xs; font-weight: 600; color: v.$color-text-secondary; text-transform: uppercase; letter-spacing: 0.04em; }
      input { padding: 10px v.$spacing-sm; border: 1.5px solid v.$color-border; border-radius: v.$radius-md; font-size: v.$font-size-base; font-family: v.$font-family-ui; outline: none;
        &:focus { border-color: v.$color-primary; box-shadow: 0 0 0 3px v.$color-primary-bg; } }
    }
    .form__error { margin: 0; color: #b3261e; font-size: v.$font-size-sm; }
    .form__actions { display: flex; justify-content: flex-end; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 10px v.$spacing-md; border-radius: v.$radius-md; font-size: v.$font-size-sm; font-weight: 600;
      cursor: pointer; border: 1px solid transparent; text-decoration: none; font-family: v.$font-family-ui;
      &--primary { background: v.$color-primary; color: white; &:hover:not(:disabled) { background: v.$color-primary-dark; } &:disabled { opacity: 0.6; cursor: not-allowed; } }
      &--ghost { background: transparent; border-color: v.$color-border; color: v.$color-text-secondary; &:hover { background: v.$color-bg-subtle; color: v.$color-text-primary; } }
      &--danger { background: #fdecea; color: #922B21; border-color: rgba(192,57,43,0.3); &:hover { background: #fbd9d5; } }
    }

    .result {
      margin-top: v.$spacing-lg; padding: v.$spacing-lg; border-radius: v.$radius-md;
      background: #f3faf5; border: 1px solid rgba(39,174,96,0.3);
      display: flex; flex-direction: column; gap: v.$spacing-sm; align-items: flex-start;
      &--warn { background: #fff8ed; border-color: rgba(201,168,76,0.5); }
      &__title { margin: 0; font-size: v.$font-size-base; font-weight: 700; color: v.$color-text-primary; }
      &__stats { margin: 0; font-size: v.$font-size-sm; color: v.$color-text-secondary; }
      &__ok { margin: 0; color: #1a7a40; font-weight: 600; font-size: v.$font-size-sm; }
      &__warn-title { margin: 0; color: #8b6914; font-weight: 600; font-size: v.$font-size-sm; }
      &__errors { margin: 0; padding-left: v.$spacing-lg; font-size: v.$font-size-xs; color: v.$color-text-secondary; max-height: 160px; overflow-y: auto; }
    }

    .muted { color: v.$color-text-muted; font-size: v.$font-size-sm; }

    .versiones { display: flex; flex-direction: column; gap: v.$spacing-sm; }
    .version {
      display: flex; align-items: center; justify-content: space-between; gap: v.$spacing-md;
      padding: v.$spacing-md; border: 1px solid v.$color-border; border-radius: v.$radius-md;
      &__info { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
      &__head { display: flex; align-items: center; gap: v.$spacing-sm; flex-wrap: wrap; }
      &__year { font-weight: 700; color: v.$color-primary; font-family: v.$font-family-base; }
      &__label { color: v.$color-text-primary; font-size: v.$font-size-sm; }
      &__progress { display: flex; align-items: center; gap: v.$spacing-sm; }
      &__pct { font-size: v.$font-size-xs; color: v.$color-text-muted; white-space: nowrap; }
      &__actions { display: flex; gap: v.$spacing-sm; flex-shrink: 0; }
    }
    .bar { flex: 1; height: 6px; background: v.$color-bg-subtle; border-radius: v.$radius-pill; overflow: hidden; max-width: 240px; }
    .bar__fill { height: 100%; background: #27AE60; transition: width 0.3s; }

    .badge {
      padding: 2px 8px; border-radius: v.$radius-pill; font-size: 11px; font-weight: 700;
      background: v.$color-bg-subtle; border: 1px solid v.$color-border; color: v.$color-text-muted; text-transform: capitalize;
      &[data-status="borrador"] { background: #fff8ed; color: #8b6914; border-color: rgba(201,168,76,0.4); }
      &[data-status="publicada"] { background: #f3faf5; color: #1a7a40; border-color: rgba(39,174,96,0.3); }
      &--current { background: v.$color-primary-bg; color: v.$color-primary; border-color: rgba(139,32,32,0.2); }
    }
  `],
})
export class IngestaComponent implements OnInit {
  private readonly svc = inject(IngestaService);
  private readonly router = inject(Router);

  readonly versiones = signal<ConstitutionVersion[]>([]);
  readonly cargando = signal(true);
  readonly subiendo = signal(false);
  readonly error = signal('');
  readonly resultado = signal<IngestResult | null>(null);

  label = '';
  year: number | null = null;
  promulgatedOn = '';
  private file: File | null = null;

  ngOnInit(): void {
    this.cargarVersiones();
  }

  cargarVersiones(): void {
    this.cargando.set(true);
    this.svc.getVersiones().subscribe({
      next: vs => { this.versiones.set(vs); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
  }

  pct(v: ConstitutionVersion): number {
    return v.total_articulos ? Math.round((v.verificados / v.total_articulos) * 100) : 0;
  }

  borrarVersion(v: ConstitutionVersion): void {
    if (!confirm(`¿Eliminar "${v.label} (${v.year})"? Esta acción no se puede deshacer.`)) return;
    this.svc.borrarVersion(v.id).subscribe({
      next: () => this.cargarVersiones(),
      error: err => alert(err.error?.detail || 'No se pudo eliminar la versión.'),
    });
  }

  subir(): void {
    this.error.set('');
    if (!this.label.trim() || !this.year || !this.file) {
      this.error.set('Completa el nombre, el año y selecciona un PDF.');
      return;
    }
    this.subiendo.set(true);
    this.svc.ingest(this.file, this.label.trim(), this.year, this.promulgatedOn || undefined).subscribe({
      next: r => {
        this.resultado.set(r);
        this.subiendo.set(false);
        this.cargarVersiones();
      },
      error: err => {
        this.subiendo.set(false);
        this.error.set(err.error?.detail || 'No se pudo procesar el PDF.');
      },
    });
  }
}
