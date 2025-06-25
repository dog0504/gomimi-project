import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Address } from "../entity/Address";
import * as bcrypt from 'bcrypt';
import { Language } from "../entity/Language";
import { Not } from "typeorm"; // TypeORMのNot演算子をインポート

// APIからの入力データ型を定義
export interface UserCreationRequest {
    email: string;
    password: string;
    languageId: number; // 言語ID
    addressId: number; // 住所ID
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
    const languageRepository = AppDataSource.getRepository(Language);

    // 1. メールアドレスで既存ユーザーを検索
    const existingUser = await userRepository.findOneBy({ email: userData.email });
    if (existingUser) {
        // 既に存在する場合はエラーを投げる（HTTPステータス409 Conflictに対応）
        const error = new Error('User with this email already exists');
        error.name = 'ConflictError';
        throw error;
    }

    // 2. 住所IDで住所を検索
    const address = await addressRepository.findOneBy({ addressId: userData.addressId });
    if (!address) {
        // 住所が見つからない場合はエラー（HTTPステータス400 Bad Requestに対応）
        const error = new Error('Address with the provided ID not found');
        error.name = 'BadRequestError';
        throw error;
    }

    // 受け取った言語IDでLanguageエンティティを検索
    const language = await languageRepository.findOneBy({ id: userData.languageId });
    if (!language) {
        // 指定されたIDの言語が存在しない場合はエラー
        const error = new Error(`Language with ID "${userData.languageId}" is not supported`);
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
        language: language,
        address: address, // 取得したAddressエンティティを関連付ける
    });

    // 5. データベースに保存
    await userRepository.save(newUser);
    console.log('User created successfully:', newUser);

    return newUser;
};

// ログイン用のリクエストデータ型
export interface UserLoginRequest {
    email: string;
    password: string;
}

/**
 * ユーザーの認証を行う
 * @param credentials 認証情報 (email, password)
 * @returns 認証に成功したユーザーのエンティティ
 */
export const authenticateUser = async (credentials: UserLoginRequest): Promise<User> => {
    const userRepository = AppDataSource.getRepository(User);

    // 1. メールアドレスでユーザーを検索
    const user = await userRepository.findOneBy({ email: credentials.email });

    // 2. ユーザーが存在しない場合、認証失敗
    if (!user) {
        const error = new Error('Unauthorized');
        error.name = 'AuthError';
        throw error;
    }

    // 3. パスワードを比較
    //    bcrypt.compareは、入力されたパスワードとハッシュ化されたパスワードを安全に比較する
    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

    // 4. パスワードが一致しない場合、認証失敗
    if (!isPasswordCorrect) {
        const error = new Error('Unauthorized');
        error.name = 'AuthError';
        throw error;
    }

    // 5. 認証成功
    return user;
};

/**
 * IDでユーザーを検索し、プロフィール情報（住所も含む）を返す
 * @param userId 検索するユーザーのID
 * @returns ユーザーエンティティ、見つからない場合はnull
 */
export const getUserProfileById = async (userId: number): Promise<User | null> => {
    const userRepository = AppDataSource.getRepository(User);

    // ユーザーをIDで検索。関連エンティティである 'address' も一緒に取得する
    const user = await userRepository.findOne({
        where: { id: userId },
        relations: {
            address: true, // Userエンティティのaddressプロパティを読み込む
            language: true, // UserエンティティのlanguageIdプロパティを読み込む
        },
    });

    return user;
};

// ユーザー情報更新APIのリクエストボディの型
export interface UserUpdateRequest {
    email?: string;
    languageId?: number; // 言語ID
    addressId?: number; // 住所ID
}

/**
 * ユーザーのプロフィール情報を更新する
 * @param userId 更新対象のユーザーID
 * @param updateData 更新するデータ
 * @returns 更新後のユーザー情報
 */
export const updateUserProfile = async (userId: number, updateData: UserUpdateRequest): Promise<User | null> => {
    const userRepository = AppDataSource.getRepository(User);
    const addressRepository = AppDataSource.getRepository(Address);
    const languageRepository = AppDataSource.getRepository(Language);

    // 1. 更新対象のユーザーを取得
    const userToUpdate = await userRepository.findOneBy({ id: userId });
    if (!userToUpdate) {
        const error = new Error('User not found');
        error.name = 'NotFoundError';
        throw error;
    }

    // 2. メールアドレスが更新される場合、他のユーザーが使用していないかチェック
    if (updateData.email && updateData.email !== userToUpdate.email) {
        const existingUser = await userRepository.findOne({
        where: {
            email: updateData.email,
            id: Not(userId) // 自分以外のユーザーで検索
        }
        });
        if (existingUser) {
            const error = new Error('Email is already in use by another account');
            error.name = 'ConflictError'; // 409 Conflict
            throw error;
        }
        userToUpdate.email = updateData.email;
    }

    // 3. 住所が更新される場合、新しい住所の存在を確認
    if (updateData.addressId && updateData.addressId !== userToUpdate.address?.addressId) {
        const newAddress = await addressRepository.findOneBy({ addressId: updateData.addressId });
        if (!newAddress) {
            const error = new Error('Address with the provided ID not found');
            error.name = 'BadRequestError'; // 400 Bad Request
            throw error;
        }
        userToUpdate.address = newAddress;
    }

    // 4. 言語が更新される場合、新しい言語の存在を確認
    if (updateData.languageId) {
        // 受け取った言語IDでLanguageエンティティを検索
        const newLanguage = await languageRepository.findOneBy({ id: updateData.languageId });
        if (!newLanguage) {
            // 指定されたIDの言語が存在しない場合はエラー
            const error = new Error(`Language with ID "${updateData.languageId}" is not supported`);
            error.name = 'BadRequestError';
            throw error;
        }
        userToUpdate.language = newLanguage; // ★検索したlanguageエンティティを関連付ける
    }

    // 5. パスワードは更新しない場合、ハッシュ化の処理は不要
    await userRepository.save(userToUpdate);

    // 6. 更新後の完全なプロフィールを再取得して返す
    return getUserProfileById(userId);
};

/**
 * ユーザーIDを指定してユーザーを削除する
 * @param userId 削除対象のユーザーID
 * @returns 削除が成功したかどうか (ユーザーが存在し、削除できた場合にtrue)
 */
export const deleteUser = async (userId: number): Promise<boolean> => {
    const userRepository = AppDataSource.getRepository(User);

    // 削除対象のユーザーを検索
    const userToDelete = await userRepository.findOneBy({ id: userId });

    if (userToDelete) {
        // ユーザーが見つかった場合、削除を実行
        await userRepository.remove(userToDelete);
        return true; // 成功
    } else {
        // ユーザーが見つからなかった場合
        return false; // 失敗
    }
};