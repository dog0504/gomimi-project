import { Entity, PrimaryGeneratedColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { GarbageTypeTranslation } from './GarbageTypeTranslation';
import { CollectionSchedule } from './CollectionSchedule';

@Entity({ name: 'GARBAGE_TYPE' })
export class GarbageType {
  @PrimaryColumn({ name: 'GARBAGE_TYPE_ID' })
  id!: number;

  @OneToMany(() => GarbageTypeTranslation, (translation) => translation.typeId, {
    cascade: true, // 親を保存する時に一緒に保存する
  })
  translations!: GarbageTypeTranslation[];

  @OneToMany(() => CollectionSchedule, (schedule) => schedule.garbageType)
  schedules!: CollectionSchedule[]; // スケジュールとの関係
}


// import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
// import { CollectionSchedule } from './CollectionSchedule';

// @Entity('GARBAGE_TYPE')
// export class GarbageType {
//   @PrimaryColumn({ type: 'int', name: 'GARBAGE_TYPE_ID' })
//   id!: number; // ゴミの種類ID

//   @Column({ type: 'varchar', name: 'GARBAGE_TYPE_NAME', length: 50, nullable: false })
//   type!: string; // ゴミの種類名

//   @OneToMany(() => CollectionSchedule, (schedule) => schedule.garbageType)
//   schedules!: CollectionSchedule[]; // スケジュールとの関係
// }
