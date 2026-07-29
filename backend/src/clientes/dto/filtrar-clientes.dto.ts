import { IsOptional, IsString } from 'class-validator';
import { PaginacionDto } from '../../common/dto/paginacion.dto';

export class FiltrarClientesDto extends PaginacionDto {
  @IsOptional()
  @IsString({ message: 'search debe ser un texto' })
  search?: string;
}
