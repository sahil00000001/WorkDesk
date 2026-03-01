'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  FileText,
  Megaphone,
  BarChart3,
  User,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import apiClient from '@/lib/api/client'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Clock, label: 'Attendance', href: '/attendance' },
  { icon: Calendar, label: 'Leaves', href: '/leaves' },
  { icon: Users, label: 'Employees', href: '/employees' },
  { icon: FileText, label: 'Policies', href: '/policies' },
  { icon: Megaphone, label: 'Announcements', href: '/announcements' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = async () => {
    const { refreshToken } = useAuthStore.getState()
    try {
      if (refreshToken) {
        await apiClient.post('/api/auth/logout', { refreshToken })
      }
    } catch {
      // Proceed with local logout regardless
    } finally {
      logout()
      router.push('/login')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white"
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <h1 className="font-display text-xl font-bold text-primary-600">
            Employee Portal
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 h-8 w-1 rounded-r-full bg-primary-600"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-medium">
              {user?.firstName[0]}
              {user?.lastName[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut className="h-4 w-4" />}
            onClick={handleLogout}
            className="w-full justify-start"
          >
            Logout
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative rounded-lg p-2 hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-error-500" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 overflow-y-auto p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
