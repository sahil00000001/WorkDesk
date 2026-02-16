import { NextRequest } from 'next/server'
import TokenService from '../services/token.service'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function verifyAuth(request: NextRequest): {
  userId: string
  email: string
  role: string
} {
  const token = getAuthToken(request)

  if (!token) {
    throw new Error('No authentication token provided')
  }

  try {
    const payload = TokenService.verifyAccessToken(token)
    return payload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: { role: string }) => {
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Insufficient permissions')
    }
  }
}
