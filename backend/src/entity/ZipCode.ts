import { Entity, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Area } from './Area';
import { ZipCodeTranslation } from './ZipCodeTranslation';
import { Address } from './Address';

@Entity('ZIP_CODES')
export class ZipCode {
    @PrimaryColumn({ type: 'char', length: 7 })
    zip_code!: string;

    @ManyToOne(() => Area, (area) => area.zipCodes)
    @JoinColumn({ name: 'area_id' })
    area!: Area;

    @OneToMany(() => ZipCodeTranslation, (translation) => translation.zipCode)
    translations!: ZipCodeTranslation[];

    @OneToMany(() => Address, (address) => address.zipCode)
    addresses!: Address[];
}