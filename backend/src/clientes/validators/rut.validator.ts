import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const FORMATO_RUT = /^\d{7,8}-[\dkK]$/;

export const tieneFormatoDeRut = (rut: string): boolean =>
  FORMATO_RUT.test(rut);

@ValidatorConstraint({ name: 'esRut', async: false })
export class RutValidoConstraint implements ValidatorConstraintInterface {
  validate(valor: unknown): boolean {
    return typeof valor === 'string' && tieneFormatoDeRut(valor);
  }

  defaultMessage(): string {
    return 'rut debe tener formato 12345678-5, con guion y digito verificador';
  }
}
