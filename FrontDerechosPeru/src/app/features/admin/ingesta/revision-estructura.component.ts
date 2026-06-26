import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IngestaService } from '../../../core/services/ingesta.service';
import { Estructura, TituloDraft, CapituloDraft, ArticuloEstructura } from '../../../core/models/ingesta.models';

@Component({
  selector: 'app-revision-estructura',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="est">
      @if (cargando()) {
        <p class="muted">Cargando estructura…</p>
      } @else if (data(); as d) {

        <!-- TÍTULOS -->
        <section class="est__sec">
          <h3 class="est__h">Títulos <span class="est__count">{{ d.titulos.length }}</span></h3>
          @for (t of d.titulos; track t.id) {
            <div class="row">
              <input class="row__rom" [(ngModel)]="t.numero_romano" />
              <input class="row__den" [(ngModel)]="t.denominacion" />
              <span class="row__meta">{{ t.total_capitulos }} cap · {{ t.total_articulos }} art</span>
              <button class="ico" (click)="guardarTitulo(t)" title="Guardar">✓</button>
              <button class="ico ico--del" [disabled]="t.total_capitulos > 0 || t.total_articulos > 0"
                (click)="borrarTitulo(t)" [title]="t.total_capitulos || t.total_articulos ? 'Reasigna sus elementos primero' : 'Borrar'">🗑</button>
            </div>
          }
          <div class="newf">
            <input class="row__rom" placeholder="N°" [(ngModel)]="nuevoTituloRom" />
            <input class="row__den" placeholder="Denominación del nuevo título" [(ngModel)]="nuevoTituloDen" />
            <button class="btn" [disabled]="!nuevoTituloDen.trim()" (click)="crearTitulo()">+ Título</button>
          </div>
        </section>

        <!-- CAPÍTULOS -->
        <section class="est__sec">
          <h3 class="est__h">Capítulos <span class="est__count">{{ d.capitulos.length }}</span></h3>
          @if (capSel().size > 0) {
            <div class="assign">
              <span>{{ capSel().size }} seleccionados →</span>
              <select [(ngModel)]="destinoCapTitulo">
                <option [ngValue]="null" disabled>Mover a título…</option>
                @for (t of d.titulos; track t.id) {
                  <option [ngValue]="t.id">Título {{ t.numero_romano }} — {{ t.denominacion }}</option>
                }
              </select>
              <button class="btn" [disabled]="destinoCapTitulo == null" (click)="asignarCapitulos()">Asignar</button>
            </div>
          }
          @for (c of d.capitulos; track c.id) {
            <div class="row">
              <input type="checkbox" [checked]="capSel().has(c.id)" (change)="toggleCap(c.id)" />
              <input class="row__rom" [(ngModel)]="c.numero_romano" />
              <input class="row__den" [(ngModel)]="c.denominacion" />
              <span class="row__tag">{{ tituloLabel(c.titulo_id) }}</span>
              <span class="row__meta">{{ c.total_articulos }} art</span>
              <button class="ico" (click)="guardarCapitulo(c)" title="Guardar">✓</button>
              <button class="ico ico--del" [disabled]="c.total_articulos > 0"
                (click)="borrarCapitulo(c)" [title]="c.total_articulos ? 'Reasigna sus artículos primero' : 'Borrar'">🗑</button>
            </div>
          }
          <div class="newf">
            <select [(ngModel)]="nuevoCapTitulo">
              <option [ngValue]="null" disabled>Título…</option>
              @for (t of d.titulos; track t.id) {
                <option [ngValue]="t.id">{{ t.numero_romano }}</option>
              }
            </select>
            <input class="row__rom" placeholder="N°" [(ngModel)]="nuevoCapRom" />
            <input class="row__den" placeholder="Denominación del nuevo capítulo" [(ngModel)]="nuevoCapDen" />
            <button class="btn" [disabled]="!nuevoCapDen.trim() || nuevoCapTitulo == null" (click)="crearCapitulo()">+ Capítulo</button>
          </div>
        </section>

        <!-- ARTÍCULOS -->
        <section class="est__sec">
          <h3 class="est__h">Artículos <span class="est__count">{{ d.articulos.length }}</span></h3>
          @if (artSel().size > 0) {
            <div class="assign">
              <span>{{ artSel().size }} seleccionados →</span>
              <select [(ngModel)]="destinoArt">
                <option [ngValue]="null" disabled>Asignar a…</option>
                <optgroup label="A un capítulo">
                  @for (c of d.capitulos; track c.id) {
                    <option [ngValue]="'cap:' + c.id">Cap. {{ c.numero_romano }} — {{ c.denominacion }}</option>
                  }
                </optgroup>
                <optgroup label="Directo a un título (sin capítulo)">
                  @for (t of d.titulos; track t.id) {
                    <option [ngValue]="'tit:' + t.id">Título {{ t.numero_romano }} — {{ t.denominacion }}</option>
                  }
                </optgroup>
              </select>
              <button class="btn" [disabled]="!destinoArt" (click)="asignarArticulos()">Asignar</button>
            </div>
          }
          <div class="arts">
            @for (a of d.articulos; track a.id) {
              <label class="art" [class.art--sel]="artSel().has(a.id)">
                <input type="checkbox" [checked]="artSel().has(a.id)" (change)="toggleArt(a.id)" />
                <span class="art__num">Art. {{ a.numero }}</span>
                <span class="art__sum">{{ a.sumilla || '—' }}</span>
                <span class="art__loc">{{ ubicacion(a) }}</span>
              </label>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    @use '../../../../styles/variables' as v;

    .est { padding: v.$spacing-md; display: flex; flex-direction: column; gap: v.$spacing-lg; }
    .muted { color: v.$color-text-muted; padding: v.$spacing-md; }

    .est__sec { background: white; border: 1px solid v.$color-border; border-radius: v.$radius-md; padding: v.$spacing-md; }
    .est__h { margin: 0 0 v.$spacing-sm; font-size: v.$font-size-md; color: v.$color-primary; display: flex; align-items: center; gap: v.$spacing-sm; }
    .est__count { font-size: v.$font-size-xs; background: v.$color-bg-subtle; color: v.$color-text-muted; border-radius: v.$radius-pill; padding: 1px 8px; }

    .row { display: flex; align-items: center; gap: v.$spacing-xs; padding: 4px 0; border-bottom: 1px solid v.$color-border-light; }
    .row__rom { width: 52px; }
    .row__den { flex: 1; min-width: 0; }
    .row input[type=text], .row input:not([type]) , .newf input, .newf select, .assign select {
      border: 1px solid v.$color-border; border-radius: v.$radius-sm; padding: 4px 6px; font-size: v.$font-size-sm; font-family: v.$font-family-ui; outline: none;
    }
    .row input:focus, .newf input:focus { border-color: v.$color-primary; }
    .row__tag { font-size: v.$font-size-xs; color: v.$color-primary; background: v.$color-primary-bg; border-radius: v.$radius-sm; padding: 1px 6px; white-space: nowrap; }
    .row__meta { font-size: v.$font-size-xs; color: v.$color-text-muted; white-space: nowrap; }

    .ico { border: none; background: transparent; cursor: pointer; font-size: v.$font-size-sm; padding: 2px 6px; border-radius: v.$radius-sm; }
    .ico:hover { background: v.$color-bg-subtle; }
    .ico--del:disabled { opacity: 0.3; cursor: not-allowed; }

    .newf { display: flex; align-items: center; gap: v.$spacing-xs; margin-top: v.$spacing-sm; padding-top: v.$spacing-sm; }
    .btn { background: v.$color-primary; color: white; border: none; border-radius: v.$radius-sm; padding: 5px 12px; font-size: v.$font-size-sm; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn:disabled { opacity: 0.45; cursor: not-allowed; }

    .assign { display: flex; align-items: center; gap: v.$spacing-sm; background: v.$color-gold-bg; border-radius: v.$radius-sm; padding: v.$spacing-sm; margin-bottom: v.$spacing-sm; font-size: v.$font-size-sm; flex-wrap: wrap; }

    .arts { display: flex; flex-direction: column; }
    .art { display: flex; align-items: center; gap: v.$spacing-sm; padding: 5px 6px; border-bottom: 1px solid v.$color-border-light; cursor: pointer; border-radius: v.$radius-sm; }
    .art:hover { background: v.$color-bg-subtle; }
    .art--sel { background: v.$color-primary-bg; }
    .art__num { font-weight: 700; font-size: v.$font-size-sm; color: v.$color-text-primary; white-space: nowrap; }
    .art__sum { flex: 1; font-size: v.$font-size-sm; color: v.$color-text-secondary; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .art__loc { font-size: v.$font-size-xs; color: v.$color-text-muted; white-space: nowrap; }
  `],
})
export class RevisionEstructuraComponent implements OnInit {
  private readonly svc = inject(IngestaService);
  readonly versionId = input.required<number>();

  readonly data = signal<Estructura | null>(null);
  readonly cargando = signal(true);

  readonly artSel = signal<Set<number>>(new Set());
  readonly capSel = signal<Set<number>>(new Set());

  destinoArt: string | null = null;      // "cap:ID" | "tit:ID"
  destinoCapTitulo: number | null = null;

  nuevoTituloRom = '';
  nuevoTituloDen = '';
  nuevoCapTitulo: number | null = null;
  nuevoCapRom = '';
  nuevoCapDen = '';

  private readonly titById = computed(() => {
    const m = new Map<number, TituloDraft>();
    for (const t of this.data()?.titulos ?? []) m.set(t.id, t);
    return m;
  });
  private readonly capById = computed(() => {
    const m = new Map<number, CapituloDraft>();
    for (const c of this.data()?.capitulos ?? []) m.set(c.id, c);
    return m;
  });

  ngOnInit(): void { this.cargar(); }

  private cargar(): void {
    this.cargando.set(true);
    this.svc.getEstructura(this.versionId()).subscribe({
      next: d => {
        this.data.set(d);
        this.cargando.set(false);
        this.artSel.set(new Set());
        this.capSel.set(new Set());
        this.destinoArt = null;
        this.destinoCapTitulo = null;
      },
      error: () => this.cargando.set(false),
    });
  }

  tituloLabel(id: number | null): string {
    const t = id != null ? this.titById().get(id) : null;
    return t ? `Tít. ${t.numero_romano}` : 'sin título';
  }

  ubicacion(a: ArticuloEstructura): string {
    if (a.capitulo_id) {
      const c = this.capById().get(a.capitulo_id);
      return c ? `Cap. ${c.numero_romano}` : 'cap. ?';
    }
    if (a.titulo_id) return this.tituloLabel(a.titulo_id);
    return 'sin asignar';
  }

  toggleArt(id: number): void {
    this.artSel.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  toggleCap(id: number): void {
    this.capSel.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  asignarArticulos(): void {
    const ids = [...this.artSel()];
    if (!this.destinoArt || ids.length === 0) return;
    const [tipo, idStr] = this.destinoArt.split(':');
    const target = Number(idStr);
    const req = tipo === 'cap'
      ? this.svc.asignarArticulosACapitulo(target, ids)
      : this.svc.asignarArticulosATitulo(target, ids);
    req.subscribe({ next: () => this.cargar() });
  }

  asignarCapitulos(): void {
    const ids = [...this.capSel()];
    if (this.destinoCapTitulo == null || ids.length === 0) return;
    this.svc.asignarCapitulosATitulo(this.destinoCapTitulo, ids).subscribe({ next: () => this.cargar() });
  }

  guardarTitulo(t: TituloDraft): void {
    this.svc.editarTitulo(t.id, { numero_romano: t.numero_romano, denominacion: t.denominacion }).subscribe();
  }
  borrarTitulo(t: TituloDraft): void {
    if (t.total_capitulos || t.total_articulos) return;
    this.svc.borrarTitulo(t.id).subscribe({ next: () => this.cargar() });
  }
  crearTitulo(): void {
    if (!this.nuevoTituloDen.trim()) return;
    this.svc.crearTitulo(this.versionId(), this.nuevoTituloRom || '?', this.nuevoTituloDen).subscribe({
      next: () => { this.nuevoTituloRom = ''; this.nuevoTituloDen = ''; this.cargar(); },
    });
  }

  guardarCapitulo(c: CapituloDraft): void {
    this.svc.editarCapitulo(c.id, { numero_romano: c.numero_romano, denominacion: c.denominacion }).subscribe();
  }
  borrarCapitulo(c: CapituloDraft): void {
    if (c.total_articulos) return;
    this.svc.borrarCapitulo(c.id).subscribe({ next: () => this.cargar() });
  }
  crearCapitulo(): void {
    if (!this.nuevoCapDen.trim() || this.nuevoCapTitulo == null) return;
    this.svc.crearCapitulo(this.versionId(), this.nuevoCapTitulo, this.nuevoCapRom || '?', this.nuevoCapDen).subscribe({
      next: () => { this.nuevoCapRom = ''; this.nuevoCapDen = ''; this.cargar(); },
    });
  }
}
