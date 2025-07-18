import { Expose, Transform, Type } from 'class-transformer';
import { LanguageDto } from './LanguageDto';
import { AddressResponseDto } from './AddressResponseDto';
import { User } from '../entity/User'; // 実際のパスに置き換えてください
import { Address } from '../entity/Address'; // 実際のパスに置き換えてください

export class UserResponseDto {
    @Expose()
    id!: number;

    @Expose()
    email!: string;

    @Expose()
    @Type(() => LanguageDto) // LanguageエンティティをLanguageDtoに変換
    language!: LanguageDto;

    @Expose()
    @Type(() => AddressResponseDto)
    @Transform(({ value, obj }: { value: Address; obj: User }) => {
        // value: 変換対象のプロパティ (user.address)
        // obj:   変換元の親オブジェクト (user)
        // console.log('--- DTO Transformの中身 ---');
        // console.log('変換元のAddressオブジェクト (value):', JSON.stringify(value, null, 2));
        // console.log('親オブジェクトのUser (obj.id):', obj.id);
        // console.log('親オブジェクトのUserの言語 (obj.language.code):', obj.language.code);
        // console.log('AddressのzipCode:', JSON.stringify(value.zipCode, null, 2));
        // console.log('zipCodeのtranslations:', JSON.stringify(value.zipCode?.translations, null, 2));
        
        if (!value || !value.zipCode) {
            return null;
        }

        // 1. ユーザーの言語設定を取得
        // const userLanguageCode = obj.language.code;
        const userLanguageCode = 'ja'; // TODO: 実際のユーザーの言語コードを取得するロジックに置き換える

        // 2. 郵便番号に紐づく翻訳リストから、ユーザーの言語に一致するものを探す
        const translation = value.zipCode.translations?.find(
            (t) => t.language.code === userLanguageCode,
        );

        if (!translation) {
            return null; // 翻訳が見つからない場合は null を返す
        }
        
        // 3. 必要な情報を組み合わせてレスポンスの形に整形
        return {
            addressId: value.addressId,
            zip: value.zipCode.zip_code,
            city: translation?.city, // 翻訳が見つかればそのcityを、なければundefined
            ward: translation?.ward,
            town: translation?.town,
            chom: value.chom,
            street: value.street,
            inf: value.inf,
        };
    })
    address!: AddressResponseDto;
}