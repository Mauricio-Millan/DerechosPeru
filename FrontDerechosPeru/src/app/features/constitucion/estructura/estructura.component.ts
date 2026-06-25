import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Titulo, Capitulo, Articulo } from '../../../core/models/constitucion.models';
import { EstructuraSidebarComponent } from './sidebar/estructura-sidebar.component';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-estructura',
  standalone: true,
  imports: [CommonModule, EstructuraSidebarComponent, ArticleCardComponent],
  templateUrl: './estructura.component.html',
  styleUrl: './estructura.component.scss',
})
export class EstructuraComponent implements OnInit {
  private readonly service = inject(ConstitucionService);

  readonly titulos = signal<Titulo[]>([]);
  readonly tituloActivo = signal<Titulo | null>(null);
  readonly capituloActivo = signal<Capitulo | null>(null);
  readonly articulos = signal<Articulo[]>([]);
  readonly cargando = signal(false);
  readonly cargandoInicial = signal(true);
  readonly servidorLento = signal(false);
  readonly sidebarVisible = signal(false);

  toggleSidebar(): void {
    this.sidebarVisible.update(v => !v);
  }

  private closeSidebarOnMobile(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.sidebarVisible.set(false);
    }
  }

  ngOnInit(): void {
    // El backend escala a cero: la 1ª visita puede pagar un cold start de
    // varios segundos. A los 5s avisamos que el servidor está "despertando".
    const lentoTimer = setTimeout(() => this.servidorLento.set(true), 5000);
    this.service.getTitulos().subscribe({
      next: data => {
        clearTimeout(lentoTimer);
        this.cargandoInicial.set(false);
        this.titulos.set(data);
        if (data.length > 0) {
          this.onTituloSeleccionado(data[0]);
        }
      },
      error: () => {
        clearTimeout(lentoTimer);
        this.cargandoInicial.set(false);
      },
    });
  }

  onTituloSeleccionado(titulo: Titulo): void {
    this.closeSidebarOnMobile();
    this.tituloActivo.set(titulo);
    this.capituloActivo.set(null);
    this.articulos.set([]);

    if (!titulo.capitulos) {
      this.service.getCapitulosByTitulo(titulo.id).subscribe({
        next: capitulos => {
          this.titulos.update(list =>
            list.map(t => t.id === titulo.id ? { ...t, capitulos } : t)
          );
          this.tituloActivo.set({ ...titulo, capitulos });
          if (capitulos.length === 0) this.cargarArticulosDirectos(titulo.id);
        },
      });
    } else if (titulo.capitulos.length === 0) {
      this.cargarArticulosDirectos(titulo.id);
    }
  }

  private cargarArticulosDirectos(tituloId: number): void {
    this.cargando.set(true);
    this.service.getArticulosByTitulo(tituloId).subscribe({
      next: data => {
        this.articulos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  onCapituloSeleccionado(capitulo: Capitulo): void {
    this.closeSidebarOnMobile();
    this.capituloActivo.set(capitulo);
    this.cargando.set(true);
    this.articulos.set([]);

    this.service.getArticulosByCapitulo(capitulo.id).subscribe({
      next: data => {
        this.articulos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
