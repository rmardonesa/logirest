import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ResumenDashboard } from '../../core/models/dashboard.model';
import { TarjetaEstadistica } from '../../shared/components/tarjeta-estadistica/tarjeta-estadistica';
import { EstadoBadge } from '../../shared/components/estado-badge/estado-badge';

@Component({
  selector: 'app-dashboard',
  imports: [TarjetaEstadistica, EstadoBadge, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly resumen = signal<ResumenDashboard | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.dashboardService
      .obtenerResumen()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resumen) => {
          this.resumen.set(resumen);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudo cargar el resumen. Verifica que el backend este disponible.',
          );
          this.cargando.set(false);
        },
      });
  }
}
