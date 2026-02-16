import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import AuthService from '@/lib/server/services/auth.service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return sendError('UNAUTHORIZED', 'Refresh token not found', 401)
    }

    const result = await AuthService.refreshAccessToken(refreshToken)

    return sendSuccess(result, 'Token refreshed successfully', 200)
  } catch (error: any) {
    console.error('Token refresh error:', error)

    // Clear invalid refresh token
    const cookieStore = await cookies()
    cookieStore.delete('refresh_token')

    return sendError(
      'REFRESH_FAILED',
      error.message || 'Failed to refresh token',
      401
    )
  }
}
