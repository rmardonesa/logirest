import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { TokenRespuesta } from './auth.types';
import { EXPIRACION_POR_DEFECTO } from './auth.constants';

export const parsearCredenciales = (
  definicion: string,
): ReadonlyMap<string, string> => {
  const credenciales = definicion
    .split(',')
    .map((entrada) => entrada.trim())
    .filter((entrada) => entrada.length > 0)
    .map((entrada): [string, string] => {
      const separador = entrada.indexOf(':');

      if (separador <= 0 || separador === entrada.length - 1) {
        throw new Error(
          `AUTH_USUARIOS tiene una entrada invalida: "${entrada}". Formato esperado usuario:password`,
        );
      }

      return [entrada.slice(0, separador), entrada.slice(separador + 1)];
    });

  if (credenciales.length === 0) {
    throw new Error('AUTH_USUARIOS no define ninguna credencial');
  }

  return new Map(credenciales);
};

@Injectable()
export class AuthService {
  private readonly credenciales: ReadonlyMap<string, string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.credenciales = parsearCredenciales(
      this.configService.getOrThrow<string>('AUTH_USUARIOS'),
    );
  }

  login(credenciales: LoginDto): TokenRespuesta {
    if (this.credenciales.get(credenciales.usuario) !== credenciales.password) {
      throw new UnauthorizedException('Usuario o password incorrectos');
    }

    return {
      access_token: this.jwtService.sign({
        sub: credenciales.usuario,
        usuario: credenciales.usuario,
      }),
      token_type: 'Bearer',
      expires_in: this.configService.get<string>(
        'JWT_EXPIRES_IN',
        EXPIRACION_POR_DEFECTO,
      ),
    };
  }
}
