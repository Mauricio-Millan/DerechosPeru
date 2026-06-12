import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { EstadisticasConstitucion } from '../../../core/models/constitucion.models';

@Component({
  selector: 'app-stats-bar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './stats-bar.component.html',
  styleUrl: './stats-bar.component.scss',
})
export class StatsBarComponent {
  @Input() estadisticas: EstadisticasConstitucion | null = null;
  @Input() totalGuardados = 0;
}
