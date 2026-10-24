-- ログイン状態をDBで管理するための session テーブル。
--
-- JWT（署名の検証だけでDBを見ない）からの切り替え用。JWTだと
-- role変更・ユーザー削除・ログアウトが、トークンの期限（7日）まで反映されなかった。
--
-- id はトークン本体ではなく、その SHA-256 ハッシュ（16進64文字）。
-- DBが漏れても、ハッシュからcookieのトークンは復元できない。
--
-- userId の外部キーは ON DELETE CASCADE。ユーザー行を物理削除したらセッションも消える。
-- 論理削除（user.deletedAt）はアプリ側で弾く。
--
-- 適用方法（本番。手動で1回だけ）:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < 20261018_create_session.sql

CREATE TABLE IF NOT EXISTS `session` (
  `id` char(64) NOT NULL,
  `userId` bigint UNSIGNED NOT NULL,
  `expiresAt` datetime(6) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  INDEX `IDX_session_userId` (`userId`),
  -- 期限切れ行の掃除（DELETE ... WHERE expiresAt < NOW()）用
  INDEX `IDX_session_expiresAt` (`expiresAt`),
  CONSTRAINT `FK_session_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
