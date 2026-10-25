-- Microsoftログイン用に user.microsoftId 列を追加する。
--
-- 値は MSAL の account.homeAccountId（`<oid>.<tid>`、ホームテナント基準）。
-- oid はテナントごとに別の値になるため、oid 単体ではキーにしない。
--
-- Microsoftログインでは、メールアドレスで既存ユーザーに紐付けない。
-- Microsoft の email / preferred_username はテナント管理者が変えられ、
-- 公式ドキュメントでも認可やユーザーの特定に使わないよう書かれている（使うと他人のアカウントを乗っ取れる）。
-- そのため、この列で見つからなければ新規ユーザーになる。
--
-- NULL は UNIQUE 制約にかからないので、Googleだけのユーザー（NULL）が何人いても問題ない。
--
-- ALTER TABLE は暗黙にコミットされ、ロールバックできない。流す前にバックアップを取ること:
--   docker exec mysql sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --single-transaction --no-tablespaces myapp' > ~/backup_myapp_YYYYMMDD.sql
--
-- 適用方法（本番。手動で1回だけ。SQLファイルはサーバーにないので、標準入力で渡す）:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < 20261025_add_user_microsoft_id.sql
--
-- 前提: このSQLを先に流してよい（列が増えるだけで、今のコードは SELECT u.* をしていないため影響しない）。

ALTER TABLE `user`
  ADD COLUMN `microsoftId` varchar(255) DEFAULT NULL AFTER `googleId`,
  ADD UNIQUE KEY `IDX_user_microsoftId` (`microsoftId`);
