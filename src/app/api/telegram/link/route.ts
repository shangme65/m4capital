import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/link
 * Generate a link code for Telegram account linking
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate 6-digit code
    const linkCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the link code in user metadata or create a temporary table
    // For now, we'll store it in the User model's metadata
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        // We'll use a JSON field or create a separate linking table
        // For now, let's create a simple approach
      },
    });

    // Better approach: Create a temporary linking table entry
    // Delete old expired codes first
    await prisma.$executeRaw`
      DELETE FROM "TelegramLinkCode" 
      WHERE "expiresAt" < NOW()
    `;

    // Create new link code
    await prisma.$executeRaw`
      INSERT INTO "TelegramLinkCode" ("userId", "code", "expiresAt")
      VALUES (${session.user.id}, ${linkCode}, ${expiresAt})
      ON CONFLICT ("userId") 
      DO UPDATE SET "code" = ${linkCode}, "expiresAt" = ${expiresAt}, "createdAt" = NOW()
    `;

    return NextResponse.json({
      success: true,
      code: linkCode,
      expiresAt: expiresAt.toISOString(),
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Error generating link code:", error);
    return NextResponse.json(
      { error: "Failed to generate link code" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/telegram/link
 * Verify and link Telegram account using code
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code required" }, { status: 400 });
    }

    // Find the link code
    const linkData = await prisma.$queryRaw<
      Array<{
        userId: string;
        expiresAt: Date;
      }>
    >`
      SELECT "userId", "expiresAt" 
      FROM "TelegramLinkCode"
      WHERE "code" = ${code}
      AND "expiresAt" > NOW()
      LIMIT 1
    `;

    if (!linkData || linkData.length === 0) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired code. Please generate a new code in Telegram using /link",
        },
        { status: 400 }
      );
    }

    const codeUserId = linkData[0].userId;

    if (codeUserId !== session.user.id) {
      return NextResponse.json(
        { error: "This code belongs to a different account" },
        { status: 403 }
      );
    }

    // Get the TelegramUser who generated this code
    const telegramUser = await prisma.telegramUser.findFirst({
      where: {
        linkCode: code,
        linkCodeExpiresAt: { gte: new Date() },
      },
      select: {
        telegramId: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!telegramUser) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Link the Telegram account to the user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        linkedTelegramId: telegramUser.telegramId,
        linkedTelegramUsername: telegramUser.username,
      },
    });

    // Clear the link code from TelegramUser
    await prisma.telegramUser.update({
      where: { telegramId: telegramUser.telegramId },
      data: {
        linkCode: null,
        linkCodeExpiresAt: null,
      },
    });

    // Delete used code from TelegramLinkCode table
    await prisma.$executeRaw`
      DELETE FROM "TelegramLinkCode" 
      WHERE "code" = ${code}
    `;

    return NextResponse.json({
      success: true,
      message: "Telegram account linked successfully",
      telegramUsername: telegramUser.username,
    });
  } catch (error) {
    console.error("Error linking Telegram account:", error);
    return NextResponse.json(
      { error: "Failed to link Telegram account" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telegram/link
 * Check if user's Telegram is already linked
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has a linked Telegram account
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        linkedTelegramId: true,
        linkedTelegramUsername: true,
      },
    });

    const isLinked = !!user?.linkedTelegramId;

    return NextResponse.json({
      linked: isLinked,
      telegramUsername: user?.linkedTelegramUsername || null,
    });
  } catch (error) {
    console.error("Error checking link status:", error);
    return NextResponse.json(
      { error: "Failed to check link status" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telegram/link
 * Unlink Telegram account from user
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Unlink Telegram account
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        linkedTelegramId: null,
        linkedTelegramUsername: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Telegram account unlinked successfully",
    });
  } catch (error) {
    console.error("Error unlinking Telegram account:", error);
    return NextResponse.json(
      { error: "Failed to unlink Telegram account" },
      { status: 500 }
    );
  }
}
