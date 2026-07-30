import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EstadoSolicitud } from '../../../core/models/solicitud.model';

const CLASES_POR_ESTADO: Record<EstadoSolicitud, string> = {
  Pendiente: 'pendiente',
  'En proceso': 'en-proceso',
  Finalizada: 'finalizada',
  Rechazada: 'rechazada',
};

@Component({
  selector: 'app-estado-badge',
  templateUrl: './estado-badge.html',
  styleUrl: './estado-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadoBadge {
  readonly estado = input.required<EstadoSolicitud>();

  protected readonly clase = computed(() => CLASES_POR_ESTADO[this.estado()]);
}
