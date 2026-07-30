import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import type { EstadoSolicitud } from '../solicitudes/solicitud.constants';
import { TIPOS_SOLICITUD } from '../solicitudes/solicitud.constants';
import type { ConteoEtiquetado, ResumenDashboard } from './dashboard.types';

interface ConteoPorEstado {
  estado: EstadoSolicitud;
  cantidad: number;
}

const TOP_EMPRESAS = 5;

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

    const recientes = await this.solicitudes.find({
      relations: { cliente: true },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      total: pendientes + enProceso + finalizadas + rechazadas,
      pendientes,
      enProceso,
      finalizadas,
      rechazadas,
      recientes,
      porTipo: await this.contarPorTipo(),
      topEmpresas: await this.contarTopEmpresas(),
    };
  }

  private async contarPorTipo(): Promise<ConteoEtiquetado[]> {
    const filas = await this.solicitudes
      .createQueryBuilder('solicitud')
      .select('solicitud.tipoSolicitud', 'etiqueta')
      .addSelect('COUNT(*)::int', 'cantidad')
      .groupBy('solicitud.tipoSolicitud')
      .getRawMany<ConteoEtiquetado>();

    const porTipo = new Map(filas.map((fila) => [fila.etiqueta, fila.cantidad]));

    return TIPOS_SOLICITUD.map((tipo) => ({
      etiqueta: tipo,
      cantidad: porTipo.get(tipo) ?? 0,
    }));
  }

  private async contarTopEmpresas(): Promise<ConteoEtiquetado[]> {
    const filas = await this.solicitudes
      .createQueryBuilder('solicitud')
      .innerJoin('solicitud.cliente', 'cliente')
      .select('cliente.nombre', 'etiqueta')
      .addSelect('COUNT(*)::int', 'cantidad')
      .where('cliente.tipo = :tipo', { tipo: 'empresa' })
      .groupBy('cliente.nombre')
      .orderBy('cantidad', 'DESC')
      .addOrderBy('cliente.nombre', 'ASC')
      .getRawMany<ConteoEtiquetado>();

    const principales = filas.slice(0, TOP_EMPRESAS);
    const resto = filas.slice(TOP_EMPRESAS);

    if (resto.length === 0) {
      return principales;
    }

    return [
      ...principales,
      {
        etiqueta: 'Otras empresas',
        cantidad: resto.reduce((suma, fila) => suma + fila.cantidad, 0),
      },
    ];
  }
}
