import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Articulo, CategoriaArticulo, CATEGORIAS } from '../../../core/models/constitucion.models';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleCardComponent],
  templateUrl: './buscar.component.html',
  styleUrl: './buscar.component.scss',
})
export class BuscarComponent implements OnInit, OnDestroy {
  private readonly service = inject(ConstitucionService);
  private readonly destroy$ = new Subject<void>();
  private readonly busqueda$ = new Subject<{ query: string; categoria: CategoriaArticulo | null }>();

  readonly categorias = CATEGORIAS;
  readonly articulos = signal<Articulo[]>([]);
  readonly total = signal(0);
  readonly cargando = signal(false);

  query = '';
  categoriaActiva: CategoriaArticulo | null = null;

  ngOnInit(): void {
    this.busqueda$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.query === b.query && a.categoria === b.categoria),
        switchMap(filtros => {
          this.cargando.set(true);
          return this.service.buscarArticulos(filtros);
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
    this.buscar();
  }

  selectCategoria(cat: CategoriaArticulo | null): void {
    this.categoriaActiva = cat;
    this.buscar();
  }

  private buscar(): void {
    this.busqueda$.next({ query: this.query, categoria: this.categoriaActiva });
  }

  getCategoriaSlug(cat: string): string {
    return cat
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
