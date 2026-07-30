import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';
import { ClienteLookupService } from './../src/cliente-lookup/cliente-lookup.service';
import type { ResultadoLookup } from './../src/cliente-lookup/cliente-lookup.types';

const RUT_LOCAL = '12345678-5';

const RUT_EXTERNO = '17456921-4';

const RUT_DESCONOCIDO = '20999888-7';

describe('ClienteLookupController (e2e)', () => {
  let app: INestApplication<App>;
  let servicio: ClienteLookupService;

  const consultar = async (query: string): Promise<ResultadoLookup> => {
    const respuesta = await request(app.getHttpServer())
      .get(`/cliente-lookup?query=${encodeURIComponent(query)}`)
      .expect(200);

    return respuesta.body as ResultadoLookup;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app);
    await app.init();
    await app.listen(0);

    servicio = app.get(ClienteLookupService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('nivel local', () => {
    it('resuelve por RUT un cliente que ya existe en logirest', async () => {
      const resultado = await consultar(RUT_LOCAL);

      expect(resultado.encontrado).toBe(true);
      expect(resultado.simulado).toBe(false);
      expect(resultado.fuente).toBe('local');
      expect(resultado.clienteId).toEqual(expect.any(Number));
      expect(resultado.nombre).toBe('Distribuidora Andes Limitada');
    });

    it('resuelve por email sin distinguir mayusculas', async () => {
      const resultado = await consultar('CONTACTO@DISTRIBUIDORAANDES.CL');

      expect(resultado.fuente).toBe('local');
      expect(resultado.clienteId).toEqual(expect.any(Number));
    });

    it('resuelve el RUT aunque venga sin guion', async () => {
      const resultado = await consultar('123456785');

      expect(resultado.fuente).toBe('local');
    });
  });

  describe('nivel externo', () => {
    it('trae del proveedor un cliente que no existe localmente', async () => {
      const resultado = await consultarConProveedor(
        servicio,
        urlProveedor(app),
        RUT_EXTERNO,
        2500,
      );

      expect(resultado.encontrado).toBe(true);
      expect(resultado.simulado).toBe(false);
      expect(resultado.fuente).toBe('externa');
      expect(resultado.nombre).toBe('Transportes Aconcagua SpA');
      expect(resultado.clienteId).toBeUndefined();
    });

    it('informa no encontrado cuando el registro externo no tiene el RUT', async () => {
      const resultado = await consultarConProveedor(
        servicio,
        urlProveedor(app),
        RUT_DESCONOCIDO,
        2500,
      );

      expect(resultado.encontrado).toBe(false);
      expect(resultado.simulado).toBe(false);
      expect(resultado.fuente).toBe('externa');
    });
  });

  describe('degradacion ante fallas del proveedor', () => {
    it('responde simulado cuando el proveedor excede el timeout', async () => {
      const lento = await consultarConProveedor(
        servicio,
        `${urlProveedor(app)}?demora=4000`,
        RUT_EXTERNO,
        500,
      );

      expect(lento.encontrado).toBe(true);
      expect(lento.simulado).toBe(true);
      expect(lento.fuente).toBe('simulada');
      expect(lento.detalle).toContain('timeout');
    });

    it('responde simulado cuando el proveedor devuelve error', async () => {
      const caido = await consultarConProveedor(
        servicio,
        `${urlProveedor(app)}?falla=true`,
        RUT_EXTERNO,
        2500,
      );

      expect(caido.encontrado).toBe(true);
      expect(caido.simulado).toBe(true);
      expect(caido.fuente).toBe('simulada');
    });

    it('responde simulado cuando el proveedor es inalcanzable', async () => {
      const inalcanzable = await consultarConProveedor(
        servicio,
        'http://127.0.0.1:1/proveedor-externo/clientes',
        RUT_EXTERNO,
        2500,
      );

      expect(inalcanzable.encontrado).toBe(true);
      expect(inalcanzable.simulado).toBe(true);
      expect(inalcanzable.fuente).toBe('simulada');
    });

    it('nunca propaga un 500 al cliente', async () => {
      await request(app.getHttpServer())
        .get(`/cliente-lookup?query=${RUT_EXTERNO}`)
        .expect(200);
    });
  });

  describe('validacion de entrada', () => {
    it('responde 400 si falta el parametro query', async () => {
      await request(app.getHttpServer()).get('/cliente-lookup').expect(400);
    });

    it('responde 400 si query viene vacio', async () => {
      await request(app.getHttpServer())
        .get('/cliente-lookup?query=')
        .expect(400);
    });
  });
});

const urlProveedor = (app: INestApplication<App>): string => {
  const servidor = app.getHttpServer() as { address: () => { port: number } };
  const { port } = servidor.address();

  return `http://127.0.0.1:${port}/proveedor-externo/clientes`;
};

const consultarConProveedor = async (
  servicio: ClienteLookupService,
  url: string,
  termino: string,
  timeout: number,
): Promise<ResultadoLookup> => {
  const configService = servicio['configService'] as {
    get: (clave: string, porDefecto: string) => string;
  };
  const original = configService.get.bind(configService);

  configService.get = (clave: string, porDefecto: string) => {
    if (clave === 'PROVEEDOR_EXTERNO_URL') {
      return url;
    }

    if (clave === 'CLIENTE_LOOKUP_TIMEOUT_MS') {
      return String(timeout);
    }

    return original(clave, porDefecto);
  };

  try {
    return await servicio['consultarProveedor'](termino);
  } finally {
    configService.get = original;
  }
};
