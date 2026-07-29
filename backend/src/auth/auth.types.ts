export type DuracionToken = `${number}${'s' | 'm' | 'h' | 'd'}`;

export interface TokenRespuesta {
  access_token: string;
  token_type: 'Bearer';
  expires_in: string;
}

export interface JwtPayload {
  sub: string;
  usuario: string;
  iat?: number;
  exp?: number;
}

export interface UsuarioAutenticado {
  usuario: string;
}
