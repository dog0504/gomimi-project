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
            id: "ASC",
        }
    });

    // 結果をAPIのレスポンス形式にマッピング
    return manuals.map(manual => ({
        id: manual.id,
        name: manual.garbage,
    }));
};

/**
 * 頭文字でごみマニュアルを検索する
 * @param initial 検索する頭文字 (1文字)
 * @returns ManualSummaryオブジェクトの配列
 */
export const searchManualsByInitial = async (initial: string): Promise<ManualSummary[]> => {
    const manualRepository = AppDataSource.getRepository(Manuals);

    // 'word' カラムが指定された頭文字と一致するマニュアルを検索
    const manuals = await manualRepository.find({
        select: {
            id: true,
            garbage: true,
        },
        where: {
            word: initial
        },
        order: {
            id: "ASC",
        }
    });

    // 結果をAPIのレスポンス形式にマッピング
    return manuals.map(manual => ({
        id: manual.id,
        name: manual.garbage,
    }));
};

// API仕様書で定義されている詳細なManualの型
interface ManualDetail {
    id: number;
    name: string;
    category: string;
    remarks: string | null;
}

/**
 * IDで特定のごみマニュアル詳細を取得する
 * @param manualId 検索するマニュアルのID (itemNo)
 * @returns ManualDetailオブジェクト、または見つからない場合はnull
 */
export const getManualById = async (manualId: number): Promise<ManualDetail | null> => {
    const manualRepository = AppDataSource.getRepository(Manuals);

    // itemNoを条件にマニュアルを一件検索
    const manual = await manualRepository.findOneBy({ id: manualId });

    if (manual) {
        // EntityのプロパティをAPIレスポンスの形式にマッピング
        return {
            id: manual.id,
            name: manual.garbage,
            category: manual.type,
            remarks: manual.contents
        };
    } else {
        // マニュアルが見つからない場合はnullを返す
        return null;
    }
};

/**
 * ゴミの名前でマニュアルを一件検索する (完全一致)
 * @param name 検索するゴミの名前
 * @returns Manualsエンティティ、または見つからない場合はnull
 */
export const findManualByName = async (name: string): Promise<Manuals | null> => {
    const manualRepository = AppDataSource.getRepository(Manuals);
    
    // 'garbage' カラムで完全一致検索
    const manual = await manualRepository.findOneBy({ garbage: name });
    
    return manual;
};