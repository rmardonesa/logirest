export const FUENTES_LOOKUP = ['local', 'externa', 'simulada'] as const;

export type FuenteLookup = (typeof FUENTES_LOOKUP)[number];

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
