import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import { verifyAuth } from '@/lib/server/middleware/auth'
import prisma from '@/lib/server/config/database'

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)

    // Find today's attendance record
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: user.userId,
        date: {
          gte: today,
        },
        checkOutTime: null,
      },
    })

    if (!attendance) {
      return sendError('NOT_CHECKED_IN', 'You have not checked in today', 400)
    }

    // Calculate work hours
    const checkOutTime = new Date()
    const workHours = attendance.checkInTime
      ? (checkOutTime.getTime() - attendance.checkInTime.getTime()) / (1000 * 60 * 60)
      : 0

    // Update attendance record
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        workHours,
      },
    })

    return sendSuccess(updatedAttendance, 'Checked out successfully', 200)
  } catch (error: any) {
    console.error('Check-out error:', error)
    return sendError(
      'CHECK_OUT_FAILED',
      error.message || 'Failed to check out',
      error.message === 'No authentication token provided' || error.message === 'Invalid or expired token' ? 401 : 400
    )
  }
}
