import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { FiltrarClientesDto } from './dto/filtrar-clientes.dto';
import type { RespuestaPaginada } from '../common/types/respuesta-paginada';

const CODIGO_UNICIDAD_POSTGRES = '23505';

const esViolacionDeUnicidad = (error: unknown): boolean =>
  error instanceof QueryFailedError &&
  (error.driverError as { code?: string }).code === CODIGO_UNICIDAD_POSTGRES;

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientes: Repository<Cliente>,
  ) {}

  async listar(
    filtros: FiltrarClientesDto,
  ): Promise<RespuestaPaginada<Cliente>> {
    const { search, page, limit } = filtros;

    const consulta = this.clientes.createQueryBuilder('cliente');

    if (search) {
      consulta.andWhere(
        `(cliente.nombre ILIKE :patron
          OR cliente.email ILIKE :patron
          OR cliente.rut ILIKE :patron)`,
        { patron: `%${search}%` },
      );
    }

    const [data, total] = await consulta
      .orderBy('cliente.nombre', 'ASC')
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

  async crear(datos: CrearClienteDto): Promise<Cliente> {
    try {
      return await this.clientes.save(this.clientes.create(datos));
    } catch (error) {
      if (esViolacionDeUnicidad(error)) {
        throw new ConflictException(
          `Ya existe un cliente con el rut ${datos.rut}`,
        );
      }

      throw error;
    }
  }
}
