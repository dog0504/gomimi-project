import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ZipCode } from './ZipCode';

@Entity('AREAS')
export class Area {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ type: 'varchar', length: 100, unique: true })
    name!: string; // '大阪市' など

    @OneToMany(() => ZipCode, (zipCode) => zipCode.area)
    zipCodes!: ZipCode[];
}