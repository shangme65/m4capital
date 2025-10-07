import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create a sample admin user
  const adminPassword = await bcrypt.hash("password123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@m4capital.com",
      password: adminPassword,
      role: "ADMIN",
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

  // Create a sample regular user
  const userPassword = await bcrypt.hash("password123", 10);
  const regularUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "user@m4capital.com",
      password: userPassword,
      role: "USER",
      portfolio: {
        create: {
          balance: 5000.0,
          assets: [{ symbol: "ADA", amount: 5000 }],
        },
      },
    },
  });

  // Create sample deposits for the regular user
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

  console.log(`Created admin user: ${adminUser.email}`);
  console.log(`Created regular user: ${regularUser.email}`);
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
