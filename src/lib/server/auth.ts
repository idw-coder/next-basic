import { findSessionUser, getSessionToken } from '@/lib/server/session';

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

/**
 * ログイン中のユーザーを返す。ログインしていなければ AuthError（401）を投げる。
 *
 * session cookie のトークンで DB の session 行を引き、user と role を返す。
 * role を毎回 DB から読むので、管理画面での変更やユーザー削除は次のリクエストから反映される。
 *
 * 以前の JWT（Authorization ヘッダー）は受け付けない。発行済みの JWT は無効になり、
 * 切り替え前からログインしていた人は一度ログインし直す（2026-10 に session cookie へ移行）。
 */
export async function verifyAuth(request: Request): Promise<AuthUser> {
  const sessionToken = getSessionToken(request);
  const user = sessionToken ? await findSessionUser(sessionToken) : null;

  if (!user) {
    throw new AuthError('ログインしていません');
  }

  return user;
}

export function requireRole(user: AuthUser, minRole: keyof typeof ROLE_ORDER): void {
  const userLevel = ROLE_ORDER[user.role] ?? -1;
  const minLevel = ROLE_ORDER[minRole] ?? -1;

  if (userLevel < minLevel) {
    throw new AuthError('Forbidden', 403);
  }
}
