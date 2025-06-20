-- ユーザー名 guest
-- パスワード 3923

-- データベース作成
create database if not exists gomimi
CHARACTER SET=utf8mb4;
show databases;


-- ユーザー作成
CREATE USER 'guest' IDENTIFIED BY '3923';
SELECT User, Host FROM mysql.user;

-- 権限付与
GRANT ALL PRIVILEGES ON gomimi.* TO 'guest'@'%';
show grants for guest;

-- RENAME USER 'guest'@'%' TO 'guest'@'localhost';

ALTER TABLE USERS ADD COLUMN SCHARA CHAR;

----------------------------テーブル作成--------------------------*/

-- ユーザー情報
CREATE TABLE USERS(
	USER_NO INT(8) AUTO_INCREMENT,
	G_ACCOUNT CHAR(30),
	PASS VARCHAR(256) NOT NULL,
	MAIL VARCHAR(256) NOT NULL,
	POST_NO CHAR(7) NOT NULL,
	LNG VARCHAR(10) NOT NULL,
	UNIQUE(MAIL),
	PRIMARY KEY(USER_NO)
);

-- 判別履歴
CREATE TABLE HISTORY(
	USER_NO INT,
	J_TYPE VARCHAR(10) NOT NULL,
	J_DATA INT NOT NULL,
	FOREIGN KEY(USER_NO) REFERENCES USERS(USER_NO)
);


-- 通知設定
CREATE TABLE ITEMLIST(
	USER_NO INT,
	T_SET VARCHAR(4) NOT NULL,
	TIME VARCHAR(3) NOT NULL,
	FOREIGN KEY(USER_NO) REFERENCES USERS(USER_NO)
);

-- 住所一覧
CREATE TABLE ADDRESS(
	USER_NO INT,
	CITY VARCHAR(8) NOT NULL,
	WARD VARCHAR(5) NOT NULL,
	TOWN VARCHAR(5) NOT NULL,
	CHOM VARCHAR(5) NOT NULL,
	STREET VARCHAR(30) NOT NULL,
	INF VARCHAR(256) NOT NULL,
	FOREIGN KEY(USER_NO) REFERENCES USERS(USER_NO)
);
	

-- ごみの捨て方マニュアル
CREATE TABLE MANUALS(
	ITEM_NO INT(8) AUTO_INCREMENT,
	WORD VARCHAR(2) NOT NULL,
	GARBAGE VARCHAR(50) NOT NULL,
	G_TYPE VARCHAR(10) NOT NULL,
	CONTENTS VARCHAR(256) NOT NULL,
	PRIMARY KEY(ITEM_NO)
);

-- ごみ収集日
CREATE TABLE BIN_DAY(
	BIN_NO INT(8) AUTO_INCREMENT,
	CITY VARCHAR(8) NOT NULL,
	WARD VARCHAR(5) NOT NULL,
	TOWN VARCHAR(5) NOT NULL,
	CHOM VARCHAR(5) NOT NULL,
	STREET VARCHAR(5) NOT NULL,
	INF VARCHAR(30),
	RUDDISH VARCHAR(10) NOT NULL,
	DAYS VARCHAR(10) NOT NULL,
	C_TIME VARCHAR(10) NOT NULL,
	PRIMARY KEY(BIN_NO)
);


-------------------------必須------------------------------*/
--クライアント側のファイル読み込みを許可しつつログインする
mysql --local-infile=1 -u guest -p gomimi

--データ挿入を実行する前に管理者権限で以下のコマンドを実行
--一時的にサーバ側のファイル読み込みを許可する
SET GLOBAL local_infile = 1;
SHOW GLOBAL VARIABLES LIKE 'local_infile';

-- ごみ収集日データ挿入
LOAD DATA LOCAL INFILE 'C:/Users/2230298/Documents/system_dep/mysql_data.csv' -- CSVファイルのフルパスを指定
INTO TABLE BIN_DAY
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n' 
IGNORE 1 ROWS 
(`CITY`, `WARD`, `TOWN`, `CHOM`,  `STREET`,  `INF`, `RUDDISH`, `DAYS`, `C_TIME`); 

-- ごみ収集日データ挿入
LOAD DATA LOCAL INFILE 'C:/Users/2230298/Documents/system_dep/garbage_list.csv' -- CSVファイルのフルパスを指定
INTO TABLE MANUALS
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n' 
IGNORE 1 ROWS 
(@col1, @col2, @col3, @col4)
SET
	WORD = @col1,
	GARBAGE = @col2,
	G_TYPE = @col3,
	CONTENTS = @col4;

select*from manual where word="あ";
-------------------------sample data------------------------------*/

insert into USERS (G_ACCOUNT,PASS,MAIL,POST_NO,LNG) value ('apapa.22@gmail.com','2230298','大阪市北区中崎西2丁目3-35','333111','ja');


------緊急削除-------*/
DROP TABLE USERS;
DROP TABLE HISTORY;
DROP TABLE ITEMLIST;
DROP TABLE ADDRESS;
DROP TABLE MANUAL;
DROP TABLE BIN_DAY;