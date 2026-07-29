import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { TokenRespuesta } from './auth.types';
import { EXPIRACION_POR_DEFECTO } from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(credenciales: LoginDto): TokenRespuesta {
    if (!this.sonCredencialesValidas(credenciales)) {
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

  private sonCredencialesValidas(credenciales: LoginDto): boolean {
    return (
      credenciales.usuario ===
        this.configService.getOrThrow<string>('AUTH_USUARIO') &&
      credenciales.password ===
        this.configService.getOrThrow<string>('AUTH_PASSWORD')
    );
  }
}
