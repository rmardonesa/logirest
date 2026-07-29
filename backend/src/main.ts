import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configurarAplicacion } from './common/app-setup';

const TODOS_LOS_ORIGENES = '*';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const origenes = configService.get<string>('CORS_ORIGIN', TODOS_LOS_ORIGENES);

  app.enableCors({
    origin:
      origenes === TODOS_LOS_ORIGENES
        ? true
        : origenes.split(',').map((origen) => origen.trim()),
  });

  configurarAplicacion(app);

  await app.listen(Number(configService.get<string>('PORT', '3000')));
}

void bootstrap();
