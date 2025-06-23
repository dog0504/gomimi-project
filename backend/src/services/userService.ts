import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Address } from "../entity/Address";
import * as bcrypt from 'bcrypt';
import { DeepPartial } from "typeorm";

// APIからの入力データ型を定義
export interface UserCreationRequest {
    email: string;
    password: string;
    language: string;
    address: {
        id: number;
    };
}

/**
 * 新しいユーザーを作成し、データベースに保存します。
 * @param userData ユーザー作成に必要なデータ
 * @returns 作成されたユーザーエンティティ
 */
export const createUser = async (userData: UserCreationRequest): Promise<User> => {
    if (!userData) {
        const error = new Error('User data is missing');
        error.name = 'BadRequestError';
        throw error;
    }

    console.log('Creating user with data');
    const userRepository = AppDataSource.getRepository(User);
    const addressRepository = AppDataSource.getRepository(Address);

    // 1. メールアドレスで既存ユーザーを検索
    const existingUser = await userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
        // 既に存在する場合はエラーを投げる（HTTPステータス409 Conflictに対応）
        const error = new Error('User with this email already exists');
        error.name = 'ConflictError';
        throw error;
    }

    // 2. 住所IDで住所を検索
    const address = await addressRepository.findOneBy({ addressId: userData.address.id });
    if (!address) {
        // 住所が見つからない場合はエラー（HTTPステータス400 Bad Requestに対応）
        const error = new Error('Address with the provided ID not found');
        error.name = 'BadRequestError';
        throw error;
    }

    // 3. パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, 10); // 10はハッシュ化の強度

    console.log('creating new user');
    // 4. 新しいユーザーオブジェクトを作成
    const newUser = userRepository.create({
        email: userData.email,
        password: hashedPassword,
        language: userData.language,
        address: address, // 取得したAddressエンティティを関連付ける
    });

    // 5. データベースに保存
    await userRepository.save(newUser);
    console.log('User created successfully:', newUser);

    return newUser;
};