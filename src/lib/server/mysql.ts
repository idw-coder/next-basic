import mysql, { type Pool } from 'mysql2/promise';

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
