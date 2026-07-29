import type { Solicitud } from '../solicitudes/entities/solicitud.entity';

export interface ResumenDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizadas: number;
  rechazadas: number;
  recientes: Solicitud[];
}
