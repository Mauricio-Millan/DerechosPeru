import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'constitucion/estructura', renderMode: RenderMode.Client },
  { path: 'constitucion/buscar', renderMode: RenderMode.Client },
  { path: 'constitucion/guardados', renderMode: RenderMode.Client },
  { path: '', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Client },
];
