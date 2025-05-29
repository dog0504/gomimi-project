FROM python:3.13

# アプリケーションの作業ディレクトリを設定
WORKDIR /usr/src/python

# pipのアップグレード
RUN pip install --upgrade pip

# 必要なパッケージをインストール
COPY requirements.txt .
RUN pip install -r requirements.txt

# アプリケーションのソースコードをコンテナにコピー
COPY . .

# ポート8000を公開
EXPOSE 8000

# コンテナ起動時に実行するコマンド
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]   