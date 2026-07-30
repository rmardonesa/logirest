import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClienteLookupController } from './cliente-lookup.controller';
import { ClienteLookupService } from './cliente-lookup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClienteLookupController],
  providers: [ClienteLookupService],
})
export class ClienteLookupModule {}
