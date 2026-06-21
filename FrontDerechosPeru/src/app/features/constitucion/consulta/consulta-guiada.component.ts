import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { Articulo, CategoriaArticulo, ConsultaResultado } from '../../../core/models/constitucion.models';
import { ArticleCardComponent } from '../../../shared/components/article-card/article-card.component';

const EJEMPLOS = [
  'Me despidieron sin causa justificada y no me pagaron mis beneficios',
  'El colegio de mi hijo le niega matrícula sin explicación',
  'Me niegan atención médica en el hospital público',
  'Mi vecino invadió parte de mi terreno registrado',
  'Fui discriminado en mi trabajo por mi origen',
  'Me detuvieron sin orden judicial',
];

@Component({
  selector: 'app-consulta-guiada',
  standalone: true,
  imports: [CommonModule, FormsModule, ArticleCardComponent],
  templateUrl: './consulta-guiada.component.html',
  styleUrl: './consulta-guiada.component.scss',
})
export class ConsultaGuiadaComponent {
  private readonly service = inject(ConstitucionService);

  readonly ejemplos = EJEMPLOS;
  readonly resultados = signal<ConsultaResultado[]>([]);
  readonly cargando = signal(false);
  readonly consultado = signal(false);

  texto = '';

  usarEjemplo(ejemplo: string): void {
    this.texto = ejemplo;
    this.consultar();
  }

  consultar(): void {
    const t = this.texto.trim();
    if (t.length < 5 || this.cargando()) return;
    this.cargando.set(true);
    this.service.consultarGuiada(t).subscribe({
      next: r => {
        this.resultados.set(r.resultados);
        this.consultado.set(true);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false),
    });
  }

  toArticulo(r: ConsultaResultado): Articulo {
    return {
      id: r.id,
      numero: r.numero,
      titulo: r.titulo,
      contenido: r.contenido,
      categoria: r.categoria as CategoriaArticulo,
      capituloId: 0,
      tituloId: 0,
    };
  }
}
