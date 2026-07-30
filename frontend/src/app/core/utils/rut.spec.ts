import {
  canonizar,
  separar,
  formatear,
  estaCompleto,
  contarCaracteresCanonicos,
} from './rut';

describe('canonizar', () => {
  it('limpia puntos, guiones y espacios', () => {
    expect(canonizar('12.345.678-5')).toBe('123456785');
  });

  it('convierte a mayúsculas', () => {
    expect(canonizar('12345678k')).toBe('12345678K');
  });

  it('elimina K si está al inicio sin dígitos previos', () => {
    expect(canonizar('K12345678')).toBe('12345678');
  });

  it('elimina K en posiciones intermedias', () => {
    expect(canonizar('1K2345678')).toBe('12345678');
  });

  it('permite K al final con al menos un dígito antes', () => {
    expect(canonizar('12K')).toBe('12K');
  });

  it('rechaza K si no hay dígitos antes', () => {
    expect(canonizar('K')).toBe('');
  });

  it('elimina K si hay caracteres después', () => {
    expect(canonizar('12K34')).toBe('1234');
  });

  it('no modifica si K ya está al final', () => {
    expect(canonizar('12345678K')).toBe('12345678K');
  });

  it('elimina caracteres no válidos', () => {
    expect(canonizar('12.345.678-5 abc')).toBe('123456785');
  });

  it('retorna string vacío para entrada vacía', () => {
    expect(canonizar('')).toBe('');
  });
});

describe('separar', () => {
  it('separa cuerpo y dv de un RUT completo', () => {
    expect(separar('123456785')).toEqual({ cuerpo: '12345678', dv: '5' });
  });

  it('retorna dv vacío si hay menos de 2 caracteres', () => {
    expect(separar('1')).toEqual({ cuerpo: '1', dv: '' });
  });

  it('maneja K como dv', () => {
    expect(separar('15200009K')).toEqual({ cuerpo: '15200009', dv: 'K' });
  });

  it('canoniza antes de separar', () => {
    expect(separar('12.345.678-5')).toEqual({ cuerpo: '12345678', dv: '5' });
  });
});

describe('formatear', () => {
  it('agrega guion si el canonico tiene 8+ caracteres', () => {
    expect(formatear('11111111-1')).toBe('11111111-1');
  });

  it('agrega guion si el dv es K, incluso con menos de 8 caracteres', () => {
    expect(formatear('1K')).toBe('1-K');
  });

  it('retorna el canonico si tiene 1 carácter', () => {
    expect(formatear('1')).toBe('1');
  });

  it('no agrega guion mientras el cuerpo aún se está escribiendo', () => {
    expect(formatear('12')).toBe('12');
    expect(formatear('1234567')).toBe('1234567');
  });

  it('canoniza antes de formatear', () => {
    expect(formatear('12.345.678-5')).toBe('12345678-5');
  });

  it('no agrega guion extra si ya tiene uno', () => {
    expect(formatear('12345678-5')).toBe('12345678-5');
  });
});

describe('estaCompleto', () => {
  it('considera completo un cuerpo de 7 dígitos más dv', () => {
    expect(estaCompleto('9876543-3')).toBe(true);
  });

  it('considera completo un cuerpo de 8 dígitos más dv', () => {
    expect(estaCompleto('12345678-5')).toBe(true);
  });

  it('considera completo un dv K', () => {
    expect(estaCompleto('16543210-K')).toBe(true);
  });

  it('considera incompleto cualquier cosa más corta', () => {
    expect(estaCompleto('1234567')).toBe(false);
    expect(estaCompleto('1')).toBe(false);
    expect(estaCompleto('')).toBe(false);
  });
});

describe('contarCaracteresCanonicos', () => {
  it('cuenta solo dígitos y K', () => {
    expect(contarCaracteresCanonicos('12.345.678-5')).toBe(9);
  });

  it('cuenta K como carácter canónico', () => {
    expect(contarCaracteresCanonicos('15200009-K')).toBe(9);
  });

  it('retorna 0 para string sin caracteres canónicos', () => {
    expect(contarCaracteresCanonicos('abc.-')).toBe(0);
  });
});
