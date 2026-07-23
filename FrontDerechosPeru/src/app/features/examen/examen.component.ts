import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExamenService } from '../../core/services/examen.service';
import { NivelProgreso, ProgresoExamen } from '../../core/models/examen.models';

const NIVELES = [
  { nivel: 1, nombre: 'Básico', descripcion: 'Preguntas generales sobre la Constitución de 1993: promulgación, estructura y principios fundamentales.', medalla: '🥉', color: 'bronce' },
  { nivel: 2, nombre: 'Intermedio', descripcion: 'Derechos fundamentales, garantías constitucionales y organización del Estado.', medalla: '🥈', color: 'plata' },
  { nivel: 3, nombre: 'Avanzado', descripcion: 'Hermenéutica constitucional, jerarquía normativa y diferencias entre constituciones. Al aprobar obtendrás el rol de Experto.', medalla: '🥇', color: 'oro' },
];

@Component({
  selector: 'app-examen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ex">
      <header class="ex__header">
        <h1 class="ex__title">Examen Constitucional</h1>
        <p class="ex__sub">Pon a prueba tu conocimiento sobre la Constitución Política del Perú. Aprueba los 3 niveles para obtener el rango de <strong>Experto</strong>.</p>
      </header>

      @if (progreso()?.es_experto) {
        <div class="ex__experto">
          <span class="ex__experto-badge">⭐ Experto Constitucional</span>
          <p>Has completado los 3 niveles del examen. Tu perfil ahora refleja el rango de Experto.</p>
        </div>
      }

      <div class="ex__niveles">
        @for (n of NIVELES; track n.nivel) {
          @let aprobado = nivelAprobado(n.nivel);
          @let bloqueado = n.nivel > 1 && !nivelAprobado(n.nivel - 1);
          <div class="ex__card" [class.ex__card--aprobado]="aprobado" [class.ex__card--bloqueado]="bloqueado" [attr.data-color]="n.color">
            <div class="ex__card-top">
              <span class="ex__medalla">{{ aprobado ? n.medalla : (bloqueado ? '🔒' : '○') }}</span>
              <div>
                <span class="ex__nivel-tag">Nivel {{ n.nivel }}</span>
                <h2 class="ex__nivel-nombre">{{ n.nombre }}</h2>
              </div>
            </div>
            <p class="ex__nivel-desc">{{ n.descripcion }}</p>
            @if (aprobado) {
              @let prog = nivelProgreso(n.nivel);
              <div class="ex__resultado">
                <span class="ex__resultado-score">{{ prog?.puntaje }}/10 — Aprobado</span>
              </div>
            }
            <button
              class="ex__btn"
              [disabled]="bloqueado"
              (click)="iniciar(n.nivel)"
            >
              {{ aprobado ? 'Repetir examen' : (bloqueado ? 'Bloqueado' : 'Iniciar examen') }}
            </button>
          </div>
        }
      </div>

      <div class="ex__reglas">
        <h3 class="ex__reglas-title">Reglas del examen</h3>
        <ul>
          <li>Cada nivel tiene <strong>10 preguntas</strong> de selección múltiple.</li>
          <li>Se necesita un mínimo de <strong>7 respuestas correctas</strong> para aprobar.</li>
          <li>Los niveles se desbloquean progresivamente.</li>
          <li>Puedes repetir los exámenes las veces que quieras.</li>
          <li>Al aprobar el <strong>Nivel 3</strong> tu perfil ascenderá a <strong>Experto</strong>.</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    @use '../../../styles/variables' as v;

    .ex { max-width: 860px; margin: 0 auto; padding: v.$spacing-xl; display: flex; flex-direction: column; gap: v.$spacing-xl; }

    .ex__header { text-align: center; }
    .ex__title { font-family: v.$font-family-base; font-size: v.$font-size-2xl; font-weight: 800; color: v.$color-text-primary; margin: 0 0 v.$spacing-sm; }
    .ex__sub { font-size: v.$font-size-base; color: v.$color-text-secondary; margin: 0; }

    .ex__experto {
      background: linear-gradient(135deg, #fdf6e3, #fef9ec);
      border: 2px solid #C9A84C; border-radius: v.$radius-lg; padding: v.$spacing-lg; text-align: center;
      p { margin: v.$spacing-xs 0 0; color: v.$color-text-secondary; font-size: v.$font-size-sm; }
    }
    .ex__experto-badge { font-size: v.$font-size-lg; font-weight: 800; color: #8B6914; }

    .ex__niveles { display: grid; grid-template-columns: repeat(3, 1fr); gap: v.$spacing-lg;
      @media (max-width: 720px) { grid-template-columns: 1fr; }
    }

    .ex__card {
      background: white; border: 1.5px solid v.$color-border; border-radius: v.$radius-lg;
      padding: v.$spacing-lg; display: flex; flex-direction: column; gap: v.$spacing-md;
      box-shadow: v.$shadow-card; transition: transform 0.15s, box-shadow 0.15s;
      &:hover:not(.ex__card--bloqueado) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.1); }
      &--aprobado { border-color: #27AE60; background: #f3faf5; }
      &--bloqueado { opacity: 0.55; }
      &[data-color="bronce"] .ex__nivel-tag { background: #fdf0dc; color: #8B5E14; border-color: #e8c87a; }
      &[data-color="plata"]  .ex__nivel-tag { background: #f0f2f5; color: #4A5568; border-color: #A0AEC0; }
      &[data-color="oro"]    .ex__nivel-tag { background: #fdf6e3; color: #8B6914; border-color: #C9A84C; }
    }
    .ex__card-top { display: flex; align-items: center; gap: v.$spacing-md; }
    .ex__medalla { font-size: 36px; line-height: 1; flex-shrink: 0; }
    .ex__nivel-tag { display: inline-block; font-size: 11px; font-weight: 700; border: 1px solid; border-radius: v.$radius-pill; padding: 2px 8px; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
    .ex__nivel-nombre { font-family: v.$font-family-base; font-size: v.$font-size-lg; font-weight: 700; color: v.$color-text-primary; margin: 0; }
    .ex__nivel-desc { font-size: v.$font-size-sm; color: v.$color-text-secondary; line-height: 1.6; margin: 0; flex: 1; }
    .ex__resultado { background: rgba(39,174,96,0.1); border-radius: v.$radius-sm; padding: 6px 10px; }
    .ex__resultado-score { font-size: v.$font-size-sm; font-weight: 700; color: #1a7a40; }
    .ex__btn {
      padding: 10px v.$spacing-md; border-radius: v.$radius-md; font-size: v.$font-size-sm; font-weight: 700;
      font-family: v.$font-family-ui; cursor: pointer; border: none; background: v.$color-primary; color: white;
      transition: background 0.15s;
      &:hover:not(:disabled) { background: v.$color-primary-dark; }
      &:disabled { background: v.$color-bg-subtle; color: v.$color-text-muted; cursor: not-allowed; }
    }

    .ex__reglas {
      background: v.$color-bg-subtle; border: 1px solid v.$color-border; border-radius: v.$radius-md; padding: v.$spacing-lg;
      h3 { margin: 0 0 v.$spacing-sm; font-size: v.$font-size-base; font-weight: 700; color: v.$color-text-primary; }
      ul { margin: 0; padding-left: v.$spacing-lg; display: flex; flex-direction: column; gap: 6px; }
      li { font-size: v.$font-size-sm; color: v.$color-text-secondary; line-height: 1.5; }
    }
  `],
})
export class ExamenComponent implements OnInit {
  private readonly svc = inject(ExamenService);
  private readonly router = inject(Router);

  readonly NIVELES = NIVELES;
  readonly progreso = signal<ProgresoExamen | null>(null);

  ngOnInit(): void {
    this.svc.getProgreso().subscribe({ next: p => this.progreso.set(p) });
  }

  nivelAprobado(nivel: number): boolean {
    return this.progreso()?.niveles.some(n => n.nivel === nivel) ?? false;
  }

  nivelProgreso(nivel: number): NivelProgreso | undefined {
    return this.progreso()?.niveles.find(n => n.nivel === nivel);
  }

  iniciar(nivel: number): void {
    this.router.navigate(['/constitucion/examen/quiz', nivel]);
  }
}
