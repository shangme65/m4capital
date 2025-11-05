#!/usr/bin/env ts-node

/**
 * Fix Admin Migration Script
 * This script updates existing users to have admin role
 * Run this script manually when needed, not as an API endpoint
 *
 * Usage:
 *   npx ts-node scripts/fix-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log("Starting admin role fix...");

    // Update the existing user to ADMIN role
    const updatedUser = await prisma.user.update({
      where: { email: "admin@m4capital.com" },
      data: { role: "ADMIN" },
    });

    console.log(
      `✓ Updated ${updatedUser.email} to ADMIN role (ID: ${updatedUser.id})`
    );

    // Check if admin@m4capital user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@m4capital" },
    });

    if (!existingAdmin) {
      // Create the admin@m4capital user if needed
      const adminPassword = await bcrypt.hash("password123", 10);

      const newAdminUser = await prisma.user.create({
        data: {
          name: "Admin User",
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
              ],
            },
          },
        },
      });

      console.log(
        `✓ Created new admin user: ${newAdminUser.email} (ID: ${newAdminUser.id})`
      );
      console.log(
        `  Credentials: ${newAdminUser.email} / password123 (CHANGE THIS!)`
      );
    } else {
      console.log(`✓ Admin user ${existingAdmin.email} already exists`);
    }

    console.log("\n✅ Admin fix completed successfully!");
    console.log("\n⚠️  SECURITY REMINDER:");
    console.log("   - Change default passwords immediately");
    console.log("   - Verify admin access is working");
    console.log("   - Review all admin accounts");
  } catch (error: any) {
    console.error("❌ Fix admin error:", error.message);
    if (error.code === "P2025") {
      console.error(
        "\nUser not found. Please check the email address in the script."
      );
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixAdmin();
