import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Solicitud])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
