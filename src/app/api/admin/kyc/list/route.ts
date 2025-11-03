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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
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
        user: {
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
      kycVerifications: kycVerifications.map((kyc) => ({
        id: kyc.id,
        userId: kyc.userId,
        userName: kyc.user.name,
        userEmail: kyc.user.email,
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
        reviewedBy: kyc.reviewedBy,
        reviewedAt: kyc.reviewedAt,
        rejectionReason: kyc.rejectionReason,
        submittedAt: kyc.submittedAt,
        updatedAt: kyc.updatedAt,
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
