import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendKycSubmissionEmail,
  sendKycAdminNotification,
} from "@/lib/kyc-emails";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { kycVerification: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.kycVerification?.status === "APPROVED") {
      return NextResponse.json(
        { error: "KYC already approved" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // Extract form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const postalCode = formData.get("postalCode") as string;
    const country = formData.get("country") as string;

    // Extract files
    const idDocument = formData.get("idDocument") as File;
    const proofOfAddress = formData.get("proofOfAddress") as File;
    const selfie = formData.get("selfie") as File;

    if (!idDocument || !proofOfAddress || !selfie) {
      return NextResponse.json(
        { error: "All documents are required" },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "kyc-documents",
      user.id
    );
    await mkdir(uploadDir, { recursive: true });

    // Save files
    const idDocumentBuffer = Buffer.from(await idDocument.arrayBuffer());
    const idDocumentPath = path.join(
      uploadDir,
      `id-${Date.now()}-${idDocument.name}`
    );
    await writeFile(idDocumentPath, idDocumentBuffer);

    const proofOfAddressBuffer = Buffer.from(
      await proofOfAddress.arrayBuffer()
    );
    const proofOfAddressPath = path.join(
      uploadDir,
      `proof-${Date.now()}-${proofOfAddress.name}`
    );
    await writeFile(proofOfAddressPath, proofOfAddressBuffer);

    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());
    const selfiePath = path.join(
      uploadDir,
      `selfie-${Date.now()}-${selfie.name}`
    );
    await writeFile(selfiePath, selfieBuffer);

    // Generate public URLs for documents
    const idDocumentUrl = `/kyc-documents/${user.id}/${path.basename(
      idDocumentPath
    )}`;
    const proofOfAddressUrl = `/kyc-documents/${user.id}/${path.basename(
      proofOfAddressPath
    )}`;
    const selfieUrl = `/kyc-documents/${user.id}/${path.basename(selfiePath)}`;

    // Create or update KYC verification
    const kycData = {
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      phoneNumber,
      address,
      city,
      postalCode,
      country,
      idDocumentUrl,
      proofOfAddressUrl,
      selfieUrl,
      status: "PENDING" as const,
      submittedAt: new Date(),
    };

    let kycVerification;
    if (user.kycVerification) {
      // Update existing KYC
      kycVerification = await prisma.kycVerification.update({
        where: { userId: user.id },
        data: kycData,
      });
    } else {
      // Create new KYC
      kycVerification = await prisma.kycVerification.create({
        data: {
          ...kycData,
          userId: user.id,
        },
      });
    }

    // Send confirmation email to user
    await sendKycSubmissionEmail(user.email!, user.name || "User");

    // Notify admins
    await sendKycAdminNotification(
      user.name || "User",
      user.email!,
      user.id,
      kycVerification.id
    );

    return NextResponse.json({
      success: true,
      message: "KYC verification submitted successfully",
      kycVerification: {
        id: kycVerification.id,
        status: kycVerification.status,
        submittedAt: kycVerification.submittedAt,
      },
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC verification" },
      { status: 500 }
    );
  }
}
