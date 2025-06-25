import { AppDataSource } from "../data-source";
import { Language } from "../entity/Language";

/**
 * 利用可能な全ての言語を取得する
 * @returns Languageエンティティの配列
 */
export const getAllLanguages = async (): Promise<Language[]> => {
    const languageRepository = AppDataSource.getRepository(Language);

    // データベースからすべての言語を取得
    const languages = await languageRepository.find({
        order: {
            id: "ASC", // ID順でソートして、常に同じ順序で返す
        }
    });

    return languages;
};