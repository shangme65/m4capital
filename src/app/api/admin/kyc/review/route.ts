import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendKycStatusUpdateEmail } from "@/lib/kyc-emails";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { kycId, status, rejectionReason, adminNotes } = body;

    if (!kycId || !status) {
      return NextResponse.json(
        { error: "KYC ID and status are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: adminUser.id,
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const kycVerification = await prisma.kycVerification.update({
      where: { id: kycId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // Send email notification to user about KYC status change
    if (
      (status === "APPROVED" || status === "REJECTED") &&
      kycVerification.user.email
    ) {
      sendKycStatusUpdateEmail(
        kycVerification.user.email,
        kycVerification.user.name || "User",
        status,
        rejectionReason
      ).catch((error) => {
        console.error("Error sending KYC status email:", error);
        // Don't fail the request if email fails
      });
    }

    return NextResponse.json({
      success: true,
      message: `KYC verification ${status.toLowerCase()}`,
      kycVerification,
    });
  } catch (error) {
    console.error("Admin KYC review error:", error);
    return NextResponse.json(
      { error: "Failed to review KYC submission" },
      { status: 500 }
    );
  }
}
