import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import config from '../config/env'
import TokenService from './token.service'
import OTPService from './otp.service'
import EmailService from './email.service'
import logger from '../utils/logger'

export class AuthService {
  static async initiateLogin(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isActive: true,
        },
      })

      if (!user) {
        throw new Error('User not found')
      }

      if (!user.isActive) {
        throw new Error('Account is inactive. Please contact your administrator.')
      }

      // Generate and send OTP
      const { otp, expiresAt } = await OTPService.createOTP(email)
      await EmailService.sendOTP(email, otp, expiresAt)

      logger.info(`OTP sent successfully to ${email}`)

      return {
        success: true,
        message: 'OTP sent successfully to your email',
      }
    } catch (error: any) {
      logger.error('Login initiation failed:', error)
      throw error
    }
  }

  static async verifyOTPAndLogin(
    email: string,
    otp: string
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      // Verify OTP
      await OTPService.verifyAndConsumeOTP(email, otp)

      // Get user details
      const user = await prisma.user.findUnique({
        where: { email },
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
          isActive: true,
        },
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      // Generate tokens
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      }

      const accessToken = TokenService.generateAccessToken(tokenPayload)
      const refreshToken = TokenService.generateRefreshToken(tokenPayload)

      // Store refresh token
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      })

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      })

      logger.info(`User ${email} logged in successfully`)

      return {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          designation: user.designation,
          department: user.department,
          profilePicture: user.profilePicture,
        },
        accessToken,
        refreshToken,
      }
    } catch (error: any) {
      logger.error('OTP verification failed:', error)
      throw error
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const payload = TokenService.verifyRefreshToken(refreshToken)

      // Check if refresh token exists and is valid
      const tokenRecord = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.userId,
          expiresAt: { gte: new Date() },
          isRevoked: false,
        },
      })

      if (!tokenRecord) {
        throw new Error('Invalid or expired refresh token')
      }

      // Generate new access token
      const accessToken = TokenService.generateAccessToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      })

      logger.info(`Access token refreshed for user ${payload.userId}`)

      return { accessToken }
    } catch (error: any) {
      logger.error('Token refresh failed:', error)
      throw error
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      // Revoke refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      })

      logger.info('User logged out successfully')
    } catch (error: any) {
      logger.error('Logout failed:', error)
      throw error
    }
  }

  static async cleanupExpiredTokens(): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      })
      logger.info('Expired tokens cleaned up')
    } catch (error: any) {
      logger.error('Token cleanup failed:', error)
    }
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!user || !user.password) {
        throw new Error('User not found')
      }

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, user.password)
      if (!isValid) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, config.bcryptRounds)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      })

      logger.info(`Password changed for user ${userId}`)
    } catch (error: any) {
      logger.error('Password change failed:', error)
      throw error
    }
  }
}

export default AuthService
