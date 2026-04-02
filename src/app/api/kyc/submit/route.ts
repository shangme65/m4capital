import { generateId } from "@/lib/generate-id";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendKycSubmissionEmail,
  sendKycAdminNotification,
} from "@/lib/kyc-emails";
import { sendWebPushToUser } from "@/lib/push-notifications";

// Maximum function duration (120 seconds for file uploads - increased for larger files)
export const maxDuration = 120;

// Allowed file types - accept all common image formats plus PDF
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
  "image/svg+xml",
  "image/avif",
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
    const idDocumentFront = formData.get("idDocumentFront") as File | null;
    const idDocumentBack = formData.get("idDocumentBack") as File | null;
    const proofOfAddress = formData.get("proofOfAddress") as File | null;
    const selfie = formData.get("selfie") as File | null;

    if (!idDocumentFront || !idDocumentBack || !proofOfAddress || !selfie) {
      return NextResponse.json(
        { error: "All documents are required (ID Front, ID Back, Proof of Address, Selfie)" },
        { status: 400 }
      );
    }

    // Validate file types
    if (!ALLOWED_TYPES.includes(idDocumentFront.type)) {
      return NextResponse.json(
        {
          error: "Invalid ID document front format. Please upload an image file or PDF.",
        },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(idDocumentBack.type)) {
      return NextResponse.json(
        {
          error: "Invalid ID document back format. Please upload an image file or PDF.",
        },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(proofOfAddress.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid proof of address format. Please upload an image file or PDF.",
        },
        { status: 400 }
      );
    }
    if (
      !ALLOWED_TYPES.includes(selfie.type) ||
      selfie.type === "application/pdf"
    ) {
      return NextResponse.json(
        { error: "Invalid selfie format. Please upload an image file (not PDF)." },
        { status: 400 }
      );
    }

    // Convert files to base64 data URLs for storage
    // This works on serverless platforms like Vercel where filesystem is read-only
    let idDocumentFrontUrl, idDocumentBackUrl, proofOfAddressUrl, selfieUrl;
    
    try {
      console.log("Converting files to base64. File sizes:", {
        idFront: idDocumentFront.size,
        idBack: idDocumentBack.size,
        proofOfAddress: proofOfAddress.size,
        selfie: selfie.size,
        total: idDocumentFront.size + idDocumentBack.size + proofOfAddress.size + selfie.size
      });

      idDocumentFrontUrl = await fileToBase64DataUrl(idDocumentFront);
      idDocumentBackUrl = await fileToBase64DataUrl(idDocumentBack);
      proofOfAddressUrl = await fileToBase64DataUrl(proofOfAddress);
      selfieUrl = await fileToBase64DataUrl(selfie);
      
      console.log("Successfully converted all files to base64");
    } catch (conversionError) {
      console.error("File conversion error:", conversionError);
      return NextResponse.json(
        {
          error: "Failed to process your files. They may be corrupted or too large. Please try compressing them.",
        },
        { status: 500 }
      );
    }

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
      idDocumentUrl: idDocumentFrontUrl, // Store front as primary
      idDocumentBackUrl: idDocumentBackUrl, // Store back separately
      proofOfAddressUrl,
      selfieUrl,
      status: "PENDING" as const,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      updatedAt: new Date(),
    };

    let kycVerification;
    try {
      console.log("Saving KYC data to database...");
      if (user.KycVerification) {
        // Update existing KYC
        kycVerification = await prisma.kycVerification.update({
          where: { userId: user.id },
          data: kycData,
        });
        console.log("Updated existing KYC record");
      } else {
        // Create new KYC
        kycVerification = await prisma.kycVerification.create({
          data: {
            id: generateId(),
            ...kycData,
            userId: user.id,
          },
        });
        console.log("Created new KYC record");
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json(
        {
          error: "Failed to save your verification data. Your files may be too large for our database. Please compress them to under 2MB each and try again.",
        },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    try {
      await sendKycSubmissionEmail(user.email!, user.name || "User");
    } catch (emailError) {
      console.error("Failed to send KYC submission email:", emailError);
      // Don't fail the submission if email fails
    }

    // Create in-app notification for user (submission receipt)
    try {
      await prisma.notification.create({
        data: {
          id: generateId(),
          userId: user.id,
          type: "INFO",
          title: "KYC Documents Submitted",
          message: "Your verification documents have been received. Our team will review them within 24-48 hours.",
        },
      });

      // Web push to user confirming submission
      await sendWebPushToUser(user.id, {
        title: "📋 KYC Submitted",
        body: "Your verification documents have been received. We'll notify you once reviewed.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag: "kyc-submitted",
        data: { url: "/settings" },
      }).catch((err: unknown) => console.error("KYC submit user push failed:", err));
    } catch (userNotifError) {
      console.error("Failed to create user KYC notification:", userNotifError);
    }

    // Notify admins via email
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

    // Create push notifications for all admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      // Create notification for each admin
      await Promise.all(
        admins.map((admin) =>
          prisma.notification.create({
            data: {
              id: generateId(),
              userId: admin.id,
              type: "INFO",
              title: "🔔 New KYC Submission",
              message: `${
                user.name || user.email
              } has submitted KYC verification documents. Review required.`,
              metadata: {
                kycId: kycVerification.id,
                userId: user.id,
                userName: user.name,
                userEmail: user.email,
              },
            },
          })
        )
      );

      console.log(`✅ Push notifications created for ${admins.length} admins`);

      // Web push to each admin
      await Promise.all(
        admins.map((admin) =>
          sendWebPushToUser(admin.id, {
            title: "🔔 New KYC Submission",
            body: `${user.name || user.email} has submitted KYC documents for review.`,
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-96.png",
            tag: `kyc-admin-${kycVerification.id}`,
            data: { url: "/admin/kyc" },
            requireInteraction: true,
          }).catch((err: unknown) => console.error(`Admin push failed for ${admin.id}:`, err))
        )
      );
    } catch (pushError) {
      console.error("Failed to create admin push notifications:", pushError);
      // Don't fail the submission if push notification fails
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
    console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));

    // Provide more specific error messages
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      if (
        error.message.includes("PayloadTooLarge") ||
        error.message.includes("body exceeded") ||
        error.message.includes("ECONNRESET") ||
        error.message.includes("timeout")
      ) {
        return NextResponse.json(
          {
            error:
              "Request timeout or connection error. Your files may be too large. Please compress them and try again.",
          },
          { status: 413 }
        );
      }

      if (error.message.includes("prisma") || error.message.includes("database")) {
        return NextResponse.json(
          {
            error: "Database error. Your files may exceed storage limits. Please use smaller files.",
          },
          { status: 500 }
        );
      }

      // Return the actual error message for debugging
      return NextResponse.json(
        { error: `Submission failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit KYC verification. Please try again or contact support." },
      { status: 500 }
    );
  }
}
