# gomimi project start 

## コンテナの起動（バックグラウンド）
### docker compose up -d 
## コンテナの削除
### docker compose down
## コンテナの再ビルド(Dockerfileやrequirements.txtが変更された場合)
### docker compose up -d --build

.
├── ai_service
│   ├── __pycache__
│   ├── app.py
│   ├── Dockerfile
│   ├── README.md
│   └── requirements.txt
├── api_service
│   ├── __pycache__
│   ├── app.py
│   ├── Dockerfile
│   ├── README.md
│   └── requirements.txt
├── compose.yml
├── database
│   ├── configdb
│   ├── db_data
│   ├── Dockerfile
│   └── setup.js
└── README.md