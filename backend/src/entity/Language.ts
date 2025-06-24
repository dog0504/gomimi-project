import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany 
} from 'typeorm';
import { User } from './User'; // Userエンティティをインポート

@Entity('LANGUAGES') // テーブル名を指定
export class Language {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 8, unique: true })
    code!: string; // 例: 'ja', 'en'

    @Column({ length: 32 })
    name!: string; // 例: '日本語', 'English'

    @OneToMany(() => User, (user) => user.languageId)
    users!: User[]; // Userエンティティとの1対多の関係を定義
}

// サンプルデータ
export const LANGUAGE_SEED_DATA: Partial<Language>[] = [
    { code: 'ja', name: 'Japanese' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    // 必要に応じて追加
];
