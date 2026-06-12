import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GuardadosService } from '../../../core/services/guardados.service';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Articulo } from '../../../core/models/constitucion.models';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-guardados',
  standalone: true,
  imports: [CommonModule, RouterLink, ArticleCardComponent],
  templateUrl: './guardados.component.html',
  styleUrl: './guardados.component.scss',
})
export class GuardadosComponent implements OnInit {
  readonly guardadosService = inject(GuardadosService);
  private readonly service = inject(ConstitucionService);

  readonly articulos = signal<Articulo[]>([]);
  readonly cargando = signal(false);

  ngOnInit(): void {
    const ids = this.guardadosService.getIds();
    if (ids.length === 0) return;

    this.cargando.set(true);
    this.service.getArticulosByIds(ids).subscribe({
      next: data => {
        this.articulos.set(data);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }
}
