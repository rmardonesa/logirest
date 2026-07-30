import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import type { ResultadoLookup } from './cliente-lookup.types';

const URL_PROVEEDOR_POR_DEFECTO =
  'http://localhost:3000/proveedor-externo/clientes';

const TIMEOUT_POR_DEFECTO = 2500;

const TELEFONO_SIMULADO = '+56200000000';

interface FichaProveedor {
  rut?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
}

const canonizarRut = (texto: string): string =>
  texto.toUpperCase().replace(/[^0-9K]/g, '');

const pareceEmail = (texto: string): boolean => texto.includes('@');

const NOMBRES_DE_TIMEOUT = ['TimeoutError', 'AbortError'];

const nombreDeError = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'name' in error
    ? String((error as { name: unknown }).name)
    : '';

const esErrorDeTimeout = (error: unknown): boolean => {
  if (NOMBRES_DE_TIMEOUT.includes(nombreDeError(error))) {
    return true;
  }

  const causa =
    typeof error === 'object' && error !== null && 'cause' in error
      ? (error as { cause: unknown }).cause
      : null;

  return NOMBRES_DE_TIMEOUT.includes(nombreDeError(causa));
};

@Injectable()
export class ClienteLookupService {
  private readonly logger = new Logger(ClienteLookupService.name);

  constructor(
    @InjectRepository(Cliente)
    private readonly clientes: Repository<Cliente>,
    private readonly configService: ConfigService,
  ) {}

  async consultar(consulta: string): Promise<ResultadoLookup> {
    const termino = consulta.trim();

    const local = await this.buscarLocal(termino);

    if (local) {
      return {
        encontrado: true,
        simulado: false,
        fuente: 'local',
        clienteId: local.id,
        rut: local.rut ?? undefined,
        nombre: local.nombre,
        email: local.email,
        telefono: local.telefono ?? undefined,
        tipo: local.tipo,
        detalle: 'El cliente ya existe en logirest',
      };
    }

    return this.consultarProveedor(termino);
  }

  private async buscarLocal(termino: string): Promise<Cliente | null> {
    if (pareceEmail(termino)) {
      return this.clientes
        .createQueryBuilder('cliente')
        .where('LOWER(cliente.email) = LOWER(:email)', { email: termino })
        .getOne();
    }

    const canonico = canonizarRut(termino);

    if (canonico.length === 0) {
      return null;
    }

    return this.clientes
      .createQueryBuilder('cliente')
      .where("UPPER(REPLACE(cliente.rut, '-', '')) = :canonico", { canonico })
      .getOne();
  }

  private async consultarProveedor(termino: string): Promise<ResultadoLookup> {
    const base = this.configService.get<string>(
      'PROVEEDOR_EXTERNO_URL',
      URL_PROVEEDOR_POR_DEFECTO,
    );
    const timeout = Number(
      this.configService.get<string>(
        'CLIENTE_LOOKUP_TIMEOUT_MS',
        String(TIMEOUT_POR_DEFECTO),
      ),
    );

    const url = new URL(base);
    url.searchParams.set('query', termino);

    try {
      const respuesta = await fetch(url, {
        signal: AbortSignal.timeout(timeout),
      });

      if (respuesta.status === 404) {
        return {
          encontrado: false,
          simulado: false,
          fuente: 'externa',
          detalle: 'El registro externo no tiene datos para esta consulta',
        };
      }

      if (!respuesta.ok) {
        return this.respuestaSimulada(
          termino,
          `El proveedor externo respondio ${respuesta.status}`,
        );
      }

      const ficha = (await respuesta.json()) as FichaProveedor;

      return {
        encontrado: true,
        simulado: false,
        fuente: 'externa',
        rut: ficha.rut,
        nombre: ficha.nombre,
        email: ficha.email,
        telefono: ficha.telefono,
        tipo: ficha.tipo,
        detalle: 'Datos obtenidos del registro externo',
      };
    } catch (error) {
      const esTimeout = esErrorDeTimeout(error);

      this.logger.warn(
        `Lookup externo fallido para "${termino}": ${
          esTimeout ? `timeout de ${timeout}ms` : String(error)
        }`,
      );

      return this.respuestaSimulada(
        termino,
        esTimeout
          ? `El proveedor externo excedio el timeout de ${timeout}ms`
          : 'El proveedor externo no esta disponible',
      );
    }
  }

  private respuestaSimulada(
    termino: string,
    detalle: string,
  ): ResultadoLookup {
    const esEmail = pareceEmail(termino);
    const canonico = canonizarRut(termino);

    return {
      encontrado: true,
      simulado: true,
      fuente: 'simulada',
      rut: esEmail ? undefined : termino,
      nombre: esEmail
        ? `Cliente ${termino.split('@')[0]}`
        : `Cliente ${canonico.slice(0, 4)}`,
      email: esEmail ? termino : `cliente${canonico}@sindatos.cl`,
      telefono: TELEFONO_SIMULADO,
      tipo: 'persona natural',
      detalle,
    };
  }
}
