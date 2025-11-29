import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        role: true,
        isOriginAdmin: true,
        tutorialCompleted: true,
        isVerified: true,
        verifiedAt: true,
        KycVerification: {
          select: {
            status: true,
            submittedAt: true,
            reviewedAt: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Admins and origin admins are always considered verified
    const isAdmin = user.role === "ADMIN" || user.isOriginAdmin;
    const isVerified =
      isAdmin || user.isVerified || user.KycVerification?.status === "APPROVED";

    return NextResponse.json({
      tutorialCompleted: isAdmin ? true : user.tutorialCompleted ?? false,
      isVerified: isVerified,
      verifiedAt: user.verifiedAt,
      kycStatus: user.KycVerification?.status ?? null,
      kycSubmittedAt: user.KycVerification?.submittedAt ?? null,
      kycReviewedAt: user.KycVerification?.reviewedAt ?? null,
      kycRejectionReason: user.KycVerification?.rejectionReason ?? null,
      isAdmin: isAdmin,
    });
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding status" },
      { status: 500 }
    );
  }
}
