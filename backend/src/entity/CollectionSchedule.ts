import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { GarbageType } from './GarbageType';
import { Address } from './Address';

@Entity('COLLECTION_SCHEDULE')
export class CollectionSchedule {
  @PrimaryGeneratedColumn({ type: 'int', name: 'SCHEDULE_ID' })
  scheduleId!: number; // スケジュールID (自動生成)

  @Column({ type: 'int', name: 'ADDRESS_ID', nullable: false })
  addressId!: number; // アドレスID

  @Column({ type: 'int', name: 'GARBAGE_TYPE_ID', nullable: false })
  garbageTypeId!: number; // ゴミの種類ID

  @Column({ type: 'varchar', name: 'COLLECTION_DAY', length: 60, nullable: false })
  collectionDay!: string; // 収集日

  @Column({ type: 'varchar', name: 'COLLECTION_TIME', length: 128, nullable: false })
  collectionTime!: string; // 収集時間

  @ManyToOne(() => GarbageType, (garbageType) => garbageType.schedules)
  garbageType!: GarbageType; // ゴミの種類との関係

  @ManyToOne(() => Address, (address) => address.user)
  address!: Address; // アドレスとの関係
}
