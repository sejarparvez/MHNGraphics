import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  buildCsrfCookie,
  CSRF_COOKIE,
  generateCsrfToken,
  getCookieValue,
} from '@/lib/csrf';
import { authOptions } from '../auth/[...nextauth]/Options';

/**
 * GET /api/csrf-token
 *
 * Issues a signed CSRF token to authenticated users.
 * - Reuses the existing token if it is still present in the request cookie
 *   (avoids unnecessary token churn on repeated calls)
 * - Otherwise generates a fresh token, sets it as a cookie, and returns it
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Reuse existing token if already set (client called this more than once)
  const existingToken = getCookieValue(req.headers.get('cookie'), CSRF_COOKIE);
  if (existingToken) {
    return Response.json({ csrfToken: existingToken }, { status: 200 });
  }

  // No valid token yet — generate a fresh one
  const token = generateCsrfToken();

  return Response.json(
    { csrfToken: token },
    {
      status: 200,
      headers: { 'Set-Cookie': buildCsrfCookie(token) },
    },
  );
}
