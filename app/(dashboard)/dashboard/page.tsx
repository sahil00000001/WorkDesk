/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DASHBOARD PAGE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Landing page after login. Gives the employee a quick snapshot of:
 *    • Company-wide stats  (static display — HR/Admin API not yet built)
 *    • Personal attendance widget with live check-in / check-out
 *    • Latest company announcements (static — announcements API upcoming)
 *
 *  Live API calls
 *  ──────────────
 *  GET  /api/attendance/today
 *    Fetches the current employee's attendance record for today.
 *    Drives the attendance card state (not checked in / checked in / day done).
 *
 *  POST /api/attendance/check-in
 *    Creates today's attendance record. Returns 409 if already checked in.
 *    Backend auto-detects late arrival (after 09:30 AM → status: LATE).
 *
 *  POST /api/attendance/check-out
 *    Stamps check-out time and calculates workHours.
 *    Returns 400 if not checked in, 409 if already checked out.
 *
 *  State management
 *  ────────────────
 *  React Query manages all server state. Mutations call
 *  queryClient.invalidateQueries(['attendance']) on success so the UI
 *  re-fetches and reflects the updated attendance record immediately.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use client'

import { motion } from 'framer-motion'
import { Users, Clock, Calendar, TrendingUp, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Attendance {
  id: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  workHours: number | null
  status: string
}

const stats = [
  {
    title: 'Total Employees',
    value: '247',
    change: '+5.2%',
    icon: Users,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Present Today',
    value: '231',
    change: '+2.4%',
    icon: Clock,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'On Leave',
    value: '16',
    change: '-1.2%',
    icon: Calendar,
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    title: 'Attendance Rate',
    value: '93.5%',
    change: '+1.8%',
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
  },
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } },
}

export default function DashboardPage() {
  const queryClient = useQueryClient()

  // Fetch today's attendance
  const { data: todayAttendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const response = await apiClient.get('/api/attendance/today')
      return response.data.data as Attendance | null
    },
  })

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/attendance/check-in')
      return response.data
    },
    onSuccess: () => {
      toast.success('Checked in successfully!')
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to check in'
      toast.error(message)
    },
  })

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/api/attendance/check-out')
      return response.data
    },
    onSuccess: () => {
      toast.success('Checked out successfully!')
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to check out'
      toast.error(message)
    },
  })

  const hasCheckedIn = !!todayAttendance?.checkInTime
  const hasCheckedOut = !!todayAttendance?.checkOutTime

  return (
    <div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div key={index} variants={staggerItem}>
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="mt-2 text-sm font-medium text-success-600">
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Attendance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                {loadingAttendance
                  ? 'Loading...'
                  : hasCheckedIn && hasCheckedOut
                  ? `Checked in at ${format(new Date(todayAttendance!.checkInTime!), 'hh:mm a')} · Checked out at ${format(new Date(todayAttendance!.checkOutTime!), 'hh:mm a')}`
                  : hasCheckedIn
                  ? `Checked in at ${format(new Date(todayAttendance!.checkInTime!), 'hh:mm a')}`
                  : 'You have not checked in yet'}
              </CardDescription>
            </CardHeader>

            <div className="mb-6 text-center">
              <div className="text-5xl font-bold text-gray-900">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
            </div>

            {!hasCheckedIn && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<CheckCircle className="h-5 w-5" />}
                loading={checkInMutation.isPending || loadingAttendance}
                onClick={() => checkInMutation.mutate()}
              >
                Check In
              </Button>
            )}

            {hasCheckedIn && !hasCheckedOut && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={<CheckCircle className="h-5 w-5" />}
                loading={checkOutMutation.isPending}
                onClick={() => checkOutMutation.mutate()}
              >
                Check Out
              </Button>
            )}

            {hasCheckedIn && hasCheckedOut && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-sm font-medium text-green-800">
                  Day complete — {todayAttendance?.workHours?.toFixed(2) ?? '0'}h worked
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Latest Announcements</CardTitle>
              <CardDescription>Stay updated with company news</CardDescription>
            </CardHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-error-100 px-2.5 py-0.5 text-xs font-medium text-error-700">
                    HIGH
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Welcome to the Employee Portal
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      We are excited to launch our new employee management portal!
                    </p>
                    <p className="mt-2 text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-700">
                    MEDIUM
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Holiday Notice - Republic Day
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Office will be closed on January 26th for Republic Day.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
