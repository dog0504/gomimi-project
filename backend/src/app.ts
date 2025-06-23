console.log("Hello TypeScript + TypeORM!");
import http from 'http'; // ← { get } を削除
import "reflect-metadata";
import express from "express";
import cors from "cors"; // 追加
import { DataSource } from "typeorm";
import { initDataSource, seedDatabase } from "./initDataSource";
import { User } from './entity/User';
import { createUser, UserCreationRequest } from './services/userService'; // 作成したサービスをインポート
import jwt from 'jsonwebtoken';

// expressアプリケーションのインスタンスを作成
const app = express();

app.use(cors()); // 追加: CORSミドルウェアを有効化
app.use(express.json());

// HTTPサーバーをexpressアプリを基に作成
const server = http.createServer(app);

// 受信するリクエストのボディをJSONとして自動的に解析するミドルウェアを追加
app.use(express.json());

// サーバーがリッスンするポート番号を指定
const port = 8000;

// JWTの秘密鍵。本番環境では必ず環境変数など安全な方法で管理してください。
const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-characters-long';

// // ルーターを作成
// const apiRouter = express.Router();

// // ルーティングの設定
// app.use('/api', apiRouter);

// 指定したポートでHTTPサーバーを起動し、起動成功時にメッセージを出力


app.get('/', (req, res) => {
    res.send('Hello World!');
});

/**
 * @api {post} /auth/register ユーザー登録
 * @apiName RegisterUser
 * @apiGroup Auth
 */
app.post('/auth/register', async (req, res) => {
    console.log('Received registration request:', req.body); // 追加: 受信ボディをログ出力

    if (!req.body) {
        res.status(400).json({ message: 'Request body is missing or invalid JSON.' });
    }

    const userData: UserCreationRequest = req.body;

    // 簡単な入力値検証
    if (!userData.email || !userData.password || !userData.language || !userData.address?.id) {
        res.status(400).json({ message: 'Invalid input.' });
    }

    try {
        // ユーザー作成サービスを呼び出す
        const newUser = await createUser(userData);

        // ユーザー登録成功後、JWTを生成
        const accessToken = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '1h' } // トークンの有効期限 (例: 1時間)
        );

        // API仕様書通り、アクセストークンを返す
        res.status(201).json({ accessToken });

    } catch (error) {
        if (error instanceof Error) {
        // サービスで設定したエラー名でハンドリングを分岐
        if (error.name === 'ConflictError') {
            console.error('User registration failed:', error);
            res.status(409).json({ message: error.message }); // 409 Conflict
        }
        if (error.name === 'BadRequestError') {
            console.error('User registration failed:', error);
            res.status(400).json({ message: error.message }); // 400 Bad Request
        }
        }
        // その他の予期せぬエラー
        console.error('Registration failed:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// データソースの初期化を行う関数を呼び出す
initDataSource()
    .then(async () => {
        // データの登録
        // await seedDatabase();
        console.log("データベースの初期化が完了しました。");
        // サーバーを起動
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
    });