import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Solicitud } from './entities/solicitud.entity';
import { ESTADO_INICIAL } from './solicitud.constants';
import { CrearSolicitudDto } from './dto/crear-solicitud.dto';
import { ActualizarSolicitudDto } from './dto/actualizar-solicitud.dto';
import { FiltrarSolicitudesDto } from './dto/filtrar-solicitudes.dto';
import type { RespuestaPaginada } from '../common/types/respuesta-paginada';

const LARGO_CORRELATIVO = 4;

const aplicarCambiosDefinidos = <T extends object>(
  destino: T,
  cambios: Partial<T>,
): T => {
  for (const [campo, valor] of Object.entries(cambios)) {
    if (valor !== undefined) {
      (destino as Record<string, unknown>)[campo] = valor;
    }
  }

  return destino;
};

@Injectable()
export class SolicitudesService {
  constructor(
    @InjectRepository(Solicitud)
    private readonly solicitudes: Repository<Solicitud>,
    @InjectRepository(Cliente)
    private readonly clientes: Repository<Cliente>,
  ) {}

  async listar(
    filtros: FiltrarSolicitudesDto,
  ): Promise<RespuestaPaginada<Solicitud>> {
    const { search, estado, order, page, limit } = filtros;

    const consulta = this.solicitudes
      .createQueryBuilder('solicitud')
      .leftJoinAndSelect('solicitud.cliente', 'cliente');

    if (estado) {
      consulta.andWhere('solicitud.estado = :estado', { estado });
    }

    if (search) {
      consulta.andWhere(
        `(solicitud.numero ILIKE :patron
          OR solicitud.descripcion ILIKE :patron
          OR cliente.nombre ILIKE :patron
          OR cliente.email ILIKE :patron)`,
        { patron: `%${search}%` },
      );
    }

    const [data, total] = await consulta
      .orderBy('solicitud.fecha', order)
      .addOrderBy('solicitud.id', order)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async obtenerPorId(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudes.findOne({
      where: { id },
      relations: { cliente: true },
    });

    if (!solicitud) {
      throw new NotFoundException(`No existe la solicitud con id ${id}`);
    }

    return solicitud;
  }

  async crear(datos: CrearSolicitudDto): Promise<Solicitud> {
    const cliente = await this.clientes.findOneBy({ id: datos.clienteId });

    if (!cliente) {
      throw new NotFoundException(
        `No existe el cliente con id ${datos.clienteId}`,
      );
    }

    const solicitud = this.solicitudes.create({
      numero: await this.generarNumero(datos.fecha),
      cliente,
      clienteId: cliente.id,
      fecha: datos.fecha,
      tipoSolicitud: datos.tipoSolicitud,
      descripcion: datos.descripcion,
      estado: ESTADO_INICIAL,
    });

    return this.solicitudes.save(solicitud);
  }

  async actualizar(
    id: number,
    cambios: ActualizarSolicitudDto,
  ): Promise<Solicitud> {
    const solicitud = await this.obtenerPorId(id);

    return this.solicitudes.save(aplicarCambiosDefinidos(solicitud, cambios));
  }

  async eliminar(id: number): Promise<void> {
    const resultado = await this.solicitudes.delete(id);

    if (!resultado.affected) {
      throw new NotFoundException(`No existe la solicitud con id ${id}`);
    }
  }

  private async generarNumero(fecha: string): Promise<string> {
    const prefijo = `SOL-${fecha.slice(0, 4)}-`;

    const ultimo = await this.solicitudes
      .createQueryBuilder('solicitud')
      .select('MAX(solicitud.numero)', 'maximo')
      .where('solicitud.numero LIKE :prefijo', { prefijo: `${prefijo}%` })
      .getRawOne<{ maximo: string | null }>();

    const correlativo = ultimo?.maximo
      ? Number(ultimo.maximo.slice(prefijo.length)) + 1
      : 1;

    return `${prefijo}${String(correlativo).padStart(LARGO_CORRELATIVO, '0')}`;
  }
}
