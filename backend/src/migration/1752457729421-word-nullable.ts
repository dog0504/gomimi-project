import { MigrationInterface, QueryRunner } from "typeorm";

export class WordNullable1752457729421 implements MigrationInterface {
    name = 'WordNullable1752457729421'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` CHANGE \`word\` \`word\` varchar(4) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` CHANGE \`word\` \`word\` varchar(4) NOT NULL`);
    }
}
