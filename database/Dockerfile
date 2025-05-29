FROM mongo:latest

# mongo自身のrootユーザとパスワード設定
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=root

ENV TZ="Asia/Tokyo"
RUN echo $TZ > /etc/timezone

# setup.jsをentrypointにコピーし、イメージ作成時に初期セットアップを実行
COPY setup.js /docker-entrypoint-initdb.d/
