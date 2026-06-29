/**
 * Global API Response Utilities
 * Standardized error handling and response formatting for all API routes
 */

import { NextResponse } from "next/server"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  code?: string
  details?: Record<string, unknown>
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
  // Database errors
  DATABASE_NOT_READY: "DATABASE_NOT_READY",
  DATABASE_CONNECTION_FAILED: "DATABASE_CONNECTION_FAILED",
  QUERY_FAILED: "QUERY_FAILED",
  
  // Authentication errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  
  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  
  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",
  
  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  
  // Generic
  BAD_REQUEST: "BAD_REQUEST",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Create a success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: 200 }
  )
}

/**
 * Create a created response (201)
 */
export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status: 201 }
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  code: ErrorCode = ErrorCodes.UNKNOWN_ERROR,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  // Log error details for debugging
  console.error(`[API Error] ${code}: ${error}`, {
    details,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.json(
    {
      success: false,
      error,
      code,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * Handle Prisma errors and convert to standardized responses
 */
export function handlePrismaError(error: unknown): { status: number; code: ErrorCode; message: string } {
  // Handle specific Prisma error codes
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Connection errors
    if (message.includes("connection") || message.includes("connect")) {
      return {
        status: 503,
        code: ErrorCodes.DATABASE_CONNECTION_FAILED,
        message: "Database connection failed. Please try again later.",
      }
    }
    
    // Record not found
    if (message.includes("record") && message.includes("not found")) {
      return {
        status: 404,
        code: ErrorCodes.NOT_FOUND,
        message: "The requested resource was not found.",
      }
    }
    
    // Unique constraint violation
    if (message.includes("unique") || message.includes("duplicate")) {
      return {
        status: 409,
        code: ErrorCodes.ALREADY_EXISTS,
        message: "A record with this value already exists.",
      }
    }
    
    // Foreign key constraint
    if (message.includes("foreign") || message.includes("constraint")) {
      return {
        status: 400,
        code: ErrorCodes.CONFLICT,
        message: "This action cannot be completed due to existing dependencies.",
      }
    }
    
    // Required field
    if (message.includes("required") || message.includes("not provided")) {
      return {
        status: 400,
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
        message: "A required field is missing.",
      }
    }
  }
  
  // Default to internal error
  return {
    status: 500,
    code: ErrorCodes.INTERNAL_ERROR,
    message: "An unexpected error occurred. Please try again.",
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ""
  )
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * Parse JSON body with error handling
 */
export async function parseJsonBody<T>(
  request: Request
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const contentType = request.headers.get("content-type")
    
    if (!contentType?.includes("application/json")) {
      return { success: false, error: "Content-Type must be application/json" }
    }
    
    const data = await request.json()
    return { success: true, data }
  } catch {
    return { success: false, error: "Invalid JSON body" }
  }
}