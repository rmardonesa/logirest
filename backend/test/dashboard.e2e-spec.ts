import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configurarAplicacion } from './../src/common/app-setup';
import type { ResumenDashboard } from './../src/dashboard/dashboard.types';

interface CuerpoListado {
  meta: { total: number };
}

describe('DashboardController (e2e)', () => {
  let app: INestApplication<App>;

  const contarPorEstado = async (estado: string): Promise<number> => {
    const respuesta = await request(app.getHttpServer())
      .get(`/solicitudes?estado=${encodeURIComponent(estado)}&limit=1`)
      .expect(200);

    return (respuesta.body as CuerpoListado).meta.total;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configurarAplicacion(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /dashboard entrega el resumen sin requerir JWT', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    const resumen = respuesta.body as ResumenDashboard;

    expect(Object.keys(resumen).sort()).toEqual([
      'enProceso',
      'finalizadas',
      'pendientes',
      'rechazadas',
      'total',
    ]);
    expect(
      Object.values(resumen).every((valor) => Number.isInteger(valor)),
    ).toBe(true);
  });

  it('el total coincide con la suma de los cuatro estados', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    const { total, pendientes, enProceso, finalizadas, rechazadas } =
      respuesta.body as ResumenDashboard;

    expect(total).toBe(pendientes + enProceso + finalizadas + rechazadas);
  });

  it('cada contador coincide con el listado filtrado por ese estado', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/dashboard')
      .expect(200);

    const resumen = respuesta.body as ResumenDashboard;

    expect(resumen.pendientes).toBe(await contarPorEstado('Pendiente'));
    expect(resumen.enProceso).toBe(await contarPorEstado('En proceso'));
    expect(resumen.finalizadas).toBe(await contarPorEstado('Finalizada'));
    expect(resumen.rechazadas).toBe(await contarPorEstado('Rechazada'));
  });
});
