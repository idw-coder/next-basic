import { NextResponse } from 'next/server';

import { AuthError, requireRole, verifyAuth } from '@/lib/server/auth';
import { getAdminUsers } from '@/lib/server/users';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = verifyAuth(request);
    requireRole(user, 'admin');

    const result = await getAdminUsers(request.headers.get('authorization'));

    return NextResponse.json(
      { users: result.users },
      {
        headers: result.source !== 'db' ? { 'x-next-api-fallback': result.source } : undefined,
      },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('Failed to fetch users.', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
