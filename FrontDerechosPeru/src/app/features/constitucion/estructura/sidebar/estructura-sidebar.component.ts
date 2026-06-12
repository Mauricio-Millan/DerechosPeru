import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Titulo, Capitulo } from '../../../../core/models/constitucion.models';

@Component({
  selector: 'app-estructura-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estructura-sidebar.component.html',
  styleUrl: './estructura-sidebar.component.scss',
})
export class EstructuraSidebarComponent {
  @Input({ required: true }) titulos: Titulo[] = [];
  @Input() tituloActivoId: number | null = null;
  @Input() capituloActivoId: number | null = null;

  @Output() tituloSeleccionado = new EventEmitter<Titulo>();
  @Output() capituloSeleccionado = new EventEmitter<Capitulo>();

  private readonly expandidos = signal<Set<number>>(new Set());

  isTituloExpandido(tituloId: number): boolean {
    return this.expandidos().has(tituloId);
  }

  toggleTitulo(titulo: Titulo): void {
    this.expandidos.update(set => {
      const next = new Set(set);
      if (next.has(titulo.id)) {
        next.delete(titulo.id);
      } else {
        next.add(titulo.id);
      }
      return next;
    });
    this.tituloSeleccionado.emit(titulo);
  }

  selectCapitulo(capitulo: Capitulo): void {
    this.capituloSeleccionado.emit(capitulo);
  }
}
