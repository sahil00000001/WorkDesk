/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LOGIN PAGE  ·  WorkDesk Employee Portal
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Passwordless OTP authentication powered by Clerk — 2-step flow:
 *
 *  Step 1 — Email
 *    User enters their work email address.
 *    Clerk's `signIn.create({ strategy: 'email_code', identifier })` triggers
 *    Clerk's own email delivery — no SMTP configuration required.
 *
 *  Step 2 — OTP
 *    User enters the 6-digit code delivered by Clerk.
 *    `signIn.attemptFirstFactor({ strategy: 'email_code', code })` verifies it.
 *    On `status === 'complete'`, the session is activated and the user is
 *    redirected to /dashboard.
 *
 *  Why Clerk instead of custom OTP?
 *  ─────────────────────────────────
 *  Clerk handles email delivery, rate limiting, code expiry, and session
 *  management out of the box — no SMTP server required on our side.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, KeyRound, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const { isLoaded, signIn, setActive } = useSignIn()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── Step 1: Send email OTP via Clerk ─────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setIsLoading(true)

    try {
      await signIn.create({
        strategy: 'email_code',
        identifier: email,
      })
      toast.success('OTP sent! Check your email.')
      setStep('otp')
    } catch (error: any) {
      const message =
        error.errors?.[0]?.longMessage ||
        error.errors?.[0]?.message ||
        'Failed to send OTP. Try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Step 2: Verify OTP and activate session ───────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return
    setIsLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: otp,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast.success('Login successful!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      const message =
        error.errors?.[0]?.longMessage ||
        error.errors?.[0]?.message ||
        'Invalid or expired OTP.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      await signIn.create({
        strategy: 'email_code',
        identifier: email,
      })
      toast.success('New OTP sent!')
    } catch {
      toast.error('Failed to resend OTP.')
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
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                Sign in to your account
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Enter your work email to receive a one-time password.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <Input
                  type="email"
                  label="Email address"
                  placeholder="you@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="otp-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                Enter your OTP
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                We sent a 6-digit code to{' '}
                <span className="font-medium text-gray-700">{email}</span>.
                It expires in 10 minutes.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <Input
                  type="text"
                  label="One-time password"
                  placeholder="000000"
                  icon={<KeyRound className="h-4 w-4" />}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
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
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setOtp('') }}
                  className="text-gray-500 hover:text-gray-700 underline"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  Resend OTP
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
