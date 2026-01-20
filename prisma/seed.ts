import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateId } from "../src/lib/generate-id";
import { generateAccountNumber } from "../src/lib/p2p-transfer-utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Admin creation is now handled via /setup-admin endpoint only
  console.log("ℹ️  Admin users should be created via /setup-admin endpoint");
  console.log("ℹ️  Set ORIGIN_ADMIN_EMAIL and ORIGIN_ADMIN_PASSWORD in .env");
  console.log("ℹ️  Then visit /setup-admin to initialize the admin account");
  
  // Add any other seed data here (e.g., default system settings, categories, etc.)
  // But never create user accounts during seed
  
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
