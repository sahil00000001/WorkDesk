import nodemailer from 'nodemailer'
import config from '../config/env'
import logger from '../utils/logger'

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  })

  static async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      logger.info('SMTP connection verified successfully')
      return true
    } catch (error) {
      logger.error('SMTP connection failed:', error)
      return false
    }
  }

  static async sendOTP(email: string, otp: string, expiresAt: Date): Promise<void> {
    const expiryMinutes = Math.floor((expiresAt.getTime() - Date.now()) / 60000)

    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Your Login OTP - Employee Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0ea5e9, #a855f7);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .otp-box {
                background: white;
                border: 2px dashed #0ea5e9;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #0ea5e9;
                letter-spacing: 8px;
                margin: 10px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #6b7280;
                font-size: 14px;
              }
              .warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔐 Login Verification</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You requested to log in to the Employee Portal. Please use the following One-Time Password (OTP) to complete your login:</p>

              <div class="otp-box">
                <p style="margin: 0; color: #6b7280;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #6b7280;">Valid for ${expiryMinutes} minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>Our team will never ask for your OTP</li>
                  <li>This OTP expires in ${expiryMinutes} minutes</li>
                </ul>
              </div>

              <p>If you didn't request this OTP, please ignore this email or contact your administrator.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Your Employee Portal Login OTP

        OTP Code: ${otp}

        This OTP is valid for ${expiryMinutes} minutes.

        If you didn't request this OTP, please ignore this email.

        Security Notice:
        - Never share this OTP with anyone
        - Our team will never ask for your OTP

        © ${new Date().getFullYear()} Employee Portal
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`OTP email sent successfully to ${email}`)
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error)
      throw new Error('Failed to send OTP email')
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const mailOptions = {
      from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
      to: email,
      subject: 'Welcome to Employee Portal',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0ea5e9, #a855f7);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #0ea5e9;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Welcome to the Employee Portal! Your account has been successfully created.</p>

              <p>You can now access the portal using your company email address. We use OTP-based authentication for enhanced security.</p>

              <div style="text-align: center;">
                <a href="${config.frontendUrl}/login" class="button">Go to Login Page</a>
              </div>

              <p>If you have any questions or need assistance, please don't hesitate to contact your HR department.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Employee Portal. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    }

    try {
      await this.transporter.sendMail(mailOptions)
      logger.info(`Welcome email sent successfully to ${email}`)
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error)
      // Don't throw error for welcome emails
    }
  }
}

export default EmailService
