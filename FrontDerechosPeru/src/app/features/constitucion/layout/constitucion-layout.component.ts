import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConstitucionHeaderComponent } from '../header/constitucion-header.component';
import { StatsBarComponent } from '../../../shared/components/stats-bar/stats-bar.component';
import { ConstitucionService } from '../../../core/services/constitucion.service';
import { GuardadosService } from '../../../core/services/guardados.service';
import { EstadisticasConstitucion } from '../../../core/models/constitucion.models';

@Component({
  selector: 'app-constitucion-layout',
  standalone: true,
  imports: [RouterOutlet, ConstitucionHeaderComponent, StatsBarComponent],
  templateUrl: './constitucion-layout.component.html',
  styleUrl: './constitucion-layout.component.scss',
})
export class ConstitucionLayoutComponent implements OnInit {
  private readonly service = inject(ConstitucionService);
  readonly guardadosService = inject(GuardadosService);

  estadisticas: EstadisticasConstitucion | null = null;

  ngOnInit(): void {
    this.service.getEstadisticas().subscribe({
      next: data => this.estadisticas = data,
    });
  }
}
