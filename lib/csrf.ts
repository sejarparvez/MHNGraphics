import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

// ─── Token Generation ────────────────────────────────────────────────────────

/**
 * Generates a signed CSRF token using HMAC-SHA256.
 * Format: <random>.<timestamp>.<hmac-signature>
 * Timestamp is embedded so we can verify expiry server-side.
 */
export function generateCsrfToken(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret) throw new Error('CSRF_SECRET environment variable is not set');

  const random = randomBytes(32).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = `${random}.${timestamp}`;
  const signature = createHmac('sha256', secret).update(payload).digest('hex');

  return `${payload}.${signature}`;
}

// ─── Token Verification ──────────────────────────────────────────────────────

/**
 * Verifies:
 * 1. Token has correct format
 * 2. HMAC signature is valid
 * 3. Token has not expired (server-side expiry check)
 */
function verifyCsrfToken(token: string): boolean {
  const secret = process.env.CSRF_SECRET;
  if (!secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [random, timestamp, signature] = parts;

  // Check expiry server-side
  const issuedAt = parseInt(timestamp, 10);
  if (Number.isNaN(issuedAt)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (now - issuedAt > TOKEN_EXPIRY_SECONDS) return false;

  // Verify HMAC signature
  const payload = `${random}.${timestamp}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex'),
    );
  } catch {
    return false;
  }
}

// ─── Cookie Parser ───────────────────────────────────────────────────────────

/**
 * Robust cookie parser that handles:
 * - Whitespace around keys and values
 * - Values containing '=' (e.g. base64)
 * - Empty or malformed cookie strings
 */
export function getCookieValue(
  cookieHeader: string | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;

  for (const chunk of cookieHeader.split(';')) {
    const eqIndex = chunk.indexOf('=');
    if (eqIndex === -1) continue;

    const key = chunk.slice(0, eqIndex).trim();
    if (key !== name) continue;

    const value = chunk.slice(eqIndex + 1).trim();
    return value || null;
  }

  return null;
}

// ─── Main Validator ──────────────────────────────────────────────────────────

/**
 * Validates the double-submit cookie pattern:
 * 1. Cookie token must exist, have a valid HMAC, and not be expired
 * 2. Header token must match the cookie token exactly (constant-time)
 *
 * Returns a 403 Response if validation fails, or null if it passes.
 */
export function validateCsrf(req: Request): Response | null {
  const cookieToken = getCookieValue(req.headers.get('cookie'), CSRF_COOKIE);
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) {
    return Response.json({ message: 'CSRF token missing' }, { status: 403 });
  }

  if (!verifyCsrfToken(cookieToken)) {
    return Response.json(
      { message: 'Invalid or expired CSRF token' },
      { status: 403 },
    );
  }

  try {
    const cookieBuf = Buffer.from(cookieToken);
    const headerBuf = Buffer.from(headerToken);

    if (
      cookieBuf.length !== headerBuf.length ||
      !timingSafeEqual(cookieBuf, headerBuf)
    ) {
      return Response.json({ message: 'CSRF token mismatch' }, { status: 403 });
    }
  } catch {
    return Response.json({ message: 'CSRF validation error' }, { status: 403 });
  }

  return null; // ✅ passed
}

// ─── Cookie Builder ──────────────────────────────────────────────────────────

/**
 * Builds the Set-Cookie header value for the CSRF token.
 * HttpOnly: false — JS must read this for the double-submit pattern.
 */
export function buildCsrfCookie(token: string): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${CSRF_COOKIE}=${token}`,
    'Path=/',
    'SameSite=Strict',
    `Max-Age=${TOKEN_EXPIRY_SECONDS}`,
  ];
  if (isProd) parts.push('Secure');
  return parts.join('; ');
}

// ─── Route Wrapper ───────────────────────────────────────────────────────────

/**
 * Wraps an API route handler with CSRF validation.
 * If validation fails, returns 403 immediately.
 * Otherwise, calls the original handler.
 */
export function withCsrf(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    const csrfError = validateCsrf(req);
    if (csrfError) return csrfError;
    return handler(req);
  };
}
