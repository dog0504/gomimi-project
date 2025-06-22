// src/entity/Address.ts

import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity('ADDRESS')
export class Address {
  @PrimaryColumn({ type: 'int', name: 'USER_NO' }) // 主キーかつ外部キー 
  userNo!: number;

  @Column({ type: 'varchar', name: 'CITY', length: 8, nullable: false })
  city!: string; // 市 

  @Column({ type: 'varchar', name: 'WARD', length: 5, nullable: false })
  ward!: string; // 区 

  @Column({ type: 'varchar', name: 'TOWN', length: 5, nullable: false })
  town!: string; // 町 

  @Column({ type: 'varchar', name: 'CHOM', length: 5, nullable: false })
  chom!: string; // 丁目 

  @Column({ type: 'varchar', name: 'STREET', length: 30, nullable: false })
  street!: string; // 番地 

  @Column({ type: 'varchar', name: 'INF', length: 256, nullable: true })
  inf!: string; // 追記 

  @OneToOne(() => User, (user) => user.address)
  @JoinColumn({ name: 'USER_NO' })
  user!: User;
}