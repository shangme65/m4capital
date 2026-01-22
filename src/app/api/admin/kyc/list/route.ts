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

    // Check if user is admin or staff admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN" && user?.role !== "STAFF_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin only" },
        { status: 403 }
      );
    }

    // Get filter from query params
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    const where: any = status && status !== "ALL" ? { status } : {};

    // Get all KYC verifications with user info
    const kycVerifications = await prisma.kycVerification.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      submissions: kycVerifications.map((kyc) => ({
        id: kyc.id,
        firstName: kyc.firstName,
        lastName: kyc.lastName,
        dateOfBirth: kyc.dateOfBirth,
        nationality: kyc.nationality,
        phoneNumber: kyc.phoneNumber,
        address: kyc.address,
        city: kyc.city,
        postalCode: kyc.postalCode,
        country: kyc.country,
        idDocumentUrl: kyc.idDocumentUrl,
        proofOfAddressUrl: kyc.proofOfAddressUrl,
        selfieUrl: kyc.selfieUrl,
        status: kyc.status,
        submittedAt: kyc.submittedAt,
        reviewedAt: kyc.reviewedAt,
        rejectionReason: kyc.rejectionReason,
        adminNotes: null,
        user: {
          id: kyc.userId,
          name: kyc.User.name,
          email: kyc.User.email,
          accountType: "INVESTOR",
        },
      })),
    });
  } catch (error) {
    console.error("KYC list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC verifications" },
      { status: 500 }
    );
  }
}
