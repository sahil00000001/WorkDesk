import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import AuthService from '@/lib/server/services/auth.service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    if (!email || !otp) {
      return sendError('VALIDATION_ERROR', 'Email and OTP are required', 400)
    }

    // Verify OTP and login
    const result = await AuthService.verifyOTPAndLogin(email.toLowerCase(), otp)

    // Set HTTP-only cookie for refresh token
    const cookieStore = await cookies()
    cookieStore.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    // Return user and access token
    return sendSuccess(
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      'Login successful',
      200
    )
  } catch (error: any) {
    console.error('OTP verification error:', error)
    return sendError(
      'VERIFICATION_FAILED',
      error.message || 'Failed to verify OTP',
      400
    )
  }
}
