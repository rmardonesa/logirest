export interface FichaExterna {
  rut: string;
  nombre: string;
  email: string;
  telefono: string;
  tipo: 'persona natural' | 'empresa';
}

export const REGISTRO_EXTERNO: readonly FichaExterna[] = [
  {
    rut: '17456921-4',
    nombre: 'Transportes Aconcagua SpA',
    email: 'operaciones@aconcagua.cl',
    telefono: '+56332456781',
    tipo: 'empresa',
  },
  {
    rut: '19283746-5',
    nombre: 'Bodegas del Pacifico Limitada',
    email: 'contacto@bodegaspacifico.cl',
    telefono: '+56322987654',
    tipo: 'empresa',
  },
  {
    rut: '14092837-1',
    nombre: 'Marcela Sandoval Pinto',
    email: 'marcela.sandoval@correo.cl',
    telefono: '+56988123456',
    tipo: 'persona natural',
  },
  {
    rut: '21345678-9',
    nombre: 'Distribuidora Cordillera SpA',
    email: 'ventas@distcordillera.cl',
    telefono: '+56225551234',
    tipo: 'empresa',
  },
  {
    rut: '11876543-K',
    nombre: 'Ignacio Bravo Cortes',
    email: 'ignacio.bravo@correo.cl',
    telefono: '+56977554433',
    tipo: 'persona natural',
  },
  {
    rut: '18765432-3',
    nombre: 'Frigorificos del Sur Limitada',
    email: 'despachos@frigosur.cl',
    telefono: '+56412887766',
    tipo: 'empresa',
  },
];

const canonizar = (texto: string): string =>
  texto.toUpperCase().replace(/[^0-9K@.]/g, '');

export const buscarEnRegistro = (consulta: string): FichaExterna | null => {
  const buscado = consulta.trim().toLowerCase();
  const buscadoCanonico = canonizar(consulta);

  return (
    REGISTRO_EXTERNO.find(
      (ficha) =>
        ficha.email.toLowerCase() === buscado ||
        canonizar(ficha.rut) === buscadoCanonico,
    ) ?? null
  );
};
