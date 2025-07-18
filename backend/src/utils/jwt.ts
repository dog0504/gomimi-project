import jwt from 'jsonwebtoken';
import { User } from "../entity/User";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-characters-long';

export function generateAccessToken(user : User): string {
    // return jwt.sign(
    //     { userId: user.id, email: user.email },
    //     JWT_SECRET,
    //     { expiresIn: '10h' }
    // );

    // TODO:他の言語を実装する際はここを変更すること
    let languageId = 1;
    if (user.language.id >= 2) {
        languageId = 2; // 英語以外を実装していないため、英語の2とする
    }

    return jwt.sign(
        { userId: user.id, email: user.email, language: languageId },
        JWT_SECRET,
        { 
            expiresIn: '10h'
        }
    );
}