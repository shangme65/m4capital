import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        kycVerification: {
          select: {
            id: true,
            status: true,
            submittedAt: true,
            reviewedAt: true,
            rejectionReason: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            nationality: true,
            phoneNumber: true,
            address: true,
            city: true,
            postalCode: true,
            country: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      kycVerification: user.kycVerification,
    });
  } catch (error) {
    console.error("KYC status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
