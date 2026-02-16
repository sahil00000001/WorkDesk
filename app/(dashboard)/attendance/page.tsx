'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, History } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'

interface Attendance {
  id: string
  date: Date
  checkInTime: Date | null
  checkOutTime: Date | null
  workHours: number | null
  status: string
}

export default function AttendancePage() {
  const queryClient = useQueryClient()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch today's attendance
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: async () => {
      const response = await apiClient.get('/api/attendance/today')
      return response.data.data as Attendance | null
    },
  })

  // Fetch attendance history (last 7 days)
  const { data: attendanceHistory } = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: async () => {
      // For now, we'll create mock data since the history endpoint doesn't exist yet
      // In a real app, this would fetch from /api/attendance/history
      return [] as Attendance[]
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
      toast.error(error.response?.data?.message || 'Failed to check in')
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
      toast.error(error.response?.data?.message || 'Failed to check out')
    },
  })

  const hasCheckedIn = todayAttendance?.checkInTime
  const hasCheckedOut = todayAttendance?.checkOutTime

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance</h1>
        <p className="text-gray-600 mb-8">Track your daily attendance</p>

        {/* Current Time Card */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-2">Current Time</p>
              <h2 className="text-5xl font-bold">
                {format(currentTime, 'HH:mm:ss')}
              </h2>
              <p className="text-blue-100 mt-2">
                {format(currentTime, 'EEEE, MMMM dd, yyyy')}
              </p>
            </div>
            <Clock className="w-24 h-24 text-white/20" />
          </div>
        </div>

        {/* Check-in/Check-out Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Check-in Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Check In</h3>
              {hasCheckedIn ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-300" />
              )}
            </div>

            {hasCheckedIn ? (
              <div>
                <p className="text-gray-600 mb-1">Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(new Date(todayAttendance.checkInTime!), 'hh:mm a')}
                </p>
                <p className="text-sm text-green-600 mt-2">✓ Already checked in</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">You haven't checked in yet today</p>
                <button
                  onClick={() => checkInMutation.mutate()}
                  disabled={checkInMutation.isPending || isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkInMutation.isPending ? 'Checking in...' : 'Check In Now'}
                </button>
              </div>
            )}
          </motion.div>

          {/* Check-out Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Check Out</h3>
              {hasCheckedOut ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-300" />
              )}
            </div>

            {hasCheckedOut ? (
              <div>
                <p className="text-gray-600 mb-1">Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(new Date(todayAttendance.checkOutTime!), 'hh:mm a')}
                </p>
                <p className="text-sm text-green-600 mt-2">✓ Already checked out</p>
              </div>
            ) : hasCheckedIn ? (
              <div>
                <p className="text-gray-600 mb-4">Ready to check out?</p>
                <button
                  onClick={() => checkOutMutation.mutate()}
                  disabled={checkOutMutation.isPending}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkOutMutation.isPending ? 'Checking out...' : 'Check Out Now'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">Check in first before checking out</p>
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-lg cursor-not-allowed"
                >
                  Check Out
                </button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Today's Summary */}
        {todayAttendance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Summary
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  todayAttendance.status === 'PRESENT'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {todayAttendance.status}
                </span>
              </div>

              <div>
                <p className="text-gray-600 text-sm mb-1">Work Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAttendance.workHours
                    ? `${todayAttendance.workHours.toFixed(2)}h`
                    : hasCheckedIn && !hasCheckedOut
                    ? `${((currentTime.getTime() - new Date(todayAttendance.checkInTime!).getTime()) / (1000 * 60 * 60)).toFixed(2)}h`
                    : '0h'
                  }
                </p>
              </div>

              <div>
                <p className="text-gray-600 text-sm mb-1">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(todayAttendance.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Attendance History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Attendance
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Work Hours</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance && (
                  <tr className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {format(new Date(todayAttendance.date), 'MMM dd, yyyy')} <span className="text-blue-600 font-semibold">(Today)</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {todayAttendance.checkInTime ? format(new Date(todayAttendance.checkInTime), 'hh:mm a') : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {todayAttendance.checkOutTime ? format(new Date(todayAttendance.checkOutTime), 'hh:mm a') : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {todayAttendance.workHours ? `${todayAttendance.workHours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        todayAttendance.status === 'PRESENT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {todayAttendance.status}
                      </span>
                    </td>
                  </tr>
                )}
                {!todayAttendance && !isLoading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No attendance records yet. Check in to get started!
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Loading attendance data...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
