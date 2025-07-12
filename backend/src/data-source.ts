import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { History } from './entity/History';
import { Tification } from './entity/Tification';
import { Address } from './entity/Address';
import { Manual } from './entity/Manual';
import { GarbageType } from './entity/GarbageType';
import { CollectionSchedule } from './entity/CollectionSchedule';
import { Language } from './entity/Language';
import { Area } from "./entity/Area";
import { ZipCode } from "./entity/ZipCode";
import { ZipCodeTranslation } from "./entity/ZipCodeTranslation";
import { ManualTranslation } from './entity/ManualTranslation'; // 新しいエンティティのインポート

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'db_service', // docker-composeのサービス名
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'gomimi',
  entities: [User, History, Tification, Address, Manual, GarbageType, CollectionSchedule, Language, Area, ZipCode, ZipCodeTranslation, ManualTranslation],
  migrations: ["src/migration/*.ts"],
  synchronize: false, // ←これでテーブル自動作成
  logging: true,
});