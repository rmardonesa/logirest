import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { canonizar, estaCompleto } from '../utils/rut';

export const rutValido = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string' || valor.trim().length === 0) {
      return null;
    }

    if (canonizar(valor).length === 0) {
      return null;
    }

    return estaCompleto(valor) ? null : { rutIncompleto: true };
  };
};
