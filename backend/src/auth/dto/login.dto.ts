import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'usuario debe ser un texto' })
  @IsNotEmpty({ message: 'usuario es obligatorio' })
  usuario: string;

  @IsString({ message: 'password debe ser un texto' })
  @IsNotEmpty({ message: 'password es obligatorio' })
  password: string;
}
