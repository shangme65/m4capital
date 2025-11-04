import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function addAdminUser() {
  console.log("Adding admin user with email: admin@m4capital");

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@m4capital" },
    });

    if (existingUser) {
      console.log("User admin@m4capital already exists!");
      console.log("Updating to ADMIN role...");

      const updatedUser = await prisma.user.update({
        where: { email: "admin@m4capital" },
        data: {
          role: "ADMIN",
          isEmailVerified: true,
        },
      });

      console.log(`Updated user role to: ${updatedUser.role}`);
    } else {
      // Create new admin user
      const adminPassword = await bcrypt.hash("password123", 10);
      const adminUser = await prisma.user.create({
        data: {
          name: "Main Admin",
          email: "admin@m4capital",
          password: adminPassword,
          role: "ADMIN",
          accountType: "INVESTOR",
          isEmailVerified: true,
          portfolio: {
            create: {
              balance: 1000000.0,
              assets: [
                { symbol: "BTC", amount: 5 },
                { symbol: "ETH", amount: 50 },
                { symbol: "ADA", amount: 10000 },
              ],
            },
          },
        },
      });

      console.log(
        `Created new admin user: ${adminUser.email} with role: ${adminUser.role}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminUser();
