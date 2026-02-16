import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import { verifyAuth } from '@/lib/server/middleware/auth'
import prisma from '@/lib/server/config/database'

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)

    // Get today's attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        date: {
          gte: today,
        },
      },
    })

    return sendSuccess(attendance || null, 'Today\'s attendance retrieved', 200)
  } catch (error: any) {
    console.error('Get attendance error:', error)
    return sendError(
      'FETCH_FAILED',
      error.message || 'Failed to fetch attendance',
      error.message === 'No authentication token provided' || error.message === 'Invalid or expired token' ? 401 : 400
    )
  }
}
