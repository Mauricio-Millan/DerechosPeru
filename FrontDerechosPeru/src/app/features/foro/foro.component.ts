import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ForoService } from '../../core/services/foro.service';
import { AuthService } from '../../core/services/auth.service';
import { Thread } from '../../core/models/foro.models';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.scss',
})
export class ForoComponent implements OnInit {
  private readonly foroService = inject(ForoService);
  readonly authService = inject(AuthService);

  readonly threads = signal<Thread[]>([]);
  readonly cargando = signal<boolean>(false);
  readonly mostrandoFormulario = signal<boolean>(false);
  readonly creandoHilo = signal<boolean>(false);
  readonly errorForm = signal<string>('');

  nuevoTitulo = '';
  nuevoContenido = '';
  nuevoArticuloId: number | null = null;

  ngOnInit(): void {
    this.cargarHilos();
  }

  cargarHilos(): void {
    this.cargando.set(true);
    this.foroService.listThreads().subscribe({
      next: (data) => {
        this.threads.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  toggleFormulario(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    this.mostrandoFormulario.update(v => !v);
    this.errorForm.set('');
  }

  crearHilo(): void {
    if (!this.nuevoTitulo.trim() || !this.nuevoContenido.trim()) {
      this.errorForm.set('Por favor completa el título y contenido.');
      return;
    }
    if (this.nuevoTitulo.length < 5) {
      this.errorForm.set('El título debe tener al menos 5 caracteres.');
      return;
    }
    if (this.nuevoContenido.length < 5) {
      this.errorForm.set('El contenido debe tener al menos 5 caracteres.');
      return;
    }

    this.creandoHilo.set(true);
    this.errorForm.set('');

    const payload = {
      titulo: this.nuevoTitulo.trim(),
      contenido: this.nuevoContenido.trim(),
      articulo_id: this.nuevoArticuloId
    };

    this.foroService.createThread(payload).subscribe({
      next: (nuevoThread) => {
        this.threads.update(list => [nuevoThread, ...list]);
        this.nuevoTitulo = '';
        this.nuevoContenido = '';
        this.nuevoArticuloId = null;
        this.mostrandoFormulario.set(false);
        this.creandoHilo.set(false);
      },
      error: (err) => {
        this.creandoHilo.set(false);
        const msg = err.error?.detail || 'No se pudo crear el hilo. Verifica los datos.';
        this.errorForm.set(msg);
      }
    });
  }
}
