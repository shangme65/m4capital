import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

/**
 * Generate Cloudinary signature manually using SHA1
 * This avoids issues with the cloudinary package on serverless
 */
function generateSignature(params: Record<string, string | number>, apiSecret: string): string {
  // Sort params alphabetically and create the string to sign
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join("&");
  
  // Generate SHA1 hash
  return crypto.createHash("sha1").update(sortedParams + apiSecret).digest("hex");
}

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

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Validate Cloudinary configuration
    if (!cloudName || !apiKey || !apiSecret) {
      console.error("Cloudinary not configured. Missing env vars:", {
        hasCloudName: !!cloudName,
        hasApiKey: !!apiKey,
        hasApiSecret: !!apiSecret,
      });
      return NextResponse.json(
        { error: "Upload service not configured" },
        { status: 500 }
      );
    }

    const { folder, publicId } = await req.json();
    const timestamp = Math.round(Date.now() / 1000);
    const uploadFolder = folder || "kyc-documents";

    // Generate signature with sorted params
    const signature = generateSignature(
      {
        folder: uploadFolder,
        public_id: publicId,
        timestamp,
      },
      apiSecret
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName,
      apiKey,
      folder: uploadFolder,
    });
  } catch (error: any) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
