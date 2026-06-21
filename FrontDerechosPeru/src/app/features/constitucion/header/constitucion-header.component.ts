import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-constitucion-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './constitucion-header.component.html',
  styleUrl: './constitucion-header.component.scss',
})
export class ConstitucionHeaderComponent {
  readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
