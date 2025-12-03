import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        preferredCurrency: true,
        preferredLanguage: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      preferredCurrency: user.preferredCurrency,
      preferredLanguage: user.preferredLanguage || "en",
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferredCurrency, preferredLanguage } = body;

    // Build update data object
    const updateData: {
      preferredCurrency?: string;
      preferredLanguage?: string;
    } = {};

    if (preferredCurrency && typeof preferredCurrency === "string") {
      updateData.preferredCurrency = preferredCurrency;
    }

    if (preferredLanguage && typeof preferredLanguage === "string") {
      updateData.preferredLanguage = preferredLanguage;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid preferences provided" },
        { status: 400 }
      );
    }

    // Update user's preferences
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        preferredCurrency: true,
        preferredLanguage: true,
      },
    });

    return NextResponse.json({
      message: "Preferences updated successfully",
      preferredCurrency: updatedUser.preferredCurrency,
      preferredLanguage: updatedUser.preferredLanguage,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
