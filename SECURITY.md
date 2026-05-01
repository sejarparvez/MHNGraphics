# Security Analysis Report

**Date:** 2026-05-01
**Framework:** Next.js 16.1.6, React 19.2.4
**Database:** MongoDB via Prisma 6.2.1
**Auth:** next-auth 4.24.13
**Runtime:** Bun

---

## Resolved

- [x] **No Security Headers** — Added headers + CSP to `next.config.mjs`
- [x] **Stored XSS** — Sanitized with `DOMPurify` in `SingleDesign.tsx`
- [x] **No Auth on Admin Endpoints** — `lib/auth.ts` helper applied to all admin routes
- [x] **SMS API Wide Open** — Restricted to ADMIN only
- [x] **CORS Wildcard `*`** — Replaced with origin whitelist in `app/api/notice/route.ts`
- [x] **HTML Injection in Contact Email** — Escaped with `escapeHtml()` + Zod validation
- [x] **`userId` from Request Body (Comment Forgery)** — Derived from session token
- [x] **Mass Assignment in Application PATCH** — Field whitelist added, admin-only fields separated

---

## HIGH Issues

### 1. Missing Input Validation
**Files:** Multiple API routes

Routes accepting raw `req.json()` or `formData` without Zod/schema validation:

| Route | Issue |
|-------|-------|
| `POST /api/design/single-design` | No validation on name, description, category, tags |
| `POST /api/best-computer/blood-bank` | No validation — stores raw form data |
| `POST /api/admin/banner/hero` | No validation beyond null checks |
| `POST /api/notice` | No auth, no validation |
| `POST /api/dashboard/subscribe` | Weak email validation (`includes('@')`) |

**Fix:** Add Zod schemas to all routes accepting user input.

---

### 2. Weak Password Policy
**Files:** `lib/Schemas.ts:21-24`, `app/api/signup/route.ts:13`

```ts
password: z.string().min(6, ...).max(15, ...)
```

- Minimum 6 characters (OWASP recommends 8+)
- No complexity requirements
- No breach database checking

**Fix:** Increase minimum to 8+, add complexity requirements, consider breach checking.

---

### 3. No Rate Limiting Anywhere

No rate limiting on: signup, login, quiz submission, SMS sending, email contact form, or any API endpoint.

**Risk:** Brute force, DoS, spam, resource exhaustion.

**Fix:** Add rate limiting (e.g., `@upstash/ratelimit` or `express-rate-limit` adapted for Next.js).

---

### 4. SMS API Uses HTTP Not HTTPS
**File:** `lib/sms.ts:8-9`

```ts
baseUrl: 'http://bulksmsbd.net/api/smsapi',
balanceUrl: 'http://bulksmsbd.net/api/getBalanceApi',
```

API key is sent over HTTP in query parameters — visible in URLs, server logs, and network sniffing.

**Fix:** Switch to HTTPS or use a provider with HTTPS support.

---

## MEDIUM Issues

### 5. No CSRF Protection on Custom Routes

next-auth provides CSRF tokens for auth routes, but custom API routes have no CSRF protection. POST/PUT/DELETE/PATCH requests are vulnerable to CSRF if the user is authenticated via cookies.

**Fix:** Add CSRF token validation to state-changing custom API routes.

---

### 6. Dual Prisma Client Instances
**Files:** `lib/prisma.ts`, `components/helper/prisma/Prisma.tsx`

Two separate Prisma client instances are created. No singleton pattern or connection pooling.

**Risk:** Database connection pool exhaustion, potential data inconsistency.

**Fix:** Consolidate into a single singleton Prisma client in `lib/prisma.ts`.

---

### 7. User Listing Without Auth (PII Leak)
**File:** `app/api/users/route.ts`

The GET endpoint returns a paginated list of all verified users with names, emails, phone numbers, and images — with no authentication required.

**Risk:** PII exposure, enables scraping of user database.

**Fix:** Restrict to authenticated admin users only.

---

### 8. Information Disclosure in Error Messages

Some routes return internal state in error messages, e.g., `app/api/editprofile/route.ts:131` returns "User password is null".

**Fix:** Return generic error messages to clients, log details server-side.

---

## LOW Issues

### 9. Cloudinary API Key Exposed as `NEXT_PUBLIC_`
**File:** `utils/cloudinary.ts:5`

The `NEXT_PUBLIC_` prefix exposes this to the client bundle. Cloudinary API key is designed to be public, but the API secret must never be public (it correctly isn't).

**Risk:** Low — acceptable by design, but monitor for abuse.

---

### 10. Synchronous bcrypt in Auth Callback
**File:** `services/auth.ts:60-63`

```ts
const passwordMatch = bcrypt.compareSync(credentials.password, user.password);
```

Using `compareSync` blocks the event loop during authentication.

**Fix:** Use async `bcrypt.compare()` instead.

---

## Priority Remediation Order

1. Switch SMS API to HTTPS
2. Add rate limiting to auth, signup, SMS, contact, quiz
3. Consolidate Prisma client into a single singleton
4. Add CSRF protection to state-changing custom API routes
