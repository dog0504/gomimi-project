// src/entity/BinDay.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('BIN_DAY')
export class BinDay {
  @PrimaryGeneratedColumn({ type: 'int', name: 'BIN_NO' })
  binNo!: number; // 収集日ID 

  @Column({ type: 'varchar', name: 'CITY', length: 30, nullable: false })
  city!: string; // 市 

  @Column({ type: 'varchar', name: 'WARD', length: 30, nullable: false })
  ward!: string; // 区 

  @Column({ type: 'varchar', name: 'TOWN', length: 30, nullable: false })
  town!: string; // 町 

  @Column({ type: 'varchar', name: 'CHOM', length: 30, nullable: false })
  chom!: string; // 丁目 

  @Column({ type: 'varchar', name: 'STREET', length: 30, nullable: true })
  street!: string; // 番地 

  @Column({ type: 'varchar', name: 'INF', length: 128, nullable: true })
  inf!: string; // 追記 

  @Column({ type: 'varchar', name: 'RUDDISH', length: 30, nullable: false })
  ruddish!: string; // ごみの種類 

  @Column({ type: 'varchar', name: 'DAYS', length: 20, nullable: false })
  days!: string; // ごみ収集の曜日 

  @Column({ type: 'varchar', name: 'C_TIME', length: 50, nullable: false })
  cTime!: string; // 収集時間 
}