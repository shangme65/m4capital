import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
  timestamp: string;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp: string;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  message?: string,
  details?: any,
  status: number = 500
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      details: process.env.NODE_ENV === "development" ? details : undefined,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Handle Prisma errors and convert to user-friendly messages
 */
export function handlePrismaError(error: any): {
  message: string;
  status: number;
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          message: "A record with this information already exists",
          status: 409,
        };
      case "P2025":
        return {
          message: "Record not found",
          status: 404,
        };
      case "P2003":
        return {
          message: "Invalid reference to related record",
          status: 400,
        };
      case "P2014":
        return {
          message: "Invalid relationship",
          status: 400,
        };
      default:
        return {
          message: "Database operation failed",
          status: 500,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: "Invalid data provided",
      status: 400,
    };
  }

  return {
    message: "An unexpected error occurred",
    status: 500,
  };
}

/**
 * Global error handler wrapper
 */
export async function withErrorHandler<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  try {
    return await handler();
  } catch (error: any) {
    console.error("API Error:", error);

    // Handle Prisma errors
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      const { message, status } = handlePrismaError(error);
      const errorCode =
        error instanceof Prisma.PrismaClientKnownRequestError
          ? error.code
          : undefined;
      return createErrorResponse("Database error", message, errorCode, status);
    }

    // Handle known errors
    if (error.message === "EMAIL_NOT_VERIFIED") {
      return createErrorResponse(
        "Email not verified",
        "Please verify your email before logging in",
        undefined,
        403
      );
    }

    // Generic error
    return createErrorResponse(
      "Internal server error",
      error.message || "An unexpected error occurred",
      process.env.NODE_ENV === "development" ? error.stack : undefined,
      500
    );
  }
}
