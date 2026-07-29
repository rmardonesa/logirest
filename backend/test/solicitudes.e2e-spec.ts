import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';
import { parsearCredenciales } from './../src/auth/auth.service';
import { Solicitud } from './../src/solicitudes/entities/solicitud.entity';
import { Cliente } from './../src/clientes/entities/cliente.entity';

interface CuerpoSolicitud {
  id: number;
  numero: string;
  estado: string;
  fecha: string;
  tipoSolicitud: string;
  descripcion: string;
  cliente?: Cliente;
}

interface CuerpoListado {
  data: CuerpoSolicitud[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

describe('SolicitudesController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let token: string;
  let clienteExistente: Cliente;
  const idsCreados: number[] = [];

  const crearSolicitud = (cuerpo: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/solicitudes')
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

    const cliente = await dataSource.getRepository(Cliente).findOne({
      where: {},
      order: { id: 'ASC' },
    });

    if (!cliente) {
      throw new Error('La base no tiene clientes, ejecuta npm run db:seed');
    }

    clienteExistente = cliente;
  });

  afterAll(async () => {
    if (idsCreados.length > 0) {
      await dataSource.getRepository(Solicitud).delete(idsCreados);
    }

    await app.close();
  });

  describe('GET /solicitudes', () => {
    it('lista con paginacion y sin requerir JWT', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(Array.isArray(cuerpo.data)).toBe(true);
      expect(cuerpo.meta.page).toBe(1);
      expect(cuerpo.meta.limit).toBe(10);
      expect(cuerpo.meta.total).toBeGreaterThan(0);
      expect(cuerpo.meta.totalPages).toBe(
        Math.ceil(cuerpo.meta.total / cuerpo.meta.limit),
      );
      expect(cuerpo.data.length).toBeLessThanOrEqual(cuerpo.meta.limit);
    });

    it('incluye los datos del cliente en cada solicitud', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes?limit=1')
        .expect(200);

      const [primera] = (respuesta.body as CuerpoListado).data;

      expect(primera.cliente).toBeDefined();
      expect(primera.cliente).toHaveProperty('nombre');
    });

    it('filtra por estado', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes?estado=Pendiente&limit=100')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(cuerpo.data.length).toBeGreaterThan(0);
      expect(cuerpo.data.every((item) => item.estado === 'Pendiente')).toBe(
        true,
      );
    });

    it('busca por nombre de cliente', async () => {
      const termino = clienteExistente.nombre.split(' ')[0];

      const respuesta = await request(app.getHttpServer())
        .get(`/solicitudes?search=${encodeURIComponent(termino)}&limit=100`)
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(cuerpo.data.length).toBeGreaterThan(0);
    });

    it('busca por numero de solicitud', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes?search=SOL-2026-0001')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoListado;

      expect(cuerpo.meta.total).toBe(1);
      expect(cuerpo.data[0].numero).toBe('SOL-2026-0001');
    });

    it('ordena por fecha ascendente y descendente', async () => {
      const ascendente = await request(app.getHttpServer())
        .get('/solicitudes?order=ASC&limit=100')
        .expect(200);

      const descendente = await request(app.getHttpServer())
        .get('/solicitudes?order=DESC&limit=100')
        .expect(200);

      const fechasAsc = (ascendente.body as CuerpoListado).data.map(
        (item) => item.fecha,
      );
      const fechasDesc = (descendente.body as CuerpoListado).data.map(
        (item) => item.fecha,
      );

      expect(fechasAsc).toEqual([...fechasAsc].sort());
      expect(fechasDesc).toEqual([...fechasDesc].sort().reverse());
    });

    it('respeta el tamano de pagina y no repite resultados entre paginas', async () => {
      const primera = await request(app.getHttpServer())
        .get('/solicitudes?page=1&limit=5')
        .expect(200);

      const segunda = await request(app.getHttpServer())
        .get('/solicitudes?page=2&limit=5')
        .expect(200);

      const idsPrimera = (primera.body as CuerpoListado).data.map(
        (item) => item.id,
      );
      const idsSegunda = (segunda.body as CuerpoListado).data.map(
        (item) => item.id,
      );

      expect(idsPrimera).toHaveLength(5);
      expect(idsPrimera.filter((id) => idsSegunda.includes(id))).toHaveLength(
        0,
      );
    });

    it('rechaza un estado fuera del catalogo', async () => {
      await request(app.getHttpServer())
        .get('/solicitudes?estado=Inventado')
        .expect(400);
    });
  });

  describe('GET /solicitudes/:id', () => {
    it('entrega la solicitud con su cliente', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes/1')
        .expect(200);

      const cuerpo = respuesta.body as CuerpoSolicitud;

      expect(cuerpo.id).toBe(1);
      expect(cuerpo.cliente).toBeDefined();
    });

    it('responde 404 si no existe', async () => {
      const respuesta = await request(app.getHttpServer())
        .get('/solicitudes/999999')
        .expect(404);

      expect(respuesta.body).toEqual({
        statusCode: 404,
        message: 'No existe la solicitud con id 999999',
        path: '/solicitudes/999999',
      });
    });
  });

  describe('POST /solicitudes', () => {
    it('responde 401 sin JWT', async () => {
      await request(app.getHttpServer())
        .post('/solicitudes')
        .send({
          clienteId: clienteExistente.id,
          fecha: '2026-07-29',
          tipoSolicitud: 'Pedido nuevo',
          descripcion: 'Solicitud sin autenticacion',
        })
        .expect(401);
    });

    it('crea con numero autogenerado y estado Pendiente', async () => {
      const respuesta = await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Pedido nuevo',
        descripcion: 'Despacho de prueba generado por el test e2e',
      }).expect(201);

      const cuerpo = respuesta.body as CuerpoSolicitud;
      idsCreados.push(cuerpo.id);

      expect(cuerpo.numero).toMatch(/^SOL-2026-\d{4}$/);
      expect(cuerpo.estado).toBe('Pendiente');
      expect(cuerpo.cliente?.id).toBe(clienteExistente.id);
    });

    it('genera correlativos consecutivos', async () => {
      const primera = await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Devolucion',
        descripcion: 'Primera solicitud correlativa del test',
      }).expect(201);

      const segunda = await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Devolucion',
        descripcion: 'Segunda solicitud correlativa del test',
      }).expect(201);

      const numeroPrimera = (primera.body as CuerpoSolicitud).numero;
      const numeroSegunda = (segunda.body as CuerpoSolicitud).numero;

      idsCreados.push(
        (primera.body as CuerpoSolicitud).id,
        (segunda.body as CuerpoSolicitud).id,
      );

      expect(Number(numeroSegunda.slice(-4))).toBe(
        Number(numeroPrimera.slice(-4)) + 1,
      );
    });

    it('responde 404 si el cliente no existe', async () => {
      await crearSolicitud({
        clienteId: 999999,
        fecha: '2026-07-29',
        tipoSolicitud: 'Pedido nuevo',
        descripcion: 'Cliente inexistente',
      }).expect(404);
    });

    it('responde 400 con tipo de solicitud fuera del catalogo', async () => {
      await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Tipo inventado',
        descripcion: 'Tipo invalido',
      }).expect(400);
    });

    it('responde 400 con fecha en formato incorrecto', async () => {
      await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '29-07-2026',
        tipoSolicitud: 'Pedido nuevo',
        descripcion: 'Fecha invalida',
      }).expect(400);
    });

    it('responde 400 si falta la descripcion', async () => {
      await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Pedido nuevo',
      }).expect(400);
    });
  });

  describe('PUT /solicitudes/:id', () => {
    it('responde 401 sin JWT', async () => {
      await request(app.getHttpServer())
        .put('/solicitudes/1')
        .send({ descripcion: 'Sin token' })
        .expect(401);
    });

    it('actualiza los campos enviados y conserva el resto', async () => {
      const creada = await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Consulta de estado',
        descripcion: 'Descripcion original del test',
      }).expect(201);

      const { id, numero } = creada.body as CuerpoSolicitud;
      idsCreados.push(id);

      const respuesta = await request(app.getHttpServer())
        .put(`/solicitudes/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ descripcion: 'Descripcion actualizada', estado: 'En proceso' })
        .expect(200);

      const cuerpo = respuesta.body as CuerpoSolicitud;

      expect(cuerpo.descripcion).toBe('Descripcion actualizada');
      expect(cuerpo.estado).toBe('En proceso');
      expect(cuerpo.numero).toBe(numero);
      expect(cuerpo.tipoSolicitud).toBe('Consulta de estado');
    });

    it('responde 404 si no existe', async () => {
      await request(app.getHttpServer())
        .put('/solicitudes/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ descripcion: 'No existe' })
        .expect(404);
    });

    it('responde 400 con un estado fuera del catalogo', async () => {
      await request(app.getHttpServer())
        .put('/solicitudes/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'Cerrada' })
        .expect(400);
    });
  });

  describe('DELETE /solicitudes/:id', () => {
    it('responde 401 sin JWT', async () => {
      await request(app.getHttpServer()).delete('/solicitudes/1').expect(401);
    });

    it('elimina sin cuerpo y deja la solicitud inaccesible', async () => {
      const creada = await crearSolicitud({
        clienteId: clienteExistente.id,
        fecha: '2026-07-29',
        tipoSolicitud: 'Cancelacion',
        descripcion: 'Solicitud que sera eliminada por el test',
      }).expect(201);

      const { id } = creada.body as CuerpoSolicitud;

      const respuesta = await request(app.getHttpServer())
        .delete(`/solicitudes/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(respuesta.body).toEqual({});

      await request(app.getHttpServer()).get(`/solicitudes/${id}`).expect(404);
    });

    it('responde 404 si no existe', async () => {
      await request(app.getHttpServer())
        .delete('/solicitudes/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
