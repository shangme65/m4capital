import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";

/**
 * Initialize or update the origin admin user
 * SECURITY: This endpoint can only be called once, or by existing admins
 * GET request to keep it simple and accessible
 */
export async function GET(request: Request) {
  // Apply strict rate limiting
  const rateLimitResult = await rateLimiters.strict(request as any);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const email = process.env.ORIGIN_ADMIN_EMAIL;
  const password = process.env.ORIGIN_ADMIN_PASSWORD;
  const name = process.env.ORIGIN_ADMIN_NAME || "Super Admin";

  // Validate environment variables
  if (!email || !password) {
    return createErrorResponse(
      "Configuration error",
      "Origin admin credentials not set in environment variables. Set ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD in .env file",
      undefined,
      400
    );
  }

  // SECURITY CHECK: Only allow if no admin exists OR caller is already an admin
  const session = await getServerSession(authOptions);
  const existingAdmins = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const isCallerAdmin = session?.user && (session.user as any).role === "ADMIN";

  if (existingAdmins > 0 && !isCallerAdmin) {
    return createErrorResponse(
      "Forbidden",
      "Admin already exists. Only existing admins can modify the origin admin account.",
      undefined,
      403
    );
  }

  try {
    // First, set all existing admins' isOriginAdmin to false
    await prisma.user.updateMany({
      where: {
        role: "ADMIN",
        isOriginAdmin: true,
      },
      data: {
        isOriginAdmin: false,
      },
    });

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      // Update existing admin - ensure they're active, verified, and have admin role
      const updatedAdmin = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          isDeleted: false, // Ensure not deleted
          isOriginAdmin: true, // Mark as the current origin admin
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      // Ensure KYC verification exists and is approved for admin
      const existingKyc = await prisma.kycVerification.findUnique({
        where: { userId: existingAdmin.id },
      });

      if (!existingKyc) {
        await prisma.kycVerification.create({
          data: {
            userId: existingAdmin.id,
            firstName: name.split(" ")[0] || "Admin",
            lastName: name.split(" ").slice(1).join(" ") || "User",
            dateOfBirth: "1990-01-01",
            nationality: "US",
            phoneNumber: "+1234567890",
            address: "Admin Address",
            city: "Admin City",
            postalCode: "00000",
            country: "US",
            idDocumentUrl: "admin-verified",
            proofOfAddressUrl: "admin-verified",
            selfieUrl: "admin-verified",
            status: "APPROVED",
            reviewedBy: "System",
            reviewedAt: new Date(),
          },
        });
      } else if (existingKyc.status !== "APPROVED") {
        await prisma.kycVerification.update({
          where: { userId: existingAdmin.id },
          data: {
            status: "APPROVED",
            reviewedBy: "System",
            reviewedAt: new Date(),
          },
        });
      }

      return createSuccessResponse(
        {
          admin: updatedAdmin,
          action: "updated",
        },
        "Origin admin updated successfully"
      );
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          accountType: "INVESTOR",
          isOriginAdmin: true, // Mark as the current origin admin
          portfolio: {
            create: {
              balance: 0,
              assets: [],
            },
          },
          kycVerification: {
            create: {
              firstName: name.split(" ")[0] || "Admin",
              lastName: name.split(" ").slice(1).join(" ") || "User",
              dateOfBirth: "1990-01-01",
              nationality: "US",
              phoneNumber: "+1234567890",
              address: "Admin Address",
              city: "Admin City",
              postalCode: "00000",
              country: "US",
              idDocumentUrl: "admin-verified",
              proofOfAddressUrl: "admin-verified",
              selfieUrl: "admin-verified",
              status: "APPROVED",
              reviewedBy: "System",
              reviewedAt: new Date(),
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      return createSuccessResponse(
        {
          admin: newAdmin,
          action: "created",
        },
        "Origin admin created successfully"
      );
    }
  } catch (error) {
    console.error("Init admin error:", error);
    return createErrorResponse(
      "Internal server error",
      "Failed to initialize admin account",
      error,
      500
    );
  }
}
