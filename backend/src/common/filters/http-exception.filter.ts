import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface RespuestaError {
  statusCode: number;
  message: string;
  path: string;
}

const MENSAJE_ERROR_INTERNO = 'Error interno del servidor';

const extraerMensaje = (exception: HttpException): string => {
  const respuesta = exception.getResponse();

  if (typeof respuesta === 'string') {
    return respuesta;
  }

  const mensaje = (respuesta as { message?: string | string[] }).message;

  if (Array.isArray(mensaje)) {
    return mensaje.join('. ');
  }

  return mensaje ?? exception.message;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const response = contexto.getResponse<Response>();
    const request = contexto.getRequest<Request>();

    const esHttpException = exception instanceof HttpException;

    if (!esHttpException) {
      this.logger.error(
        `Error no controlado en ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const cuerpo: RespuestaError = {
      statusCode: esHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR,
      message: esHttpException
        ? extraerMensaje(exception)
        : MENSAJE_ERROR_INTERNO,
      path: request.url,
    };

    response.status(cuerpo.statusCode).json(cuerpo);
  }
}
