import { PrismaClient } from "@prisma/client";
import { generateId } from "../src/lib/generate-id";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Fixing admin portfolio...");

  const adminEmail = process.env.ORIGIN_ADMIN_EMAIL;
  if (!adminEmail) {
    console.error("❌ ORIGIN_ADMIN_EMAIL not set in .env");
    process.exit(1);
  }

  // Find admin user
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { Portfolio: true },
  });

  if (!admin) {
    console.error(`❌ Admin user not found: ${adminEmail}`);
    process.exit(1);
  }

  if (admin.Portfolio) {
    console.log("✅ Admin already has a portfolio");
    return;
  }

  // Create portfolio for admin
  const portfolio = await prisma.portfolio.create({
    data: {
      id: generateId(),
      userId: admin.id,
      balance: 0,
      assets: [],
    },
  });

  console.log(`✅ Created portfolio for admin: ${portfolio.id}`);
  console.log("✅ Portfolio fix complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
