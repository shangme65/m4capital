import { PrismaClient } from "@prisma/client";
import { generateAccountNumber } from "../src/lib/p2p-transfer-utils";

const prisma = new PrismaClient();

async function updateExistingUsers() {
  console.log("🔄 Updating existing users with account numbers...");

  try {
    // Get all users without account numbers
    const usersWithoutAccountNumbers = await prisma.user.findMany({
      where: {
        accountNumber: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (usersWithoutAccountNumbers.length === 0) {
      console.log("✅ All users already have account numbers");
      return;
    }

    console.log(
      `📝 Found ${usersWithoutAccountNumbers.length} users without account numbers`
    );

    // Update each user with a unique account number
    for (const user of usersWithoutAccountNumbers) {
      let accountNumber: string;
      let isUnique = false;

      // Generate unique account number
      while (!isUnique) {
        accountNumber = generateAccountNumber();

        // Check if account number already exists
        const existing = await prisma.user.findUnique({
          where: { accountNumber },
        });

        if (!existing) {
          isUnique = true;

          // Update user with account number
          await prisma.user.update({
            where: { id: user.id },
            data: { accountNumber },
          });

          console.log(
            `✅ Updated ${
              user.name || user.email
            }: Account Number ${accountNumber}`
          );
        }
      }
    }

    console.log(
      `🎉 Successfully updated ${usersWithoutAccountNumbers.length} users`
    );
  } catch (error) {
    console.error("❌ Error updating users:", error);
    throw error;
  }
}

updateExistingUsers()
  .then(() => {
    console.log("✨ Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to run migration:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
