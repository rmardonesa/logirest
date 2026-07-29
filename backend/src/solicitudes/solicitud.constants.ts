export const TIPOS_SOLICITUD = [
  'Pedido nuevo',
  'Cambio de direccion',
  'Retraso o extravio',
  'Cancelacion',
  'Devolucion',
  'Reprogramacion',
  'Consulta de estado',
] as const;

export const ESTADOS_SOLICITUD = [
  'Pendiente',
  'En proceso',
  'Finalizada',
  'Rechazada',
] as const;

export type TipoSolicitud = (typeof TIPOS_SOLICITUD)[number];

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export const ESTADO_INICIAL: EstadoSolicitud = 'Pendiente';

export const ESTADO_CIERRE: EstadoSolicitud = 'Finalizada';

const toSqlList = (valores: readonly string[]): string =>
  valores.map((valor) => `'${valor}'`).join(', ');

export const CHECK_TIPO_SOLICITUD = `tipo_solicitud IN (${toSqlList(TIPOS_SOLICITUD)})`;

export const CHECK_ESTADO_SOLICITUD = `estado IN (${toSqlList(ESTADOS_SOLICITUD)})`;
