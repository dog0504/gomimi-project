import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeGtypeLength1752202517060 implements MigrationInterface {
    name = 'ChangeGtypeLength1752202517060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`GARBAGE\``);
        // await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`GARBAGE\` varchar(255) NOT NULL`);
        // await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`G_TYPE\``);
        // await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`G_TYPE\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` MODIFY COLUMN \`GARBAGE\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` MODIFY COLUMN \`G_TYPE\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`G_TYPE\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`G_TYPE\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`GARBAGE\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`GARBAGE\` varchar(256) NOT NULL`);
    }

}
