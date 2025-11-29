import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "@/lib/kyc-emails";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });

    if (admin?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { kycId, action, rejectionReason } = body;

    if (!kycId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: kycId, action" },
        { status: 400 }
      );
    }

    if (
      action !== "APPROVE" &&
      action !== "REJECT" &&
      action !== "UNDER_REVIEW"
    ) {
      return NextResponse.json(
        { error: "Invalid action. Must be APPROVE, REJECT, or UNDER_REVIEW" },
        { status: 400 }
      );
    }

    if (action === "REJECT" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting" },
        { status: 400 }
      );
    }

    // Get KYC verification
    const kycVerification = await prisma.kycVerification.findUnique({
      where: { id: kycId },
      include: { User: true },
    });

    if (!kycVerification) {
      return NextResponse.json(
        { error: "KYC verification not found" },
        { status: 404 }
      );
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      UNDER_REVIEW: "UNDER_REVIEW",
    };

    // Update KYC status
    const updatedKyc = await prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: statusMap[action] as any,
        reviewedBy: admin.id,
        reviewedAt: new Date(),
        rejectionReason: action === "REJECT" ? rejectionReason : null,
      },
    });

    // Send email notification to user (only for approve/reject)
    if (action === "APPROVE") {
      await sendKycApprovedEmail(
        kycVerification.User.email!,
        kycVerification.User.name || "User"
      );
    } else if (action === "REJECT") {
      await sendKycRejectedEmail(
        kycVerification.User.email!,
        kycVerification.User.name || "User",
        rejectionReason
      );
    }

    return NextResponse.json({
      success: true,
      message: `KYC verification ${
        action === "APPROVE"
          ? "approved"
          : action === "REJECT"
          ? "rejected"
          : "marked as under review"
      } successfully`,
      kycVerification: {
        id: updatedKyc.id,
        status: updatedKyc.status,
        reviewedBy: updatedKyc.reviewedBy,
        reviewedAt: updatedKyc.reviewedAt,
        rejectionReason: updatedKyc.rejectionReason,
      },
    });
  } catch (error) {
    console.error("KYC review error:", error);
    return NextResponse.json(
      { error: "Failed to review KYC verification" },
      { status: 500 }
    );
  }
}
