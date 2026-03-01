/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LEAVES PAGE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Leave management for employees — apply for leave, track application
 *  status, and filter history by PENDING / APPROVED / REJECTED.
 *
 *  Live API calls
 *  ──────────────
 *  GET  /api/leave-types
 *    Fetches all active leave types (Annual, Casual, Sick, Maternity…)
 *    used to populate the leave type dropdown in the application form.
 *
 *  GET  /api/leaves
 *    Fetches the current employee's full leave history sorted newest first.
 *    Each record includes the leaveType object, status, dates, and reason.
 *
 *  POST /api/leaves
 *    Submits a new leave application.
 *    Payload: { leaveTypeId, startDate, endDate, reason }
 *    Validation: endDate >= startDate · reason 5–500 chars · valid UUID
 *    Error codes: 409 LEAVE_OVERLAP (dates clash with existing leave)
 *
 *  Form validation
 *  ───────────────
 *  react-hook-form + Zod schema validates the form client-side before the
 *  API call. Calculated days are derived from (endDate - startDate + 1).
 *
 *  Status filter
 *  ─────────────
 *  ALL · PENDING · APPROVED · REJECTED tabs filter the leave list locally
 *  without re-fetching from the server.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface LeaveType {
  id: string
  name: string
  maxDays: number
  isActive: boolean
}

interface Leave {
  id: string
  leaveTypeId: string
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  status: string
  createdAt: Date
  leaveType: LeaveType
}

const leaveSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
})

type LeaveFormData = z.infer<typeof leaveSchema>

export default function LeavesPage() {
  const queryClient = useQueryClient()
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
  })

  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Calculate days
  const calculatedDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0

  // Fetch leave types
  const { data: leaveTypes } = useQuery({
    queryKey: ['leave-types'],
    queryFn: async () => {
      const response = await apiClient.get('/api/leave-types')
      return response.data.data as LeaveType[]
    },
  })

  // Fetch leaves
  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const response = await apiClient.get('/api/leaves')
      return response.data.data as Leave[]
    },
  })

  // Apply leave mutation
  const applyLeaveMutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const response = await apiClient.post('/api/leaves', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Leave application submitted successfully!')
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
      reset()
      setShowApplyForm(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit leave application')
    },
  })

  const onSubmit = (data: LeaveFormData) => {
    applyLeaveMutation.mutate(data)
  }

  const filteredLeaves = leaves?.filter((leave) => {
    if (filter === 'ALL') return true
    return leave.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leave Management</h1>
            <p className="text-gray-600">Apply for leaves and track your applications</p>
          </div>
          <button
            onClick={() => setShowApplyForm(!showApplyForm)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Apply for Leave
          </button>
        </div>

        {/* Apply Leave Form */}
        {showApplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply for Leave</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Leave Type
                  </label>
                  <select
                    {...register('leaveTypeId')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} (Max: {type.maxDays} days)
                      </option>
                    ))}
                  </select>
                  {errors.leaveTypeId && (
                    <p className="text-red-500 text-sm mt-1">{errors.leaveTypeId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Days
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-lg font-semibold text-gray-900">
                      {calculatedDays > 0 ? `${calculatedDays} days` : 'Select dates'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('startDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...register('endDate')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  {...register('reason')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide a reason for your leave..."
                />
                {errors.reason && (
                  <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={applyLeaveMutation.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyLeaveMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setShowApplyForm(false)
                  }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Leave History */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading leaves...</p>
          </div>
        ) : filteredLeaves && filteredLeaves.length > 0 ? (
          <div className="grid gap-4">
            {filteredLeaves.map((leave, index) => (
              <motion.div
                key={leave.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(leave.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {leave.leaveType.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {format(new Date(leave.startDate), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Days</p>
                    <p className="text-lg font-semibold text-gray-900">{leave.totalDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied On</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-gray-900">{leave.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No leaves found</h3>
            <p className="text-gray-600">
              {filter === 'ALL'
                ? "You haven't applied for any leaves yet"
                : `No ${filter.toLowerCase()} leaves found`}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
