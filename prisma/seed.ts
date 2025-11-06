import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Get admin credentials from environment variables
  const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
  const adminPasswordRaw = process.env.ORIGIN_ADMIN_PASSWORD;

  if (!adminEmail || !adminPasswordRaw) {
    console.error(
      "❌ ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD must be set in .env"
    );
    process.exit(1);
  }

  // Create admin user from environment variables
  const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
      accountType: "INVESTOR",
      portfolio: {
        create: {
          balance: 1000000.0,
          assets: [
            { symbol: "BTC", amount: 10 },
            { symbol: "ETH", amount: 100 },
          ],
        },
      },
    },
  });

  // Create a sample test user (optional - only in development)
  if (process.env.NODE_ENV !== "production") {
    const testPassword = process.env.TEST_USER_PASSWORD || "test-password-change-me";
    const userPassword = await bcrypt.hash(testPassword, 10);
    const regularUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@example.com",
        password: userPassword,
        role: "USER",
        accountType: "INVESTOR",
        isEmailVerified: true,
        portfolio: {
          create: {
            balance: 5000.0,
            assets: [{ symbol: "ADA", amount: 5000 }],
          },
        },
      },
    });

    // Create sample deposits for the test user
    await prisma.deposit.createMany({
      data: [
        {
          portfolioId: regularUser.id,
          amount: 2000.0,
          currency: "USD",
          status: "COMPLETED",
        },
        {
          portfolioId: regularUser.id,
          amount: 3000.0,
          currency: "USD",
          status: "COMPLETED",
        },
      ],
    });

    console.log(`Created test user: ${regularUser.email}`);
  }

  console.log(`Created admin user: ${adminUser.email}`);
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
