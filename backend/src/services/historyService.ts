import { AppDataSource } from "../data-source";
import { History } from "../entity/History";
import { User } from "../entity/User";
import { Manual } from "../entity/Manual";
import { ErrorNames, createAppError } from '../errorHandling'; // エラー名を定義したファイルをインポート


// API仕様書で定義されているHistoryの型
interface HistoryResponse {
    id: number;
    name: string;
    category: string | null; // オプションのフィールドq
    createdAt: string; // date-timeは文字列として扱う
}

/**
 * ユーザーIDに紐づく検索履歴をページネーション付きで取得する
 * @param userId ユーザーのID
 * @param languageId ユーザーの言語ID
 * @param limit 取得する件数
 * @param offset 取得を開始する位置
 * @returns HistoryResponseオブジェクトの配列
 */
export const getHistoriesForUser = async (userId: number, langId: number, limit: number, offset: number): Promise<HistoryResponse[]> => {
    const historyRepository = AppDataSource.getRepository(History);

    // 履歴を取得する際に、関連するマニュアル、その翻訳、言語も一緒に取得する
    const histories = await historyRepository.find({
        where: {
            userId: userId
        },
        relations: {
            manual: {
                translations: {
                    language: true, // manual -> translations -> language のネストされたリレーションを読み込む
                },
            },
        },
        order: {
            Date: 'DESC' // 新しい履歴が先頭に来るように降順でソート
        },
        take: limit,   // 取得件数を指定
        skip: offset   // 開始位置を指定
    });

    // 取得したエンティティをAPIレスポンスの形式にマッピング
    return histories.map(history => {
        // ユーザーの言語に合った翻訳を探す
        const translation = history.manual.translations.find(
            t => t.language.id === langId  // languageIdが一致する翻訳を探す
        );

        return {
            id: history.manual.id, // マニュアルのIDを使用
            name: translation ? translation.garbage : history.manual.garbageJa, // 該当言語の翻訳がなければマニュアル名を使用
            category: translation ? translation.type : null, // 該当言語の翻訳がなければnull
            createdAt: history.Date.toISOString(), // DateオブジェクトをISO 8601形式の文字列に変換
        };
    });
};

// 履歴作成リクエストの型
interface HistoryCreateRequest {
    name: string;
    type?: string | null;
}

/**
 * 新しい識別履歴をユーザーに追加する
 * @param userId ユーザーのID
 * @param historyData 履歴データ (name, type)
 * @returns 作成されたHistoryResponseオブジェクト
 */
export const addHistoryForUser = async (userId: number, manualId: number, languageId: number): Promise<HistoryResponse> => {
    const historyRepository = AppDataSource.getRepository(History);
    const manualRepository = AppDataSource.getRepository(Manual);

    // 1. 履歴に追加しようとしているマニュアルが存在するか確認
    const manualExists = await manualRepository.findOneBy({ id: manualId });
    if (!manualExists) {
        throw createAppError('Manual not found.', ErrorNames.NotFound);
    }

    // 2. 新しい履歴レコードを作成
    // TypeORMでは、リレーションにはIDを持つオブジェクトを渡すことで関連付けができる
    const newHistory = historyRepository.create({
        userId: userId,
        manual: { id: manualId } as Manual,
    });

    // 3. データベースに保存
    const savedHistory = await historyRepository.save(newHistory);

    // 4. クライアントに返すために、保存した履歴を関連情報付きで再取得
    const fullNewHistory = await historyRepository.findOneOrFail({
        where: {
            id: savedHistory.id
        },
        relations: {
            manual: {
                translations: {
                    language: true,
                },
            },
        },
    });

    // 5. GETと同じ形式にマッピングして返す
    const translation = fullNewHistory.manual.translations.find(
        t => t.language.id === languageId
    );

    return {
        id: fullNewHistory.manual.id,
        name: translation ? translation.garbage : fullNewHistory.manual.garbageJa, // 該当言語の翻訳がなければマニュアル名を使用
        category: translation ? translation.type : null,
        createdAt: fullNewHistory.Date.toISOString(),
    };
};