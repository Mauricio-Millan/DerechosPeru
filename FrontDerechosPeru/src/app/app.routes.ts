import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { staffGuard } from './core/guards/staff.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'admin',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./features/admin/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'ingesta',
        loadComponent: () =>
          import('./features/admin/ingesta/ingesta.component').then(m => m.IngestaComponent),
      },
    ],
  },
  {
    // Pantalla completa (PDF | artículos): fuera del layout para usar todo el alto.
    path: 'admin/ingesta/:versionId/revisar',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./features/admin/ingesta/revision.component').then(m => m.RevisionComponent),
  },
  {
    path: 'constitucion',
    loadComponent: () =>
      import('./features/constitucion/layout/constitucion-layout.component').then(
        m => m.ConstitucionLayoutComponent
      ),
    children: [
      {
        path: 'estructura',
        loadComponent: () =>
          import('./features/constitucion/estructura/estructura.component').then(
            m => m.EstructuraComponent
          ),
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('./features/constitucion/buscar/buscar.component').then(
            m => m.BuscarComponent
          ),
      },
      {
        path: 'comparador',
        loadComponent: () =>
          import('./features/constitucion/comparador/comparador.component').then(
            m => m.ComparadorComponent
          ),
      },
      {
        path: 'guardados',
        loadComponent: () =>
          import('./features/constitucion/guardados/guardados.component').then(
            m => m.GuardadosComponent
          ),
      },
      {
        path: 'foro',
        loadComponent: () =>
          import('./features/foro/foro.component').then(m => m.ForoComponent),
      },
      {
        path: 'foro/:id',
        loadComponent: () =>
          import('./features/foro/hilo.component').then(m => m.HiloComponent),
      },
      {
        path: 'historia',
        loadComponent: () =>
          import('./features/constitucion/historia/historia.component').then(m => m.HistoriaComponent),
      },
      {
        path: 'examen',
        loadComponent: () =>
          import('./features/examen/examen.component').then(m => m.ExamenComponent),
      },
      {
        path: 'examen/quiz/:nivel',
        loadComponent: () =>
          import('./features/examen/quiz.component').then(m => m.QuizComponent),
      },
      {
        path: '',
        redirectTo: 'estructura',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'constitucion/estructura',
    pathMatch: 'full',
  },
];
