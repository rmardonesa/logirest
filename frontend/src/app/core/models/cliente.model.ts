export type TipoCliente = 'persona natural' | 'empresa';

export interface Cliente {
  id: number;
  rut: string | null;
  nombre: string;
  email: string;
  telefono: string | null;
  tipo: TipoCliente;
  createdAt: string;
}
