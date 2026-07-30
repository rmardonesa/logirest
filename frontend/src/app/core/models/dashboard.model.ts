import type { Solicitud } from './solicitud.model';
import type { ConteoEtiquetado } from './conteo.model';

export interface ResumenDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizadas: number;
  rechazadas: number;
  recientes: Solicitud[];
  porTipo: ConteoEtiquetado[];
  topEmpresas: ConteoEtiquetado[];
}
