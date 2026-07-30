import {
  Controller,
  Get,
  NotFoundException,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FichaExterna, buscarEnRegistro } from './registro-externo';

const esperar = (milisegundos: number): Promise<void> =>
  new Promise((resolver) => setTimeout(resolver, milisegundos));

@Controller('proveedor-externo/clientes')
export class ProveedorExternoController {
  @Get()
  async consultar(
    @Query('query') consulta: string,
    @Query('demora') demora?: string,
    @Query('falla') falla?: string,
  ): Promise<FichaExterna> {
    if (demora) {
      await esperar(Number(demora));
    }

    if (falla === 'true') {
      throw new ServiceUnavailableException('Proveedor externo no disponible');
    }

    const ficha = buscarEnRegistro(consulta ?? '');

    if (!ficha) {
      throw new NotFoundException(
        `El registro externo no tiene datos para ${consulta}`,
      );
    }

    return ficha;
  }
}
