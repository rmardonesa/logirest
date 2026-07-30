import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConsultarClienteDto {
  @IsString({ message: 'query debe ser un texto' })
  @IsNotEmpty({ message: 'query es obligatorio' })
  @MaxLength(160, { message: 'query no puede superar 160 caracteres' })
  query: string;
}
