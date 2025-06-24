import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { CollectionSchedule } from "../entity/CollectionSchedule";

// API仕様書で定義されているBinDayの型
interface BinDay {
    id: number;
    type: string;
    dayOfWeek: string;
    time: string | null;
}

/**
 * ユーザーIDに紐づくゴミ収集日リストを取得する
 * @param userId ユーザーのID
 * @returns BinDayオブジェクトの配列
 */
export const getBinDaysForUser = async (userId: number): Promise<BinDay[]> => {
    const userRepository = AppDataSource.getRepository(User);

    // 1. ユーザー情報を取得し、関連する住所も読み込む
    const user = await userRepository.findOne({
        where: { id: userId },
        relations: {
            address: true, // Userエンティティのaddressプロパティを読み込む
        },
    });

    // ユーザーまたは住所が登録されていない場合は空の配列を返す
    if (!user || !user.address) {
        return [];
    }

    // 2. ユーザーの住所IDに紐づく収集スケジュールを取得する
    const scheduleRepository = AppDataSource.getRepository(CollectionSchedule);
    const schedules = await scheduleRepository.find({
        where: {
            address: {
                addressId: user.address.addressId,
            },
        },
        // ゴミ種別名を取得するために、GarbageTypeエンティティも関連付けて読み込む
        relations: {
            garbageType: true,
        },
        order: {
            collectionDay: "ASC", // 曜日順で並び替え
        },
    });

    // 3. 取得したデータをAPIのレスポンス形式(BinDay)に整形する
    const binDays: BinDay[] = schedules.map(schedule => ({
        id: schedule.id,
        type: schedule.garbageType.type, // 関連付けたGarbageTypeから種別名を取得
        dayOfWeek: schedule.collectionDay, // 曜日
        time: schedule.collectionTime || null, // 収集時間（nullの場合もあるため）
    }));

    return binDays;
};