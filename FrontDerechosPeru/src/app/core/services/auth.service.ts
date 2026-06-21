import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AuthError,
  Session,
  SupabaseClient,
  User,
  createClient,
} from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export type Rol = 'ciudadano' | 'redactor' | 'experto' | 'editor' | 'admin';

interface AuthResult {
  ok: boolean;
  error?: string;
}

/**
 * Envuelve Supabase Auth. Supabase emite y refresca el JWT; el backend solo
 * lo verifica. Solo se instancia en el navegador (SSR-safe).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly supabase: SupabaseClient | null = this.isBrowser
    ? createClient(environment.supabaseUrl, environment.supabaseAnonKey)
    : null;

  private readonly _session = signal<Session | null>(null);
  /** Rol del JWT (claim 'role' propio); se confirma contra el back en cada request protegido. */
  private readonly _rol = signal<Rol>('ciudadano');

  readonly session = this._session.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => this._session() != null);
  readonly rol = this._rol.asReadonly();
  readonly isAdmin = computed(() => this._rol() === 'admin');

  constructor() {
    if (!this.supabase) return;
    this.supabase.auth.getSession().then(({ data }) => this.apply(data.session));
    this.supabase.auth.onAuthStateChange((_e, session) => this.apply(session));
  }

  accessToken(): string | null {
    return this._session()?.access_token ?? null;
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!this.supabase) return { ok: false, error: 'No disponible' };
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return this.toResult(error);
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    if (!this.supabase) return { ok: false, error: 'No disponible' };
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return this.toResult(error);
  }

  async logout(): Promise<void> {
    await this.supabase?.auth.signOut();
  }

  private apply(session: Session | null): void {
    this._session.set(session);
    if (!session) {
      this._rol.set('ciudadano');
      return;
    }
    // El rol canónico vive en profile (backend). Lo consultamos vía /me;
    // el interceptor adjunta el token de la sesión recién aplicada.
    this.http.get<{ role: Rol }>(`${environment.apiUrl}/me`).subscribe({
      next: r => this._rol.set(r.role ?? 'ciudadano'),
      error: () => this._rol.set('ciudadano'),
    });
  }

  private toResult(error: AuthError | null): AuthResult {
    return error ? { ok: false, error: error.message } : { ok: true };
  }
}
