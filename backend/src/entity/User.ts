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
import { Language } from './Language';

@Entity('USERS')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'USER_NO' })
  id!: number; // ユーザー番号 

  @Column({ type: 'char', name: 'G_ACCOUNT', length: 30, nullable: true })
  gAccount!: string; // Googleアカウント 

  @Column({ type: 'varchar', name: 'PASS', length: 256, nullable: false })
  password!: string; // パスワード 

  @Column({
    type: 'varchar',
    name: 'MAIL',
    length: 256,
    nullable: false,
    unique: true,
  })
  email!: string; // メールアドレス
  
  @ManyToOne(() => Address, (address) => address.addressId)
  @JoinColumn({ name: 'ADDRESS_ID' })
  address!: Address; // 多対1の関係に対応するプロパティを追加

  @ManyToOne(() => Language, (language) => language.id, { nullable: false })
  @JoinColumn({ name: 'LANGUAGE_ID' })
  language!: Language; // 多対1の関係に対応するプロパティを追加

  @OneToMany(() => History, (history) => history.userId)
  histories!: History[];

  @OneToMany(() => Tification, (tification) => tification.userId)
  tification!: Tification[];
}