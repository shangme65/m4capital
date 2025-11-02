import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Initialize or update the origin admin user
 * This endpoint can be called to ensure the super admin exists
 * GET request to keep it simple and accessible
 */
export async function GET() {
  const email = process.env.ORIGIN_ADMIN_EMAIL;
  const password = process.env.ORIGIN_ADMIN_PASSWORD;
  const name = process.env.ORIGIN_ADMIN_NAME || "Super Admin";

  // Validate environment variables
  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        error: "Origin admin credentials not set in environment variables",
        hint: "Set ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD in .env file",
      },
      { status: 400 }
    );
  }

  try {
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
          deletedAt: null,
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

      return NextResponse.json({
        success: true,
        message: "Origin admin updated successfully",
        admin: updatedAdmin,
        action: "updated",
      });
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

      return NextResponse.json({
        success: true,
        message: "Origin admin created successfully",
        admin: newAdmin,
        action: "created",
      });
    }
  } catch (error) {
    console.error("Failed to initialize origin admin:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize origin admin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
