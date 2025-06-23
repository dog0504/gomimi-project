import {
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { GarbageType } from './GarbageType';
import { Address } from './Address';

@Entity('COLLECTION_SCHEDULE')
export class CollectionSchedule {
  @PrimaryGeneratedColumn({ type: 'int', name: 'SCHEDULE_ID' })
  id!: number; // スケジュールID (自動生成)

  @ManyToOne(() => Address, (address) => address.addressId, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ADDRESS_ID' })
  addressId!: Address; // アドレスとの関係

  @ManyToOne(() => GarbageType, (garbageType) => garbageType.id , { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'GARBAGE_TYPE_ID' })
  garbageTypeId!: GarbageType; // ゴミの種類との関係

  @Column({ type: 'varchar', name: 'COLLECTION_DAY', length: 60, nullable: false })
  collectionDay!: string; // 収集日

  @Column({ type: 'varchar', name: 'COLLECTION_TIME', length: 128, nullable: false })
  collectionTime!: string; // 収集時間
}
