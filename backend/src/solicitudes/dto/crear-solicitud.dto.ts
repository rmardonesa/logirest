import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { TIPOS_SOLICITUD } from '../solicitud.constants';
import type { TipoSolicitud } from '../solicitud.constants';

export class CrearSolicitudDto {
  @IsInt({ message: 'clienteId debe ser un numero entero' })
  @Min(1, { message: 'clienteId debe ser mayor que cero' })
  clienteId: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'fecha debe tener formato YYYY-MM-DD',
  })
  fecha: string;

  @IsIn(TIPOS_SOLICITUD, {
    message: `tipoSolicitud debe ser uno de: ${TIPOS_SOLICITUD.join(', ')}`,
  })
  tipoSolicitud: TipoSolicitud;

  @IsString({ message: 'descripcion debe ser un texto' })
  @IsNotEmpty({ message: 'descripcion es obligatoria' })
  @MaxLength(1000, { message: 'descripcion no puede superar 1000 caracteres' })
  descripcion: string;
}
