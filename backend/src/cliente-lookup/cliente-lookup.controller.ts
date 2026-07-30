import { Controller, Get, Query } from '@nestjs/common';
import { ClienteLookupService } from './cliente-lookup.service';
import { ConsultarClienteDto } from './dto/consultar-cliente.dto';
import type { ResultadoLookup } from './cliente-lookup.types';

@Controller('cliente-lookup')
export class ClienteLookupController {
  constructor(private readonly clienteLookupService: ClienteLookupService) {}

  @Get()
  consultar(@Query() filtros: ConsultarClienteDto): Promise<ResultadoLookup> {
    return this.clienteLookupService.consultar(filtros.query);
  }
}
