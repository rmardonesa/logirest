import { rutValido } from './rut';

describe('rutValido', () => {
  const validator = rutValido();

  function ctrl(v: unknown) {
    return { value: v } as any;
  }

  it('retorna null para valor vacío', () => {
    expect(validator(ctrl(''))).toBeNull();
  });

  it('retorna null para valor nulo', () => {
    expect(validator(ctrl(null))).toBeNull();
  });

  it('retorna null para valor no-string', () => {
    expect(validator(ctrl(123))).toBeNull();
  });

  it('retorna null para whitespace', () => {
    expect(validator(ctrl('   '))).toBeNull();
  });

  it('retorna null si no queda ningún carácter canónico', () => {
    expect(validator(ctrl('abc.-'))).toBeNull();
  });

  it('marca incompleto cualquier RUT parcial', () => {
    for (const parcial of ['1', '12', '123', '1234', '12345', '123456', '1234567']) {
      expect(validator(ctrl(parcial))).toEqual({ rutIncompleto: true });
    }
  });

  it('acepta un cuerpo de 7 dígitos más dígito verificador', () => {
    expect(validator(ctrl('9876543-3'))).toBeNull();
  });

  it('acepta un cuerpo de 8 dígitos más dígito verificador', () => {
    expect(validator(ctrl('12345678-5'))).toBeNull();
  });

  it('acepta K como dígito verificador', () => {
    expect(validator(ctrl('16543210-K'))).toBeNull();
    expect(validator(ctrl('16543210k'))).toBeNull();
  });

  it('no calcula el dígito verificador, cualquier DV con largo válido pasa', () => {
    expect(validator(ctrl('12345678-9'))).toBeNull();
    expect(validator(ctrl('12345678-0'))).toBeNull();
  });
});
