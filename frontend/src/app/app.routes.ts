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
      {
        path: 'prospectos',
        title: 'Prospectos | logirest',
        loadComponent: () =>
          import('./features/prospectos/prospectos').then(
            (modulo) => modulo.Prospectos,
          ),
      },
      {
        path: 'solicitudes/nueva',
        title: 'Nueva solicitud | logirest',
        loadComponent: () =>
          import(
            './features/solicitudes/formulario-solicitud/formulario-solicitud'
          ).then((modulo) => modulo.FormularioSolicitud),
      },
      {
        path: 'solicitudes/:id/editar',
        title: 'Editar solicitud | logirest',
        loadComponent: () =>
          import(
            './features/solicitudes/formulario-solicitud/formulario-solicitud'
          ).then((modulo) => modulo.FormularioSolicitud),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'resumen',
  },
];
