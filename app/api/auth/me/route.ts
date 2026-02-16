import { NextRequest } from 'next/server'
import { sendSuccess, sendError } from '@/lib/server/utils/response'
import { verifyAuth } from '@/lib/server/middleware/auth'
import prisma from '@/lib/server/config/database'

export async function GET(request: NextRequest) {
  try {
    const user = verifyAuth(request)

    // Get full user details
    const userDetails = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        employeeId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        designation: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        profilePicture: true,
        phone: true,
        dateOfBirth: true,
        joiningDate: true,
        address: true,
        isActive: true,
        lastLogin: true,
      },
    })

    if (!userDetails) {
      return sendError('USER_NOT_FOUND', 'User not found', 404)
    }

    return sendSuccess(userDetails, 'User details retrieved successfully', 200)
  } catch (error: any) {
    console.error('Get user error:', error)
    return sendError(
      'UNAUTHORIZED',
      error.message || 'Authentication required',
      401
    )
  }
}
