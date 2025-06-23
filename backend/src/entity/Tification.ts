// src/entity/Tification.ts

import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User';

@Entity('TIFICATION')
export class Tification {
  @PrimaryGeneratedColumn({ type: 'int',name: 'ID' }) 
  id!: number;

  @Column({ type: 'varchar', name: 'T_SET', length: 4, nullable: false })
  tSet!: string; // 通知ON/OFF 

  @Column({ type: 'varchar', name: 'TIME', length: 3, nullable: false })
  time!: string; // 通知時間 

  @ManyToOne(() => User, (user) => user.id, { nullable: false ,onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_NO' })
  userId!: User;
}