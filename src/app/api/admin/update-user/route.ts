import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { prisma } from "@/lib/prisma";

// PATCH: Update user data (admin only)
export async function PATCH(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.admin(req);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Check admin authentication
  const { error, session } = await requireAdmin(req);
  if (error) return error;

  const { userId, data } = await req.json();
  if (!userId || !data) {
    return createErrorResponse(
      "Invalid input",
      "Missing userId or data",
      undefined,
      400
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return createSuccessResponse(
      { user: updatedUser },
      "User updated successfully"
    );
  } catch (error) {
    console.error("Update user error:", error);
    return createErrorResponse(
      "Update failed",
      "Failed to update user",
      error,
      500
    );
  }
}

// PUT: Update user role specifically (admin only)
export async function PUT(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.admin(req);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  // Check admin authentication
  const { error, session } = await requireAdmin(req);
  if (error) return error;

  const { userId, role } = await req.json();
  if (!userId || !role) {
    return createErrorResponse(
      "Invalid input",
      "Missing userId or role",
      undefined,
      400
    );
  }

  // Validate role
  if (!["USER", "ADMIN"].includes(role)) {
    return createErrorResponse(
      "Invalid role",
      "Role must be USER or ADMIN",
      undefined,
      400
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return createSuccessResponse(
      { user: updatedUser },
      "User role updated successfully"
    );
  } catch (error) {
    console.error("Update user role error:", error);
    return createErrorResponse(
      "Update failed",
      "Failed to update user role",
      error,
      500
    );
  }
}
