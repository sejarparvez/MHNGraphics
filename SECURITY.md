# Security Analysis Report

**Date:** 2026-05-01
**Framework:** Next.js 16.1.6, React 19.2.4
**Database:** MongoDB via Prisma 6.2.1
**Auth:** next-auth 4.24.13
**Runtime:** Bun


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


### 2. No Rate Limiting Anywhere

No rate limiting on: signup, login, quiz submission, SMS sending, email contact form, or any API endpoint.

**Risk:** Brute force, DoS, spam, resource exhaustion.

**Fix:** Add rate limiting (e.g., `@upstash/ratelimit` or `express-rate-limit` adapted for Next.js).

---


