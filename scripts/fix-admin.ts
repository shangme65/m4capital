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
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log("Starting admin role fix...");

    // Get admin credentials from environment variables
    const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
    const adminPasswordRaw = process.env.ORIGIN_ADMIN_PASSWORD;

    if (!adminEmail || !adminPasswordRaw) {
      console.error(
        "❌ ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD must be set in .env"
      );
      process.exit(1);
    }

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          isEmailVerified: true,
        },
      });

      console.log(
        `✓ Updated ${updatedUser.email} to ADMIN role (ID: ${updatedUser.id})`
      );
    } else {
      // Create new admin user from environment variables
      const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);

      const newAdminUser = await prisma.user.create({
        data: {
          name: process.env.ORIGIN_ADMIN_NAME || "Admin",
          email: adminEmail,
          password: adminPassword,
          role: "ADMIN",
          accountType: "INVESTOR",
          isEmailVerified: true,
          portfolio: {
            create: {
              balance: 0,
              assets: [],
            },
          },
        },
      });

      console.log(
        `✓ Created new admin user: ${newAdminUser.email} (ID: ${newAdminUser.id})`
      );
    }

    console.log("\n✅ Admin fix completed successfully!");
    console.log("\n⚠️  SECURITY REMINDER:");
    console.log("   - Verify admin access is working");
    console.log("   - Review all admin accounts");
  } catch (error: any) {
    console.error("❌ Fix admin error:", error.message);
    if (error.code === "P2025") {
      console.error(
        "\nUser not found. Please check ORIGIN_ADMIN_EMAIL in .env"
      );
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
fixAdmin();
