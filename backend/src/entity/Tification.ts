// src/entity/Tification.ts

import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity('TIFICATION')
export class Tification {
  @PrimaryColumn({ type: 'int', name: 'USER_NO' }) // 主キーかつ外部キー 
  userNo!: number;

  @Column({ type: 'varchar', name: 'T_SET', length: 4, nullable: false })
  tSet!: string; // 通知ON/OFF 

  @Column({ type: 'varchar', name: 'TIME', length: 3, nullable: false })
  time!: string; // 通知時間 

  @OneToOne(() => User, (user) => user.tification)
  @JoinColumn({ name: 'USER_NO' })
  user!: User;
}