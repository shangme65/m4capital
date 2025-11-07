import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // Delete all expired sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    return NextResponse.json({
      message: "Cleared expired sessions",
      count: deletedSessions.count,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to clear sessions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
