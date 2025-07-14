import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorGarbageType1752471591215 implements MigrationInterface {
    name = 'RefactorGarbageType1752471591215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 翻訳用の新しいテーブルを作成
        await queryRunner.query(`
            CREATE TABLE \`GARBAGE_TYPE_TRANSLATIONS\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(50) NOT NULL,
                \`garbage_type_id\` int NOT NULL,
                \`language_id\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // 2. 【最重要】既存の日本語データを新しいテーブルへコピーする (言語ID=1と仮定)
        await queryRunner.query(`
            INSERT INTO \`GARBAGE_TYPE_TRANSLATIONS\` (garbage_type_id, language_id, name)
            SELECT
                GARBAGE_TYPE_ID,
                1,
                GARBAGE_TYPE_NAME
            FROM \`GARBAGE_TYPE\`
        `);

        // 3. 新しいテーブルに外部キー制約などを追加する
        //    あなたのエンティティ定義に合わせて、`GARBAGE_TYPE`の主キー`id`を参照するように修正
        await queryRunner.query(`ALTER TABLE \`GARBAGE_TYPE_TRANSLATIONS\` ADD CONSTRAINT \`FK_translation_to_garbage_type\` FOREIGN KEY (\`garbage_type_id\`) REFERENCES \`GARBAGE_TYPE\`(\`GARBAGE_TYPE_ID\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`GARBAGE_TYPE_TRANSLATIONS\` ADD CONSTRAINT \`FK_garbage_type_translation_to_language\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);

        // 4. データ移行が完了したので、元のテーブルから不要になったカラム「だけ」を削除する
        await queryRunner.query(`ALTER TABLE \`GARBAGE_TYPE\` DROP COLUMN \`GARBAGE_TYPE_NAME\``);
    }

    // downメソッドも、元に戻せるように修正しておくとより安全です
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`GARBAGE_TYPE\` ADD \`GARBAGE_TYPE_NAME\` varchar(50) NOT NULL`);
        // 必要なら、データを元に戻すUPDATE文をここに追加
        // await queryRunner.query(`UPDATE GARBAGE_TYPE GT JOIN GARBAGE_TYPE_TRANSLATIONS GTT ON GT.GARBAGE_TYPE_ID = GTT.garbage_type_id SET GT.GARBAGE_TYPE_NAME = GTT.name WHERE GTT.language_id = 1`);
        await queryRunner.query(`DROP TABLE \`GARBAGE_TYPE_TRANSLATIONS\``);
    }
}