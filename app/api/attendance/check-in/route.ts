import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import { verifyAuth } from '@/lib/server/middleware/auth'
import prisma from '@/lib/server/config/database'

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        date: {
          gte: today,
        },
      },
    })

    if (existingAttendance) {
      return sendError('ALREADY_CHECKED_IN', 'You have already checked in today', 400)
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: user.userId,
        date: new Date(),
        checkInTime: new Date(),
        status: 'PRESENT',
      },
    })

    return sendSuccess(attendance, 'Checked in successfully', 201)
  } catch (error: any) {
    console.error('Check-in error:', error)
    return sendError(
      'CHECK_IN_FAILED',
      error.message || 'Failed to check in',
      error.message === 'No authentication token provided' || error.message === 'Invalid or expired token' ? 401 : 400
    )
  }
}
