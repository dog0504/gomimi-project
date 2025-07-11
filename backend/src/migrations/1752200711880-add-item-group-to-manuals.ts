import { MigrationInterface, QueryRunner } from "typeorm";

export class AddItemGroupToManuals1752200711880 implements MigrationInterface {
    name = 'AddItemGroupToManuals1752200711880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`item_group_id\` int NOT NULL`);
        // 2. 【重要】既存データのitem_group_idに、ITEM_NOの値を設定する
        await queryRunner.query(`UPDATE \`MANUALS\` SET \`item_group_id\` = \`ITEM_NO\``);
        await queryRunner.query(`CREATE INDEX \`IDX_4b2c14ccb14d17ecd0df5631ac\` ON \`MANUALS\` (\`item_group_id\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_4b2c14ccb14d17ecd0df5631ac\` ON \`MANUALS\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`item_group_id\``);
    }

}
