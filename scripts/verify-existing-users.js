import { prisma } from "../src/lib/prisma";

async function verifyExistingUsers() {
  console.log("Starting to verify existing unverified users...\n");

  try {
    // Find all users who are not email verified and were created before email verification feature
    const unverifiedUsers = await prisma.user.findMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: new Date("2025-11-01"), // Users created before Nov 1, 2025
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    console.log(
      `Found ${unverifiedUsers.length} unverified users created before email verification feature.\n`
    );

    if (unverifiedUsers.length === 0) {
      console.log("✓ No users need verification update.");
      return;
    }

    // Update them to verified
    const result = await prisma.user.updateMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: new Date("2025-11-01"),
        },
      },
      data: {
        isEmailVerified: true,
      },
    });

    console.log(`✓ Successfully verified ${result.count} existing users.\n`);

    console.log("Updated users:");
    unverifiedUsers.forEach((user) => {
      console.log(
        `  - ${user.email} (${
          user.role
        }) - Created: ${user.createdAt.toLocaleDateString()}`
      );
    });

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("✗ Error during migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyExistingUsers();
