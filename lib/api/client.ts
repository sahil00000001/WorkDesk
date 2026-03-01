/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  API CLIENT  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  All HTTP calls in this app route through this single Axios instance.
 *  There are no local Next.js API routes — every request goes directly to
 *  the hosted backend at https://zoho-backend-rho.vercel.app
 *
 *  Request pipeline
 *  ────────────────
 *  1. Attach the stored JWT access token as `Authorization: Bearer <token>`
 *
 *  Response pipeline
 *  ─────────────────
 *  1. On 401  →  attempt a silent token rotation via POST /api/auth/refresh
 *  2. If rotation succeeds  →  update the store and replay the original request
 *  3. If rotation fails     →  clear auth state and redirect to /login
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BASE_URL = 'https://zoho-backend-rho.vercel.app'

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Attach access token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: Try refresh on 401, then logout
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {
            refreshToken,
          })

          const { accessToken, refreshToken: newRefreshToken } = res.data.data
          useAuthStore.getState().setTokens(accessToken, newRefreshToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        } catch {
          // Refresh failed — log out
        }
      }

      useAuthStore.getState().logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
