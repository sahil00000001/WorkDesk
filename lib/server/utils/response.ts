import { NextResponse } from 'next/server'

interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  meta?: any
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    stack?: string
  }
}

export const sendSuccess = <T>(
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: any
): NextResponse<SuccessResponse<T>> => {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message,
    meta,
  }
  return NextResponse.json(response, { status: statusCode })
}

export const sendError = (
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): NextResponse<ErrorResponse> => {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
    },
  }
  return NextResponse.json(response, { status: statusCode })
}
