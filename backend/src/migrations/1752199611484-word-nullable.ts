import { MigrationInterface, QueryRunner } from "typeorm";

export class WordNullable1752199611484 implements MigrationInterface {
    name = 'WordNullable1752199611484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUALS\` CHANGE \`WORD\` \`WORD\` varchar(4) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`MANUALS\` CHANGE \`WORD\` \`WORD\` varchar(4) NOT NULL`);
    }

}
