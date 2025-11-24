import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateId } from "../src/lib/generate-id";
import { generateAccountNumber } from "../src/lib/p2p-transfer-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Get admin credentials from environment variables
  const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
  const adminPasswordRaw = process.env.ORIGIN_ADMIN_PASSWORD;
  const adminCountry = process.env.ORIGIN_ADMIN_COUNTRY || "United States";

  // Auto-determine currency from country (no need for ORIGIN_ADMIN_CURRENCY)
  const { COUNTRY_CURRENCY_MAP } = await import(
    "../src/lib/country-currencies"
  );
  const { countries } = await import("../src/lib/countries");
  let adminCurrency = "USD"; // Default
  const countryData = countries.find((c: any) => c.name === adminCountry);
  if (countryData && COUNTRY_CURRENCY_MAP[countryData.code]) {
    adminCurrency = COUNTRY_CURRENCY_MAP[countryData.code];
  }

  if (!adminEmail || !adminPasswordRaw) {
    console.error(
      "❌ ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD must be set in .env"
    );
    process.exit(1);
  }

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin user already exists: ${existingAdmin.email}`);
    console.log("⏭️  Skipping admin creation");
    return;
  }

  // Create admin user from environment variables
  const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);

  // Get admin account number from env or generate one
  const adminAccountNumber =
    process.env.ORIGIN_ADMIN_ACCOUNT_NUMBER || generateAccountNumber();

  // Get country code for nationality
  const adminCountryCode = countryData?.code || "US";

  const adminUser = await prisma.user.create({
    data: {
      id: generateId(),
      name: process.env.ORIGIN_ADMIN_NAME || "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
      accountType: "INVESTOR",
      country: adminCountry,
      preferredCurrency: adminCurrency,
      accountNumber: adminAccountNumber,
      updatedAt: new Date(),
      Portfolio: {
        create: {
          id: generateId(),
        },
      },
      KycVerification: {
        create: {
          id: generateId(),
          firstName: process.env.ORIGIN_ADMIN_NAME?.split(" ")[0] || "Admin",
          lastName:
            process.env.ORIGIN_ADMIN_NAME?.split(" ").slice(1).join(" ") ||
            "User",
          dateOfBirth: process.env.ORIGIN_ADMIN_DOB || "1990-01-01",
          nationality: adminCountryCode,
          phoneNumber: process.env.ORIGIN_ADMIN_PHONE || "+1234567890",
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
      },
    },
  });

  console.log(`✅ Created admin user: ${adminUser.email}`);
  console.log("✅ Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
