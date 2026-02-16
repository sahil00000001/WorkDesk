import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import AuthService from '@/lib/server/services/auth.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return sendError('VALIDATION_ERROR', 'Email is required', 400)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return sendError('VALIDATION_ERROR', 'Invalid email format', 400)
    }

    const result = await AuthService.initiateLogin(email.toLowerCase())

    return sendSuccess(result, 'OTP sent successfully', 200)
  } catch (error: any) {
    console.error('Login API error:', error)
    return sendError(
      'LOGIN_FAILED',
      error.message || 'Failed to initiate login',
      400
    )
  }
}
