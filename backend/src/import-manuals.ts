// src/import-manuals.ts

import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import { AppDataSource } from './data-source'; // あなたのDataSourceファイルを指定
import { Manuals } from './entity/Manual';   // あなたのManualエンティティファイルを指定
import { Language } from './entity/Language'; // あなたのLanguageエンティティファイルを指定

// メインの実行関数
export const importManuals = async () => {
  const manualRepository = AppDataSource.getRepository(Manuals);
  const languageRepository = AppDataSource.getRepository(Language);

  try {
    // 2. 必要な「言語」エンティティを取得 (英語: id=2)
    const englishLanguage = await languageRepository.findOneBy({ id: 2 });
    if (!englishLanguage) {
      throw new Error('ID=2 の言語（英語）がLANGUAGESテーブルに見つかりません。');
    }
    console.log('英語の言語情報を取得しました。');

    // 3. 既存の日本語データを順番通りに取得 (これがitem_group_idのマスターになる)
    const japaneseManuals = await manualRepository.find({
      where: { language: { id: 1 } },
      order: { id: 'ASC' }, // 登録順を保証するためにITEM_NOでソート
    });
    console.log(`既存の日本語マニュアルを ${japaneseManuals.length} 件取得しました。`);

    // 4. CSVファイルから英語データを読み込む
    const englishManualsFromCsv: Omit<Manuals, 'id' | 'language' | 'itemGroupId'>[] = [];
    const csvFilePath = path.join(__dirname, '..', 'GOMI_en.csv'); // GOMI_en.csvをプロジェクトのルートに置いてください

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // CSVのヘッダーに合わせてプロパティ名を調整してください
          englishManualsFromCsv.push({
            word: row.WORD,
            garbage: row.GARBAGE,
            type: row.G_TYPE,
            contents: row.CONTENTS,
          });
        })
        .on('end', () => {
          console.log(`CSVファイルから ${englishManualsFromCsv.length} 件のデータを読み込みました。`);
          resolve();
        })
        .on('error', reject);
    });

    if (japaneseManuals.length !== englishManualsFromCsv.length) {
      console.warn('警告: 日本語データの件数とCSVの行数が一致しません。処理を中断します。');
      console.warn(`日本語: ${japaneseManuals.length}件, 英語CSV: ${englishManualsFromCsv.length}件`);
      return;
    }

    // 5. データを結合して、新しいエンティティを作成
    const newEnglishManuals: Manuals[] = [];
    for (let i = 0; i < englishManualsFromCsv.length; i++) {
      const jpManual = japaneseManuals[i];
      const enCsvData = englishManualsFromCsv[i];

      const newManual = new Manuals();
      newManual.itemGroupId = jpManual.itemGroupId; // 日本語データからitem_group_idを引き継ぐ
      newManual.language = englishLanguage;         // 言語を英語に設定
      newManual.garbage = enCsvData.garbage;
      newManual.type = enCsvData.type;
      newManual.contents = enCsvData.contents;
      newManual.word = enCsvData.word;

      newEnglishManuals.push(newManual);
    }

    // 6. データベースに一括で保存
    console.log('データベースへの保存処理を開始します...');
    await manualRepository.save(newEnglishManuals, { chunk: 100 }); // 100件ずつ分割して保存
    console.log('英語マニュアルのインポートが正常に完了しました！');

  } catch (error) {
    console.error('インポート処理中にエラーが発生しました:', error);
  } finally {
    // // 7. データベース接続を閉じる
    // await AppDataSource.destroy();
    // console.log('データベース接続を閉じました。');
  }
};

// スクリプトを実行
// importManuals();