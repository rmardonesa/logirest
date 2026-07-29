import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import {
  CHECK_ESTADO_SOLICITUD,
  CHECK_TIPO_SOLICITUD,
  ESTADO_INICIAL,
} from '../solicitud.constants';
import type { EstadoSolicitud, TipoSolicitud } from '../solicitud.constants';

@Entity('solicitudes')
@Index('idx_solicitudes_estado', ['estado'])
@Index('idx_solicitudes_fecha', ['fecha'])
@Index('idx_solicitudes_cliente_id', ['clienteId'])
@Check('chk_solicitudes_tipo_solicitud', CHECK_TIPO_SOLICITUD)
@Check('chk_solicitudes_estado', CHECK_ESTADO_SOLICITUD)
export class Solicitud {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  numero: string;

  @Column({ name: 'cliente_id', type: 'integer' })
  clienteId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.solicitudes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'cliente_id',
    foreignKeyConstraintName: 'fk_solicitudes_cliente',
  })
  cliente: Cliente;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ name: 'tipo_solicitud', type: 'varchar', length: 30 })
  tipoSolicitud: TipoSolicitud;

  @Column({ type: 'varchar', length: 20, default: ESTADO_INICIAL })
  estado: EstadoSolicitud;

  @Column({ type: 'text' })
  descripcion: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
