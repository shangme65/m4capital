import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a signed upload URL for direct browser-to-Cloudinary uploads
 * This bypasses Vercel's 4.5MB limit since files go directly to Cloudinary
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary not configured");
      return NextResponse.json(
        { error: "Upload service not configured" },
        { status: 500 }
      );
    }

    const { folder, publicId } = await req.json();

    // Generate timestamp for signature
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Create signature for secure upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: folder || "kyc-documents",
        public_id: publicId,
        // Security: restrict upload transformations
        allowed_formats: "jpg,jpeg,png,gif,webp,pdf",
        // Max file size: 10MB (Cloudinary handles larger files fine)
        max_file_size: 10000000,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: folder || "kyc-documents",
    });
  } catch (error: any) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
