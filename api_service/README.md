# venv（仮想環境）で作業したいなら

## APIの方を仮想環境で作業したいなら
### cd api_service 
## AIの方を仮想環境で作業したいなら
### cd ai_service

## venvという名前の仮想環境を構築
### python3 -m venv venv

## Windows
## 仮想環境を起動
### .\venv\Scripts\Activate.ps1
## ここから仮想環境内で実行(コマンドの左の方に(venv)と書いてあれば仮想環境内)
## ---------------------------------------------------------------------------------------
## requirements.txtに記述されているライブラリをインストール
### pip install -r requirements.txt
## 新しくライブラリをインストールしたいなら`requirements.txt`に記述しもう一度上記のコマンドを打つか
## `pip install`でインストールし以下のコマンドで`requirements.txt`に記述する
### pip freeze > requirements.txt
## 仮想環境を終了させる
### deactivate
## ---------------------------------------------------------------------------------------

## Mac ほぼwindowsと変わらない
### source venv/bin/activate
### pip install -r requirements.txt
### deactivate
