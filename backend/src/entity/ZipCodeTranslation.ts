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

    @ManyToOne(() => ZipCode, (zipCode) => zipCode.translations, {
        nullable: false, // DBがNOT NULLなのでfalseを指定
        onDelete: 'CASCADE', // DBの制約に合わせる
    })
    @JoinColumn({ name: 'zip_code', referencedColumnName: 'zip_code', foreignKeyConstraintName: 'FK_translation_to_zipcode' })
    zipCode!: ZipCode;

    @ManyToOne(() => Language, {
        nullable: false, // DBがNOT NULLなのでfalseを指定
        onDelete: 'RESTRICT', // DBの制約に合わせる
    })
    @JoinColumn({ name: 'language_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_translation_to_language' })
    language!: Language;
}