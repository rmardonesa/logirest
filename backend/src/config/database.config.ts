import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';

const entidades = [Cliente, Solicitud];

export const buildDatabaseOptions = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const connectionUrl = configService.get<string>('DATABASE_URL');
  const sslHabilitado = configService.get<string>('DB_SSL') === 'true';

  const baseOptions = {
    type: 'postgres' as const,
    entities: entidades,
    synchronize: false,
    autoLoadEntities: false,
    ssl: sslHabilitado ? { rejectUnauthorized: false } : false,
  };

  if (connectionUrl) {
    return { ...baseOptions, url: connectionUrl };
  }

  return {
    ...baseOptions,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<string>('DB_PORT', '5432')),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'postgres'),
    database: configService.get<string>('DB_NAME', 'logirest'),
  };
};
