import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'resumen',
  },
  {
    path: 'resumen',
    title: 'Resumen | logirest',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(
        (modulo) => modulo.Dashboard,
      ),
  },
  {
    path: 'solicitudes',
    title: 'Solicitudes | logirest',
    loadComponent: () =>
      import(
        './features/solicitudes/listado-solicitudes/listado-solicitudes'
      ).then((modulo) => modulo.ListadoSolicitudes),
  },
  {
    path: '**',
    redirectTo: 'resumen',
  },
];
