import { Quiz } from '@/entities/Quiz';
import { QuizCategory } from '@/entities/QuizCategory';
import { QuizChoice } from '@/entities/QuizChoice';
import { QuizTag } from '@/entities/QuizTag';
import { QuizTagging } from '@/entities/QuizTagging';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'mysql',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rootpassword',
  database: process.env.DB_NAME || 'myapp',
  charset: 'utf8mb4',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error'] : false,
  entities: [Quiz, QuizCategory, QuizChoice, QuizTag, QuizTagging],
});

// HMR で接続が増殖しないよう globalThis にキャッシュ
const globalForTypeORM = globalThis as unknown as {
  __typeorm_datasource?: DataSource;
};

export async function getDataSource(): Promise<DataSource> {
  if (globalForTypeORM.__typeorm_datasource?.isInitialized) {
    return globalForTypeORM.__typeorm_datasource;
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  globalForTypeORM.__typeorm_datasource = AppDataSource;
  return AppDataSource;
}
