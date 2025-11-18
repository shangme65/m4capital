import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAccountNumber } from "@/lib/p2p-transfer-utils";

/**
 * POST /api/admin/regenerate-account-numbers
 * Regenerate account numbers for all users with randomized digits
 * Admin only
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        accountNumber: true,
      },
    });

    console.log(`Found ${allUsers.length} users to update`);

    const updates = [];

    // Update each user with a unique randomized account number
    for (const userToUpdate of allUsers) {
      let accountNumber: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      // Generate unique account number
      while (!isUnique && attempts < maxAttempts) {
        accountNumber = generateAccountNumber();

        // Check if account number already exists
        const existing = await prisma.user.findFirst({
          where: {
            accountNumber,
            id: { not: userToUpdate.id },
          },
        });

        if (!existing) {
          isUnique = true;

          // Update user with account number
          await prisma.user.update({
            where: { id: userToUpdate.id },
            data: { accountNumber },
          });

          updates.push({
            userId: userToUpdate.id,
            name: userToUpdate.name || "Unknown",
            email: userToUpdate.email,
            oldAccountNumber: userToUpdate.accountNumber,
            newAccountNumber: accountNumber,
          });

          console.log(
            `Updated ${userToUpdate.name || userToUpdate.email}: ${
              userToUpdate.accountNumber
            } → ${accountNumber}`
          );
        }

        attempts++;
      }

      if (attempts >= maxAttempts) {
        console.error(
          `Failed to generate unique account number for ${userToUpdate.email}`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updates.length} users`,
      updates,
    });
  } catch (error) {
    console.error("Error regenerating account numbers:", error);
    return NextResponse.json(
      { error: "Failed to regenerate account numbers" },
      { status: 500 }
    );
  }
}
