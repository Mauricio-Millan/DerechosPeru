import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CONSTITUCIONES, ConstitucionHistorica } from '../../../core/data/constituciones-historicas';
import { ASAMBLEAS } from '../../../core/data/congresistas-constituyentes';

@Component({
  selector: 'app-historia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historia.component.html',
  styleUrl: './historia.component.scss',
})
export class HistoriaComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly constituciones = [...CONSTITUCIONES].reverse();
  readonly seleccionada = signal<ConstitucionHistorica | null>(CONSTITUCIONES[CONSTITUCIONES.length - 1]);
  readonly modalAbierto = signal(false);

  readonly videoUrl = computed((): SafeResourceUrl | null => {
    const vid = this.seleccionada()?.videoId;
    if (!vid) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${vid}`);
  });

  readonly asamblea = computed(() => {
    if (!this.modalAbierto()) return null;
    const anio = this.seleccionada()?.anio;
    return ASAMBLEAS.find(a => a.constitucionAnio === anio) ?? null;
  });

  seleccionar(c: ConstitucionHistorica): void {
    this.seleccionada.set(c);
    this.modalAbierto.set(false);
  }

  duracion(c: ConstitucionHistorica): string {
    if (!c.vigenciaHasta) return `${2025 - c.vigenciaDesde}+ anios`;
    const anios = c.vigenciaHasta - c.vigenciaDesde;
    return anios === 1 ? '1 anio' : `${anios} anios`;
  }

  colorFaccion(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('aprista') || n.includes('leguísta') || n.includes('amigos') || n.includes('cambio 90') || n.includes('fujimorist') || n.includes('unión revolucionaria')) return 'of';
    if (n.includes('socialista') || n.includes('comunista') || n.includes('marxista') || n.includes('focep') || n.includes('udp') || n.includes('psr') || n.includes('frenatraca') || n.includes('frepap') || n.includes('izquierda')) return 'izq';
    if (n.includes('popular cristiano') || n.includes('ppc') || n.includes('fim') || n.includes('code') || n.includes('coordinadora') || n.includes('moralizador')) return 'opo';
    if (n.includes('descentralista') || n.includes('independiente') || n.includes('centrista') || n.includes('democracia cristiana') || n.includes('uno') || n.includes('mdp') || n.includes('minorías')) return 'cen';
    return 'otro';
  }
}
