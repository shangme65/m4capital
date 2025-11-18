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
  const adminCurrency = process.env.ORIGIN_ADMIN_CURRENCY || "USD";

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
  const adminAccountNumber = generateAccountNumber();
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
          dateOfBirth: "1990-01-01",
          nationality: "US",
          phoneNumber: "+1234567890",
          address: "Admin Address",
          city: "Admin City",
          postalCode: "00000",
          country: "US",
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
