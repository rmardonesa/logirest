import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const PAGINA_POR_DEFECTO = 1;

export const LIMITE_POR_DEFECTO = 10;

export const LIMITE_MAXIMO = 100;

export class PaginacionDto {
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
