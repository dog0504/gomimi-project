import { BinDayDto } from '../dto/BinDayDto';
import { plainToInstance } from 'class-transformer';
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { CollectionSchedule } from "../entity/CollectionSchedule";
import { ErrorNames, createAppError } from '../errorHandling'; // エラー名を定義したファイルをインポート

export const getBinDaysForUser = async (userId: number, langId: number): Promise<BinDayDto[]> => {
    const userRepository = AppDataSource.getRepository(User);

    // ユーザー＋リレーション取得（address, language）
    const user = await userRepository.findOne({
        where: { id: userId },
        relations: { address: true, language: true },
    });

    if (!user || !user.address) throw createAppError('User not found or address not set', ErrorNames.NotFound);

    // スケジュール＋ゴミ種別＋翻訳＋言語を取得
    const scheduleRepository = AppDataSource.getRepository(CollectionSchedule);
    const schedules = await scheduleRepository.find({
        where: { address: { addressId: user.address.addressId } },
        relations: {
            garbageType: {
                translations: {
                    languageId: true, // ★ 修正点: ネストされたlanguageIdリレーションを読み込む
                },
            },
        },
        order: { collectionDay: "ASC" },
    });

    // DTOに変換
    const binDays = schedules.map(schedule => {
        // ゴミ種別名をユーザーの言語で取得
        const translation = schedule.garbageType.translations.find(
            // ★ 修正点: t.languageIdが存在することを安全にチェックする
            t => t.languageId && t.languageId.id === langId
        );
        return {
            id: schedule.id,
            type: translation ? translation.name : '', // 該当言語がなければ空文字
            dayOfWeek: schedule.collectionDay,
            time: schedule.collectionTime || null,
        };
    });

    // class-transformerでDTO化
    return plainToInstance(BinDayDto, binDays, { excludeExtraneousValues: true });
};