import { MigrationInterface, QueryRunner } from "typeorm";

export class AddManualToHistory1752466565727 implements MigrationInterface {
    name = 'AddManualToHistory1752466565727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. 新しい`manual_id`カラムを、まずはNULLを許容する形で追加する
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`manual_id\` int NULL`);

        // 2. 【最重要】既存の履歴データを更新する
        // HISTORYのNAMEとMANUALSのgarbage_jaが完全一致するものを探し、そのITEM_NOをmanual_idに設定する
        await queryRunner.query(`
            UPDATE HISTORY H
            JOIN MANUALS M ON H.NAME = M.garbage_ja
            SET H.manual_id = M.ITEM_NO
        `);

        await queryRunner.query(`ALTER TABLE \`HISTORY\` MODIFY COLUMN \`manual_id\` int NOT NULL`);

        // 3. 外部キー制約を追加する (ON DELETE SET NULL はエンティティの定義に合わせる)
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD CONSTRAINT \`FK_history_to_manual\` FOREIGN KEY (\`manual_id\`) REFERENCES \`MANUALS\`(\`ITEM_NO\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // 4. データ移行が完了したので、不要になった古いカラムを削除する
        await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP COLUMN \`NAME\``);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP COLUMN \`J_TYPE\``);
        // await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP COLUMN \`NAME\``);
        // await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP COLUMN \`J_TYPE\``);
        // await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`manual_id\` int NOT NULL`);
        // await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD CONSTRAINT \`FK_history_to_manual\` FOREIGN KEY (\`manual_id\`) REFERENCES \`MANUALS\`(\`ITEM_NO\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`J_TYPE\` varchar(60) NULL`);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`NAME\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP FOREIGN KEY \`FK_history_to_manuals\``);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` DROP COLUMN \`manual_id\``);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`J_TYPE\` varchar(60) NULL`);
        await queryRunner.query(`ALTER TABLE \`HISTORY\` ADD \`NAME\` varchar(255) NOT NULL`);
    }

}
