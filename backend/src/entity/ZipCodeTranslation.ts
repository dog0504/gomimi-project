import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ZipCode } from './ZipCode';
import { Language } from './Language';

@Entity('ZIP_CODE_TRANSLATIONS')
export class ZipCodeTranslation {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    city!: string;

    @Column({ type: 'varchar', length: 100 })
    ward!: string;

    @Column({ type: 'varchar', length: 100 })
    town!: string;

    @ManyToOne(() => ZipCode, (zipCode) => zipCode.translations)
    @JoinColumn({ name: 'zip_code' })
    zipCode!: ZipCode;

    @ManyToOne(() => Language)
    @JoinColumn({ name: 'language_id' })
    language!: Language;
}