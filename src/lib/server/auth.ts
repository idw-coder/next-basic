import jwt from 'jsonwebtoken';

const ROLE_ORDER: Record<string, number> = {
  user: 0,
  editor: 1,
  admin: 2,
};

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
}

export class AuthError extends Error {
  status: 401 | 403;

  constructor(message: string, status: 401 | 403 = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

// JWTの署名・検証に使う秘密鍵の最低文字数。
// `openssl rand -base64 48` で生成すると64文字になる。
const JWT_SECRET_MIN_LENGTH = 32;

/**
 * JWTの署名・検証に使う秘密鍵（JWT_SECRET）を返す。
 *
 * 以前は `process.env.JWT_SECRET || 'your-super-secret-key'` とフォールバックしていた。
 * この文字列はソースに書かれていて誰でも知っているため、本番で設定し忘れると
 * 誰でも role: 'admin' のトークンを偽造でき、管理APIを操作できてしまう。
 * 設定漏れのまま黙って動き続けないよう、未設定・空文字・短すぎる値はエラーにする。
 *
 * モジュールのトップレベルではなく呼び出し時に評価する。
 * トップレベルで読むと、JWT_SECRETのない環境（CIの next build など）でビルドが落ちるため。
 *
 * 値を変えると、発行済みのトークンはすべて無効になり全員ログアウトされる（想定どおり）。
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  if (secret.length < JWT_SECRET_MIN_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${JWT_SECRET_MIN_LENGTH} characters`);
  }

  return secret;
}

function getBearerToken(request: Request): string {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('認証トークンがありません');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    throw new AuthError('認証トークンがありません');
  }

  return token;
}

export function verifyAuth(request: Request): AuthUser {
  // try の外で取得する。中で取得すると、JWT_SECRETの設定漏れが下の catch で
  // 「トークンが無効です（401）」に化けて気づけないため。500として表に出す。
  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(getBearerToken(request), secret) as Partial<AuthUser>;

    if (decoded.userId == null || typeof decoded.role !== 'string') {
      throw new AuthError('トークンが無効です');
    }

    return {
      userId: Number(decoded.userId),
      email: typeof decoded.email === 'string' ? decoded.email : '',
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('トークンが無効です');
  }
}

export function requireRole(user: AuthUser, minRole: keyof typeof ROLE_ORDER): void {
  const userLevel = ROLE_ORDER[user.role] ?? -1;
  const minLevel = ROLE_ORDER[minRole] ?? -1;

  if (userLevel < minLevel) {
    throw new AuthError('Forbidden', 403);
  }
}
