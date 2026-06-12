import { Routes } from '@angular/router';

export const routes: Routes = [
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
