import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Articulo, CategoriaArticulo, CATEGORIAS } from '../../../core/models/constitucion.models';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';
import { ConsultaGuiadaComponent } from '../consulta/consulta-guiada.component';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleCardComponent, ConsultaGuiadaComponent],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.scss',
})
export class BuscarComponent implements OnInit, OnDestroy {
  private readonly service = inject(ConstitucionService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();
  private readonly busqueda$ = new Subject<{ query: string; categoria: CategoriaArticulo | null; page: number }>();

  readonly categorias = CATEGORIAS;
  readonly modo = signal<'directa' | 'guiada'>('directa');

  autoTab = '';
  autoVoz = false;
  readonly articulos = signal<Articulo[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly cargando = signal(false);
  readonly pageSize = PAGE_SIZE;
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / PAGE_SIZE)));
  readonly desde = computed(() => (this.total() === 0 ? 0 : this.page() * PAGE_SIZE + 1));
  readonly hasta = computed(() => Math.min((this.page() + 1) * PAGE_SIZE, this.total()));

  query = '';
  categoriaActiva: CategoriaArticulo | null = null;

  ngOnInit(): void {
    const p = this.route.snapshot.queryParams;
    if (p['modo'] === 'guiada') this.modo.set('guiada');
    this.autoTab = p['tab'] ?? '';
    this.autoVoz = p['voz'] === '1';

    this.busqueda$
      .pipe(
        debounceTime(250),
        distinctUntilChanged((a, b) => a.query === b.query && a.categoria === b.categoria && a.page === b.page),
        switchMap(f => {
          this.cargando.set(true);
          return this.service.buscarArticulos({
            query: f.query,
            categoria: f.categoria,
            limit: PAGE_SIZE,
            offset: f.page * PAGE_SIZE,
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: resp => {
          this.articulos.set(resp.data);
          this.total.set(resp.total);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });

    this.buscar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.page.set(0);
    this.buscar();
  }

  selectCategoria(cat: CategoriaArticulo | null): void {
    this.categoriaActiva = cat;
    this.page.set(0);
    this.buscar();
  }

  irPagina(p: number): void {
    if (p < 0 || p >= this.totalPages() || p === this.page()) return;
    this.page.set(p);
    this.buscar();
  }

  private buscar(): void {
    this.busqueda$.next({ query: this.query, categoria: this.categoriaActiva, page: this.page() });
  }

  getCategoriaSlug(cat: string): string {
    return cat
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
