import jwt from 'jsonwebtoken'
import config from '../config/env'

interface TokenPayload {
  userId: string
  email: string
  role: string
  permissions?: string[]
}

export class TokenService {
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry,
    })
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwtRefreshSecret, {
      expiresIn: config.jwtRefreshExpiry,
    })
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload
    } catch (error) {
      throw new Error('Invalid or expired access token')
    }
  }

  static verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload
    } catch (error) {
      throw new Error('Invalid or expired refresh token')
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload
    } catch {
      return null
    }
  }
}

export default TokenService
