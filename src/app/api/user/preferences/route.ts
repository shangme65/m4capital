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
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      preferredCurrency: user.preferredCurrency,
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
    const { preferredCurrency } = body;

    if (!preferredCurrency || typeof preferredCurrency !== "string") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // Update user's preferred currency
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        preferredCurrency,
      },
      select: {
        preferredCurrency: true,
      },
    });

    return NextResponse.json({
      message: "Currency preference updated successfully",
      preferredCurrency: updatedUser.preferredCurrency,
    });
  } catch (error) {
    console.error("Error updating currency preference:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
