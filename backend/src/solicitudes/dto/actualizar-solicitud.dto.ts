import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ESTADOS_SOLICITUD, TIPOS_SOLICITUD } from '../solicitud.constants';
import type { EstadoSolicitud, TipoSolicitud } from '../solicitud.constants';

export class ActualizarSolicitudDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha?: string;

  @IsOptional()
  @IsIn(TIPOS_SOLICITUD, {
    message: `tipoSolicitud debe ser uno de: ${TIPOS_SOLICITUD.join(', ')}`,
  })
  tipoSolicitud?: TipoSolicitud;

  @IsOptional()
  @IsString({ message: 'descripcion debe ser un texto' })
  @IsNotEmpty({ message: 'descripcion no puede quedar vacia' })
  @MaxLength(1000, { message: 'descripcion no puede superar 1000 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsIn(ESTADOS_SOLICITUD, {
    message: `estado debe ser uno de: ${ESTADOS_SOLICITUD.join(', ')}`,
  })
  estado?: EstadoSolicitud;
}
