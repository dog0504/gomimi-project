import { AppDataSource } from "../data-source";
import { Manuals } from "../entity/Manual";
import { Like } from "typeorm";

// API仕様書で定義されているレスポンスの型
interface ManualSummary {
  id: number;
  name: string;
}

/**
 * すべてのごみマニュアルの要約（IDと名前）を取得する
 * @returns ManualSummaryオブジェクトの配列
 */
export const getAllManualSummaries = async (): Promise<ManualSummary[]> => {
    const manualRepository = AppDataSource.getRepository(Manuals);

    // データベースからIDと名前だけを選択して取得
    const manuals = await manualRepository.find({
        select: {
            id: true,
            garbage: true,
        },
        order: {
            id: "ASC", // IDで昇順にソート
        },
        cache: true, // キャッシュを有効にする
    });
    
    // Entityのプロパティ名(manualId)をAPI仕様の'id'にマッピングする
    return manuals.map(manual => ({
        id: manual.id,
        name: manual.garbage,
    }));
};

/**
 * キーワードでごみマニュアルを検索する
 * @param keyword 検索キーワード
 * @returns ManualSummaryオブジェクトの配列
 */
export const searchManualsByKeyword = async (keyword: string): Promise<ManualSummary[]> => {
    const manualRepository = AppDataSource.getRepository(Manuals);

    // 'name' カラムにキーワードが部分一致するマニュアルを検索
    const manuals = await manualRepository.find({
        select: {
            id: true,
            garbage: true,
        },
        where: {
        // 例: keywordが "スプレー" の場合、"スプレー缶" などがヒットする
            garbage: Like(`%${keyword}%`)
        },
        order: {
            garbage: "ASC",
        }
    });

    // 結果をAPIのレスポンス形式にマッピング
    return manuals.map(manual => ({
        id: manual.id,
        name: manual.garbage,
    }));
};