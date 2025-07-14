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
import { Manual } from './Manual';

@Entity('HISTORY')
export class History {
  // 1. 新しい主キーとして「履歴番号」を追加
  @PrimaryGeneratedColumn({ type: 'int', name: 'HISTORY_NO' })
  id!: number;

  // 2. 外部キー
  @ManyToOne(() => User, (user) => user.id , { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'USER_NO' })
  userId!: number;

  // @Column({ type: 'varchar', name: 'NAME', length: 255, nullable: false })
  // name!: string;

  // @Column({ type: 'varchar', name: 'J_TYPE', length: 60, nullable: true })
  // type!: string; // 判別したごみの種類

  // NAME と J_TYPE のカラムは削除する
  @ManyToOne(() => Manual, (manual) => manual.histories, { 
    nullable: false 
  }) // 履歴は必ずマニュアルと紐づく
  @JoinColumn({ name: 'manual_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_history_to_manual' }) // DB上の外部キーカラム名
  manual!: Manual;

  @CreateDateColumn({ type: 'datetime', name: 'J_DATE'})
  Date!: Date; // 判別した日付時間
}