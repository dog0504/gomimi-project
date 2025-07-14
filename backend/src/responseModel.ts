// 住所情報の型
export interface AddressResponse {
    id: number;
    "postal-code": string;
    city: string;
    ward: string;
    town: string | null; // townはnullを許容
    chom: string | null; // chomはnullを許容
    street: string | null; // streetはnullを許容
    inf: string | null; // infはnullを許容
}

// 言語情報の型
export interface LanguageResponse {
    id: number;
    name: string;
    code: string;
}

// ユーザープロフィールレスポンスの型
export interface UserProfileResponse {
    // password: string | null; // パスワードはnullを許容
    id: number; // ユーザーID
    email: string;
    address: AddressResponse;
    language: LanguageResponse;
}