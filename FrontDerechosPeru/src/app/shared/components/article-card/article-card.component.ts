import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Articulo } from '../../../core/models/constitucion.models';
import { GuardadosService } from '../../../core/services/guardados.service';
import { ForoService } from '../../../core/services/foro.service';
import { AuthService } from '../../../core/services/auth.service';
import { Annotation } from '../../../core/models/foro.models';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
})
export class ArticleCardComponent {
  @Input({ required: true }) articulo!: Articulo;
  @Output() toggleGuardado = new EventEmitter<number>();

  private readonly guardadosService = inject(GuardadosService);
  readonly foroService = inject(ForoService);
  readonly auth = inject(AuthService);

  readonly expandido = signal(false);
  readonly anotaciones = signal<Annotation[]>([]);
  readonly cargandoAnotaciones = signal(false);
  readonly enviandoAnotacion = signal(false);
  readonly errorAnotacion = signal('');
  nuevaAnotacion = '';

  get isGuardado(): boolean {
    return this.guardadosService.isGuardado(this.articulo.id);
  }

  toggle(): void {
    this.expandido.update(v => !v);
    if (this.expandido()) {
      this.cargarAnotaciones();
    }
  }

  cargarAnotaciones(): void {
    this.cargandoAnotaciones.set(true);
    this.foroService.getAnotaciones(this.articulo.id).subscribe({
      next: (data) => {
        this.anotaciones.set(data);
        this.cargandoAnotaciones.set(false);
      },
      error: () => this.cargandoAnotaciones.set(false)
    });
  }

  crearAnotacion(): void {
    if (!this.nuevaAnotacion.trim() || this.nuevaAnotacion.length < 5) {
      this.errorAnotacion.set('La anotación debe tener al menos 5 caracteres.');
      return;
    }
    this.enviandoAnotacion.set(true);
    this.errorAnotacion.set('');
    this.foroService.addAnotacion(this.articulo.id, this.nuevaAnotacion.trim()).subscribe({
      next: (newAnnot) => {
        this.anotaciones.update(list => [newAnnot, ...list]);
        this.nuevaAnotacion = '';
        this.enviandoAnotacion.set(false);
      },
      error: (err) => {
        this.enviandoAnotacion.set(false);
        this.errorAnotacion.set(err.error?.detail || 'No se pudo guardar la anotación.');
      }
    });
  }

  borrarAnotacion(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta anotación?')) {
      this.foroService.borrarAnotacion(id).subscribe({
        next: () => {
          this.anotaciones.update(list => list.filter(a => a.id !== id));
        }
      });
    }
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
