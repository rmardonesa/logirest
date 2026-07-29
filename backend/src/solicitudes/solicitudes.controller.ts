import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SolicitudesService } from './solicitudes.service';
import { Solicitud } from './entities/solicitud.entity';
import { CrearSolicitudDto } from './dto/crear-solicitud.dto';
import { ActualizarSolicitudDto } from './dto/actualizar-solicitud.dto';
import { FiltrarSolicitudesDto } from './dto/filtrar-solicitudes.dto';
import type { RespuestaPaginada } from '../common/types/respuesta-paginada';

@Controller('solicitudes')
export class SolicitudesController {
  constructor(private readonly solicitudesService: SolicitudesService) {}

  @Get()
  listar(
    @Query() filtros: FiltrarSolicitudesDto,
  ): Promise<RespuestaPaginada<Solicitud>> {
    return this.solicitudesService.listar(filtros);
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number): Promise<Solicitud> {
    return this.solicitudesService.obtenerPorId(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  crear(@Body() datos: CrearSolicitudDto): Promise<Solicitud> {
    return this.solicitudesService.crear(datos);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cambios: ActualizarSolicitudDto,
  ): Promise<Solicitud> {
    return this.solicitudesService.actualizar(id, cambios);
  }

  @Patch(':id/cerrar')
  @UseGuards(JwtAuthGuard)
  cerrar(@Param('id', ParseIntPipe) id: number): Promise<Solicitud> {
    return this.solicitudesService.cerrar(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.solicitudesService.eliminar(id);
  }
}
