import jwt from 'jsonwebtoken';
import { User } from "../entity/User";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

export function generateAccessToken(user : User): string {
    // 言語IDが1か2以外なら2をセット
    const languageId = (user.language.id === 1 || user.language.id === 2)
        ? user.language.id
        : 2;

    return jwt.sign(
        { userId: user.id, email: user.email, language: languageId },
        JWT_SECRET,
        { expiresIn: '10h' }
    );

    // return jwt.sign(
    //     { userId: user.id, email: user.email, language: user.language.id },
    //     JWT_SECRET,
    //     { 
    //         expiresIn: '10h'
    //     }
    // );
}