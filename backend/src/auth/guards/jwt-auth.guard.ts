import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(error: unknown, usuario: TUser | false): TUser {
    if (error || !usuario) {
      throw new UnauthorizedException('Token invalido o ausente');
    }

    return usuario;
  }
}
