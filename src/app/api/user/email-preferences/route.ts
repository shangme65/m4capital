import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET email notification preferences
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailNotifications: true,
        kycNotifications: true,
        tradingNotifications: true,
        securityNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch email preferences" },
      { status: 500 }
    );
  }
}

// PUT update email notification preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      emailNotifications,
      kycNotifications,
      tradingNotifications,
      securityNotifications,
    } = body;

    // Build update object with only provided fields
    const updateData: any = {};
    if (typeof emailNotifications === "boolean") {
      updateData.emailNotifications = emailNotifications;
    }
    if (typeof kycNotifications === "boolean") {
      updateData.kycNotifications = kycNotifications;
    }
    if (typeof tradingNotifications === "boolean") {
      updateData.tradingNotifications = tradingNotifications;
    }
    if (typeof securityNotifications === "boolean") {
      updateData.securityNotifications = securityNotifications;
    }

    // If emailNotifications is disabled, disable all sub-notifications
    if (emailNotifications === false) {
      updateData.kycNotifications = false;
      updateData.tradingNotifications = false;
      updateData.securityNotifications = false;
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        emailNotifications: true,
        kycNotifications: true,
        tradingNotifications: true,
        securityNotifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email preferences updated successfully",
      preferences: user,
    });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return NextResponse.json(
      { error: "Failed to update email preferences" },
      { status: 500 }
    );
  }
}
