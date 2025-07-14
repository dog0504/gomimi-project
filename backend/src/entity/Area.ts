import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { ZipCode } from './ZipCode';
import { Manual } from './Manual';

@Entity('AREAS')
export class Area {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Index('IDX_AREAS_name', { unique: true }) // DB上のインデックス名を指定
    @Column({ type: 'varchar', length: 100 })
    name!: string; // '大阪市' など

    @OneToMany(() => ZipCode, (zipCode) => zipCode.area)
    zipCodes!: ZipCode[];

    // Manualとの1対多リレーションを追加
    @OneToMany(() => Manual, (manual) => manual.area)
    manuals!: Manual[];
}