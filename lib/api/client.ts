/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  API CLIENT  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  All HTTP calls in this app route through this single Axios instance.
 *  There are no local Next.js API routes — every request goes directly to
 *  the hosted backend at https://zoho-backend-rho.vercel.app
 *
 *  Authentication
 *  ──────────────
 *  Auth is now handled by Clerk. Before each request the interceptor reads
 *  the active Clerk session token from `window.Clerk.session.getToken()` and
 *  attaches it as `Authorization: Bearer <token>`.
 *
 *  Clerk automatically rotates the short-lived session token on expiry, so
 *  no manual refresh logic is needed here.
 *
 *  Note for backend
 *  ─────────────────
 *  The backend must verify incoming JWTs against Clerk's JWKS endpoint:
 *    https://clerk.com/docs/backend-requests/handling/manual-jwt
 *  Replace the existing `verifyJWT` middleware with Clerk's JWT verification.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'

const BASE_URL = 'https://zoho-backend-rho.vercel.app'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach Clerk session token as Bearer
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (typeof window !== 'undefined' && (window as any).Clerk?.session) {
        const token = await (window as any).Clerk.session.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {
      // Clerk session not ready — proceed without token
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient
