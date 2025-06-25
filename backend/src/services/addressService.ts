import { AppDataSource } from "../data-source";
import { Address } from "../entity/Address";

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
 * 郵便番号に一致する住所のリストを検索する
 * @param postalCode 検索する郵便番号
 * @returns AddressResponseオブジェクトの配列
 */
export const findAddressesByPostalCode = async (postalCode: string): Promise<AddressResponse[]> => {
    const addressRepository = AppDataSource.getRepository(Address);

    // 'zip' カラムを条件に住所を検索
    const addresses = await addressRepository.find({
        where: {
            zip: postalCode
        }
    });

    // EntityのプロパティをAPIレスポンスの形式にマッピング
    return addresses.map(address => ({
        id: address.addressId,
        "postal-code": address.zip,
        city: address.city,
        ward: address.ward,
        town: address.town,
        chom: address.chom,
        street: address.street,
        inf: address.inf
    }));
};