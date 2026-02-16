import { NextRequest } from 'next/server'
import { sendSuccess } from '@/lib/server/utils/response'
import prisma from '@/lib/server/config/database'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    return sendSuccess(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
      },
      'Service is healthy',
      200
    )
  } catch (error) {
    return sendSuccess(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      },
      'Service is unhealthy',
      503
    )
  }
}
