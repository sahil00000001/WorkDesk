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
