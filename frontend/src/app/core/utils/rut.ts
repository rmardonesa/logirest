const LARGO_MINIMO_CON_DV = 8;

export function canonizar(rut: string): string {
  const limpio = rut.toUpperCase().replace(/[^0-9K]/g, '');

  const posicionK = limpio.indexOf('K');

  if (posicionK === -1) {
    return limpio;
  }

  if (posicionK !== limpio.length - 1) {
    return limpio.replace(/K/g, '');
  }

  return limpio.length >= 2 ? limpio : limpio.replace(/K/g, '');
}

export function separar(rut: string): { cuerpo: string; dv: string } {
  const canonico = canonizar(rut);

  if (canonico.length < 2) {
    return { cuerpo: canonico, dv: '' };
  }

  return {
    cuerpo: canonico.slice(0, -1),
    dv: canonico.slice(-1),
  };
}

export function formatear(rut: string): string {
  const canonico = canonizar(rut);

  if (canonico.length <= 1) {
    return canonico;
  }

  const { cuerpo, dv } = separar(canonico);

  if (dv === 'K' || canonico.length >= LARGO_MINIMO_CON_DV) {
    return `${cuerpo}-${dv}`;
  }

  return canonico;
}

export function estaCompleto(rut: string): boolean {
  return canonizar(rut).length >= LARGO_MINIMO_CON_DV;
}

export function contarCaracteresCanonicos(texto: string): number {
  let cuenta = 0;

  for (const caracter of texto) {
    if (/[0-9K]/.test(caracter.toUpperCase())) {
      cuenta++;
    }
  }

  return cuenta;
}
