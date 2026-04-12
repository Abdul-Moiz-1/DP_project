import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity()
export class PromoCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column('decimal', { precision: 5, scale: 2 })
  discountPercent: number;

  @Column({ type: 'timestamp' })
  validFrom: Date;

  @Column({ type: 'timestamp' })
  validUntil: Date;

  @Column({ default: 0 })
  maxUses: number;

  @Column({ default: 0 })
  timesUsed: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Event, { onDelete: 'CASCADE', nullable: true })
  event: Event;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
