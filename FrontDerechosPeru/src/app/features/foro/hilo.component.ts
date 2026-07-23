import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ForoService } from '../../core/services/foro.service';
import { AuthService } from '../../core/services/auth.service';
import { LoginPromptService } from '../../core/services/login-prompt.service';
import { ThreadDetail, Post } from '../../core/models/foro.models';

@Component({
  selector: 'app-hilo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hilo.component.html',
  styleUrl: './hilo.component.scss',
})
export class HiloComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly foroService = inject(ForoService);
  readonly authService = inject(AuthService);
  private readonly loginPrompt = inject(LoginPromptService);

  readonly thread = signal<ThreadDetail | null>(null);
  readonly cargando = signal<boolean>(true);
  readonly enviandoRespuesta = signal<boolean>(false);
  readonly errorRespuesta = signal<string>('');

  id = 0;
  nuevaRespuesta = '';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/constitucion/foro']);
      return;
    }
    this.id = parseInt(idParam, 10);

    // Setup polling every 12 seconds
    timer(0, 12000)
      .pipe(
        switchMap(() => this.foroService.getThread(this.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (t) => {
          this.thread.set(t);
          this.cargando.set(false);
        },
        error: () => {
          this.cargando.set(false);
        }
      });
  }

  recargarHilo(): void {
    this.foroService.getThread(this.id).subscribe({
      next: (t) => this.thread.set(t),
    });
  }

  enviarRespuesta(): void {
    if (!this.nuevaRespuesta.trim()) return;
    if (!this.authService.isLoggedIn()) { this.loginPrompt.show('foro'); return; }

    this.enviandoRespuesta.set(true);
    this.errorRespuesta.set('');

    this.foroService.addRespuesta(this.id, this.nuevaRespuesta.trim()).subscribe({
      next: () => {
        this.nuevaRespuesta = '';
        this.enviandoRespuesta.set(false);
        this.recargarHilo();
      },
      error: (err) => {
        this.enviandoRespuesta.set(false);
        const msg = err.error?.detail || 'No se pudo publicar la respuesta.';
        this.errorRespuesta.set(msg);
      }
    });
  }

  votar(post: Post, value: number): void {
    if (!this.authService.isLoggedIn()) {
      this.loginPrompt.show('foro');
      return;
    }
    this.foroService.votar(post.id, value).subscribe({
      next: (resp) => {
        // Optimistic / local update of post votes
        const currentThread = this.thread();
        if (currentThread) {
          const updatedRespuestas = currentThread.respuestas.map(r => {
            if (r.id === post.id) {
              return { ...r, votos: resp.votos, mi_voto: resp.mi_voto };
            }
            return r;
          });
          // Sort after vote change: is_verified, then votes, then created_at
          updatedRespuestas.sort((a, b) => (a.is_verified ? 0 : 1) - (b.is_verified ? 0 : 1) || b.votos - a.votos || a.created_at.localeCompare(b.created_at));
          this.thread.set({ ...currentThread, respuestas: updatedRespuestas });
        }
        this.recargarHilo();
      }
    });
  }

  verificar(post: Post): void {
    if (!this.authService.canVerify()) return;

    this.foroService.verificar(post.id).subscribe({
      next: () => {
        this.recargarHilo();
      }
    });
  }

  cerrarHilo(): void {
    const currentThread = this.thread();
    if (!currentThread || currentThread.author_id !== this.authService.user()?.id) return;

    this.foroService.cerrar(this.id).subscribe({
      next: () => {
        this.recargarHilo();
      }
    });
  }

  marcarMejorRespuesta(post: Post): void {
    const currentThread = this.thread();
    if (!currentThread || currentThread.author_id !== this.authService.user()?.id) return;

    this.foroService.mejorRespuesta(this.id, post.id).subscribe({
      next: () => {
        this.recargarHilo();
      }
    });
  }

  borrarHilo(): void {
    const currentThread = this.thread();
    if (!currentThread || currentThread.author_id !== this.authService.user()?.id) return;

    if (confirm('¿Estás seguro de que deseas eliminar este tema por completo?')) {
      this.foroService.borrarHilo(this.id).subscribe({
        next: () => {
          this.router.navigate(['/constitucion/foro']);
        }
      });
    }
  }

  borrarRespuesta(post: Post): void {
    if (post.author_id !== this.authService.user()?.id) return;

    if (confirm('¿Estás seguro de que deseas eliminar esta respuesta?')) {
      this.foroService.borrarRespuesta(post.id).subscribe({
        next: () => {
          this.recargarHilo();
        }
      });
    }
  }
}
