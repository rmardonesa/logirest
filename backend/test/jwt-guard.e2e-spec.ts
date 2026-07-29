import {
  Controller,
  Get,
  INestApplication,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';
import { JwtAuthGuard } from './../src/auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from './../src/auth/auth.types';
import { parsearCredenciales } from './../src/auth/auth.service';

@Controller('recurso-protegido')
class RecursoProtegidoController {
  @UseGuards(JwtAuthGuard)
  @Get()
  obtener(
    @Req() peticion: Request & { user: UsuarioAutenticado },
  ): UsuarioAutenticado {
    return peticion.user;
  }
}

describe('JwtAuthGuard (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let usuario: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [RecursoProtegidoController],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app);
    await app.init();

    const configService = app.get(ConfigService);
    jwtService = app.get(JwtService);

    const credenciales = parsearCredenciales(
      configService.getOrThrow<string>('AUTH_USUARIOS'),
    );
    const [[usuarioConfigurado, password]] = [...credenciales];
    usuario = usuarioConfigurado;

    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario, password })
      .expect(200);

    token = (respuesta.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('permite el acceso con un token valido y expone el usuario autenticado', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/recurso-protegido')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(respuesta.body).toEqual({ usuario });
  });

  it('responde 401 sin cabecera de autorizacion', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/recurso-protegido')
      .expect(401);

    expect(respuesta.body).toEqual({
      statusCode: 401,
      message: 'Token invalido o ausente',
      path: '/recurso-protegido',
    });
  });

  it('responde 401 con un token malformado', async () => {
    await request(app.getHttpServer())
      .get('/recurso-protegido')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });

  it('responde 401 con un token expirado', async () => {
    const tokenExpirado = jwtService.sign(
      { sub: usuario, usuario },
      { expiresIn: '-1s' },
    );

    await request(app.getHttpServer())
      .get('/recurso-protegido')
      .set('Authorization', `Bearer ${tokenExpirado}`)
      .expect(401);
  });
});
