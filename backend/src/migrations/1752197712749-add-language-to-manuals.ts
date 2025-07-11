import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLanguageToManuals1752197712749 implements MigrationInterface {
    name = 'AddLanguageToManuals1752197712749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. カラムを追加
    await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`language_id\` int NOT NULL`);

    // 2. 既存のデータに言語IDを設定
    await queryRunner.query(`UPDATE \`MANUALS\` SET \`language_id\` = 1`);

    // 3. 外部キー制約を追加
    await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD CONSTRAINT \`FK_b6a9a24d0588579f7cd0708654b\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP FOREIGN KEY \`FK_b6a9a24d0588579f7cd0708654b\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`language_id\``);
    }

}
