import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth">
      <div class="auth__card">
        <h1 class="auth__title">{{ modoRegistro() ? 'Crear cuenta' : 'Iniciar sesión' }}</h1>
        <p class="auth__sub">Portal Constitucional del Perú</p>

        <form (ngSubmit)="enviar()" class="auth__form">
          @if (modoRegistro()) {
            <label class="auth__field">
              <span>Nombre</span>
              <input [(ngModel)]="nombre" name="nombre" type="text" autocomplete="name" required />
            </label>
          }
          <label class="auth__field">
            <span>Correo</span>
            <input [(ngModel)]="email" name="email" type="email" autocomplete="email" required />
          </label>
          <label class="auth__field">
            <span>Contraseña</span>
            <input [(ngModel)]="password" name="password" type="password"
                   autocomplete="current-password" minlength="6" required />
          </label>

          @if (error()) { <p class="auth__error">{{ error() }}</p> }
          @if (aviso()) { <p class="auth__aviso">{{ aviso() }}</p> }

          <button type="submit" class="auth__submit" [disabled]="cargando()">
            {{ cargando() ? 'Procesando…' : (modoRegistro() ? 'Registrarme' : 'Entrar') }}
          </button>
        </form>

        <button type="button" class="auth__toggle" (click)="toggle()">
          {{ modoRegistro() ? '¿Ya tienes cuenta? Inicia sesión' : '¿Sin cuenta? Regístrate' }}
        </button>
        <a routerLink="/constitucion/estructura" class="auth__back">← Volver al portal</a>
      </div>
    </div>
  `,
  styles: [`
    .auth { display: flex; justify-content: center; align-items: center; min-height: 70vh; padding: 1.5rem; }
    .auth__card { width: 100%; max-width: 380px; background: #fff; border: 1px solid #e6e1d5;
      border-radius: 12px; padding: 2rem; box-shadow: 0 4px 18px rgba(0,0,0,.05); }
    .auth__title { margin: 0; font-size: 1.4rem; color: #8B2020; }
    .auth__sub { margin: .25rem 0 1.5rem; color: #6b6457; font-size: .85rem; }
    .auth__form { display: flex; flex-direction: column; gap: .9rem; }
    .auth__field { display: flex; flex-direction: column; gap: .3rem; font-size: .85rem; color: #4a4438; }
    .auth__field input { padding: .6rem .7rem; border: 1px solid #d8d2c4; border-radius: 7px; font-size: .95rem; }
    .auth__field input:focus { outline: 2px solid #C9A84C; border-color: transparent; }
    .auth__submit { margin-top: .4rem; padding: .7rem; background: #8B2020; color: #fff; border: 0;
      border-radius: 7px; font-weight: 600; cursor: pointer; }
    .auth__submit:disabled { opacity: .6; cursor: default; }
    .auth__toggle { margin-top: 1rem; background: 0; border: 0; color: #8B2020; cursor: pointer; font-size: .85rem; }
    .auth__back { display: block; margin-top: .5rem; text-align: center; color: #6b6457; font-size: .8rem; text-decoration: none; }
    .auth__error { margin: 0; color: #b3261e; font-size: .82rem; }
    .auth__aviso { margin: 0; color: #1b6b3a; font-size: .82rem; }
  `],
})
export class AuthComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly modoRegistro = signal(false);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly aviso = signal('');

  nombre = '';
  email = '';
  password = '';

  toggle(): void {
    this.modoRegistro.update(v => !v);
    this.error.set('');
    this.aviso.set('');
  }

  async enviar(): Promise<void> {
    this.error.set('');
    this.aviso.set('');
    this.cargando.set(true);
    const res = this.modoRegistro()
      ? await this.auth.register(this.email, this.password, this.nombre)
      : await this.auth.login(this.email, this.password);
    this.cargando.set(false);

    if (!res.ok) {
      this.error.set(res.error ?? 'No se pudo completar la operación');
      return;
    }
    if (this.modoRegistro()) {
      // Supabase puede requerir confirmación por correo según la config del proyecto.
      this.aviso.set('Cuenta creada. Si se pide, confirma tu correo y luego inicia sesión.');
      this.modoRegistro.set(false);
      return;
    }
    this.router.navigate(['/constitucion/estructura']);
  }
}
