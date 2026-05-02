'use client';

import axios from 'axios';

// ─── Axios Instance ───────────────────────────────────────────────────────────

/**
 * Use `apiClient` instead of plain `axios` for all authenticated requests.
 * It automatically:
 *   1. Fetches a CSRF token on the first state-changing request
 *   2. Attaches the token to every POST/PUT/PATCH/DELETE via x-csrf-token header
 *   3. Refreshes the token on 403 CSRF errors and retries once
 */
const apiClient = axios.create({
  baseURL: '/',
  withCredentials: true, // sends cookies with every request
});

// ─── Token Cache ──────────────────────────────────────────────────────────────

let csrfToken: string | null = null;
let tokenFetchPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  // Deduplicate concurrent requests — only one fetch at a time
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = apiClient // ✅ use apiClient, not raw axios
    .get<{ csrfToken: string }>('/api/csrf-token') // withCredentials inherited from instance
    .then((res) => {
      csrfToken = res.data.csrfToken;
      tokenFetchPromise = null;
      return csrfToken as string;
    })
    .catch((err) => {
      tokenFetchPromise = null;
      throw err;
    });

  return tokenFetchPromise;
}

// ─── Request Interceptor ──────────────────────────────────────────────────────

const STATE_CHANGING_METHODS = ['post', 'put', 'patch', 'delete'];

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase() ?? '';

  if (STATE_CHANGING_METHODS.includes(method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }

  return config;
});

// ─── Response Interceptor (auto-retry on token expiry) ───────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired or missing — refresh and retry once
    if (
      error.response?.status === 403 &&
      (error.response?.data?.message === 'CSRF token missing' ||
        error.response?.data?.message === 'Invalid or expired CSRF token') &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null; // clear stale token
      await fetchCsrfToken();
      originalRequest.headers['x-csrf-token'] = csrfToken;
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

// ─── Manual token clear (call after logout) ───────────────────────────────────

export function clearCsrfToken() {
  csrfToken = null;
}

export default apiClient;
