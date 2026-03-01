'use client'

import { motion } from 'framer-motion'
import { User, Mail, Phone, Building, Calendar, Shield, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { format } from 'date-fns'

interface UserProfile {
  id: string
  employeeId: string
  email: string
  firstName: string
  lastName: string
  role: string
  designation?: string
  phoneNumber?: string
  joiningDate?: string
  address?: string
  profilePhotoUrl?: string
  isActive: boolean
  department?: {
    id: string
    name: string
  }
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50">
        <Icon className="h-5 w-5 text-gray-500" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const response = await apiClient.get('/api/auth/me')
      return response.data.data as UserProfile
    },
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-700 font-medium">Failed to load profile. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600 mb-8">Your account information</p>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-white text-3xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-blue-100 mt-1">{profile.designation || profile.role}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-sm font-medium">
                  {profile.employeeId}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-sm font-medium ${
                  profile.isActive ? 'bg-green-400/30' : 'bg-red-400/30'
                }`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
            <InfoRow icon={Mail} label="Email" value={profile.email} />
            <InfoRow icon={Phone} label="Phone" value={profile.phoneNumber || ''} />
            <InfoRow icon={MapPin} label="Address" value={profile.address || ''} />
            <InfoRow
              icon={Calendar}
              label="Joining Date"
              value={profile.joiningDate ? format(new Date(profile.joiningDate), 'MMM dd, yyyy') : ''}
            />
          </div>

          {/* Work Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Information</h3>
            <InfoRow icon={User} label="Employee ID" value={profile.employeeId} />
            <InfoRow icon={Building} label="Department" value={profile.department?.name || ''} />
            <InfoRow icon={Shield} label="Role" value={profile.role} />
            <InfoRow icon={User} label="Designation" value={profile.designation || ''} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
