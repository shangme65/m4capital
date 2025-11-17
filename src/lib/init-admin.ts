import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateId } from "@/lib/generate-id";

/**
 * Initialize or update the origin admin user from environment variables
 * This ensures there's always a super admin who can access the system
 * No email verification required for origin admin
 */
export async function initializeOriginAdmin() {
  const email = process.env.ORIGIN_ADMIN_EMAIL;
  const password = process.env.ORIGIN_ADMIN_PASSWORD;
  const name = process.env.ORIGIN_ADMIN_NAME || "Super Admin";

  // Skip if environment variables are not set
  if (!email || !password) {
    console.log(
      "⚠️  Origin admin credentials not set in environment variables"
    );
    return;
  }

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdmin) {
      // Update existing admin
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          isDeleted: false, // Ensure not deleted
        },
      });
      console.log("✅ Origin admin updated:", email);
    } else {
      // Create new admin
      await prisma.user.create({
        data: {
          id: generateId(),
          email,
          password: hashedPassword,
          name,
          role: "ADMIN",
          emailVerified: new Date(), // NextAuth field
          isEmailVerified: true, // Custom verification field
          accountType: "INVESTOR",
          updatedAt: new Date(),
        },
      });
      console.log("✅ Origin admin created:", email);
    }
  } catch (error) {
    console.error("❌ Failed to initialize origin admin:", error);
  }
}
