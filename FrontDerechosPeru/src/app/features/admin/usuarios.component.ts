import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Rol } from '../../core/services/auth.service';

interface Usuario {
  id: string;
  display_name: string | null;
  role: Rol;
}

const ROLES: Rol[] = ['ciudadano', 'redactor', 'experto', 'editor', 'admin'];

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="usuarios">
      <header class="usuarios__head">
        <h1>Gestión de usuarios</h1>
        <a routerLink="/constitucion/estructura" class="usuarios__back">← Portal</a>
      </header>

      @if (cargando()) {
        <p class="usuarios__msg">Cargando…</p>
      } @else if (error()) {
        <p class="usuarios__msg usuarios__msg--err">{{ error() }}</p>
      } @else {
        <table class="usuarios__tabla">
          <thead>
            <tr><th>Nombre</th><th>ID</th><th>Rol</th></tr>
          </thead>
          <tbody>
            @for (u of usuarios(); track u.id) {
              <tr>
                <td>{{ u.display_name || '—' }}</td>
                <td class="usuarios__id">{{ u.id }}</td>
                <td>
                  <select [ngModel]="u.role" (ngModelChange)="cambiarRol(u, $event)">
                    @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
  styles: [`
    .usuarios { max-width: 900px; margin: 0 auto; padding: 1.5rem; }
    .usuarios__head { display: flex; justify-content: space-between; align-items: center; }
    .usuarios__head h1 { color: #8B2020; font-size: 1.4rem; margin: 0; }
    .usuarios__back { color: #6b6457; text-decoration: none; font-size: .85rem; }
    .usuarios__msg { color: #6b6457; }
    .usuarios__msg--err { color: #b3261e; }
    .usuarios__tabla { width: 100%; border-collapse: collapse; margin-top: 1.2rem; font-size: .9rem; }
    .usuarios__tabla th, .usuarios__tabla td { text-align: left; padding: .6rem .5rem; border-bottom: 1px solid #ece7da; }
    .usuarios__id { font-family: monospace; font-size: .75rem; color: #9b9486; }
    .usuarios__tabla select { padding: .35rem .5rem; border: 1px solid #d8d2c4; border-radius: 6px; }
  `],
})
export class UsuariosComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/admin/usuarios`;

  readonly roles = ROLES;
  readonly usuarios = signal<Usuario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    this.http.get<Usuario[]>(this.api).subscribe({
      next: u => { this.usuarios.set(u); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la lista'); this.cargando.set(false); },
    });
  }

  cambiarRol(u: Usuario, role: Rol): void {
    this.http.patch<Usuario>(`${this.api}/${u.id}/rol`, { role }).subscribe({
      next: actualizado =>
        this.usuarios.update(list => list.map(x => (x.id === u.id ? actualizado : x))),
      error: () => this.error.set(`No se pudo cambiar el rol de ${u.display_name ?? u.id}`),
    });
  }
}
