export type FuenteLookup = 'local' | 'externa' | 'simulada';

export interface ResultadoLookup {
  encontrado: boolean;
  simulado: boolean;
  fuente: FuenteLookup;
  clienteId?: number;
  rut?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  detalle?: string;
}
