import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { CollectionSchedule } from './CollectionSchedule';
import { ZipCode } from './ZipCode';

@Entity('ADDRESS')
export class Address {
  @PrimaryColumn({ type: 'int', name: 'ADDRESS_ID' })
  addressId!: number;

  // CITY, WARD, TOWN, ZIP は削除

  @Column({ type: 'varchar', name: 'CHOM', length: 5, nullable: true })
  chom!: string;

  @Column({ type: 'varchar', name: 'STREET', length: 30, nullable: true })
  street!: string;

  @Column({ type: 'varchar', name: 'INF', length: 256, nullable: true })
  inf!: string;

  @ManyToOne(() => ZipCode, (zipCode) => zipCode.addresses, {
      nullable: false, // DBがNOT NULLなのでfalseを指定
      onDelete: 'RESTRICT', // DBの制約に合わせる
  })
  @JoinColumn({ name: 'zip_code', referencedColumnName: 'zip_code', foreignKeyConstraintName: 'FK_address_to_zipcode' })
  zipCode!: ZipCode;

  @OneToMany(() => User, (user) => user.address)
  user!: User[]; // ユーザーとの関係

  @OneToMany(() => CollectionSchedule, (schedule) => schedule.address)
  schedules!: CollectionSchedule[]; // スケジュールとの関係

  // User, CollectionScheduleとのリレーションはそのまま
}

// // src/entity/Address.ts

// import { Entity, Column, ManyToOne, PrimaryColumn, OneToMany } from 'typeorm';
// import { User } from './User';
// import { CollectionSchedule } from './CollectionSchedule';

// @Entity('ADDRESS')
// export class Address {
//   @PrimaryColumn({ type: 'int', name: 'ADDRESS_ID' })
//   addressId!: number; // アドレスID (CSVの値を使用)

//   @Column({ type: 'char', name: 'ZIP', length: 7, nullable: false })
//   zip!: string; // 郵便番号

//   @Column({ type: 'varchar', name: 'CITY', length: 8, nullable: false })
//   city!: string; // 市

//   @Column({ type: 'varchar', name: 'WARD', length: 5, nullable: false })
//   ward!: string; // 区

//   @Column({ type: 'varchar', name: 'TOWN', length: 5, nullable: false })
//   town!: string; // 町

//   @Column({ type: 'varchar', name: 'CHOM', length: 5, nullable: true })
//   chom!: string; // 丁目

//   @Column({ type: 'varchar', name: 'STREET', length: 30, nullable: true })
//   street!: string; // 番地

//   @Column({ type: 'varchar', name: 'INF', length: 256, nullable: true })
//   inf!: string; // 追加情報

//   @OneToMany(() => User, (user) => user.address)
//   user!: User[]; // ユーザーとの関係

//   @OneToMany(() => CollectionSchedule, (schedule) => schedule.address)
//   schedules!: CollectionSchedule[]; // スケジュールとの関係
// }