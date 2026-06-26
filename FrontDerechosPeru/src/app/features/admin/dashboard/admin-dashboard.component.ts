import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Analytics } from '../../../core/models/analytics.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash">
      <h1 class="dash__title">Analítica del portal</h1>
      <p class="dash__subtitle">Métricas sobre el uso real del conocimiento. Detecta qué se consulta y qué falta.</p>

      @if (cargando()) {
        <p class="dash__muted">Cargando métricas…</p>
      } @else if (error()) {
        <p class="dash__error">{{ error() }}</p>
      } @else if (data(); as d) {
        <!-- Resumen -->
        <div class="dash__kpis">
          <div class="kpi"><span class="kpi__num">{{ d.resumen.total_usuarios }}</span><span class="kpi__label">Usuarios</span></div>
          <div class="kpi"><span class="kpi__num">{{ d.resumen.total_consultas }}</span><span class="kpi__label">Consultas</span></div>
          <div class="kpi kpi--warn"><span class="kpi__num">{{ d.resumen.consultas_fallidas }}</span><span class="kpi__label">Sin éxito</span></div>
          <div class="kpi"><span class="kpi__num">{{ d.resumen.total_hilos }}</span><span class="kpi__label">Hilos foro</span></div>
          <div class="kpi"><span class="kpi__num">{{ d.resumen.respuestas_verificadas }}</span><span class="kpi__label">Resp. verificadas</span></div>
          <div class="kpi"><span class="kpi__num">{{ d.resumen.total_guardados }}</span><span class="kpi__label">Guardados</span></div>
        </div>

        <div class="dash__cols">
          <!-- Top artículos consultados -->
          <section class="card">
            <h2 class="card__title">Artículos más consultados</h2>
            <p class="card__hint">Según las consultas guiadas de los ciudadanos.</p>
            @if (d.top_articulos.length === 0) {
              <p class="dash__muted">Aún no hay consultas registradas.</p>
            } @else {
              @for (a of d.top_articulos; track a.id) {
                <div class="bar-row">
                  <span class="bar-row__label">Art. {{ a.numero }}@if (a.sumilla) { · {{ a.sumilla }} }</span>
                  <div class="bar-row__track">
                    <div class="bar-row__fill" [style.width.%]="pct(a.consultas)"></div>
                  </div>
                  <span class="bar-row__val">{{ a.consultas }}</span>
                </div>
              }
            }
          </section>

          <!-- Búsquedas sin éxito = vacíos de conocimiento -->
          <section class="card">
            <h2 class="card__title">Vacíos de conocimiento</h2>
            <p class="card__hint">Búsquedas sin resultados relevantes ({{ d.total_fallidas }} en total). Pistas de qué contenido falta.</p>
            @if (d.busquedas_fallidas.length === 0) {
              <p class="dash__muted">No hay búsquedas sin éxito. 🎉</p>
            } @else {
              <ul class="gaps">
                @for (b of d.busquedas_fallidas; track $index) {
                  <li class="gaps__item">
                    <span class="gaps__q">{{ b.query_text }}</span>
                    <span class="gaps__date">{{ b.created_at | date: 'dd/MM/yy' }}</span>
                  </li>
                }
              </ul>
            }
          </section>
        </div>

        <!-- Usuarios por rol -->
        <section class="card">
          <h2 class="card__title">Usuarios por rol</h2>
          <div class="roles">
            @for (r of d.usuarios_por_rol; track r.rol) {
              <div class="roles__item"><span class="roles__num">{{ r.total }}</span><span class="roles__rol">{{ r.rol }}</span></div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .dash { padding: v.$spacing-lg; max-width: 1000px; margin: 0 auto; font-family: v.$font-family-ui; }
    .dash__title { font-family: v.$font-family-base; font-size: v.$font-size-2xl; color: v.$color-primary; margin: 0 0 v.$spacing-xs; }
    .dash__subtitle { color: v.$color-text-secondary; margin: 0 0 v.$spacing-lg; }
    .dash__muted { color: v.$color-text-muted; font-size: v.$font-size-sm; }
    .dash__error { color: v.$color-primary-dark; background: #FDECEA; padding: v.$spacing-md; border-radius: v.$radius-md; }

    .dash__kpis { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: v.$spacing-md; margin-bottom: v.$spacing-lg; }
    .kpi { background: white; border: 1px solid v.$color-border; border-radius: v.$radius-md; padding: v.$spacing-md; display: flex; flex-direction: column; box-shadow: v.$shadow-card; }
    .kpi--warn .kpi__num { color: #B8730A; }
    .kpi__num { font-size: v.$font-size-2xl; font-weight: 700; color: v.$color-primary; line-height: 1; }
    .kpi__label { font-size: v.$font-size-xs; color: v.$color-text-muted; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }

    .dash__cols { display: grid; grid-template-columns: 1fr 1fr; gap: v.$spacing-md; margin-bottom: v.$spacing-lg; }
    @media (max-width: 800px) { .dash__cols { grid-template-columns: 1fr; } }

    .card { background: white; border: 1px solid v.$color-border; border-radius: v.$radius-lg; padding: v.$spacing-lg; box-shadow: v.$shadow-card; }
    .card__title { font-size: v.$font-size-md; font-weight: 700; color: v.$color-text-primary; margin: 0 0 v.$spacing-xs; }
    .card__hint { font-size: v.$font-size-sm; color: v.$color-text-muted; margin: 0 0 v.$spacing-md; }

    .bar-row { display: grid; grid-template-columns: 1fr 120px auto; align-items: center; gap: v.$spacing-sm; margin-bottom: v.$spacing-sm; }
    .bar-row__label { font-size: v.$font-size-sm; color: v.$color-text-secondary; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bar-row__track { height: 8px; background: v.$color-bg-subtle; border-radius: v.$radius-pill; overflow: hidden; }
    .bar-row__fill { height: 100%; background: v.$color-primary; border-radius: v.$radius-pill; }
    .bar-row__val { font-size: v.$font-size-sm; font-weight: 700; color: v.$color-primary; }

    .gaps { list-style: none; margin: 0; padding: 0; max-height: 320px; overflow-y: auto; }
    .gaps__item { display: flex; justify-content: space-between; gap: v.$spacing-sm; padding: v.$spacing-xs 0; border-bottom: 1px solid v.$color-border-light; }
    .gaps__q { font-size: v.$font-size-sm; color: v.$color-text-primary; }
    .gaps__date { font-size: v.$font-size-xs; color: v.$color-text-muted; white-space: nowrap; }

    .roles { display: flex; gap: v.$spacing-md; flex-wrap: wrap; }
    .roles__item { display: flex; flex-direction: column; align-items: center; padding: v.$spacing-sm v.$spacing-md; background: v.$color-bg-subtle; border-radius: v.$radius-md; min-width: 90px; }
    .roles__num { font-size: v.$font-size-xl; font-weight: 700; color: v.$color-primary; }
    .roles__rol { font-size: v.$font-size-xs; color: v.$color-text-muted; text-transform: capitalize; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  private readonly svc = inject(AnalyticsService);

  readonly data = signal<Analytics | null>(null);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  private readonly maxConsultas = computed(() =>
    Math.max(1, ...(this.data()?.top_articulos.map(a => a.consultas) ?? [1]))
  );

  ngOnInit(): void {
    this.svc.getAnalytics().subscribe({
      next: d => { this.data.set(d); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las métricas.'); this.cargando.set(false); },
    });
  }

  pct(n: number): number {
    return Math.round((n / this.maxConsultas()) * 100);
  }
}
