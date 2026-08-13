import mysql, { type Pool } from 'mysql2/promise';

// このファイルは process.env しか見ない。.env ファイルは直接読まない。
// 環境変数がどこから来るかは実行環境ごとに異なる。
//
//   本番   : docker compose が env_file: ./nextjs/.env を読み、
//            コンテナの環境変数として渡す（DB_USER / DB_PASSWORD）。
//            DB_HOST などは docker-compose.prod.yml の environment: 側。
//   ローカル: Next.js が .env.local を自動で読み込む。
//
// つまり .env →（compose または Next.js）→ process.env → ここ、という流れ。
// 経路が違うだけで結果は同じなので、このコードは両方の環境で共通に動く。
//
// 認証情報を compose に直書きしないのは、それが git 追跡下に入るため。
// 詳細は docs/technical/todo.md を参照。

const globalForMysql = globalThis as typeof globalThis & {
  mysqlPool?: Pool;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for MySQL connection`);
  }
  return value;
}

function getOptionalNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getMysqlPool(): Pool {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      host: getRequiredEnv('DB_HOST'),
      port: getOptionalNumberEnv('DB_PORT', 3306),
      user: getRequiredEnv('DB_USER'),
      password: process.env.DB_PASSWORD ?? '',
      database: getRequiredEnv('DB_NAME'),
      waitForConnections: true,
      connectionLimit: getOptionalNumberEnv('DB_CONNECTION_LIMIT', 10),
    });
  }

  return globalForMysql.mysqlPool;
}
