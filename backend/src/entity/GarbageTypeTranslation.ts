import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique , Index} from 'typeorm';
import { GarbageType } from './GarbageType';
import { Language } from './Language';

@Entity({ name: 'GARBAGE_TYPE_TRANSLATIONS' })
// @Unique(['garbageType', 'language']) // ゴミの種類と言語の組み合わせはユニークにする
// @Index(['garbageType', 'language'], { unique: true }) // ★ @Unique から @Index に変更
export class GarbageTypeTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name!: string; // '普通ごみ', 'Regular Waste' など

  @ManyToOne(() => GarbageType, (garbageType) => garbageType.translations, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'garbage_type_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_translation_to_garbage_type' })
  typeId!: GarbageType;

  @ManyToOne(() => Language, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'language_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_garbage_type_translation_to_language' })
  languageId!: Language;
}