// src/entity/Manuals.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Language } from './Language';

@Entity('MANUALS')
export class Manuals {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ITEM_NO' })
  id!: number; // ゴミ識別番号 

  @Index() // 検索で使うのでインデックスを貼る
  @Column({ name: 'item_group_id' })
  itemGroupId!: number;

  @Column({ type: 'varchar', name: 'GARBAGE', length: 255, nullable: false })
  garbage!: string; // ゴミ名前 

  @Column({ type: 'varchar', name: 'G_TYPE', length: 255, nullable: false })
  type!: string; // 分別区分 

  @Column({ type: 'text', name: 'CONTENTS', nullable: true })
  contents!: string; // 分別注意文 

  @Column({ type: 'varchar', name: 'WORD', length: 4, nullable: true })
  word!: string; // キーワード 

  @ManyToOne(() => Language, {
    nullable: false, // どの言語か必ず指定する
    eager: true,    // Manualを検索した時に自動でLanguage情報も取得する
  })
  @JoinColumn({ name: 'language_id' }) // DB上のカラム名
  language!: Language;
}