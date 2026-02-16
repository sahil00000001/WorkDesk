import bcrypt from 'bcryptjs'
import prisma from '../config/database'
import config from '../config/env'

export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  static async hashOTP(otp: string): Promise<string> {
    return bcrypt.hash(otp, config.bcryptRounds)
  }

  static async verifyOTP(otp: string, hashedOTP: string): Promise<boolean> {
    return bcrypt.compare(otp, hashedOTP)
  }

  static async createOTP(email: string): Promise<{ otp: string; expiresAt: Date }> {
    // Generate OTP
    const otp = this.generateOTP()
    const hashedOTP = await this.hashOTP(otp)

    // Calculate expiry
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + config.otpExpiryMinutes)

    // Delete any existing OTPs for this email
    await prisma.oTPVerification.deleteMany({
      where: { email },
    })

    // Create new OTP record
    await prisma.oTPVerification.create({
      data: {
        email,
        otp: hashedOTP,
        expiresAt,
        attempts: 0,
      },
    })

    return { otp, expiresAt }
  }

  static async verifyAndConsumeOTP(email: string, otp: string): Promise<boolean> {
    // Find OTP record
    const otpRecord = await prisma.oTPVerification.findFirst({
      where: {
        email,
        expiresAt: { gte: new Date() },
      },
    })

    if (!otpRecord) {
      throw new Error('OTP expired or not found')
    }

    // Check attempts
    if (otpRecord.attempts >= config.otpMaxAttempts) {
      await prisma.oTPVerification.delete({ where: { id: otpRecord.id } })
      throw new Error('Maximum OTP attempts exceeded')
    }

    // Verify OTP
    const isValid = await this.verifyOTP(otp, otpRecord.otp)

    if (!isValid) {
      // Increment attempts
      await prisma.oTPVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      })
      throw new Error('Invalid OTP')
    }

    // OTP is valid, delete it
    await prisma.oTPVerification.delete({ where: { id: otpRecord.id } })

    return true
  }

  static async cleanupExpiredOTPs(): Promise<void> {
    await prisma.oTPVerification.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    })
  }
}

export default OTPService
