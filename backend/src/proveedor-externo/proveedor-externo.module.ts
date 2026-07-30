import { Module } from '@nestjs/common';
import { ProveedorExternoController } from './proveedor-externo.controller';

@Module({
  controllers: [ProveedorExternoController],
})
export class ProveedorExternoModule {}
