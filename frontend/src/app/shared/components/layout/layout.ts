import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

const ZONA_HORARIA = 'America/Santiago';

const ANCHO_ESCRITORIO = 1024;

const INTERVALO_RELOJ = 1000;

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Layout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly consultaEscritorio = window.matchMedia(
    `(min-width: ${ANCHO_ESCRITORIO}px)`,
  );

  private readonly formatoFechaLarga = new Intl.DateTimeFormat('es-CL', {
    timeZone: ZONA_HORARIA,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  private readonly formatoFechaCorta = new Intl.DateTimeFormat('es-CL', {
    timeZone: ZONA_HORARIA,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  private readonly formatoHora = new Intl.DateTimeFormat('es-CL', {
    timeZone: ZONA_HORARIA,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  protected readonly tema = this.themeService.tema;
  protected readonly usuario = this.authService.usuario;
  protected readonly barraAbierta = signal(this.consultaEscritorio.matches);
  protected readonly fechaLarga = signal('');
  protected readonly fechaCorta = signal('');
  protected readonly hora = signal('');

  constructor() {
    this.actualizarReloj();

    const intervalo = setInterval(
      () => this.actualizarReloj(),
      INTERVALO_RELOJ,
    );

    const alCruzarElUmbral = (evento: MediaQueryListEvent) => {
      this.barraAbierta.set(evento.matches);
    };

    this.consultaEscritorio.addEventListener('change', alCruzarElUmbral);

    this.destroyRef.onDestroy(() => {
      clearInterval(intervalo);
      this.consultaEscritorio.removeEventListener('change', alCruzarElUmbral);
    });
  }

  protected alternarBarra(): void {
    this.barraAbierta.update((abierta) => !abierta);
  }

  protected cerrarBarraEnMovil(): void {
    if (!this.consultaEscritorio.matches) {
      this.barraAbierta.set(false);
    }
  }

  protected alternarTema(): void {
    this.themeService.alternar();
  }

  protected cerrarSesion(): void {
    this.authService.cerrarSesion();
    void this.router.navigate(['/login']);
  }

  private actualizarReloj(): void {
    const ahora = new Date();

    this.fechaLarga.set(this.formatoFechaLarga.format(ahora));
    this.fechaCorta.set(this.formatoFechaCorta.format(ahora));
    this.hora.set(this.formatoHora.format(ahora));
  }
}
