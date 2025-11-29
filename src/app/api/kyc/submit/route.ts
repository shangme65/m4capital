import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendKycSubmissionEmail,
  sendKycAdminNotification,
} from "@/lib/kyc-emails";

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

async function fileToBase64DataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  return `data:${file.type};base64,${base64}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { KycVerification: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already verified
    if (user.KycVerification?.status === "APPROVED") {
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

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !nationality ||
      !phoneNumber ||
      !address ||
      !city ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        { error: "All personal information fields are required" },
        { status: 400 }
      );
    }

    // Extract files
    const idDocument = formData.get("idDocument") as File | null;
    const proofOfAddress = formData.get("proofOfAddress") as File | null;
    const selfie = formData.get("selfie") as File | null;

    if (!idDocument || !proofOfAddress || !selfie) {
      return NextResponse.json(
        { error: "All documents are required (ID, Proof of Address, Selfie)" },
        { status: 400 }
      );
    }

    // Validate file sizes
    if (idDocument.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ID document file is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }
    if (proofOfAddress.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Proof of address file is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }
    if (selfie.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Selfie file is too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Validate file types
    if (!ALLOWED_TYPES.includes(idDocument.type)) {
      return NextResponse.json(
        {
          error: "Invalid ID document format. Allowed: PNG, JPG, JPEG, or PDF.",
        },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(proofOfAddress.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid proof of address format. Allowed: PNG, JPG, JPEG, or PDF.",
        },
        { status: 400 }
      );
    }
    if (
      !ALLOWED_TYPES.includes(selfie.type) ||
      selfie.type === "application/pdf"
    ) {
      return NextResponse.json(
        { error: "Invalid selfie format. Allowed: PNG, JPG, or JPEG only." },
        { status: 400 }
      );
    }

    // Convert files to base64 data URLs for storage
    // This works on serverless platforms like Vercel where filesystem is read-only
    const idDocumentUrl = await fileToBase64DataUrl(idDocument);
    const proofOfAddressUrl = await fileToBase64DataUrl(proofOfAddress);
    const selfieUrl = await fileToBase64DataUrl(selfie);

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
      updatedAt: new Date(),
    };

    let kycVerification;
    if (user.KycVerification) {
      // Update existing KYC
      kycVerification = await prisma.kycVerification.update({
        where: { userId: user.id },
        data: kycData,
      });
    } else {
      // Create new KYC
      kycVerification = await prisma.kycVerification.create({
        data: {
          id: generateId(),
          ...kycData,
          userId: user.id,
        },
      });
    }

    // Send confirmation email to user
    try {
      await sendKycSubmissionEmail(user.email!, user.name || "User");
    } catch (emailError) {
      console.error("Failed to send KYC submission email:", emailError);
      // Don't fail the submission if email fails
    }

    // Notify admins
    try {
      await sendKycAdminNotification(
        user.name || "User",
        user.email!,
        user.id,
        kycVerification.id
      );
    } catch (adminEmailError) {
      console.error("Failed to send admin notification:", adminEmailError);
      // Don't fail the submission if admin email fails
    }

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

    // Provide more specific error messages
    if (error instanceof Error) {
      if (
        error.message.includes("PayloadTooLarge") ||
        error.message.includes("body exceeded")
      ) {
        return NextResponse.json(
          {
            error:
              "Files are too large. Please reduce the file sizes and try again.",
          },
          { status: 413 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to submit KYC verification. Please try again." },
      { status: 500 }
    );
  }
}
