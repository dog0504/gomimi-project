// src/entity/User.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { History } from './History';
import { Tification } from './Tification';
import { Address } from './Address';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'USER_NO' })
  userNo!: number; // ユーザー番号 

  @Column({ type: 'char', name: 'G_ACCOUNT', length: 30, nullable: true })
  gAccount!: string; // Googleアカウント 

  @Column({ type: 'varchar', name: 'PASS', length: 256, nullable: false })
  pass!: string; // パスワード 

  @Column({
    type: 'varchar',
    name: 'MAIL',
    length: 256,
    nullable: false,
    unique: true,
  })
  mail!: string; // メールアドレス 

  @Column({ type: 'varchar', name: 'LNG', length: 10, nullable: false })
  lng!: string; // 指定言語 

  @OneToMany(() => History, (history) => history.user)
  histories!: History[];

  @OneToOne(() => Tification, (tification) => tification.user)
  tification!: Tification;

  @ManyToOne(() => Address, (address) => address.user)
  addresses!: Address; // 多対1の関係に対応するプロパティを追加
}