import type { Solicitud } from '../solicitudes/entities/solicitud.entity';

export interface ConteoEtiquetado {
  etiqueta: string;
  cantidad: number;
}

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
