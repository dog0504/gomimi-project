import { AppDataSource } from "../data-source";
import { History } from "../entity/History";

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
 * @param limit 取得する件数
 * @param offset 取得を開始する位置
 * @returns HistoryResponseオブジェクトの配列
 */
export const getHistoriesForUser = async (userId: number, limit: number, offset: number): Promise<HistoryResponse[]> => {
    const historyRepository = AppDataSource.getRepository(History);

    const histories = await historyRepository.find({
        where: {
            userId: userId
        },
        order: {
            Date: 'DESC' // 新しい履歴が先頭に来るように降順でソート
        },
        take: limit,   // 取得件数を指定
        skip: offset   // 開始位置を指定
    });

    // EntityのプロパティをAPIレスポンスの形式にマッピング
    return histories.map(history => ({
        id: history.id,
        name: history.name, // 'type'を'query'にマッピング
        category: history.type, // 'type'を'category'にマッピング
        createdAt: history.Date.toISOString(), // DateオブジェクトをISO 8601形式の文字列に変換
    }));
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
export const addHistoryForUser = async (userId: number, historyData: HistoryCreateRequest): Promise<HistoryResponse> => {
    const historyRepository = AppDataSource.getRepository(History);

    const newHistory = historyRepository.create({
        userId: userId, // ユーザーIDを直接設定
        name: historyData.name,
        type: historyData.type ?? undefined,
    });

    const savedHistory = await historyRepository.save(newHistory);

    return {
        id: savedHistory.id,
        name: savedHistory.name,
        category: savedHistory.type,
        createdAt: savedHistory.Date.toISOString(),
    };
};