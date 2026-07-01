import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/user/avatar
 * Updates the authenticated user's profile picture.
 * Expects { imageUrl: string } — must be a valid Cloudinary URL.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 },
      );
    }

    // Only accept Cloudinary-hosted images
    if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
      return NextResponse.json(
        { error: "Invalid image URL — must be a Cloudinary URL" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { image: imageUrl },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Avatar update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile picture" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/user/avatar
 * Returns the current user's avatar URL.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { image: true },
    });

    return NextResponse.json({ imageUrl: user?.image ?? null });
  } catch (error) {
    console.error("Avatar fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 },
    );
  }
}
