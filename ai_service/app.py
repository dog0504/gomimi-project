"""
AIサービスのFastAPIアプリケーション
このアプリケーションは、FastAPIを使用してAIサービスを提供します

localhost:5001/ でアクセス可能です。
同じcompose内であれば
ai_service:5001/ でアクセス可能です。
"""

import logging
from fastapi import FastAPI
from contextlib import asynccontextmanager

# ログの設定
logging.basicConfig(level=logging.INFO)
# 特定のロガーを取得 (モジュール名やアプリケーション名で)
logger = logging.getLogger(__name__) # 現在のモジュール名をロガー名として使用

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
    return {"message": "FastAPI and AI service is running!"}

# @app.get("/health")
# async def health_check():
#     """
#     ヘルスチェック用エンドポイント
#     コンテナが正常に動作しているかを確認するために使用できます。
#     """
#     return {"status": "ok"}
