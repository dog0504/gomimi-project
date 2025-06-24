import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { CollectionSchedule } from './CollectionSchedule';

@Entity('GARBAGE_TYPE')
export class GarbageType {
  @PrimaryColumn({ type: 'int', name: 'GARBAGE_TYPE_ID' })
  id!: number; // ゴミの種類ID

  @Column({ type: 'varchar', name: 'GARBAGE_TYPE_NAME', length: 50, nullable: false })
  type!: string; // ゴミの種類名

  @OneToMany(() => CollectionSchedule, (schedule) => schedule.garbageType)
  schedules!: CollectionSchedule[]; // スケジュールとの関係
}
