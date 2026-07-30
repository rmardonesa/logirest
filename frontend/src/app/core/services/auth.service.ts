import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface RespuestaLogin {
  access_token: string;
  token_type: string;
  expires_in: string;
}

const CLAVE_TOKEN = 'logirest-token';

const CLAVE_USUARIO = 'logirest-usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  readonly usuario = signal<string | null>(
    localStorage.getItem(CLAVE_USUARIO),
  );

  readonly autenticado = computed(() => this.token() !== null);

  async iniciarSesion(usuario: string, password: string): Promise<void> {
    const respuesta = await firstValueFrom(
      this.http.post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, {
        usuario,
        password,
      }),
    );

    this.token.set(respuesta.access_token);
    this.usuario.set(usuario);
    localStorage.setItem(CLAVE_TOKEN, respuesta.access_token);
    localStorage.setItem(CLAVE_USUARIO, usuario);
  }

  cerrarSesion(): void {
    this.token.set(null);
    this.usuario.set(null);
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
  }
}
