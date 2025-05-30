# gomimi project start 

* 最終的にどのPCでも環境を整えられるものを目指す
* リポジトリがパブリックになっているため個人情報やKeyなどの漏れては行けないものは書かない or .gitignoreにファイル名を記述して除外する
* 何かしらの変更を加えるときは必ずブランチを分けて作業すること
* 基本的に起動して各コンテナにアタッチしてコマンドを打つことを推奨

## Docker Compose
### コンテナのビルドと起動（バックグラウンド）
`docker compose up -d` 
### コンテナの削除
`docker compose down`
### コンテナの再ビルド(Dockerfileやrequirements.txtが変更された場合)
`docker compose up -d --build`

### 各サービスのホストネームとポート
* api_sarvice
  - port:8000
* ai_service
  - hostname:ai_service
  - port:5001
* db_service
  - hostname:db_service
  - port:3306
* phpmyadmin mysqlをWebUIで表示
  * http://localhost:8080

### Pythonについて
* AIとAPIのサーバーはビルドする際に`requirements.txt`に記述されている外部ライブラリをインストールするため、必要なライブラリは必ず`requirements.txt`に記述すること
* アタッチした状態で個別でライブラリをインストールした場合`pip freeze > requirements.txt`で記述できる
* アタッチしている状態で使えるコマンド
  * `pip install -r requirements.txt`   `requirements.txt`に記述されているライブラリを一括インストール
  * `pip freeze > requirements.txt`     `requirements.txt`にインストールされているライブラリを記述
  * `pip install "ライブラリ名"`          指定したライブラリをインストール

### DBについて
* rootのパス:root

```
# ツリー
.
├── ai_service               # AI、API用のサービス 
│   ├── __pycache__
│   ├── app.py
│   ├── Dockerfile           #このコンテナの設定ファイル
│   ├── README.md
│   └── requirements.txt     #Pythonの外部ライブラリリスト
├── api_service              #API、DB操作用のサービス
│   ├── __pycache__
│   ├── app.py
│   ├── Dockerfile           #このコンテナの設定ファイル
│   ├── README.md
│   └── requirements.txt     #Pythonの外部ライブラリリスト
├── compose.yml              #全体のコンテナの設定ファイル
├── mysql-data               #DB用ディレクトリ
└── README.md
```
