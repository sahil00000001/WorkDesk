import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// File logging only in development (not needed on Vercel)
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: './logs/app.log',
      level: 'info',
    })
  )
  logger.add(
    new winston.transports.File({
      filename: './logs/error.log',
      level: 'error',
    })
  )
}

export default logger
