import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
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

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return this.clientesService.obtenerPorId(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() datos: CrearClienteDto): Promise<Cliente> {
    return this.clientesService.crear(datos);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarClienteDto,
  ): Promise<Cliente> {
    return this.clientesService.actualizar(id, datos);
  }
}
