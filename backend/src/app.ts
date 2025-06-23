console.log("Hello TypeScript + TypeORM!");
import http, { get } from 'http';
import "reflect-metadata";
import express from "express";
import { DataSource } from "typeorm";
import { initDataSource, seedDatabase } from "./initDataSource";

// データソースの初期化を行う関数を呼び出す
initDataSource()
    .then(async () => {
        // データの登録
        // await seedDatabase();
        console.log("データベースの初期化が完了しました。");
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
    });

// expressアプリケーションのインスタンスを作成
const app = express();

// HTTPサーバーをexpressアプリを基に作成
const server = http.createServer(app);

// 受信するリクエストのボディをJSONとして自動的に解析するミドルウェアを追加
app.use(express.json());

// サーバーがリッスンするポート番号を指定
const port = 8000;

// // ルーターを作成
// const apiRouter = express.Router();

// // ルーティングの設定
// app.use('/api', apiRouter);

// 指定したポートでHTTPサーバーを起動し、起動成功時にメッセージを出力
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
    console.log("Received a request at /");
    res.send('Hello TypeScript + TypeORM!');
});



