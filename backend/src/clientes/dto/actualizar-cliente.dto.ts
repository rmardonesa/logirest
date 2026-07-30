import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, Validate } from 'class-validator';
import { RutValidoConstraint } from '../validators/rut.validator';

export const TIPOS_CLIENTE = ['persona natural', 'empresa'] as const;

export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

export class ActualizarClienteDto {
  @IsOptional()
  @Validate(RutValidoConstraint)
  rut?: string;

  @IsString({ message: 'nombre debe ser un texto' })
  @IsNotEmpty({ message: 'nombre es obligatorio' })
  @MaxLength(120, { message: 'nombre no puede superar 120 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'email debe ser una direccion valida' })
  @MaxLength(160, { message: 'email no puede superar 160 caracteres' })
  email: string;

  @IsOptional()
  @IsString({ message: 'telefono debe ser un texto' })
  @MaxLength(20, { message: 'telefono no puede superar 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsIn(TIPOS_CLIENTE, {
    message: `tipo debe ser uno de: ${TIPOS_CLIENTE.join(', ')}`,
  })
  tipo?: TipoCliente;
}
