"""
API起動スクリプト

このスクリプトはFastAPIを使用してAPIサービスを起動します。
DBの操作やAIサーバへのリクエスト機能

localhost:8000/ でアクセス可能です。
"""

import logging
import requests
import os
from fastapi import FastAPI
from contextlib import asynccontextmanager

# ログの設定
logging.basicConfig(level=logging.INFO)
# 特定のロガーを取得 (モジュール名やアプリケーション名で)
logger = logging.getLogger(__name__) # 現在のモジュール名をロガー名として使用

# AIサービスのURLを環境変数から取得するか、直接指定
# compose.ymlの環境変数で設定することを推奨
AI_SERVICE_BASE_URL = os.getenv("AI_SERVICE_URL", "http://ai_service:5001")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    アプリケーションの起動時に実行されるイベント
    ここで初期化処理やリソースの準備を行うことができます。
    """
    logger.info("Starting up the FastAPI service...")
    yield
    # シャットダウン時の処理があればここに記述
    logger.info("Shutting down the FastAPI service...")

app = FastAPI(title="My FastAPI Service", lifespan=lifespan)

@app.get("/")
async def read_root():
    """
    ルートエンドポイント
    """
    return {"message": "FastAPI service is running!"}

@app.get("/talk-ai-test")
async def talk_ai_test():
    """
    AIサービスとの通信テストエンドポイント
    AIサービスにリクエストを送信し、応答を取得します。
    """
    try:
        response = requests.get(f"{AI_SERVICE_BASE_URL}/")
        response.raise_for_status()  # HTTPエラーが発生した場合は例外を投げる
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Error communicating with AI service: {e}")
        return {"error": "Failed to communicate with AI service"}

# @app.get("/health")
# async def health_check():
#     """
#     ヘルスチェック用エンドポイント
#     コンテナが正常に動作しているかを確認するために使用できます。
#     """
#     return {"status": "ok"}
