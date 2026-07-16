import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ExamenService } from '../../core/services/examen.service';
import { DetalleRespuesta, PreguntaExamen, ResultadoExamen, RespuestaIn } from '../../core/models/examen.models';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quiz">

      @if (cargando()) {
        <div class="quiz__loading">Cargando preguntas…</div>

      } @else if (resultado(); as r) {
        <!-- Pantalla de resultado -->
        <div class="quiz__resultado">
          <div class="quiz__resultado-top" [class.quiz__resultado-top--ok]="r.aprobado" [class.quiz__resultado-top--fail]="!r.aprobado">
            <span class="quiz__resultado-icono">{{ r.aprobado ? medallaEmoji() : '❌' }}</span>
            <h1 class="quiz__resultado-titulo">{{ r.aprobado ? '¡Aprobado!' : 'No aprobado' }}</h1>
            <p class="quiz__resultado-score">{{ r.puntaje }}/{{ r.total }} respuestas correctas</p>
            @if (r.aprobado) {
              <p class="quiz__resultado-medalla">Obtuviste la medalla de <strong>{{ medallaLabel() }}</strong></p>
            } @else {
              <p class="quiz__resultado-hint">Necesitas {{ 7 - r.puntaje }} respuestas más para aprobar. ¡Inténtalo de nuevo!</p>
            }
            @if (r.promovido) {
              <div class="quiz__promovido">
                ⭐ ¡Felicitaciones! Tu perfil ha ascendido a <strong>Experto Constitucional</strong>. Vuelve a iniciar sesión para que se refleje en tu perfil.
              </div>
            }
          </div>

          <!-- Detalle pregunta por pregunta -->
          <div class="quiz__detalle">
            <h2 class="quiz__detalle-title">Revisión de respuestas</h2>
            @for (d of r.detalle; track d.pregunta_id) {
              @let preg = preguntaPorId(d.pregunta_id);
              <div class="quiz__item" [class.quiz__item--ok]="d.correcta" [class.quiz__item--fail]="!d.correcta">
                <p class="quiz__item-pregunta">{{ preg?.pregunta }}</p>
                <p class="quiz__item-tu">Tu respuesta: <span [class.ok]="d.correcta" [class.fail]="!d.correcta">{{ preg?.opciones[d.opcion_elegida] }}</span></p>
                @if (!d.correcta) {
                  <p class="quiz__item-correcta">Correcta: <span class="ok">{{ preg?.opciones[d.opcion_correcta] }}</span></p>
                }
              </div>
            }
          </div>

          <div class="quiz__resultado-actions">
            <button class="btn btn--primary" (click)="reiniciar()">Repetir examen</button>
            <a routerLink="/examen" class="btn btn--ghost">Volver al inicio</a>
          </div>
        </div>

      } @else {
        <!-- Pantalla de pregunta -->
        <header class="quiz__header">
          <a routerLink="/examen" class="quiz__back">← Salir</a>
          <div class="quiz__meta">
            <span class="quiz__nivel">Nivel {{ nivel }}</span>
            <span class="quiz__progreso">{{ indice() + 1 }} / {{ preguntas().length }}</span>
          </div>
          <div class="quiz__barra">
            <div class="quiz__barra-fill" [style.width.%]="pct()"></div>
          </div>
        </header>

        @if (preguntaActual(); as p) {
          <div class="quiz__body">
            <p class="quiz__enunciado">{{ p.pregunta }}</p>
            <div class="quiz__opciones">
              @for (op of p.opciones; track $index) {
                <button
                  class="quiz__opcion"
                  [class.quiz__opcion--sel]="seleccionada() === $index"
                  (click)="seleccionar($index)"
                >
                  <span class="quiz__opcion-letra">{{ letras[$index] }}</span>
                  {{ op }}
                </button>
              }
            </div>
            <div class="quiz__nav">
              <button class="btn btn--ghost" [disabled]="indice() === 0" (click)="anterior()">← Anterior</button>
              @if (indice() < preguntas().length - 1) {
                <button class="btn btn--primary" [disabled]="seleccionada() === null" (click)="siguiente()">Siguiente →</button>
              } @else {
                <button class="btn btn--primary" [disabled]="!todasRespondidas() || enviando()" (click)="enviar()">
                  {{ enviando() ? 'Enviando…' : 'Entregar examen' }}
                </button>
              }
            </div>
            <p class="quiz__hint">{{ respuestas().filter(r => r !== null).length }} / {{ preguntas().length }} respondidas</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as v;

    .quiz { max-width: 720px; margin: 0 auto; padding: v.$spacing-xl; min-height: 80vh; display: flex; flex-direction: column; }
    .quiz__loading { flex: 1; display: flex; align-items: center; justify-content: center; color: v.$color-text-muted; font-size: v.$font-size-lg; }

    .quiz__header { margin-bottom: v.$spacing-xl; }
    .quiz__back { color: v.$color-primary; font-weight: 600; text-decoration: none; font-size: v.$font-size-sm; display: inline-block; margin-bottom: v.$spacing-md; }
    .quiz__meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: v.$spacing-sm; }
    .quiz__nivel { font-size: v.$font-size-xs; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: v.$color-text-muted; }
    .quiz__progreso { font-size: v.$font-size-sm; font-weight: 700; color: v.$color-primary; }
    .quiz__barra { height: 6px; background: v.$color-bg-subtle; border-radius: v.$radius-pill; overflow: hidden; }
    .quiz__barra-fill { height: 100%; background: v.$color-primary; border-radius: v.$radius-pill; transition: width 0.3s; }

    .quiz__body { flex: 1; display: flex; flex-direction: column; gap: v.$spacing-lg; }
    .quiz__enunciado { font-family: v.$font-family-base; font-size: v.$font-size-lg; font-weight: 600; color: v.$color-text-primary; line-height: 1.5; margin: 0; }
    .quiz__opciones { display: flex; flex-direction: column; gap: v.$spacing-sm; }
    .quiz__opcion {
      display: flex; align-items: flex-start; gap: v.$spacing-md; padding: v.$spacing-md;
      border: 1.5px solid v.$color-border; border-radius: v.$radius-md; background: white;
      text-align: left; cursor: pointer; font-size: v.$font-size-sm; font-family: v.$font-family-ui;
      line-height: 1.5; color: v.$color-text-primary; transition: border-color 0.15s, background 0.15s;
      &:hover { border-color: v.$color-primary; background: v.$color-primary-bg; }
      &--sel { border-color: v.$color-primary; background: v.$color-primary-bg; font-weight: 600; }
    }
    .quiz__opcion-letra { font-weight: 800; color: v.$color-primary; flex-shrink: 0; min-width: 18px; }
    .quiz__nav { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .quiz__hint { font-size: v.$font-size-xs; color: v.$color-text-muted; text-align: center; margin: 0; }

    // Resultado
    .quiz__resultado { display: flex; flex-direction: column; gap: v.$spacing-xl; }
    .quiz__resultado-top {
      text-align: center; padding: v.$spacing-xl; border-radius: v.$radius-lg; border: 2px solid;
      &--ok  { background: #f3faf5; border-color: rgba(39,174,96,0.4); }
      &--fail { background: #fdecea; border-color: rgba(192,57,43,0.3); }
    }
    .quiz__resultado-icono { font-size: 56px; display: block; line-height: 1; margin-bottom: v.$spacing-md; }
    .quiz__resultado-titulo { font-family: v.$font-family-base; font-size: v.$font-size-2xl; font-weight: 800; margin: 0 0 v.$spacing-sm; color: v.$color-text-primary; }
    .quiz__resultado-score { font-size: v.$font-size-lg; font-weight: 700; color: v.$color-text-primary; margin: 0 0 v.$spacing-xs; }
    .quiz__resultado-medalla { font-size: v.$font-size-base; color: v.$color-text-secondary; margin: 0; }
    .quiz__resultado-hint { font-size: v.$font-size-sm; color: v.$color-text-secondary; margin: 0; }
    .quiz__promovido {
      margin-top: v.$spacing-lg; padding: v.$spacing-md; background: #fdf6e3; border: 1px solid #C9A84C;
      border-radius: v.$radius-md; font-size: v.$font-size-sm; color: #8B6914;
    }

    .quiz__detalle { display: flex; flex-direction: column; gap: v.$spacing-sm; }
    .quiz__detalle-title { font-size: v.$font-size-base; font-weight: 700; color: v.$color-text-primary; margin: 0 0 v.$spacing-sm; }
    .quiz__item {
      padding: v.$spacing-md; border-radius: v.$radius-md; border-left: 4px solid v.$color-border;
      background: v.$color-bg-subtle;
      &--ok   { border-left-color: #27AE60; }
      &--fail { border-left-color: #C0392B; }
      p { margin: 0 0 4px; font-size: v.$font-size-sm; }
    }
    .quiz__item-pregunta { font-weight: 600; color: v.$color-text-primary; }
    .quiz__item-tu, .quiz__item-correcta { color: v.$color-text-secondary; }
    .ok   { color: #1a7a40; font-weight: 600; }
    .fail { color: #922B21; font-weight: 600; text-decoration: line-through; }

    .quiz__resultado-actions { display: flex; gap: v.$spacing-md; justify-content: center; flex-wrap: wrap; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: v.$spacing-xs;
      padding: 10px v.$spacing-lg; border-radius: v.$radius-md; font-size: v.$font-size-sm; font-weight: 700;
      cursor: pointer; border: 1px solid transparent; font-family: v.$font-family-ui; text-decoration: none;
      &--primary { background: v.$color-primary; color: white; border-color: v.$color-primary;
        &:hover:not(:disabled) { background: v.$color-primary-dark; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
      &--ghost { background: transparent; border-color: v.$color-border; color: v.$color-text-secondary;
        &:hover:not(:disabled) { background: v.$color-bg-subtle; } &:disabled { opacity: 0.5; cursor: not-allowed; } }
    }
  `],
})
export class QuizComponent implements OnInit {
  private readonly svc = inject(ExamenService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly letras = ['A', 'B', 'C', 'D'];
  nivel = 1;

  readonly cargando = signal(true);
  readonly preguntas = signal<PreguntaExamen[]>([]);
  readonly indice = signal(0);
  readonly respuestas = signal<(number | null)[]>([]);
  readonly enviando = signal(false);
  readonly resultado = signal<ResultadoExamen | null>(null);

  readonly preguntaActual = computed(() => this.preguntas()[this.indice()] ?? null);
  readonly seleccionada = computed(() => this.respuestas()[this.indice()] ?? null);
  readonly pct = computed(() => this.preguntas().length ? ((this.indice() + 1) / this.preguntas().length) * 100 : 0);
  readonly todasRespondidas = computed(() => this.respuestas().every(r => r !== null));

  ngOnInit(): void {
    this.nivel = Number(this.route.snapshot.paramMap.get('nivel')) || 1;
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.resultado.set(null);
    this.svc.getPreguntas(this.nivel).subscribe({
      next: ps => {
        this.preguntas.set(ps);
        this.respuestas.set(new Array(ps.length).fill(null));
        this.indice.set(0);
        this.cargando.set(false);
      },
    });
  }

  seleccionar(opcion: number): void {
    this.respuestas.update(rs => {
      const copia = [...rs];
      copia[this.indice()] = opcion;
      return copia;
    });
  }

  siguiente(): void { if (this.indice() < this.preguntas().length - 1) this.indice.update(i => i + 1); }
  anterior(): void { if (this.indice() > 0) this.indice.update(i => i - 1); }

  enviar(): void {
    const respuestas: RespuestaIn[] = this.preguntas().map((p, i) => ({
      pregunta_id: p.id,
      opcion: this.respuestas()[i] as number,
    }));
    this.enviando.set(true);
    this.svc.enviar(this.nivel, respuestas).subscribe({
      next: r => { this.resultado.set(r); this.enviando.set(false); },
      error: () => this.enviando.set(false),
    });
  }

  reiniciar(): void { this.cargar(); }

  preguntaPorId(id: number): PreguntaExamen | undefined {
    return this.preguntas().find(p => p.id === id);
  }

  medallaEmoji(): string {
    return this.nivel === 1 ? '🥉' : this.nivel === 2 ? '🥈' : '🥇';
  }

  medallaLabel(): string {
    return this.nivel === 1 ? 'Bronce' : this.nivel === 2 ? 'Plata' : 'Oro';
  }
}
