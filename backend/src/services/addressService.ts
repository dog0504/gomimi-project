import { AppDataSource } from "../data-source";
import { Address } from "../entity/Address";
import { Language } from "../entity/Language";

// API仕様書で定義されているAddressResponseBodyの型
interface AddressResponse {
    id: number;
    "postal-code": string;
    city: string;
    ward: string;
    town: string;
    chom: string | null;
    street: string | null;
    inf: string | null;
}

/**
 * 郵便番号に一致する住所のリストを、指定された言語で検索する
 * @param postalCode 検索する郵便番号
 * @param langCode 言語コード (例: 'ja', 'en')
 * @returns AddressResponseオブジェクトの配列
 */
export const findAddressesByPostalCode = async (postalCode: string, langCode: string): Promise<AddressResponse[]> => {
    // ★ 1. 言語コード(string)を言語ID(number)に変換する
    const languageRepository = AppDataSource.getRepository(Language);
    const language = await languageRepository.findOneBy({ code: langCode });
    // もし無効な言語コードが指定された場合、デフォルトで日本語(ID=1)を使用
    const languageId = language ? language.id : 1;

    // ★ 2. 以降のロジックは前回と同じ (取得した languageId を使用)
    const addressRepository = AppDataSource.getRepository(Address);
    const addresses = await addressRepository.find({
        where: {
            zipCode: { zip_code: postalCode }
        },
        relations: {
            zipCode: { translations: { language: true, }, },
        },
    });

    return addresses.map(address => {
        const translation = address.zipCode.translations.find(
            t => t.language.id === languageId
        );
        return {
            id: address.addressId,
            "postal-code": address.zipCode.zip_code,
            city: translation ? translation.city : "",
            ward: translation ? translation.ward : "",
            town: translation ? translation.town : "",
            chom: address.chom,
            street: address.street,
            inf: address.inf,
        };
    });
};
