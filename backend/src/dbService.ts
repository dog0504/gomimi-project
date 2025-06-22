/**
 * データベースを操作するためのサービス
 * このサービスは、データベースの接続を管理し、エンティティに対する操作を提供します。
 * 各エンティティに対するリポジトリを提供し、データの取得や保存を行います。
 */
import camelcaseKeys from "camelcase-keys";

import { AppDataSource } from './data-source'
import { User } from './entity/User';
import { History } from './entity/History';
import { Tification } from './entity/Tification';
import { Address } from './entity/Address';
import { Manuals } from './entity/Manual';
import { BinDay } from './entity/BinDay';  

export class DbService {
    private userRepository = AppDataSource.getRepository(User);
    private historyRepository = AppDataSource.getRepository(History);
    private tificationRepository = AppDataSource.getRepository(Tification);
    private addressRepository = AppDataSource.getRepository(Address);
    private manualsRepository = AppDataSource.getRepository(Manuals);
    private binDayRepository = AppDataSource.getRepository(BinDay);
    
    constructor() {
        // 初期化処理などが必要な場合はここに記述
    }

    // ユーザーを作成
    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(camelcaseKeys(userData));
        return await this.userRepository.save(user);
    }
    
    // ユーザーリポジトリを取得
    getUserRepository() {
        return this.userRepository;
    }
    
    // 履歴リポジトリを取得
    getHistoryRepository() {
        return this.historyRepository;
    }
    
    // 通知リポジトリを取得
    getTificationRepository() {
        return this.tificationRepository;
    }
    
    // アドレスリポジトリを取得
    getAddressRepository() {
        return this.addressRepository;
    }
    
    // マニュアルリポジトリを取得
    getManualsRepository() {
        return this.manualsRepository;
    }
    
    // ごみ収集日リポジトリを取得
    getBinDayRepository() {
        return this.binDayRepository;
    }
}