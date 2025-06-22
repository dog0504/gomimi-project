// src/entity/History.ts

import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

@Entity('HISTORY')
export class History {
  // 1. 新しい主キーとして「履歴番号」を追加
  @PrimaryGeneratedColumn({ type: 'int', name: 'HISTORY_NO' })
  historyNo!: number;

  // 2. 主キーから通常カラムに変更（外部キーとしての役割は維持）
  @Column({ type: 'int', name: 'USER_NO', nullable: false })
  userNo!: number;

  // 3. 主キーから通常カラムに変更
  @Column({ type: 'date', name: 'J_DATE', nullable: false })
  jDate!: Date; // 判別した日付時間

  @Column({ type: 'varchar', name: 'J_TYPE', length: 10, nullable: false })
  jType!: string; // 判別したごみの種類

  // 4. Userエンティティとのリレーションはそのまま維持
  @ManyToOne(() => User, (user) => user.histories)
  @JoinColumn({ name: 'USER_NO' })
  user!: User;
}