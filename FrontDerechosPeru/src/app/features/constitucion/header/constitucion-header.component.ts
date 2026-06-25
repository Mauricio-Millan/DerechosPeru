import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NovedadesComponent } from '../../../shared/components/novedades/novedades.component';

@Component({
  selector: 'app-constitucion-header',
  standalone: true,
  imports: [RouterLink, NovedadesComponent],
  templateUrl: './constitucion-header.component.html',
  styleUrl: './constitucion-header.component.scss',
})
export class ConstitucionHeaderComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
