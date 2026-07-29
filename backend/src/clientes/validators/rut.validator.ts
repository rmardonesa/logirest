import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const FORMATO_RUT = /^\d{7,8}-[\dkK]$/;

const MULTIPLICADOR_INICIAL = 2;

const MULTIPLICADOR_MAXIMO = 7;

export const calcularDigitoVerificador = (cuerpo: string): string => {
  let suma = 0;
  let multiplicador = MULTIPLICADOR_INICIAL;

  for (let indice = cuerpo.length - 1; indice >= 0; indice -= 1) {
    suma += Number(cuerpo[indice]) * multiplicador;
    multiplicador =
      multiplicador === MULTIPLICADOR_MAXIMO
        ? MULTIPLICADOR_INICIAL
        : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);

  if (resto === 11) {
    return '0';
  }

  if (resto === 10) {
    return 'K';
  }

  return String(resto);
};

export const esRutValido = (rut: string): boolean => {
  if (!FORMATO_RUT.test(rut)) {
    return false;
  }

  const [cuerpo, digito] = rut.split('-');

  return calcularDigitoVerificador(cuerpo) === digito.toUpperCase();
};

@ValidatorConstraint({ name: 'esRut', async: false })
export class RutValidoConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    return typeof valor === 'string' && esRutValido(valor);
  }

  defaultMessage(): string {
    return 'rut debe ser un RUT chileno valido, con formato 12345678-5';
  }
}
