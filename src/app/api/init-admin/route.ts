import { generateId } from "@/lib/generate-id";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimiters } from "@/lib/middleware/ratelimit";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/middleware/errorHandler";
import { COUNTRY_CURRENCY_MAP } from "@/lib/country-currencies";
import { countries } from "@/lib/countries";
import { generateAccountNumber } from "@/lib/p2p-transfer-utils";

/**
 * Initialize or update the origin admin user
 * SECURITY: This endpoint can only be called once, or by existing admins
 * GET request to keep it simple and accessible
 */
export async function GET(request: Request) {
  // Apply strict rate limiting
  const rateLimitResult = await rateLimiters.strict(request as any);
  if (rateLimitResult instanceof NextResponse) {
    return rateLimitResult;
  }

  const email = process.env.ORIGIN_ADMIN_EMAIL;
  const password = process.env.ORIGIN_ADMIN_PASSWORD;
  const name = process.env.ORIGIN_ADMIN_NAME || "Super Admin";
  const country = process.env.ORIGIN_ADMIN_COUNTRY || "United States";

  // Auto-determine currency from country (no need for ORIGIN_ADMIN_CURRENCY env var)
  let preferredCurrency = "USD"; // Default
  const countryData = countries.find((c) => c.name === country);
  if (countryData && COUNTRY_CURRENCY_MAP[countryData.code]) {
    preferredCurrency = COUNTRY_CURRENCY_MAP[countryData.code];
  }

  // Auto-generate account number if not in env vars
  const accountNumber =
    process.env.ORIGIN_ADMIN_ACCOUNT_NUMBER || generateAccountNumber();

  // Validate environment variables
  if (!email || !password) {
    return createErrorResponse(
      "Configuration error",
      "Origin admin credentials not set in environment variables. Set ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD in .env file",
      undefined,
      400
    );
  }

  // SECURITY CHECK: Only allow if no admin exists OR caller is already an admin
  const session = await getServerSession(authOptions);
  const existingAdmins = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const isCallerAdmin = session?.user && (session.user as any).role === "ADMIN";

  if (existingAdmins > 0 && !isCallerAdmin) {
    return createErrorResponse(
      "Forbidden",
      "Admin already exists. Only existing admins can modify the origin admin account.",
      undefined,
      403
    );
  }

  try {
    // First, set all existing admins' isOriginAdmin to false
    await prisma.user.updateMany({
      where: {
        role: "ADMIN",
        isOriginAdmin: true,
      },
      data: {
        isOriginAdmin: false,
      },
    });

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      // Update existing admin - ensure they're active, verified, and have admin role
      const updatedAdmin = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          isDeleted: false, // Ensure not deleted
          isOriginAdmin: true, // Mark as the current origin admin
          country,
          preferredCurrency, // Auto-determined from country
          accountNumber, // Auto-generated or from env
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      // Ensure portfolio exists for admin
      const existingPortfolio = await prisma.portfolio.findUnique({
        where: { userId: existingAdmin.id },
      });

      if (!existingPortfolio) {
        await prisma.portfolio.create({
          data: {
            id: generateId(),
            userId: existingAdmin.id,
            balance: 0,
            assets: [],
          },
        });
      }

      // Ensure KYC verification exists and is approved for admin
      const existingKyc = await prisma.kycVerification.findUnique({
        where: { userId: existingAdmin.id },
      });

      if (!existingKyc) {
        // Get country code for nationality
        const adminCountryCode = countryData?.code || "US";

        await prisma.kycVerification.create({
          data: {
            id: generateId(),
            userId: existingAdmin.id,
            firstName: name.split(" ")[0] || "Admin",
            lastName: name.split(" ").slice(1).join(" ") || "User",
            dateOfBirth: process.env.ORIGIN_ADMIN_DOB || "1990-01-01",
            nationality: adminCountryCode,
            phoneNumber: process.env.ORIGIN_ADMIN_PHONE || "+55234567890",
            address: process.env.ORIGIN_ADMIN_ADDRESS || "Admin Address",
            city: process.env.ORIGIN_ADMIN_CITY || "Admin City",
            postalCode: process.env.ORIGIN_ADMIN_POSTAL_CODE || "00000",
            country: adminCountryCode,
            idDocumentUrl: "admin-verified",
            proofOfAddressUrl: "admin-verified",
            selfieUrl: "admin-verified",
            status: "APPROVED",
            reviewedBy: "System",
            reviewedAt: new Date(),
            updatedAt: new Date(),
          },
        });
      } else if (existingKyc.status !== "APPROVED") {
        await prisma.kycVerification.update({
          where: { userId: existingAdmin.id },
          data: {
            status: "APPROVED",
            reviewedBy: "System",
            reviewedAt: new Date(),
          },
        });
      }

      return createSuccessResponse(
        {
          admin: updatedAdmin,
          action: "updated",
          autoLoginReady: true,
        },
        "Origin admin updated successfully. Please login with your .env credentials."
      );
    } else {
      // Create new admin
      const newAdmin = await prisma.user.create({
        data: {
          id: generateId(),
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          accountType: "INVESTOR",
          isOriginAdmin: true, // Mark as the current origin admin
          country,
          preferredCurrency, // Auto-determined from country
          accountNumber, // Auto-generated or from env
          updatedAt: new Date(),
          Portfolio: {
            create: {
              id: generateId(),
              balance: 0,
              assets: [],
            },
          },
          KycVerification: {
            create: {
              id: generateId(),
              firstName: name.split(" ")[0] || "Admin",
              lastName: name.split(" ").slice(1).join(" ") || "User",
              dateOfBirth: process.env.ORIGIN_ADMIN_DOB || "1990-01-01",
              nationality: countryData?.code || "US",
              phoneNumber: process.env.ORIGIN_ADMIN_PHONE || "+1234567890",
              address: process.env.ORIGIN_ADMIN_ADDRESS || "Admin Address",
              city: process.env.ORIGIN_ADMIN_CITY || "Admin City",
              postalCode: process.env.ORIGIN_ADMIN_POSTAL_CODE || "00000",
              country: countryData?.code || "US",
              idDocumentUrl: "admin-verified",
              proofOfAddressUrl: "admin-verified",
              selfieUrl: "admin-verified",
              status: "APPROVED",
              reviewedBy: "System",
              reviewedAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      return createSuccessResponse(
        {
          admin: newAdmin,
          action: "created",
          autoLoginReady: true,
        },
        "Origin admin created successfully. Please login with your .env credentials."
      );
    }
  } catch (error) {
    console.error("Init admin error:", error);
    return createErrorResponse(
      "Internal server error",
      "Failed to initialize admin account",
      error,
      500
    );
  }
}
