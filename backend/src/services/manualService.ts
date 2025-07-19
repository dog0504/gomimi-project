import { AppDataSource } from "../data-source";
import { Manual } from "../entity/Manual";
import { ManualTranslation } from "../entity/ManualTranslation";
import { Like } from "typeorm";

// API仕様書で定義されているレスポンスの型
interface ManualSummary {
    id: number;
    name: string;
}

interface ManualDetail {
    id: number;
    name: string;
    category: string;
    remarks: string | null;
}

/**
 * すべてのごみマニュアルの要約（IDと名前）を取得する
 * @param languageId ユーザーの言語ID
 * @returns ManualSummaryオブジェクトの配列
 */
export const getAllManualSummaries = async (languageId: number): Promise<ManualSummary[]> => {
    const manualRepository = AppDataSource.getRepository(Manual);

    // Manualと関連するすべての翻訳(translations)を取得
    const manuals = await manualRepository.find({
        relations: {
            translations: {
                language: true, // 翻訳に紐づく言語情報も取得
            },
        },
        order: {
            id: "ASC",
        },
    });

    // 取得したデータをレスポンス形式にマッピング
    return manuals.map(manual => {
        // ユーザーの言語に合った翻訳を探す
        const translation = manual.translations.find(
            t => t.language.id === languageId
        );
        return {
            id: manual.id,
            // 翻訳が見つかればそのゴミ名を、なければ日本語名を返す
            name: translation ? translation.garbage : manual.garbageJa,
        };
    });
};

/**
 * キーワードでごみマニュアルを検索する
 * @param keyword 検索キーワード
 * @param languageId ユーザーの言語ID
 * @returns ManualSummaryオブジェクトの配列
 */
export const searchManualsByKeyword = async (keyword: string, languageId: number): Promise<ManualSummary[]> => {
    // ★ 1. ManualTranslationのリポジトリを取得
    const translationRepository = AppDataSource.getRepository(ManualTranslation);

    // ★ 2. 翻訳テーブルで直接、言語IDとキーワードで検索
    const translations = await translationRepository.find({
        where: {
            language: { id: languageId },      // 条件1: ユーザーの言語IDに一致
            garbage: Like(`%${keyword}%`),   // 条件2: ゴミ名(garbage)にキーワードが部分一致
        },
        relations: {
            manual: true, // 紐づく親のManualエンティティも取得 (IDが必要なため)
        },
        order: {
            manual: {
                id: "ASC" // 親マニュアルのIDでソート
            }
        }
    });

    // ★ 3. 取得した翻訳結果をレスポンス形式に整形
    return translations.map(translation => ({
        id: translation.manual.id,
        name: translation.garbage,
    }));
};

/**
 * 頭文字でごみマニュアルを検索する
 * @param initial 検索する頭文字 (1文字)
 * @param languageId ユーザーの言語ID
 * @returns ManualSummaryオブジェクトの配列
 */
export const searchManualsByInitial = async (initial: string, languageId: number): Promise<ManualSummary[]> => {
    const manualTranslationRepository = AppDataSource.getRepository(ManualTranslation);

    // 'word' カラムが指定された頭文字と一致するマニュアルを検索
    const manuals = await manualTranslationRepository.find({
        where: {
            language: { id: languageId }, 
            word: initial, // 頭文字で検索
        },
        relations: {
            manual: true, // 紐づく親のManualエンティティも取得 (IDが必要なため)
        },
        order: {
            manual: {
                id: "ASC" // 親マニュアルのIDでソート
            }
        }
    });

    // 結果をAPIのレスポンス形式にマッピング
    return manuals.map(translation => ({
        id: translation.manual.id,
        name: translation.garbage,
    }));
};

/**
 * IDで特定のごみマニュアル詳細を取得する
 * @param manualId 検索するマニュアルのID (itemNo)
 * @returns ManualDetailオブジェクト、または見つからない場合はnull
 */
export const getManualById = async (manualId: number, languageId: number): Promise<ManualDetail | null> => {
    const manualRepository = AppDataSource.getRepository(Manual);

    // IDでマニュアルを一件検索し、関連する翻訳と言語もすべて取得
    const manual = await manualRepository.findOne({
        where: { id: manualId },
        relations: {
            translations: {
                language: true,
            },
        },
    });

    if (manual) {
        // ユーザーの言語に合った翻訳を探す
        const translation = manual.translations.find(
            t => t.language.id === languageId
        );
        // レスポンス形式にマッピング
        return {
            id: manual.id,
            // 翻訳が見つかればその情報を、なければ日本語名を基準にする
            name: translation ? translation.garbage : manual.garbageJa,
            category: translation ? translation.type : "", // カテゴリも翻訳から
            remarks: translation ? translation.contents : null, // 注意文も翻訳から
        };
    } else {
        return null; // マニュアルが見つからない場合はnull
    }
};

/**
 * ゴミの日本語名でマニュアルを検索し、指定された言語で詳細を返す
 * @param name 検索するゴミの日本語名 (AIの識別結果など)
 * @param languageId 返却する情報の言語ID
 * @returns ManualDetailオブジェクト、または見つからない場合はnull
 */
export const findManualByName = async (name: string, languageId: number): Promise<ManualDetail | null> => {
    const manualRepository = AppDataSource.getRepository(Manual);
    
    // 1. AI検索用の日本語名(garbageJa)でManualエンティティを検索する
    //    リレーションで全ての翻訳も一緒に取得しておく
    const manual = await manualRepository.findOne({
        where: { garbageJa: name },
        relations: {
            translations: {
                language: true, // 翻訳に紐づく言語情報も取得
            },
        },
    });
    
    // 2. マニュアルが見つかった場合
    if (manual) {
        // 3. ユーザーの言語に合った翻訳を探す
        const translation = manual.translations.find(
            t => t.language.id === languageId
        );

        // 4. レスポンス形式にマッピングして返す
        //    翻訳が見つかればその情報を、なければ日本語名を基準にする
        return {
            id: manual.id,
            name: translation ? translation.garbage : manual.garbageJa,
            category: translation ? translation.type : "", // カテゴリも翻訳から (フォールバックは空文字など)
            remarks: translation ? translation.contents : null, // 注意文も翻訳から
        };
    }
    
    // 5. マニュアルが見つからなかった場合はnullを返す
    return null;
};