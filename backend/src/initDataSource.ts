import fs from 'fs';
import path from 'path';
import csv from 'csv-parser'; // csv-parserのインポート
import { AppDataSource } from './data-source';
import { BinDay } from './entity/BinDay';
import { Manuals } from './entity/Manual';

/**
 * データソースの初期化を行う関数
 * @param retries 再試行回数
 * @param delay 再試行間隔（ミリ秒）
 */
export async function initDataSource(retries = 5, delay = 5000): Promise<void> {
    console.log('Initializing Data Source...');
    // データソースの初期化を試みる
    while (retries > 0) {
        try {
            // データソースの初期化
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
            return;
        } catch (error) {
            // エラーが発生した場合、再試行する
            console.error(`Failed to connect to the database. Retrying in ${delay / 1000} seconds...`);
            console.error('Error during Data Source initialization:', error);

            retries -= 1;
            if (retries === 0) {
                console.error('Could not connect to the database. Exiting...');
                process.exit(1);
            }
            // 再試行まで待機
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}

// CSVファイルが配置されているディレクトリ
const CSV_DIR = path.join(__dirname, '../csv');

/**
 * 'BIN_DAY' テーブルにCSVデータが存在しない場合のみ挿入する
 * @param dataSource TypeORMのDataSourceインスタンス
 */
async function seedBinDay(): Promise<void> {
    const binDayRepository = AppDataSource.getRepository(BinDay);
    
    // 1. テーブルが空かどうかチェック
    const count = await binDayRepository.count();
    if (count > 0) {
        console.log('BIN_DAY テーブルには既にデータが存在するため、スキップします。');
        return;
    }
    
    console.log('BIN_DAY テーブルにデータを挿入します...');
    const results: BinDay[] = [];
    const csvFilePath = path.join(CSV_DIR, 'mysql_data.csv'); // SQLファイルに記載のCSV

    // SQLのLOAD DATA文のカラム順序に合わせてヘッダーを明示的に定義
    const headers = ['CITY', 'WARD', 'TOWN', 'CHOM', 'STREET', 'INF', 'RUDDISH', 'DAYS', 'C_TIME'];


    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
        // headersオプションを追加し、CSVの1行目(ヘッダー行)をスキップする
        .pipe(csv({ headers: headers, skipLines: 1 })) // IGNORE 1 ROWS と同等の処理
        .on('data', (data) => {
            const binDay = new BinDay();
            // SQLのカラム指定に合わせてマッピング
            binDay.city = data.CITY;
            binDay.ward = data.WARD;
            binDay.town = data.TOWN;
            binDay.chom = data.CHOM;
            binDay.street = data.STREET;
            binDay.inf = data.INF || null; // INFはNULLを許容する場合
            binDay.ruddish = data.RUDDISH;
            binDay.days = data.DAYS;
            binDay.cTime = data.C_TIME;
            results.push(binDay);
        })
        .on('end', async () => {
            // results配列が空でないことを確認してから保存する
            if (results.length === 0) {
                console.warn('BIN_DAY テーブルに挿入するデータが見つかりませんでした。CSVファイルが空または形式が不正の可能性があります。');
                return resolve();
            }
            try {
            // チャンクに分けて挿入すると、大量データでもメモリに優しい
            await binDayRepository.save(results, { chunk: 500 });
            console.log('BIN_DAY テーブルへのデータ挿入が完了しました。');
            resolve();
            } catch (error) {
            console.error('BIN_DAY テーブルへのデータ挿入中にエラーが発生しました:', error);
            reject(error);
            }
        });
    });
}

/**
 * 'MANUALS' テーブルにCSVデータが存在しない場合のみ挿入する
 * @param dataSource TypeORMのDataSourceインスタンス
 */
async function seedManuals(): Promise<void> {
    const manualsRepository = AppDataSource.getRepository(Manuals);

    const count = await manualsRepository.count();
    if (count > 0) {
        console.log('MANUALS テーブルには既にデータが存在するため、スキップします。');
        return;
    }
    
    console.log('MANUALS テーブルにデータを挿入します...');
    const results: Manuals[] = [];
    const csvFilePath = path.join(CSV_DIR, 'garbage_list.csv'); // SQLファイルに記載のCSV

    // SQLの `(@col1, @col2, @col3, @col4)` はヘッダーがないか、ヘッダーを無視して列の順序で読むことを意味するため、
    // csv-parserのheadersオプションでマッピングを定義する
    const headers = ['WORD', 'GARBAGE', 'G_TYPE', 'CONTENTS'];

    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
        .pipe(csv({ headers: headers, skipLines: 1 })) // IGNORE 1 ROWS
        .on('data', (data) => {
            const manual = new Manuals();
            // SQLのSET句に合わせてマッピング
            manual.word = data.WORD;
            manual.garbage = data.GARBAGE;
            manual.gType = data.G_TYPE;
            manual.contents = data.CONTENTS;
            results.push(manual);
        })
        .on('end', async () => {
            try {
            await manualsRepository.save(results, { chunk: 500 });
            console.log('MANUALS テーブルへのデータ挿入が完了しました。');
            resolve();
            } catch (error) {
            console.error('MANUALS テーブルへのデータ挿入中にエラーが発生しました:', error);
            reject(error);
            }
        });
    });
}

/**
 * データベースの初期化処理（シーディング）を実行する
 * @param dataSource TypeORMのDataSourceインスタンス
 */
export async function seedDatabase(): Promise<void> {
    try {
        console.log('データベースの初期データ挿入処理を開始します...');
        await seedBinDay();
        await seedManuals();
        console.log('すべてのデータ挿入処理が完了しました。');
    } catch (error) {
        console.error('データベースの初期化中にエラーが発生しました:', error);
    }
}