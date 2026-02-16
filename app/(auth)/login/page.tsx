'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For demo purposes - in real app, call API
      if (email === 'admin@company.com' && password === 'Admin@123') {
        login(
          {
            id: '1',
            email: 'admin@company.com',
            firstName: 'Admin',
            lastName: 'User',
            employeeId: 'EMP001',
            role: 'ADMIN',
            department: 'HR',
            designation: 'System Administrator',
          },
          'demo-token-12345'
        )
        toast.success('Login successful!')
        router.push('/dashboard')
      } else {
        toast.error('Invalid credentials. Try: admin@company.com / Admin@123')
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email address"
            placeholder="you@company.com"
            icon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            icon={!isLoading && <ArrowRight className="h-4 w-4" />}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 rounded-lg bg-primary-50 border border-primary-200 p-3">
          <p className="text-xs text-primary-800 font-medium">
            Demo Credentials:
          </p>
          <p className="text-xs text-primary-700 mt-1">
            Email: admin@company.com
          </p>
          <p className="text-xs text-primary-700">
            Password: Admin@123
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
