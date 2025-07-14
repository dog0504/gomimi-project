import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ManualTranslation } from './ManualTranslation';
import { Area } from './Area';
import { History } from './History';

@Entity('MANUALS')
export class Manual {
  @PrimaryGeneratedColumn({ type: 'int', name: 'ITEM_NO' })
  id!: number;

  // --- ★ここを追加★ ---
  @Column({ type: 'varchar', name: 'garbage_ja', length: 255, comment: 'AI検索用の日本語ゴミ名' })
  garbageJa!: string;
  // --------------------

  // GARBAGE, G_TYPE, CONTENTS, WORD のカラム定義は削除

  @OneToMany(() => ManualTranslation, (translation) => translation.manual, {
    cascade: true,
    eager: true,
  })
  translations!: ManualTranslation[];

  @ManyToOne(() => Area, (area) => area.manuals, {
      nullable: false, // DBがNOT NULLなのでfalseを指定
      onDelete: 'RESTRICT', // DBの制約に合わせる
  })
  @JoinColumn({ name: 'area_id', referencedColumnName: 'id', foreignKeyConstraintName: 'FK_manual_to_area' })
  area!: Area;

  @OneToMany(() => History, (history) => history.manual, {
    cascade: true,
    eager: true,
  })
  histories!: History[];
}

// // src/entity/Manuals.ts

// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// @Entity('MANUALS')
// export class Manuals {
//   @PrimaryGeneratedColumn({ type: 'int', name: 'ITEM_NO' })
//   id!: number; // ゴミ識別番号 

//   @Column({ type: 'varchar', name: 'GARBAGE', length: 256, nullable: false })
//   garbage!: string; // ゴミ名前 

//   @Column({ type: 'varchar', name: 'G_TYPE', length: 50, nullable: false })
//   type!: string; // 分別区分 

//   @Column({ type: 'text', name: 'CONTENTS', nullable: true })
//   contents!: string; // 分別注意文 

//   @Column({ type: 'varchar', name: 'WORD', length: 4, nullable: false })
//   word!: string; // キーワード 
// }