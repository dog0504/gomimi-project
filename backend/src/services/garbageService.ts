import axios from 'axios';
import FormData from 'form-data';

// Python APIのレスポンスの型定義
interface PythonApiResponse {
    success: boolean;
    query_text: string;
    search_results: {
        rank: number;
        item_name: string;
        similarity: number;
    }[];
}

export interface FullIdentificationResponse {
    query_text: string;
    results: IdentificationResult[];
}

// このサービスが返す識別結果の型
export interface IdentificationResult {
    rank: number;
    name: string;
    manualId?: number; // マニュアルのIDをオプションとして追加
}

// Python APIのURL。将来的には設定ファイルなどに外出しするのが望ましいです。
const PYTHON_API_URL = 'http://192.168.10.150:8000/identify-garbage/';

/**
 * 画像バッファをPythonの識別APIに送信し、識別結果のリストを取得する
 * @param imageBuffer 画像ファイルのバッファ
 * @returns 識別結果のリスト、またはnull
 */
export const identifyGarbageFromImage = async (imageBuffer: Buffer): Promise<FullIdentificationResponse | null> => {
    const form = new FormData();
    form.append('image_file', imageBuffer, {
        filename: 'image.png',
        contentType: 'image/png',
    });

    try {
        const response = await axios.post<PythonApiResponse>(PYTHON_API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        const apiData = response.data;
        if (apiData && apiData.success && apiData.search_results.length > 0) {
            return {
                query_text: apiData.query_text,
                results: apiData.search_results.map(result => ({
                    rank: result.rank,
                    name: result.item_name,
                })),
            };
        }
        return null;
    } catch (error) {
        console.error('Error calling Python garbage identification API:', error);
        throw new Error('Garbage identification service is currently unavailable.');
    }
};