import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { History } from './entity/History';
import { Tification } from './entity/Tification';
import { Address } from './entity/Address';
import { Manuals } from './entity/Manual';
import { BinDay } from './entity/BinDay';
import { GarbageType } from './entity/GarbageType';
import { CollectionSchedule } from './entity/CollectionSchedule';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'db_service', // docker-composeのサービス名
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'gomimi',
  entities: [User, History, Tification, Address, Manuals, GarbageType, CollectionSchedule],
  synchronize: false, // ←これでテーブル自動作成
  logging: true,
});