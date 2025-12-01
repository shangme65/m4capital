import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        tutorialCompleted: true,
      },
      select: {
        id: true,
        tutorialCompleted: true,
      },
    });

    return NextResponse.json({
      success: true,
      tutorialCompleted: user.tutorialCompleted,
    });
  } catch (error) {
    console.error("Error completing tutorial:", error);
    return NextResponse.json(
      { error: "Failed to complete tutorial" },
      { status: 500 }
    );
  }
}
