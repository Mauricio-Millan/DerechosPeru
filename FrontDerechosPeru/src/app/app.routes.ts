import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-panel.component').then(m => m.AdminPanelComponent),
  },
  {
    path: 'admin/usuarios',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/usuarios.component').then(m => m.UsuariosComponent),
  },
  {
    path: 'admin/ingesta',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/ingesta/ingesta.component').then(m => m.IngestaComponent),
  },
  {
    path: 'admin/ingesta/:versionId/revisar',
    canActivate: [adminGuard],
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
