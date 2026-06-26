import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IngestaService } from '../../../core/services/ingesta.service';
import { DraftArticulo, Progreso } from '../../../core/models/ingesta.models';
import { MarkdownEditorComponent } from '../../../shared/components/markdown-editor/markdown-editor.component';

@Component({
  selector: 'app-revision',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MarkdownEditorComponent],
  template: `
    <div class="rev">
      <header class="rev__bar">
        <a routerLink="/admin/ingesta" class="rev__back">← Ingesta</a>
        <div class="rev__progress">
          <div class="bar"><div class="bar__fill" [style.width.%]="progreso()?.pct ?? 0"></div></div>
          <span class="rev__pct">
            {{ progreso()?.verificados ?? 0 }}/{{ progreso()?.total ?? 0 }} verificados
            @if ((progreso()?.observados ?? 0) > 0) { · {{ progreso()?.observados }} observados }
          </span>
        </div>
        <button class="btn btn--primary" [disabled]="!puedePublicar() || publicando()" (click)="publicar()">
          {{ publicando() ? 'Publicando…' : 'Publicar versión' }}
        </button>
      </header>

      @if (publicado()) {
        <div class="rev__published">✓ Versión publicada. Ya puede compararse con otras versiones.</div>
      }

      <div class="rev__panels">
        <!-- PDF fuente -->
        <section class="rev__pdf">
          @if (pdfUrl(); as url) {
            <iframe [src]="url" title="PDF fuente" class="rev__iframe"></iframe>
          } @else {
            <p class="muted muted--pad">Cargando PDF…</p>
          }
        </section>

        <!-- Artículos extraídos -->
        <section class="rev__list">
          @if (cargando()) {
            <p class="muted muted--pad">Cargando artículos…</p>
          } @else {
            @for (a of articulos(); track a.id) {
              <article class="art" [attr.data-status]="a.review_status">
                <div class="art__head">
                  <span class="art__num">Art. {{ a.numero }}</span>
                  <span class="chip chip--{{ a.review_status }}">{{ a.review_status }}</span>
                </div>
                <app-markdown-editor [(value)]="a.contenido" [rows]="6" />
                <div class="art__actions">
                  <button class="btn btn--verify" (click)="marcar(a, 'verificado')">✓ Verificar</button>
                  <button class="btn btn--observe" (click)="marcar(a, 'observado')">⚑ Observar</button>
                  <span class="art__hint">Edita el texto si la extracción tiene errores antes de verificar.</span>
                </div>
              </article>
            }
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .rev { height: 100vh; display: flex; flex-direction: column; background: v.$color-bg-subtle; }

    .rev__bar {
      display: flex; align-items: center; gap: v.$spacing-md;
      padding: v.$spacing-sm v.$spacing-lg; background: white; border-bottom: 1px solid v.$color-border;
    }
    .rev__back { color: v.$color-primary; font-weight: 600; text-decoration: none; font-size: v.$font-size-sm; white-space: nowrap; }
    .rev__progress { flex: 1; display: flex; align-items: center; gap: v.$spacing-sm; }
    .rev__pct { font-size: v.$font-size-xs; color: v.$color-text-muted; white-space: nowrap; }
    .bar { flex: 1; height: 8px; background: v.$color-bg-subtle; border-radius: v.$radius-pill; overflow: hidden; max-width: 360px; }
    .bar__fill { height: 100%; background: #27AE60; transition: width 0.3s; }

    .rev__published { background: #f3faf5; color: #1a7a40; padding: v.$spacing-sm v.$spacing-lg; font-weight: 600; font-size: v.$font-size-sm; border-bottom: 1px solid rgba(39,174,96,0.3); }

    .rev__panels { flex: 1; display: grid; grid-template-columns: 1fr 1fr; min-height: 0; }
    .rev__pdf { border-right: 1px solid v.$color-border; background: #525659; }
    .rev__iframe { width: 100%; height: 100%; border: 0; }
    .rev__list { overflow-y: auto; padding: v.$spacing-md; display: flex; flex-direction: column; gap: v.$spacing-md; }

    @media (max-width: 768px) {
      .rev { height: auto; }
      .rev__panels { grid-template-columns: 1fr; }
      .rev__pdf { height: 60vh; border-right: 0; border-bottom: 1px solid v.$color-border; }
    }

    .muted { color: v.$color-text-muted; font-size: v.$font-size-sm; }
    .muted--pad { padding: v.$spacing-lg; }

    .art {
      background: white; border: 1px solid v.$color-border; border-left: 4px solid v.$color-border;
      border-radius: v.$radius-md; padding: v.$spacing-md; display: flex; flex-direction: column; gap: v.$spacing-sm;
      &[data-status="verificado"] { border-left-color: #27AE60; }
      &[data-status="observado"] { border-left-color: #C0392B; }
      &__head { display: flex; align-items: center; justify-content: space-between; }
      &__num { font-weight: 700; color: v.$color-text-primary; font-family: v.$font-family-base; }
      &__text { width: 100%; border: 1.5px solid v.$color-border; border-radius: v.$radius-sm; padding: v.$spacing-sm;
        font-size: v.$font-size-sm; font-family: v.$font-family-ui; line-height: 1.5; resize: vertical; outline: none;
        &:focus { border-color: v.$color-primary; box-shadow: 0 0 0 3px v.$color-primary-bg; } }
      &__actions { display: flex; align-items: center; gap: v.$spacing-sm; flex-wrap: wrap; }
      &__hint { font-size: v.$font-size-xs; color: v.$color-text-muted; }
    }

    .chip {
      padding: 2px 8px; border-radius: v.$radius-pill; font-size: 11px; font-weight: 700; text-transform: capitalize;
      &--pendiente { background: v.$color-bg-subtle; color: v.$color-text-muted; border: 1px solid v.$color-border; }
      &--verificado { background: #f3faf5; color: #1a7a40; border: 1px solid rgba(39,174,96,0.3); }
      &--observado { background: #fdecea; color: #922B21; border: 1px solid rgba(192,57,43,0.3); }
    }

    .btn {
      display: inline-flex; align-items: center; gap: 4px; padding: 7px v.$spacing-md; border-radius: v.$radius-md;
      font-size: v.$font-size-sm; font-weight: 600; cursor: pointer; border: 1px solid transparent; font-family: v.$font-family-ui;
      &--primary { background: v.$color-primary; color: white; &:hover:not(:disabled) { background: v.$color-primary-dark; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
      &--verify { background: #eaf6ec; color: #1a7a40; border-color: rgba(39,174,96,0.4); &:hover { background: #d8f0dd; } }
      &--observe { background: #fdecea; color: #922B21; border-color: rgba(192,57,43,0.3); &:hover { background: #fbd9d5; } }
    }
  `],
})
export class RevisionComponent implements OnInit {
  private readonly svc = inject(IngestaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  private versionId = 0;
  readonly articulos = signal<DraftArticulo[]>([]);
  readonly progreso = signal<Progreso | null>(null);
  readonly pdfUrl = signal<SafeResourceUrl | null>(null);
  readonly cargando = signal(true);
  readonly publicando = signal(false);
  readonly publicado = signal(false);

  readonly puedePublicar = computed(() => (this.progreso()?.pct ?? 0) === 100);

  ngOnInit(): void {
    this.versionId = Number(this.route.snapshot.paramMap.get('versionId'));
    this.cargar();
    this.refrescarProgreso();
    this.svc.getPdfUrl(this.versionId).subscribe({
      next: ({ url }) => this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url)),
    });
  }

  private cargar(): void {
    this.cargando.set(true);
    this.svc.getArticulos(this.versionId).subscribe({
      next: arts => { this.articulos.set(arts); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  private refrescarProgreso(): void {
    this.svc.getProgreso(this.versionId).subscribe({ next: p => this.progreso.set(p) });
  }

  marcar(a: DraftArticulo, estado: 'verificado' | 'observado'): void {
    this.svc.revisar(a.id, estado, a.contenido).subscribe({
      next: updated => {
        this.articulos.update(list => list.map(x => (x.id === a.id ? { ...x, review_status: updated.review_status } : x)));
        this.refrescarProgreso();
      },
    });
  }

  publicar(): void {
    if (!this.puedePublicar()) return;
    this.publicando.set(true);
    this.svc.publicar(this.versionId).subscribe({
      next: () => { this.publicando.set(false); this.publicado.set(true); },
      error: err => { this.publicando.set(false); alert(err.error?.detail || 'No se pudo publicar.'); },
    });
  }
}
