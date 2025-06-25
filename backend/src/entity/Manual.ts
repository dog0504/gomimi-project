// src/entity/Manuals.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('MANUALS')
export class Manuals {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ITEM_NO' })
  id!: number; // ゴミ識別番号 

  @Column({ type: 'varchar', name: 'GARBAGE', length: 256, nullable: false })
  garbage!: string; // ゴミ名前 

  @Column({ type: 'varchar', name: 'G_TYPE', length: 50, nullable: false })
  type!: string; // 分別区分 

  @Column({ type: 'text', name: 'CONTENTS', nullable: true })
  contents!: string; // 分別注意文 

  @Column({ type: 'varchar', name: 'WORD', length: 4, nullable: false })
  word!: string; // キーワード 
}