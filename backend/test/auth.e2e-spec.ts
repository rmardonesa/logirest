import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let usuario: string;
  let password: string;
  let expiracion: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app);
    await app.init();

    const configService = app.get(ConfigService);
    usuario = configService.getOrThrow<string>('AUTH_USUARIO');
    password = configService.getOrThrow<string>('AUTH_PASSWORD');
    expiracion = configService.get<string>('JWT_EXPIRES_IN', '8h');
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login entrega un token con credenciales validas', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario, password })
      .expect(200);

    expect(respuesta.body).toEqual({
      access_token: expect.any(String) as string,
      token_type: 'Bearer',
      expires_in: expiracion,
    });
  });

  it('POST /auth/login responde 401 con credenciales incorrectas', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario, password: `${password}-invalida` })
      .expect(401);

    expect(respuesta.body).toEqual({
      statusCode: 401,
      message: 'Usuario o password incorrectos',
      path: '/auth/login',
    });
  });

  it('POST /auth/login responde 400 cuando falta un campo', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario })
      .expect(400);

    expect(respuesta.body).toMatchObject({
      statusCode: 400,
      path: '/auth/login',
    });
    expect(respuesta.body).toHaveProperty('message', expect.any(String));
  });

  it('POST /auth/login rechaza campos no declarados en el contrato', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario, password, rol: 'root' })
      .expect(400);
  });

  it('responde los errores no controlados con la convencion global', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/ruta-inexistente')
      .expect(404);

    expect(respuesta.body).toEqual({
      statusCode: 404,
      message: 'Cannot GET /ruta-inexistente',
      path: '/ruta-inexistente',
    });
  });
});
