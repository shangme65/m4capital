import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
    const adminPasswordRaw = process.env.ORIGIN_ADMIN_PASSWORD;
    const adminCountry = process.env.ORIGIN_ADMIN_COUNTRY || "United States";
    const adminCurrency = process.env.ORIGIN_ADMIN_CURRENCY || "USD";

    if (!adminEmail || !adminPasswordRaw) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD must be set in environment variables",
        },
        { status: 500 }
      );
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          isEmailVerified: true,
          country: adminCountry,
          preferredCurrency: adminCurrency,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Updated existing user to ADMIN role",
        user: { email: updatedUser.email, role: updatedUser.role },
      });
    } else {
      // Create new admin user from environment variables
      const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);

      const newAdminUser = await prisma.user.create({
        data: {
          name: process.env.ORIGIN_ADMIN_NAME || "Admin",
          email: adminEmail,
          password: adminPassword,
          role: "ADMIN",
          accountType: "INVESTOR",
          isEmailVerified: true,
          country: adminCountry,
          preferredCurrency: adminCurrency,
          portfolio: {
            create: {
              balance: 0,
              assets: [],
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Created new admin user successfully",
        user: { email: newAdminUser.email, role: newAdminUser.role },
      });
    }
  } catch (error) {
    console.error("Fix admin error:", error);
    return NextResponse.json(
      { error: "Failed to fix admin role", details: error },
      { status: 500 }
    );
  }
}
