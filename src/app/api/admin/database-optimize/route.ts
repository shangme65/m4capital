import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run database optimization commands
    // For PostgreSQL, this would be VACUUM and ANALYZE
    // Using Prisma's raw query capability

    try {
      // Execute VACUUM (reclaim storage)
      await prisma.$executeRawUnsafe("VACUUM;");

      // Execute ANALYZE (update statistics)
      await prisma.$executeRawUnsafe("ANALYZE;");

      return NextResponse.json({
        success: true,
        message: "Database optimized successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Optimization execution error:", error);
      return NextResponse.json(
        { error: "Failed to execute optimization commands" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error optimizing database:", error);
    return NextResponse.json(
      { error: "Failed to optimize database" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
