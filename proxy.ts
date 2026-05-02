import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const redis = new Redis({
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  url: process.env.UPSTASH_REDIS_REST_URL!,
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
});

const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
});

export async function proxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const pathname = new URL(request.url).pathname;

  if (pathname.startsWith('/api/auth')) {
    const { success } = await authRatelimit.limit(`auth_${ip}`);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  if (pathname.startsWith('/api')) {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
