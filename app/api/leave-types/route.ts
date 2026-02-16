import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import prisma from '@/lib/server/config/database'

export async function GET(request: NextRequest) {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return sendSuccess(leaveTypes, 'Leave types retrieved successfully', 200)
  } catch (error: any) {
    console.error('Get leave types error:', error)
    return sendError(
      'FETCH_FAILED',
      error.message || 'Failed to fetch leave types',
      500
    )
  }
}
