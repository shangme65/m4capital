import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    // Update the existing user to ADMIN role
    const updatedUser = await prisma.user.update({
      where: { email: "admin@m4capital.com" },
      data: { role: "ADMIN" },
    });

    // Also create the admin@m4capital user if needed
    const adminPassword = await bcrypt.hash("password123", 10);

    try {
      const newAdminUser = await prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@m4capital",
          password: adminPassword,
          role: "ADMIN",
          accountType: "INVESTOR",
          portfolio: {
            create: {
              balance: 1000000.0,
              assets: [
                { symbol: "BTC", amount: 5 },
                { symbol: "ETH", amount: 50 },
              ],
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Fixed admin roles successfully",
        updatedUser: updatedUser,
        newAdminUser: newAdminUser,
      });
    } catch (createError) {
      // User might already exist, that's ok
      return NextResponse.json({
        success: true,
        message: "Updated existing admin role successfully",
        updatedUser: updatedUser,
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
