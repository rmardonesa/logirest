import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { FiltrarClientesDto } from './dto/filtrar-clientes.dto';
import type { RespuestaPaginada } from '../common/types/respuesta-paginada';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  listar(
    @Query() filtros: FiltrarClientesDto,
  ): Promise<RespuestaPaginada<Cliente>> {
    return this.clientesService.listar(filtros);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() datos: CrearClienteDto): Promise<Cliente> {
    return this.clientesService.crear(datos);
  }
}
