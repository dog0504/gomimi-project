// src/entity/History.ts

import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn
} from 'typeorm';
import { User } from './User';

@Entity('HISTORY')
export class History {
  // 1. 新しい主キーとして「履歴番号」を追加
  @PrimaryGeneratedColumn({ type: 'int', name: 'HISTORY_NO' })
  id!: number;

  // 2. 外部キー
  @ManyToOne(() => User, (user) => user.id , { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_NO' })
  userId!: number;

  @Column({ type: 'varchar', name: 'NAME', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', name: 'J_TYPE', length: 60, nullable: true })
  type!: string; // 判別したごみの種類

  @CreateDateColumn({ type: 'datetime', name: 'J_DATE'})
  Date!: Date; // 判別した日付時間
}