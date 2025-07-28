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
import { identifyGarbageFromImage, IdentificationResult } from './services/garbageService';

import { handleError, ErrorNames, createAppError } from './errorHandling'; // エラーハンドリングの関数をインポート
import { generateAccessToken } from './utils/jwt';
import { Request, Response, NextFunction } from "express";

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

// ルート定義の後にエラーハンドリングミドルウェアを追加
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handleError(err, res);
});

// 指定したポートでHTTPサーバーを起動し、起動成功時にメッセージを出力


apiRouter.get('/', (req, res) => {
    res.send('Hello World!');
});


/**
 * @api {post} /auth/register ユーザー登録
 * @apiName RegisterUser
 * @apiGroup Auth
 */
apiRouter.post('/auth/register', async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received registration request:', req.body);

        if (!req.body) throw createAppError('Request body is missing or invalid JSON.', ErrorNames.BadRequest);
        const userData: UserService.UserCreationRequest = req.body; // 変更: UserServiceから参照

        // 簡単な入力値検証
        if (!userData.email || !userData.password || !userData.languageId || !userData.addressId) throw createAppError('Email, password, languageId, and addressId are required.', ErrorNames.BadRequest);

        // ユーザー作成サービスを呼び出す
        const newUser = await UserService.createUser(userData); // 変更: UserServiceから参照

        // ユーザー登録成功後、JWTを生成
        const accessToken = generateAccessToken(newUser);

        // API仕様書通り、アクセストークンを返す
        res.status(201).json({ accessToken });

    } catch (error) {
        // その他の予期せぬエラー
        console.error('Registration failed:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {post} /auth/login ユーザーログイン
 * @apiName LoginUser
 * @apiGroup Auth
 */
apiRouter.post('/auth/login', async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received login request:', req.body);
        const credentials: UserService.UserLoginRequest = req.body;

        // 入力値検証
        if (!credentials.email || !credentials.password) throw createAppError('Email and password are required.', ErrorNames.BadRequest);
    
        // 認証サービスを呼び出す
        const user = await UserService.authenticateUser(credentials);

        // 認証に成功したら、新しいJWTを生成
        const accessToken = generateAccessToken(user);

        // API仕様書通り、アクセストークンを返す
        console.log('[INFO] Login successful, returning access token.');
        res.status(200).json({ accessToken });

    } catch (error) {
        console.error('Login failed:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /auth/token アクセストークンを更新
 * @apiName GetAccessToken
 * @apiGroup Auth
 */
apiRouter.post('/auth/token', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get access token:', req.user);

        const userId = req.user?.userId; // protectミドルウェアでユーザー情報が設定されている
        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // ユーザー情報取得
        const user = await UserService.getUser(userId);
        if (!user) throw createAppError('User not found.', ErrorNames.NotFound);

        // JWTを生成
        const accessToken = generateAccessToken(user);
        res.status(200).json({ accessToken });
    } catch (error) {
        console.error('Failed to get access token:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
})

/**
 * @api {get} /users/me 現在のユーザーのプロフィールを取得
 * @apiName GetMyProfile
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearerトークン (例: Bearer eyJhbGci...)
 */
apiRouter.get('/users/me', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get user profile:', req.user);
        // ミドルウェアによって追加された `req.user` からユーザーIDを取得
        const userId = req.user!.userId;

        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        const userProfile = await UserService.getUserProfileById(userId);

        res.status(200).json(userProfile);
        
    } catch (error) {
        console.error('Failed to get user profile:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
})

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
apiRouter.put('/users/me', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to update user profile:', req.body); // 修正済み
        console.log('[DEBUG] Request user:', req.user); // デバッグ用ログ

        const userId = req.user!.userId;
        const updateData: UserService.UserUpdateRequest = req.body;

        // ユーザーIDが存在しない場合はエラー
        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // リクエストボディが空の場合はエラー
        if (Object.keys(updateData).length === 0) throw createAppError('No update data provided.', ErrorNames.BadRequest);

        const updatedUser = await UserService.updateUserProfile(userId, updateData);

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Failed to update user profile:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {delete} /users/me 現在のユーザーのアカウントを削除
 * @apiName DeleteMyAccount
 * @apiGroup Users
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.delete('/users/me', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to delete user account:', req.user); // 修正済み
        const userId = req.user?.userId;

        // ユーザーIDが存在しない場合はエラー
        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // ユーザー削除サービスを呼び出す
        await UserService.deleteUser(userId);

        res.status(204).send(); // 削除成功時は204 No Contentを返す
    } catch (error) {
        console.error('Failed to delete user account:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /users/me/bin-days ユーザーのゴミ収集日を取得
 * @apiName GetUserBinDays
 * @apiGroup BinDays
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.get('/users/me/bin-days', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get user bin days:', req.user); // 修正済み

        const userId = req.user?.userId;
        // ユーザーIDが存在しない場合はエラー
        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!languageId) throw createAppError('Language ID not found in token.', ErrorNames.Auth);

        // ユーザーのゴミ収集日を取得
        const binDays = await ScheduleService.getBinDaysForUser(userId, languageId); // デフォルト言語IDを1に設定
        res.status(200).json(binDays);
    } catch (error) {
        console.error('Failed to get bin days:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /manuals すべてのゴミ名とIDを取得
 * @apiName GetAllManualSummaries
 * @apiGroup Manuals
 */
apiRouter.get('/manuals', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get all manual summaries.');
        const languageId = req.user?.language; // JWTから言語IDを取得

        // 言語IDがトークンに含まれていない場合はエラー
        if (!languageId) throw createAppError('Language ID not found in token.', ErrorNames.Auth);

        // マニュアルの要約を取得
        const manuals = await ManualService.getAllManualSummaries(languageId);
        res.status(200).json(manuals);
    } catch (error) {
        console.error('Failed to get manual summaries:', error);
        next(error); // エラーハンドラに渡す
    }
});

/**
 * @api {get} /manuals/search 名前でゴミマニュアルを検索
 * @apiName SearchManuals
 * @apiGroup Manuals
 * @apiParam {String} keyword 検索キーワード
 */
apiRouter.get('/manuals/search', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to search manuals by keyword:', req.query); // 修正済み

        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!languageId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // クエリからkeywordを取得 (stringとして扱う)
        const keyword = req.query.keyword as string;
        if (!keyword && keyword.trim() === '') throw createAppError('Keyword is required.', ErrorNames.BadRequest);

        // マニュアルをキーワードで検索
        const manuals = await ManualService.searchManualsByKeyword(keyword, languageId);
        res.status(200).json(manuals);
    } catch (error) {
        console.error('Failed to search manuals by keyword:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /manuals/search/initials 頭文字からマニュアルを検索
 * @apiName SearchManualsByInitial
 * @apiGroup Manuals
 * @apiParam {String} initial 検索する頭文字 (1文字)
 */
apiRouter.get('/manuals/search/initials', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to search manuals by initial:', req.query); // 修正済み

        // JWTから言語IDを取得
        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!languageId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // クエリからinitialを取得 (stringとして扱う)
        const initial = req.query.initial as string;

        // initialが存在し、かつ1文字であることを確認
        if (!initial || initial.length !== 1) {
            throw createAppError('クエリパラメータ "initial" は必須で、1文字である必要があります。', ErrorNames.BadRequest);
        }

        // マニュアルを頭文字で検索
        const manuals = await ManualService.searchManualsByInitial(initial, languageId);
        res.status(200).json(manuals);
    } catch (error) {
        console.error('Failed to search manuals by initial:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /manuals/:manualId IDで特定のゴミマニュアルを取得
 * @apiName GetManualById
 * @apiGroup Manuals
 * @apiParam {Number} manualId マニュアルのID
 */
apiRouter.get('/manuals/:manualId', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get manual by ID:', req.params.manualId); // 修正済み

        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!languageId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // パスパラメータからmanualIdを取得し、数値に変換
        const manualId = parseInt(req.params.manualId, 10);
        if (isNaN(manualId)) throw createAppError('Invalid manual ID format.', ErrorNames.BadRequest);

        // マニュアルをIDで取得
        const manual = await ManualService.getManualById(manualId, languageId);
        if (!manual) throw createAppError('Manual not found.', ErrorNames.NotFound);

        res.status(200).json(manual);
    } catch (error) {
        console.error('Failed to get manual by ID:', error);
        next(error); // エラーを次のミドルウェアに渡す
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
apiRouter.get('/users/me/histories', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to get user histories:', req.user);

        const userId = req.user?.userId;
        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!userId || !languageId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // クエリからlimitとoffsetを取得し、数値に変換。未指定の場合はデフォルト値を使用。
        const limit = parseInt(req.query.limit as string, 10) || 20;
        const offset = parseInt(req.query.offset as string, 10) || 0;

        const histories = await HistoryService.getHistoriesForUser(userId, languageId, limit, offset);
        res.status(200).json(histories);
    } catch (error) {
        console.error('Failed to get user histories:', error);
        next(error); // エラーを次のミドルウェアに渡す
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
apiRouter.post('/users/me/histories', protect, async (req, res, next) => {
    try {
        logWithTimestamp('[INFO] Received request to add user history:', req.body);
        const userId = req.user?.userId;
        const { manualId } = req.body; // ボディからmanualIdを取得

        // ユーザーIDが存在しない場合はエラー
        if (!userId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // manualIdが提供されていない場合はエラー
        if (!manualId) throw createAppError('manualId is required.', ErrorNames.BadRequest);

        // 履歴を追加するサービスを呼び出す
        const newHistory = await HistoryService.addHistoryForUser(userId, manualId, 1); // デフォルトの言語IDを1に設定

        // 成功した場合は201 Createdを返す
        res.status(201).json(newHistory);

    } catch (error) {
        console.error('Failed to add user history:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

/**
 * @api {get} /addresses/search 郵便番号から住所を検索
 * @apiName SearchAddresses
 * @apiGroup Addresses
 * @apiParam {String} postalCode 検索する郵便番号
 * @apiParam {String} [lang] 言語コード (例: 'ja', 'en')。省略時は 'ja'。
 */
// ★ 修正点: protect を削除し、クエリから言語コード(lang)を取得
apiRouter.get('/addresses/search', async (req, res, next) => {    
    try {
        logWithTimestamp('[INFO] Received request to search addresses by postal code:', req.query);

        const postalCode = req.query.postalCode as string;
        // TODO:将来の拡張性を考慮して、言語コードをクエリから取得するようにする
        // クエリから言語コードを取得。指定がなければ 'ja' (日本語) をデフォルト値とする
        // const langCode = (req.query.lang as string) || 'ja';
        const langCode = 'ja';

        if (!postalCode || postalCode.trim() === '') throw createAppError('クエリパラメータ "postalCode" は必須です。', ErrorNames.BadRequest);

        const addresses = await findAddressesByPostalCode(postalCode.trim(), langCode);
        // 住所が見つからない場合は404エラー
        // if (addresses.length === 0) throw createAppError('Address not found.', ErrorNames.NotFound);
        
        res.status(200).json(addresses);

    } catch (error) {
        console.error('Failed to search addresses:', error);
        next(error);
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

// ===================================
//   Garbage エンドポイント
// ===================================

/**
 * @api {post} /garbage/identify 画像からゴミを識別
 * @apiName IdentifyGarbage
 * @apiGroup Garbage
 * @apiHeader {String} Authorization Bearerトークン
 * @apiBody {File} image 識別したい画像ファイル
 */
apiRouter.post('/garbage/identify', protect, upload.single('image'), async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const languageId = req.user?.language; // JWTから言語IDを取得

        if (!userId || !languageId) throw createAppError('Unauthorized', ErrorNames.Auth)
        if (!req.file) throw createAppError('No image provided.', ErrorNames.BadRequest);

        // 1. 外部のAI APIを呼び出して、ゴミの識別候補リストを取得
        const aiResponse = await identifyGarbageFromImage(req.file.buffer);

        if (!aiResponse && aiResponse!.results.length === 0) throw createAppError('Could not identify the garbage from the image.', ErrorNames.NotFound);

        // 2. AIの識別結果をループして、それぞれ履歴に保存
        let Results: IdentificationResult[] = []; // AIの識別結果を保持する変数として初期化
        // (複数の処理を並行して実行)
        const historyPromises = aiResponse!.results.map(async (result) => {
            // 3. 識別された名前(result.name)で、DB内のマニュアルを検索
            const manual = await ManualService.findManualByName(result.name, languageId);
            
            // 4. マニュアルが見つかった場合のみ、履歴を追加
            if (manual) {
                await HistoryService.addHistoryForUser(userId, manual.id, languageId);
                // 履歴保存の結果をResultsに追加
                Results.push({
                    rank: result.rank,
                    name: manual.name,
                    manualId: manual.id, // マニュアルのIDも追加
                });
            } else {
                // マニュアルが見つからない場合は、ログに残すなどしてスキップ
                logWithTimestamp(`[WARN] Manual not found for AI result: "${result.name}". History not saved.`);
            }
        });
        
        // すべての履歴保存処理が終わるのを待つ
        await Promise.all(historyPromises);

        // 5. API仕様書通りのレスポンスをクライアントに返す
        const clientResponse = {
            query: aiResponse!.query_text, // "query_text" を "query" にマッピング
            results: Results,
        };
        res.status(200).json(clientResponse);
    } catch (error) {
        console.error('Failed during garbage identification process:', error);
        next(error); // エラーハンドラに処理を移す
    }
});

/**
 * @api {post} /garbage/identify/test 画像からゴミを識別 (テスト用)
 * @apiName IdentifyGarbageTest
 * @apiGroup Garbage
 * @apiHeader {String} Authorization Bearerトークン
 */
apiRouter.post('/garbage/identify/test', protect, upload.single('image'), async (req, res) => {
    const userId = req.user?.userId;

    if (userId) {
        // 画像ファイルがリクエストに含まれているかだけをチェック
        if (req.file) {
        // ダミーのレスポンスデータを作成
        // 新しいAPI仕様書で定義されたレスポンス形式に合わせる
        const dummyResponse = {
            query: "Anker portable charger",
            results: [
                {
                    rank: 1,
                    name: "充電器（アダプター）"
                },
                {
                    rank: 2,
                    name: "小型充電式電池"
                },
                {
                    rank: 3,
                    name: "充電式電池"
                },
                {
                    rank: 4,
                    name: "アダプター（充電用）"
                },
                {
                    rank: 5,
                    name: "電池（充電式電池）"
                }
            ]
        };

        // ダミーデータを200 OKステータスで返す
        res.status(200).json(dummyResponse);
        
        } else {
            // 画像が提供されなかった場合は400エラー
            res.status(400).json({ message: 'No image provided.' });
        }
    } else {
        // 認証されていない場合
        res.status(401).json({ message: 'Unauthorized.' });
    }
});

/**
 * @api {get} /manuals/search/exact 名前でゴミマニュアルを完全一致検索
 * @apiName SearchManualsExact
 * @apiGroup Manuals
 * @apiParam {String} name 完全一致で検索する名前
 */
apiRouter.get('/manuals/search/exact', protect, async (req, res, next) => {
    try {
        const name = req.query.name as string;
        if (!name || name.trim() === '') throw createAppError('クエリパラメータ "name" は必須です。', ErrorNames.BadRequest);
        logWithTimestamp('[INFO] Received request to search manual by exact name:', name);

        const languageId = req.user?.language; // JWTから言語IDを取得
        if (!languageId) throw createAppError('Unauthorized', ErrorNames.Auth);

        // マニュアルを完全一致で検索
        const manual = await ManualService.findManualByName(name.trim(), languageId);

        if (manual) {
            // マニュアルが見つかった場合、API仕様の形式にマッピングして返す
            const responseBody = {
                id: manual.id,
                name: manual.name,
                category: manual.category,
                remarks: manual.remarks,
            };
            res.status(200).json(responseBody);
        } else {
            // マニュアルが見つからなかった場合
            res.status(200).json([]);
        }
    } catch (error) {
        console.error('Failed to search manual by exact name:', error);
        next(error); // エラーを次のミドルウェアに渡す
    }
});

// データソースの初期化を行う関数を呼び出す
initDataSource()
    .then(async () => {
        // データの登録
        // await seedDatabase();
        // importEnglishTranslations();
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

