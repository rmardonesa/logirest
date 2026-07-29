import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import type { EstadoSolicitud } from '../solicitudes/solicitud.constants';
import type { ResumenDashboard } from './dashboard.types';

interface ConteoPorEstado {
  estado: EstadoSolicitud;
  cantidad: number;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudes: Repository<Solicitud>,
  ) {}

  async obtenerResumen(): Promise<ResumenDashboard> {
    const conteos = await this.solicitudes
      .createQueryBuilder('solicitud')
      .select('solicitud.estado', 'estado')
      .addSelect('COUNT(*)::int', 'cantidad')
      .groupBy('solicitud.estado')
      .getRawMany<ConteoPorEstado>();

    const porEstado = new Map(
      conteos.map((conteo) => [conteo.estado, conteo.cantidad]),
    );

    const pendientes = porEstado.get('Pendiente') ?? 0;
    const enProceso = porEstado.get('En proceso') ?? 0;
    const finalizadas = porEstado.get('Finalizada') ?? 0;
    const rechazadas = porEstado.get('Rechazada') ?? 0;

    return {
      total: pendientes + enProceso + finalizadas + rechazadas,
      pendientes,
      enProceso,
      finalizadas,
      rechazadas,
    };
  }
}
