import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumnLengths1752457413765 implements MigrationInterface {
    name = 'UpdateColumnLengths1752457413765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // MODIFY COLUMN を使い、データを保持したままカラムの定義を変更する
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` MODIFY COLUMN \`garbage\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` MODIFY COLUMN \`type\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` MODIFY COLUMN \`garbage_ja\` varchar(255) NOT NULL COMMENT 'AI検索用の日本語ゴミ名'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // downメソッドも同様に、元のサイズに戻すように修正する
        await queryRunner.query(`ALTER TABLE \`MANUALS\` MODIFY COLUMN \`garbage_ja\` varchar(256) NOT NULL COMMENT 'AI検索用の日本語ゴミ名'`);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` MODIFY COLUMN \`type\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` MODIFY COLUMN \`garbage\` varchar(256) NOT NULL`);
    }
}