import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { type NextRequest, NextResponse } from 'next/server';

const redis = new Redis({
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  url: process.env.UPSTASH_REDIS_REST_URL!,
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function createRateLimiter(
  requests: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  });
}

export async function checkRateLimit(
  req: NextRequest,
  requests: number,
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  identifier?: string,
) {
  const ratelimit = createRateLimiter(requests, window);
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = identifier ? `${identifier}_${ip}` : ip;

  const { success } = await ratelimit.limit(key);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  return null;
}
