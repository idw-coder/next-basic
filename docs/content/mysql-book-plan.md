# MySQL教科書（content/books/mysql）の章立て計画

**この本に章を追加する前に必ず読むこと。** 全13章の設計が決まっており、公開済みの章には**最終的な `order` があらかじめ振られている**。
思いついた順に連番を振ると並びが壊れるので、必ず下の表の番号を使う。

## 全13章と order

| order | 章 | ファイル | 状態 |
| --- | --- | --- | --- |
| 1 | MySQLとは何か — クライアント/サーバー型データベースと接続のコスト | `what-is-mysql.mdx` | 公開済み |
| 2 | 接続を確認する — mysqlコマンド・SHOW PROCESSLIST・wait_timeout | `connect-and-max-connections.mdx` | 公開済み |
| 3 | テーブルを作ってデータを入れる（CREATE TABLE / AUTO_INCREMENT / INSERT / UPDATE / DELETE） | `create-table-and-write-data.mdx` | 公開済み |
| 4 | データ型の選び方（INT / DECIMAL / VARCHAR / DATETIME / JSON） | `data-types.mdx` | 公開済み |
| 5 | 文字コードと照合順序（utf8mb4・collation） | `character-sets-and-collations.mdx` | 公開済み |
| 6 | ストレージエンジンとInnoDB（クラスタ化インデックス） | `innodb-and-storage-engines.mdx` | 公開済み |
| 7 | インデックスとEXPLAIN | `indexes-and-explain.mdx` | 公開済み |
| 8 | トランザクションとロック（分離レベル・ギャップロック） | `transactions-and-locks.mdx` | 公開済み |
| 9 | MySQLの方言（ON DUPLICATE KEY UPDATE / GROUP_CONCAT / ウィンドウ関数） | `mysql-specific-sql.mdx` | 公開済み |
| 10 | Node.jsからMySQLに接続する — mysql2のコネクションプール入門 | `nodejs-mysql2-connection-pool.mdx` | 公開済み |
| 11 | スキーマ変更とマイグレーション（ALTER TABLE / オンラインDDL） | `schema-migrations-and-online-ddl.mdx` | 公開済み |
| 12 | ユーザーと権限（GRANT / 最小権限） | `users-roles-and-privileges.mdx` | 公開済み |
| 13 | 運用（mysqldump / スロークエリログ / my.cnf） | `backup-slow-query-log-and-configuration.mdx` | 公開済み |

全13章を公開済み。MySQLへの接続からテーブル設計、クエリ改善、Node.jsでの利用、マイグレーション、権限、バックアップと監視まで連続して読める。

章と章のあいだに差し込みたくなった場合は、既存の `order` を動かさず**小数**を使う（`order: 5.5`）。`chapterLabel` を添えれば読者向けの表示も自然にできる。javascript本の `7.1`〜`7.5` が実例。

## この本のスコープ

**SQLの文法そのものは書かない。** `SELECT` / `WHERE` / `JOIN` / `GROUP BY` / サブクエリ / 正規化は [SQLとデータベースの基礎](../../content/books/sql-basics/) の担当。
この本はMySQL固有のことだけを扱う。SQLite本が `sql-basics` と切り分けているのと同じ型で、各章の冒頭に次の形の宣言を入れる。

> `SELECT` や `JOIN` の書き方は、[SQLとデータベースの基礎](/books/sql-basics/select-basics)で学んだ内容がそのまま通用します。この章では、**MySQLならではの書き方**だけに絞って扱います。

例外は3章と11章。INSERT / UPDATE / DELETE / ALTER は `sql-basics` にも他のどの本にも独立した章がないため、重複ではなく穴埋めになる。MySQL構文（`AUTO_INCREMENT`、`ON UPDATE CURRENT_TIMESTAMP`）で書けば固有性も保てる。

## 章立ての根拠

『MySQL徹底入門 第5版 MySQL 8.4 LTS対応』とMySQL 8.4公式リファレンスの構成を調べたうえで決めた。

- **踏襲した点** — 両者ともデータ型・文字コード・ユーザー管理・InnoDB・言語からの利用を独立章にしている。ここは同じ切り方にした
- **落とした点** — レプリケーション、Group Replication、NDB Clusterは、Web開発者向けの通読教科書には過剰
- **意図的に変えた点** — 文字コードを前倒しした（5章）。定番書は第11章あたりに置くが、あれは「引かれる本」の並び。通読前提のこの本で後ろに置くと、序盤で文字化けに当たった読者が待たされる

## 執筆時の注意

- 順序に依存する言い回し（「次の章では」「前章の」）を使わない。章タイトルへのリンクで書く。orderが動いても壊れないため
- 数値（`max_connections` など）は動いているMySQLコンテナで実測して裏を取る。`docker exec mysql mysql -e "SHOW VARIABLES LIKE '...'"`
- その他の執筆ルールは [docs/books.md](../books.md) に従う
