-- マイグレーションの適用履歴を記録する schema_migrations テーブルを作る。
--
-- 定義は dbmate（素のSQLファイルを使うマイグレーションツール）が MySQL で作るテーブルと同じにしている:
--   create table if not exists schema_migrations (version varchar(128) primary key)
-- version には、ファイル名の先頭の数字（20261120_create_schema_migrations.sql なら '20261120'）を入れる。
-- 後から dbmate に移る場合、このテーブルはそのまま使える。
--
-- 今はツールを使わないので、各マイグレーションの末尾に自分の version を INSERT する（書き方は README.md）。
-- このファイルより前の4本（00000000〜20261025）には INSERT がないため、ここでまとめて記録する。
-- 空のDBでもファイル名順に流せば、この時点で4本とも適用済みなので、記録と実際が一致する。
--
-- 適用済みかどうかの確認:
--   docker exec mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp -e "SELECT * FROM schema_migrations"'
--
-- 適用方法（本番・ローカルとも手動で1回だけ。SQLファイルはサーバーにないので、標準入力で渡す）:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < 20261120_create_schema_migrations.sql
--
-- CREATE TABLE IF NOT EXISTS と INSERT IGNORE なので、2回流してもエラーにならず、行も増えない。

CREATE TABLE IF NOT EXISTS `schema_migrations` (
  `version` varchar(128) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `schema_migrations` (`version`) VALUES
  ('00000000'),
  ('20261018'),
  ('20261024'),
  ('20261025'),
  ('20261120');
