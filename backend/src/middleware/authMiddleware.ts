import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

function logWithTimestamp(...messages: any[]) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}]`, ...messages);
}

// app.tsで定義したものと同じ秘密鍵を使用
const JWT_SECRET = 'your-super-secret-key-that-is-at-least-32-characters-long';

// ExpressのRequest型に 'user' プロパティを追加するための型定義
interface JwtPayload {
    userId: number;
    email: string;
    language: number; // 必要に応じて言語IDを追加
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

/**
 * JWTを検証し、リクエストを保護するミドルウェア
 */
export const protect = (req: Request, res: Response, next: NextFunction) => {
    logWithTimestamp('[INFO] Auth middleware called'); // デバッグ用ログ
    let token;

    // ヘッダーに 'Authorization: Bearer <token>' があるかチェック
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 'Bearer ' の部分を取り除き、トークン本体を取得
            token = req.headers.authorization.split(' ')[1];

            // トークンを検証
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

            // デコードしたペイロードをリクエストオブジェクトに追加
            req.user = decoded;

            // 次の処理へ進む
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Unauthorized.' });
        }
    }

    if (!token) {
        console.log('No token provided in request headers'); // デバッグ用ログ
        res.status(401).json({ message: 'No token provided.' });
    }
};