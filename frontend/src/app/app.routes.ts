import { Routes } from '@angular/router';
import { Layout } from './shared/components/layout/layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesion | logirest',
    loadComponent: () =>
      import('./features/login/login').then((modulo) => modulo.Login),
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
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
    ],
  },
  {
    path: '**',
    redirectTo: 'resumen',
  },
];
