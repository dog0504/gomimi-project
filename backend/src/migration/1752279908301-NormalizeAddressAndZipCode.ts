import { MigrationInterface, QueryRunner } from "typeorm";

export class NormalizeAddressAndZipCode1752279908301 implements MigrationInterface {
    name = 'NormalizeAddressAndZipCode1752279908301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- 1. 新しいテーブルを作成 ---
        await queryRunner.query(`CREATE TABLE \`AREAS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_AREAS_name\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ZIP_CODES\` (\`zip_code\` char(7) NOT NULL, \`area_id\` int NOT NULL, PRIMARY KEY (\`zip_code\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ZIP_CODE_TRANSLATIONS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`city\` varchar(100) NOT NULL, \`ward\` varchar(100) NOT NULL, \`town\` varchar(100) NOT NULL, \`zip_code\` char(7) NOT NULL, \`language_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        // --- 2. 既存のADDRESSテーブルからデータを移行 ★★★ここが重要★★★ ---
        
        // '大阪市'をAREASテーブルに挿入し、そのIDを取得
        await queryRunner.query(`INSERT INTO AREAS (name) VALUES ('大阪市')`);
        const osakaArea = await queryRunner.query(`SELECT id FROM AREAS WHERE name = '大阪市' LIMIT 1`);
        const osakaAreaId = osakaArea[0].id;

        // '日本語'のIDを取得
        const japaneseLanguage = await queryRunner.query(`SELECT id FROM LANGUAGES WHERE code = 'ja' LIMIT 1`);
        if (!japaneseLanguage || japaneseLanguage.length === 0) {
            throw new Error("Japanese language ('ja') not found in LANGUAGES table.");
        }
        const japaneseId = japaneseLanguage[0].id;

        // 既存ADDRESSテーブルからユニークな地名情報を取得
        const distinctAddresses = await queryRunner.query(`SELECT DISTINCT ZIP, CITY, WARD, TOWN FROM ADDRESS`);

        for (const addr of distinctAddresses) {
            // ZIP_CODES にデータを挿入 (重複は無視)
            await queryRunner.query(
                `INSERT IGNORE INTO ZIP_CODES (zip_code, area_id) VALUES (?, ?)`,
                [addr.ZIP, osakaAreaId]
            );

            // ZIP_CODE_TRANSLATIONS に日本語データを挿入
            await queryRunner.query(
                `INSERT INTO ZIP_CODE_TRANSLATIONS (zip_code, language_id, city, ward, town) VALUES (?, ?, ?, ?, ?)`,
                [addr.ZIP, japaneseId, addr.CITY, addr.WARD, addr.TOWN]
            );
        }

        // --- 3. 既存のADDRESSテーブルの構造を変更 ---
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`zip_code_fk\` char(7) NULL`);
        await queryRunner.query(`UPDATE \`ADDRESS\` SET \`zip_code_fk\` = \`ZIP\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` MODIFY COLUMN \`zip_code_fk\` char(7) NOT NULL`);
        
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`ZIP\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`CITY\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`WARD\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`TOWN\``);
        
        // カラム名をエンティティに合わせて変更
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` CHANGE \`zip_code_fk\` \`zip_code\` char(7) NOT NULL`);

        // --- 4. 外部キー制約を追加 ---
        await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_translation_to_zipcode\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_translation_to_language\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` ADD CONSTRAINT \`FK_zipcode_to_area\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD CONSTRAINT \`FK_address_to_zipcode\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ロールバック処理（自動生成されたものとほぼ同じですが念のため）
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP FOREIGN KEY \`FK_address_to_zipcode\``);
        await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` DROP FOREIGN KEY \`FK_zipcode_to_area\``);
        await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_translation_to_language\``);
        await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_translation_to_zipcode\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`zip_code\``);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`TOWN\` varchar(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`WARD\` varchar(5) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`CITY\` varchar(8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`ZIP\` char(7) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`ZIP_CODES\``);
        await queryRunner.query(`DROP TABLE \`ZIP_CODE_TRANSLATIONS\``);
        await queryRunner.query(`DROP INDEX \`IDX_29fe654a334b826e78184db7ab\` ON \`AREAS\``);
        await queryRunner.query(`DROP TABLE \`AREAS\``);
    }
}

// import { MigrationInterface, QueryRunner } from "typeorm";

// export class NormalizeAddressAndZipCode1752279908301 implements MigrationInterface {
//     name = 'NormalizeAddressAndZipCode1752279908301'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`CREATE TABLE \`AREAS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_29fe654a334b826e78184db7ab\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
//         await queryRunner.query(`CREATE TABLE \`ZIP_CODE_TRANSLATIONS\` (\`id\` int NOT NULL AUTO_INCREMENT, \`city\` varchar(100) NOT NULL, \`ward\` varchar(100) NOT NULL, \`town\` varchar(100) NOT NULL, \`zip_code\` char(7) NULL, \`language_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
//         await queryRunner.query(`CREATE TABLE \`ZIP_CODES\` (\`zip_code\` char(7) NOT NULL, \`area_id\` int NULL, PRIMARY KEY (\`zip_code\`)) ENGINE=InnoDB`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`ZIP\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`CITY\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`WARD\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`TOWN\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`zip_code\` char(7) NULL`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_613fc2178d109ea887e5a72ebb9\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` ADD CONSTRAINT \`FK_502f3fd7b75cabde2005390330a\` FOREIGN KEY (\`language_id\`) REFERENCES \`LANGUAGES\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` ADD CONSTRAINT \`FK_de29e057118591423415577d5fc\` FOREIGN KEY (\`area_id\`) REFERENCES \`AREAS\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD CONSTRAINT \`FK_8362f8fc84cff8ba94ced75be9e\` FOREIGN KEY (\`zip_code\`) REFERENCES \`ZIP_CODES\`(\`zip_code\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP FOREIGN KEY \`FK_8362f8fc84cff8ba94ced75be9e\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODES\` DROP FOREIGN KEY \`FK_de29e057118591423415577d5fc\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_502f3fd7b75cabde2005390330a\``);
//         await queryRunner.query(`ALTER TABLE \`ZIP_CODE_TRANSLATIONS\` DROP FOREIGN KEY \`FK_613fc2178d109ea887e5a72ebb9\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` DROP COLUMN \`zip_code\``);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`TOWN\` varchar(5) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`WARD\` varchar(5) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`CITY\` varchar(8) NOT NULL`);
//         await queryRunner.query(`ALTER TABLE \`ADDRESS\` ADD \`ZIP\` char(7) NOT NULL`);
//         await queryRunner.query(`DROP TABLE \`ZIP_CODES\``);
//         await queryRunner.query(`DROP TABLE \`ZIP_CODE_TRANSLATIONS\``);
//         await queryRunner.query(`DROP INDEX \`IDX_29fe654a334b826e78184db7ab\` ON \`AREAS\``);
//         await queryRunner.query(`DROP TABLE \`AREAS\``);
//     }

// }
