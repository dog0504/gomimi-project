// src/entity/History.ts

import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
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

  // 3. 主キーから通常カラムに変更
  @Column({ type: 'date', name: 'J_DATE', nullable: false })
  Date!: Date; // 判別した日付時間

  @Column({ type: 'varchar', name: 'J_TYPE', length: 10, nullable: false })
  type!: string; // 判別したごみの種類

}