-- パスワードログイン廃止（Googleログインのみ）で使われなくなった列と行を削除する。
--
-- - user.password: パスワードログイン用。廃止後は新しく入ることがない
-- - user.emailVerified: Express時代のメール確認用。Next.js側では値を書くだけで、どこも読んでいなかった
-- - user_meta の emailVerificationToken / emailVerificationExpires: Express時代の確認メール用トークン
--
-- 前提: これらを参照しないコード（a6101cd）が本番にデプロイ済みであること。
-- 先にこのSQLを流すと、古いコードの SELECT u.emailVerified がエラーになる。
--
-- 本番適用済み（2026-10-24）。本番の user_meta に emailVerification〜 の行はなく、DELETEは0件だった。
--
-- 適用時は mysql コンテナの MYSQL_ROOT_PASSWORD・MYSQL_PASSWORD が実際のパスワードと合っておらず、
-- nextjs コンテナの DB_USER・DB_PASSWORD（appuser）を借りて接続した:
--   U=$(docker exec nextjs printenv DB_USER); P=$(docker exec nextjs printenv DB_PASSWORD)
-- 同日、rootのパスワードを再設定し、db/.env を実際の値にそろえた。今後はコンテナの環境変数で接続できる:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < xxx.sql
--
-- ALTER TABLE は暗黙にコミットされ、ロールバックできない。流す前にバックアップを取ること:
--   docker exec -e MYSQL_PWD="$P" mysql mysqldump -u"$U" --single-transaction --no-tablespaces myapp > ~/backup_myapp_YYYYMMDD.sql
--
-- 適用方法（本番。手動で1回だけ。SQLファイルはサーバーにないので、標準入力で渡すか -e で中身を渡す）:
--   docker exec -i -e MYSQL_PWD="$P" mysql mysql -u"$U" myapp < 20261024_drop_unused_user_columns.sql

DELETE FROM user_meta
WHERE metaKey IN ('emailVerificationToken', 'emailVerificationExpires');

ALTER TABLE `user`
  DROP COLUMN `password`,
  DROP COLUMN `emailVerified`;
