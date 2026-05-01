import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

type Role = 'ADMIN' | 'MODERATOR' | 'USER';

export async function requireAuth(
  req: NextRequest,
  roles?: Role[],
): Promise<NextResponse | null> {
  const secret = process.env.NEXTAUTH_SECRET;
  const token = await getToken({ req, secret });

  if (!token?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (roles && !roles.includes(token.role as Role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
