import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import AuthService from '@/lib/server/services/auth.service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (refreshToken) {
      await AuthService.logout(refreshToken)
    }

    // Clear refresh token cookie
    cookieStore.delete('refresh_token')

    return sendSuccess({}, 'Logged out successfully', 200)
  } catch (error: any) {
    console.error('Logout error:', error)
    return sendError(
      'LOGOUT_FAILED',
      error.message || 'Failed to logout',
      400
    )
  }
}
