/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  AUTH STORE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Global authentication state managed with Zustand + localStorage persistence.
 *  This is the single source of truth for the logged-in user across the app.
 *
 *  State shape
 *  ───────────
 *  user          — Full user object returned by POST /api/auth/verify-otp
 *  token         — Short-lived JWT access token  (expires in 15 min)
 *  refreshToken  — Long-lived refresh token       (expires in 7 days)
 *  isAuthenticated — Derived boolean, true only when all three are present
 *
 *  Actions
 *  ───────
 *  login(user, token, refreshToken)  — Called after successful OTP verification
 *  logout()                          — Clears all state; redirected to /login
 *  setTokens(token, refreshToken)    — Called by apiClient on silent token refresh
 *  updateUser(partial)               — Merges partial user data into store
 *
 *  Persistence
 *  ───────────
 *  State is persisted to localStorage under the key "auth-storage".
 *  On page reload the user stays logged in until their refresh token expires.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  employeeId: string
  role: 'ADMIN' | 'HR' | 'EMPLOYEE'
  designation?: string
  phoneNumber?: string
  joiningDate?: string
  address?: string
  profilePhotoUrl?: string
  department?: {
    id: string
    name: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  setTokens: (token: string, refreshToken: string) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) => {
        set({ user, token, refreshToken, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },
      setTokens: (token, refreshToken) => {
        set({ token, refreshToken })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
