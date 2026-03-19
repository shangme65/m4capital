import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "@/lib/kyc-emails";
import { sendWebPushToUser } from "@/lib/push-notifications";
import { generateId } from "@/lib/generate-id";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or staff admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true, name: true },
    });

    if (admin?.role !== "ADMIN" && admin?.role !== "STAFF_ADMIN") {
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

    const normalizedActionMap: Record<string, "APPROVE" | "REJECT" | "UNDER_REVIEW"> = {
      APPROVE: "APPROVE",
      APPROVED: "APPROVE",
      REJECT: "REJECT",
      REJECTED: "REJECT",
      UNDER_REVIEW: "UNDER_REVIEW",
    };

    const normalizedAction = normalizedActionMap[String(action).toUpperCase()];

    if (!normalizedAction) {
      return NextResponse.json(
        {
          error:
            "Invalid action. Must be APPROVE/APPROVED, REJECT/REJECTED, or UNDER_REVIEW",
        },
        { status: 400 }
      );
    }

    if (normalizedAction === "REJECT" && !String(rejectionReason || "").trim()) {
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

    const reviewTimestamp = new Date();
    const safeReason: string =
      normalizedAction === "REJECT" ? String(rejectionReason).trim() : "";

    // Update KYC status first (single query to avoid interactive transaction timeout)
    const updatedKyc = await prisma.kycVerification.update({
      where: { id: kycId },
      data: {
        status: statusMap[normalizedAction] as any,
        reviewedBy: admin.id,
        reviewedAt: reviewTimestamp,
        rejectionReason: safeReason,
      },
    });

    // Update user verification status when approved
    if (normalizedAction === "APPROVE") {
      await prisma.user.update({
        where: { id: kycVerification.userId },
        data: {
          isVerified: true,
          verifiedAt: reviewTimestamp,
        },
      });
    }

    // Send email notification to user (only for approve/reject)
    if (normalizedAction === "APPROVE") {
      if (kycVerification.User.email) {
        void withTimeout(
          sendKycApprovedEmail(
            kycVerification.User.email,
            kycVerification.User.name || "User"
          ),
          4000,
          "KYC approved email"
        ).catch((error) => {
          console.error("KYC approved email failed:", error);
        });
      }

      try {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: kycVerification.userId,
            type: "SUCCESS",
            title: "KYC Verification Approved",
            message:
              "Congratulations! Your identity verification has been approved. You now have full access to all platform features.",
          },
        });
      } catch (error) {
        console.error("KYC approved in-app notification failed:", error);
      }

      void withTimeout(
        sendWebPushToUser(kycVerification.userId, {
          title: "✅ KYC Approved",
          body: "Your identity verification has been approved. Full platform access is now unlocked!",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-96.png",
          tag: "kyc-approved",
          data: { url: "/settings" },
        }),
        4000,
        "KYC approved push"
      ).catch((err) => {
        console.error("KYC approve push failed:", err);
      });
    } else if (normalizedAction === "REJECT") {
      if (kycVerification.User.email) {
        void withTimeout(
          sendKycRejectedEmail(
            kycVerification.User.email,
            kycVerification.User.name || "User",
            safeReason
          ),
          4000,
          "KYC rejected email"
        ).catch((error) => {
          console.error("KYC rejected email failed:", error);
        });
      }

      try {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: kycVerification.userId,
            type: "WARNING",
            title: "KYC Verification Requires Attention",
            message: `Your verification was not approved: ${safeReason}. Please resubmit updated documents.`,
          },
        });
      } catch (error) {
        console.error("KYC rejected in-app notification failed:", error);
      }

      void withTimeout(
        sendWebPushToUser(kycVerification.userId, {
          title: "⚠️ KYC Action Required",
          body: "Your verification requires attention. Please review the feedback and resubmit your documents.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-96.png",
          tag: "kyc-rejected",
          data: { url: "/settings?tab=verification" },
        }),
        4000,
        "KYC rejected push"
      ).catch((err) => {
        console.error("KYC reject push failed:", err);
      });
    } else if (normalizedAction === "UNDER_REVIEW") {
      try {
        await prisma.notification.create({
          data: {
            id: generateId(),
            userId: kycVerification.userId,
            type: "INFO",
            title: "KYC Under Review",
            message:
              "Your identity verification documents are currently being reviewed by our compliance team. You will be notified once the review is complete.",
          },
        });
      } catch (error) {
        console.error("KYC under-review in-app notification failed:", error);
      }

      void withTimeout(
        sendWebPushToUser(kycVerification.userId, {
          title: "🔍 KYC Under Review",
          body: "Your verification documents are being reviewed. We'll notify you once it's complete.",
          icon: "/icons/icon-192.png",
          badge: "/icons/icon-96.png",
          tag: "kyc-under-review",
          data: { url: "/settings?tab=verification" },
        }),
        4000,
        "KYC under-review push"
      ).catch((err) => {
        console.error("KYC under-review push failed:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `KYC verification ${
        normalizedAction === "APPROVE"
          ? "approved"
          : normalizedAction === "REJECT"
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "production"
            ? "Failed to review KYC verification"
            : `Failed to review KYC verification: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
