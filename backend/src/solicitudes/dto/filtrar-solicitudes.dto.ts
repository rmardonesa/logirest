import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginacionDto } from '../../common/dto/paginacion.dto';
import { ESTADOS_SOLICITUD } from '../solicitud.constants';
import type { EstadoSolicitud } from '../solicitud.constants';

export const ORDENES = ['ASC', 'DESC'] as const;

export type Orden = (typeof ORDENES)[number];

export class FiltrarSolicitudesDto extends PaginacionDto {
  @IsOptional()
  @IsString({ message: 'search debe ser un texto' })
  search?: string;

  @IsOptional()
  @IsIn(ESTADOS_SOLICITUD, {
    message: `estado debe ser uno de: ${ESTADOS_SOLICITUD.join(', ')}`,
  })
  estado?: EstadoSolicitud;

  @IsOptional()
  @IsIn(ORDENES, { message: 'order debe ser ASC o DESC' })
  order: Orden = 'DESC';
}
