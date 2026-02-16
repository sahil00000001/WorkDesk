export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'build-time-placeholder-secret',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'build-time-placeholder-refresh-secret',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',

  // OTP
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10),
  otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10),

  // Email (Outlook SMTP)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'placeholder@example.com',
    password: process.env.SMTP_PASSWORD || 'placeholder-password',
    fromName: process.env.SMTP_FROM_NAME || 'Employee Portal',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'placeholder@example.com',
  },

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  rateLimitAuthMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX || '5', 10),

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['jpg', 'jpeg', 'png', 'pdf'],

  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  cookieSecret: process.env.COOKIE_SECRET || 'dev-cookie-secret',

  // Frontend URL
  frontendUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
]

// Only warn in development, these will be set in Vercel
if (process.env.NODE_ENV === 'development') {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Warning: ${envVar} is not set in environment variables`)
    }
  }
}

export default config
