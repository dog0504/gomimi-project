import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { AppDataSource } from './data-source';
import { Address } from './entity/Address';
import { GarbageType } from './entity/GarbageType';
import { CollectionSchedule } from './entity/CollectionSchedule';
import { Manuals } from './entity/Manual';

const CSV_DIR = path.join(__dirname, '../csv');

/**
 * 'Address' テーブルにCSVデータを挿入する
 */
async function seedAddresses(): Promise<void> {
  const addressRepository = AppDataSource.getRepository(Address);
  const count = await addressRepository.count();
  if (count > 0) {
    console.log('Address テーブルには既にデータが存在するため、スキップします。');
    return;
  }

  console.log('Address テーブルにデータを挿入します...');
  const csvFilePath = path.join(CSV_DIR, 'addresses_with_zipcode_v2.csv');

  const failedEntries: any[] = [];
  return new Promise((resolve, reject) => {
    let success = 0;
    let fail = 0;
    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: ['address_id', 'zip', 'city', 'ward', 'town', 'chome', 'street', 'inf'] }))
      .on('data', async (data) => {
        try {
          const addressId = parseInt(data.address_id, 10);
          if (isNaN(addressId)) {
            console.warn(`Invalid address_id: ${data.address_id}, skipping entry.`);
            return;
          }
          const address = new Address();
          address.addressId = addressId;
          address.zip = data.zip;
          address.city = data.city;
          address.ward = data.ward;
          address.town = data.town;
          address.chom = data.chome || null;
          address.street = data.street || null;
          address.inf = data.inf || null;
          await addressRepository.save(address);
          success++;
        } catch (error) {
          console.error(`Error inserting address: ${String(error)}`);
          fail++;
          failedEntries.push(data);
        }
      })
      .on('end', () => {
        console.log(`Address: 成功 ${success}件, 失敗 ${fail}件`);
        if (failedEntries.length > 0) {
          console.log('失敗したデータ:', failedEntries);
        }
        resolve(undefined);
      })
      .on('error', reject);
  });
}

/**
 * 'GarbageType' テーブルにCSVデータを挿入する
 */
async function seedGarbageTypes(): Promise<void> {
  const garbageTypeRepository = AppDataSource.getRepository(GarbageType);
  const count = await garbageTypeRepository.count();
  if (count > 0) {
    console.log('GarbageType テーブルには既にデータが存在するため、スキップします。');
    return;
  }

  console.log('GarbageType テーブルにデータを挿入します...');
  const csvFilePath = path.join(CSV_DIR, 'garbage_types.csv');

  const failedEntries: any[] = [];
  return new Promise((resolve, reject) => {
    let success = 0;
    let fail = 0;
    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: ['garbage_type_name','garbage_type_id'] }))
      .on('data', async (data) => {
        try {
          const garbageTypeId = parseInt(data.garbage_type_id, 10);
          if (isNaN(garbageTypeId)) {
            console.warn(`Invalid garbage_type_id: ${data.garbage_type_id}, skipping entry.`);
            return;
          }

          const garbageType = new GarbageType();
          garbageType.id = garbageTypeId;
          garbageType.type = data.garbage_type_name;
          await garbageTypeRepository.save(garbageType);
          success++;
        } catch (error) {
          console.error(`Error inserting garbage type: ${String(error)}`);
          fail++;
          failedEntries.push(data);
        }
      })
      .on('end', () => {
        console.log(`GarbageType: 成功 ${success}件, 失敗 ${fail}件`);
        if (failedEntries.length > 0) {
          console.log('失敗したデータ:', failedEntries);
        }
        resolve(undefined);
      })
      .on('error', reject);
  });
}

/**
 * 'CollectionSchedule' テーブルにCSVデータを挿入する
 */
async function seedCollectionSchedules(): Promise<void> {
  const scheduleRepository = AppDataSource.getRepository(CollectionSchedule);
  const addressRepository = AppDataSource.getRepository(Address);
  const garbageTypeRepository = AppDataSource.getRepository(GarbageType);
  const count = await scheduleRepository.count();
  if (count > 0) {
    console.log('CollectionSchedule テーブルには既にデータが存在するため、スキップします。');
    return;
  }

  console.log('CollectionSchedule テーブルにデータを挿入します...');
  const csvFilePath = path.join(CSV_DIR, 'collection_schedules.csv');

  const failedEntries: any[] = [];
  // すべてのデータを一度配列にためてから逐次的に保存する
  return new Promise((resolve, reject) => {
    const rows: any[] = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: ['address_id', 'garbage_type_id', 'collection_day', 'collection_time'] }))
      .on('data', (data) => {
        rows.push(data);
      })
      .on('end', async () => {
        let success = 0;
        let fail = 0;
        for (const data of rows) {
          try {
            const address = await addressRepository.findOneBy({ addressId: parseInt(data.address_id, 10) });
            const garbageType = await garbageTypeRepository.findOneBy({ id: parseInt(data.garbage_type_id, 10) });
            if (!address || !garbageType) {
              console.warn(`Invalid address or garbageType: address_id=${data.address_id}, garbage_type_id=${data.garbage_type_id}, skipping entry.`);
              fail++;
              continue;
            }
            const schedule = new CollectionSchedule();
            schedule.addressId = address; // リレーションを設定
            schedule.garbageTypeId = garbageType; // リレーションを設定
            schedule.collectionDay = data.collection_day;
            schedule.collectionTime = data.collection_time;
            await scheduleRepository.save(schedule);
            success++;
          } catch (error) {
            console.error(`Error inserting collection schedule: ${String(error)}`);
            fail++;
            failedEntries.push(data);
          }
        }
        console.log(`CollectionSchedule: 成功 ${success}件, 失敗 ${fail}件`);
        if (failedEntries.length > 0) {
          console.log('失敗したデータ:', failedEntries);
        }
        resolve(undefined);
      })
      .on('error', reject);
  });
}

/**
 * 'Manuals' テーブルにCSVデータを挿入する
 */
async function seedManuals(): Promise<void> {
  const manualRepository = AppDataSource.getRepository(Manuals);
  const count = await manualRepository.count();
  if (count > 0) {
    console.log('Manuals テーブルには既にデータが存在するため、スキップします。');
    return;
  }

  console.log('Manuals テーブルにデータを挿入します...');
  const csvFilePath = path.join(CSV_DIR, 'garbage_list.csv');

  // const failedEntries: any[] = [];
  return new Promise((resolve, reject) => {
    let success = 0;
    let fail = 0;
    fs.createReadStream(csvFilePath)
      .pipe(csv({ headers: ['word', 'garbage', 'g_type', 'contents'] }))
      .on('data', async (data) => {
        try {
          const manual = new Manuals();
          manual.garbage = data.garbage;
          manual.type = data.g_type;
          manual.contents = data.contents || null;
          manual.word = data.word;
          await manualRepository.save(manual);
          success++;
        } catch (error) {
          console.error(`Error inserting manual: ${String(error)}`);
          fail++;
          // failedEntries.push(data);
        }
      })
      .on('end', () => {
        console.log(`Manuals: 成功 ${success}件, 失敗 ${fail}件`);
        // if (failedEntries.length > 0) {
        //   console.log('失敗したデータ:', failedEntries);
        // }
        resolve(undefined);
      })
      .on('error', reject);
  });
}

/**
 * データベースにCSVデータを挿入する
 */
export async function seedDatabase(): Promise<void> {
  // await seedAddresses();
  // await seedGarbageTypes();
  // await seedCollectionSchedules();
  await seedManuals(); // Manuals のデータ挿入を追加
}

/**
 * データソースの初期化を行う関数
 * @param retries 再試行回数
 * @param delay 再試行間隔（ミリ秒）
 */
export async function initDataSource(retries = 5, delay = 5000): Promise<void> {
    console.log('Initializing Data Source...');
    // データソースの初期化を試みる
    while (retries > 0) {
        try {
            // データソースの初期化
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
            return;
        } catch (error) {
            // エラーが発生した場合、再試行する
            console.error(`Failed to connect to the database. Retrying in ${delay / 1000} seconds...`);
            console.error('Error during Data Source initialization:', error);

            retries -= 1;
            if (retries === 0) {
                console.error('Could not connect to the database. Exiting...');
                process.exit(1);
            }
            // 再試行まで待機
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
}