# db/migrations

DBのテーブル定義の変更を、SQLファイルで積み上げて管理する。ツールは使わず、手動で流す。

## 流す順番

ファイル名順。新しいDBを作るときは `00000000_baseline.sql` から全部を順に流す。既存のDBには、まだ適用していないものだけを流す。

```sh
docker exec -i mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp' < <ファイル名>
```

## 適用済みかどうかの確認

`schema_migrations` テーブルに、適用したファイルの version（ファイル名の先頭の数字）が1行ずつ入っている。

```sh
docker exec mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" myapp -e "SELECT * FROM schema_migrations"'
```

## 新しいマイグレーションを書くとき

- ファイル名は `<version>_<内容>.sql`。version は数字だけで、既存のものと重ならないようにする。同じ日に2本作るときは `YYYYMMDDHHMMSS`（14桁）にする
- **ファイルの末尾に、自分の version を記録する `INSERT` を書く。** 途中でエラーになれば最後まで進まないので、記録も残らない

```sql
INSERT INTO `schema_migrations` (`version`) VALUES ('20261201');
```

- `ALTER TABLE` は暗黙にコミットされ、ロールバックできない。本番に流す前にバックアップを取る

## dbmate に移るとき

`schema_migrations` の定義は dbmate と同じなので、テーブルはそのまま使える。各ファイルの先頭に `-- migrate:up`、末尾に `-- migrate:down`（中身は空でよい）を足し、末尾の `INSERT` を消す（dbmate が記録する）。
