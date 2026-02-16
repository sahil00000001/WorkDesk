import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import { verifyAuth } from '@/lib/server/middleware/auth'
import prisma from '@/lib/server/config/database'

// Get leaves
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        leaveType: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return sendSuccess(leaves, 'Leaves retrieved successfully', 200)
  } catch (error: any) {
    console.error('Get leaves error:', error)
    return sendError(
      'FETCH_FAILED',
      error.message || 'Failed to fetch leaves',
      error.message === 'No authentication token provided' || error.message === 'Invalid or expired token' ? 401 : 400
    )
  }
}

// Apply for leave
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request)
    const body = await request.json()
    const { leaveTypeId, startDate, endDate, reason } = body

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return sendError('VALIDATION_ERROR', 'All fields are required', 400)
    }

    // Calculate number of days
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: user.userId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays: days,
        reason,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
      },
    })

    return sendSuccess(leaveRequest, 'Leave application submitted successfully', 201)
  } catch (error: any) {
    console.error('Apply leave error:', error)
    return sendError(
      'APPLICATION_FAILED',
      error.message || 'Failed to apply for leave',
      400
    )
  }
}
