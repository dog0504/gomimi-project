import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Manual } from './Manual';
import { Language } from './Language';

@Entity('MANUAL_TRANSLATIONS')
export class ManualTranslation {
    @PrimaryGeneratedColumn({ type: 'int' })
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    garbage!: string; // 表示用のゴミ名前

    @Column({ type: 'varchar', length: 255 })
    type!: string; // 表示用の分別区分

    @Column({ type: 'text', nullable: true })
    contents!: string | null; // 表示用の分別注意文

    @Column({ type: 'varchar', length: 4, nullable: true })
    word!: string; // 表示用のキーワード

    @ManyToOne(() => Manual, (manual) => manual.translations)
    @JoinColumn({ name: 'manual_id' })
    manual!: Manual;

    @ManyToOne(() => Language)
    @JoinColumn({ name: 'language_id' })
    language!: Language;
}