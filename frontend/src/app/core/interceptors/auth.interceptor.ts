import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const RUTA_LOGIN = '/auth/login';

export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  const autorizada = token
    ? peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : peticion;

  return siguiente(autorizada).pipe(
    catchError((error: HttpErrorResponse) => {
      const esIntentoDeLogin = peticion.url.endsWith(RUTA_LOGIN);

      if (error.status === 401 && !esIntentoDeLogin) {
        authService.cerrarSesion();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
