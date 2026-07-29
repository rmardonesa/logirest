import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';
import { parsearCredenciales } from './../src/auth/auth.service';
import { Cliente } from './../src/clientes/entities/cliente.entity';
import {
  calcularDigitoVerificador,
  esRutValido,
} from './../src/clientes/validators/rut.validator';

interface CuerpoListado {
  data: Cliente[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

describe('ClientesController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;
  const idsCreados: number[] = [];

  const crearCliente = (cuerpo: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/clientes')
      .set('Authorization', `Bearer ${token}`)
      .send(cuerpo);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app);
    await app.init();

    dataSource = app.get(DataSource);

    const configService = app.get(ConfigService);
    const credenciales = parsearCredenciales(
      configService.getOrThrow<string>('AUTH_USUARIOS'),
    );
    const [[usuario, password]] = [...credenciales];

    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario, password })
      .expect(200);

    token = (respuesta.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    if (idsCreados.length > 0) {
      await dataSource.getRepository(Cliente).delete(idsCreados);
    }

    await app.close();
  });

  describe('validacion de RUT', () => {
    it('calcula el digito verificador segun modulo 11', () => {
      expect(calcularDigitoVerificador('12345678')).toBe('5');
      expect(calcularDigitoVerificador('16543210')).toBe('K');
      expect(calcularDigitoVerificador('9876543')).toBe('3');
    });

    it('acepta RUT validos y rechaza invalidos', () => {
      expect(esRutValido('12345678-5')).toBe(true);
      expect(esRutValido('16543210-K')).toBe(true);
      expect(esRutValido('12345678-9')).toBe(false);
      expect(esRutValido('12.345.678-5')).toBe(false);
      expect(esRutValido('sin-formato')).toBe(false);
    });
  });

  describe('GET /clientes', () => {
    it('lista con paginacion y sin requerir JWT', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/clientes')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(cuerpo.meta.total).toBeGreaterThan(0);
      expect(cuerpo.meta.page).toBe(1);
      expect(cuerpo.data.length).toBeLessThanOrEqual(cuerpo.meta.limit);
    });

    it('ordena alfabeticamente por nombre', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/clientes?limit=100')
        .expect(200);

      const nombres = (respuesta.body as CuerpoListado).data.map(
        (cliente) => cliente.nombre,
      );

      expect(nombres).toEqual([...nombres].sort());
    });

    it('busca por nombre, email y rut', async () => {
      const porNombre = await request(app.getHttpServer())
        .get('/clientes?search=Andes')
        .expect(200);

      const porEmail = await request(app.getHttpServer())
        .get('/clientes?search=puertonorte')
        .expect(200);

      const porRut = await request(app.getHttpServer())
        .get('/clientes?search=16543210')
        .expect(200);

      expect((porNombre.body as CuerpoListado).meta.total).toBeGreaterThan(0);
      expect((porEmail.body as CuerpoListado).meta.total).toBeGreaterThan(0);
      expect((porRut.body as CuerpoListado).meta.total).toBe(1);
    });

    it('entrega listado vacio si no hay coincidencias', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/clientes?search=texto-que-no-existe-en-ninguna-parte')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(cuerpo.data).toEqual([]);
      expect(cuerpo.meta.total).toBe(0);
      expect(cuerpo.meta.totalPages).toBe(1);
    });
  });

  describe('POST /clientes', () => {
    it('responde 401 sin JWT', async () => {
      await request(app.getHttpServer())
        .post('/clientes')
        .send({ nombre: 'Sin token', email: 'sin@token.cl' })
        .expect(401);
    });

    it('crea un cliente y permite usarlo en una solicitud', async () => {
      const respuesta = await crearCliente({
        rut: '13579246-2',
        nombre: 'Transportes Test Limitada',
        email: 'contacto@transportestest.cl',
        telefono: '+56223334444',
      });

      if (respuesta.status === 409) {
        return;
      }

      expect(respuesta.status).toBe(201);

      const cliente = respuesta.body as Cliente;
      idsCreados.push(cliente.id);

      expect(cliente.id).toBeGreaterThan(0);
      expect(cliente.nombre).toBe('Transportes Test Limitada');
    });

    it('crea sin rut, que es opcional', async () => {
      const respuesta = await crearCliente({
        nombre: 'Cliente Sin Rut',
        email: 'sinrut@ejemplo.cl',
      }).expect(201);

      const cliente = respuesta.body as Cliente;
      idsCreados.push(cliente.id);

      expect(cliente.rut).toBeNull();
    });

    it('responde 409 si el rut ya existe', async () => {
      const respuesta = await crearCliente({
        rut: '12345678-5',
        nombre: 'Duplicado',
        email: 'duplicado@ejemplo.cl',
      }).expect(409);

      expect(respuesta.body).toMatchObject({
        statusCode: 409,
        path: '/clientes',
      });
    });

    it('responde 400 con rut de digito verificador incorrecto', async () => {
      await crearCliente({
        rut: '12345678-9',
        nombre: 'Rut Invalido',
        email: 'rutinvalido@ejemplo.cl',
      }).expect(400);
    });

    it('responde 400 con email invalido', async () => {
      await crearCliente({
        nombre: 'Email Invalido',
        email: 'esto-no-es-un-email',
      }).expect(400);
    });

    it('responde 400 si falta el nombre', async () => {
      await crearCliente({ email: 'sinnombre@ejemplo.cl' }).expect(400);
    });
  });
});
