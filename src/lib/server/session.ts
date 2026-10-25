import { createHash, randomBytes } from 'crypto';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

import type { AuthUser } from '@/lib/server/auth';
import { getMysqlPool } from '@/lib/server/mysql';

// ログイン状態を session テーブルで管理する。
// テーブル定義は db/migrations/20261018_create_session.sql。
//
// cookie にはランダムなトークン本体を入れ、DB の session.id にはその SHA-256 ハッシュだけを保存する。
// DB が漏れても、ハッシュから cookie のトークンは復元できない。

export const SESSION_COOKIE_NAME = 'session';

// JWT の expiresIn: '7d' と同じ長さ。cookie の maxAge にもこの値を使う
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * session cookie の属性。ログイン（Google・今後のMicrosoft）とログアウトで同じ値を使う。
 * - httpOnly: 画面の JavaScript から読めないようにする（XSS で盗まれない）
 * - sameSite: 'lax': 他サイトからの POST には cookie を付けない（CSRF 対策）
 * - secure: 本番は https でしか送らない。ローカルの http://localhost でも動くよう、本番だけに付ける
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const;

interface SessionUserRow extends RowDataPacket {
  userId: number | string;
  email: string;
  role: string | null;
}

/**
 * リクエストの Cookie ヘッダーから session cookie の値を取り出す。なければ null。
 */
export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key === SESSION_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join('=')) || null;
    }
  }

  return null;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * session 行を1つ作り、cookie に入れるトークン本体を返す。
 * トークン本体はここで返したら捨てる（DB には保存しない）。
 */
export async function createSession(userId: number | string): Promise<string> {
  const token = randomBytes(32).toString('base64url');

  // 期限は DB の時計で決める。判定（findSessionUser）も DB の NOW() で行うため、
  // アプリと DB でタイムゾーンや時計がずれていても食い違わない
  await getMysqlPool().query<ResultSetHeader>(
    `
      INSERT INTO session (id, userId, expiresAt)
      VALUES (?, ?, NOW(6) + INTERVAL ? SECOND)
    `,
    [hashToken(token), userId, SESSION_MAX_AGE_SECONDS],
  );

  return token;
}

/**
 * cookie のトークンから、ログイン中のユーザーを引く。
 * 行がない・期限切れ・ユーザーが削除済み（deletedAt あり）のときは null。
 * role は毎回 user_meta から読むので、管理画面での変更が次のリクエストから反映される。
 */
export async function findSessionUser(token: string): Promise<AuthUser | null> {
  if (!token) return null;

  const [rows] = await getMysqlPool().query<SessionUserRow[]>(
    `
      SELECT
        u.id AS userId,
        u.email,
        role_meta.metaValue AS role
      FROM session s
      INNER JOIN \`user\` u
        ON u.id = s.userId
      LEFT JOIN user_meta role_meta
        ON role_meta.userId = u.id
       AND role_meta.metaKey = 'role'
      WHERE s.id = ?
        AND s.expiresAt > NOW(6)
        AND u.deletedAt IS NULL
      LIMIT 1
    `,
    [hashToken(token)],
  );

  const row = rows[0];
  if (!row) return null;

  return {
    userId: Number(row.userId),
    email: row.email,
    // JWT を発行していたとき（signToken）と同じく、role の行がなければ 'user' 扱い
    role: row.role || 'user',
  };
}

/**
 * ログアウト用。トークンに対応する session 行を消す。行がなくてもエラーにしない。
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;

  await getMysqlPool().query<ResultSetHeader>('DELETE FROM session WHERE id = ?', [
    hashToken(token),
  ]);
}
