import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Comparacion, VersionPublica } from '../../../core/models/comparador.models';

@Component({
  selector: 'app-comparador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparador.component.html',
  styleUrl: './comparador.component.scss',
})
export class ComparadorComponent implements OnInit {
  private readonly service = inject(ConstitucionService);

  readonly versiones = signal<VersionPublica[]>([]);
  readonly comparacion = signal<Comparacion | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);

  baseId: number | null = null;
  targetId: number | null = null;

  readonly puedeComparar = computed(() =>
    this.baseId != null && this.targetId != null && this.baseId !== this.targetId
  );

  ngOnInit(): void {
    this.service.getVersionesPublicadas().subscribe({
      next: vs => {
        this.versiones.set(vs);
        if (vs.length >= 2) {
          this.baseId = vs[0].id;
          this.targetId = vs[vs.length - 1].id;
        }
      },
      error: () => this.error.set('No se pudieron cargar las versiones.'),
    });
  }

  comparar(): void {
    if (this.baseId == null || this.targetId == null) return;
    this.cargando.set(true);
    this.error.set(null);
    this.comparacion.set(null);
    this.service.comparar(this.baseId, this.targetId).subscribe({
      next: c => {
        this.comparacion.set(c);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err?.error?.detail ?? 'No se pudo comparar.');
        this.cargando.set(false);
      },
    });
  }

  etiquetaEstado(estado: string): string {
    return (
      { identico: 'Idéntico', modificado: 'Modificado', sin_equivalente: 'Sin equivalente', nuevo: 'Nuevo' }[
        estado
      ] ?? estado
    );
  }
}
