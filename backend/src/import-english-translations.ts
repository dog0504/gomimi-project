// src/import-english-translations.ts

import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { AppDataSource } from './data-source'; // あなたのDataSourceファイルを指定
import { Manual } from './entity/Manual';   // あなたのManualエンティティファイルを指定
import { Language } from './entity/Language'; // あなたのLanguageエンティティファイルを指定
import { ManualTranslation } from './entity/ManualTranslation'; // あなたのManualTranslationエンティティファイルを指定

// メインの実行関数
export const importEnglishTranslations = async () => {
  // 1. データベース接続を初期化
//   await AppDataSource.initialize();
//   console.log('データベースに接続しました。');

  const manualRepo = AppDataSource.getRepository(Manual);
  const languageRepo = AppDataSource.getRepository(Language);
  const translationRepo = AppDataSource.getRepository(ManualTranslation);

  try {
    // 2. 必要な「言語」エンティティを取得 (英語: id=2)
    const englishLanguage = await languageRepo.findOneBy({ id: 2 });
    if (!englishLanguage) {
      throw new Error('ID=2 の言語（英語）がLANGUAGESテーブルに見つかりません。');
    }
    console.log('英語の言語情報を取得しました。');

    // 3. 親となるマニュアルデータを順番通りにすべて取得
    const parentManuals = await manualRepo.find({
      order: { id: 'ASC' }, // CSVの順番と合わせるため、必ずソートする
    });
    console.log(`親となるマニュアルデータを ${parentManuals.length} 件取得しました。`);

    // 4. CSVファイルから英語データを読み込む
    const englishDataFromCsv: Omit<ManualTranslation, 'id' | 'manual' | 'language'>[] = [];
    // GOMI_en.csvをプロジェクトのルート（package.jsonがある場所）に置いてください
    const csvFilePath = path.join(__dirname, '..', 'GOMI_en.csv');

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // CSVのヘッダーに合わせてプロパティ名を調整
          englishDataFromCsv.push({
            garbage: row.GARBAGE,
            type: row.G_TYPE,
            contents: row.CONTENTS || null, // 空文字の場合はNULLに
            word: row.WORD || null,         // 空文字の場合はNULLに (NULL許容の場合)
          });
        })
        .on('end', () => {
          console.log(`CSVファイルから ${englishDataFromCsv.length} 件のデータを読み込みました。`);
          resolve();
        })
        .on('error', reject);
    });

    if (parentManuals.length !== englishDataFromCsv.length) {
      console.warn('警告: 親マニュアルの件数とCSVの行数が一致しません。処理を中断します。');
      console.warn(`親マニュアル: ${parentManuals.length}件, 英語CSV: ${englishDataFromCsv.length}件`);
      return;
    }

    // 5. データを結合して、新しい翻訳エンティティのリストを作成
    const newTranslations: ManualTranslation[] = [];
    for (let i = 0; i < englishDataFromCsv.length; i++) {
      const parentManual = parentManuals[i];
      const csvData = englishDataFromCsv[i];

      const newTranslation = new ManualTranslation();
      newTranslation.manual = parentManual;   // 親マニュアルを関連付ける
      newTranslation.language = englishLanguage; // 言語を英語に設定
      newTranslation.garbage = csvData.garbage;
      newTranslation.type = csvData.type;
      newTranslation.contents = csvData.contents;
      newTranslation.word = csvData.word;

      newTranslations.push(newTranslation);
    }

    // 6. データベースに一括で保存
    console.log('データベースへの保存処理を開始します...');
    await translationRepo.save(newTranslations, { chunk: 100 }); // 100件ずつに分割して保存
    console.log('英語翻訳データのインポートが正常に完了しました！');

  } catch (error) {
    console.error('インポート処理中にエラーが発生しました:', error);
  } finally {
    // 7. データベース接続を閉じる
    await AppDataSource.destroy();
    console.log('データベース接続を閉じました。');
  }
};

// // スクリプトを実行
// importEnglishTranslations();