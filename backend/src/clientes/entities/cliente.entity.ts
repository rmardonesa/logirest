import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Solicitud } from '../../solicitudes/entities/solicitud.entity';

@Entity('clientes')
@Index('idx_clientes_nombre', ['nombre'])
@Index('idx_clientes_email', ['email'])
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 12, unique: true, nullable: true })
  rut: string | null;

  @Column({ type: 'varchar', length: 120 })
  nombre: string;

  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => Solicitud, (solicitud) => solicitud.cliente)
  solicitudes: Solicitud[];
}
