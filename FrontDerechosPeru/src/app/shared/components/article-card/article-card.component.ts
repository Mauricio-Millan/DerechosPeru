import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Articulo } from '../../../core/models/constitucion.models';
import { GuardadosService } from '../../../core/services/guardados.service';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
})
export class ArticleCardComponent {
  @Input({ required: true }) articulo!: Articulo;
  @Output() toggleGuardado = new EventEmitter<number>();

  private readonly guardadosService = inject(GuardadosService);

  readonly expandido = signal(false);

  get isGuardado(): boolean {
    return this.guardadosService.isGuardado(this.articulo.id);
  }

  toggle(): void {
    this.expandido.update(v => !v);
  }

  onToggleGuardado(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleGuardado.emit(this.articulo.id);
    this.guardadosService.toggleGuardado(this.articulo.id);
  }

  get categoriaSlug(): string {
    return this.articulo.categoria
      .toLowerCase()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}
