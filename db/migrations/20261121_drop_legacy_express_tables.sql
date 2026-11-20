-- 旧 Express（TypeORM）時代の、今は使っていないテーブルを削除する。
--
-- - migrations: TypeORM のマイグレーション履歴。今は schema_migrations で記録している
-- - note: 旧ノート機能。next-basic には機能がなく、どこからも参照していない
-- - tag・tagging: quiz_tag・quiz_tagging の前身。どこからも参照していない
--
-- 本番には migrations・note しかなく（tag・tagging はもともとない）、ローカルには4つともあったため、
-- DROP TABLE IF EXISTS で書いている。どちらのDBでもエラーにならない。
-- 00000000_baseline.sql にはこの4つを含めていないので、新しいDBにはもともとない。
--
-- version を 20261121 にしたのは、同じ日の 20261120_create_schema_migrations.sql より後に並べるため
-- （'20261120' の後ろに数字を足すと、ファイル名順で '_' より前に来てしまう）。
--
-- 本番: 2026-11-20 に DROP TABLE note; DROP TABLE migrations; を手で実行済み（バックアップなし。note は0行、migrations は2行だった）。
--       本番ではこのファイルを流さず、末尾の INSERT だけを実行する。
-- ローカル: 2026-11-20 に適用済み（note のテスト用の6行も削除した）。
--
-- 適用方法（ローカル。手動で1回だけ）:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < 20261121_drop_legacy_express_tables.sql

DROP TABLE IF EXISTS `tagging`;
DROP TABLE IF EXISTS `tag`;
DROP TABLE IF EXISTS `note`;
DROP TABLE IF EXISTS `migrations`;

INSERT INTO `schema_migrations` (`version`) VALUES ('20261121');
