import { Cliente } from './cliente.model';

export const ESTADOS_SOLICITUD = [
  'Pendiente',
  'En proceso',
  'Finalizada',
  'Rechazada',
] as const;

export const TIPOS_SOLICITUD = [
  'Pedido nuevo',
  'Cambio de direccion',
  'Retraso o extravio',
  'Cancelacion',
  'Devolucion',
  'Reprogramacion',
  'Consulta de estado',
] as const;

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export type TipoSolicitud = (typeof TIPOS_SOLICITUD)[number];

export type OrdenFecha = 'ASC' | 'DESC';

export interface Solicitud {
  id: number;
  numero: string;
  clienteId: number;
  cliente: Cliente;
  fecha: string;
  tipoSolicitud: TipoSolicitud;
  estado: EstadoSolicitud;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiltrosSolicitudes {
  search: string;
  estado: EstadoSolicitud | '';
  order: OrdenFecha;
  page: number;
  limit: number;
}
