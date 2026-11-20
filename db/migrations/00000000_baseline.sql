-- 元のテーブル定義（ベースライン）。空のDBに、このあと続くマイグレーションより先に流す。
--
-- 20261018_create_session.sql より前の状態を表す。続けて
--   20261018_create_session.sql → 20261024_drop_unused_user_columns.sql → 20261025_add_user_microsoft_id.sql
-- をファイル名順に流すと、今の本番・ローカルと同じ定義になる。
--
-- 作り方（2026-11-20）:
--   ローカルDB（20261025まで適用済み）を mysqldump --no-data で取り出し、次の手を加えた。
--   - DROP TABLE IF EXISTS を外した（既存DBに流すとテーブルが消えるため）。CREATE TABLE は IF NOT EXISTS なし。
--     既存DBに誤って流しても、最初の CREATE TABLE がエラーになって止まる
--   - AUTO_INCREMENT=<n> を外した
--   - 外部キーの参照先が先に来るよう並べ替えた（FOREIGN_KEY_CHECKS=0 に頼らない）
--   - user を 20261018 より前の形に戻した。20261024 で消した password・emailVerified を足し、
--     20261025 で足した microsoftId を外した。2列の定義は旧 Express（TypeORM）の User エンティティと
--     マイグレーション AddEmailVerifiedToUser1774088227961 から復元した
--   - session（20261018 で作成）を外した
--   - 使っていない旧 Express のテーブルを外した:
--       migrations（TypeORM のマイグレーション履歴）、note（旧ノート機能）、tag・tagging（quiz_tag・quiz_tagging の前身。0行）
--     quiz_answers は今も回答履歴に使っている（src/lib/server/quizHistory.ts）ので含めた
--
-- インデックス・外部キーの名前（IDX_xxxx / FK_xxxx）は TypeORM が付けたもの。本番と照合しやすいよう、そのまま残している。
--
-- 本番との照合（2026-11-20）: 本番の mysqldump --no-data をテーブルごとのハッシュで比べ、
-- quiz_tag の列の順番だけが違っていた（本番は id が先頭、ローカルは末尾）。このファイルは本番に合わせている。
-- ほかの9テーブル（session と、20261025 まで適用後の user を含む）は本番・ローカルとも一致した。
--
-- 適用方法（新しいDBを作るときだけ。本番・既存のローカルDBには流さない）:
--   docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < 00000000_baseline.sql

SET NAMES utf8mb4;

CREATE TABLE `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `emailVerified` tinyint NOT NULL DEFAULT '0',
  `stripeCustomerId` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`),
  UNIQUE KEY `IDX_470355432cc67b2c470c30bef7` (`googleId`),
  UNIQUE KEY `IDX_0bfe583759eb0305b60117be84` (`stripeCustomerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- role は user の列ではなく、metaKey = 'role' の行で持つ
CREATE TABLE `user_meta` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `metaKey` varchar(255) NOT NULL,
  `metaValue` text,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_02f561e353503b5c499429ba59` (`userId`,`metaKey`),
  KEY `IDX_45d06923e0538c0f22d3f7add6` (`metaKey`),
  CONSTRAINT `FK_f6c72c83c1787aee12530dbcd05` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- userId の外部キーは ON DELETE なし（NO ACTION）。決済履歴があるユーザーは物理削除できない
CREATE TABLE `payment` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned NOT NULL,
  `stripeSessionId` varchar(255) NOT NULL,
  `stripePaymentIntentId` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL,
  `amount` int unsigned NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'jpy',
  `description` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_4f1a3ee2c5a576a7588bd4cf7e` (`stripeSessionId`),
  KEY `FK_b046318e0b341a7f72110b75857` (`userId`),
  CONSTRAINT `FK_b046318e0b341a7f72110b75857` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- author_id に外部キーはない
CREATE TABLE `quiz_category` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `author_id` bigint unsigned NOT NULL,
  `description` text,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_b130831eb4f86dea4f85445a4a` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `quiz` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(255) NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `author_id` bigint unsigned NOT NULL,
  `question` text NOT NULL,
  `explanation` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_80e0595aa5572aca26e681ee1e` (`slug`),
  KEY `FK_ac89194b30919dc6d8cab497ac8` (`category_id`),
  CONSTRAINT `FK_ac89194b30919dc6d8cab497ac8` FOREIGN KEY (`category_id`) REFERENCES `quiz_category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `quiz_choice` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint unsigned NOT NULL,
  `choice_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `display_order` int DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_4211068b2f029f0ef251eb46c3c` (`quiz_id`),
  CONSTRAINT `FK_4211068b2f029f0ef251eb46c3c` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 列の順番は本番に合わせた（id が先頭）。ローカルDBは id が末尾だが、列名を指定して INSERT しているので動作は変わらない
CREATE TABLE `quiz_tag` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `slug` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_c12cecb0597649e3599afbf409` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 外部キーは2本とも ON DELETE なし（NO ACTION）。quiz を物理削除する前に、ここの行を消す必要がある
CREATE TABLE `quiz_tagging` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint unsigned NOT NULL,
  `quiz_tag_id` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_3ed9e5fe091dd9027336d9ce00` (`quiz_id`,`quiz_tag_id`),
  KEY `FK_1b008d14e210fee4f9c9d8d63ff` (`quiz_tag_id`),
  CONSTRAINT `FK_1b008d14e210fee4f9c9d8d63ff` FOREIGN KEY (`quiz_tag_id`) REFERENCES `quiz_tag` (`id`),
  CONSTRAINT `FK_add50a42fad1c42a2e4e24410e2` FOREIGN KEY (`quiz_id`) REFERENCES `quiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- quiz_id・category_id に外部キーはない（user_id だけ ON DELETE CASCADE）
CREATE TABLE `quiz_answers` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `quiz_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `is_correct` tinyint NOT NULL,
  `answered_at` datetime NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_92d75116e3d9fc00185a8ef696` (`user_id`,`quiz_id`,`answered_at`),
  CONSTRAINT `FK_75b4c4f7147275949808e703e9e` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
