// タイムスタンプ付きのカスタムロガー関数
function logWithTimestamp(...messages: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...messages);
}

logWithTimestamp("Hello TypeScript + TypeORM!");
import http from 'http';
import "reflect-metadata";
import express from "express";
import cors from "cors";
import multer from 'multer';
import jwt from 'jsonwebtoken';

import { initDataSource, seedDatabase } from "./initDataSource";
import { User } from './entity/User';
import * as UserService from './services/userService';
import * as ScheduleService from './services/scheduleService';
import { protect } from './middleware/authMiddleware';
import * as ManualService from './services/manualService';
import * as HistoryService from './services/historyService';
import { findAddressesByPostalCode } from './services/addressService';
import { getAllLanguages } from './services/languageService';

// アップロードされたファイルをメモリ上に一時保存する設定
const upload = multer({ storage: multer.memoryStorage() });

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
const apiRouter = express.Router();

// // ルーティングの設定
app.use('/api/v1', apiRouter);

// 指定したポートでHTTPサーバーを起動し、起動成功時にメッセージを出力


apiRouter.get('/', (req, res) => {
    res.send('Hello World!');
});

/**
 * @api {post} /auth/register ユーザー登録
 * @apiName RegisterUser
 * @apiGroup Auth
 */
apiRouter.post('/auth/register', async (req, res) => {
    logWithTimestamp('[INFO] Received registration request:', req.body); // 修正済み

    if (!req.body) {
        res.status(400).json({ message: 'Request body is missing or invalid JSON.' });
    }

    const userData: UserService.UserCreationRequest = req.body; // 変更: UserServiceから参照

    // 簡単な入力値検証
    if (!userData.email || !userData.password || !userData.languageId || !userData.addressId) {
        res.status(400).json({ message: 'Invalid input.' });
    }

    try {
        // ユーザー作成サービスを呼び出す
        const newUser = await UserService.createUser(userData); // 変更: UserServiceから参照

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

/**
 * @api {post} /auth/login ユーザーログイン
 * @apiName LoginUser
 * @apiGroup Auth
 */
apiRouter.post('/auth/login', async (req, res) => {
    logWithTimestamp('[INFO] Received login request:', req.body); // 修正済み
    const credentials: UserService.UserLoginRequest = req.body;

    // 入力値検証
    if (!credentials.email || !credentials.password) {
        console.warn('Login request missing email or password:', credentials);
        res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // 認証サービスを呼び出す
        const user = await UserService.authenticateUser(credentials);

        // 認証に成功したら、新しいJWTを生成
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' } // 有効期限
        );

        // API仕様書通り、アクセストークンを返す
        console.log('[INFO] Login successful, returning access token.');
        res.status(200).json({ accessToken });

    } catch (error) {
        // 認証失敗のエラーハンドリング
        if (error instanceof Error && error.name === 'AuthError') {
            console.warn('Login failed:', error);
            res.status(401).json({ message: 'Unauthorized.' });
        }
        // その他の予期せぬエラー
        console.error('Login failed:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @api {get} /users/me 現在のユーザーのプロフィールを取得
 * @apiName GetMyProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearerトークン (例: Bearer eyJhbGci...)
 */
apiRouter.get('/users/me', protect, async (req, res) => {
    //                  ^^^^^^^
    // protectミドルウェアをここに追加。これ以降の処理は認証成功した場合のみ実行される。
    logWithTimestamp('[INFO] Received request to get user profile:', req.user); // 修正済み
    try {
        // ミドルウェアによって追加された `req.user` からユーザーIDを取得
        const userId = req.user!.userId;

        if (!userId) {
            // 基本的にミドルウェアで弾かれるが、念のためチェック
            console.warn('Unauthorized access attempt without userId:', req.user);
            res.status(401).json({ message: 'Unauthorized.' });
        }

        const userProfile = await UserService.getUserProfileById(userId);

        if (!userProfile) {
            res.status(404).json({ message: 'User not found.' });
        }

        // APIのレスポンスにパスワードを含めないように、除外する
        // DBの'languageId'プロパティを、API仕様の'language'プロパティにマッピングする
        const { password, gAccount, ...restOfUser } = userProfile as User;
        const responseObject = {
            ...restOfUser,
        };
        res.status(200).json(responseObject);
        
    } catch (error) {
        console.error('Failed to get user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @api {put} /users/me 現在のユーザーのプロフィールを更新
 * @apiName UpdateMyProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearerトークン
 * @apiBody {String} [email] 新しいメールアドレス
 * @apiBody {String} [language] 新しい言語
 * @apiBody {Object} [address] 新しい住所
 * @apiBody {Number} address.id 新しい住所のID
 */
apiRouter.put('/users/me', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received request to update user profile:', req.body); // 修正済み
    const userId = req.user!.userId;
    const updateData: UserService.UserUpdateRequest = req.body;

    if (!userId) {
        // ミドルウェアで弾かれるはずだが念のため
        res.status(401).json({ message: 'Unauthorized.' });
    }

    // リクエストボディが空の場合はエラー
    if (Object.keys(updateData).length === 0) {
        res.status(400).json({ message: 'No update data provided.' });
    }

    try {
        const updatedUser = await UserService.updateUserProfile(userId, updateData);

        if (!updatedUser) {
            // サービス内でエラーがスローされるため、通常ここには来ない
            res.status(404).json({ message: 'User not found after update.' });
        }

        // レスポンスからパスワードを除外
        const { password, gAccount, ...restOfUser } = updatedUser as User;
        const responseObject = {
            ...restOfUser,
        };
        res.status(200).json(responseObject);

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'NotFoundError') {
                res.status(404).json({ message: error.message });
            }
            if (error.name === 'ConflictError') {
                res.status(409).json({ message: error.message }); // 既に存在する
            }
            if (error.name === 'BadRequestError') {
                res.status(400).json({ message: error.message }); // 不正なリクエスト
            }
        }
        console.error('Failed to update user profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @api {delete} /users/me 現在のユーザーのアカウントを削除
 * @apiName DeleteMyAccount
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.delete('/users/me', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received request to delete user account:', req.user); // 修正済み
    const userId = req.user?.userId;

    if (userId) {
        try {
        const wasDeleted = await UserService.deleteUser(userId);
        if (wasDeleted) {
            // API仕様書に従い、成功時はボディなしの204を返す
            res.status(204).send();
        } else {
            // サービスがfalseを返した場合（＝ユーザーが見つからなかった）
            res.status(404).json({ message: 'User not found.' });
        }
        } catch (error) {
        console.error('Failed to delete user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // このケースは通常ミドルウェアで弾かれるが、念のため記述
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

// ===================================
//   Garbage エンドポイント
// ===================================

/**
 * @api {post} /garbage/identify 画像からゴミを識別 (未実装)
 * @apiName IdentifyGarbage
 * @apiGroup Garbage
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.post('/garbage/identify', protect, upload.single('image'), async (req, res) => {
    logWithTimestamp('[INFO] Received garbage identification request:', req.file); // 修正済み
    // protectミドルウェアで認証をチェック
    // upload.single('image') で'image'という名前のファイルを受け付ける
    // 処理の中身は未実装であることを示すレスポンスを返す
    res.status(501).json({ message: 'この機能はまだ実装されていません。' });
});

/**
 * @api {get} /garbage/search 名前でゴミを検索 (未実装)
 * @apiName SearchGarbage
 * @apiGroup Garbage
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.get('/garbage/search', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received garbage search request:', req.query); // 修正済み
    // クエリパラメータ'keyword'の有無をチェック
    const keyword = req.query.keyword;

    if (keyword) {
        // keywordがあっても、処理の中身は未実装であることを示すレスポンスを返す
        res.status(501).json({ message: 'この機能はまだ実装されていません。' });
    } else {
        // API仕様書ではkeywordは必須なので、ない場合は400エラーを返す
        res.status(400).json({ message: 'クエリパラメータ "keyword" は必須です。' });
    }
});

/**
 * @api {get} /users/me/bin-days ユーザーのゴミ収集日を取得
 * @apiName GetUserBinDays
 * @apiGroup BinDays
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.get('/users/me/bin-days', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received request to get user bin days:', req.user); // 修正済み
    const userId = req.user?.userId;

    if (userId) {
        try {
            const binDays = await ScheduleService.getBinDaysForUser(userId);
            res.status(200).json(binDays);
        } catch (error) {
            console.error('Failed to get bin days:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // このケースは通常ミドルウェアで弾かれる
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

/**
 * @api {get} /manuals すべてのゴミ名とIDを取得
 * @apiName GetAllManualSummaries
 * @apiGroup Manuals
 */
apiRouter.get('/manuals', async (req, res) => {
    logWithTimestamp('[INFO] Received request to get all manual summaries.'); // 修正済み
    try {
        const manuals = await ManualService.getAllManualSummaries();
        res.status(200).json(manuals);
    } catch (error) {
        console.error('Failed to get manual summaries:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @api {get} /manuals/search 名前でゴミマニュアルを検索
 * @apiName SearchManuals
 * @apiGroup Manuals
 * @apiParam {String} keyword 検索キーワード
 */
apiRouter.get('/manuals/search', async (req, res) => {
    logWithTimestamp('[INFO] Received request to search manuals by keyword:', req.query); // 修正済み
    // クエリからkeywordを取得 (stringとして扱う)
    const keyword = req.query.keyword as string;

    // keywordが存在し、空文字列でないことを確認
    if (keyword && keyword.trim() !== '') {
        try {
            const manuals = await ManualService.searchManualsByKeyword(keyword);
            res.status(200).json(manuals);
        } catch (error) {
            console.error('Failed to search manuals:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // keywordが提供されていない、または空の場合は400エラー
        res.status(400).json({ message: 'クエリパラメータ "keyword" は必須です。' });
    }
});

/**
 * @api {get} /manuals/search/initials 頭文字からマニュアルを検索
 * @apiName SearchManualsByInitial
 * @apiGroup Manuals
 * @apiParam {String} initial 検索する頭文字 (1文字)
 */
apiRouter.get('/manuals/search/initials', async (req, res) => {
    logWithTimestamp('[INFO] Received request to search manuals by initial:', req.query); // 修正済み
    const initial = req.query.initial as string;

    // initialが存在し、かつ1文字であることを確認
    if (initial && initial.length === 1) {
        try {
            const manuals = await ManualService.searchManualsByInitial(initial);
            res.status(200).json(manuals);
        } catch (error) {
            console.error('Failed to search manuals by initial:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // initialがない、または1文字でない場合は400エラー
        res.status(400).json({ message: 'クエリパラメータ "initial" は必須で、1文字である必要があります。' });
    }
});

/**
 * @api {get} /manuals/:manualId IDで特定のゴミマニュアルを取得
 * @apiName GetManualById
 * @apiGroup Manuals
 * @apiParam {Number} manualId マニュアルのID
 */
apiRouter.get('/manuals/:manualId', async (req, res) => {
    logWithTimestamp('[INFO] Received request to get manual by ID:', req.params.manualId); // 修正済み
    // パスパラメータからmanualIdを取得し、数値に変換
    const manualId = parseInt(req.params.manualId, 10);

    // manualIdが有効な数値かチェック
    if (!isNaN(manualId)) {
        try {
            const manual = await ManualService.getManualById(manualId);
            if (manual) {
                // マニュアルが見つかった場合
                res.status(200).json(manual);
            } else {
                // サービスがnullを返した場合（＝マニュアルが見つからなかった）
                res.status(404).json({ message: 'Manual not found.' });
            }
        } catch (error) {
            console.error('Failed to get manual by ID:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // manualIdが数値でない場合は400エラー
        res.status(400).json({ message: 'Invalid manual ID format.' });
    }
});

/**
 * @api {get} /users/me/histories ユーザーの履歴を取得
 * @apiName GetUserHistories
 * @apiGroup Histories
 * @apiHeader {String} Authorization Bearerトークン
 * @apiParam {Number} [limit=20] 取得件数
 * @apiParam {Number} [offset=0] 開始位置
 */
apiRouter.get('/users/me/histories', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received request to get user histories:', req.user); // 修正済み
    const userId = req.user?.userId;

    if (userId) {
        // クエリからlimitとoffsetを取得し、数値に変換。未指定の場合はデフォルト値を使用。
        const limit = parseInt(req.query.limit as string, 10) || 20;
        const offset = parseInt(req.query.offset as string, 10) || 0;

        try {
            const histories = await HistoryService.getHistoriesForUser(userId, limit, offset);
            res.status(200).json(histories);
        } catch (error) {
            console.error('Failed to get user histories:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // このケースは通常ミドルウェアで弾かれる
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

/**
 * @api {post} /users/me/histories ユーザーの識別履歴を追加
 * @apiName AddIdentificationHistory
 * @apiGroup Histories
 * @apiHeader {String} Authorization Bearerトークン
 * @apiBody {String} name 識別されたゴミの名前
 * @apiBody {String} [type] 識別されたゴミの分別区分
 */
apiRouter.post('/users/me/histories', protect, async (req, res) => {
    logWithTimestamp('[INFO] Received request to add user history:', req.body); // 修正済み
    const userId = req.user?.userId;
    const { name, type } = req.body;

    if (userId) {
        // API仕様に基づき、nameが必須
        if (typeof name === 'string' && name.trim() !== '') {
            try {
                const newHistory = await HistoryService.addHistoryForUser(userId, { name: name.trim(), type: type });
                res.status(201).json(newHistory);
            } catch (error) {
                console.error('Failed to add user history:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        } else {
            res.status(400).json({ message: 'リクエストボディに "name" (文字列) は必須です。' });
        }
    } else {
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

/**
 * @api {get} /addresses/search 郵便番号から住所を検索
 * @apiName SearchAddresses
 * @apiGroup Addresses
 * @apiParam {String} postalCode 検索する郵便番号
 */
apiRouter.get('/addresses/search', async (req, res) => {
    logWithTimestamp('[INFO] Received request to search addresses by postal code:', req.query); // 修正済み
    const postalCode = req.query.postalCode as string;

    // postalCodeが存在し、空文字列でないことを確認
    if (postalCode && postalCode.trim() !== '') {
        try {
            const addresses = await findAddressesByPostalCode(postalCode.trim());
            if (addresses.length > 0) {
                // 住所が見つかった場合
                res.status(200).json(addresses);
            } else {
                // API仕様書に従い、見つからなかった場合は404エラー
                res.status(404).json({ message: 'Address not found.' });
            }
        } catch (error) {
            console.error('Failed to search addresses:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        // postalCodeが提供されていない場合は400エラー
        res.status(400).json({ message: 'クエリパラメータ "postalCode" は必須です。' });
    }
});

/**
 * @api {get} /languages 利用可能な言語のリストを取得
 * @apiName GetLanguages
 * @apiGroup Languages
 */
apiRouter.get('/languages', async (req, res) => {
    logWithTimestamp('[INFO] Received request to get all languages.'); // 修正済み
    try {
        const languages = await getAllLanguages();
        res.status(200).json(languages);
    } catch (error) {
        console.error('Failed to get languages:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// データソースの初期化を行う関数を呼び出す
initDataSource()
    .then(async () => {
        // データの登録
        // await seedDatabase();
        logWithTimestamp("データベースの初期化が完了しました。");

        // 現在の時間を取得してログに出力
        const currentTime = new Date().toISOString();
        logWithTimestamp(`現在の時間: ${currentTime}`);

        // サーバーを起動
        server.listen(port, () => {
            logWithTimestamp(`Server is running on port ${port}`);
        });
    })
    .catch((error) => {
        logWithTimestamp(`Error during Data Source initialization: ${error}`);
    });