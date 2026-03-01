/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  AUTH STORE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Authentication state (session, tokens, identity) is now fully managed by
 *  Clerk (`@clerk/nextjs`). Use Clerk hooks in components:
 *
 *    useUser()    — access user profile (firstName, lastName, email)
 *    useAuth()    — access session state (isSignedIn, getToken)
 *    useClerk()   — signOut() and other Clerk actions
 *
 *  This store is kept as a lightweight cache for backend-specific employee
 *  data that Clerk does not track — such as employeeId, role, and department.
 *  It is populated after the first successful call to GET /api/auth/me.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface EmployeeProfile {
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

interface EmployeeState {
  profile: EmployeeProfile | null
  setProfile: (profile: EmployeeProfile | null) => void
  clearProfile: () => void
}

export const useEmployeeStore = create<EmployeeState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'employee-storage',
    }
  )
)
