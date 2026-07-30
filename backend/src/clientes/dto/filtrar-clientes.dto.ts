import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginacionDto } from '../../common/dto/paginacion.dto';

export const TIPOS_CLIENTE = ['persona natural', 'empresa'] as const;

export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

export class FiltrarClientesDto extends PaginacionDto {
  @IsOptional()
  @IsString({ message: 'search debe ser un texto' })
  search?: string;

  @IsOptional()
  @IsIn(TIPOS_CLIENTE, {
    message: `tipo debe ser uno de: ${TIPOS_CLIENTE.join(', ')}`,
  })
  tipo?: TipoCliente;
}
