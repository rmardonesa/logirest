import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { buildDatabaseOptions } from './config/database.config';
import { HealthModule } from './health/health.module';
import { ClientesModule } from './clientes/clientes.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildDatabaseOptions,
    }),
    AuthModule,
    ClientesModule,
    SolicitudesModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
