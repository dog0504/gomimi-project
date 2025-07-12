import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeManualsForMultiLanguage1752281315077 implements MigrationInterface {
    name = 'NormalizeManualsForMultiLanguage1752281315077'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- 1. MANUAL_TRANSLATIONS テーブルを作成 ---
        await queryRunner.query(`
            CREATE TABLE \`MANUAL_TRANSLATIONS\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`garbage\` varchar(256) NOT NULL,
                \`type\` varchar(50) NOT NULL,
                \`contents\` text NULL,
                \`word\` varchar(4) NOT NULL,
                \`manual_id\` int NOT NULL,
                \`language_id\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);

        // --- 2. 既存のMANUALSテーブルにカラムを追加 ---
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`garbage_ja\` varchar(256) NOT NULL COMMENT 'AI検索用の日本語ゴミ名'`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`area_id\` int NOT NULL`);

        // --- 3. データの移行処理 ---
        const osakaArea = await queryRunner.query(`SELECT id FROM AREAS WHERE name = '大阪市' LIMIT 1`);
        if (!osakaArea || osakaArea.length === 0) {
            throw new Error("'大阪市' not found in AREAS table.");
        }
        const osakaAreaId = osakaArea[0].id;

        const japaneseLanguage = await queryRunner.query(`SELECT id FROM LANGUAGES WHERE code = 'ja' LIMIT 1`);
        if (!japaneseLanguage || japaneseLanguage.length === 0) {
            throw new Error("Japanese language ('ja') not found in LANGUAGES table.");
        }
        const japaneseId = japaneseLanguage[0].id;

        const oldManuals = await queryRunner.query(`SELECT * FROM MANUALS`);

        for (const manual of oldManuals) {
            await queryRunner.query(
                `UPDATE MANUALS SET garbage_ja = ? WHERE ITEM_NO = ?`,
                [manual.GARBAGE, manual.ITEM_NO]
            );

            await queryRunner.query(
                `UPDATE MANUALS SET area_id = ? WHERE ITEM_NO = ?`,
                [osakaAreaId, manual.ITEM_NO]
            );

            // ▼▼▼ ここを修正しました ▼▼▼
            await queryRunner.query(
                `INSERT INTO MANUAL_TRANSLATIONS(manual_id, language_id, garbage, type, contents, word) VALUES (?, ?, ?, ?, ?, ?)`,
                [manual.ITEM_NO, japaneseId, manual.GARBAGE, manual.G_TYPE, manual.CONTENTS, manual.WORD]
            );
        }

        // --- 4. 移行が完了した古いカラムを削除 ---
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`GARBAGE\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`G_TYPE\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`CONTENTS\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`WORD\``);

        // --- 5. 外部キー制約を追加 ---
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD CONSTRAINT \`FK_manual_to_area\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` ADD CONSTRAINT \`FK_manual_translation_to_manual\` FOREIGN KEY (\`manual_id\`) REFERENCES \`MANUALS\`(\`ITEM_NO\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` ADD CONSTRAINT \`FK_manual_translation_to_language\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- ロールバック処理 ---
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP FOREIGN KEY \`FK_manual_to_area\``);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` DROP FOREIGN KEY \`FK_manual_translation_to_manual\``);
        await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` DROP FOREIGN KEY \`FK_manual_translation_to_language\``);

        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`WORD\` varchar(4) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`CONTENTS\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`G_TYPE\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`GARBAGE\` varchar(256) NOT NULL`);

        const japaneseLanguage = await queryRunner.query(`SELECT id FROM LANGUAGES WHERE code = 'ja' LIMIT 1`);
        const japaneseId = japaneseLanguage[0].id;
        const translations = await queryRunner.query(`SELECT * FROM MANUAL_TRANSLATIONS WHERE language_id = ?`, [japaneseId]);

        for (const trans of translations) {
             // ▼▼▼ こちらも修正しました ▼▼▼
            await queryRunner.query(
                `UPDATE MANUALS SET GARBAGE = ?, G_TYPE = ?, CONTENTS = ?, WORD = ? WHERE ITEM_NO = ?`,
                [trans.garbage, trans.type, trans.contents, trans.word, trans.manual_id]
            );
        }

        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`area_id\``);
        await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`garbage_ja\``);

        await queryRunner.query(`DROP TABLE \`MANUAL_TRANSLATIONS\``);
    }
}

// import { MigrationInterface, QueryRunner } from "typeorm";

// export class NormalizeManualsForMultiLanguage1752281315077 implements MigrationInterface {
//     name = 'NormalizeManualsForMultiLanguage1752281315077'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_translation_to_language\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_translation_to_zipcode\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` DROP FOREIGN KEY \`FK_zipcode_to_area\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP FOREIGN KEY \`FK_address_to_zipcode\``);
//         await queryRunner.query(`DROP INDEX \`IDX_AREAS_name\` ON \`AREAS\``);
//         await queryRunner.query(`CREATE TABLE \`MANUAL_TRANSLATIONS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`garbage\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`contents\` text NULL, \`word\` varchar(4) NULL, \`manual_id\` int NULL, \`language_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`CONTENTS\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`G_TYPE\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`GARBAGE\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`WORD\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`garbage_ja\` varchar(255) NOT NULL COMMENT 'AI検索用の日本語ゴミ名'`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`area_id\` int NULL`);
//         await queryRunner.query(`ALTER TABLE \`AREAS\` ADD UNIQUE INDEX \`IDX_29fe654a334b826e78184db7ab\` (\`name\`)`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` CHANGE \`zip_code\` \`zip_code\` char(7) NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` CHANGE \`language_id\` \`language_id\` int NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` CHANGE \`area_id\` \`area_id\` int NULL`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` CHANGE \`zip_code\` \`zip_code\` char(7) NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_613fc2178d109ea887e5a72ebb9\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_502f3fd7b75cabde2005390330a\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` ADD CONSTRAINT \`FK_de29e057118591423415577d5fc\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD CONSTRAINT \`FK_8362f8fc84cff8ba94ced75be9e\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` ADD CONSTRAINT \`FK_bd4bda88cd5c6fd6cabea611512\` FOREIGN KEY (\`manual_id\`) REFERENCES \`MANUALS\`(\`ITEM_NO\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` ADD CONSTRAINT \`FK_1aa0b3c898441dd450b96ee0816\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD CONSTRAINT \`FK_9efdea3fb0327914c04dfdbf959\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP FOREIGN KEY \`FK_9efdea3fb0327914c04dfdbf959\``);
//         await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` DROP FOREIGN KEY \`FK_1aa0b3c898441dd450b96ee0816\``);
//         await queryRunner.query(`ALTER TABLE \`MANUAL_TRANSLATIONS\` DROP FOREIGN KEY \`FK_bd4bda88cd5c6fd6cabea611512\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP FOREIGN KEY \`FK_8362f8fc84cff8ba94ced75be9e\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` DROP FOREIGN KEY \`FK_de29e057118591423415577d5fc\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_502f3fd7b75cabde2005390330a\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_613fc2178d109ea887e5a72ebb9\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` CHANGE \`zip_code\` \`zip_code\` char(7) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` CHANGE \`area_id\` \`area_id\` int NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` CHANGE \`language_id\` \`language_id\` int NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` CHANGE \`zip_code\` \`zip_code\` char(7) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`AREAS\` DROP INDEX \`IDX_29fe654a334b826e78184db7ab\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`area_id\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` DROP COLUMN \`garbage_ja\``);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`WORD\` varchar(4) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`GARBAGE\` varchar(256) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`G_TYPE\` varchar(50) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`MANUALS\` ADD \`CONTENTS\` text NULL`);
//         await queryRunner.query(`DROP TABLE \`MANUAL_TRANSLATIONS\``);
//         await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_AREAS_name\` ON \`AREAS\` (\`name\`)`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD CONSTRAINT \`FK_address_to_zipcode\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` ADD CONSTRAINT \`FK_zipcode_to_area\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_translation_to_zipcode\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_translation_to_language\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
//     }

// }
