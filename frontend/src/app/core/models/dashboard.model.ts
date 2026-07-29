import type { Solicitud } from './solicitud.model';

export interface ResumenDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizadas: number;
  rechazadas: number;
  recientes: Solicitud[];
}
