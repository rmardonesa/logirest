import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ESTADOS_SOLICITUD } from '../solicitud.constants';
import type { EstadoSolicitud } from '../solicitud.constants';

export const ORDENES = ['ASC', 'DESC'] as const;

export type Orden = (typeof ORDENES)[number];

export const PAGINA_POR_DEFECTO = 1;

export const LIMITE_POR_DEFECTO = 10;

export const LIMITE_MAXIMO = 100;

export class FiltrarSolicitudesDto {
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

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page debe ser un numero entero' })
  @Min(1, { message: 'page debe ser mayor que cero' })
  page: number = PAGINA_POR_DEFECTO;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un numero entero' })
  @Min(1, { message: 'limit debe ser mayor que cero' })
  @Max(LIMITE_MAXIMO, { message: `limit no puede superar ${LIMITE_MAXIMO}` })
  limit: number = LIMITE_POR_DEFECTO;
}
